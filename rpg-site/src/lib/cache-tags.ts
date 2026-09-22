/**
 * Tags do cache de dados do Next, num módulo à parte de propósito.
 *
 * Quem invalida (a Server Action) e quem cacheia (lib/stats.ts) precisam da
 * mesma string — uma divergência de digitação não daria erro em lugar nenhum,
 * só faria a invalidação parar de surtir efeito silenciosamente.
 *
 * Fica solto aqui, e não dentro de lib/stats.ts, para a action não precisar
 * importar um módulo marcado "SÓ SERVIDOR" só para ler uma constante.
 */
export const PLAYER_STATS_TAG = "player-stats";

/**
 * Cache do ranking. Cai quando um duelo termina — quem acabou de ganhar 30 XP
 * clica em "Ver o ranking" segundos depois e não pode encontrar o número
 * antigo lá.
 */
export const RANKING_TAG = "ranking";

/**
 * Cache das métricas extras do `/analytics/*` (empates, atributos mais
 * escolhidos em duelo, taxa de vitória por classe, insight das dimensões).
 *
 * Cai nos dois eventos que alimentam esses números: cadastro de jogador novo
 * (dimensões entram na média do insight) e fim de duelo (vitórias/derrotas/
 * empates e os atributos escolhidos mudam). Por isso é invalidada tanto em
 * `stats-actions.ts` quanto em `ranking-actions.ts`.
 */
export const ANALYTICS_EXTRA_TAG = "analytics-extra";
