import {
  MARKETING_SCREENSHOT_FRAME,
  MARKETING_SCREENSHOT_IMAGE_CLASS,
  MARKETING_SCREENSHOT_IMAGE_QUALITY,
  MARKETING_SCREENSHOT_IMAGE_SIZES,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import Image from "next/image";

type MarketingPlaceholderImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function MarketingPlaceholderImage({
  src,
  alt,
  className,
  priority = false,
}: MarketingPlaceholderImageProps) {
  return (
    <div className={cn(MARKETING_SCREENSHOT_FRAME, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={MARKETING_SCREENSHOT_IMAGE_SIZES}
        quality={MARKETING_SCREENSHOT_IMAGE_QUALITY}
        className={MARKETING_SCREENSHOT_IMAGE_CLASS}
        priority={priority}
      />
    </div>
  );
}
