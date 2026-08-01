# 🎛️ Backend API - NestJS (Arquitetura Hexagonal)

Esta é a API central do ecossistema de aprendizagem adaptativa do ENEM. O projeto foi estruturado seguindo rigorosamente a **Arquitetura Hexagonal (Ports & Adapters)** para garantir o isolamento completo das regras de negócio (Domínio) em relação a provedores externos.

## 🏛️ Estrutura do Código (`src/modules/...`)

Cada módulo do sistema (ex: `questoes`, `usuarios`) é dividido nas seguintes camadas:

```text
src/modules/[modulo]/
├── core/
│   ├── domain/              # Entidades e regras de negócio puras (TypeScript puro)
│   └── application/
│       ├── ports/           # Interfaces/Contratos (Ex: IQuestaoRepository, IIAEngine)
│       └── use-cases/       # Casos de uso da aplicação (Ex: AvaliarRespostaUseCase)
└── infrastructure/
    └── adapters/
        ├── in/http/         # Controllers NestJS (Recebem requisições do Next.js)
        └── out/             # Implementações reais (Prisma/Postgres/Railway, Gemini, Groq)
```

## 🗄️ Banco de Dados (Prisma + Railway PostgreSQL)

- Schema: `prisma/schema.prisma`
- Client gerado: `generated/prisma`
- Migrations: `prisma/migrations/`

### Comandos úteis

```bash
# Gerar client após alterar o schema
npm run prisma:generate -w apps/api

# Criar/aplicar migration (dev)
npm run prisma:migrate -w apps/api

# Aplicar migrations em produção (Railway)
npm run prisma:migrate:deploy -w apps/api
```

Copie `apps/api/.env.example` para `apps/api/.env` e configure `DATABASE_URL` com a URL do Railway.

## Documentação relacionada

- [Infraestrutura Railway](../../docs/INFRAESTRUTURA-RAILWAY.md)
- [Escolha do Modelo de IA](../../docs/ESCOLHA-MODELO-IA.md)
