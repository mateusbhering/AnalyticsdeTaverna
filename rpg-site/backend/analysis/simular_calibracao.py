"""Simulação de calibração — modelo nulo (respostas aleatórias).

Reproduz, de forma auditável e re-executável, a metodologia que o README
descreve ter sido feita "por simulação contra o banco real" na calibração
original das classes (300 mil partidas) — mas usando o motor de classificação
DE VERDADE (`app.domain.personagem.classificar`), não uma reimplementação
paralela que pode divergir dele.

O QUE ISSO SIMULA: um jogador que responde ao quiz clicando em opções
aleatórias, sem nenhuma intenção — o "modelo nulo" contra o qual comparamos o
comportamento real das pessoas em `validar_classes.py`. Se a distribuição de
classes observada na produção bater com este modelo nulo, o quiz não estaria
medindo nada — as respostas das pessoas seriam estatisticamente
indistinguíveis de cliques aleatórios.

COMO RODAR:
    cd rpg-site/backend
    python -m analysis.simular_calibracao [--n 300000] [--seed 42]

Grava `analysis/simulacao_resultado.json` com a distribuição de classes do
modelo nulo — é esse arquivo que `validar_classes.py` usa como `f_exp` do
qui-quadrado.

QUANDO REGERAR: se o banco de perguntas (`questions-data.ts`) ou as regras de
classificação (`domain/personagem.py`) mudarem, gere `questions_fixture.json`
de novo (ver `analysis/README.md`) e rode este script de novo — senão a
simulação valida uma versão do quiz que já não existe.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from collections import Counter
from pathlib import Path

# Mesma proteção de `validar_classes.py`: garante UTF-8 mesmo quando a saída
# é redirecionada num console Windows em cp1252.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

from app.domain.personagem import DIMENSOES, classificar

QUIZ_SIZE = 5  # espelha QUIZ_SIZE em src/components/QuizForm.tsx

AQUI = Path(__file__).parent
FIXTURE = AQUI / "questions_fixture.json"
SAIDA = AQUI / "simulacao_resultado.json"


def carregar_perguntas() -> list[dict]:
    with open(FIXTURE, encoding="utf-8") as f:
        return json.load(f)


def simular_uma_partida(perguntas: list[dict], rng: random.Random) -> dict:
    """Uma "partida" de respostas uniformemente aleatórias — o modelo nulo.

    Espelha exatamente `pickRandom` + o acúmulo de `handleAnswer` em
    `QuizForm.tsx`: sorteia QUIZ_SIZE perguntas distintas, e para cada uma
    escolhe uma das opções com igual probabilidade (não é assim que uma
    pessoa responde de verdade — é o padrão nulo com que comparamos).
    """
    dims = {d: 0 for d in DIMENSOES}
    tags: list[str] = []

    for pergunta in rng.sample(perguntas, QUIZ_SIZE):
        opcao = rng.choice(pergunta["options"])
        if opcao["dimMain"]:
            dims[opcao["dimMain"]] += 2
        if opcao["dimSec"]:
            dims[opcao["dimSec"]] = max(0, dims[opcao["dimSec"]] + opcao["pesoSec"])
        if opcao["tag"]:
            tags.append(opcao["tag"])

    return classificar(dims, tags)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--n", type=int, default=300_000, help="partidas simuladas")
    parser.add_argument("--seed", type=int, default=42, help="semente do RNG (reprodutibilidade)")
    args = parser.parse_args()

    perguntas = carregar_perguntas()
    rng = random.Random(args.seed)

    contagem_classe: Counter[str] = Counter()
    contagem_origem: Counter[str] = Counter()

    for _ in range(args.n):
        resultado = simular_uma_partida(perguntas, rng)
        contagem_classe[resultado["classe"]] += 1
        contagem_origem[resultado["origem"]] += 1

    total = args.n
    distribuicao = {
        classe: {"contagem": n, "percentual": round(n / total * 100, 3)}
        for classe, n in sorted(contagem_classe.items(), key=lambda kv: -kv[1])
    }

    resultado = {
        "n_simulacoes": total,
        "seed": args.seed,
        "distribuicao_classes": distribuicao,
        "percentual_por_regra": round(contagem_origem["regra"] / total * 100, 2),
        "percentual_por_dimensao_dominante": round(
            contagem_origem["dimensao_dominante"] / total * 100, 2
        ),
    }

    SAIDA.write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")

    # Sanidade rápida contra o que o README documenta da calibração original
    # (73% por regra, cada regra entre 2,4% e 7,7%) — não precisa bater exato
    # (banco/seed diferentes), só ficar na vizinhança.
    print(f"{total:,} partidas simuladas (seed={args.seed})".replace(",", "."))
    print(f"Classificado por regra: {resultado['percentual_por_regra']}% "
          f"(README documenta ~73% na calibração original)")
    print(f"Por dimensão dominante (fallback): {resultado['percentual_por_dimensao_dominante']}%")
    print(f"\nTop 5 classes na simulação nula:")
    for classe, dado in list(distribuicao.items())[:5]:
        print(f"  {classe:<28} {dado['percentual']:>5.2f}%  (n={dado['contagem']})")
    print(f"\nSalvo em {SAIDA.relative_to(AQUI.parent)}")


if __name__ == "__main__":
    main()
