# Workspace do Aluno — Design OSMO + Checklist

> Área autenticada onde o aluno estuda. Referência visual: **Osmo Supply / The Vault** (sidebar escura, tipografia limpa, cantos levemente arredondados, hierarquia forte).

**Relacionado:** [CRONOGRAMA-IMPLEMENTACAO.md](./CRONOGRAMA-IMPLEMENTACAO.md) · [ESCOLHA-MODELO-IA.md](./ESCOLHA-MODELO-IA.md) · [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md)

---

## Visão geral

A landing page é a **porta de entrada**. O workspace (`/tutor`, `/simulados`, etc.) é onde o aluno **trabalha** — no mesmo espírito do Osmo Vault: navegação lateral fixa + área de conteúdo ampla.

### Ciclo pedagógico do produto

```
Simulado → Resultado → Tutor IA (chat) → Métricas → Trilha → novo Simulado
```

A sidebar reflete essa ordem de importância na UX: **Tutor IA (chats) no topo**, depois as demais abas, **perfil embaixo**, **planos no canto superior direito**.

---

## Layout (wireframe)

```
┌──────────────────┬────────────────────────────────────────────────────────┐
│  ENEM+       ✦   │  [breadcrumb]                    [Plano · 12/20 IA]  │
├──────────────────┤                                                        │
│  Tutor IA    ●   │                                                        │
│  ┌─────────────┐ │              ÁREA DE CONTEÚDO                          │
│  │ + Nova conv │ │         (chat / simulados / trilha / progresso)        │
│  │ Erro Q12 MT │ │                                                        │
│  │ Função 2º   │ │                                                        │
│  └─────────────┘ │                                                        │
│                  │                                                        │
│  ○ Simulados     │                                                        │
│  ○ Trilha        │                                                        │
│  ○ Progresso     │                                                        │
│                  │                                                        │
│  ─────────────   │                                                        │
│  [○] Maria Silva │  ← perfil (link /perfil)                               │
└──────────────────┴────────────────────────────────────────────────────────┘
     ~260px                    flex-1
```

### Regras de posicionamento (espelhando Osmo)

| Zona | Conteúdo | Comportamento |
|------|----------|---------------|
| **Sidebar topo** | Logo ENEM+ | Link para `/tutor` |
| **Sidebar — seção 1** | Tutor IA + lista de chats | Sempre visível; item ativo com fundo `#1c212b` |
| **Sidebar — seção 2** | Simulados, Trilha, Progresso | Links de navegação com ícone + label |
| **Sidebar — rodapé** | Avatar + nome do aluno | Fixo no bottom; abre `/perfil` |
| **Topbar direita** | Badge de plano + tokens IA | Link para `/planos` (flutuante no `/tutor`, sem barra horizontal) |
| **Conteúdo** | Página ativa | Fundo `#080b12`, padding generoso |

---

## Design system (workspace)

Reutiliza tokens da landing, adaptados ao workspace:

| Token | Valor | Uso |
|-------|-------|-----|
| `--ws-bg` | `#111111` (`--osmo-canvas`) | Fundo geral texturizado |
| `--ws-sidebar` | `#181818` (`--osmo-sidebar`) | Sidebar flutuante |
| `--ws-surface` | `#111111` | Painel principal |
| `--ws-surface-2` | `#141414` (`--osmo-card`) | Cards |
| `--ws-border` | `#2a2a2a` | Bordas |
| `--ws-accent` | `#b0ff57` | Destaque Osmo (ícones) |
| `--ws-text` | `#ffffff` | Texto principal |
| `--ws-muted` | `rgba(255,255,255,0.55)` | Secundário |
| **Fonte** | Inter | Igual landing / Hartmann |
| **Radius** | `6px` / `10px` | Botões / cards (não pill) |

### Componentes base

| Componente | Arquivo | Status |
|------------|---------|--------|
| `WorkspaceSidebar` | `components/workspace/workspace-sidebar.tsx` | ✅ Esboço |
| `WorkspaceTopbar` | `components/workspace/workspace-topbar.tsx` | ✅ Esboço |
| `ChatList` | `components/workspace/chat-list.tsx` | ✅ Mock |
| `PlanBadge` | `components/workspace/plan-badge.tsx` | ✅ Mock |
| `WorkspaceNavItem` | inline na sidebar | ✅ |
| `TutorChatPanel` | `components/workspace/tutor-chat-view.tsx` + `ai-input-hero.tsx` | ✅ Esboço |
| `SimuladoCard` | `components/workspace/simulado-card.tsx` | ✅ F2 (lista inline) |
| `ProficienciaChart` | `components/workspace/proficiencia-chart.tsx` | ⬜ F4 |
| `TrilhaTopicList` | `components/workspace/trilha-topic-list.tsx` | ⬜ F4 |

