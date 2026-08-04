# Cronograma Backend — ENEM+ (vibe coding)

> Estratégia: **endpoint funcionando primeiro**, hexagonal onde já existe, sem over-engineering.  
> Ritmo: **1 sprint = ~1 semana** (10–15h com IA). Cada sprint tem **1 entregável testável**.

**Baseline:** Prisma F1 pronto, `LoginGoogleUseCase` escrito, adapters/controllers vazios.

---

## Visão das sprints

| Sprint | Foco | Entregável | Estimativa |
|--------|------|------------|------------|
| **S0** | Auth + perfil | `POST /usuarios/login-google`, `GET/PATCH /usuarios/perfil` + JWT | 3–5 dias |
| **S1** | Questões | Seed enem.dev + `GET /questoes` | 3–5 dias |
| **S2** | Simulados | Gerar, responder, finalizar, listar | 5–7 dias |
| **S3** | Tutor IA | Conversas, mensagens, Gemini, rate limit | 5–7 dias |
| **S4** | Métricas | Proficiência + lacunas pós-simulado | 3–4 dias |
| **S5** | Planos | Tokens + Mercado Pago webhook (mínimo) | 3–5 dias |
| **S6** | Hardening | Swagger, health, testes críticos | 3–5 dias |

---

## S0 — Auth ✅ (concluído)

| # | Tarefa | Prioridade | Status |
|---|--------|------------|--------|
| 0.1 | `GoogleOAuthService` (verificar idToken) | 🔴 | ✅ |
| 0.2 | `JwtAuthTokenService` | 🔴 | ✅ |
| 0.3 | `UsuariosController` login + perfil | 🔴 | ✅ |
| 0.4 | `JwtAuthGuard` + `@CurrentUser()` | 🔴 | ✅ |
| 0.5 | CORS + ValidationPipe no `main.ts` | 🔴 | ✅ |
| 0.6 | Migration deploy (local Docker porta **5433**) | 🟡 | ✅ |
| 0.7 | Campos perfil: `serieEscolar`, `tipoEnsinoMedio` | 🟡 | ✅ |
| 0.8 | `start:dev` com `tsx` + `@Inject` explícito (DI) | 🟡 | ✅ |

**Teste manual:** Login Google → JWT → `GET /usuarios/perfil` → onboarding → `/tutor`.

---

## S1 — Questões (banco ENEM)

| # | Tarefa |
|---|--------|
| 1.1 | Migration: tabela `questoes` |
| 1.2 | Script `prisma/seed-enem.ts` (api.enem.dev, anos 2009–2023) |
| 1.3 | `GET /questoes?area=&ano=&limit=&offset=` |
| 1.4 | Mapear `discipline` → área ENEM (5 áreas) |

**Não fazer agora:** buscar enem.dev em tempo real no simulado.

---

## S2 — Simulados

| # | Tarefa |
|---|--------|
| 2.1 | Migration: `simulados`, `respostas_simulado`, `simulado_questoes` |
| 2.2 | `POST /simulados` — N questões aleatórias por área |
| 2.3 | `GET /simulados` — histórico do aluno |
| 2.4 | `GET /simulados/:id` — questão atual + progresso |
| 2.5 | `POST /simulados/:id/respostas` — idempotente |
| 2.6 | `POST /simulados/:id/finalizar` — score + erros |

**Algoritmo v1:** aleatório por filtro. Adaptativo = pós-TCC.

---

## S3 — Tutor IA

| # | Tarefa |
|---|--------|
| 3.1 | Migration: `conversas`, `mensagens` |
| 3.2 | `GeminiIaAdapter` (texto) |
| 3.3 | `POST /ia-tutor/conversas`, `GET`, `POST .../mensagens` |
| 3.4 | `POST /ia-tutor/explicar-erro` (contexto questão) |
| 3.5 | Contador `uso_tokens_ia` (sem Redis no dev) |
| 3.6 | (Opcional S3) presign R2 + vision |

---

## S4 — Métricas

| # | Tarefa |
|---|--------|
| 4.1 | Recalcular `proficiencias_area` ao finalizar simulado |
| 4.2 | `GET /metricas/proficiencia` |
| 4.3 | `GET /metricas/lacunas` (top 3 áreas/tópicos fracos) |

---

## S5 — Planos

| # | Tarefa |
|---|--------|
| 5.1 | `GET /usuarios/plano` (tokens restantes) |
| 5.2 | Webhook Mercado Pago → `APOIO` |
| 5.3 | Ajustar `tokensDiarios` por plano |

---

## S6 — Hardening

| # | Tarefa |
|---|--------|
| 6.1 | `GET /health` |
| 6.2 | Swagger |
| 6.3 | Testes: login, gerar simulado, enviar resposta |

---

## Regras vibe coding

1. **Um endpoint por sessão** — commit quando passar no Postman.
2. **Não refatorar** hexagonal no meio do sprint; só quando doer.
3. **Seed > API externa** em runtime.
4. **Redis opcional** até S3 rate limit em produção.

---

## Referências

- [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md)
- [CRONOGRAMA-INTEGRACAO.md](./CRONOGRAMA-INTEGRACAO.md)
- API questões: https://api.enem.dev/v1
