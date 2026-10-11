-- Rode DEPOIS que o front com cadastro via backend estiver no ar (Vercel) e o
-- backend novo estiver "Live" na Render — nunca antes: o front antigo insere
-- direto em `jogadores` e deixaria de conseguir salvar o personagem.
--
-- Efeito: o navegador (chave anon) não escreve mais em `jogadores`. O cadastro
-- só entra pelo POST /jogadores, que recalcula classe/atributos, limpa o nome
-- e zera o placar. Leitura pública continua (ranking, card, dashboard).
-- Idempotente.

drop policy if exists "jogadores_insert_anon" on public.jogadores;

-- Para desfazer (volta ao fluxo antigo):
-- create policy "jogadores_insert_anon" on public.jogadores
--   for insert to anon, authenticated with check (true);
