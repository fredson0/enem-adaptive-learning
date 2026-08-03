# ENEM+ — Frontend (`apps/web`)

Next.js 16 · Tailwind v4 · Inter · GSAP

## Comandos

```bash
# Na raiz do monorepo
npm run dev:web    # http://localhost:3001
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page (marketing) |
| `/tutor` | Workspace — Tutor IA (default) |
| `/simulados` | Histórico de simulados |
| `/trilha` | Trilha personalizada |
| `/progresso` | Métricas de proficiência |
| `/planos` | Planos Gratuito / Apoio |
| `/perfil` | Perfil do aluno |

## Workspace (área logada)

Layout estilo **Osmo Vault**: sidebar esquerda com Tutor IA + chats, navegação central, perfil no rodapé, badge de plano no topo direito.

Documentação completa: [docs/WORKSPACE-UI-OSMO.md](../../docs/WORKSPACE-UI-OSMO.md)

```
components/workspace/   # Sidebar, topbar, tutor-chat-view
components/ui/          # ai-input-hero, mini-navbar (chat template)
app/(workspace)/        # Rotas autenticadas (shell OSMO)
```

### Dependências do chat (Tutor IA)

- `three` — animação wave no fundo do input
- `gsap` — timeline da animação (já instalado)

## Documentação do projeto

- [Cronograma](../../docs/CRONOGRAMA-IMPLEMENTACAO.md)
- [Workspace UI OSMO](../../docs/WORKSPACE-UI-OSMO.md)
