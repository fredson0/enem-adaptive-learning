# Escopo do Produto — ENEM+ (TCC)

> Documento oficial de **o que o sistema faz**, **o que fica fora**, e **o que existe em cada tela**.  
> Atualizado para incluir upload de imagens no tutor (vision) com storage **fora do Railway**.

**Relacionado:** [WORKSPACE-UI-OSMO.md](./WORKSPACE-UI-OSMO.md) · [ESCOLHA-MODELO-IA.md](./ESCOLHA-MODELO-IA.md) · [INFRAESTRUTURA-RAILWAY.md](./INFRAESTRUTURA-RAILWAY.md) · [CRONOGRAMA-IMPLEMENTACAO.md](./CRONOGRAMA-IMPLEMENTACAO.md)

---

## Decisão de escopo (TCC)

| Nível | Descrição | Status |
|-------|-----------|--------|
| **MVP** | Tutor texto + simulados + métricas + planos | ✅ Escopo principal |
| **MVP+** | Upload de **1 imagem por mensagem** no tutor (foto de questão ou resolução) | ✅ **Incluído no TCC** |
| **Pós-TCC** | OCR avançado, correção de redação manuscrita, PDF gerado, histórico longo de anexos | ❌ Fora do TCC |

---

## Ciclo pedagógico

```
Login → Tutor IA (dúvidas livres ou foto)
         ↓
    Simulado → Resultado → "Explicar com IA" (contexto automático)
         ↓
    Progresso + Trilha → novo simulado focado na lacuna
```

---

## Capacidades do Tutor IA

| Capacidade | Fase | Incluído? |
|------------|------|-----------|
| Explicar erro pós-simulado (enunciado + alternativas em texto) | F3 | ✅ |
| Pergunta livre sobre tema ENEM | F3 | ✅ |
| Adaptar linguagem ao nível do aluno (`nivelAtual`) | F3 | ✅ |
| **Enviar foto de questão ou resolução no caderno** | F3 | ✅ |
| Persistir histórico de conversas (sidebar) | F3 | ✅ |
| Resumir tema de área fraca | F4 | ✅ |
| Gerar PDF de resumo | F5+ | ❌ opcional |
| Corrigir redação ENEM (competências) | F5+ | ❌ |
| Múltiplas imagens por mensagem | — | ❌ |
| Vídeo / áudio | — | ❌ |

### Regras do upload de imagem (MVP+)

| Regra | Valor |
|-------|-------|
| Formatos | JPEG, PNG, WebP |
| Tamanho máximo | 2 MB (comprimir no frontend antes do upload) |
| Imagens por mensagem | 1 |
| Custo em tokens | Conta como **2×** uma mensagem só texto no rate limit |
| Retenção | URL no Postgres; arquivo no **Cloudflare R2** com lifecycle de **30 dias** |
| Privacidade | Não usar imagens para treino; aviso na política de privacidade |

---

## Storage de arquivos (imagens)

**Railway NÃO armazena imagens de usuário.** Responsabilidades:

| Serviço | O que guarda |
|---------|--------------|
| **Railway PostgreSQL** | Metadados: `conversas`, `mensagens`, `url` do anexo, `userId`, `expiresAt` |
| **Railway Redis** | Rate limit de tokens IA |
| **Cloudflare R2** | Arquivos binários (fotos enviadas pelo aluno) |
| **NVIDIA NIM** | Texto + vision (primário); não persiste |
| **Groq / Gemini** | Fallback vision e texto |

### Fluxo de upload

```
1. Aluno seleciona foto no chat (/tutor)
2. Frontend comprime (max 2 MB) e chama POST /ia-tutor/anexos/presign
3. API gera URL pré-assinada do R2 (upload direto, sem passar pelo servidor)
4. Frontend faz PUT na URL do R2
5. Aluno envia mensagem com { texto, anexoUrl }
6. API baixa a imagem do storage → **NVIDIA Llama 3.2 Vision** (fallback Groq → Gemini)
7. Resposta salva em mensagens; URL fica no Postgres até expiresAt
8. Job/cron (F4) remove objetos R2 expirados
```

**Alternativa aceita:** Vercel Blob (mesmo padrão presign). R2 é a escolha oficial por custo (10 GB free) e compatibilidade S3.

