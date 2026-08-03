# Workspace do Aluno — Design OSMO + Checklist

> Área autenticada onde o aluno estuda. Referência visual: **Osmo Supply / The Vault** (sidebar escura, tipografia limpa, cantos levemente arredondados, hierarquia forte).

**Relacionado:** [CRONOGRAMA-IMPLEMENTACAO.md](./CRONOGRAMA-IMPLEMENTACAO.md) · [ESCOLHA-MODELO-IA.md](./ESCOLHA-MODELO-IA.md)

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
| **Topbar direita** | Badge de plano + tokens IA | Link para `/planos` |
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
| `SimuladoCard` | `components/workspace/simulado-card.tsx` | ⬜ F2 |
| `ProficienciaChart` | `components/workspace/proficiencia-chart.tsx` | ⬜ F4 |
| `TrilhaTopicList` | `components/workspace/trilha-topic-list.tsx` | ⬜ F4 |

---

## Mapa de rotas

| Rota | Tela | Módulo backend | Fase |
|------|------|----------------|------|
| `/tutor` | Chat tutor IA (default) | `ia-tutor` | F3 |
| `/tutor/[chatId]` | Conversa específica | `ia-tutor` | F3 |
| `/simulados` | Histórico + novo simulado | `simulados` | F2 |
| `/simulados/novo` | Configurar simulado | `simulados` | F2 |
| `/simulados/[id]` | Questões A–E + timer | `simulados` | F2 |
| `/simulados/[id]/resultado` | Acertos/erros + explicar IA | `simulados` + `ia-tutor` | F2–F3 |
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

### Fase 1 — Fundação (auth)

- [ ] `app/login/page.tsx` — botão Google
- [ ] `lib/api.ts` — cliente com JWT
- [ ] `middleware.ts` — proteger `(workspace)/*`
- [ ] `app/onboarding/page.tsx` — nome, escola pública
- [ ] Conectar perfil real em `WorkspaceSidebar`
- [ ] `GET /usuarios/plano` no `PlanBadge`

### Fase 2 — Simulados

- [ ] `/simulados` — lista com paginação
- [ ] `/simulados/novo` — filtro área + dificuldade
- [ ] `/simulados/[id]` — questão + timer + idempotency-key
- [ ] `/simulados/[id]/resultado` — gabarito visual
- [ ] Botão "Explicar com IA" → cria chat em `/tutor/[chatId]`
- [ ] Estados loading/erro globais

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
- [ ] Lista de conversas da API
- [ ] Nova conversa
- [ ] Mensagens com streaming (opcional)
- [ ] Contexto de questão quando veio do simulado
- [ ] Indicador de tokens usados na sessão

### `/simulados`

- [x] Placeholder com CTA "Novo simulado"
- [ ] Cards de simulados (status: em andamento, concluído)
- [ ] Filtro por área
- [ ] Empty state para primeiro simulado

### `/simulados/novo`

- [ ] Seleção de área (CN, CH, LC, MT, RED)
- [ ] Dificuldade adaptativa (automática v1)
- [ ] Preview: N questões

### `/simulados/[id]`

- [ ] Enunciado + imagem (se houver)
- [ ] Alternativas A–E
- [ ] Timer
- [ ] Navegação entre questões
- [ ] Finalizar simulado

### `/simulados/[id]/resultado`

- [ ] Score + breakdown por área
- [ ] Lista de erros clicáveis
- [ ] "Explicar erro com IA" por questão

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

- [x] Placeholder avatar + campos
- [ ] Editar nome, escola, série
- [ ] Toggle escola pública (plano gratuito)
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
| Tutor IA | `POST /ia-tutor/explicar-erro`, `GET /ia-tutor/conversas` (futuro) |
| Simulados | `POST /simulados`, `GET /simulados`, `POST /simulados/:id/resposta` |
| Progresso | `GET /metricas/proficiencia`, `GET /metricas/evolucao` |
| Trilha | Derivado de `proficiencias_area` (áreas abaixo de threshold) |
| Planos | `GET /usuarios/plano`, webhook Mercado Pago |
| Perfil | `PATCH /usuarios/perfil`, `POST /usuarios/login-google` |

---

## Próximos passos imediatos

1. Rodar `npm run dev:web` e abrir `/tutor`, `/simulados`, etc.
2. Validar navegação e visual com você
3. Integrar seu **template de chat** em `/tutor`
4. Retomar backend F1 (auth) em paralelo

---

## Referências visuais

- Osmo Supply — The Vault (sidebar + search + cards)
- Landing ENEM+ — paleta e tipografia Inter já definidas
- Hartmann Capital — hierarquia tipográfica do hero (aplicada em títulos de seção do workspace)
