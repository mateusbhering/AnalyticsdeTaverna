# Validação estatística da calibração de classes

Ferramentas pra responder uma pergunta concreta: **a distribuição de classes
que está saindo do quiz em produção é estatisticamente diferente do que
respostas aleatórias dariam?** Se não for, o quiz não estaria medindo nada.

Isto fica fora de `app/` de propósito — não é código da API, é uma ferramenta
de análise que alguém roda manualmente quando quiser revalidar a calibração
(depois de mudar o banco de perguntas, ou periodicamente conforme mais gente
joga).

## Metodologia

1. **`simular_calibracao.py`** — Monte Carlo com respostas uniformemente
   aleatórias, usando o motor de classificação DE VERDADE
   (`app.domain.personagem.classificar`), não uma reimplementação à parte.
   Isso reproduz a mesma metodologia que o `README.md` do projeto diz ter
   sido usada na calibração original ("simulação contra o banco real, 300 mil
   partidas") — mas de um jeito que dá pra rodar de novo e conferir.
   Gera `simulacao_resultado.json`: a distribuição de classes que vem de
   clicar aleatoriamente nas 5 perguntas do quiz.

2. **`validar_classes.py`** — busca os jogadores reais (Supabase de
   produção) e roda um **teste qui-quadrado de aderência** comparando a
   distribuição observada com a simulada. p baixo (< α) = a distribuição
   real difere da aleatória → o quiz está capturando sinal, não ruído.

## Rodar

```bash
cd rpg-site/backend
pip install -r requirements-analysis.txt   # traz scipy, não entra no deploy da API
python -m analysis.simular_calibracao      # gera simulacao_resultado.json
python -m analysis.validar_classes         # compara com o Supabase de produção
```

Sem tocar no banco real, pra testar o script:

```bash
python -m analysis.validar_classes --fonte memoria
```

## Checagem de sanidade já feita

Rodando `simular_calibracao.py --n 300000 --seed 42`: **73,4%** dos
personagens simulados foram classificados por regra — o `README.md` do
projeto documenta que a calibração original obteve **~73%**. A proximidade
(0,4 ponto percentual) é evidência de que a simulação aqui reproduz fielmente
a metodologia original, mesmo sem ter o script original que gerou aquele
número.

## `questions_fixture.json`

Cópia do banco de 120 perguntas (`src/components/questions-data.ts`), em
JSON, pra este script Python conseguir ler sem precisar de um runtime
JS/TypeScript. **Se o banco de perguntas mudar, este arquivo fica
desatualizado** — regenere com:

```bash
cd rpg-site
npx tsx -e '
import { ALL_QUESTIONS } from "./src/components/questions-data";
import { writeFileSync } from "node:fs";
writeFileSync("backend/analysis/questions_fixture.json", JSON.stringify(ALL_QUESTIONS, null, 2));
'
```

(precisa de `tsx` — `npm install -D tsx` se ainda não tiver)

## Limitações, sem enfeite

- **Amostra pequena ainda derruba a confiança do teste.** Com poucos
  jogadores reais, `validar_classes.py` avisa quando alguma classe tem
  contagem esperada abaixo de 5 (regra prática de Cochran) — o resultado
  continua saindo, mas leia como indicativo até o banco crescer.
- **Isto testa se a distribuição é diferente de aleatória, não se as 10
  dimensões medem o que dizem medir.** Validade de construto (o quiz mede
  liderança de verdade, ou só uma proxy?) é uma pergunta diferente, que este
  teste não responde.
- **`questions_fixture.json` e `simulacao_resultado.json` regenerar juntos.**
  Rodar `validar_classes.py` contra uma simulação de um banco de perguntas
  antigo invalida a comparação silenciosamente — não há checagem automática
  disso ainda.
