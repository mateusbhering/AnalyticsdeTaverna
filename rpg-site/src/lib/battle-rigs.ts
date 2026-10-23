/** Coordenadas normalizadas sobre as artes originais, nunca sobre um boneco substituto. */
export interface OlhoRig { x: number; y: number; rx: number; ry: number; pele: string }
export interface ParteRig { nome: string; recorte: string; pivo: [number, number]; levantar: number; deslocar?: number }
export interface RigClasse {
  largura: number; altura: number; olha: "esquerda" | "direita";
  cabeca: { recorte: string; pivo: [number, number] };
  olhos: OlhoRig[]; partes: ParteRig[];
}
const pol = (pontos: string) => `M${pontos.trim().split(/\s+/).join(" L")} Z`;
const olho = (x: number, y: number, rx: number, ry: number, pele = "#f6cf94"): OlhoRig => ({ x, y, rx, ry, pele });
const parte = (nome: string, pontos: string, pivo: [number, number], levantar: number, deslocar = 0): ParteRig => ({ nome, recorte: pol(pontos), pivo, levantar, deslocar });
const cabeca = (pontos: string, pivo: [number, number]) => ({ recorte: pol(pontos), pivo });
export const BATTLE_RIGS: Record<string, RigClasse> = {
  "mago-chatgpt": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("30,4 100,4 100,49 68,57 43,56 32,48 38,38 27,28",[54,57]),
    olhos:[olho(43.4,40.2,3.1,3.8),olho(48.5,44,3.7,4.1)],
    partes:[parte("cajado","0,12 28,12 36,26 29,42 35,51 44,57 45,69 36,73 37,80 30,80 28,65 0,46",[44,61],22),parte("grimorio","67,55 100,46 100,78 69,78 62,72 61,65",[63,65],-24)],
  },
  "ninja-v2": {
    largura:1201, altura:1310, olha:"esquerda", cabeca:cabeca("0,0 100,0 100,55 60,58 34,56 0,59",[49,54]),
    olhos:[olho(38.4,40.6,8.8,5.5,"#7fbd9b")],
    partes:[parte("selo","21,52 29,53 32,61 42,62 42,70 31,75 19,65",[42,61],30),parte("pergaminho","64,56 69,56 72,53 80,55 80,65 72,71 66,68",[64,61],-18)],
  },
  "berserker-v2": {
    largura:1218, altura:1291, olha:"direita", cabeca:cabeca("34,29 66,29 68,40 72,43 69,56 42,56 35,45",[53,55]),
    olhos:[olho(51.4,44.1,2,1.35,"#b44935"),olho(55.3,44.7,1.5,1.7,"#b44935")],
    partes:[{nome:"bracos-e-tronco",recorte:pol("0,0 100,0 100,28 0,30")+pol("15,23 29,23 30,42 41,49 36,63 23,61 17,43")+pol("72,18 83,18 83,41 89,49 86,59 76,62 70,48"),pivo:[52,56],levantar:3,deslocar:-3}],
  },
  "necromante": {
    largura:1254, altura:1254, olha:"direita", cabeca:cabeca("29,24 73,24 72,55 59,61 44,62 29,56",[53,59]),
    olhos:[olho(54.7,46.8,2.5,2.5),olho(58.8,43.8,2.5,2.6)],
    partes:[parte("cajado","4,10 30,10 34,48 40,57 44,63 41,76 40,92 30,92 22,61 4,49",[42,65],18),parte("invocacao","61,59 69,56 72,48 83,47 86,59 78,65 75,79 65,75",[61,64],-28)],
  },
  "ladino": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("19,9 85,9 85,52 58,57 35,56 19,45",[49,55]),
    olhos:[olho(35.8,39.4,2.8,3.2),olho(43.2,36.8,3.1,3.4)],
    partes:[parte("telefone","13,49 34,47 42,54 48,57 44,65 25,68 13,61",[46,58],25),parte("punhal","59,54 72,55 80,67 70,74 58,65",[59,59],-22)],
  },
  "warlock-v2": {
    largura:1205, altura:1305, olha:"esquerda", cabeca:cabeca("3,0 66,0 72,26 64,39 45,43 4,44",[48,37]),olhos:[],
    partes:[parte("chama","20,33 31,32 34,42 43,47 45,40 48,39 49,51 42,58 29,55 19,49",[46,43],25)],
  },
  "ilusionista-v2": {
    largura:1199, altura:1312, olha:"esquerda", cabeca:cabeca("0,0 100,0 100,53 67,56 51,54 38,55 13,54 10,37",[57,54]),
    olhos:[olho(44.6,38.6,4.5,5.4,"#a6c69b"),olho(55,41.8,3.6,1.8,"#a6c69b")],
    partes:[parte("mascara","28,54 38,54 40,61 47,62 52,57 56,58 48,67 37,66 34,72 29,70",[54,59],8),parte("feitico","62,55 68,54 77,64 90,68 93,65 100,65 100,80 81,79 65,65",[63,58],-28)],
  },
  "artifice": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("20,3 90,3 90,54 61,58 34,57 24,45",[48,57]),
    olhos:[olho(39,44,2.2,3),olho(48.1,40.4,3.5,3.7)],
    partes:[parte("chave","2,26 26,26 29,48 36,58 42,61 40,67 34,75 25,70 15,53 2,47",[41,63],26),parte("ajuste","55,59 66,59 68,67 60,73 55,68",[55,62],-14)],
  },
  "invocador": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("27,23 75,23 75,55 57,63 37,61 27,50",[50,61]),
    olhos:[olho(43,43,2.7,2.7),olho(48.5,41.1,2.7,2.9)],
    partes:[parte("pizza","0,5 33,5 33,41 35,56 40,62 36,69 25,68 16,51 0,47",[37,61],25),parte("entrega","67,5 100,5 100,61 76,65 64,71 61,63 68,54",[63,64],-25)],
  },
  "druida": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("30,9 91,9 91,55 63,63 40,62 30,49",[51,60]),
    olhos:[olho(43,36,2.4,2.5),olho(50.4,40.3,3.4,3)],
    partes:[parte("cajado","0,5 28,5 33,50 44,57 43,70 39,91 24,98 26,75 8,40",[43,63],17),parte("folhagem","59,61 76,58 79,69 66,75 58,68",[59,64],-18)],
  },
  "ranger-v2": {
    largura:1200, altura:1311, olha:"direita", cabeca:cabeca("30,20 85,20 85,48 60,57 45,58 30,48",[49,55]),
    olhos:[olho(57,37,2.6,3,"#e8dab1")],
    partes:[parte("vassoura","0,0 26,0 34,39 44,53 48,64 43,74 42,98 27,98 24,70 15,42",[44,58],19),parte("pa","57,49 66,48 73,57 91,61 98,80 74,88 65,68 57,62",[58,59],-20)],
  },
  "bardo-v2": {
    largura:1312, altura:1199, olha:"esquerda", cabeca:cabeca("4,3 100,3 100,49 66,59 42,59 16,52 4,40",[49,56]),olhos:[],
    partes:[parte("instrumento","30,57 48,53 59,55 70,50 88,51 89,62 65,67 54,74 35,71",[48,62],-8)],
  },
  "xama-v2": {
    largura:1217, altura:1292, olha:"esquerda", cabeca:cabeca("14,0 94,0 94,42 65,50 39,49 14,40",[54,48]),olhos:[],
    partes:[parte("cajado","0,10 19,10 27,44 44,53 43,63 29,63 15,51 0,34",[43,55],21),parte("pressagio","60,47 77,47 89,64 79,73 64,63",[62,54],-25)],
  },
  "vidente": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("17,5 90,5 90,61 56,66 36,62 17,49",[49,62]),
    olhos:[olho(39.9,44.1,3,3.2),olho(46.5,45.7,2.9,3)],
    partes:[parte("orbe","35,62 56,60 62,68 58,79 39,79 33,70",[48,71],0,-5)],
  },
  "paladino": {
    largura:1254, altura:1254, olha:"esquerda", cabeca:cabeca("21,3 77,3 77,43 57,51 36,49 21,39",[49,48]),
    olhos:[olho(38.3,29,2.3,2.5),olho(44.2,32.3,2.5,2.6)],
    partes:[parte("espada","0,31 21,31 30,47 43,53 43,64 33,70 16,62 0,47",[42,56],28),parte("escudo","59,31 100,31 100,83 73,87 58,66",[61,57],-13)],
  },
  "domador-v2": {
    largura:1536, altura:1024, olha:"direita", cabeca:cabeca("5,47 32,47 34,75 29,83 15,83 5,74",[24,81]),
    olhos:[olho(20.3,69.3,2.4,4.3),olho(25.1,63.7,1.6,3.4)],
    partes:[parte("petisco","29,48 41,48 40,66 32,78 29,80 26,74 32,62",[29,77],-23),parte("carinho","11,79 20,79 22,85 17,91 10,91 8,85",[19,83],18)],
  },
};

/** Espelha conforme o olhar original, para ambos os lados apontarem ao centro. */
export function deveEspelhar(arte: string, lado: "a" | "b") {
  const olha = BATTLE_RIGS[arte]?.olha ?? "esquerda";
  return olha !== (lado === "a" ? "direita" : "esquerda");
}
