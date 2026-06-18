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
        └── out/             # Implementações reais (Banco Postgres/Supabase, API Gemini)