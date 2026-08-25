"""Worker arq — geração do avatar de RPG via Google Gemini.

╔══════════════════════════════════════════════════════════════════════════╗
║  PRIVACIDADE — LEIA ANTES DE ALTERAR ESTE ARQUIVO                         ║
║                                                                          ║
║  A foto ORIGINAL da pessoa (`image_b64`) NUNCA pode ser persistida.       ║
║                                                                          ║
║   • Ela chega como argumento do job (trafega pelo Redis como payload da   ║
║     fila — isso é inerente ao arq) e é consumida aqui, em memória.        ║
║   • `WorkerSettings.keep_result = 0` garante que o arq NÃO retém os        ║
║     argumentos/resultado do job após a execução.                          ║
║   • NÃO faça `redis.set(...)`, log, nem grave em disco a `image_b64` ou    ║
║     os `image_bytes`. Persistimos apenas o avatar GERADO: em Redis         ║
║     (`avatar_result:{job_id}`, TTL 24h) e no Supabase Storage (permanente).║
╚══════════════════════════════════════════════════════════════════════════╝
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging

from arq.connections import RedisSettings

from ..config import result_key, settings

logger = logging.getLogger("avatar.worker")

# Prompt de estilização. Preserva traços reconhecíveis do rosto e aplica o
# tema de RPG fantasia medieval, com um estilo específico por classe.
_BASE_PROMPT = (
    "Transform the person in this photo into a stylized fantasy RPG character "
    "avatar. Use painterly digital art (NOT photorealistic). It is essential to "
    "preserve the person's recognizable facial features, expression, hair and "
    "skin tone so they are clearly identifiable. Depict them "
)
_COMPOSITION = (
    ". Head-and-shoulders portrait composition, dramatic cinematic torch-lit "
    "lighting, softly blurred tavern / dungeon background, warm color palette."
)

# Estilo visual por classe (nomes idênticos aos do frontend em CLASS_LIST).
CLASS_STYLES: dict[str, str] = {
    "Mago do ChatGPT": "as an arcane wizard in glowing runic robes, holding a staff crackling with holographic digital sigils",
    "Ninja do Visto por Último": "as a hooded shadow ninja-rogue half-hidden in darkness, with faint glowing message-seal runes floating nearby",
    "Berserker do Crossfit": "as a muscular barbarian berserker in a battle harness, wielding a heavy weapon in a fierce energetic pose",
    "Necromante de Planilha": "as a dark necromancer in tattered robes, surrounded by floating spectral grids and glowing green ledger runes",
    "Ladino do Home Office": "as a cunning rogue in a hooded cloak with a relaxed hidden posture and subtle arcane trinkets",
    "Warlock do Boleto": "as a brooding warlock bound by glowing eldritch debt-chains, wreathed in ominous purple contract sigils",
    "Ilusionista de Call": "as a mysterious illusionist in flowing robes, with translucent mirror-image duplicates and mask motifs around them",
    "Artífice da Gambiarra": "as an inventive artificer covered in improvised gadgets, gears and wires, wearing goggles amid workshop sparks",
    "Invocador de iFood": "as a summoner conjuring a small glowing food-spirit familiar from a magic circle",
    "Druida de Varanda": "as a serene druid crowned with leaves and vines, glowing with soft nature magic and surrounded by plants",
    "Ranger da Faxina": "as a disciplined ranger in a cloak with tidy utility gear, in a clean composed stance with a faint sweeping-wind motif",
    "Bardo do Karaokê": "as a flamboyant bard holding a lute-microphone, lit by colorful performance lights with a joyful expression",
    "Xamã das Criptomoedas": "as a mystical shaman adorned with glowing coin-talismans and candlestick-chart runes, in a trance-like aura",
    "Vidente da Ansiedade": "as an anxious oracle with a glowing third-eye motif, surrounded by swirling ominous visions and threads of fate",
    "Paladino do Grupo": "as a noble paladin in gleaming plate armor with a radiant shield, in a protective heroic stance bathed in holy light",
    "Domador de Pet": "as a gentle beast-tamer in nature-warrior gear, with a small loyal animal companion at their side",
}

_DEFAULT_STYLE = "as a fantasy RPG adventurer in light leather-and-metal armor"


def build_prompt(class_name: str) -> str:
    """Monta o prompt combinando a base + o estilo da classe + a composição."""
    style = CLASS_STYLES.get(class_name, _DEFAULT_STYLE)
    return _BASE_PROMPT + style + _COMPOSITION


def _extract_image(response) -> tuple[str, str]:
    """Extrai a imagem gerada (inline_data) das parts da resposta do Gemini.

    Retorna (imagem_base64, mime_type). Levanta ValueError se não houver imagem.
    """
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            inline = getattr(part, "inline_data", None)
            if inline is not None and getattr(inline, "data", None):
                data = inline.data
                # O SDK entrega bytes; normalizamos para base64 (str).
                if isinstance(data, bytes):
                    image_b64 = base64.b64encode(data).decode("ascii")
                else:  # já é str base64
                    image_b64 = data
                mime = getattr(inline, "mime_type", None) or "image/png"
                return image_b64, mime
    raise ValueError("Nenhuma imagem (inline_data) na resposta do Gemini")


# Erros transitórios do Gemini que valem retry (rate limit / instabilidade).
_TRANSIENT_TOKENS = (
    "429", "RESOURCE_EXHAUSTED", "500", "INTERNAL",
    "503", "UNAVAILABLE", "deadline", "timeout",
)
_GEMINI_MAX_ATTEMPTS = 4


class _RateLimiter:
    """Marca o ritmo das chamadas: no máximo `per_minute` inícios por minuto.

    Compartilhado por todos os jobs concorrentes DESTE processo de worker — sob
    rajada, os jobs esperam a vez aqui em vez de estourar o rate limit do Gemini
    (que responderia 429). É pacing, não aumenta a cota: se o volume passar do
    teto, as pessoas esperam mais (não tomam erro).
    """

    def __init__(self, per_minute: int) -> None:
        self._interval = 60.0 / max(per_minute, 1)
        self._lock = asyncio.Lock()
        self._next_at = 0.0

    async def wait(self) -> None:
        async with self._lock:
            now = asyncio.get_event_loop().time()
            if self._next_at <= now:
                self._next_at = now + self._interval
                return
            delay = self._next_at - now
            self._next_at += self._interval
        await asyncio.sleep(delay)


# Instância global do worker (um processo → um limiter).
_gemini_limiter = _RateLimiter(settings.gemini_max_rpm)


async def _run_gemini(image_bytes: bytes, prompt: str) -> tuple[str, str]:
    """Chama o Gemini para gerar o avatar, com pacing + retry.

    O modelo de imagem tem limite de taxa baixo: sob rajada, chamadas voltam
    429 RESOURCE_EXHAUSTED. O `_gemini_limiter` espaça os inícios de chamada
    (inclusive dos retries) para ficar sob a cota; o retry cobre 429s residuais
    e instabilidade (backoff 3s, 6s, 12s). Import do SDK é lazy (mock em testes).
    """
    from google import genai  # noqa: PLC0415  (import lazy proposital)
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)
    contents = [
        prompt,
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
    ]

    delay = 3.0
    for attempt in range(1, _GEMINI_MAX_ATTEMPTS + 1):
        await _gemini_limiter.wait()  # respeita o ritmo antes de cada chamada
        try:
            response = await client.aio.models.generate_content(
                model=settings.gemini_image_model, contents=contents
            )
            return _extract_image(response)
        except Exception as exc:
            is_transient = any(t in str(exc) for t in _TRANSIENT_TOKENS)
            if attempt < _GEMINI_MAX_ATTEMPTS and is_transient:
                logger.warning(
                    "Gemini transitório (tent. %s/%s): %s — retry em %.0fs",
                    attempt, _GEMINI_MAX_ATTEMPTS, type(exc).__name__, delay,
                )
                await asyncio.sleep(delay)
                delay *= 2
                continue
            raise


async def _upload_avatar(job_id: str, avatar_bytes: bytes, mime: str) -> str:
    """Sobe o avatar GERADO ao Supabase Storage e retorna a URL pública permanente.

    Só o avatar gerado é enviado — NUNCA a foto original. O cliente supabase é
    síncrono, então roda em thread para não bloquear o event loop do worker.
    Isolado para facilitar o mock em testes.
    """
    from supabase import create_client  # noqa: PLC0415 (import lazy proposital)

    ext = "jpg" if "jpeg" in mime else "png"
    filename = f"{job_id}.{ext}"

    def _sync() -> str:
        supabase = create_client(
            settings.supabase_url, settings.supabase_service_role_key
        )
        supabase.storage.from_("avatars").upload(
            path=filename,
            file=avatar_bytes,
            file_options={"content-type": mime, "upsert": "true"},
        )
        return supabase.storage.from_("avatars").get_public_url(filename)

    return await asyncio.to_thread(_sync)


async def generate_avatar_task(ctx, job_id: str, image_b64: str, class_name: str = "") -> None:
    """Job arq: gera o avatar e salva o PONTEIRO dele em `avatar_result:{job_id}`.

    Em caso de sucesso salva {"status": "done", "public_url": ..., "mime": ...}.
    Em caso de falha salva um marcador {"status": "error", ...}. Ambos com TTL.

    O que NÃO vai para o Redis é a imagem. Ela já está no Storage do Supabase,
    permanente; guardar o base64 aqui também custava ~1,4 MB por avatar (o
    base64 infla um terço) e enchia os 25 MB da instância em menos de 20
    gerações. Com `maxmemoryPolicy noeviction`, cheio significa que TODO `SET`
    passa a falhar — inclusive o do marcador de erro logo abaixo, e aí o job
    fica sem resposta nenhuma e o front gira até desistir. Um ponteiro de ~200
    bytes tira esse teto do caminho.

    PRIVACIDADE: `image_b64` / `image_bytes` só existem em memória durante esta
    função. Nunca são gravados em nenhuma chave, log ou disco. Não adicione isso.
    """
    redis = ctx["redis"]
    key = result_key(job_id)

    try:
        image_bytes = base64.b64decode(image_b64)
        image_out_b64, mime = await _run_gemini(image_bytes, build_prompt(class_name))
        # Sobe o avatar gerado ao Supabase Storage e pega a URL pública permanente.
        avatar_bytes = base64.b64decode(image_out_b64)
        public_url = await _upload_avatar(job_id, avatar_bytes, mime)
        payload = {"status": "done", "public_url": public_url, "mime": mime}
    except BaseException as erro:
        # `BaseException` e não `Exception` de propósito. Quando o arq mata o job
        # por `job_timeout`, o que sobe é `CancelledError` — que herda de
        # BaseException e passava direto por um `except Exception`. Resultado: o
        # marcador de erro nunca era gravado, o status ficava "processing" para
        # sempre e a pessoa esperava os 3 minutos do front por um job que já
        # estava morto. Nenhuma forma de morte pode sair daqui sem deixar rastro.
        #
        # NUNCA logamos a foto original nem os bytes — apenas o job_id e o traço.
        logger.exception("Falha ao gerar avatar para job %s", job_id)
        payload = {"status": "error", "error": "generation_failed"}

        # Cancelamento não é erro de aplicação: grava o marcador e devolve o
        # controle ao arq, que precisa saber que a tarefa de fato encerrou.
        if isinstance(erro, asyncio.CancelledError):
            try:
                await redis.set(key, json.dumps(payload), ex=settings.result_ttl_seconds)
            except Exception:
                logger.exception("Job %s cancelado e sem marcador no Redis", job_id)
            raise

    # Persistimos APENAS o ponteiro (URL do avatar ou marcador de erro), com TTL.
    try:
        await redis.set(key, json.dumps(payload), ex=settings.result_ttl_seconds)
    except Exception:
        # Um Redis indisponível não pode passar por falha de geração: se o
        # avatar subiu, ele está no Storage e /avatar/image ainda o encontra
        # pelo job_id. Sem isto, o arq reagenda o job e paga o Gemini de novo.
        logger.exception(
            "Avatar do job %s gerado, mas o resultado não pôde ser gravado no Redis. "
            "A imagem está no Storage; o front cai no fallback por job_id.",
            job_id,
        )


class WorkerSettings:
    """Configuração do worker arq. Rode com: `arq app.workers.avatar_worker.WorkerSettings`."""

    functions = [generate_avatar_task]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)

    # PRIVACIDADE (crítico): 0 = o arq NÃO guarda os argumentos/resultado do job
    # após a execução. Isso impede que a `image_b64` original fique retida em
    # `arq:result:*`. NÃO aumente este valor.
    keep_result = 0

    # Quantos jobs correm ao mesmo tempo neste processo. Com o pacing em 60 rpm,
    # 10 jobs de ~14s davam ~43 avatares/min — a concorrência virava o gargalo
    # antes da cota do Gemini (100 rpm). Em 20, o teto sobe para ~85/min e quem
    # manda de volta é o limitador, que é onde a decisão deve morar.
    #
    # O custo é memória: cada job segura a foto e o avatar em memória durante a
    # execução (~1 MB somados, numa foto de 480×480). Vinte cabem folgado no
    # plano starter.
    max_jobs = 20

    # Teto de vida de um job. O padrão do arq é 300s, e o nosso orçamento de
    # retry cabia por pouco: 4 chamadas ao Gemini (que já medimos em até 65s)
    # mais 21s de backoff dão ~281s. Sob rajada, os 429 empurravam além disso e
    # o job era cortado no meio da última tentativa. 420s deixa o orçamento
    # inteiro caber; quem desiste antes é a nossa própria contagem de tentativas.
    job_timeout = 420

    # Quantas vezes o arq REEXECUTA o job inteiro. O padrão é 5 — e como
    # `_run_gemini` já tenta 4 vezes por conta própria, isso chegava a 20
    # chamadas ao Gemini por um único avatar. Com 1.000 requisições por dia de
    # cota, um punhado de jobs ruins consome o dia. O retry que importa é o
    # interno, que tem backoff e distingue erro transitório de definitivo; este
    # aqui cobre só a morte do processo no meio do trabalho.
    max_tries = 2
