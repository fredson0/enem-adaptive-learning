# Assets de marketing

Coloque screenshots e imagens reais do produto nas pastas abaixo.
Formatos: `.jpg` ou `.jpeg` (mantenha o nome do arquivo igual ao listado).

## Estrutura

```
marketing/
├── shared/                  # Usado em várias páginas
│   ├── MarketingOsmoPlatformMock.jpeg   # CTA "Pronto para estudar com direção?"
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
│   ├── hero.jpg
│   ├── tutor-chat.jpg
│   ├── tutor-vision.jpg
│   ├── simulados.jpg
│   └── metricas.jpg
├── trilha-personalizada/
│   └── hero.jpg            # demais reutilizam como-funciona/
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
