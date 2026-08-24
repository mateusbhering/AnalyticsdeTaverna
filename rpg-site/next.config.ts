import type { NextConfig } from "next";

import { BACKEND_URL } from "./src/lib/backend-url";

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
    return [{ source: "/taverna-api/:caminho*", destination: `${BACKEND_URL}/:caminho*` }];
  },
};

export default nextConfig;
