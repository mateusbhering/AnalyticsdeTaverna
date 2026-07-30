"""Configuração via variáveis de ambiente.

Nunca coloque segredos (ex.: GEMINI_API_KEY) hardcoded aqui — tudo vem do
ambiente. Em desenvolvimento, use um arquivo `.env` (veja `.env.example`).
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── Banco de Dados (Supabase) ───────────────────────────────────
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # ── Redis / fila ────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379"

    # ── Gemini ──────────────────────────────────────────────────────
    # A API key NUNCA deve ser hardcoded — sempre via env GEMINI_API_KEY.
    gemini_api_key: str = ""
    # Nome do modelo de geração/edição de imagem. O nome muda com frequência,
    # por isso é configurável. Em jul/2026 o recomendado é "gemini-3.1-flash-image"
    # (Nano Banana 2); "gemini-2.5-flash-image" é legado. Confira o modelo
    # disponível para a sua API key em https://ai.google.dev/gemini-api/docs/image-generation
    gemini_image_model: str = "gemini-3.1-flash-image"

    # ── Upload ──────────────────────────────────────────────────────
    max_upload_bytes: int = 8 * 1024 * 1024  # 8 MB
    allowed_content_types: tuple[str, ...] = (
        "image/jpeg",
        "image/png",
        "image/webp",
    )

    # ── Retenção ────────────────────────────────────────────────────
    # Avatar gerado vive por 24h no Redis. A foto ORIGINAL nunca é persistida.
    result_ttl_seconds: int = 24 * 60 * 60  # 86400

    # ── Supabase (armazenamento permanente do avatar gerado) ────────
    # Nunca hardcoded — via env SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
    # A service_role_key é secreta (só no backend); nunca exponha no frontend.
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # ── CORS ────────────────────────────────────────────────────────
    # Origens permitidas para o frontend Next.js chamar a API.
    cors_origins: tuple[str, ...] = (
        "http://localhost:3000",
        "https://site-ic-orcin.vercel.app",
        "https://www.analyticsdetaverna.com.br",
        "https://analyticsdetaverna.com.br",
    )


settings = Settings()

# Prefixo/chave usados para o resultado do avatar no Redis.
RESULT_KEY_PREFIX = "avatar_result:"


def result_key(job_id: str) -> str:
    return f"{RESULT_KEY_PREFIX}{job_id}"