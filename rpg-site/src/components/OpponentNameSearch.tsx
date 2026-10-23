"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { limparNome, NOME_MAX } from "@/lib/nome-jogador";

type Match = { id: number | string; nome: string | null; classe: string | null };

export default function OpponentNameSearch({ onSelect, ownId }: { onSelect: (id: string) => void; ownId: string | null | undefined }) {
  const id = useId();
  const [name, setName] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = limparNome(name);
    if (!term || term.length < 2) { setError("Digite pelo menos 2 letras do nome que aparece na carta."); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError(null); setMatches(null);
    try {
      const literal = term.replace(/[\\%_]/g, "\\$&");
      let query = getSupabaseClient().from("jogadores").select("id, nome, classe").ilike("nome", `%${literal}%`).order("id", { ascending: false }).limit(10);
      if (ownId) query = query.neq("id", ownId);
      const { data, error: failure } = await query.abortSignal(controller.signal);
      if (controller.signal.aborted) return;
      if (failure) throw failure;
      setMatches((data ?? []) as Match[]);
    } catch {
      if (!controller.signal.aborted) setError("Não foi possível buscar agora. Tente novamente ou use o QR da carta.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return <section className="opponent-name-search" aria-labelledby={id + "-title"}>
    <h2 id={id + "-title"}>Ou encontre pelo nome</h2>
    <p id={id + "-hint"}>Use o nome ou apelido que a pessoa colocou na carta do personagem.</p>
    <form onSubmit={search}>
      <label htmlFor={id}>Nome do adversário</label>
      <div className="opponent-name-search-controls">
        <input id={id} value={name} onChange={event => { setName(event.target.value); setMatches(null); setError(null); }} maxLength={NOME_MAX} autoComplete="off" placeholder="Digite o nome ou apelido" aria-describedby={id + "-hint"} disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? "Buscando…" : "Buscar"}</button>
      </div>
    </form>
    {error && <p role="alert" className="opponent-name-search-error">{error}</p>}
    <div role="status" aria-live="polite" aria-atomic="true">{loading ? "Procurando aventureiros…" : matches && (matches.length ? `${matches.length} personagem(ns) encontrado(s). Confira a classe antes de escolher.` : "Nenhum outro aventureiro com esse nome. Confira a escrita ou use o QR da carta.")}</div>
    {matches && matches.length > 0 && <ul className="opponent-name-search-results">{matches.map(match => <li key={match.id}><button type="button" onClick={() => onSelect(String(match.id))} aria-label={`Escolher ${match.nome || "aventureiro"}, ${match.classe || "classe não informada"}, número ${match.id}`}><span>{match.nome || "Aventureiro"}</span><small>{match.classe || "Classe não informada"} · #{match.id}</small><em>Escolher adversário →</em></button></li>)}</ul>}
  </section>;
}
