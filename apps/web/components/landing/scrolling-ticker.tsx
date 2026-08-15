import { cn } from "@/lib/utils";

const TICKER_ITEMS = [
  "ENEM ADAPTATIVO",
  "TUTOR IA PERSONALIZADO",
  "SIMULADOS INTELIGENTES",
  "INCLUSÃO DIGITAL",
  "PREPARAÇÃO PARA TODOS",
];

type ScrollingTickerProps = {
  variant?: "default" | "landing";
};

export function ScrollingTicker({ variant = "default" }: ScrollingTickerProps) {
  const content = TICKER_ITEMS.map((item) => `${item} + `).join("");

  return (
    <div
      className={cn(
        "overflow-hidden py-2.5",
        variant === "landing"
          ? "rounded-b-2xl bg-[#b0ff57] md:rounded-b-3xl"
          : "rounded-[10px] border border-black/15 bg-[#1e3a8a]",
      )}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        <span
          className={cn(
            "font-mono text-[11px] font-semibold tracking-[0.22em] uppercase md:text-xs",
            variant === "landing" ? "text-black" : "text-white",
          )}
        >
          {content}
          {content}
        </span>
      </div>
    </div>
  );
}
