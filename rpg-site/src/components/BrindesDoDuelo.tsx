import { Sparkles, Target, Trophy } from "lucide-react";
import type { ExtrasBatalha } from "@/lib/ludico";

/** O que o duelo rendeu: nível novo, missão cumprida, conquistas. Vazio = não renderiza. */
export default function BrindesDoDuelo({ extras }: { extras?: ExtrasBatalha | null }) {
  if (!extras) return null;
  const subiu = extras.nivel?.subiu ? extras.nivel : null;
  if (!subiu && !extras.missao && extras.conquistas_novas.length === 0) return null;

  return (
    <ul className="space-y-2 mt-4" role="status" aria-live="polite" aria-label="Recompensas do duelo">
      {subiu && (
        <li className="flex items-center gap-2 border border-[rgba(184,138,30,0.6)] bg-[rgba(230,188,106,0.18)] p-3 text-[var(--ink)]">
          <Sparkles size={16} className="text-[var(--seal)] shrink-0" aria-hidden="true" />
          <span>
            <strong>Subiu de nível!</strong> Nível {subiu.antes} → {subiu.depois} · {subiu.titulo_nivel}
          </span>
        </li>
      )}
      {extras.missao && (
        <li className="flex items-center gap-2 border border-[rgba(96,66,26,0.45)] bg-[rgba(60,42,24,0.06)] p-3 text-[var(--ink)]">
          <Target size={16} className="text-[var(--seal)] shrink-0" aria-hidden="true" />
          <span>
            <strong>Missão cumprida:</strong> {extras.missao.nome} · +{extras.missao.recompensa_xp} XP de bônus
          </span>
        </li>
      )}
      {extras.conquistas_novas.map((c) => (
        <li key={c.codigo} className="flex items-center gap-2 border border-[rgba(140,35,24,0.45)] bg-[rgba(140,35,24,0.06)] p-3 text-[var(--ink)]">
          <Trophy size={16} className="text-[var(--seal)] shrink-0" aria-hidden="true" />
          <span>
            <strong>Conquista:</strong> {c.nome}
            {c.titulo ? ` — título “${c.titulo}”` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
