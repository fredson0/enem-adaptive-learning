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

- [ ] **B1** Prompts por área ENEM (Matemática, Linguagens, Humanas, Natureza)
- [ ] **B2** Passar contexto completo na **dica** (nível, área, disciplina)
- [ ] **B3** **Explicar erro** com disciplina + link à trilha/lacuna
- [ ] **B4** Classificador de intenção no chat (regex → endpoint certo)
- [ ] **B5** Bridge chat → `POST /simulados/gerar-com-ia`
- [ ] **B6** `GET /metricas/frequencia-temas` + injeção no chat (“o que mais cai?”)
- [ ] **B7** JSON estruturado (trilha, PDF, simulado IA) — sem regex frágil
- [ ] **B8** Prompt dedicado para **vision** (foto de questão)
- [ ] **B9** Modelo maior só para exatas (Matemática/Natureza) no router
- [ ] **B10** RAG suporte produto (como funciona simulado, trilha, etc.)

---

## C. Qualidade e dados

- [ ] **C1** Campo `assuntoId` nas questões (opcional, melhora matching)
- [ ] **C2** Atualizar docs `TUTOR-IA-PERGUNTAS-E-ENDPOINTS.md`
- [ ] **C3** Testes unitários cobertura + agregarPorArea
