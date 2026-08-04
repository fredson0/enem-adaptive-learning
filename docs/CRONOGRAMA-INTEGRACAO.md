# Cronograma Integração — ENEM+ (E2E)

> Cada checkpoint = **demo gravável** para o TCC. Backend + frontend + env vars alinhados.

---

## Checkpoints (ordem obrigatória)

| # | Nome | Quando | O que provar |
|---|------|--------|--------------|
| **E0** | Login E2E | Sprint S0 | Google → JWT → perfil → `/tutor` |
| **E1** | Questões | Sprint S1 | Seed rodou; API lista questões |
| **E2** | Simulado E2E | Sprint S2 | Criar → responder 3+ → resultado |
| **E3** | Tutor E2E | Sprint S3 | Pergunta → resposta Gemini; explicar erro |
| **E4** | Métricas E2E | Sprint S4 | Simulado atualiza progresso/trilha |
| **E5** | Planos E2E | Sprint S5 | Badge tokens; upgrade (sandbox MP) |
| **E6** | Produção | Sprint S6 | Railway + Vercel estáveis |

---

## E0 — Login E2E (AGORA)

### Pré-requisitos

| Serviço | Variável |
|---------|----------|
| API local | `PORT=3333`, `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` |
| Web local | `NEXT_PUBLIC_API_URL=http://localhost:3333`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| Google Cloud | OAuth Client ID (Web) com `http://localhost:3001` autorizado |

### Fluxo de teste

```
1. npm run dev:api   (raiz ou apps/api)
2. npm run dev:web
3. Abrir http://localhost:3001/login
4. Entrar com Google
5. Se novo usuário → /onboarding → salvar
6. Redirecionar /tutor
7. DevTools → GET /usuarios/perfil com Bearer → 200
```

### Critério de sucesso

- [ ] Token persiste após refresh
- [ ] `/tutor` sem token → redirect `/login`
- [ ] Sidebar mostra nome do usuário (não mock)

---

## E1 — Questões

```
curl http://localhost:3333/questoes?area=matematica&limit=5
→ 5 questões com alternativas
```

---

## E2 — Simulado E2E

```
/login → /simulados/novo → escolher Matemática, 10 questões
→ responder todas → resultado com score
→ clicar "Explicar com IA" em 1 erro → abre /tutor com contexto
```

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
| 1 | S0 Auth | S0 Login | **E0** |
| 2 | S1 Seed questões | S1 Novo simulado (mock) | E1 |
| 3 | S2 Simulados API | S2 Fluxo simulado | **E2** |
| 4 | S3 Tutor | S3 Chat | **E3** |
| 5 | S4 Métricas | S4 Dashboard | **E4** |
| 6 | S5 Planos | S5 Checkout | **E5** |
| 7–8 | S6 Hardening | S6 Polish | **E6** |

---

## Ambiente

| Ambiente | API | Web | DB |
|----------|-----|-----|-----|
| Dev | localhost:3333 | localhost:3001 | Docker/Railway |
| Prod | Railway | Vercel | Railway Postgres |

---

## Quando algo quebra na integração

1. Network tab → status + body do erro
2. API logs → correlation (futuro)
3. **Não** mudar contrato da API sem atualizar `lib/api.ts`
4. Fix no menor lado (geralmente falta header `Authorization`)
