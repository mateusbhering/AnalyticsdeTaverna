import { IconText } from "@/components/ui/illustrated-icons";
import Image from "next/image";
import Link from "next/link";
import type { ResultadoRanking, ItemRanking } from "@/lib/ranking";

const portraits: Record<string, string> = {
  "Mago do ChatGPT": "mago-chatgpt", "Artífice da Gambiarra": "artifice", "Ladino do Home Office": "ladino",
  "Necromante de Planilha": "necromante", "Vidente da Ansiedade": "vidente", "Invocador de iFood": "invocador",
  "Paladino do Grupo": "paladino", "Druida de Varanda": "druida",
};
const name = (item: ItemRanking) => item.nome?.trim() || `#${item.id}`;
function Torch() {
  return <svg viewBox="0 0 50 130" aria-hidden="true"><path d="M25 4C5 23 38 23 16 43c-17-4-16-21-10-30-1 17 8 12 19-9Z" fill="#ef9b3d" stroke="#3c2a18" strokeWidth="3" strokeLinejoin="round" /><path d="M23 22c-10 10-11 15-5 20 13 3 16-8 5-20Z" fill="#ffdf79" /><path d="m8 44 28-1-5 16-18 1Z" fill="#84775b" stroke="#3c2a18" strokeWidth="3" /><path d="m18 60 10-1-1 56-7 7Z" fill="#9b673a" stroke="#3c2a18" strokeWidth="3" /><path d="m16 68 15-1m-14 8 13-1" stroke="#3c2a18" strokeWidth="3" /></svg>;
}
function Portrait({ classe, vacant = false }: { classe?: string | null; vacant?: boolean }) {
  const source = classe && portraits[classe];
  return <Image src={source ? `/classes/${source}.png` : "/logo.png"} alt={vacant ? "" : classe ?? "Analytics de Taverna"} width={180} height={180} unoptimized className={vacant ? "is-vacant" : undefined} />;
}

export default function RankingBoard({ ranking, loading = false }: { ranking: ResultadoRanking; loading?: boolean }) {
  const items = ranking.estado === "ok" ? ranking.itens : [];
  return (
    <main className="ranking-realm">
      <div className="ranking-board">
        <header className="ranking-title-banner"><span>Analytics de Taverna</span><h1>Ranking Global</h1><p>Quadro de feitos da taverna</p></header>
        <section className="ranking-podium" aria-label="Pódio dos aventureiros">
          <div className="ranking-torch ranking-torch-left" aria-hidden="true"><Torch /></div>
          <div className="ranking-torch ranking-torch-right" aria-hidden="true"><Torch /></div>
          {[2, 1, 3].map((place) => {
            const item = items.find((entry) => entry.posicao === place);
            return <div key={place} className={`ranking-winner place-${place}`}>
              {place === 1 && <svg className="ranking-crown" viewBox="0 0 80 50" aria-hidden="true"><path d="m9 12 17 11L40 4l14 19 17-11-7 29H16Z" fill="#e6bc6a" stroke="#3c2a18" strokeWidth="4" strokeLinejoin="round" /><path d="M17 34h46" stroke="#8a6428" strokeWidth="4" /></svg>}
              <div className="ranking-winner-portrait"><Portrait classe={item?.classe} vacant={!item} /></div>
              <div className="ranking-plinth">
                <svg className="viking-podium-wood" viewBox="0 0 200 160" preserveAspectRatio="none" aria-hidden="true">
                  <path className="podium-timber" d="m9 20 182-2-3 136-178-2Z" />
                  <path className="podium-grain" d="m49 25 1 122m48-122-2 124m51-125 2 123M18 51l23-2m19 31 30 2m16-41 31 2m16 68 23-3M19 128l24-3m15-17 26 3m21 23 31-2" />
                  <path className="podium-iron" d="m5 14 190-1-1 17-189 2Zm4 123 181 1-1 17-181-1Z" />
                  {[18, 60, 140, 181].map((x) => <g key={x}><circle cx={x} cy="23" r="3" /><circle cx={x} cy="146" r="3" /></g>)}
                </svg>
                <div className="ranking-plinth-label"><span className="ranking-place"><svg className="podium-shield" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" /><path d="M32 5v54M5 32h54" /><circle className="shield-inner" cx="32" cy="32" r="22" /></svg><span>{place}</span></span><strong>{item ? name(item) : "Lugar reservado"}</strong><small>{item ? `${item.xp.toLocaleString("pt-BR")} XP` : "Aguardando aventureiro"}</small></div>
              </div>
            </div>;
          })}
        </section>
        <section className="ranking-parchment" aria-labelledby="ranking-list-title">
          <div className="parchment-curl parchment-curl-top" aria-hidden="true" />
          <div className="ranking-parchment-body">
            <div className="ranking-list-heading"><h2 id="ranking-list-title">O pergaminho dos feitos</h2><span>XP</span></div>
            {loading ? <div className="ranking-notice" role="status">O escriba está consultando o ranking…</div> : ranking.estado === "ok" ? (
              <ol className="ranking-adventurers">{items.map((item) => <li key={item.id}>
                <Link href={`/personagem?id=${item.id}`} className="ranking-adventurer">
                  <span className={`ranking-rank rank-${item.posicao}`}>{item.posicao}</span>
                  <span className="ranking-avatar"><Portrait classe={item.classe} /></span>
                  <span className="ranking-person"><strong>{name(item)}</strong><span>{item.classe ?? "Classe não informada"}</span></span>
                  <span className="ranking-feats"><strong>{item.xp.toLocaleString("pt-BR")}</strong><small>{item.total_batalhas > 0 ? `${item.vitorias}V · ${item.derrotas}D · ${item.empates}E` : "sem duelos"}</small></span>
                </Link>
              </li>)}</ol>
            ) : <div className="ranking-notice">
              <span className="ranking-notice-seal" aria-hidden="true">{<IconText text={"✦"} />}</span>
              <h3>{ranking.estado === "erro" ? "A tinta borrou no pergaminho" : "O pergaminho ainda está em branco"}</h3>
              <p>{ranking.estado === "erro" ? "O escriba não conseguiu consultar os feitos agora. Os nomes continuam gravados; tente novamente em instantes." : "Nenhum feito foi registrado ainda. Inicie uma jornada para deixar seu nome na história."}</p>
              <Link className="btn-seal" href={ranking.estado === "erro" ? "/ranking" : "/jogar"}>{ranking.estado === "erro" ? "Tentar ler de novo" : "Iniciar jornada"}</Link>
            </div>}
          </div>
          <div className="parchment-curl parchment-curl-bottom" aria-hidden="true" />
        </section>
        <Link href="/" className="ranking-return">← Voltar à taverna</Link>
      </div>
    </main>
  );
}
