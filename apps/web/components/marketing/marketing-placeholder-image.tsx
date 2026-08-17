import Image from "next/image";
import { cn } from "@/lib/utils";

type MarketingPlaceholderImageProps = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  priority?: boolean;
};

export function MarketingPlaceholderImage({
  src,
  alt,
  label = "Substituir imagem",
  className,
  priority = false,
}: MarketingPlaceholderImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/10 bg-[#e8e8e6] shadow-[0_24px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority={priority}
      />
      <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-white/80 uppercase backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
