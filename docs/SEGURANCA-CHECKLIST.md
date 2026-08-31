# Checklist de Segurança — ENEM+

> Fonte de verdade para endurecimento da API (NestJS) e do BFF (Next.js).  
> Complementa: [SEGURANCA-AUTH.md](./SEGURANCA-AUTH.md) · [CONCEITOS-SEGURANCA-E-PERFORMANCE.md](./CONCEITOS-SEGURANCA-E-PERFORMANCE.md)

**Última revisão:** 2026-08-31

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e ativo |
| 🟡 | Parcial / só em algumas rotas |
| ⬜ | Pendente |
| 🔮 | Planejado (produção / fase futura) |

---

## 1. Autenticação e sessão

| # | Item | Status | Onde / notas |
|---|------|--------|--------------|
| 1.1 | JWT access curto (~15 min) | ✅ | `jwt-auth-token.service.ts` |
| 1.2 | Refresh rotativo + hash SHA-256 no DB | ✅ | `RefreshToken` + rotação em refresh |
| 1.3 | Detecção de reuso de refresh (revoga sessões) | ✅ | `jwt-auth-token.service.ts` |
| 1.4 | Tokens em cookies HttpOnly (nunca localStorage) | ✅ | `apps/web/lib/auth.ts`, BFF |
| 1.5 | Secure + SameSite=Lax em produção | ✅ | `authCookieOptions` |
| 1.6 | BFF converte cookie para Bearer | ✅ | `/api/backend/*` |
| 1.7 | Rotas Nest de auth bloqueadas no BFF genérico | ✅ | login/refresh via `/api/auth/*` |
| 1.8 | Middleware Next protege rotas do workspace | ✅ | `apps/web/proxy.ts` (deny-by-default) |
| 1.9 | Tokens só emitidos para o BFF (X-BFF-Secret) | ✅ | `bff-secret.guard.ts` |
| 1.10 | Rotação de JWT_SECRET sem derrubar sessões | 🔮 | kid/versionamento |

---

## 2. Autorização (RBAC + ownership)

| # | Item | Status | Onde / notas |
|---|------|--------|--------------|
| 2.1 | JwtAuthGuard global em rotas de dados do aluno | ✅ | `APP_GUARD` em `security.module.ts` + `@Public()` nas rotas de auth/health |
| 2.2 | RolesGuard global + decorator `@Roles()` | ✅ | `roles.guard.ts`, `roles.decorator.ts` |
| 2.3 | Endpoints só ADMIN | ⬜ | Painel admin ainda não existe |
| 2.4 | Endpoints só PROFESSOR | ⬜ | — |
| 2.5 | Ownership: simulado pertence ao user.sub | ✅ | Repositórios filtram por userId |
| 2.6 | Ownership: conversas tutor | ✅ | `conversasRepository.obterPorId` |
| 2.7 | Ownership: anexos dev (userId no path) | ✅ | `dev-uploads.controller.ts` |
| 2.8 | Anexos via BFF autenticado | ✅ | `LOCAL_UPLOAD_BASE_URL` → `/api/backend/dev-uploads` |
| 2.9 | Cliente não pode alterar role / plano | ✅ | DTO + forbidNonWhitelisted |
| 2.10 | Upgrade de plano só via webhook pagamento | 🔮 | Mercado Pago |

### Uso de RBAC (rotas admin futuras)

```typescript
@Roles('ADMIN')
@Get('admin/usuarios')
listarUsuarios() { … }
```

`RolesGuard` é global; `@Roles()` só restringe onde aplicado. `JwtAuthGuard` continua obrigatório nas rotas protegidas.

---

## 3. Rate limiting (HTTP)

