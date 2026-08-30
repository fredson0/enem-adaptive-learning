# Roadmap — IA inteligente + cobertura de questões

## Legenda
- [x] Concluído
- [ ] Pendente

---

## A. Cobertura de questões (gamificação / progresso real)

- [x] **A1** Contar questões dominadas de forma única (acertou 1x = conta; repetir não soma)
- [x] **A2** Score por área = dominadas ÷ total no banco (não taxa de acerto em tentativas)
- [x] **A3** Endpoint `GET /metricas/cobertura` (áreas, assuntos, anos)
- [x] **A4** UI Progresso — exibir `X/Y dominadas` em Por área
- [x] **A5** UI Trilha — % nos cards de assunto vindo da cobertura real
- [x] **A6** Badge / incentivo “Provas ENEM” — grid de anos com % cobertura
- [x] **A7** Simulado — opção `priorizarNaoDominadas` (questões ainda não acertadas)

---

## B. Tutor IA — inteligência por tipo de pergunta

- [x] **B1** Prompts por área ENEM (Matemática, Linguagens, Humanas, Natureza)
- [x] **B2** Passar contexto completo na **dica** (nível, área, disciplina)
- [x] **B3** **Explicar erro** com disciplina + link à trilha/lacuna
- [x] **B4** Classificador de intenção no chat (regex → endpoint certo)
- [x] **B5** Bridge chat → `POST /simulados/gerar-com-ia`
- [x] **B6** `GET /metricas/frequencia-temas` + injeção no chat (“o que mais cai?”)
- [x] **B7** JSON estruturado (trilha, PDF, simulado IA) — sem regex frágil
- [x] **B8** Prompt dedicado para **vision** (foto de questão)
- [x] **B9** Modelo maior só para exatas (Matemática/Natureza) no router
- [x] **B10** RAG suporte produto (como funciona simulado, trilha, etc.)
- [x] **B11** Guardrail de escopo — só ENEM; recusa programação e off-topic (sem gastar token)

---

## D. Onda 2 — Tutor contextual (sem gastar tokens)

- [x] **D1** Intenção `minhas_lacunas` → resposta com `GET /metricas/lacunas` (0 tokens IA)
- [x] **D2** Intenção `meu_progresso` → resumo com proficiência real (0 tokens IA)
- [x] **D3** Chips de sugestão personalizados no `/tutor` (lacunas + treino focado)
- [x] **D4** Streaming de respostas no chat (SSE `/ia-tutor/mensagens/stream`)
- [x] **D5** Injetar cobertura por assunto no prompt do tutor
- [x] **D6** Intenção `minha_cobertura` → resposta com dados reais (0 tokens IA)

---

## E. Onda 3 — Trilha Fase B (lacunas por disciplina)

- [x] **E1** Agregar lacunas por `questoes.disciplina` a partir das respostas dos simulados
- [x] **E2** `GET /metricas/lacunas` expõe `disciplinas[]` com erros e taxa de erro
- [x] **E3** `GET /metricas/trilha` cruza lacunas reais com `disciplinasSugeridas` por área
- [x] **E4** UI `/trilha/[area]` lista lacunas por disciplina detectadas
- [x] **E5** Tutor: resposta `minhas_lacunas` inclui disciplinas; chip focado no tutor

---

## C. Qualidade e dados

- [x] **C1** Campo `assuntoId` nas questões (opcional, melhora matching)
- [x] **C2** Atualizar docs `TUTOR-IA-PERGUNTAS-E-ENDPOINTS.md`
- [x] **C3** Testes unitários cobertura + agregarPorArea
