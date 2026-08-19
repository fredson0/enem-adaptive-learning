# Marketing UI — padrão Osmo

Padrão visual para páginas públicas de marketing (`/como-funciona`, `/precos`, etc.), alinhado ao estilo **Osmo Supply** e à landing ENEM+.

Implementação: `apps/web/lib/marketing-osmo-tokens.ts` + componentes em `apps/web/components/marketing/`.

---

## 1. Hero escuro + rodinha

**Componente:** `ComoFuncionaOsmoHero` (`como-funciona-osmo-hero.tsx`)

### Fundo e grade
| Token | Valor |
|-------|--------|
| Background | `#111111` |
| Linhas de grade | `white/6%`, cruz no centro (~42% vertical) |

### Rodinha (mostrador)
| Propriedade | Valor |
|-------------|--------|
| Tamanho | `min(108vw, 52rem)` — quadrado, `aspect-square` |
| Posição | `absolute top-0 left-1/2 -translate-x-1/2` no bloco do hero |
| SVG | 72 ticks, raio 42 no viewBox 100×100 |
| z-index | Atrás do texto (`pointer-events-none`) |

### Animação da rodinha (entrada / F5)
| Propriedade | Valor |
|-------------|--------|
| Rotação inicial | `-540°` (1,5 volta) |
| Rotação final | `0°` |
| Duração | `2.6s` |
| Easing | `[0.22, 1, 0.36, 1]` |
| Opacidade | `0.35 → 1` em ~1.2s |
| Reduced motion | Sem rotação — mostrador estático |

### Título do hero
| Propriedade | Valor |
|-------------|--------|
| Classe | `font-display` + `MARKETING_OSMO_HERO_TITLE` |
| Tamanho | `clamp(3.5rem, 14vw, 9.5rem)` |
| Line-height | `0.88` |
| Tracking | `-0.06em` |
| Cor | `white` |

### Posicionamento título × rodinha
O título **não** fica no centro geométrico da rodinha. Ele desce para liberar a metade superior do mostrador:

| Propriedade | Valor |
|-------------|--------|
| Padding-top do bloco de texto | `clamp(9rem, 22vw, 15rem)` → `clamp(11rem, 24vw, 17rem)` em `md+` |

### Pills do topo
- Esquerda: `Produto` (muted) + label da página (borda branca)
- Direita: badge lime `Incluso no gratuito`

### Accent manuscrito
- Fonte **Caveat**, cor `#b0ff57`, seta `↑` com leve rotação

---

## 2. Título de seção clara (estilo “Features”)

**Componente:** `MarketingOsmoSectionHeading`

| Propriedade | Valor |
|-------------|--------|
| Background da seção | `#f3f3f1` |
| Alinhamento | Centro |
| Título | `MARKETING_OSMO_SECTION_TITLE` → `clamp(3rem, 10vw, 7.5rem)` |
| Cor do título | `#0b1220` |
| Descrição | `max-w-2xl`, `text-[#0b1220]/65`, `text-base` / `md:text-lg` |
| Eyebrow (opcional) | `font-mono`, `tracking-[0.2em]`, `#7c6cff` |

---

## 3. Sticky scroll — texto troca, imagem fixa

**Componente:** `ComoFuncionaStickyFeatures`

Padrão Osmo “Features”: ao rolar, o texto anterior sobe e o próximo entra; à direita a **moldura permanece no mesmo lugar** e só a **imagem** troca.

### Layout desktop (`lg+`)
```
┌─────────────────────────────────────────┐
│  [Eyebrow + título Features — seção]    │
├──────────────────┬──────────────────────┤
│  Painel 1 (scroll)│  ┌──────────────┐   │
│  Painel 2 (scroll)│  │   STICKY     │   │
│  Painel 3 (scroll)│  │  imagem pill │   │
│  Painel 4 (scroll)│  │  (crossfade) │   │
│                  │  └──────────────┘   │
└──────────────────┴──────────────────────┘
```

| Propriedade | Valor |
|-------------|--------|
| Coluna esquerda | Painéis com `min-h-screen`, texto centralizado verticalmente |
| Coluna direita | `sticky top-24`, altura ~`min(72vh, 640px)` |
| Moldura da imagem | `rounded-[2.5rem]` / `rounded-[3rem]`, borda `black/8` |
| Troca de imagem | Crossfade `opacity` ~0.45s, `ease-out` |
| Troca de texto | Opacidade + `translateY` conforme painel ativo (IntersectionObserver) |
| Detecção do passo ativo | `IntersectionObserver`, `rootMargin: -42% 0px -42% 0px`, `threshold: 0` |

