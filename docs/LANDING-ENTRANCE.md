# Animação de entrada da landing (`/`)

Sequência inspirada no reveal **Willem / Osmo**: título → split com imagem → pausa → expansão até a hero.

Implementação: `apps/web/components/landing/landing-entrance.tsx`  
Tokens: `apps/web/lib/landing-entrance-tokens.ts`  
Mídia: `apps/web/lib/landing-hero-media.ts`

---

## Quando roda

| Condição | Comportamento |
|----------|----------------|
| Primeira visita ao `/` (navegador) | Animação completa |
| `localStorage` `enem-landing-intro-v2` = `"1"` (sessionStorage) | Pula na mesma aba após ver uma vez |
| `?replay-intro=1` na URL | Força a animação de novo |
| `prefers-reduced-motion` | Pula animação (acessibilidade) |

Para testar de novo no DevTools:

```js
sessionStorage.removeItem("enem-landing-intro-v2");
location.reload();
```

Ou abra: `http://localhost:3001/?replay-intro=1`

---

## Sequência (4 fases)

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1 — TITLE IN (~750ms)                                 │
│                                                             │
│              ENEM+                                          │
│         (fundo #e6e6e6, texto #0b0b0b)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 2 — SPLIT (~950ms)                                    │
│                                                             │
│     ENE  ┌──────────┐  M+                                   │
│          │  vídeo/  │  (entre o E e o M de ENEM+)           │
│          │  imagem  │                                        │
│          └──────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 3 — HOLD (2000ms)                                     │
│                                                             │
│     Mantém split + retângulo central visível                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 4 — EXPAND (2200ms)                                   │
│                                                             │
│  • Vídeo ancorado no centro da viewport (não no flex)       │
│  • Spacer no flex empurra "ENE" e "M+" para os lados        │
│  • Cresce 22vw×16vw → 100vw×100svh sem faixa cinza lateral  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 5 — EXIT (450ms)                                      │
│                                                             │
│  • Overlay inteiro faz fade out → hero já visível           │
│  • sessionStorage gravado ao concluir                       │
└─────────────────────────────────────────────────────────────┘
```

**Duração total (primeira visita):** ~6,35s  
`750 + 950 + 2000 + 2200 + 450` ms

---

## Tokens visuais

| Token | Valor |
|-------|--------|
| Fundo entrada | `#e6e6e6` |
| Cor do título | `#0b0b0b` |
| Título | `font-display`, `clamp(3.75rem, 18vw, 11rem)` |
| Retângulo central | `clamp(6.5rem, 22vw, 15rem)` × `clamp(4.75rem, 16vw, 11rem)` |
| Gap ENEM \| img \| + | `clamp(0.35rem, 1.2vw, 0.85rem)` |
| Easing | `[0.22, 1, 0.36, 1]` (mesmo da hero marketing) |

---

## Mídia do retângulo central

| Prioridade | Fonte |
|------------|--------|
| 1 | `LANDING_ENTRANCE_IMAGE_SRC` em `landing-hero-media.ts` (poster estático) |
| 2 | Vídeo da hero (`LANDING_HERO_VIDEO_URL`) — mesmo arquivo da `HeroSection` |

Substituir poster:

```ts
export const LANDING_ENTRANCE_IMAGE_SRC = "/marketing/entrance-poster.jpg";
```

Arquivo em `apps/web/public/marketing/entrance-poster.jpg`.

---

## Arquitetura de componentes

```
app/page.tsx
  └── HomePage (client)
        ├── [checking] placeholder cinza
        ├── [intro] LandingEntrance (fixed z-250)
        │     onExpandStart → monta <main> por baixo
        │     onComplete → introState = ready
        └── [ready] main com SiteHeader + HeroSection + seções
```

| Arquivo | Papel |
|---------|--------|
| `home-page.tsx` | Orquestra intro vs conteúdo |
| `landing-entrance.tsx` | Overlay + timeline das 4 fases |
| `landing-entrance-tokens.ts` | Timings, cores, tamanhos |
| `landing-hero-media.ts` | URL do vídeo + poster opcional |
| `prisma-hero.tsx` | Hero final (importa mesmo vídeo) |

---

## Detalhes de animação (Framer Motion)

### Fase 1 — título único
- `ENEM` e `+` já estão no layout (gap 0, vídeo com largura 0)
- Fade-in do bloco inteiro (`opacity`, `y`, `blur`)
- Visualmente forma **ENEM+** sem trocar de DOM

### Fase 2 — split (empurrão)
- Título dividido em **ENE** | spacer | **M+** (vídeo entre o E e o M)
- O spacer no flex cresce de 0 → tamanho token e empurra as letras
- O vídeo real fica em `absolute left-1/2 top-1/2` (centro da viewport), sincronizado com o spacer
- Vídeo revelado pelo clip do retângulo (conteúdo em tamanho final, centralizado)

### Fase 3 — hold
- Nenhuma animação adicional; timer de 2s

### Fase 4 — expand
- Spacer e vídeo crescem juntos: `22vw×16vw` → `100vw×100svh` a partir do **centro da tela**
- Halves do título são empurradas pelo spacer; `opacity` → 0 com mesma duração
- `onExpandStart` monta a hero por baixo

### Fase 5 — exit
- Overlay inteiro: `opacity` → 0
- `sessionStorage` gravado ao concluir

---

## Acessibilidade

- Overlay com `aria-hidden` durante expand
- `useReducedMotion()` → `onComplete()` imediato, sem overlay
- Body scroll bloqueado implicitamente (`fixed` fullscreen)

---

## Próximos refinamentos (opcional)

- [ ] `layoutId` compartilhado entre retângulo da entrada e hero (morph perfeito)
- [ ] Som ambiente sutil no split (desligado por padrão)
- [ ] Versão mobile com split `ENEM` / `+` em tamanho menor
- [ ] Query `?replay-intro=1` para QA sem limpar storage

---

## Referências no código

| Arquivo | Uso |
|---------|-----|
| `landing-entrance.tsx` | Animação de entrada |
| `home-page.tsx` | Integração na `/` |
| `landing-entrance-tokens.ts` | Timings e cores |
| `landing-hero-media.ts` | Vídeo + poster |
| `prisma-hero.tsx` | Hero pós-entrada |
