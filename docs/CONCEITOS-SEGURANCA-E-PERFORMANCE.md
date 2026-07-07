# Conceitos de Segurança, Performance e Resiliência

> Guia de referência para o TCC. Cada conceito explica **o que é**, **por que usar**, **onde encaixa na hexagonal** e **quando implementar** (fase do cronograma).

**Legenda de fases:** F1 · F2 · F3 · F4 · F5 (ver [CRONOGRAMA-IMPLEMENTACAO.md](./CRONOGRAMA-IMPLEMENTACAO.md))

---

## Índice

1. [Arquitetura Hexagonal (Ports & Adapters)](#1-arquitetura-hexagonal-ports--adapters)
2. [Injeção de Dependências (DI)](#2-injeção-de-dependências-di)
3. [DTO e Validação na Borda](#3-dto-e-validação-na-borda)
4. [JWT + Refresh Token](#4-jwt--refresh-token)
5. [OAuth2 (Google Login)](#5-oauth2-google-login)
6. [RBAC — Controle de Acesso por Papel](#6-rbac--controle-de-acesso-por-papel)
7. [Idempotência](#7-idempotência)
8. [Rate Limiting Dinâmico](#8-rate-limiting-dinâmico)
9. [Cache-Aside (Redis)](#9-cache-aside-redis)
10. [Transações de Banco](#10-transações-de-banco)
11. [Agregações Pré-calculadas (Métricas)](#11-agregações-pré-calculadas-métricas)
12. [Circuit Breaker](#12-circuit-breaker)
13. [Correlation ID](#13-correlation-id)
14. [Audit Log](#14-audit-log)
15. [Soft Delete (LGPD)](#15-soft-delete-lgpd)
16. [Least Privilege (Banco)](#16-least-privilege-banco)
17. [Tratamento de Erros e Exceções de Domínio](#17-tratamento-de-erros-e-exceções-de-domínio)
18. [Webhooks Seguros (Mercado Pago)](#18-webhooks-seguros-mercado-pago)
19. [CORS e Headers de Segurança](#19-cors-e-headers-de-segurança)
20. [Paginação e Cursor](#20-paginação-e-cursor)

---

## 1. Arquitetura Hexagonal (Ports & Adapters)

| | |
|---|---|
| **O que é** | O domínio fica no centro; infraestrutura (HTTP, DB, APIs) fica nas bordas via contratos (Ports). |
| **Por quê** | Trocar Prisma por outro ORM, ou Gemini por outro LLM, sem reescrever regras de negócio. |
| **Onde** | `core/` = domínio + use cases + ports · `infrastructure/adapters/` = implementações |
| **Quando** | **F1** — já em uso. Manter em todas as fases. |

```
Controller → Use Case → Port (interface) → Adapter (Prisma, Gemini, etc.)
```

**Regra de ouro:** Nenhum arquivo em `core/` importa Prisma, Redis, `@nestjs/*` (exceto `@Injectable` nos use cases).

---

## 2. Injeção de Dependências (DI)

| | |
|---|---|
| **O que é** | O NestJS monta o grafo de objetos; Use Cases recebem Ports via construtor. |
| **Por quê** | Testabilidade (mock de repositório), baixo acoplamento, SOLID (D). |
| **Onde** | `*.module.ts` com `provide: TOKEN, useClass: Adapter` |
| **Quando** | **F1** — já em uso no `UsuariosModule`. Replicar em todos os módulos. |

```typescript
// Padrão correto
@Inject(USUARIOS_REPOSITORY)
private readonly usuariosRepository: UsuariosRepositoryPort
```

**Erro comum:** Passar dados de requisição (token, body) no `constructor`. Isso vai no método `execute()`.

---

## 3. DTO e Validação na Borda

| | |
|---|---|
| **O que é** | Objeto que define formato do JSON HTTP + regras (`@IsEmail`, `@IsNotEmpty`). |
| **Por quê** | Rejeitar lixo **antes** do Use Case; mensagens de erro padronizadas. |
| **Onde** | `infrastructure/adapters/in/http/dto/` — **nunca** no `core/`. |
| **Quando** | **F1** (login) · **F2** (simulados) · todas as fases. |

```
HTTP Body → LoginGoogleDto (valida) → useCase.execute(dto.idToken)
```

**Frontend:** Validar no formulário (UX), mas **nunca confiar** — o backend sempre revalida.

---

## 4. JWT + Refresh Token

| | |
|---|---|
| **O que é** | JWT de acesso (curta duração, ex: 15min) + refresh token (longa, ex: 7 dias) para renovar sem novo login Google. |
| **Por quê** | Se o JWT vazar, o dano é limitado; refresh pode ser revogado no banco. |
| **Onde** | Port `AuthTokenServicePort` · Adapter `JwtAuthTokenService` · Guard `JwtAuthGuard` |
| **Quando** | **F1** — logo após `LoginGoogleUseCase` funcionar. |

**Tabelas:** opcional `refresh_tokens` (userId, tokenHash, expiresAt, revokedAt).

**Frontend (F1):** Guardar access token em memória ou cookie `httpOnly`; refresh em cookie `httpOnly` + rota `/api/auth/refresh`.

---

## 5. OAuth2 (Google Login)

| | |
|---|---|
| **O que é** | Delegar autenticação ao Google; backend valida `idToken` com a API do Google. |
| **Por quê** | Sem senha local, menos risco de vazamento, UX rápida. |
| **Onde** | Port `OAuthServicePort` · Adapter `GoogleOAuthService` |
| **Quando** | **F1** |

**Fluxo:**
1. Front obtém `idToken` do Google (NextAuth ou Google Identity Services)
2. Front envia para `POST /usuarios/login-google`
3. API valida token → busca/cria usuário → retorna JWT

**Segurança:** Validar `aud` (client_id), `iss`, expiração. Nunca confiar no payload sem validar com Google.

---

## 6. RBAC — Controle de Acesso por Papel

| | |
|---|---|
| **O que é** | Role-Based Access Control: `ALUNO`, `PROFESSOR`, `ADMIN` definem o que cada um pode fazer. |
| **Por quê** | Aluno não acessa painel admin; professor vê turma; admin gerencia planos. |
| **Onde** | Campo `role` em `Usuario` · Guard `@Roles('ADMIN')` nos controllers |
| **Quando** | **F2** (rotas básicas) · **F4** (painel professor/admin) |

**Frontend:** Esconder botões por role (UX) + API sempre valida (segurança).

---

## 7. Idempotência

| | |
|---|---|
| **O que é** | Repetir a mesma requisição produz o mesmo resultado, sem efeito duplicado. |
| **Por quê** | Rede instável, duplo clique, retry automático — evita cobrar 2x ou salvar 2 respostas. |
| **Onde** | Tabela `idempotency_keys` (já no schema) · Port `IdempotencyServicePort` · Interceptor ou middleware |
| **Quando** | **F3** (pagamentos) · **F2** (enviar resposta de simulado) |

**Como usar:**
1. Cliente envia header `Idempotency-Key: <uuid>` (gerar no front antes do POST)
2. API verifica se chave existe:
   - `COMPLETED` → retorna resposta salva
   - `PROCESSING` → 409 Conflict
   - Nova → processa, salva resultado, marca `COMPLETED`

**Use Cases que precisam:** `EnviarRespostaUseCase`, webhook Mercado Pago, `ExplicarErroUseCase` (cobrança de token).

---

## 8. Rate Limiting Dinâmico

| | |
|---|---|
| **O que é** | Limitar quantas ações um usuário pode fazer por janela de tempo. |
| **Por quê** | Proteger custo da API Gemini; garantir freemium sustentável. |
| **Onde** | Tabela `uso_tokens_ia` + `planos_assinatura` · Redis para contador em tempo real · Guard no `ia-tutor` |
| **Quando** | **F3** (antes de liberar IA em produção) |

**Lógica:**
```
limite = plano.tokensDiarios  // 10 gratuito, 200 apoio
consumo = uso_tokens_ia.consumo // hoje
if consumo >= limite → 429 Too Many Requests
else → processa, incrementa consumo
```

**Frontend (F3):** Mostrar barra "Tokens restantes hoje" · desabilitar botão tutor quando zerar.

---

## 9. Cache-Aside (Redis)

| | |
|---|---|
| **O que é** | App consulta cache primeiro; se miss, busca DB e popula cache. |
| **Por quê** | Dashboard de proficiência lido muitas vezes, escrito pouco. |
| **Onde** | `infrastructure/cache/redis.service.ts` · Adapter ou decorator no repositório de métricas |
| **Quando** | **F3** (dashboard) · **F4** (otimização para escolas) |

**Padrão:**
```
1. GET proficiencia:{userId} no Redis
2. Se hit → retorna
3. Se miss → busca proficiencias_area no Postgres → SET com TTL 5min
4. Ao enviar resposta → DEL proficiencia:{userId}
```

---

## 10. Transações de Banco

| | |
|---|---|
| **O que é** | Várias operações no banco são "tudo ou nada" (`BEGIN` / `COMMIT` / `ROLLBACK`). |
| **Por quê** | Criar usuário sem perfil = dados órfãos; pagamento confirmado sem ativar plano = bug grave. |
| **Onde** | `prisma.$transaction([...])` **apenas nos Adapters** |
| **Quando** | **F1** (criar usuário + perfil + plano) · **F3** (ativar plano pós-pagamento) |

**Exemplo:** `salvar` usuário novo já usa nested create (transação implícita do Prisma).

---

## 11. Agregações Pré-calculadas (Métricas)

| | |
|---|---|
| **O que é** | Em vez de calcular proficiência lendo 10.000 respostas, manter tabela `proficiencias_area` atualizada. |
| **Por quê** | Leitura O(1) por área vs scan de milhões de linhas. |
| **Onde** | `CalcularProficienciaUseCase` chamado após `EnviarRespostaUseCase` |
| **Quando** | **F2** (primeiro simulado) · refinar em **F4** |

**Fórmula inicial sugerida:**
```
score = (acertos / totalQuestoes) * 100
// Atualizar incrementalmente a cada resposta
```

---

## 12. Circuit Breaker

| | |
|---|---|
| **O que é** | Se API externa (Gemini) falha N vezes seguidas, para de chamar por X segundos. |
| **Por quê** | Evita cascata de timeouts; economiza dinheiro; retorna erro rápido ao aluno. |
| **Onde** | Adapter `GeminiIaEngine` · lib opcional: `opossum` |
| **Quando** | **F3** (IA em produção) |

**Estados:** `CLOSED` (normal) → `OPEN` (bloqueado) → `HALF_OPEN` (testa 1 req)

**Frontend:** Mensagem amigável "Tutor temporariamente indisponível, tente em 1 minuto".

---

## 13. Correlation ID

| | |
|---|---|
| **O que é** | UUID único por requisição HTTP, propagado em todos os logs. |
| **Por quê** | Debugar: "o aluno X clicou e deu erro" — rastrear front → API → DB → Gemini. |
| **Onde** | Middleware NestJS · header `X-Correlation-Id` |
| **Quando** | **F2** (quando tiver volume de logs) · obrigatório em **F4** (piloto em escolas) |

---

## 14. Audit Log

| | |
|---|---|
| **O que é** | Registro imutável de ações sensíveis: quem, o quê, quando, IP. |
| **Por quê** | TCC com pagamentos e dados de menores — rastreabilidade e LGPD. |
| **Onde** | Tabela `audit_logs` (futura) · chamada no Use Case após ação crítica |
| **Quando** | **F3** (pagamentos) · **F4** (compliance) |

**Eventos:** login, mudança de plano, acesso a dados de aluno (professor), exclusão de conta.

---

## 15. Soft Delete (LGPD)

| | |
|---|---|
| **O que é** | `deleted_at` em vez de `DELETE`; registro some das queries mas permanece para auditoria. |
| **Por quê** | Direito ao esquecimento com prazo legal de retenção. |
| **Onde** | Campo em `usuarios` · filtro `where: { deletedAt: null }` no Adapter |
| **Quando** | **F4** (antes do piloto em escolas) |

---

## 16. Least Privilege (Banco)

| | |
|---|---|
| **O que é** | Usuário do Postgres no Railway com permissões mínimas (só CRUD nas tabelas da app). |
| **Por quê** | Se `DATABASE_URL` vazar, atacante não dropa o banco inteiro. |
| **Onde** | Configuração Railway · nunca commitar `.env` |
| **Quando** | **F4** (deploy produção) — dev pode usar superuser local. |

---

## 17. Tratamento de Erros e Exceções de Domínio

| | |
|---|---|
| **O que é** | Exceções tipadas (`TokenGoogleInvalidoException`) + `ExceptionFilter` global que mapeia para HTTP. |
| **Por quê** | `catch` genérico esconde bugs; respostas consistentes para o front. |
| **Onde** | `core/domain/exceptions/` · `infrastructure/http/filters/` |
| **Quando** | **F1** (login) · expandir em cada fase |

**Mapeamento:**
| Exceção de domínio | HTTP |
|--------------------|------|
| `TokenGoogleInvalidoException` | 401 |
| `LimiteTokensAtingidoException` | 429 |
| `UsuarioNaoEncontradoException` | 404 |
| `IdempotencyConflictException` | 409 |

---

## 18. Webhooks Seguros (Mercado Pago)

| | |
|---|---|
| **O que é** | Mercado Pago notifica sua API quando pagamento é confirmado. |
| **Por quê** | Não depender do front "avisar" que pagou — fonte confiável é o webhook. |
| **Onde** | `POST /webhooks/mercadopago` · validar assinatura HMAC · idempotência obrigatória |
| **Quando** | **F3** |

**Segurança:** Validar `x-signature` · processar webhook de forma idempotente · nunca confiar no body sem validação.

---

## 19. CORS e Headers de Segurança

| | |
|---|---|
| **O que é** | CORS restringe quais domínios chamam a API; headers como `Helmet` protegem contra XSS, clickjacking. |
| **Por quê** | Front na Vercel, API no Railway — só `https://seu-app.vercel.app` pode chamar. |
| **Onde** | `main.ts` · `@nestjs/helmet` |
| **Quando** | **F2** (front conectando na API) |

---

## 20. Paginação e Cursor

| | |
|---|---|
| **O que é** | Listar questões/simulados em páginas; cursor (`?cursor=uuid&limit=20`) em vez de offset. |
| **Por quê** | Offset em tabela grande fica lento (`OFFSET 100000`); cursor é estável. |
| **Onde** | `BuscarQuestoesFiltroUseCase` · query params no controller |
| **Quando** | **F2** (banco de questões) |

---

## Mapa: Conceito → Port sugerido → Tabela

| Conceito | Port (core) | Tabela / Infra |
|----------|-------------|----------------|
| Persistência usuário | `UsuariosRepositoryPort` | `usuarios`, `perfis_aluno` |
| Login Google | `OAuthServicePort` | — (API Google) |
| JWT | `AuthTokenServicePort` | `refresh_tokens` (opcional) |
| Idempotência | `IdempotencyServicePort` | `idempotency_keys` |
| Rate limit IA | `RateLimitServicePort` | `uso_tokens_ia`, Redis |
| Métricas | `ProficienciaRepositoryPort` | `proficiencias_area` |
| IA | `IaEnginePort` | — (Gemini API) |
| Pagamentos | `PagamentoServicePort` | `planos_assinatura` |
| Cache | `CacheServicePort` | Redis |

---

## Checklist rápido antes do piloto em escolas (F4)

- [ ] JWT + refresh funcionando
- [ ] Rate limit de IA ativo
- [ ] Idempotência em pagamentos e respostas
- [ ] CORS + Helmet configurados
- [ ] Correlation ID nos logs
- [ ] Audit log em ações sensíveis
- [ ] Migrations aplicadas no Railway (`prisma migrate deploy`)
- [ ] `DATABASE_URL` e secrets fora do Git
- [ ] Teste de carga básico (50+ alunos simultâneos)
