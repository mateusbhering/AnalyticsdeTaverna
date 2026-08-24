/**
 * Endereço absoluto do backend FastAPI — o valor que o SERVIDOR usa.
 *
 * Existe separado de `API_BASE` (lib/batalha-api.ts) porque os dois lados
 * precisam de coisas diferentes: no navegador a chamada é para `/taverna-api`,
 * um caminho da própria origem que o Next reescreve; no servidor não há origem
 * nenhuma para resolver um caminho relativo, então o `fetch` do Node exige a
 * URL completa.
 *
 * Sem `NEXT_PUBLIC_`: este valor nunca vai para o bundle. É o `next.config.ts`
 * que o consome para montar o rewrite, e os módulos de servidor que buscam
 * dados direto.
 */
export const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_AVATAR_API_URL ??
  "http://localhost:8000";
