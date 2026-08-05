# Cronograma Frontend — ENEM+ (vibe coding)

> Estratégia: **UI já existe (OSMO)** — foco em **telas que faltam** e **trocar mock por API**.  
> Ritmo: alinhado ao backend; pode mockar até o checkpoint de integração.

**Baseline:** Landing + workspace shell + páginas com `workspace-mock.ts`.

---

## Visão das sprints

| Sprint | Foco | Entregável |
|--------|------|------------|
| **S0** | Auth | Login Google → onboarding → `/tutor` protegido | ✅ |
| **S1** | Simulados (criar) | `/simulados/novo` + formulário | ✅ |
| **S2** | Simulados (fluxo) | Questão → resultado → histórico real | ✅ |
| **S3** | Tutor | Chat real + sidebar de conversas |
| **S4** | Métricas | Progresso + trilha com API |
| **S5** | Planos + perfil | Checkout + editar perfil |
| **S6** | Polish | Loading, erros, mobile |

---

## S0 — Auth ✅ (concluído)

| # | Tarefa | Arquivo | Status |
|---|--------|---------|--------|
| 0.1 | Cliente API (BFF + cookies HttpOnly) | `lib/api.ts` | ✅ |
| 0.2 | Cookies HttpOnly (sem localStorage) | `lib/auth.ts`, `lib/auth-server.ts` | ✅ |
| 0.3 | Tela login Google | `app/login/page.tsx` | ✅ |
| 0.4 | Onboarding (nome, curso, ano escolar, ensino médio) | `app/onboarding/page.tsx` | ✅ |
| 0.5 | Proxy protege `(workspace)/*` | `proxy.ts` | ✅ |
| 0.6 | Landing CTA → `/login` | `app/page.tsx` | ✅ |
| 0.7 | Perfil real na sidebar | `workspace-sidebar.tsx` | ✅ |
| 0.8 | Página `/perfil` com dados da API | `app/(workspace)/perfil/page.tsx` | ✅ |
| 0.9 | Guard de onboarding incompleto | `onboarding-guard.tsx` | ✅ |

---

## S1 — Novo simulado ✅ (concluído)

| # | Tarefa | Status |
|---|--------|--------|
| 1.1 | `/simulados/novo` — select área, qtd (5/10/20), ano opcional | ✅ |
| 1.2 | Submit → `POST /simulados` → redirect `/simulados/[id]` | ✅ |
| 1.3 | Loading + erro | ✅ |

---

## S2 — Fluxo simulado ✅ (concluído)

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | `/simulados/[id]` — enunciado, A–E, próxima | ✅ |
| 2.2 | Barra de progresso (N/total) | ✅ |
| 2.3 | Finalizar → `/simulados/[id]/resultado` | ✅ |
| 2.4 | Resultado: score + lista erros (CTA IA → S3) | ✅ |
| 2.5 | `/simulados` — lista da API (substituir mock) | ✅ |

---

## S3 — Tutor IA

| # | Tarefa |
|---|--------|
| 3.1 | Chat com mensagens reais (user/assistant) |
| 3.2 | Sidebar: `GET /ia-tutor/conversas` |
| 3.3 | Nova conversa / continuar `[chatId]` |
| 3.4 | Upload imagem (presign) — se backend S3 pronto |
| 3.5 | `PlanBadge` com tokens da API |

---

## S4 — Dashboard

| # | Tarefa |
|---|--------|
| 4.1 | `/progresso` — barras da API |
| 4.2 | `/trilha` — lacunas + CTA simulado focado |

---

## S5 — Conta

| # | Tarefa |
|---|--------|
| 5.1 | `/perfil` — editar + logout |
| 5.2 | `/planos` — checkout Mercado Pago |

---

## S6 — Polish

| # | Tarefa |
|---|--------|
| 6.1 | Skeletons / toasts de erro |
| 6.2 | Responsivo sidebar (drawer mobile) |
| 6.3 | Remover `workspace-mock.ts` |

---

## Páginas — o que cada uma mostra (escopo fechado)

| Rota | Conteúdo mínimo |
|------|-----------------|
| `/tutor` | Chat vazio + input |
| `/tutor/[id]` | Histórico + input |
| `/simulados` | Cards histórico |
| `/simulados/novo` | Form 3 campos |
| `/simulados/[id]` | 1 questão por vez |
| `/simulados/[id]/resultado` | Nota + erros + CTA IA |
| `/progresso` | 5 barras % |
| `/trilha` | 3 lacunas + botão |
| `/perfil` | Dados + editar |
| `/planos` | 2 planos |

---

## Referências

- [WORKSPACE-UI-OSMO.md](./WORKSPACE-UI-OSMO.md)
- [CRONOGRAMA-INTEGRACAO.md](./CRONOGRAMA-INTEGRACAO.md)
