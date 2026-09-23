"""Validação estatística: a classe observada em produção é diferente do
que respostas aleatórias dariam?

Teste qui-quadrado de aderência (goodness-of-fit), comparando:

  H0: a distribuição de classes dos jogadores reais é IGUAL à do modelo nulo
      (respostas aleatórias — ver `simular_calibracao.py`).
  H1: as distribuições diferem.

Rejeitar H0 com p baixo é o resultado ESPERADO e desejável aqui: significa
que o quiz está capturando alguma coisa do comportamento real das pessoas,
não gerando classes que uma resposta aleatória geraria com a mesma frequência.
Isso não prova que o quiz mede exatamente as 10 dimensões que ele diz medir
(validade de construto é outra pergunta, fora do escopo de um qui-quadrado)
— só que a distribuição observada não é ruído.

COMO RODAR (precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
— mesmas variáveis que a API usa, veja `.env.example`):

    cd rpg-site/backend
    pip install -r requirements-analysis.txt
    python -m analysis.simular_calibracao        # se ainda não rodou
    python -m analysis.validar_classes

Ou, pra testar sem tocar no banco real, com o repositório em memória:

    python -m analysis.validar_classes --fonte memoria
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from collections import Counter
from pathlib import Path

# No Windows, redirecionar a saída (`> arquivo.txt`) faz o Python herdar a
# codificação do console (cp1252), que não tem os símbolos χ/² que este
# script imprime — e quebra com UnicodeEncodeError. Força UTF-8 sempre, com
# um fallback silencioso pra ambientes onde stdout não suporta reconfigure
# (ex.: capturado por um test runner).
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

AQUI = Path(__file__).parent
SIMULACAO = AQUI / "simulacao_resultado.json"

ALPHA_PADRAO = 0.05
MINIMO_ESPERADO_RECOMENDADO = 5  # regra prática de Cochran p/ qui-quadrado


async def _jogadores_reais() -> list[dict]:
    from app.repo import get_repo

    repo = get_repo()
    return await repo.jogadores_para_analytics()


async def _jogadores_memoria(n: int) -> list[dict]:
    """Gera jogadores sintéticos a partir do PRÓPRIO modelo nulo — só para
    smoke-test do script sem precisar de banco real. NÃO é uma fonte de
    validação: como os dados vêm da mesma distribuição nula, o p-valor
    esperado é uniforme entre 0 e 1 (às vezes vai dar < 0.05 por puro acaso —
    é a taxa de falso positivo do próprio teste, não um bug). Serve só pra
    confirmar que o script roda de ponta a ponta sem erro."""
    import random

    from analysis.simular_calibracao import carregar_perguntas, simular_uma_partida

    perguntas = carregar_perguntas()
    rng = random.Random(123)
    return [{"classe": simular_uma_partida(perguntas, rng)["classe"]} for _ in range(n)]


def carregar_distribuicao_nula() -> dict[str, float]:
    if not SIMULACAO.exists():
        sys.exit(
            f"'{SIMULACAO.name}' não existe ainda. Rode primeiro:\n"
            f"  python -m analysis.simular_calibracao"
        )
    dados = json.loads(SIMULACAO.read_text(encoding="utf-8"))
    return {classe: d["percentual"] / 100 for classe, d in dados["distribuicao_classes"].items()}


def montar_tabelas(
    observado: Counter[str], proporcao_nula: dict[str, float]
) -> tuple[list[str], list[int], list[float]]:
    """Alinha observado x esperado nas MESMAS categorias, na mesma ordem.

    Classes que nunca apareceram nem na simulação nem nos dados reais não
    entram — qui-quadrado não lida com categorias de expectativa zero.
    """
    total_obs = sum(observado.values())
    classes = sorted(
        set(observado) | set(proporcao_nula),
        key=lambda c: -observado.get(c, 0),
    )
    f_obs = [observado.get(c, 0) for c in classes]
    f_exp_bruto = [proporcao_nula.get(c, 0.0) * total_obs for c in classes]
    # `simulacao_resultado.json` guarda percentuais arredondados a 3 casas, e
    # classes ausentes de um lado ficam de fora do outro — a soma bruta quase
    # nunca bate exatamente com `total_obs`. scipy.chisquare exige que bata
    # (é o mesmo total redistribuído nas categorias), então normalizamos.
    soma_bruta = sum(f_exp_bruto)
    f_exp = [v / soma_bruta * total_obs for v in f_exp_bruto] if soma_bruta else f_exp_bruto
    return classes, f_obs, f_exp


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--fonte", choices=["supabase", "memoria"], default="supabase",
        help="supabase = dados reais de produção (padrão); memoria = smoke-test sem banco",
    )
    parser.add_argument("--n-memoria", type=int, default=2000, help="só com --fonte memoria")
    parser.add_argument("--alpha", type=float, default=ALPHA_PADRAO, help="nível de significância")
    args = parser.parse_args()

    proporcao_nula = carregar_distribuicao_nula()

    if args.fonte == "memoria":
        jogadores = asyncio.run(_jogadores_memoria(args.n_memoria))
        print(f"[fonte: memória sintética, smoke-test — {args.n_memoria} jogadores]\n")
    else:
        try:
            jogadores = asyncio.run(_jogadores_reais())
        except Exception as erro:  # noqa: BLE001 — erro de config vira mensagem clara no CLI
            sys.exit(f"Não consegui buscar jogadores reais: {erro}")
        print(f"[fonte: Supabase de produção — {len(jogadores)} jogadores]\n")

    observado = Counter(j["classe"] for j in jogadores if j.get("classe"))
    total = sum(observado.values())

    if total == 0:
        sys.exit("Nenhum jogador com classe encontrado — nada pra validar ainda.")

    classes, f_obs, f_exp = montar_tabelas(observado, proporcao_nula)

    poucos = [c for c, e in zip(classes, f_exp) if e < MINIMO_ESPERADO_RECOMENDADO]
    if poucos:
        print(
            f"⚠ Aviso: {len(poucos)} classe(s) com contagem esperada abaixo de "
            f"{MINIMO_ESPERADO_RECOMENDADO} (amostra pequena — total={total}). "
            f"A aproximação qui-quadrado fica menos confiável nessas categorias; "
            f"o resultado abaixo é indicativo, não definitivo, até o banco crescer.\n"
        )

    from scipy.stats import chisquare

    estatistica, p_valor = chisquare(f_obs=f_obs, f_exp=f_exp)
    gl = len(classes) - 1

    print(f"{'Classe':<28} {'Observado':>10} {'Esperado':>10} {'Obs %':>8} {'Esp %':>8}")
    print("-" * 68)
    for c, o, e in zip(classes, f_obs, f_exp):
        print(f"{c:<28} {o:>10} {e:>10.1f} {o/total*100:>7.2f}% {e/total*100:>7.2f}%")

    print(f"\nχ² = {estatistica:.2f}, gl = {gl}, p = {p_valor:.4g}")
    print(f"α = {args.alpha}")

    if p_valor < args.alpha:
        print(
            f"\n→ Rejeita H0 (p < α): a distribuição observada difere "
            f"significativamente do modelo nulo (respostas aleatórias).\n"
            f"  Isto é o esperado: sugere que o quiz captura sinal real do "
            f"comportamento de quem responde, não ruído."
        )
    else:
        print(
            f"\n→ NÃO rejeita H0 (p ≥ α): não há evidência, com esta amostra, "
            f"de que a distribuição observada difira do modelo nulo.\n"
            f"  Com poucos jogadores isso costuma ser falta de poder "
            f"estatístico, não prova de que o quiz não funciona — revalide "
            f"quando o banco tiver mais dados."
        )

    # Resíduos padronizados: quais classes mais puxam o χ² pra cima —
    # aparecem mais (ou menos) do que o modelo nulo previa.
    print(f"\nMaiores desvios (observado vs. esperado, resíduo padronizado):")
    residuos = sorted(
        zip(classes, f_obs, f_exp),
        key=lambda t: abs((t[1] - t[2]) / (t[2] ** 0.5)) if t[2] > 0 else 0,
        reverse=True,
    )
    for c, o, e in residuos[:5]:
        residuo = (o - e) / (e**0.5) if e > 0 else float("inf")
        sinal = "mais" if residuo > 0 else "menos"
        print(f"  {c:<28} {sinal} frequente que o esperado (resíduo={residuo:+.2f})")


if __name__ == "__main__":
    main()
