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

---

## F. Onda 4 — LaTeX, segurança e polish

### 4a — LaTeX nos simulados

- [x] **F1** Componente `EnunciadoRichText` com KaTeX (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`)
- [x] **F2** Enunciado em `/simulados/[id]` e modal de revisão de erros

### 4b — Segurança (API + web)

- [x] **F3** `JwtAuthGuard` global (`APP_GUARD`) + decorator `@Public()` em health/auth/depoimentos públicos
- [x] **F4** Escopo tutor endurecido — deny-by-default + bloqueio exfiltração/jailbreak (0 tokens)
- [x] **F5** Prompt anti-leak no system prompt do tutor
- [x] **F6** Cron diário limpeza `idempotency_keys` e `refresh_tokens` expirados
- [x] **F7** CSP + headers de segurança no `next.config.ts`
- [x] **F8** Proxy Next deny-by-default (todas rotas exceto marketing/login exigem cookie)
- [x] **F9** Testes E2E segurança ampliados (401 global, depoimentos públicos)

### 4c — Polish mobile (pendente)

- [ ] **F10** Ajustes finos de layout mobile em trilha/simulados/tutor

### Produção (por último)

- [ ] **F11** S3 anexos tutor
- [ ] **F12** Mercado Pago + webhooks
- [ ] **F13** Deploy Railway/Vercel produção
