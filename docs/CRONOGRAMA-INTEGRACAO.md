# Cronograma Integração — ENEM+ (E2E)

> Cada checkpoint = **demo gravável** para o TCC. Backend + frontend + env vars alinhados.

---

## Checkpoints (ordem obrigatória)

| # | Nome | Quando | O que provar |
|---|------|--------|--------------|
| **E0** | Login E2E | Sprint S0 | Google → cookies → perfil → `/tutor` |
| **E1** | Questões | Sprint S1 | Seed rodou; API lista questões |
| **E2** | Simulado E2E | Sprint S2 | Criar → responder 3+ → resultado |
| **E3** | Tutor E2E | Sprint S3 | Pergunta → resposta Gemini; explicar erro |
| **E4** | Métricas E2E | Sprint S4 | Simulado atualiza progresso/trilha |
| **E5** | Planos E2E | Sprint S5 | Badge tokens; upgrade (sandbox MP) |
| **E6** | Produção | Sprint S6 | Railway + Vercel estáveis |

---

## E0 — Login E2E ✅ (concluído em 04/08/2026)

### Pré-requisitos

| Serviço | Variável / porta |
|---------|------------------|
| API local | `PORT=3333`, `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGIN=http://localhost:3001` |
| Web local | `NEXT_PUBLIC_API_URL=http://localhost:3333`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| PostgreSQL (Docker) | **porta host `5433`** → container `5432` (`docker compose up -d`) |
| Google Cloud | OAuth Client ID (Web) com `http://localhost:3001` autorizado |

**`DATABASE_URL` local (Docker):**

```env
DATABASE_URL=postgresql://enem:enem_dev_password@localhost:5433/enem_adaptive
```

### Fluxo de teste

```
1. docker compose up -d
2. npm run prisma:migrate:deploy -w apps/api
3. npm run dev:api   (raiz ou apps/api)
4. npm run dev:web
5. Abrir http://localhost:3001/login
6. Entrar com Google
7. /onboarding → nome, curso, ano escolar, tipo de ensino médio
8. Redirecionar /tutor
9. DevTools → GET /usuarios/perfil com Bearer → 200
```

### Critério de sucesso

- [x] Token persiste após refresh
- [x] `/tutor` sem token → redirect `/login`
- [x] Sidebar mostra nome do usuário (não mock)
- [x] `/perfil` com dados reais da API
- [x] Onboarding com ano escolar + tipo de ensino médio (público/privado/misto)

---

## E1 — Questões ✅ (concluído em 05/08/2026)

```bash
npm run prisma:seed -w apps/api
# via BFF autenticado:
curl -H "Authorization: Bearer <token>" http://localhost:3333/questoes?area=matematica&limit=5
→ questões com alternativas e gabarito (catálogo)
```

---

## E2 — Simulado E2E ✅ (concluído em 05/08/2026)

```
/login → /simulados/novo → Matemática, 10 questões
→ responder todas → resultado com score e lista de erros
→ "Explicar com IA" (botão placeholder — E3)
```

### Critério de sucesso

- [x] Seed popula banco local (`prisma/seed-enem.ts`)
- [x] `GET /questoes` com filtros
- [x] Criar simulado via UI
- [x] Responder questões com feedback imediato
- [x] Resultado com acertos/erros e gabarito
- [ ] "Explicar com IA" funcional (E3)

---

## E3 — Tutor E2E

```
/tutor → "Me explica função do 2º grau" → resposta da IA
Sidebar lista conversa nova
Tokens: 9/10 após 1 mensagem (plano gratuito)
```

---

## E4 — Métricas E2E

```
Após simulado com erros em Natureza:
/progresso → Natureza < outras áreas
/trilha → Natureza no top 3
```

---

## E5 — Planos E2E

```
/planos → sandbox Mercado Pago → webhook → plano APOIO
PlanBadge → 30/200 IA (ou limite configurado)
```

---

## Matriz sincronização (semanal)

| Semana | Backend | Frontend | Integração |
|--------|---------|----------|------------|
| 1 | S0 Auth ✅ | S0 Login ✅ | **E0** ✅ |
| 2 | S1 Seed questões ✅ | S1 Novo simulado ✅ | **E1** ✅ |
| 3 | S2 Simulados API ✅ | S2 Fluxo simulado ✅ | **E2** ✅ |
| 4 | S3 Tutor | S3 Chat | **E3** |
| 5 | S4 Métricas | S4 Dashboard | **E4** |
| 6 | S5 Planos | S5 Checkout | **E5** |
| 7–8 | S6 Hardening | S6 Polish | **E6** |

---

## Ambiente

| Ambiente | API | Web | DB |
|----------|-----|-----|-----|
| Dev | localhost:3333 | localhost:3001 | Docker Postgres **localhost:5433** ou Railway |
| Prod | Railway | Vercel | Railway Postgres |

---

## Quando algo quebra na integração

1. Network tab → status + body do erro
2. API logs → correlation (futuro)
3. **Não** mudar contrato da API sem atualizar `lib/api.ts`
4. Fix no menor lado (geralmente falta header `Authorization`)
