# Trilha personalizada — visão e roadmap

## Problema atual

A `/trilha` hoje é um **ranking genérico** das 3 piores áreas ENEM, baseado só em `% de acerto` após simulados. Não há:

- Diagnóstico inicial (conhecimento + deficiências declaradas pelo aluno)
- Trilha por **modalidade/área** do ENEM com etapas sequenciais
- Persistência de progresso na trilha
- Personalidade visual (parece “dashboard de IA”)

## Visão

> Cada aluno responde um **diagnóstico curto** (autoavaliação por área + disciplinas fracas + meta).
> O sistema cruza isso com **proficiência real** (simulados) e monta uma **trilha objetiva** por área ENEM, com etapas acionáveis.

### Ciclo pedagógico

```
Diagnóstico → Trilha por área → Simulado focado → Revisão de erros → Tutor → Cronômetro
     ↑___________________________________________________________________|
```

### Áreas ENEM (4 modalidades de prova)

| Área | Slug | Exemplos de disciplinas na trilha |
|------|------|-----------------------------------|
| Linguagens | `linguagens` | Interpretação, Literatura, Gramática |
| Humanas | `humanas` | História, Geografia, Sociologia, Filosofia |
| Natureza | `natureza` | Física, Química, Biologia |
| Matemática | `matematica` | Funções, Geometria, Probabilidade |

### Algoritmo de prioridade (v1 — regras)

Para cada área:

```
prioridade = 0.45 × (100 - autoAvaliacao×20) + 0.55 × (100 - proficienciaReal)
```

- `autoAvaliacao`: 1 (muito fraco) a 5 (confiante) — do diagnóstico
- `proficienciaReal`: `%` em `proficiencias_area` (0 se nunca praticou)
- Sem simulados: usa só autoavaliação
- Ordena áreas por prioridade **decrescente** (maior número = mais urgente)

### Etapas por área (template)

| # | Etapa | Ação |
|---|--------|------|
| 1 | Entender a lacuna | Ler foco sugerido + disciplinas fracas |
| 2 | Treino guiado | Simulado treino 5q na área |
| 3 | Simulado focado | Modalidade 10q na área |
| 4 | Revisar erros | Resultado do último simulado da área |
| 5 | Tirar dúvida | Tutor com pergunta contextualizada |
| 6 | Prova simulada | Cronometrado 10q (quando score > 50%) |

Etapas 1–4 são exibidas na Fase 1; 5–6 na Fase 2.

---

## Referências UI/UX (Osmo Vault)

Inspirações para fugir do “design genérico de IA”:

| Referência | Aplicar na trilha |
|------------|-------------------|
| **Vault hero** | Título grande + busca/filtro por área |
| **Cards com gradiente** | Card destaque da área #1 prioridade |
| **3D / hover** | Hover sutil nos cards de etapa |
| **Documentação lateral** | Sidebar com meta semanal + tempo diário |
| **Course progress arc** | Anel de progresso por área |
| **Handwritten accent** | Detalhe `#b0ff57` (“Sua trilha”) |

Paleta: fundo `#111` / cards `#161616`, acento `#b0ff57`, tipografia bold no hero.

---

## API (Fase 1)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/metricas/trilha` | Trilha completa: áreas ordenadas + etapas + flags |
| `POST` | `/metricas/trilha/diagnostico` | Salva autoavaliação e disciplinas fracas |
| `GET` | `/metricas/lacunas` | Mantido (compatibilidade) |

### `trilha_estado` (JSON em `perfis_aluno`)

```json
{
  "diagnostico": {
    "completo": true,
    "concluidoEm": "2026-08-11T...",
    "autoAvaliacao": { "matematica": 2, "linguagens": 4, "humanas": 3, "natureza": 2 },
    "disciplinasFracas": ["Física", "Funções", "Interpretação de texto"],
    "metaEnem": "Medicina"
  },
  "etapasConcluidas": ["treino-matematica"]
}
```

---

## Fases de implementação

### Fase A — Diagnóstico + trilha estruturada ✅ (esta entrega)

- [x] Migration `trilha_estado`
- [x] `GET /metricas/trilha` + `POST /metricas/trilha/diagnostico`
- [x] Wizard `/trilha/diagnostico`
- [x] UI `/trilha` redesenhada com etapas por área

### Fase B — Dados reais + disciplinas

- [x] Agregar lacunas por `questoes.disciplina`
- [x] Marcar etapas concluídas automaticamente ao finalizar simulado (treino/modalidade/cronometrado + revisão se houver erros)
- [x] `/trilha/[area]` — visão detalhada de uma área

### Fase C — Polish Osmo + IA

- [x] Animações (hover 3D leve, scroll horizontal de áreas)
- [x] Plano semanal gerado por IA (opcional, 1 token) — card em `/trilha/geral` e `/progresso/foco`; aviso quando a área prioritária mudar
- [x] Radar chart em `/progresso`
- [x] Seção `#trilha` na landing

---

## Testes manuais

1. Usuário novo → `/trilha` redireciona para diagnóstico
2. Completa diagnóstico → vê 4 áreas ordenadas por prioridade
3. Cada área tem etapas com links (simulado, tutor, resultado)
4. Após simulado, proficiência real altera ordem na próxima visita
5. `GET /metricas/lacunas` continua funcionando para tutor/resultado
