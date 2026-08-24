# Assets de marketing

Coloque screenshots e imagens reais do produto nas pastas abaixo.
Formatos: `.webp`, `.jpg` ou `.jpeg` (mantenha o nome do arquivo igual ao listado).

## Estrutura

```
marketing/
├── shared/                  # Usado em várias páginas
│   ├── HOMEIA.png                      ✓  CTA de todas as páginas de marketing
│   ├── MarketingOsmoPlatformMock.jpeg   # legado
│   ├── entrance-poster.jpg # Poster da animação de entrada (landing)
│   └── menu-featured.jpg   # Card do mega menu (header)
├── landing/
│   └── hero-poster.jpg     # Hero da home (opcional)
├── como-funciona/
│   ├── hero.jpg
│   ├── diagnostico.jpg     ✓
│   ├── simulados.jpg       ✓
│   ├── metricas.jpg        ✓
│   ├── checklist.jpg       ✓
│   └── trilha.jpg
├── tutor-ia/
│   ├── tutorIA1.webp       ✓  passo 01 — Chat
│   ├── tutorIA2.webp       ✓  passo 02 — Visão
│   ├── tutorIA3.webp       ✓  passo 03 — Erros
│   ├── tutorIA4.webp       ✓  passo 04 — Tokens
│   └── hero.webp
├── trilha-personalizada/
│   ├── trilhaIA3.png         ✓  passo 03 — Áreas
│   ├── trilhaIA4.png         ✓  passo 04 — Etapas
│   └── hero.jpg              # passos 01–02 reutilizam como-funciona/
├── precos/
│   └── planos-impacto.jpg
└── escolas-publicas/
    └── hero.jpg
```

## Onde cada caminho é usado no código

| Arquivo | Constante / prop |
|---------|------------------|
| `lib/marketing-images.ts` | `MARKETING_IMAGES` |
| `lib/landing-hero-media.ts` | `LANDING_ENTRANCE_IMAGE_SRC` |
| `components/marketing/marketing-cta-band.tsx` | `MARKETING_CTA_PLATFORM_IMAGE_SRC` |

Vídeo do produto: `public/enem-plus-produto.webm` (raiz de `public/`).
