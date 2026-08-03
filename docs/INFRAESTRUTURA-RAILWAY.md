# Infraestrutura — Railway + Vercel

> Guia oficial de infraestrutura do TCC. **Não usamos Supabase.** Todo o backend roda em serviços gerenciados com PostgreSQL nativo no Railway.

---

## Visão geral da arquitetura em produção

```
┌─────────────────┐         ┌──────────────────────────────────┐
│  Vercel         │  HTTPS  │  Railway                         │
│  Next.js (web)  │ ──────► │  NestJS API                      │
└────────┬────────┘         │    ├── PostgreSQL (Prisma)       │
         │                  │    └── Redis (cache + rate limit) │
         │ PUT (presign)     └──────────────────────────────────┘
         ▼                              │
┌─────────────────┐         ┌───────────┼───────────────────────┐
│ Cloudflare R2   │         ▼           ▼                       ▼
│ (fotos tutor)   │   Google OAuth   Gemini API (vision)   Mercado Pago
└─────────────────┘
```

| Serviço | Provedor | Função |
|---------|----------|--------|
| **Frontend** | Vercel | Next.js App Router, SSR, deploy automático |
| **API** | Railway | NestJS, regras de negócio, adapters |
| **Banco relacional** | Railway PostgreSQL | Usuários, simulados, métricas, planos |
| **Cache / Rate limit** | Railway Redis ou Upstash | Tokens IA, dashboard de proficiência |
| **ORM** | Prisma | Migrations, tipagem, adapters de persistência |
| **IA** | Google AI Studio (Gemini) | Tutor virtual — ver [ESCOLHA-MODELO-IA.md](./ESCOLHA-MODELO-IA.md) |
| **Object storage** | **Cloudflare R2** | Fotos enviadas no tutor IA — **não usar Railway para arquivos** |
| **Auth social** | Google Cloud Console | OAuth2 — sem auth gerenciado por terceiros |
| **Pagamentos** | Mercado Pago | Planos freemium |

---

## Por que Railway em vez de Supabase?

| Critério | Railway PostgreSQL | Supabase (descartado) |
|----------|-------------------|----------------------|
| Controle do banco | PostgreSQL puro, SQL direto | Abstração + ecossistema fechado |
| ORM | Prisma (escolha nossa) | Client Supabase acoplado |
| Hexagonal | Adapter Prisma limpo | Vazava tipos/SDK para o core |
| Auth | Google OAuth + JWT (nosso) | Supabase Auth (redundante) |
| Custo TCC | Plano Hobby/Pro previsível | Free tier com limites opacos |
| Escola / carga | Railway Pro para testes | Menos controle de performance |

**Decisão:** O projeto usa **PostgreSQL no Railway + Prisma + Ports & Adapters**. Autenticação é responsabilidade do módulo `usuarios`, não de um BaaS.

---

## Setup Railway — passo a passo

### 1. Criar projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Novo projeto → **Deploy from GitHub** (repo `enem-adaptive-learning`)
3. Adicione dois serviços:
   - **PostgreSQL** (template Database)
   - **Redis** (template ou Upstash externo)

### 2. Configurar variáveis de ambiente (API)

No serviço da API no Railway, configure:

```env
# Banco — Railway injeta automaticamente ao linkar o Postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Auth
JWT_SECRET=<gerar-string-aleatoria-64-chars>
GOOGLE_CLIENT_ID=<seu-client-id>.apps.googleusercontent.com

# IA (ver ESCOLHA-MODELO-IA.md)
GEMINI_API_KEY=<sua-chave-ai-studio>
GEMINI_MODEL=gemini-2.5-flash

# Pagamentos
MERCADOPAGO_ACCESS_TOKEN=<token-mp>

# Redis
REDIS_URL=${{Redis.REDIS_URL}}

# App
NODE_ENV=production
PORT=3000
```

### 3. Aplicar migrations

No deploy ou via Railway CLI:

```bash
npm run prisma:migrate:deploy -w apps/api
```

Ou adicione ao `Dockerfile` / script de start:

```json
"start:prod": "prisma migrate deploy && node dist/main"
```

### 4. Vercel (Frontend)

Variáveis no painel Vercel:

```env
NEXT_PUBLIC_API_URL=https://sua-api.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<mesmo-client-id>
```

---

## Estrutura local vs produção

