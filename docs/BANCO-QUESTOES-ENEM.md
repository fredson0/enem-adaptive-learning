# Banco de questões ENEM — api.enem.dev e self-hosting

> Como o ENEM+ obtém questões reais, por que não depender 100% da API pública, e plano para container local no monorepo.

---

## Como funciona hoje

| Momento | Fonte | Dependência da API pública? |
|---------|--------|----------------------------|
| **Seed (dev/setup)** | `https://api.enem.dev/v1` | Sim — script `prisma/seed-enem.ts` |
| **Simulados em runtime** | PostgreSQL local/Railway | **Não** — aluno responde questões já no banco |

O app **não** chama `api.enem.dev` a cada simulado. O fluxo é:

1. Rodar `npm run prisma:seed -w apps/api` (uma vez ou ao expandir anos/disciplinas).
2. Questões ficam em `questoes` com `enemDevId` único (idempotente).
3. `POST /simulados` e `POST /simulados/gerar-com-ia` sorteiam do Postgres.

Isso é o desenho correto para produção: a API comunitária serve para **popular o banco**, não para tráfego de usuários.

---

## Limites da API pública (oficial)

Fonte: [docs.enem.dev/rate-limits](https://docs.enem.dev/rate-limits)

| Regra | Valor |
|-------|--------|
| Rate limit | **1 requisição/segundo** (endpoints sem cache) |
| Janela | Recalculada a cada **10 segundos** |
| Excesso | HTTP **429** + headers `X-RateLimit-*` e `Retry-After` |
| Recomendação oficial | Limitar requisições, usar **filas**, ou **não depender da API** |

Alternativas citadas pela própria documentação:

1. **Dados brutos** — pasta `public/` no repositório [yunger7/enem-api](https://github.com/yunger7/enem-api/tree/main/public) (sem HTTP).
2. **Self-hosting** — hospedar sua própria instância: [docs.enem.dev/self-hosting](https://docs.enem.dev/self-hosting).

Licença do projeto: **GNU GPL-2.0** ([introdução](https://docs.enem.dev/introduction)).

---

## O que o seed já faz para respeitar o limite

Arquivo: `apps/api/prisma/seed-enem.ts`

| Proteção | Valor |
|----------|--------|
| Delay entre páginas | `PAGE_DELAY_MS = 900` (~1 req/s) |
| Delay entre lotes | `BATCH_DELAY_MS = 700` |
| Retry em 429/5xx | até 6 tentativas com backoff |
| Idempotência | `enemDevId` único — reexecutar não duplica |

Variáveis opcionais:

```env
SEED_YEARS=2022,2023
SEED_DISCIPLINES=matematica,linguagens,ciencias-humanas,ciencias-natureza
```

Comando:

```bash
npm run prisma:seed -w apps/api
```

**Problema:** seed completo (muitos anos × 4 disciplinas) ainda leva **horas** na API pública e pode falhar com 429 em rede instável.

---

## Plano: container `enem-api` no `docker-compose`

Objetivo: subir a API ENEM **ao lado do Postgres** no dev, sem rate limit externo, e apontar o seed para `http://localhost:…`.

### Por que container e não só JSON do GitHub?

| Abordagem | Prós | Contras |
|-----------|------|---------|
| API pública | Zero setup | 1 req/s, 429, depende de terceiro |
| JSON em `public/` do repo | Sem rate limit | Parser diferente do seed atual (hoje espera REST paginado) |
| **Self-host local** | Mesmos endpoints `/v1/exams/...`, seed quase sem mudança | Mais um serviço no compose |

A documentação oficial recomenda self-hosting para “maior controle”. O repositório roda em `http://localhost:3000` com `pnpm dev` ([self-hosting](https://docs.enem.dev/self-hosting)).

### Esboço no `docker-compose.yml` (a implementar)

```yaml
services:
  enem-api:
  # Opção A: build a partir de clone local ../enem-api (Dockerfile do repo, se existir)
  # Opção B: imagem publicada pela comunidade (verificar no repo yunger7/enem-api)
    ports:
      - "3010:3000"   # evita conflito com Next (3001) e Nest (3333)
    restart: unless-stopped
```

> **Nota:** o repo `yunger7/enem-api` é Next.js/Vercel — pode não haver Dockerfile oficial. Passos prováveis:
> 1. Clonar `enem-api` em pasta irmã ou submodule.
> 2. Adicionar `Dockerfile` mínimo ou usar `docker compose` com `build: ../enem-api`.
> 3. Validar endpoint: `GET http://localhost:3010/v1/exams/2023/questions?discipline=matematica&limit=1`

### Variável planejada no seed

```env
# apps/api/.env — futuro
ENEM_API_BASE=http://localhost:3010/v1
# default se ausente: https://api.enem.dev/v1
```

Alteração no seed: trocar `const API_BASE = 'https://api.enem.dev/v1'` por `process.env.ENEM_API_BASE ?? 'https://api.enem.dev/v1'`.

### Fluxo de desenvolvimento alvo

```bash
docker compose up -d          # postgres + enem-api
npm run prisma:migrate:deploy -w apps/api
ENEM_API_BASE=http://localhost:3010/v1 npm run prisma:seed -w apps/api
npm run dev:api
npm run dev:web
```

### Produção (Railway)

- **Não** chamar `api.enem.dev` em runtime.
- Seed roda **uma vez** no deploy ou em job manual; banco fica populado.
- Self-host da `enem-api` no Railway é opcional (só se quiser re-seed frequente sem depender do 429).

---

## Checklist de implementação (backlog)

- [ ] Clonar `yunger7/enem-api` e testar local (`localhost:3000`)
- [ ] Adicionar serviço `enem-api` ao `docker-compose.yml` (porta `3010`)
- [ ] `ENEM_API_BASE` em `.env.example` + `seed-enem.ts`
- [ ] Documentar no `READ.md` (seção seed)
- [ ] (Opcional) Script `npm run seed:full` com todos os anos 2009–2023
- [ ] (Opcional) Import direto do JSON `public/` para seed offline total

---

## Referências

- [API ENEM — Introdução](https://docs.enem.dev/introduction)
- [Rate limits](https://docs.enem.dev/rate-limits)
- [Self-hosting](https://docs.enem.dev/self-hosting)
- [Repositório yunger7/enem-api](https://github.com/yunger7/enem-api)
- Seed do projeto: `apps/api/prisma/seed-enem.ts`
- Cronograma backend S1: `docs/CRONOGRAMA-BACKEND.md`