---

## Mapa de rotas

| Rota | Tela | Módulo backend | Fase |
|------|------|----------------|------|
| `/tutor` | Chat tutor IA (default) | `ia-tutor` | F3 |
| `/tutor/[chatId]` | Conversa específica | `ia-tutor` | F3 |
| `/simulados` | Histórico + novo simulado | `simulados` | F2 ✅ |
| `/simulados/novo` | Configurar simulado | `simulados` | F2 ✅ |
| `/simulados/[id]` | Questões A–E + progresso | `simulados` | F2 ✅ |
| `/simulados/[id]/resultado` | Acertos/erros + explicar IA | `simulados` + `ia-tutor` | F2 ✅ / F3 |
| `/trilha` | Áreas fracas + próximos tópicos | `metricas` | F4 |
| `/progresso` | Gráficos de proficiência | `metricas` | F4 |
| `/planos` | Gratuito vs Apoio + checkout | `usuarios` + MP | F3 |
| `/perfil` | Dados do aluno + escola | `usuarios` | F1 |
| `/login` | Google OAuth | `usuarios` | F1 |
| `/onboarding` | Primeiro acesso | `usuarios` | F1 |

> **Default pós-login:** redirecionar para `/tutor`.

---

## Checklist mestre — Workspace

### Fase 0 — Esboço UI (agora)

- [x] Documentar layout OSMO + rotas (`WORKSPACE-UI-OSMO.md`)
- [x] Criar route group `app/(workspace)/`
- [x] `WorkspaceSidebar` com chat list mock + nav + perfil
- [x] `WorkspaceTopbar` com badge de plano/tokens
- [x] Páginas placeholder: tutor, simulados, trilha, progresso, perfil, planos
- [ ] Validar responsividade mobile (sidebar colapsável)
- [x] Integrar template de chat (`ai-input-hero`) em `/tutor`

### Fase 1 — Fundação (auth) ✅

- [x] `app/login/page.tsx` — botão Google
- [x] `lib/api.ts` — BFF com cookies HttpOnly
- [x] `proxy.ts` — proteger `(workspace)/*`
- [x] `app/onboarding/page.tsx` — nome, curso, ano escolar, tipo ensino médio
- [x] Conectar perfil real em `WorkspaceSidebar`
- [x] `/perfil` com dados reais da API
- [ ] `GET /usuarios/plano` no `PlanBadge`

### Fase 2 — Simulados ✅

- [x] `/simulados` — lista do histórico (API)
- [x] `/simulados/novo` — filtro área + quantidade + ano opcional
- [x] `/simulados/[id]` — questão A–E + progresso
- [x] `/simulados/[id]/resultado` — score + gabarito + erros
- [ ] Botão "Explicar com IA" → cria chat em `/tutor/[chatId]` (F3)
- [x] Estados loading/erro básicos

### Fase 3 — Tutor IA + Planos

- [ ] Integrar template de chat (lista + mensagens)
- [ ] `POST /ia-tutor/explicar-erro`
- [ ] Persistir conversas (lista na sidebar)
- [ ] `PlanBadge` com tokens restantes em tempo real
- [ ] `/planos` — cards Gratuito / Apoio
- [ ] Checkout Mercado Pago + feedback pós-pagamento
- [ ] Rate limit UX (toast quando tokens acabam)

### Fase 4 — Trilha + Progresso

- [ ] `/progresso` — radar ou barras por área ENEM
- [ ] Gráfico evolução temporal (Recharts)
- [ ] `/trilha` — lacunas + CTA "Simulado focado"
- [ ] Cache visual (skeleton enquanto carrega métricas)

### Fase 5 — Piloto TCC

- [ ] Testes e2e fluxo login → simulado → tutor
- [ ] Ajustes de acessibilidade (foco, contraste)
- [ ] PWA básico (opcional)
- [ ] Painel professor (se houver tempo)

---

## Checklist por tela

### `/tutor` — Tutor IA

- [x] Layout com sidebar de chats (mock)
- [x] Área central com `HeroWave` (input + animação wave)
- [x] Sem topbar horizontal — fundo contínuo com o chat
- [ ] Lista de conversas da API
- [ ] Nova conversa
- [ ] Mensagens com streaming (opcional)
- [ ] Contexto de questão quando veio do simulado
- [ ] **Botão anexar imagem** (JPEG/PNG, max 2 MB, comprimir no client)
- [ ] Preview thumbnail da imagem antes de enviar
- [ ] Upload via presign R2 → `POST /ia-tutor/anexos/presign`
- [ ] Indicador de tokens usados na sessão

