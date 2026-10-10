/** Limite do apelido no ranking — o mesmo do `maxLength` do campo do quiz. */
export const NOME_MAX = 30;

/**
 * Normaliza o apelido digitado: tira caracteres de controle e de direção
 * (que bagunçam o texto do ranking), colapsa espaços e corta no limite.
 * Vazio vira `null` — o ranking mostra `#id` para quem não quis se identificar.
 */
export function limparNome(bruto: string): string | null {
  const limpo = bruto
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NOME_MAX)
    .trim();
  return limpo || null;
}
