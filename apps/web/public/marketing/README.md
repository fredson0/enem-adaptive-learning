# Assets de marketing

Coloque screenshots e imagens reais do produto nas pastas abaixo.
Formatos recomendados: `.webp` ou `.png` (mantenha o nome do arquivo igual ao listado).

## Estrutura

```
marketing/
├── shared/                  # Usado em várias páginas
│   ├── MarketingOsmoPlatformMock.jpeg   # CTA "Pronto para estudar com direção?"
│   ├── entrance-poster.webp # Poster da animação de entrada (landing)
│   └── menu-featured.webp   # Card do mega menu (header)
├── landing/
│   └── hero-poster.webp     # Hero da home (opcional)
├── como-funciona/
│   ├── hero.webp
│   ├── diagnostico.webp
│   ├── simulados.webp
│   ├── metricas.webp
│   └── trilha.webp
├── tutor-ia/
│   ├── hero.webp
│   ├── tutor-chat.webp
│   ├── tutor-vision.webp
│   ├── simulados.webp
│   └── metricas.webp
├── trilha-personalizada/
│   ├── hero.webp
│   ├── diagnostico.webp
│   ├── checklist.webp
│   ├── trilha.webp
│   └── metricas.webp
├── precos/
│   └── planos-impacto.webp
└── escolas-publicas/
    └── hero.webp
```

## Onde cada caminho é usado no código

| Arquivo | Constante / prop |
|---------|------------------|
| `lib/marketing-images.ts` | `MARKETING_IMAGES` |
| `lib/landing-hero-media.ts` | `LANDING_ENTRANCE_IMAGE_SRC` |
| `components/marketing/marketing-cta-band.tsx` | `MARKETING_CTA_PLATFORM_IMAGE_SRC` |

Vídeo do produto: `public/enem-plus-produto.webm` (raiz de `public/`).