> Escopo completo do tutor (texto + vision + rate limit): [ESCOPO-PRODUTO.md](./ESCOPO-PRODUTO.md)

### `/simulados`

- [x] Lista de simulados da API (status: em andamento, concluído)
- [x] CTA "Novo simulado"
- [ ] Filtro por área
- [x] Empty state para primeiro simulado

### `/simulados/novo`

- [x] Seleção de área (CN, CH, LC, MT, RED)
- [x] Quantidade (5/10/20 questões)
- [x] Ano opcional + preview N questões

### `/simulados/[id]`

- [x] Enunciado + alternativas A–E
- [x] Barra de progresso
- [ ] Timer
- [ ] Navegação entre questões (só sequencial v1)
- [x] Finalizar simulado

### `/simulados/[id]/resultado`

- [x] Score + lista de erros
- [x] Gabarito por questão errada
- [ ] "Explicar erro com IA" funcional (placeholder → F3)

### `/trilha`

- [x] Placeholder com áreas mock
- [ ] Top 3 lacunas do aluno
- [ ] Sugestão semanal de estudo
- [ ] Link para simulado focado

### `/progresso`

- [x] Placeholder com cards de proficiência mock
- [ ] Gráfico radar 5 áreas
- [ ] Linha do tempo (últimos 30 dias)
- [ ] Comparativo "vs. semana passada"

### `/planos`

- [x] Placeholder Gratuito / Apoio
- [ ] Detalhe de tokens/dia
- [ ] CTA Mercado Pago
- [ ] Mensagem inclusão digital (escola pública)

### `/perfil`

- [x] Avatar + nome + email reais (API)
- [x] Exibir plano, curso, ano escolar, tipo ensino médio, nível
- [ ] Editar perfil inline
- [ ] Logout

---

## Estrutura de arquivos (frontend)

```
apps/web/
├── app/
│   ├── page.tsx                    # Landing (marketing)
│   ├── login/page.tsx              # F1
│   ├── onboarding/page.tsx         # F1
│   └── (workspace)/
│       ├── layout.tsx              # Shell OSMO
│       ├── tutor/
│       │   ├── page.tsx
│       │   └── [chatId]/page.tsx   # F3
│       ├── simulados/
│       │   ├── page.tsx
│       │   ├── novo/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── resultado/page.tsx
│       ├── trilha/page.tsx
│       ├── progresso/page.tsx
│       ├── planos/page.tsx
│       └── perfil/page.tsx
├── components/
│   └── workspace/
│       ├── workspace-sidebar.tsx
│       ├── workspace-topbar.tsx
│       ├── chat-list.tsx
│       └── plan-badge.tsx
└── lib/
    └── workspace-nav.ts
```

---

## Integração com backend (por aba)

| Aba | Endpoints |
|-----|-----------|
| Tutor IA | `POST /ia-tutor/conversas`, `POST /ia-tutor/conversas/:id/mensagens`, `POST /ia-tutor/anexos/presign`, `GET /ia-tutor/conversas`, `POST /ia-tutor/explicar-erro` |
| Simulados | `POST /simulados`, `GET /simulados`, `GET /simulados/:id`, `POST /simulados/:id/respostas`, `POST /simulados/:id/finalizar` |
| Progresso | `GET /metricas/proficiencia`, `GET /metricas/evolucao` |
| Trilha | Derivado de `proficiencias_area` (áreas abaixo de threshold) |
| Planos | `GET /usuarios/plano`, webhook Mercado Pago |
| Perfil | `PATCH /usuarios/perfil`, `POST /usuarios/login-google` |

---

## Próximos passos imediatos

1. Rodar seed: `npm run prisma:seed -w apps/api` (opcional: `SEED_YEARS=2022,2023`)
2. Testar fluxo: `/simulados/novo` → responder → `/resultado`
3. **S3:** `IaEnginePort` + `POST /ia-tutor/explicar-erro` + botão no resultado
4. Integrar template de chat em `/tutor` com contexto da questão errada

---

## Referências visuais

- Osmo Supply — The Vault (sidebar + search + cards)
- Landing ENEM+ — paleta e tipografia Inter já definidas
- Hartmann Capital — hierarquia tipográfica do hero (aplicada em títulos de seção do workspace)
