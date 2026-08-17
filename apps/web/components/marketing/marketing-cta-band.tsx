import Link from "next/link";
import { ArrowRight } from "lucide-react";

type MarketingCtaBandProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function MarketingCtaBand({
  title,
  description,
  ctaLabel = "Criar minha conta",
  ctaHref = "/login",
}: MarketingCtaBandProps) {
  return (
    <section className="bg-[#201d1d] px-4 py-20 md:px-8 md:py-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center">
        <h2 className="font-display max-w-3xl text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-white">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          {description}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[#b0ff57] px-7 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
        >
          {ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
