import type { NextConfig } from "next";

/**
 * Endereço do backend FastAPI para onde o proxy aponta.
 *
 * Fica só no servidor (sem NEXT_PUBLIC_): o navegador nunca vê esta URL — ele
 * fala com o próprio domínio e o Next repassa. Em produção a Vercel já tem
 * NEXT_PUBLIC_AVATAR_API_URL apontando pra Render; localmente cai no :8000.
 */
const BACKEND =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_AVATAR_API_URL ??
  "http://localhost:8000";

const nextConfig: NextConfig = {
  /**
   * Proxy da API de batalha sob o nosso próprio domínio.
   *
   * Chamar `avatar-api-*.onrender.com` direto do navegador funciona, mas
   * depende de a rede de quem joga deixar: bloqueador de anúncios, filtro de
   * DNS no roteador ou Wi-Fi corporativo derrubam domínios de hospedagem
   * gratuita, e o `fetch` cai com "Failed to fetch" sem dizer o porquê — a
   * pessoa vê "o servidor está fora do ar" enquanto ele está de pé.
   *
   * Passando por aqui, o pedido é para a MESMA origem da página: não há
   * terceiro pra bloquear, não há preflight de CORS e não há como cair em
   * conteúdo misto. O custo é um salto a mais pela Vercel.
   */
  async rewrites() {
    return [{ source: "/taverna-api/:caminho*", destination: `${BACKEND}/:caminho*` }];
  },
};

export default nextConfig;
