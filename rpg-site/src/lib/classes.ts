/**
 * As 16 classes de personagem — fonte única.
 *
 * Esta lista era duplicada literalmente em CharacterResult (o card logo após o
 * quiz) e em PersonagemCard (o card do link compartilhado). Como os dois
 * renderizam `desc`, qualquer edição em só um dos lados fazia o mesmo
 * personagem se descrever de dois jeitos dependendo de onde fosse aberto.
 *
 * `desc` é uma cena curta, não uma definição: cabe em ~3 linhas dentro do
 * `max-w-xs` dos dois cards, então vale manter até ~85 caracteres.
 */
export interface ClassInfo {
  name: string;
  icon: string;
  desc: string;
  photo: string;
}

export const CLASS_LIST: ClassInfo[] = [
  { name: "Mago do ChatGPT",           icon: "🔮", desc: "Nunca decorou um feitiço. Descreve o que precisa e o abismo responde formatado.", photo: "/fotos_cartas/mago_do_chat_gpt.jpeg" },
  { name: "Ninja do Visto por Último", icon: "👁️", desc: "Leu a mensagem às 3h12. Respondeu em algum momento. A lenda diverge.",           photo: "/fotos_cartas/ninja_do_visto_por_ultimo.jpeg" },
  { name: "Berserker do Crossfit",     icon: "💪", desc: "Entra na batalha gritando o número da série. Sai mancando. Volta amanhã.",        photo: "/fotos_cartas/beserk_do_crossfit.jpeg" },
  { name: "Necromante de Planilha",    icon: "📊", desc: "Abriu uma aba de 2019. Algo se moveu nas células. Ele chamou de relatório.",      photo: "/fotos_cartas/necromante_de_planilha.png" },
  { name: "Ladino do Home Office",     icon: "🏠", desc: "Câmera fechada, microfone mudo. Ninguém jamais provou que ele estava lá.",        photo: "/fotos_cartas/ladino_do_home_office.png" },
  { name: "Warlock do Boleto",         icon: "💸", desc: "Assinou em três vias. O contrato venceu. Ele renovou por vontade própria.",       photo: "/fotos_cartas/warlock_do_boleto.jpeg" },
  { name: "Ilusionista de Call",       icon: "🎭", desc: "Acena na hora certa há dois anos. Ninguém sabe em que projeto ele está.",         photo: "/fotos_cartas/ilusionista_de_call.png" },
  { name: "Artífice da Gambiarra",     icon: "🔧", desc: "Consertou com fita e fé. Está de pé até hoje. Ninguém ousa encostar.",            photo: "/fotos_cartas/artifice_da_gambiarra.png" },
  { name: "Invocador de iFood",        icon: "🍕", desc: "Traça o círculo no app. Quarenta minutos depois, a campainha atende ao chamado.", photo: "/fotos_cartas/invocador_de_ifood.png" },
  { name: "Druida de Varanda",         icon: "🌿", desc: "Fala com a samambaia. A samambaia vai bem. Os amigos dele também.",               photo: "/fotos_cartas/druida_de_varanda.png" },
  { name: "Ranger da Faxina",          icon: "🧹", desc: "Varre o chão e a cabeça no mesmo movimento. Sai dali outra pessoa.",              photo: "/fotos_cartas/ranger_da_faxina.jpeg" },
  { name: "Bardo do Karaokê",          icon: "🎤", desc: "Errou todas as notas da canção. A taverna inteira cantou junto mesmo assim.",     photo: "/fotos_cartas/bardo_do_karaoke.jpeg" },
  { name: "Xamã das Criptomoedas",     icon: "📈", desc: "Lê velas verdes como quem lê presságio. Às vezes o presságio cumpre.",            photo: "/fotos_cartas/xama_das_criptomodeas.jpeg" },
  { name: "Vidente da Ansiedade",      icon: "🔭", desc: "Previu doze catástrofes esta semana. Nenhuma veio. Segue de vigília.",            photo: "/fotos_cartas/vidente_da_ansiedade.jpeg" },
  { name: "Paladino do Grupo",         icon: "🏰", desc: "Foi o último a sair do grupo. Ficou até o mais quieto dizer que estava bem.",     photo: "/fotos_cartas/paladino_do_grupo.jpeg" },
  { name: "Domador de Pet",            icon: "🐾", desc: "Entendeu o miado antes da frase. O bicho confia. As pessoas, ainda em análise.",  photo: "/fotos_cartas/domador_de_pet.png" },
];

/** Classe pelo nome; cai na primeira da lista se o nome não existir. */
export function byName(name: string): ClassInfo {
  return CLASS_LIST.find((c) => c.name === name) ?? CLASS_LIST[0];
}
