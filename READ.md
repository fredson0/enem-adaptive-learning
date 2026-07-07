🎓 Plataforma Educacional Adaptativa (TCC)

📖 Sobre o Projeto

Este projeto é o produto final de um Trabalho de Conclusão de Curso (TCC) focado em Inclusão Digital e Democratização do Estudo para o ENEM. Trata-se de uma Plataforma Educacional Adaptativa que utiliza Inteligência Artificial (Google Gemini) para identificar lacunas de conhecimento do aluno e gerar trilhas de estudo personalizadas.

O grande diferencial do projeto é o seu foco em acessibilidade social. Através de um modelo Freemium sustentável, alunos pagantes de planos com valor simbólico subsidiam o custo da infraestrutura e da Inteligência Artificial para alunos de baixa renda oriundos de escolas públicas.

🚀 Principais Funcionalidades

🧠 Tutor Virtual IA: Integração com a API do Google Gemini para explicar erros em questões do ENEM de forma didática e adaptada ao nível do aluno.

🔐 Autenticação Segura (Google Login): Acesso facilitado e seguro via OAuth2 com o Google, sem necessidade de gerenciamento local de senhas.

📊 Métricas de Proficiência: Algoritmos que calculam o nível de domínio do aluno em cada área do conhecimento com base no histórico de simulados.

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

Banco de Dados (Relacional): PostgreSQL hospedado no Railway (Alta performance sob concorrência).

Cache & Rate Limit: Redis.

Integrações Externas (Adapters): Google OAuth2, Google Gemini API, Mercado Pago API.

Infraestrutura: Vercel (Frontend) & Railway Pro (Backend e Banco de Dados para testes de carga em escolas).

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

Contas ativas: Google Cloud Console (OAuth), Gemini API Studio, Mercado Pago Developers.

Passo a Passo

Clone o repositório:

git clone [https://github.com/seu-usuario/enem-adaptive-learning.git](https://github.com/seu-usuario/enem-adaptive-learning.git)
cd enem-adaptive-learning


Instale as dependências (Monorepo):

npm install


Configure as Variáveis de Ambiente (apps/api/.env):

# Database (Railway)
DATABASE_URL="postgresql://user:password@containers-us-west-XX.railway.app:5432/railway"

# JWT Auth
JWT_SECRET="sua_chave_secreta_super_segura"

# Externals
GOOGLE_CLIENT_ID="seu_client_id.apps.googleusercontent.com"
GEMINI_API_KEY="sua_chave_do_google_ai_studio"
MERCADOPAGO_ACCESS_TOKEN="seu_token_do_mercado_pago"


Execute o ambiente de desenvolvimento:

# Para rodar a API (NestJS)
npm run start:dev -w apps/api

# Para rodar o Frontend (Next.js)
npm run dev -w apps/web


📈 Impacto Acadêmico e Social

Este projeto será testado com dados reais em escolas, comprovando que a união de ferramentas open-source, arquitetura escalável (Railway/NestJS) e modelos de linguagem generativos (LLMs) pode democratizar o ensino de ponta, tornando a preparação para o ENEM acessível a qualquer classe social.

Desenvolvido com 🩵 e foco em educação para o Trabalho de Conclusão de Curso.

---

## 📚 Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| [Conceitos de Segurança e Performance](docs/CONCEITOS-SEGURANCA-E-PERFORMANCE.md) | 20 conceitos (idempotência, rate limit, JWT, etc.) com quando e onde implementar |
| [Cronograma de Implementação](docs/CRONOGRAMA-IMPLEMENTACAO.md) | Roadmap em 5 fases — backend e frontend sincronizados |
| [Backend API](apps/api/README.md) | Prisma, migrations e estrutura hexagonal |