Detalhes de setup: [INFRAESTRUTURA-RAILWAY.md — Object Storage](./INFRAESTRUTURA-RAILWAY.md#object-storage-cloudflare-r2)

---

## Mapa de telas (especificação)

### Área pública

| Rota | Conteúdo | Ações do usuário |
|------|----------|------------------|
| `/` | Landing: hero, benefícios, planos resumidos | CTA → `/login` |
| `/login` | Botão "Entrar com Google" | OAuth → onboarding ou `/tutor` |
| `/onboarding` | Nome, escola, série, toggle escola pública | Salvar → `/tutor` |

### Workspace (autenticado)

| Rota | Conteúdo | Ações do usuário | API |
|------|----------|------------------|-----|
| `/tutor` | Chat vazio, input texto + **botão anexar imagem**, animação wave | Nova pergunta, enviar foto+texto | `POST /ia-tutor/mensagens` |
| `/tutor/[chatId]` | Histórico da conversa (texto + thumbnails de imagens) | Continuar chat, anexar imagem | `GET/POST conversas` |
| `/simulados` | Cards: em andamento, concluídos | Novo simulado, retomar | `GET /simulados` |
| `/simulados/novo` | Área ENEM, quantidade de questões, dificuldade | Gerar simulado | `POST /simulados` |
| `/simulados/[id]` | Enunciado (texto + **imagem fixa do banco** se houver), A–E, timer | Responder, navegar, finalizar | `POST .../resposta` |
| `/simulados/[id]/resultado` | Score, erros, gabarito | Clicar "Explicar com IA" → `/tutor/[novo]` com contexto | redirect + contexto |
| `/trilha` | Top 3 lacunas, sugestão semanal | CTA simulado focado | `GET /metricas/lacunas` |
| `/progresso` | Radar 5 áreas, evolução 30 dias | Somente leitura | `GET /metricas/*` |
| `/planos` | Gratuito vs Apoio, tokens/dia | Checkout Mercado Pago | `GET /usuarios/plano` |
| `/perfil` | Avatar (Google), nome, escola, série | Editar, logout | `PATCH /usuarios/perfil` |

### Shell global (todas as rotas workspace)

| Elemento | Comportamento |
|----------|---------------|
| Sidebar flutuante | Tutor IA + chats, Simulados, Trilha, Progresso, Perfil |
| Badge plano (canto sup. direito) | Tokens IA restantes → link `/planos` |
| Sem topbar no `/tutor` | Chat ocupa painel inteiro (estilo Osmo) |

---

## Modelo de dados (novas tabelas — F3)

```prisma
model Conversa {
  id        String   @id @default(uuid())
  userId    String
  titulo    String   // auto-gerado da 1ª mensagem
  contexto  Json?    // questaoId se veio do simulado
  criadoEm  DateTime @default(now())
  mensagens Mensagem[]
}

model Mensagem {
  id          String   @id @default(uuid())
  conversaId  String
  role        String   // user | assistant
  conteudo    String
  anexoUrl    String?  // URL R2
  anexoTipo   String?  // image/jpeg etc.
  tokensUsados Int     @default(0)
  criadoEm    DateTime @default(now())
}
```

> Imagens de **questões do simulado** (enunciado) ficam em `questoes.imagemUrl` — URL estática no seed, não upload do aluno.

---

## Endpoints novos (F3)

| Método | Rota | Função |
|--------|------|--------|
| `GET` | `/ia-tutor/conversas` | Lista chats da sidebar |
| `GET` | `/ia-tutor/conversas/:id` | Mensagens do chat |
| `POST` | `/ia-tutor/conversas` | Nova conversa |
| `POST` | `/ia-tutor/conversas/:id/mensagens` | Enviar texto (+ anexoUrl opcional) |
| `POST` | `/ia-tutor/anexos/presign` | URL pré-assinada R2 para upload |
| `POST` | `/ia-tutor/explicar-erro` | Atalho: cria conversa com contexto da questão |

---

## Rate limit (tokens IA)

| Plano | Mensagens texto/dia | Mensagens com imagem/dia* |
|-------|---------------------|---------------------------|
| Gratuito (escola pública) | 5 | 2 |
| Apoio (pago) | 30 | 10 |

\*Cada mensagem com imagem consome **2 unidades** do contador diário.

---

## Fora do escopo do TCC

- Correção completa de redação manuscrita
- Chat em grupo / sala de aula professor
- App mobile nativo
- Offline mode
- Armazenamento permanente de fotos (> 30 dias)
- Painel professor completo (opcional F5 se sobrar tempo)

---

## Referências

- [Gemini multimodal (vision)](https://ai.google.dev/gemini-api/docs/vision)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [WORKSPACE-UI-OSMO.md](./WORKSPACE-UI-OSMO.md) — checklist visual por tela
