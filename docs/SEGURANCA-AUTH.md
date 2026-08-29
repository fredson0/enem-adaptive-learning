# Segurança de Autenticação e Autorização — ENEM+

> Fonte de verdade: **NestJS API**. O frontend (Next.js) só transporta cookies HttpOnly e nunca decide plano, role ou permissões.

**Relacionado:** [CONCEITOS-SEGURANCA-E-PERFORMANCE.md](./CONCEITOS-SEGURANCA-E-PERFORMANCE.md) · [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md)

---

## Princípios

1. **Nunca confiar no cliente** — role, plano, tokens de IA e flags de admin só existem no banco / JWT assinado pelo servidor.
2. **Tokens fora do JavaScript** — access + refresh em cookies `HttpOnly` + `SameSite=Lax` (+ `Secure` em produção).
3. **Access curto, refresh rotativo** — access ~15 min; refresh 7 dias, hash SHA-256 no Postgres, rotação a cada uso.
4. **Upgrade de plano só via pagamento** — webhook Mercado Pago (futuro). Não existe endpoint `PATCH plano` para o aluno.
5. **Rate limit** — login/refresh throttled; global ThrottlerGuard na API.

---

## Arquitetura da sessão

```
Browser                    Next.js (BFF)                      NestJS API
   │  Google idToken            │                                │
   │───────────────────────────►│ POST /usuarios/login-google    │
   │                            │───────────────────────────────►│ valida Google
   │                            │◄── access + refresh + user ────│ emite tokens
   │◄── Set-Cookie HttpOnly ────│ (só user no JSON)               │
   │                            │                                │
   │  /api/backend/usuarios/... │ Bearer do cookie               │
   │───────────────────────────►│───────────────────────────────►│ JwtAuthGuard
```

| Cookie | Duração | Quem lê |
|--------|---------|---------|
| `enem_access_token` | 15 min | Só servidor Next / proxy |
| `enem_refresh_token` | 7 dias | Só `/api/auth/refresh` e logout |

**Proibido:** `localStorage` / `sessionStorage` para JWT.

---

## Rotas e controles

### Públicas (sem JWT)

| Método | Rota | Rate limit | Notas |
|--------|------|------------|-------|
| `POST` | `/usuarios/login-google` | 10 / min | Body: `{ idToken }` apenas |
| `POST` | `/usuarios/auth/refresh` | 30 / min | Body: `{ refreshToken }` — raw token; hash no DB |
| `POST` | `/usuarios/auth/logout` | 20 / min | Revoga refresh |

### BFF Next (cookies no domínio do web)

| Método | Rota | Função |
|--------|------|--------|
| `POST` | `/api/auth/login` | Login Google → seta cookies **HttpOnly**; JSON só `{ user }` |
| `DELETE` | `/api/auth/login` | Logout + limpa cookies |
| `POST` | `/api/auth/refresh` | Rotaciona tokens via cookie refresh (JS não lê o token) |
| `GET` | `/api/auth/me` | Perfil autenticado (sem JWT no JSON) |
| `*` | `/api/backend/*` | Proxy: cookie HttpOnly → `Authorization: Bearer` no servidor |

### Emissão de tokens na API (somente BFF)

| Rota Nest | Guard | Resposta ao browser |
|-----------|-------|---------------------|
| `POST /usuarios/login-google` | `BffSecretGuard` | **403** se chamado direto; BFF recebe tokens e grava cookies |
| `POST /usuarios/auth/refresh` | `BffSecretGuard` | idem |
| `POST /usuarios/auth/logout` | `BffSecretGuard` | idem |

Variável compartilhada: `BFF_INTERNAL_SECRET` (mesmo valor em `apps/api/.env` e `apps/web/.env.local`).

### Protegidas (JwtAuthGuard)

| Método | Rota | O que o cliente PODE enviar | O que é REJEITADO |
|--------|------|----------------------------|-------------------|
| `GET` | `/usuarios/perfil` | — | — |
| `PATCH` | `/usuarios/perfil` | `nome`, `cursoObjetivo`, `nivelAtual`, `tempoDiarioMinutos` | `role`, `plano`, `tipo`, `tokensDiarios`, `mercadoPagoSubId`, qualquer campo extra (`forbidNonWhitelisted`) |
| `POST` | `/usuarios/auth/logout-all` | — | Revoga todos os refresh da conta |

### Futuro — planos (não implementar endpoint cliente)

| Evento | Quem muda `PlanoAssinatura.tipo` |
|--------|----------------------------------|
| Signup | Sempre `GRATUITO` no repositório |
| Pagamento aprovado | **Só** `POST /webhooks/mercadopago` (assinatura HMAC + idempotência) |
| Cliente tenta `PATCH { plano: "APOIO" }` | **404 / 400** — campo não existe no DTO |

---

## Anti privilege-escalation

| Ataque | Mitigação |
|--------|-----------|
| Aluno manda `{ "role": "ADMIN" }` no perfil | `forbidNonWhitelisted` + DTO sem `role`; role só no JWT/`usuarios.role` |
| Aluno manda `{ "tipo": "APOIO" }` | Sem endpoint; plano só no banco via webhook |
| Token inventado no cookie | API valida assinatura JWT; refresh valida hash + expiry + not revoked |
| Reuse de refresh já rotacionado | Revoga **todos** os refresh do usuário |
| XSS rouba token | HttpOnly impede `document.cookie`; CSP/Helmet no API |
| CSRF em cookie | `SameSite=Lax`; mutações via same-origin BFF |
| Brute force login | Throttle 10 req/min no login-google |
| Manipular PlanBadge no front | UI é cosmético; cota real em `uso_tokens_ia` + Redis no backend |

---

## Checklist operacional

- [ ] `JWT_SECRET` forte (≥ 32 chars), só no Railway / `.env` local
- [ ] `GOOGLE_CLIENT_ID` igual no front (`NEXT_PUBLIC_`) e na API
- [ ] Migration `refresh_tokens` aplicada (`prisma migrate deploy`)
- [ ] CORS com `credentials: true` e origens explícitas (não `*`)
- [ ] Helmet ativo no Nest
- [ ] Em produção: cookies `Secure=true`
- [ ] Origens OAuth Google: só localhost + domínio Vercel

---

## Variáveis de ambiente

```env
# API
JWT_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=7
GOOGLE_CLIENT_ID=
CORS_ORIGIN=http://localhost:3001
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100

# Web
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
BFF_INTERNAL_SECRET=dev-bff-secret-trocar-em-producao

# API (mesmo BFF_INTERNAL_SECRET)
BFF_INTERNAL_SECRET=dev-bff-secret-trocar-em-producao
```

---

## O que o front NÃO faz

- Não guarda JWT em `localStorage`, `sessionStorage` nem variáveis JS
- Não recebe `accessToken` / `refreshToken` no JSON (só cookies HttpOnly)
- Não decide se o usuário é APOIO/ADMIN para autorizar ações
- Não “libera” tokens de IA no cliente — só exibe o que a API devolve
- `middleware.ts` redireciona UX sem cookie; **autorização real** é sempre no Nest via JWT do BFF
