/**
 * Caminhos dos assets em `public/marketing/`.
 * Veja `public/marketing/README.md` para o mapa completo por seção.
 */
export const MARKETING_IMAGE_PATHS = {
  shared: {
    ctaPlatform: "/marketing/shared/MarketingOsmoPlatformMock.jpeg",
    menuFeatured: "/marketing/shared/menu-featured.jpg",
  },
  landing: {
    entrancePoster: "/marketing/landing/entrance-poster.jpg",
    heroPoster: "/marketing/landing/hero-poster.jpg",
  },
  comoFunciona: {
    hero: "/marketing/como-funciona/hero.jpg",
    diagnostico: "/marketing/como-funciona/diagnostico.jpg",
    simulados: "/marketing/como-funciona/simulados.jpg",
    metricas: "/marketing/como-funciona/metricas.jpg",
    checklist: "/marketing/como-funciona/checklist.jpg",
    trilha: "/marketing/como-funciona/trilha.jpg",
  },
  tutorIa: {
    hero: "/marketing/tutor-ia/hero.jpg",
    tutorChat: "/marketing/tutor-ia/tutor-chat.jpg",
    tutorVision: "/marketing/tutor-ia/tutor-vision.jpg",
    simulados: "/marketing/tutor-ia/simulados.jpg",
    metricas: "/marketing/tutor-ia/metricas.jpg",
  },
  trilhaPersonalizada: {
    hero: "/marketing/trilha-personalizada/hero.jpg",
    diagnostico: "/marketing/como-funciona/diagnostico.jpg",
    checklist: "/marketing/como-funciona/checklist.jpg",
    trilha: "/marketing/como-funciona/trilha.jpg",
    metricas: "/marketing/como-funciona/metricas.jpg",
  },
  precos: {
    planosImpacto: "/marketing/precos/planos-impacto.jpg",
  },
  escolasPublicas: {
    hero: "/marketing/escolas-publicas/hero.jpg",
  },
} as const;

/** Arquivos que já existem em `public/marketing/`. */
const LOCAL_MARKETING_FILES = new Set([
  MARKETING_IMAGE_PATHS.shared.ctaPlatform,
  MARKETING_IMAGE_PATHS.comoFunciona.diagnostico,
  MARKETING_IMAGE_PATHS.comoFunciona.simulados,
  MARKETING_IMAGE_PATHS.comoFunciona.metricas,
  MARKETING_IMAGE_PATHS.comoFunciona.checklist,
]);

/**
 * Usa asset local quando o arquivo existe; senão mantém placeholder Unsplash.
 */
export const USE_LOCAL_MARKETING_ASSETS = true;

export function hasLocalMarketingFile(path: string) {
  return USE_LOCAL_MARKETING_ASSETS && LOCAL_MARKETING_FILES.has(path);
}

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function resolveMarketingImage(localPath: string, fallback: string) {
  return hasLocalMarketingFile(localPath) ? localPath : fallback;
}

export const MARKETING_IMAGES = {
  comoFuncionaHero: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.hero,
    U("photo-1523240795612-9a054b0db644", 1400),
  ),
  diagnostico: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.diagnostico,
    U("photo-1434030214721-735b40f5cea4"),
  ),
  simulados: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.simulados,
    U("photo-1456513088650-9bda98d25708"),
  ),
  metricas: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.metricas,
    U("photo-1551288049-bebda4e38f71"),
  ),
  trilha: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.trilha,
    resolveMarketingImage(
      MARKETING_IMAGE_PATHS.comoFunciona.checklist,
      U("photo-1503676260728-1c00da094a0b"),
    ),
  ),
  tutorHero: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.tutorIa.hero,
    U("photo-1522202176988-66273c2fd55f", 1400),
  ),
  tutorChat: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.tutorIa.tutorChat,
    U("photo-1677442136019-21780ecad995"),
  ),
  tutorVision: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.tutorIa.tutorVision,
    U("photo-1588196749597-9ff075575d3e"),
  ),
  trilhaHero: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.trilhaPersonalizada.hero,
    U("photo-1524178232363-1fb2b075b655", 1400),
  ),
  checklist: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.comoFunciona.checklist,
    U("photo-1488190211105-8b0e65b80b4e"),
  ),
  escolasPublicas: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.escolasPublicas.hero,
    U("photo-1529390079861-591de354faf5"),
  ),
  planosImpacto: resolveMarketingImage(
    MARKETING_IMAGE_PATHS.precos.planosImpacto,
    U("photo-1529156069898-49953e39b3ac"),
  ),
} as const;