| # | Item | Status | Limite (60s) |
|---|------|--------|--------------|
| 3.1 | Throttler global | ✅ | 100 req |
| 3.2 | Login Google | ✅ | 10 |
| 3.3 | Refresh / logout | ✅ | 30 / 20 |
| 3.4 | Tutor mensagens / stream | ✅ | 20 |
| 3.5 | Tutor explicar / dica | ✅ | 15 |
| 3.6 | Tutor PDF resumo / questões | ✅ | 8 / 12 |
| 3.7 | Simulados criar | ✅ | 20 |
| 3.8 | Simulados gerar com IA | ✅ | 8 |
| 3.9 | Simulados respostas | ✅ | 60 |
| 3.10 | Simulados finalizar | ✅ | 15 |
| 3.11 | Métricas POST trilha / recalcular | ✅ | 5–30 |
| 3.12 | Depoimentos POST | ✅ | 10 |
| 3.13 | Throttler distribuído (Redis) | 🔮 | REDIS_URL documentado |
| 3.14 | Rate limit por IP em rotas públicas | 🟡 | Só global |

### Quota de IA (negócio)

| # | Item | Status |
|---|------|--------|
| 3.15 | Contador diário uso_tokens_ia | ✅ |
| 3.16 | Imagem = 2x tokens | ✅ |
| 3.17 | Quota desligada em dev | 🟡 | Desligar em prod |

---

## 4. Idempotência

