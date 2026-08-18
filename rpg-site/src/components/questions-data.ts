export type DimKey =
  | "lideranca" | "estrategia" | "disciplina" | "persistencia"
  | "sociabilidade" | "empatia" | "adaptabilidade" | "criatividade"
  | "impulsividade" | "percepcao";

export interface Option {
  text: string;
  dimMain: DimKey | null;
  dimSec: DimKey | null;
  pesoSec: 1 | -1;
  tag: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export const ALL_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Seu amigo manda \'precisamos conversar\' e some por 4 horas.",
    options: [
      { text: "Você manda mensagem de \'oi? oi? oi?\' em loop até ele responder.", dimMain: "impulsividade", dimSec: null, pesoSec: 1, tag: "ANSIOSO" },
      { text: "Você analisa o histórico da conversa buscando pistas do que pode ter acontecido.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você responde \'claro!\' e deixa no visto enquanto vai fazer outra coisa.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: -1, tag: "FURTIVO" },
      { text: "Você manda \'to aqui quando quiser\' e genuinamente não fica ansioso.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 2,
    text: "Caiu o salário. Primeira reação nos próximos 3 minutos.",
    options: [
      { text: "Abre o app do banco pra conferir cada centavo imediatamente.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Já manda pro iFood antes que a ansiedade financeira bata.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Abre uma planilha de gastos que você montou exatamente pra esse momento.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Manda print pro grupo dos amigos com um emoji de coroa.", dimMain: "sociabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "EXTROVERTIDO" },
    ],
  },
  {
    id: 3,
    text: "Você entra numa call e sua câmera abre sem querer. Você estava de pijama.",
    options: [
      { text: "Fecha o vídeo em 0.3 segundos e finge que caiu a internet.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Deixa rolando. Pijama é roupa. Que o julgamento venha.", dimMain: "impulsividade", dimSec: "sociabilidade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Desliga e reabre já arrumado. Leva 8 minutos. Ninguém pergunta.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Vira a câmera pro teto e continua na call normalmente.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
    ],
  },
  {
    id: 4,
    text: "A impressora trava 3 minutos antes da sua apresentação importante.",
    options: [
      { text: "Parte pra apresentar sem o material. Improvisa com as mãos.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Entra em modo engenheiro: desliga, liga, bate levemente, reza.", dimMain: "persistencia", dimSec: "impulsividade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Manda tudo pro celular e projeta da tela. Já tinha plano B.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Entra em colapso interno mas mantém face de pedra enquanto resolve.", dimMain: "disciplina", dimSec: "empatia", pesoSec: -1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 5,
    text: "Mensagem no grupo do trabalho às 23h: \'reunião amanhã cedo, importante\'.",
    options: [
      { text: "Responde com \'ok!\' imediatamente mesmo sem entender o contexto.", dimMain: "sociabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Entra em modo investigação. Pergunta pra quem parece saber mais.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Silencia o grupo e vai dormir. Amanhã você descobre.", dimMain: "adaptabilidade", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Prepara slides preventivos para todos os tópicos possíveis.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 6,
    text: "Você esqueceu completamente de responder uma mensagem importante há 3 dias.",
    options: [
      { text: "Responde agora com \'oi sumido kk\' como se nada tivesse acontecido.", dimMain: "adaptabilidade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Manda desculpa elaborada com contexto, motivo e pedido de perdão formal.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Entra em espiral de culpa e evita a pessoa por mais 2 dias.", dimMain: "impulsividade", dimSec: "percepcao", pesoSec: -1, tag: "ANSIOSO" },
      { text: "Chama no zap de voz. Mensagem de texto não captura a seriedade disso.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "CURADOR" },
    ],
  },
  {
    id: 7,
    text: "Seu celular trava exatamente quando você ia mostrar algo pra alguém.",
    options: [
      { text: "Começa a resetar o celular em tempo real explicando o que ia mostrar.", dimMain: "adaptabilidade", dimSec: "sociabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Pede o celular da pessoa e mostra pelo seu próprio perfil dela.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "\'Deixa eu te descrever então\' e usa as mãos pra gesticular tudo.", dimMain: "sociabilidade", dimSec: "criatividade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "\'Depois eu te mando o link.\' E manda. Com comentário. Com contexto.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 8,
    text: "Você está em fila há 40 minutos e percebe que alguém furou na sua frente.",
    options: [
      { text: "Fala educadamente que a fila começa atrás de você.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Analisa se vale o desgaste e decide com base no humor do dia.", dimMain: "estrategia", dimSec: "adaptabilidade", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Fumaça interna, silêncio externo. Você vai processar isso por semanas.", dimMain: "percepcao", dimSec: "empatia", pesoSec: -1, tag: "ANSIOSO" },
      { text: "Conta pra pessoa do lado em voz baixa pra validar sua indignação.", dimMain: "sociabilidade", dimSec: "percepcao", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 9,
    text: "Seu grupo da faculdade marcou reunião de trabalho pra amanhã de manhã.",
    options: [
      { text: "Você monta a pauta, divide as tarefas e manda pro grupo antes de dormir.", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você aparece na hora. Contribui bastante. Não preparou nada.", dimMain: "adaptabilidade", dimSec: "sociabilidade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você prepara sua parte com slides, fontes e backup de backup.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você manda mensagem às 23h perguntando se ainda é presencial.", dimMain: "impulsividade", dimSec: "sociabilidade", pesoSec: 1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 10,
    text: "Alguém te indica uma série \'incrível\' e você já assistiu. Era mediana.",
    options: [
      { text: "\'Cara, que série boa mesmo, né?\' — você protege o entusiasmo dele.", dimMain: "empatia", dimSec: "sociabilidade", pesoSec: 1, tag: "CURADOR" },
      { text: "\'Achei ok, mas o 3° episódio não fecha bem o arco do personagem.\'", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "NERD" },
      { text: "\'Não é pra mim, mas eu entendo quem gosta.\' Honesto e gentil.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "\'Verdade! Você assistiu a temporada 2?\' e desvia pro que amou mesmo.", dimMain: "adaptabilidade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 11,
    text: "Seu chefe te manda uma tarefa vaga com prazo \'o quanto antes\'.",
    options: [
      { text: "Você manda de volta uma lista de perguntas de esclarecimento numeradas.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você faz o que entendeu e entrega. Se errar, corrige.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você pergunta pra colega o que ela acha que o chefe quis dizer.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você começa três versões diferentes e decide depois qual enviar.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 12,
    text: "São 17h50. Seu expediente acaba às 18h. Chega uma tarefa urgente.",
    options: [
      { text: "Você para tudo, resolve com prioridade máxima. É urgente, ponto.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Você faz o mínimo pra não parecer que ignorou e deixa pro dia seguinte.", dimMain: "adaptabilidade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
      { text: "\'Posso resolver isso amanhã cedo com mais qualidade?\' E você faz isso.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você resolve, mas manda um \'anotado pra próxima vez evitarmos isso\'.", dimMain: "lideranca", dimSec: "persistencia", pesoSec: 1, tag: "JUSTICEIRO" },
    ],
  },
  {
    id: 13,
    text: "Você precisa fazer uma tarefa chata mas necessária. Como começa?",
    options: [
      { text: "Coloca uma playlist específica e começa em exatos 5 minutos.", dimMain: "disciplina", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Procrastina por 2h e faz em 20min com adrenalina de prazo.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "PROCRASTINADOR" },
      { text: "Divide em partes pequenas e risca uma por uma como missão épica.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Terceiriza pra alguém que vai gostar mais de fazer isso.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 14,
    text: "Você descobre que um colega recebe mais que você pelo mesmo trabalho.",
    options: [
      { text: "Pesquisa referências de mercado e agenda conversa com o gestor.", dimMain: "estrategia", dimSec: "persistencia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Desabafa com outro colega de confiança antes de qualquer ação.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Fica ruminando por dias antes de decidir qualquer coisa.", dimMain: "percepcao", dimSec: "adaptabilidade", pesoSec: -1, tag: "ANSIOSO" },
      { text: "Entrega mais do que antes até ficar impossível não te dar aumento.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
    ],
  },
  {
    id: 15,
    text: "Você precisa apresentar um projeto que está 70% pronto. O prazo chegou.",
    options: [
      { text: "Apresenta o que tem com contexto claro do que falta e por quê.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Passa a noite toda terminando. Entrega 100% e parece que foi fácil.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Reformula a narrativa pra o 70% parecer a versão final planejada.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Pede extensão de prazo com justificativa técnica detalhada.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 16,
    text: "Reunião de 1 hora que poderia ser um e-mail. Você está lá.",
    options: [
      { text: "Responde os e-mails com câmera desligada e acena quando ouve seu nome.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Participa genuinamente e tenta encurtar a reunião com objetividade.", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "LÍDER" },
      { text: "Anota insights reais em silêncio. Ninguém sabe que você está registrando tudo.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Posta no grupo secreto dos colegas comentários em tempo real.", dimMain: "sociabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 17,
    text: "Você se inscreveu num curso e travou no módulo 2 de 12 há 3 semanas.",
    options: [
      { text: "Volta do começo. Precisa refazer a base pra seguir bem.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Pula direto pro módulo 7 que parecia mais interessante.", dimMain: "impulsividade", dimSec: "criatividade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Assiste em velocidade 1.5x sem pausa pra recuperar o atraso.", dimMain: "persistencia", dimSec: "estrategia", pesoSec: 1, tag: "ATLETA" },
      { text: "Decide que o curso todo pode ser resumido pelo ChatGPT e faz isso.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "TECNOLÓGICO" },
    ],
  },
  {
    id: 18,
    text: "Você está no flow trabalhando quando recebe uma notificação irrelevante.",
    options: [
      { text: "Fecha a notificação e volta ao que estava em 4 segundos.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "ZEN" },
      { text: "Já está no feed. Não sabe como foi parar lá. São 30min depois.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: -1, tag: "PROCRASTINADOR" },
      { text: "Ativa o modo foco retroativamente e anota \'não repetir esse erro\'.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Responde a notificação e usa isso como descanso mental ativo.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 19,
    text: "Você errou em algo no trabalho e ninguém percebeu ainda.",
    options: [
      { text: "Você corrige silenciosamente antes que alguém note.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você avisa ao time por proatividade mesmo sem necessidade.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você monitora se vai ter impacto antes de decidir se fala.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você segue em frente. Se ninguém viu, o bug não existe.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 20,
    text: "Seu computador trava com 47 abas abertas. Isso é uma crise?",
    options: [
      { text: "Crise grave. Fecha tudo com dor e recomeça do zero organizado.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Não é crise. Aquelas abas são o seu sistema. Tem método no caos.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Identifica as 3 abas mais urgentes e fecha o resto sem pena.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Tira foto das abas pra referência e reinicia.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "NERD" },
    ],
  },
  {
    id: 21,
    text: "As pessoas do grupo decidiram pedir pizza. Você é intolerante a lactose.",
    options: [
      { text: "Pede a sua sem queijo sem fazer escândalo. Gerencia em silêncio.", dimMain: "adaptabilidade", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Avisa o grupo e sugere um lugar que tem opção pra todo mundo.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Come a pizza com queijo e paga o preço depois. YOLO.", dimMain: "impulsividade", dimSec: "sociabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Já tinha visto isso vindo. Trouxe snack próprio como plano B.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 22,
    text: "Você foi convidado pra festa que não quer ir. O anfitrião é amigo próximo.",
    options: [
      { text: "Vai por 1 hora. Mostra presença. Vai embora com desculpa digna.", dimMain: "estrategia", dimSec: "empatia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Inventa que tem compromisso. A mentira é misericordiosa aqui.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Vai e arruma um jeito de curtir. Social mode: ativado.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Diz a verdade com carinho: \'não tô pra festa, mas amo você\'.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
    ],
  },
  {
    id: 23,
    text: "Você está num almoço e a conta vem errada, a seu favor.",
    options: [
      { text: "Avisa o garçom. Honestidade acima de tudo, mesmo que doa.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Paga o que veio e vai embora. O universo vai compensar em outra hora.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "ZEN" },
      { text: "Calcula rapidamente se vai fazer diferença pro restaurante antes de decidir.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Avisa e usa o momento como desculpa pra pedir sobremesa de compensação.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 24,
    text: "Você está num grupo silencioso. Ninguém está falando. Você...",
    options: [
      { text: "Quebra o gelo com alguma pergunta pra todo mundo.", dimMain: "sociabilidade", dimSec: "lideranca", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Também fica em silêncio e observa quem vai ceder primeiro.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Manda meme no grupo pra despressurizar a atmosfera.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Pergunta individualmente pra uma pessoa que parece disposta.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 25,
    text: "Alguém te pede feedback sobre algo que ficou ruim. Você...",
    options: [
      { text: "Diz a verdade com cuidado. Elogio falso não ajuda ninguém.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Pergunta o que a pessoa mesma acha antes de falar qualquer coisa.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Destaca o que funciona e encaixa os pontos críticos com tato.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Fala o que quer ouvir. Sua relação com a pessoa vale mais que isso.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 26,
    text: "Um amigo cancela compromisso em cima da hora pela terceira vez.",
    options: [
      { text: "Você já tinha desconfiado. Tinha plano B pronto.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você fala com carinho que isso está te afetando.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Você marca de novo sem drama. Não vale o desgaste.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você cancela o próximo compromisso com ele. Igualdade.", dimMain: "impulsividade", dimSec: "lideranca", pesoSec: 1, tag: "JUSTICEIRO" },
    ],
  },
  {
    id: 27,
    text: "Você precisa dizer não pra um pedido que vai te sobrecarregar.",
    options: [
      { text: "Diz não diretamente mas oferece uma alternativa.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Diz que vai tentar e vai empurrando até se tornar impossível.", dimMain: "adaptabilidade", dimSec: "persistencia", pesoSec: -1, tag: "PROCRASTINADOR" },
      { text: "Diz não com uma explicação elaborada justificando cada ponto.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Diz sim e resolve o seu problema depois. Sempre aparece um jeito.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 28,
    text: "Você encontra um conhecido na rua e não lembra o nome dele.",
    options: [
      { text: "Apresenta alguém junto pra ele se apresentar e você captura o nome.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Chama de \'cara\' e \'ei\' até aparecer o contexto certo.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Assume que não lembrou e ri junto. Transparência desarmante.", dimMain: "empatia", dimSec: "sociabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Desvia o assunto habilmente até chegar no ponto onde ele diz o nome.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 29,
    text: "Você está na fila do caixa e a velhinha na frente está devagar.",
    options: [
      { text: "Você respira, paciência. É aqui que o ZEN se prova.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você pergunta se pode ajudar com algo. Genuinamente.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Você calcula se vale mudar de fila nesse exato momento.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você fica vermelho por dentro mas sorri pra câmera do teto.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: -1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 30,
    text: "Seu grupo de zap acumulou 300 mensagens não lidas.",
    options: [
      { text: "Você abre, rola tudo em alta velocidade pra pegar contexto.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você deixa no visto. Se for urgente, ligam.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você abre e responde só o que foi @você diretamente.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você entra, manda um oi, e deixa o grupo resolver a narrativa.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 31,
    text: "Seu treino começa às 18h e começa uma tempestade absurda.",
    options: [
      { text: "Você vai de qualquer forma. Barro faz parte do treino.", dimMain: "persistencia", dimSec: "impulsividade", pesoSec: 1, tag: "ATLETA" },
      { text: "Você faz o treino em casa adaptado com o que tem.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você reprograma pra amanhã e usa o tempo pra descanso ativo.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Você usa como desculpa e vai dormir cedo sem culpa.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 32,
    text: "Você acordou 40 minutos mais cedo do que precisava. O que faz?",
    options: [
      { text: "Volta a dormir. Sono é sagrado e você não vai desperdiçar.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Aproveita pra fazer aquela coisa que fica postergando.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Fica no celular até a hora certa de levantar. Vitória moral.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "PROCRASTINADOR" },
      { text: "Planeja o dia inteiro com o tempo extra como se fosse uma missão.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 33,
    text: "Sua dieta começa \'na segunda-feira\' há três segundas-feiras seguidas.",
    options: [
      { text: "Você analisa por que falha e muda a abordagem, não a data.", dimMain: "estrategia", dimSec: "persistencia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você aceita que segunda é simbólica e começa na quinta mesmo.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você descobre que restrição total não funciona pra você e pivota.", dimMain: "percepcao", dimSec: "adaptabilidade", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você declara a quarta-feira o novo começo. É segunda do meio.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
    ],
  },
  {
    id: 34,
    text: "Você tem 30 minutos livres inesperados no meio do dia.",
    options: [
      { text: "Você usa pra adiantar algo que estava acumulando.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você usa pra não fazer absolutamente nada. E é ótimo.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você não sabe o que fazer e gasta os 30min decidindo.", dimMain: "percepcao", dimSec: "impulsividade", pesoSec: 1, tag: "ANSIOSO" },
      { text: "Você abre um podcast ou série no meio do episódio mesmo.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
    ],
  },
  {
    id: 35,
    text: "Você vai na farmácia comprar um item e sai com cinco.",
    options: [
      { text: "Claro. Você tinha tudo anotado. Era pra isso que a lista servia.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Cada item fez sentido na hora. A lista cresce com sabedoria.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você reavaliou necessidades em tempo real. É eficiência dinâmica.", dimMain: "criatividade", dimSec: "percepcao", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você não foi sozinho. A outra pessoa também tem listas.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 36,
    text: "Alguém te pergunta como você está e você está mal, mas não quer falar.",
    options: [
      { text: "\'Tô bem, obrigado\' — processamento interno, sem transbordamento.", dimMain: "disciplina", dimSec: "empatia", pesoSec: -1, tag: "INTROVERTIDO" },
      { text: "\'Mais ou menos, passa.\' — honesto, mas limita o assunto.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você conta. Às vezes a pergunta certa abre a válvula.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você pergunta como a outra pessoa está primeiro. Desvio elegante.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "FURTIVO" },
    ],
  },
  {
    id: 37,
    text: "Você está sem dinheiro e tem 10 dias pro salário.",
    options: [
      { text: "Você faz uma planilha de sobrevivência com os recursos disponíveis.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você corta tudo não-essencial com rigor disciplinado.", dimMain: "disciplina", dimSec: "persistencia", pesoSec: 1, tag: "ZEN" },
      { text: "Você encontra fontes alternativas de renda criativas pra cobrir.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você entra em modo ansiedade e confere o saldo a cada 3 horas.", dimMain: "percepcao", dimSec: "impulsividade", pesoSec: 1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 38,
    text: "Você está tentando dormir mas seu cérebro decide iniciar uma reunião.",
    options: [
      { text: "Você levanta, escreve tudo num papel e volta pra cama.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você abre o celular e cai em scroll até apagar.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: -1, tag: "PROCRASTINADOR" },
      { text: "Você pratica respiração e força o silêncio mental.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Você decide que é hora de resolver o que tá na cabeça e acorda.", dimMain: "persistencia", dimSec: "impulsividade", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 39,
    text: "Você perdeu um prazo importante por distração.",
    options: [
      { text: "Você assume a responsabilidade, pede desculpa e entrega o mais rápido.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você analisa o que falhou no sistema e corrige o processo.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você negocia um novo prazo com argumentos criativos e plausíveis.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você entra em modo túnel e entrega mesmo que atrasado, sem drama.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 40,
    text: "Você tem que escolher entre dormir cedo e terminar algo prazeroso.",
    options: [
      { text: "Dorme. O prazer de amanhã vai ser maior com sono bom.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "ZEN" },
      { text: "Termina. Sono é recuperável. O momento não.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Negocia consigo mesmo: mais 30 minutos com alarme.", dimMain: "adaptabilidade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Pausa, marca onde estava e retoma amanhã com energia total.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 41,
    text: "Você precisa aprender algo novo rapidamente. Qual é o método?",
    options: [
      { text: "Você assiste tutorial no YouTube em 2x com anotações paralelas.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você usa o ChatGPT como professor pessoal e testa tudo na prática.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você encontra alguém que já sabe e aprende por osmose.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você vai tentando e errando até encaixar.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 42,
    text: "Seu WiFi caiu no momento mais crítico do dia.",
    options: [
      { text: "Você vai pra dados móveis sem drama. Plano B sempre pronto.", dimMain: "adaptabilidade", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você liga pro provedor, abre chamado e documenta o horário.", dimMain: "persistencia", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você usa a pausa forçada como descanso legítimo.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você fica em modo pânico ativando e desativando o roteador.", dimMain: "impulsividade", dimSec: "percepcao", pesoSec: -1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 43,
    text: "Você recebe um e-mail que parece golpe mas parece real demais.",
    options: [
      { text: "Você pesquisa remetente, URL, domínio e headers antes de qualquer ação.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você encaminha pra alguém de TI ou mais experiente antes de agir.", dimMain: "empatia", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você ignora. Se for real, vão entrar em contato de outro jeito.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "ZEN" },
      { text: "Você testa clicando em link não-suspeito com segurança máxima.", dimMain: "impulsividade", dimSec: null, pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 44,
    text: "Você tem 5 apps de produtividade instalados e usa 0 com consistência.",
    options: [
      { text: "Você desinstala todos e volta pra papel e caneta.", dimMain: "disciplina", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você dedica uma semana a cada um pra testar qual encaixa melhor.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você cria um sistema próprio combinando pedaços de cada um.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você baixa mais um app que promete ser diferente dos outros.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: -1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 45,
    text: "Você vai postar algo e percebe que pode gerar polêmica.",
    options: [
      { text: "Você posta. Opinião não precisa de aprovação.", dimMain: "impulsividade", dimSec: "lideranca", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você relê três vezes, edita e posta com contexto claro.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você salva em rascunho. Talvez não valha o desgaste.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você posta de stories que somem em 24h. Risco controlado.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 46,
    text: "Você está com 3% de bateria e sem carregador.",
    options: [
      { text: "Você ativa modo avião, fecha tudo e usa só o essencial.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você começa a missão de encontrar tomada com urgência de sobrevivência.", dimMain: "persistencia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ATLETA" },
      { text: "Você resolve tudo urgente em velocidade recorde antes de apagar.", dimMain: "impulsividade", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você usa 3% pra fazer o que quiser. Quando acabar, acabou.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 47,
    text: "Seu celular notifica que você usou 6h de redes sociais hoje.",
    options: [
      { text: "Você configura limite de tempo e ativa grayscale mode imediatamente.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você usa o fato como desculpa pra mais 30 minutos. Já foi mesmo.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "PROCRASTINADOR" },
      { text: "Você avalia: foi de valor ou desperdício? Resposta honesta primeiro.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você fecha o app de stats. Ignorância seletiva é saúde mental.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 48,
    text: "Você abre o notebook e tem 22 abas de navegador abertas de ontem.",
    options: [
      { text: "Você fecha tudo sem olhar. Recomeço total.", dimMain: "disciplina", dimSec: "impulsividade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você vai abrindo uma por uma investigando o que estava pesquisando.", dimMain: "percepcao", dimSec: null, pesoSec: 1, tag: "NERD" },
      { text: "Você salva todas num grupo de favoritos chamado \'depois\' e fecha.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você começa a trabalhar normalmente com elas abertas. É contexto.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 49,
    text: "Uma atualização quebrou o sistema que você usa todo dia.",
    options: [
      { text: "Você encontra o workaround em 15 minutos pesquisando.", dimMain: "criatividade", dimSec: "persistencia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você documenta o bug com prints e reporta pro suporte técnico.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você usa o sistema alternativo que nunca precisou mas sempre existiu.", dimMain: "adaptabilidade", dimSec: "percepcao", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você usa a instabilidade como desculpa pra fazer as tarefas offline.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 50,
    text: "Você quer aprender programação mas trava no \'Olá, Mundo\'.",
    options: [
      { text: "Você começa do zero com um livro de verdade. Fundamento é fundamento.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você usa no-code/AI pra resolver o problema enquanto aprende.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você pede pra alguém que sabe te explicar ao vivo.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você abandona e volta daqui a 2 semanas com novo ânimo.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 51,
    text: "Você recebe duas propostas de trabalho ao mesmo tempo.",
    options: [
      { text: "Você cria uma tabela comparativa com pesos por critério.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você pede extensão de prazo nas duas pra pensar melhor.", dimMain: "estrategia", dimSec: "adaptabilidade", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você vai de intuição. A análise racional confirma o que a barriga já disse.", dimMain: "impulsividade", dimSec: "percepcao", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você conta pra amigos e deixa o papo te ajudar a organizar o pensamento.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 52,
    text: "Você está convicto de algo e descobre que estava errado.",
    options: [
      { text: "Você assume sem drama e agradece por ter aprendido.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você processa em silêncio e só confirma quando entende totalmente.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você atualiza sua visão e avisa as pessoas que a opinião velha afetou.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você fica quieto, muda de posição e segue. Sem necessidade de anunciar.", dimMain: "adaptabilidade", dimSec: "estrategia", pesoSec: 1, tag: "FURTIVO" },
    ],
  },
  {
    id: 53,
    text: "Você precisa tomar uma decisão importante com pouca informação.",
    options: [
      { text: "Você age com o que tem. Esperar mais dados também é uma decisão.", dimMain: "impulsividade", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você traça o pior cenário de cada opção e escolhe o mais tolerável.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você pergunta pra quem já viveu situação similar.", dimMain: "empatia", dimSec: "sociabilidade", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você dorme, deixa o inconsciente trabalhar e decide de manhã.", dimMain: "percepcao", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 54,
    text: "Você está errado numa discussão mas a outra pessoa está sendo grossa.",
    options: [
      { text: "Você concorda com o mérito mas endereça o tom diretamente.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você reforça sua posição errada por puro orgulho no momento.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: -1, tag: "CAÓTICO" },
      { text: "Você deixa passar. O ego é o inimigo.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você cede no conteúdo mas anota o comportamento pra falar depois.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 55,
    text: "Alguém te pede sua opinião e a sua opinião vai desagradar.",
    options: [
      { text: "Você diz a verdade com tato. Mentira gentil não ajuda no longo prazo.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você faz perguntas pra pessoa chegar sozinha à conclusão.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "CURADOR" },
      { text: "Você diz o que quer ouvir. Harmonia também tem valor.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você pede tempo pra pensar. E pensa muito antes de falar.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 56,
    text: "Você começa um projeto empolgante e trava no meio.",
    options: [
      { text: "Você força por 25 minutos mesmo sem ânimo. O start é o mais difícil.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Você muda de ângulo: qual parte me empolga mais agora?", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você faz a parte mais fácil pra criar momentum.", dimMain: "estrategia", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você pausa oficialmente, sem culpa, e retoma quando estiver pronto.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 57,
    text: "Você está no pico da energia às 23h. Dorme ou aproveita?",
    options: [
      { text: "Você aproveita. Energia é recurso escasso e ela apareceu agora.", dimMain: "impulsividade", dimSec: "criatividade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você dorme mesmo. Amanhã precisa funcionar e o pico vai passar.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "ZEN" },
      { text: "Você usa os 30 minutos de pico e dorme antes de cair demais.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você divide: cria algo e anota pra continuar amanhã.", dimMain: "criatividade", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 58,
    text: "Uma oportunidade incrível aparece mas exige sair da zona de conforto.",
    options: [
      { text: "Você aceita. Desconforto é o endereço do crescimento.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "ATLETA" },
      { text: "Você pesquisa tudo que pode antes de aceitar ou recusar.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você negocia as condições pra reduzir o risco antes de aceitar.", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você deixa a oportunidade expirar enquanto decide. E aprende com isso.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: -1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 59,
    text: "Você recebe uma crítica pública nas redes sociais.",
    options: [
      { text: "Você responde com fato e educação. Ignora o tom, foca no conteúdo.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você ignora. Não vale a energia. Próximo.", dimMain: "disciplina", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você responde com humor e reverte o clima.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você rumina por horas e compõe resposta épica que nunca envia.", dimMain: "percepcao", dimSec: "impulsividade", pesoSec: -1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 60,
    text: "Você precisa pedir algo que te custa muito pedir.",
    options: [
      { text: "Você treina o que vai falar, respira, e pede.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você manda texto porque ao vivo seria mais difícil.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você espera o momento perfeito. Às vezes nunca vem.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: -1, tag: "PROCRASTINADOR" },
      { text: "Você reenquadra o pedido de forma que não parece pedido.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 61,
    text: "Você precisa fazer um presente especial sem tempo nem dinheiro.",
    options: [
      { text: "Você cria algo do zero com materiais que tem em casa.", dimMain: "criatividade", dimSec: "persistencia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você organiza uma experiência em vez de um objeto.", dimMain: "empatia", dimSec: "criatividade", pesoSec: 1, tag: "CURADOR" },
      { text: "Você escreve algo pessoal que vale mais que qualquer compra.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você encontra algo significativo de segunda mão com uma boa história.", dimMain: "criatividade", dimSec: "percepcao", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 62,
    text: "Você está na cozinha e faltam ingredientes pra receita.",
    options: [
      { text: "Você improvisa substituições e cria algo melhor por acidente.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você pesquisa rapidamente o que pode substituir o que falta.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você pede delivery. Não é o momento pra experiências.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você simplifica a receita pro que tem disponível e faz funcionar.", dimMain: "adaptabilidade", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 63,
    text: "Você precisa explicar um conceito complexo pra quem não entende nada.",
    options: [
      { text: "Você cria uma analogia inusitada que encaixa perfeitamente.", dimMain: "criatividade", dimSec: "empatia", pesoSec: 1, tag: "CURADOR" },
      { text: "Você vai do básico ao avançado passo a passo com paciência.", dimMain: "persistencia", dimSec: "empatia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você encontra um vídeo ou recurso que explica melhor que você.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você mostra na prática em vez de explicar teoricamente.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
    ],
  },
  {
    id: 64,
    text: "Você está entediado num lugar sem ter o que fazer.",
    options: [
      { text: "Você inventa um jogo ou observação com o que tem ao redor.", dimMain: "criatividade", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você usa o tempo pra pensar em algo que estava postergando.", dimMain: "persistencia", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você começa a puxar papo com quem estiver por perto.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você cai em modo vegetativo. Às vezes o cérebro precisa disso.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 65,
    text: "Você errou feio em algo criativo que compartilhou.",
    options: [
      { text: "Você assume o erro, ri de si mesmo e usa como história boa.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você explica o que quis dizer com clareza e encerra o assunto.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você fica quieto e espera o barulho passar.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: -1, tag: "FURTIVO" },
      { text: "Você usa o erro como ponto de partida pra algo melhor.", dimMain: "criatividade", dimSec: "persistencia", pesoSec: 1, tag: "DOPAMINA" },
    ],
  },
  {
    id: 66,
    text: "Você tem uma ideia boa mas não sabe por onde começar.",
    options: [
      { text: "Você começa pelo começo. Qualquer começo. Agora.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você mapeia a ideia antes de tocar em qualquer ferramenta.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você procura referências de quem já fez algo parecido.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você conta a ideia pra alguém pra calibrar se é tão boa quanto parece.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 67,
    text: "Você precisa fazer uma apresentação em cima da hora.",
    options: [
      { text: "Você abre o Canva e monta algo visual em 20 minutos.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você pega uma apresentação antiga e adapta com cortes cirúrgicos.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você apresenta sem slides. Só a fala. Se der, deu.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você tem template salvo exatamente pra situações assim.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 68,
    text: "Você precisa resolver um problema que ninguém conseguiu antes.",
    options: [
      { text: "Você começa do zero sem olhar as soluções que falharam.", dimMain: "criatividade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você analisa por que as tentativas anteriores falharam primeiro.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você mistura elementos de áreas diferentes pra criar uma solução híbrida.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você pergunta pra alguém de fora da área. Perspectiva externa.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 69,
    text: "Você começa um projeto pessoal e para antes de terminar. Sempre.",
    options: [
      { text: "Você define a versão mínima que seria \'terminado\' e entrega só isso.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você investiga o padrão: o que te faz parar especificamente?", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você cria um sistema de accountability com outra pessoa.", dimMain: "sociabilidade", dimSec: "disciplina", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você abraça que começar é sua habilidade. A finalização é de outros.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 70,
    text: "Você está numa conversa chata e precisa sair educadamente.",
    options: [
      { text: "Você cria um pretexto crível sem mentira escancarada.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você fala diretamente que precisa ir. A honestidade é eficiente.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você usa linguagem corporal pra sinalizar que vai encerrando.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você apresenta a pessoa a alguém e sai enquanto elas se conhecem.", dimMain: "criatividade", dimSec: "sociabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 71,
    text: "Você percebe que alguém do time está mal mas fingindo que não.",
    options: [
      { text: "Você aborda em particular com cuidado genuíno.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Você age de forma a aliviar a carga da pessoa sem perguntar.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você espera a pessoa vir quando estiver pronta. Espaço também é cuidado.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você cria um ambiente onde compartilhar fica mais fácil pra todos.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
    ],
  },
  {
    id: 72,
    text: "Você é o mais experiente numa situação e o menos experiente lidera mal.",
    options: [
      { text: "Você oferece suporte de bastidores sem tomar a frente.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Você assume a liderança diretamente. A situação exige.", dimMain: "lideranca", dimSec: "impulsividade", pesoSec: 1, tag: "LÍDER" },
      { text: "Você faz perguntas que guiam o líder sem que ele saiba.", dimMain: "lideranca", dimSec: "percepcao", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você deixa o processo acontecer. Errar faz parte do aprendizado.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 73,
    text: "Você precisa dar uma notícia ruim pra alguém que vai se abalar.",
    options: [
      { text: "Você é direto mas gentil. A clareza é a maior gentileza.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você prepara o contexto antes de chegar na notícia.", dimMain: "empatia", dimSec: "estrategia", pesoSec: 1, tag: "CURADOR" },
      { text: "Você pergunta se a pessoa quer a versão curta ou contexto completo.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Você adia inconscientemente porque sabe que vai doer.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: -1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 74,
    text: "Seu grupo não sabe como resolver algo. Você sabe mas é o mais novo.",
    options: [
      { text: "Você propõe sua solução com confiança e contexto.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "LÍDER" },
      { text: "Você apresenta como pergunta: \'e se a gente tentasse...\'", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você espera que alguém chegue perto da sua ideia e confirma.", dimMain: "percepcao", dimSec: "adaptabilidade", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você manda a solução por escrito depois da reunião.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "INTROVERTIDO" },
    ],
  },
  {
    id: 75,
    text: "O grupo todo concorda com algo que você acha errado.",
    options: [
      { text: "Você fala. Pressão de grupo não muda o que você vê.", dimMain: "lideranca", dimSec: "persistencia", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você aponta o que acha inconsistente de forma objetiva.", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você cede. Talvez o grupo tenha informações que você não tem.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você espera o resultado provar ou refutar. O tempo vai julgar.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "INTROVERTIDO" },
    ],
  },
  {
    id: 76,
    text: "Você está liderando um projeto e percebe que vai atrasar.",
    options: [
      { text: "Você comunica o atraso cedo com novo prazo realista.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você reorganiza o time e dobra esforço pra recuperar o prazo.", dimMain: "persistencia", dimSec: "lideranca", pesoSec: 1, tag: "COMPETITIVO" },
      { text: "Você identifica o gargalo e elimina antes que piore.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você renegocia escopo: o que é essencial pra prazo manter-se?", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "LÍDER" },
    ],
  },
  {
    id: 77,
    text: "Alguém toma crédito pelo seu trabalho na frente de todos.",
    options: [
      { text: "Você reivindica com fatos e sem drama.", dimMain: "lideranca", dimSec: "persistencia", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você deixa passar e trata isso em particular depois.", dimMain: "estrategia", dimSec: "empatia", pesoSec: 1, tag: "FURTIVO" },
      { text: "Você registra o padrão. Primeira vez: observação. Segunda: ação.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você faz questão de ser visível nos próximos projetos.", dimMain: "persistencia", dimSec: "lideranca", pesoSec: 1, tag: "COMPETITIVO" },
    ],
  },
  {
    id: 78,
    text: "Um conflito no grupo está afetando a entrega. Você...",
    options: [
      { text: "Facilita uma conversa honesta pra resolver a raiz.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Separa as pessoas em tarefas que não se cruzem até estabilizar.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "LÍDER" },
      { text: "Ouve cada lado separado antes de qualquer intervenção.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Aumenta a pressão de prazo pra forçar foco no trabalho.", dimMain: "persistencia", dimSec: "lideranca", pesoSec: 1, tag: "COMPETITIVO" },
    ],
  },
  {
    id: 79,
    text: "Você percebe que alguém do grupo não está contribuindo.",
    options: [
      { text: "Você conversa diretamente sobre o que está impedindo.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Você reorganiza as responsabilidades sutilmente sem confronto.", dimMain: "lideranca", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você documenta e escala se necessário. Processo existe pra isso.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você ignora e absorve o trabalho. Às vezes é mais rápido.", dimMain: "persistencia", dimSec: "adaptabilidade", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 80,
    text: "Você precisa motivar alguém que desistiu de algo importante.",
    options: [
      { text: "Você ouve antes de qualquer tentativa de motivar.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Você mostra casos de quem quase desistiu e não desistiu.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você divide o objetivo em partes menores e celebra cada uma.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você respeita a decisão mas deixa a porta aberta sem pressão.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 81,
    text: "Você recebe uma missão sem manual nem mapa.",
    options: [
      { text: "Você parte com o que tem e vai descobrindo no caminho.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você busca referências de quem fez algo similar antes de partir.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você monta um plano mínimo viável antes de mover um passo.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você convoca a galera antes. Missão solo é subótima.", dimMain: "sociabilidade", dimSec: "lideranca", pesoSec: 1, tag: "LÍDER" },
    ],
  },
  {
    id: 82,
    text: "Você descobre que o problema que estava resolvendo era o sintoma, não a causa.",
    options: [
      { text: "Você recomeça do zero mirando na causa real.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você vai pra causa mas mantém o progresso que fez como camada.", dimMain: "estrategia", dimSec: "criatividade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você investiga por quanto tempo estava resolvendo o errado.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você registra o aprendizado e parte com mais clareza.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
    ],
  },
  {
    id: 83,
    text: "Você encontra um atalho que encurta muito o trabalho. Mas parece arriscado.",
    options: [
      { text: "Você testa o atalho em escala pequena primeiro.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você vai pelo atalho. Risco calculado é diferente de imprudência.", dimMain: "impulsividade", dimSec: "estrategia", pesoSec: 1, tag: "ATLETA" },
      { text: "Você analisa o que pode dar errado e mitiga antes de prosseguir.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você documenta o atalho e vai pelo caminho seguro desta vez.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
    ],
  },
  {
    id: 84,
    text: "Você está num ambiente hostil onde ninguém te conhece.",
    options: [
      { text: "Você observa em silêncio até entender as regras do jogo.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você se apresenta e começa a construir pontes ativamente.", dimMain: "sociabilidade", dimSec: "lideranca", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você encontra o aliado mais neutro e começa por ele.", dimMain: "sociabilidade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você age como se o ambiente fosse normal até virar.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 85,
    text: "Você está 80% completo numa tarefa longa e o cansaço bate.",
    options: [
      { text: "Você vai até o fim. 80% não conta como feito.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Você faz pausa de 20 minutos e retoma.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Você vai até o próximo checkpoint e para sem culpa.", dimMain: "adaptabilidade", dimSec: "estrategia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você toma o energético mais próximo e enfrenta o resto com dopamina.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "ATLETA" },
    ],
  },
  {
    id: 86,
    text: "Uma regra que você segue há anos parece não fazer mais sentido.",
    options: [
      { text: "Você questiona e pesquisa a origem antes de quebrar.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "NERD" },
      { text: "Você quebra a regra e observa o resultado com cuidado.", dimMain: "impulsividade", dimSec: "percepcao", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você mantém até ter alternativa testada pra substituir.", dimMain: "persistencia", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você conversa com quem também segue a regra antes de agir.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 87,
    text: "Você tem que escolher entre duas opções igualmente boas.",
    options: [
      { text: "Você joga uma moeda. Sua reação ao resultado revela o que quer.", dimMain: "impulsividade", dimSec: "percepcao", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você pede uma terceira opinião desinteressada.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você cria uma matriz de critérios pra quebrar o empate tecnicamente.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Você escolhe a que pode ser revertida se der errado.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 88,
    text: "Você está num momento de seca criativa total.",
    options: [
      { text: "Você expõe a inputs novos: livro diferente, lugar diferente, pessoa diferente.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você se força a criar algo ruim de propósito. O filtro é o problema.", dimMain: "impulsividade", dimSec: "criatividade", pesoSec: 1, tag: "CAÓTICO" },
      { text: "Você documenta a seca e investiga o que te bloqueou.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você descansa de verdade. A criatividade não funciona com força bruta.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 89,
    text: "Alguém te desafia a fazer algo que você nunca fez.",
    options: [
      { text: "Você aceita. Desconforto é dado de crescimento.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "ATLETA" },
      { text: "Você pergunta quem já fez antes de comprometer.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você define o que seria \'bem feito\' antes de aceitar ou recusar.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você topa com a condição de poder adaptar o formato ao longo do caminho.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 90,
    text: "Você está em território desconhecido — literalmente perdido.",
    options: [
      { text: "Você reconstrói a rota a partir de referências do ambiente.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você pergunta pra alguém. Simples e eficiente.", dimMain: "sociabilidade", dimSec: "adaptabilidade", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você usa o GPS, o mapa e o instinto em paralelo.", dimMain: "estrategia", dimSec: "criatividade", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você decide que estar perdido pode ser uma aventura se você deixar.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 91,
    text: "Você recebe um elogio que não esperava. Reação honesta?",
    options: [
      { text: "Você agradece, fica vermelho internamente e muda de assunto.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você agradece com genuinidade e pergunta o que especificamente.", dimMain: "sociabilidade", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você agradece e logo minimiza: \'foi sorte, na verdade\'.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: -1, tag: "ANSIOSO" },
      { text: "Você agradece com confiança e registra internamente como validação.", dimMain: "disciplina", dimSec: "persistencia", pesoSec: 1, tag: "COMPETITIVO" },
    ],
  },
  {
    id: 92,
    text: "Alguém descreve um traço de personalidade que você não sabia ter.",
    options: [
      { text: "Você pede exemplos específicos e investiga com honestidade.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você absorve como informação e observa se faz sentido nos próximos dias.", dimMain: "adaptabilidade", dimSec: "percepcao", pesoSec: 1, tag: "ZEN" },
      { text: "Você discorda imediatamente. Você se conhece melhor.", dimMain: "impulsividade", dimSec: "disciplina", pesoSec: -1, tag: "CAÓTICO" },
      { text: "Você agradece e segue. O autoconhecimento é processo lento.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 93,
    text: "Você se vê procrastinando em algo que teoricamente ama.",
    options: [
      { text: "Você investiga se ainda ama de verdade ou mudou.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você reduz a barreira de entrada ao mínimo possível pra retomar.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você respeita o ciclo. Nem todo dia é dia de criar.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você define um horário fixo e se apresenta mesmo sem vontade.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 94,
    text: "Você termina um ciclo longo. Como celebra?",
    options: [
      { text: "Você descansa do jeito mais prazeroso que existir.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você já está planejando o próximo. A energia do fim é o início.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "COMPETITIVO" },
      { text: "Você compartilha com pessoas que acompanharam a jornada.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você documenta o que aprendeu antes de qualquer outra coisa.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
    ],
  },
  {
    id: 95,
    text: "Você está numa fase de muito ruído externo. Como se protege?",
    options: [
      { text: "Você estabelece rotinas de silêncio intencional todos os dias.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "ZEN" },
      { text: "Você aumenta a triagem: menos inputs, mais profundidade.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você conversa com pessoas que trazem clareza em vez de ruído.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "CURADOR" },
      { text: "Você vai pra natureza ou qualquer ambiente que reseta.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 96,
    text: "Você percebe que está carregando um hábito que não serve mais.",
    options: [
      { text: "Você para imediatamente e constrói o substituto.", dimMain: "persistencia", dimSec: "impulsividade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você cria uma estratégia de substituição gradual.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você observa o hábito por mais 30 dias antes de agir.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você conta pra alguém que vai te cobrar na substituição.", dimMain: "sociabilidade", dimSec: "persistencia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 97,
    text: "Você está sobrecarregado e mais uma coisa aparece.",
    options: [
      { text: "Você avalia o que pode sair pra essa nova coisa entrar.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você fala \'não\' com clareza pela primeira vez.", dimMain: "lideranca", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você absorve e redistribui sua energia com criatividade.", dimMain: "criatividade", dimSec: "persistencia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você entra em modo automático e processa tudo no piloto.", dimMain: "persistencia", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 98,
    text: "Você está relendo algo que escreveu há 2 anos.",
    options: [
      { text: "Você se surpreende positivamente. Cresceu mais do que sentia.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você vê erros que quer corrigir imediatamente.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você analisa o que mudou no seu pensamento desde então.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "NERD" },
      { text: "Você usa como ponto de partida pra escrever algo novo.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
    ],
  },
  {
    id: 99,
    text: "Seu plano perfeito encontra a realidade e não sobrevive.",
    options: [
      { text: "Você adapta o plano em tempo real sem entrar em colapso.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você analisa onde o plano falhou pra reconstruir melhor.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você segue o espírito do plano mesmo que a letra mude.", dimMain: "disciplina", dimSec: "adaptabilidade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você ri do plano e começa do zero com mais informação.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 100,
    text: "Você está no fim de um dia em que nada saiu como esperado.",
    options: [
      { text: "Você escreve 3 coisas que funcionaram mesmo assim.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você analisa o dia pra entender o padrão do que deu errado.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você dorme. Amanhã é um novo save.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
      { text: "Você conta pra alguém pra processar em voz alta.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "EXTROVERTIDO" },
    ],
  },
  {
    id: 101,
    text: "Você recebe uma proposta de investimento com retorno alto e risco \'moderado\'.",
    options: [
      { text: "Você pesquisa o histórico do ativo antes de qualquer coisa.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você coloca só o que perderia sem perder o sono.", dimMain: "adaptabilidade", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Você ignora. Retorno alto = risco disfarçado. Regra inabalável.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você pergunta pra quem já investiu antes de decidir.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 102,
    text: "Sua conta ficou negativa por 3 dias sem você perceber.",
    options: [
      { text: "Você age imediatamente e revisa todo o controle financeiro.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você paga a taxa e vai em frente. Acontece com os melhores.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "ZEN" },
      { text: "Você implementa alerta automático de saldo. Isso nunca mais.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "TECNOLÓGICO" },
      { text: "Você entra em espiral de ansiedade e revê o saldo 8x no dia.", dimMain: "percepcao", dimSec: "impulsividade", pesoSec: 1, tag: "ANSIOSO" },
    ],
  },
  {
    id: 103,
    text: "Você tem que escolher entre pagar uma dívida e fazer uma viagem.",
    options: [
      { text: "Você paga a dívida. Depois viaja sem essa sombra.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "ZEN" },
      { text: "Você viaja e parcelada a dívida por mais tempo. YOLO.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você procura uma forma de fazer as duas coisas com criatividade.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você adia a decisão mais um mês enquanto pesquisa mais variáveis.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: -1, tag: "PROCRASTINADOR" },
    ],
  },
  {
    id: 104,
    text: "Você vê um item que quer muito em promoção relâmpago. Mas não planejou.",
    options: [
      { text: "Você compra. Oportunidades têm prazo de validade.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você usa a regra: se não planejou, não é oportunidade.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você calcula em tempo real se tem como encaixar no orçamento.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "NERD" },
      { text: "Você adiciona ao carrinho, espera 10 minutos e vê se ainda quer.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 105,
    text: "Seu chefe propõe um desafio com bônus alto mas prazo impossível.",
    options: [
      { text: "Você aceita. Impossível é subjetivo e o bônus é real.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "ATLETA" },
      { text: "Você negocia prazo ou escopo antes de aceitar.", dimMain: "lideranca", dimSec: "estrategia", pesoSec: 1, tag: "LÍDER" },
      { text: "Você pergunta o que acontece se você chegar perto mas não fechar.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você recusa. Prazo impossível cria trabalho ruim e esgota.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 106,
    text: "Você começa o dia sem energia mas tem muito pra fazer.",
    options: [
      { text: "Você começa pela tarefa mais fácil pra criar momentum.", dimMain: "estrategia", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você faz o mais difícil primeiro. Depois só melhora.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Você resolve por energia: café, sol ou música antes de qualquer coisa.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você aceita o dia lento e faz o mínimo com qualidade.", dimMain: "empatia", dimSec: "adaptabilidade", pesoSec: 1, tag: "ZEN" },
    ],
  },
  {
    id: 107,
    text: "Você está num parque e percebe que ficou 40 minutos no celular.",
    options: [
      { text: "Você guarda o celular e fica presente nos próximos 40 minutos.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "ZEN" },
      { text: "Você admite que o parque era contexto, não destino, e vai embora.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você documenta a percepção pra investigar o padrão depois.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você tira foto do parque pelo celular pra justificar a presença.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 108,
    text: "Você está fazendo algo tedioso mas necessário. Como aguenta?",
    options: [
      { text: "Você transforma em jogo: se terminar em X tempo, ganha Y.", dimMain: "criatividade", dimSec: "disciplina", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você foca no resultado final, não no processo.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você coloca algo que goste no fundo: podcast, música, série.", dimMain: "adaptabilidade", dimSec: "criatividade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você faz em blocos de 15 minutos com pausa de 5.", dimMain: "estrategia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
    ],
  },
  {
    id: 109,
    text: "Você está conversando com alguém e se pega pensando em outra coisa.",
    options: [
      { text: "Você volta o foco intencionalmente sem se punir.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "ZEN" },
      { text: "Você faz uma pergunta sobre o que a pessoa disse pra se ancorar.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Você admite mentalmente que perdeu o fio e pede pra repetir.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você acena e espera o próximo contexto pra se reconectar.", dimMain: "adaptabilidade", dimSec: "sociabilidade", pesoSec: 1, tag: "FURTIVO" },
    ],
  },
  {
    id: 110,
    text: "Uma conversa que parecia terminar já dura 2 horas.",
    options: [
      { text: "Você adora. Conversas longas são sinal de conexão real.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "EXTROVERTIDO" },
      { text: "Você está presente mas monitorando sua energia interna.", dimMain: "percepcao", dimSec: "adaptabilidade", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você cria um encerramento natural sem que a outra pessoa perceba.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você fala diretamente que precisa de um encerramento em breve.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
  {
    id: 111,
    text: "Você está num momento feliz e percebe que está ansioso pra terminar.",
    options: [
      { text: "Você reconhece o padrão e força presença no momento atual.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você deixa a ansiedade existir sem agir sobre ela.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você entende que é ansiedade de antecipação e nomeia isso.", dimMain: "empatia", dimSec: "percepcao", pesoSec: 1, tag: "CURADOR" },
      { text: "Você se joga mais fundo no momento pra combater a saída antecipada.", dimMain: "impulsividade", dimSec: "empatia", pesoSec: 1, tag: "DOPAMINA" },
    ],
  },
  {
    id: 112,
    text: "Você acorda no meio da madrugada com uma ideia.",
    options: [
      { text: "Você anota no bloco de notas e volta a dormir.", dimMain: "disciplina", dimSec: "criatividade", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você fica acordado desenvolvendo enquanto está quente.", dimMain: "impulsividade", dimSec: "criatividade", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Você confia que se for boa, vai lembrar amanhã.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você grava áudio pra não perder o raciocínio original.", dimMain: "criatividade", dimSec: "percepcao", pesoSec: 1, tag: "TECNOLÓGICO" },
    ],
  },
  {
    id: 113,
    text: "Você está lendo e não absorvendo nada há 20 minutos.",
    options: [
      { text: "Você fecha o livro. Leitura sem absorção é desperdício.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você volta ao início do capítulo e tenta de novo com mais atenção.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você muda de formato: ouve o audiobook pelo mesmo trecho.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você continua mesmo sem absorver. O ritmo vai voltar.", dimMain: "persistencia", dimSec: "adaptabilidade", pesoSec: 1, tag: "CAÓTICO" },
    ],
  },
  {
    id: 114,
    text: "Você sente que seu ambiente de trabalho está te puxando pra baixo.",
    options: [
      { text: "Você redesenha o espaço com o que tem pra criar outro clima.", dimMain: "criatividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "GAMBIARRA" },
      { text: "Você identifica o elemento específico que está pesando e remove.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você muda de ambiente físico. Café, biblioteca, varanda.", dimMain: "adaptabilidade", dimSec: "impulsividade", pesoSec: 1, tag: "ZEN" },
      { text: "Você investiga se é o ambiente ou algo que o ambiente está espelhando.", dimMain: "percepcao", dimSec: "empatia", pesoSec: 1, tag: "OVERTHINKING" },
    ],
  },
  {
    id: 115,
    text: "Você termina o dia sem ter feito o que planejou pela manhã.",
    options: [
      { text: "Você analisa o que invadiu o plano e como evitar amanhã.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "PERFECCIONISTA" },
      { text: "Você aceita. O dia revelou o que era realmente urgente.", dimMain: "adaptabilidade", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você reserva 30 minutos amanhã cedo exclusivos pra o que ficou.", dimMain: "disciplina", dimSec: "estrategia", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você risca o que não fez da lista com raiva produtiva e recomeça.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "COMPETITIVO" },
    ],
  },
  {
    id: 116,
    text: "Você está num dia em que tudo funciona perfeitamente. O que faz?",
    options: [
      { text: "Aproveita e entra em flow total. Esses dias são raros.", dimMain: "impulsividade", dimSec: "persistencia", pesoSec: 1, tag: "DOPAMINA" },
      { text: "Documenta o que estava diferente pra tentar replicar.", dimMain: "percepcao", dimSec: "disciplina", pesoSec: 1, tag: "NERD" },
      { text: "Usa a energia extra pra ajudar alguém que está travado.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Celebra com ritual que marque o dia como especial.", dimMain: "sociabilidade", dimSec: "criatividade", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 117,
    text: "Alguém pede sua opinião genuína sobre um projeto mediano deles.",
    options: [
      { text: "Elogia o que funciona e aponta uma melhoria essencial com tato.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "CURADOR" },
      { text: "Faz perguntas pra eles chegarem às conclusões sozinhos.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "CURADOR" },
      { text: "Diz a verdade com gentileza. Elogio falso é traição disfarçada.", dimMain: "empatia", dimSec: "disciplina", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Pergunta o que eles querem: honestidade ou encorajamento agora?", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
    ],
  },
  {
    id: 118,
    text: "Você está num projeto em equipe onde as ideias suas estão sendo ignoradas.",
    options: [
      { text: "Você muda a forma de apresentar sem mudar o conteúdo.", dimMain: "estrategia", dimSec: "adaptabilidade", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você fala diretamente que quer que suas ideias sejam consideradas.", dimMain: "lideranca", dimSec: "empatia", pesoSec: 1, tag: "JUSTICEIRO" },
      { text: "Você documenta suas ideias por escrito pra referência futura.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "INTROVERTIDO" },
      { text: "Você observa quem está influenciando as decisões e constrói aliança.", dimMain: "percepcao", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
    ],
  },
  {
    id: 119,
    text: "Você precisa pedir ajuda mas isso te custa muito.",
    options: [
      { text: "Você pede. Pedir ajuda é habilidade, não fraqueza.", dimMain: "empatia", dimSec: "lideranca", pesoSec: 1, tag: "RESOLUTIVO" },
      { text: "Você tenta mais uma vez sozinho antes de pedir.", dimMain: "persistencia", dimSec: "disciplina", pesoSec: 1, tag: "ATLETA" },
      { text: "Você enquadra o pedido como colaboração em vez de pedido.", dimMain: "criatividade", dimSec: "estrategia", pesoSec: 1, tag: "MALANDRO" },
      { text: "Você pesquisa mais antes de incomodar alguém com o pedido.", dimMain: "disciplina", dimSec: "percepcao", pesoSec: 1, tag: "INTROVERTIDO" },
    ],
  },
  {
    id: 120,
    text: "Você está num período de incerteza total. Como navega?",
    options: [
      { text: "Você foca no que controla e solta o que não controla.", dimMain: "disciplina", dimSec: "empatia", pesoSec: 1, tag: "ZEN" },
      { text: "Você mapeia os cenários possíveis e prepara pra dois deles.", dimMain: "estrategia", dimSec: "percepcao", pesoSec: 1, tag: "OVERTHINKING" },
      { text: "Você busca conversas que trazem perspectiva e clareza.", dimMain: "sociabilidade", dimSec: "empatia", pesoSec: 1, tag: "SOCIAL" },
      { text: "Você toma uma decisão qualquer pra criar movimento.", dimMain: "impulsividade", dimSec: "adaptabilidade", pesoSec: 1, tag: "RESOLUTIVO" },
    ],
  },
];