| Ambiente | PostgreSQL | Redis | API |
|----------|------------|-------|-----|
| **Dev local** | Docker local ou URL Railway | Opcional (pular rate limit) | `npm run start:dev -w apps/api` |
| **Produção** | Railway PostgreSQL | Railway Redis | Railway deploy |
| **TCC demo** | Railway (mesmo de prod) | Railway | Railway |

### Dev local com Docker (opcional)

```bash
docker run -d --name enem-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
docker run -d --name enem-redis -p 6379:6379 redis:7
```

`.env` local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
REDIS_URL="redis://localhost:6379"
```

---

## Prisma + Railway — boas práticas

1. **Nunca** commitar `DATABASE_URL` — só em `.env` local e variáveis Railway
2. **Sempre** usar `prisma migrate deploy` em produção (não `db push`)
3. **Connection pooling:** Railway Postgres suporta muitas conexões; Prisma gerencia pool via `@prisma/adapter-pg`
4. **Backups:** Ativar backups automáticos no Railway Pro antes do piloto em escolas
5. **Least privilege:** Criar usuário DB com permissões mínimas em produção (F4)

---

## Object Storage — Cloudflare R2

> **Decisão:** imagens do tutor (foto de questão, resolução no caderno) **não** ficam no Railway.  
> PostgreSQL guarda só a URL e metadados. O binário vai para R2 (API S3-compatible, 10 GB free).

### Por que não Railway?

| Opção | Problema |
|-------|----------|
| BYTEA no PostgreSQL | Backup pesado, queries lentas, não escala |
| Railway Volumes | Sem CDN, acoplado a uma instância, difícil em multi-réplica |
| Disco efêmero do container | Perde arquivos a cada deploy |

### Setup R2 (resumo)

1. Criar bucket `enem-tutor-anexos` no [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Criar API token com permissão Read/Write no bucket
3. Configurar CORS no bucket (origem: domínio Vercel + `localhost:3001`)
4. Variáveis na API (Railway):

```env
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=enem-tutor-anexos
R2_PUBLIC_BASE_URL=https://<account-id>.r2.dev/<bucket>   # ou domínio custom
R2_PRESIGN_EXPIRES_SEC=300
ANEXO_RETENTION_DAYS=30
```

5. Adapter hexagonal: `ObjectStoragePort` → `R2ObjectStorageAdapter` (`@aws-sdk/client-s3` com endpoint R2)

### Fluxo presign (upload direto)

```
Frontend                    API (Railway)              R2
   │ POST /anexos/presign ──────►│ gera presigned PUT URL │
   │◄──── { uploadUrl, key } ────│                        │
   │ PUT uploadUrl (arquivo) ─────────────────────────────►│
   │ POST /mensagens { anexoUrl }►│ lê URL → Gemini vision │
```

O arquivo **nunca** passa pelo body da API NestJS — só a URL assinada. Isso reduz memória e timeout no Railway.

### Lifecycle

- `expiresAt` em cada anexo no Postgres = `criadoEm + 30 dias`
- Cron/job F4: `DELETE` objeto R2 + limpar URL expirada
- Alternativa aceita: **Vercel Blob** (mesmo padrão, ver [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md))

---

## Monitoramento

| Ferramenta | Uso |
|------------|-----|
| Railway Metrics | CPU, memória, logs da API |
| `GET /health` | Health check (implementar F4) |
| Prisma Studio | Debug local (`npm run prisma:studio -w apps/api`) |
| Correlation ID | Rastrear requisições nos logs (F2) |

---

## Custos estimados (TCC)

| Serviço | Dev/TCC | Produção piloto escola |
|---------|---------|------------------------|
| Railway Hobby | ~$5/mês crédito | — |
| Railway Pro | — | ~$20/mês (API + DB + Redis) |
| Vercel | Grátis (hobby) | Grátis |
| Gemini API | Grátis (free tier) | ~$0–10/mês com rate limit |
| Cloudflare R2 | Grátis (10 GB) | ~$0 no piloto escola |
| Mercado Pago | Sandbox grátis | Taxa por transação |

**Total estimado TCC:** R$ 0–50/mês dependendo do volume de IA e plano Railway.

---

## Referências

- [Prisma + Railway](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Backend API README](../apps/api/README.md)
- [Escolha do Modelo de IA](./ESCOLHA-MODELO-IA.md)
