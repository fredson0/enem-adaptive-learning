# Divisão de trabalho — desenvolvimento ENEM+

> Como vamos trabalhar no TCC com vibe coding (Cursor + IA).

---

## Princípio

| Tipo | Quem faz | Motivo |
|------|----------|--------|
| **Google Auth (OAuth)** | **Você + IA, em par** | Envolve Google Cloud Console, credenciais, domínios autorizados e teste real com sua conta |
| **Restante do projeto** | **IA implementa** | Backend, frontend, seed, integrações — você revisa e testa |

---

## Google Auth — implementação conjunta (Sprint S0) ✅

### Concluído

- Backend: `GoogleOAuthService`, `JwtAuthTokenService`, `POST /usuarios/login-google`, `GET/PATCH /usuarios/perfil`, `JwtAuthGuard`
- Frontend: `/login`, `/onboarding`, `lib/api.ts`, `lib/auth.ts`, middleware, `GoogleAuthProvider`
- Infra local: `docker-compose.yml` (Postgres na porta **5433**)
- Perfil: sidebar e `/perfil` com dados reais; onboarding com ano escolar e tipo de ensino médio
- **Checkpoint E0** validado (login → onboarding → `/tutor`)

### Referência — Google Cloud Console (já configurado)

1. **OAuth 2.0 Client ID** (Web application)
2. Authorized JavaScript origins: `http://localhost:3001` (dev)
3. Variáveis:
   - `apps/api/.env`: `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `DATABASE_URL` (porta **5433** no Docker)
   - `apps/web/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_API_URL`
4. Banco: `docker compose up -d` + `npm run prisma:migrate:deploy -w apps/api`

### Quando pedir ajuda

- Erro `Token Google inválido` → client ID diferente entre API e web
- Erro CORS → conferir `CORS_ORIGIN` / `main.ts`
- Redirect loop → cookie `enem_access_token` + middleware
- `401` no perfil → token expirado ou `JWT_SECRET` mudou

---

## Restante — IA implementa (você revisa)

| Sprint | Escopo | Sua parte |
|--------|--------|-----------|
| **S1** | Seed questões (enem.dev) + `GET /questoes` | Rodar seed, conferir amostra |
| **S2** | Simulados API + telas novo/questão/resultado | Testar fluxo E2E |
| **S3** | Tutor IA (Gemini) + conversas | Testar perguntas + tokens |
| **S4** | Métricas + trilha | Validar após simulado |
| **S5** | Planos + Mercado Pago sandbox | Testar checkout se quiser |
| **S6** | Health, Swagger, polish | Demo TCC |

---

## Fluxo de sessão recomendado

1. **Auth:** sessão dedicada com você (console Google + env + teste)
2. **Demais sprints:** IA entrega PR/commit → você roda local → feedback em 1 mensagem
3. **Integração:** a cada sprint, gravar checkpoint E0–E6 do [CRONOGRAMA-INTEGRACAO.md](./CRONOGRAMA-INTEGRACAO.md)

---

## Referências

- [CRONOGRAMA-BACKEND.md](./CRONOGRAMA-BACKEND.md)
- [CRONOGRAMA-FRONTEND.md](./CRONOGRAMA-FRONTEND.md)
- [CRONOGRAMA-INTEGRACAO.md](./CRONOGRAMA-INTEGRACAO.md)
- [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md)
