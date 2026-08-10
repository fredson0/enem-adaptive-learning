# Simulados — modos, polish e boas práticas

> Fase A do cronograma: separar tipos de simulado, melhorar UX e documentar decisões técnicas.

---

## Três modos de simulado

| Modo | Slug UI | API `modo` | Área obrigatória | Quantidades | IA (pedido natural) | Gabarito | Cronômetro |
|------|---------|------------|------------------|-------------|---------------------|----------|------------|
| **Treino livre** | `/simulados/treino` | `TREINO` | Não | 5, 10, 20 | Sim | Após cada resposta | Não |
| **Modalidade específica** | `/simulados/modalidade` | `MODALIDADE` | Sim | 10, 20, 45 | Sim | Após cada resposta | Não |
| **Com cronômetro** | `/simulados/cronometrado` | `CRONOMETRADO` | Sim | 10, 20, 45 | Não | Só no resultado | ~4 min/questão |

Config central no backend: `apps/api/src/modules/simulados/core/application/helpers/modo-simulado.config.ts`

---

## Navegação (sidebar)

Padrão igual ao **Tutor IA**: seção **Simulados** expansível com subitens:

- Visão geral → `/simulados`
- Treino → `/simulados/treino`
- Modalidade → `/simulados/modalidade`
- Cronômetro → `/simulados/cronometrado`

Implementação: `apps/web/components/workspace/workspace-sidebar.tsx`

---

## Rotas do frontend

```
/simulados                    Hub (3 cards)
/simulados/treino             Histórico treino
/simulados/treino/novo        Criar treino
/simulados/modalidade         Histórico modalidade
/simulados/modalidade/novo    Criar modalidade
/simulados/cronometrado       Histórico cronometrado
/simulados/cronometrado/novo  Criar cronometrado
/simulados/novo               Redirect → treino/novo (legado)
/simulados/[id]               Responder questões
/simulados/[id]/resultado     Resultado (GET idempotente)
```

---

## Melhorias implementadas (checklist)

### Histórico (`SimuladoLista` + `SimuladoCard`)

- [x] Filtro por status (todos / em andamento / concluídos)
- [x] Filtro por `modo` via API
- [x] Barra de progresso visual no card
- [x] Badge de modo e status
- [x] % de acertos / progresso
- [x] Skeleton loading
- [x] Empty state por modo
- [x] Paginação backend (`limit`/`offset`, default 50)

### Criar simulado (`SimuladoNovoForm`)

- [x] Formulário separado por modo (sem misturar na mesma tela)
- [x] Preview de questões disponíveis (`GET /questoes/contagem`)
- [x] IA desabilitada no modo cronometrado
- [x] Área obrigatória em modalidade/cronometrado
- [x] Deep link da trilha → `/simulados/modalidade/novo?area=...`

### Questão (`/simulados/[id]`)

- [x] Barra de progresso fixa
- [x] Cronômetro no modo `CRONOMETRADO` (auto-finaliza ao zerar)
- [x] Gabarito condicional (`revelarGabaritoImediato`)
- [x] `data-lenis-prevent` no scroll
- [x] Confirmação ao finalizar
- [x] Idempotency-Key no POST resposta (frontend)
- [x] Resposta duplicada ignorada no backend (`@@unique` + check)

### Resultado (`/simulados/[id]/resultado`)

- [x] `GET /simulados/:id/resultado` (não recalcula proficiência se já concluído)
- [x] Lista de erros + chips de acertos
- [x] CTAs para Trilha e Progresso
- [x] Mensagem motivacional se ≥ 70%

---

## Backend — schema e endpoints

### Migration `20260810160000_simulado_modo`

Colunas em `simulados`:

- `modo` (`ModoSimulado`)
- `revelar_gabarito_imediato` (boolean)
- `tempo_limite_segundos` (int, nullable)

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/questoes/contagem` | Total de questões para filtros (preview) |
| `GET` | `/simulados?modo=&status=&limit=&offset=` | Lista paginada |
| `GET` | `/simulados/:id/resultado` | Resultado idempotente |
| `POST` | `/simulados` | Body inclui `modo` |
| `POST` | `/simulados/gerar-com-ia` | Body inclui `modo` (bloqueado em cronometrado) |

---

## Segurança e resiliência

| Prática | Onde |
|---------|------|
| **Idempotência de resposta** | `respostas_simulado` unique `(simuladoId, questaoId)` + `Idempotency-Key` no front |
| **Validação de modo** | DTO + `modo-simulado.config.ts` |
| **Limite de quantidade** | Max 45 questões; quantidades por modo |
| **Área obrigatória** | Backend valida `MODALIDADE` e `CRONOMETRADO` |
| **Rate limit IA** | Gerar com IA passa pelo `IaEngineRouter` + `uso_tokens_ia` (tutor) |
| **Proficiência** | Recalculada só na primeira finalização |
| **Auth** | Todos endpoints `@UseGuards(JwtAuthGuard)` |

---

## Pendências (próximas iterações)

- [ ] Navegação entre questões já respondidas (revisão)
- [ ] Render LaTeX no enunciado
- [ ] Atalhos de teclado A–E
- [ ] `DELETE /simulados/:id` (cancelar abandonado)
- [ ] Simulado “refazer só erros”
- [ ] Mobile: sidebar drawer

---

## Referências

- Banco de questões: [BANCO-QUESTOES-ENEM.md](./BANCO-QUESTOES-ENEM.md)
- Cronograma: [CRONOGRAMA-IMPLEMENTACAO.md](./CRONOGRAMA-IMPLEMENTACAO.md)
- UI workspace: [WORKSPACE-UI-OSMO.md](./WORKSPACE-UI-OSMO.md)
