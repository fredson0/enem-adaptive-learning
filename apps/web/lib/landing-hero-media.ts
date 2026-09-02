import {
  MARKETING_IMAGE_PATHS,
  hasLocalMarketingFile,
} from "./marketing-images";

/** Vídeo de fundo da hero da landing — também usado na animação de entrada. */
export const LANDING_HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

/** Vídeo do produto na seção "A plataforma" (overview). */
export const LANDING_PLATFORM_VIDEO_SRC = "/enem-plus-produto.webm";

/** MP4s de feature — substituir por webm quando a conversão estiver pronta. */
export const MARKETING_VIDEOS = {
  simulados: "/video_simuladoCerto.mp4",
  tutor: "/conversaIACerto.mp4",
  trilha: "/personalizado%20certo.mp4",
  progresso: "/progresso1.mp4",
} as const;

export function mediaTypeForSrc(src: string): string {
  if (src.endsWith(".webm")) return "video/webm";
  if (src.endsWith(".mp4")) return "video/mp4";
  return "video/mp4";
}

export const LANDING_PLATFORM_VIDEO_TYPE = mediaTypeForSrc(
  LANDING_PLATFORM_VIDEO_SRC,
);

/**
 * Imagem estática opcional no split da entrada (antes da expansão).
 * Arquivo: `public/marketing/landing/entrance-poster.jpg`
 */
export const LANDING_ENTRANCE_IMAGE_SRC = hasLocalMarketingFile(
  MARKETING_IMAGE_PATHS.landing.entrancePoster,
)
  ? MARKETING_IMAGE_PATHS.landing.entrancePoster
  : "";

/** Sincroniza o frame do vídeo entre a intro e a hero (evita “pulo” na transição). */
let landingHeroVideoHandoffTime: number | null = null;
const landingHeroVideoHandoffListeners = new Set<(time: number) => void>();

export function publishLandingHeroVideoHandoff(time: number) {
  landingHeroVideoHandoffTime = time;
  landingHeroVideoHandoffListeners.forEach((listener) => listener(time));
}

export function subscribeLandingHeroVideoHandoff(listener: (time: number) => void) {
  landingHeroVideoHandoffListeners.add(listener);
  if (landingHeroVideoHandoffTime !== null) {
    listener(landingHeroVideoHandoffTime);
  }
  return () => {
    landingHeroVideoHandoffListeners.delete(listener);
  };
}
