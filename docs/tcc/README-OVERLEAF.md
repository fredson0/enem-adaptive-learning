# TCC ENEM+ — Como compilar no Overleaf

## O erro que você teve

`Environment resumo undefined` significa que o LaTeX **não encontrou o pacote SBC** (`sbc-template.sty`).

Isso acontece quando você cola só o texto (arquivo `TCC-OVERLEAF-ATUALIZACOES.tex`) **sem** o preâmbulo `\documentclass` + `\usepackage{sbc-template}`.

## Passo a passo (faça exatamente assim)

### 1. Crie um projeto novo no Overleaf
Use o template **"Modelo SBC"** OU faça upload manual dos arquivos abaixo.

### 2. Faça upload destes arquivos na **raiz** do projeto

| Arquivo | Obrigatório |
|---------|-------------|
| `main.tex` | Sim — arquivo principal |
| `sbc-template.sty` | Sim — define `resumo`, `abstract`, `\inst`, `\email` |
| `sbc.bst` | Sim — estilo da bibliografia |
| `sbc-template.bib` | Sim — referências |

### 3. Defina o documento principal
No Overleaf: **Menu** → **Main document** → selecione **`main.tex`**.

### 4. Compile
O `main.tex` já está com `\usepackage[draft]{graphicx}` — compila **sem imagens** (caixas cinzas no lugar).

Quando tiver as figuras, troque no `main.tex`:
```latex
\usepackage[draft]{graphicx}
```
por:
```latex
\usepackage{graphicx}
```

### 5. Pasta de imagens
Crie a pasta `figuras/` no Overleaf e adicione os PNGs conforme a tabela abaixo.

---

## Imagens necessárias (`figuras/`)

| Arquivo | Seção |
|---------|-------|
| `arquitetura.png` | Metodologia — arquitetura hexagonal |
| `mapa-telas.png` | Metodologia — mapa de telas |
| `ui-simulados.png` | Metodologia — hub de simulados |
| `ui-trilha.png` | Metodologia — trilha personalizada |
| `fluxograma_processo_ia.png` | Metodologia — fluxo do tutor IA |
| `ui-tutor.png` | Metodologia — interface do tutor |
| `ui-landing.png` | Metodologia — página inicial |
| `ui-progresso.png` | Metodologia — painel de progresso |
| `modelo-er.png` | Metodologia — diagrama ER (Prisma) |

---

## NÃO use como main

- `TCC-OVERLEAF-ATUALIZACOES.tex` — são **fragmentos** para colar manualmente, não compila sozinho.

## Use como main

- `main.tex` ou `TCC-COMPLETO-SBC.tex` (são iguais após a correção).