### Layout mobile
- Imagem pill acima de cada bloco de texto (sem sticky).
- Mesmo conteúdo, ordem vertical.

### Título de cada passo (sticky)
| Propriedade | Valor |
|-------------|--------|
| Classe | `MARKETING_OSMO_FEATURE_TITLE` |
| Tamanho | `clamp(2.25rem, 5vw, 4.5rem)` |
| Label | `font-mono`, step `01`–`04`, `#7c6cff` |

---

## 4. Vídeo da plataforma (hero)

| Propriedade | Valor |
|-------------|--------|
| Constante | `COMO_FUNCIONA_VIDEO_SRC` em `como-funciona-osmo-hero.tsx` |
| Container | Browser chrome fake + `aspect-video` |
| Placeholder | Ícone play + copy “Vídeo em breve” |

---

## 5. Checklist ao criar nova seção marketing Osmo

- [ ] Tokens em `marketing-osmo-tokens.ts` (não hardcodar tamanhos novos)
- [ ] `MarketingBlurReveal` para entradas suaves
- [ ] `prefers-reduced-motion` em animações de rotação
- [ ] Imagens placeholder via `MARKETING_IMAGES` + badge “Substituir imagem”
- [ ] Rotas públicas em `apps/web/proxy.ts` → `PUBLIC_PATHS`

---

## 7. Barra de scroll do documento

**Hero:** `MarketingOsmoHeroShell` com `variant="light"` (fundo branco, rodinha escura, grade sutil).

**Toggle + cards:** `MarketingOsmoPlans` — Mensal/Anual no hero; cards roxo (Gratuito) + preto (Apoio), estilo Osmo Solo/Team.

| Componente | Arquivo |
|------------|---------|
| Rodinha compartilhada | `osmo-dial.tsx` |
| Hero shell dark/light | `marketing-osmo-hero-shell.tsx` |
| Planos Osmo | `marketing-osmo-plans.tsx` |

---

Osmo e sites premium costumam **esconder a scrollbar nativa** do navegador; o scroll continua funcionando (mouse, trackpad, touch, Lenis).

| Propriedade | Valor |
|-------------|--------|
| `html` / `body` | `scrollbar-width: none` (Firefox) |
| WebKit | `::-webkit-scrollbar { display: none }` |
| Lenis | `@import "lenis/dist/lenis.css"` em `globals.css` |

Áreas com scroll interno (chat, sidebar) usam `.scrollbar-none` ou `.tutor-prompt-scroll` à parte.

---

## 6. FAQ (estilo Osmo)

**Componente:** `MarketingOsmoFaq`  
**Dados:** `lib/marketing-faq.ts`

| Propriedade | Valor |
|-------------|--------|
| Título | Duas linhas, `MARKETING_OSMO_SECTION_TITLE` |
| Accent manuscrito | Caveat, `#e04545`, posição absoluta à direita (desktop) |
| Abas | Pill `Geral` · `Estudo` · `IA & Planos` |
| Accordion | `+` / `−`, borda inferior, uma aberta por vez |
| Background | `white` |

---

## 7. Página de preços (`/precos`)

**Hero:** `MarketingOsmoHeroShell` com `variant="light"` — fundo branco, rodinha escura, grade sutil, título grande + toggle Mensal/Anual no hero.

**Planos:** `MarketingOsmoPlans` — cards roxo (Gratuito) + preto (Apoio), estilo Osmo Solo/Team.

| Componente | Arquivo |
|------------|---------|
| Rodinha compartilhada | `osmo-dial.tsx` |
| Hero shell dark/light | `marketing-osmo-hero-shell.tsx` |
| Planos Osmo | `marketing-osmo-plans.tsx` |

---

## Referências no código

| Arquivo | Uso |
|---------|-----|
| `como-funciona-osmo-hero.tsx` | Hero + rodinha + vídeo |
| `osmo-dial.tsx` | Rodinha SVG + animação |
| `marketing-osmo-hero-shell.tsx` | Hero reutilizável dark/light |
| `marketing-osmo-plans.tsx` | Planos estilo Osmo |
| `precos-content.tsx` | Página `/precos` |
| `marketing-osmo-section-heading.tsx` | Título Features |
| `como-funciona-sticky-features.tsx` | Scroll sticky |
| `marketing-osmo-tokens.ts` | Tokens compartilhados |
| `marketing-osmo-faq.tsx` | FAQ accordion |
| `marketing-faq.ts` | Perguntas e respostas por categoria |
