import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import { MarketingOsmoPlatformMock } from "@/components/marketing/marketing-osmo-platform-mock";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

/** Imagem padrão do CTA — `shared/HOMEIA.png`. */
export const MARKETING_CTA_PLATFORM_IMAGE_SRC = MARKETING_IMAGES.ctaBand;

type MarketingCtaBandProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  eyebrow?: string;
  badge?: string;
  accentNote?: string;
  imageSrc?: string;
  className?: string;
};

export function MarketingCtaBand({
  title,
  description,
  ctaLabel = "Criar minha conta",
  ctaHref = "/login",
  eyebrow,
  badge = "Comece grátis",
  accentNote = "Sem cartão para começar",
  imageSrc,
  className,
}: MarketingCtaBandProps) {
  const resolvedImageSrc = imageSrc ?? MARKETING_CTA_PLATFORM_IMAGE_SRC;
  const hasImage = resolvedImageSrc.length > 0;

  return (
    <section
      className={cn(
        "flex min-h-svh overflow-x-clip bg-white px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5",
        className,
      )}
    >
      <div className="mx-auto flex w-full flex-1 flex-col">
        <MarketingBlurReveal className="flex min-h-[calc(100svh-0.75rem)] flex-1 flex-col sm:min-h-[calc(100svh-1rem)] md:min-h-[calc(100svh-1.25rem)]">
          <div
            className="relative flex min-h-full flex-1 overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] md:rounded-[2.25rem]"
            style={{ backgroundColor: MARKETING_OSMO_COLORS.ctaCardBg }}
          >
            <div className="relative flex min-h-full flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-20 2xl:px-24">
                <span className="font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
                  {badge}
                </span>

                {eyebrow ? (
                  <p className="mt-6 text-base text-white/70 md:text-lg lg:mt-8">
                    {eyebrow}
                  </p>
                ) : null}

                <MarketingClipTitle
                  as="h2"
                  className="font-display mx-auto mt-4 max-w-xl text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.04em] text-white lg:mt-5"
                >
                  {title}
                </MarketingClipTitle>

                <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55 md:mt-6 md:text-lg">
                  {description}
                </p>

                <div className="relative mx-auto mt-8 w-fit md:mt-10 lg:mt-12">
                  <Link
                    href={ctaHref}
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#6840ff] px-7 text-sm font-medium text-white transition hover:bg-[#5a36e0] md:h-[3.25rem] md:px-8 md:text-base"
                  >
                    {ctaLabel}
                  </Link>

                  <p
                    className={cn(
                      caveat.className,
                      "absolute top-full left-1/2 mt-3 -translate-x-1/2 text-lg leading-none whitespace-nowrap text-[#b0ff57] md:text-xl",
                    )}
                  >
                    {accentNote}
                    <span className="ml-1 inline-block rotate-[-18deg]">↑</span>
                  </p>
                </div>
              </div>

              <div className="relative min-h-[42vh] flex-1 overflow-hidden lg:min-h-0">
                <div className="absolute top-3 left-3 right-[-28%] bottom-[-22%] sm:top-4 sm:left-5 lg:top-[4%] lg:left-[5%] lg:right-[-32%] lg:bottom-[-24%] xl:right-[-36%] xl:bottom-[-26%]">
                  {hasImage ? (
                    <div className="relative h-full min-h-[320px] overflow-hidden rounded-tl-2xl rounded-tr-xl border border-white/10 border-r-0 border-b-0 bg-[#0d0d0d]">
                      <Image
                        src={resolvedImageSrc}
                        alt="Interface do Tutor IA na plataforma ENEM+"
                        fill
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        quality={92}
                        className="object-cover object-left-top"
                      />
                    </div>
                  ) : (
                    <MarketingOsmoPlatformMock
                      variant="clipped"
                      className="h-full min-h-[320px] w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </MarketingBlurReveal>
      </div>
    </section>
  );
}
