🎓 Plataforma Educacional Adaptativa (TCC)

📖 Sobre o Projeto

Este projeto é o produto final de um Trabalho de Conclusão de Curso (TCC) focado em Inclusão Digital e Democratização do Estudo para o ENEM. Trata-se de uma Plataforma Educacional Adaptativa que utiliza Inteligência Artificial (**NVIDIA NIM** com fallback **Gemini 2.5 Flash**) para identificar lacunas de conhecimento do aluno e gerar trilhas de estudo personalizadas.

O grande diferencial do projeto é o seu foco em acessibilidade social. Através de um modelo Freemium sustentável, alunos pagantes de planos com valor simbólico subsidiam o custo da infraestrutura e da Inteligência Artificial para alunos de baixa renda oriundos de escolas públicas.

🚀 Principais Funcionalidades

🧠 Tutor Virtual IA: Integração com **NVIDIA NIM** (`meta/llama-3.1-8b-instruct`) para texto e **NVIDIA Llama 3.2 Vision** para fotos, com fallback **Groq** → **Gemini 2.5 Flash** via `IaEngineRouter`. Chat persistido no Postgres, contexto de métricas reais, explicação de erros pós-simulado e dicas durante o simulado. **Upload de foto** (questão ou resolução no caderno) com compressão no frontend e storage local (dev) / S3 Railway Bucket (prod).

🔐 Autenticação Segura (Google Login): Acesso facilitado via OAuth2 com o Google. Sessão com **cookies HttpOnly** no frontend (BFF Next.js) e **refresh tokens** rotativos na API.

📝 Simulados ENEM: Banco de ~10 mil questões reais (seed via api.enem.dev). Criar simulado por área, **pedir à IA em linguagem natural** (`POST /simulados/gerar-com-ia`), filtros multi-ano e termos no enunciado. Responder questões A–E e ver resultado com gabarito + explicação IA.

📊 Métricas de Proficiência: API de proficiência, evolução e lacunas por área ENEM. Telas **Progresso** e **Trilha** conectadas ao backend; recálculo automático ao finalizar simulado. A **Trilha** inclui diagnóstico inicial (autoavaliação + disciplinas fracas + meta) e plano sequencial por área ENEM — ver [Trilha personalizada](docs/TRILHA-PERSONALIZADA.md).

💳 Sistema de Sustentabilidade (Planos e Tokens): - Plano Gratuito: Focado em alunos de escolas públicas, com um limite de tokens de IA diários para garantir a viabilidade financeira do projeto.

Plano de Apoio (Ex: R$ 20,00): Acesso a cotas generosas de tokens de IA, onde a arrecadação mantém os servidores no ar e subsidia os usuários gratuitos. Integração via Mercado Pago.

Rate Limiting Dinâmico: Controle em tempo real do uso de Inteligência Artificial usando Redis.

🏗️ Arquitetura de Software

O sistema foi desenhado visando alta escalabilidade, isolamento de regras de negócio e facilidade de manutenção, utilizando práticas de mercado de nível Sênior.

Padrão Arquitetural: Arquitetura Hexagonal (Ports & Adapters) / Clean Architecture.

Estrutura de Repositório: Monorepo gerenciado via NPM Workspaces / Turborepo.

Isolamento: As regras de negócio (Domínio/Core) não possuem acoplamento direto com o Banco de Dados ou Frameworks Web.

💻 Stack Tecnológica

Frontend: Next.js (React), Tailwind CSS, TypeScript.

Backend: NestJS, TypeScript, JWT (JSON Web Tokens).

Banco de Dados (Relacional): PostgreSQL hospedado no **Railway** + ORM **Prisma** (sem Supabase).

Cache & Rate Limit: Redis (Railway ou Upstash).

Integrações Externas (Adapters): Google OAuth2, **NVIDIA NIM** (texto + vision) + Groq/Gemini (fallback), object storage local/S3 (anexos do tutor), Mercado Pago API.

Infraestrutura: **Vercel** (Frontend) + **Railway** (API, PostgreSQL e Redis) + **Railway Bucket / S3** (anexos em produção).

📂 Estrutura de Diretórios (Backend Hexagonal)

A organização segue o padrão "Package by Feature", dividida por módulos independentes:

apps/api/src/
 ├── app.module.ts
 ├── infrastructure/            # Configurações globais (Railway DB, Redis)
 └── modules/
     ├── usuarios/
     │   ├── core/
     │   │   ├── domain/        # Entidades (Usuario, PerfilAluno)
     │   │   └── application/   # Casos de Uso e Ports (Interfaces)
     │   └── infrastructure/
     │       └── adapters/      # Controllers (HTTP), Repositórios (Postgres) e Google OAuth
     ├── questoes/
     ├── simulados/
     ├── ia-tutor/
     └── metricas/


🛠️ Como Executar o Projeto Localmente

Pré-requisitos

Node.js (v18+)

PostgreSQL (Local ou URL do Railway)

Redis (Opcional para ambiente de dev)