| # | Item | Status |
|---|------|--------|
| 4.1 | Tabela idempotency_keys | ✅ |
| 4.2 | IdempotencyService + interceptor | ✅ |
| 4.3 | Decorator @Idempotent() | ✅ |
| 4.4 | CORS Idempotency-Key | ✅ |
| 4.5 | BFF repassa header | ✅ |
| 4.6 | POST simulados/:id/respostas | ✅ |
| 4.7 | POST simulados/:id/finalizar | ✅ |
| 4.8 | POST ia-tutor/mensagens | ✅ |
| 4.9 | POST ia-tutor/explicar-erro | ✅ |
| 4.10 | POST metricas/trilha/* | ✅ |
| 4.11 | Webhook Mercado Pago | 🔮 |
| 4.12 | Job limpeza expires_at | ✅ | `database-cleanup.service.ts` (cron 3h) |
| 4.13 | SSE stream | ⬜ | Não aplicável (resposta manual) |

Chave estável por ação: `resposta:{simuladoId}:{questaoId}` no front.

---

## 5. Validação e anti-injeção

| # | Item | Status | Notas |
|---|------|--------|-------|
| 5.1 | **SQL injection** — Prisma (queries parametrizadas) | ✅ | Zero `$queryRaw` / concatenação SQL no código |
| 5.2 | Busca textual via `contains` do Prisma (não string SQL) | ✅ | `questao-filtro.builder.ts` |
| 5.3 | Sanitização de termos de busca (sem `;`, null byte, etc.) | ✅ | `sanitizar-input.helper.ts` |
| 5.4 | `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`) | ✅ | `main.ts` |
| 5.5 | DTOs com `class-validator` + `@MaxLength` / `@IsIn` / `@IsUUID` | ✅ | Por módulo |
| 5.6 | `ParseUUIDPipe` em IDs de rota (simulados + tutor) | ✅ | Rejeita IDs malformados antes do DB |
| 5.7 | Path traversal em uploads locais | ✅ | Rejeita `..` na key |
| 5.8 | MIME whitelist em anexos tutor | ✅ | JPEG/PNG/WebP no DTO + use case |
| 5.9 | Body limit JSON 1 MB / upload 2 MB | ✅ | `main.ts` |
| 5.10 | **XSS** — sanitização resposta tutor | ✅ | `sanitizarRespostaTutor` |
| 5.11 | **XSS** — React escapa HTML por padrão | ✅ | Web |
| 5.12 | **CSRF** — cookies `SameSite=Lax` + mutações via BFF same-origin | ✅ | |
| 5.13 | **NoSQL injection** | N/A | Postgres relacional |
| 5.14 | **Command injection** | ✅ | Sem `exec`/`spawn` com input do usuário |
| 5.15 | **SSRF** — fetch servidor controlado | 🟡 | Nest só chama APIs IA configuradas |
| 5.16 | CSP no Next (marketing + workspace) | ✅ | `next.config.ts` headers |
| 5.17 | Prompt injection / jailbreak IA | ✅ | Escopo deny-by-default + padrões exfiltração + prompt anti-leak |

### SQL injection — por que já estamos protegidos

O Prisma **nunca** monta SQL concatenando strings do usuário. Exemplo real do projeto:

```typescript
// termo vira parâmetro bindado — não vira SQL cru
{ disciplina: { contains: termo, mode: 'insensitive' } }
```

Mesmo `'; DROP TABLE questoes; --` vira apenas um literal de busca inofensivo (e agora é filtrado na sanitização).

---

## 6. Headers e transporte

| # | Item | Status |
|---|------|--------|
| 6.1 | Helmet | ✅ |
| 6.2 | CORS restrito | ✅ |
| 6.3 | CSP customizada | ✅ | Next.js `Content-Security-Policy` |
| 6.4 | HTTPS produção | 🔮 |
| 6.5 | HSTS | 🔮 |

---

## 7. Sugestões adicionais

### Alta (antes de produção)

1. `IA_TOKENS_UNLIMITED=false` em produção
2. Redis no Throttler (multi-instância)
3. Nest não exposto publicamente (só BFF + health)

### Média

6. Signed URLs S3 com TTL curto
7. Rate limit por IP no login
8. WAF (Cloudflare)
9. npm audit no CI

### Baixa

10. 2FA admin/professor
11. Lista de dispositivos na UI
12. Sanitizar HTML dos PDFs

---

## Mapa por tipo de rota

| Tipo | JWT | RBAC | Throttle | Idempotência |
|------|-----|------|----------|--------------|
| Público marketing | — | — | global | — |
| Auth | — | — | agressivo | — |
| GET aluno | ✅ | — | global | — |
| POST mutação | ✅ | — | ✅ | se crítico |
| IA | ✅ | — | ✅ + tokens | recomendado |
| Admin futuro | ✅ | @Roles | ✅ | obrigatório |
| Webhook MP | HMAC | — | por IP | obrigatório |

---

## Arquivos de referência

| Peça | Caminho |
|------|---------|
| Security module | `apps/api/src/infrastructure/security/security.module.ts` |
| Idempotência | `apps/api/src/infrastructure/http/idempotency.*` |
| RBAC | `apps/api/src/infrastructure/auth/roles.*` |
| BFF | `apps/web/app/api/backend/[...path]/route.ts` |
| Middleware | `apps/web/proxy.ts` |
| Guard global JWT | `apps/api/src/infrastructure/security/security.module.ts` |
| Decorator público | `apps/api/src/infrastructure/auth/public.decorator.ts` |
| Escopo tutor | `apps/api/src/modules/ia-tutor/.../tutor-escopo.helper.ts` |
| Limpeza DB | `apps/api/src/infrastructure/maintenance/database-cleanup.service.ts` |

---

## 10. Testes de segurança (E2E)

| # | Item | Status | Arquivo |
|---|------|--------|---------|
| 10.1 | Rotas protegidas → 401 sem JWT | ✅ | `test/app.e2e-spec.ts`, `test/security.e2e-spec.ts` |
| 10.2 | SQL injection em `GET /questoes/contagem` → 200 + `total` numérico | ✅ | `test/security.e2e-spec.ts` |
| 10.3 | UUID inválido em simulados/tutor → 400 | ✅ | `test/security.e2e-spec.ts` |
| 10.4 | E2E idempotência (replay) | ⬜ | — |
| 10.5 | E2E RBAC negado → 403 | ⬜ | Quando houver rotas admin |

Executar: `npm run test:e2e -w apps/api` (requer Postgres + `JWT_SECRET` no `.env`).

---

## Próximos passos

1. E2E idempotência (replay)
2. Redis throttler em staging
3. Webhook Mercado Pago (HMAC + idempotência)
4. Primeira rota `@Roles('ADMIN')`