Contas ativas: Google Cloud Console (OAuth), **NVIDIA Build** (NIM) e/ou Google AI Studio (Gemini), Mercado Pago Developers.

Passo a Passo

Clone o repositório:

git clone [https://github.com/seu-usuario/enem-adaptive-learning.git](https://github.com/seu-usuario/enem-adaptive-learning.git)
cd enem-adaptive-learning


Instale as dependências (Monorepo):

npm install


Configure as Variáveis de Ambiente (apps/api/.env):

```env
# Database — Docker local (porta 5433) ou Railway
DATABASE_URL="postgresql://enem:enem_dev_password@localhost:5433/enem_adaptive"

# JWT Auth
JWT_SECRET="sua_chave_secreta_super_segura"

# CORS (frontend)
CORS_ORIGIN="http://localhost:3001"

# Externals
GOOGLE_CLIENT_ID="seu_client_id.apps.googleusercontent.com"
GEMINI_API_KEY="sua_chave_do_google_ai_studio"
GEMINI_MODEL="gemini-2.5-flash"
IA_PROVIDER="nvidia"
NVIDIA_API_KEY="sua_chave_build.nvidia.com"
NVIDIA_MODEL="meta/llama-3.1-8b-instruct"
NVIDIA_VISION_MODEL="meta/llama-3.2-11b-vision-instruct"
# GROQ_API_KEY="opcional_fallback_vision"
STORAGE_PROVIDER="local"
LOCAL_UPLOAD_DIR="./.uploads"
LOCAL_UPLOAD_BASE_URL="http://localhost:3333/dev-uploads"
MERCADOPAGO_ACCESS_TOKEN="seu_token_do_mercado_pago"
REDIS_URL="redis://localhost:6379"
```

Suba o banco, aplique migrations e popule questões ENEM:

```bash
docker compose up -d
npm run prisma:migrate:deploy -w apps/api
npm run prisma:seed -w apps/api
# Opcional: limitar anos — SEED_YEARS=2022,2023 npm run prisma:seed -w apps/api
# Ver self-hosting da API ENEM (evitar rate limit no seed): docs/BANCO-QUESTOES-ENEM.md
```

Execute o ambiente de desenvolvimento:

```bash
# Frontend (Next.js) — http://localhost:3001
npm run dev:web

# Backend (NestJS) — http://localhost:3333
npm run dev:api
```

### Portas do projeto

| App | Porta | Comando |
|-----|-------|---------|
| Frontend (`apps/web`) | **3001** | `npm run dev:web` |
| Backend (`apps/api`) | **3333** | `npm run dev:api` |
| PostgreSQL (Docker) | **5433** | `docker compose up -d` |

> A porta **5433** evita conflito com Postgres local na 5432. O frontend usa 3001 para não colidir com outros apps na 3000.


📈 Impacto Acadêmico e Social

Este projeto será testado com dados reais em escolas, comprovando que a união de ferramentas open-source, arquitetura escalável (Railway/NestJS) e modelos de linguagem generativos (LLMs) pode democratizar o ensino de ponta, tornando a preparação para o ENEM acessível a qualquer classe social.

Desenvolvido com 🩵 e foco em educação para o Trabalho de Conclusão de Curso.

---

## 📚 Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| [Infraestrutura Railway](docs/INFRAESTRUTURA-RAILWAY.md) | Setup Railway (API, PostgreSQL, Redis) + R2 para imagens |
| [Escopo do Produto](docs/ESCOPO-PRODUTO.md) | Telas, tutor vision, storage, fora do TCC |
| [Segurança Auth](docs/SEGURANCA-AUTH.md) | HttpOnly, refresh, rate limit, anti privilege-escalation |
| [Trilha personalizada](docs/TRILHA-PERSONALIZADA.md) | Diagnóstico, priorização por área ENEM, etapas e roadmap UI Osmo |
| [Simulados — modos e polish](docs/SIMULADOS-POLISH.md) | Treino, modalidade, cronômetro, UX e API |
| [Banco de questões ENEM](docs/BANCO-QUESTOES-ENEM.md) | api.enem.dev, rate limit, self-hosting e seed |
| [Tutor IA — Perguntas e Endpoints](docs/TUTOR-IA-PERGUNTAS-E-ENDPOINTS.md) | Tipos de pergunta do aluno, o que funciona hoje e endpoints futuros |
| [Workspace UI (OSMO)](docs/WORKSPACE-UI-OSMO.md) | Área logada do aluno — sidebar, rotas, checklist |
| [Conceitos de Segurança e Performance](docs/CONCEITOS-SEGURANCA-E-PERFORMANCE.md) | 20 conceitos (idempotência, rate limit, JWT, etc.) com quando e onde implementar |
| [Cronograma de Implementação](docs/CRONOGRAMA-IMPLEMENTACAO.md) | Roadmap em 5 fases — backend e frontend sincronizados |
| [Backend API](apps/api/README.md) | Prisma, migrations e estrutura hexagonal |