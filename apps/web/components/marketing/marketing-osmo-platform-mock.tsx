import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Início", icon: LayoutDashboard },
  { label: "Simulados", icon: BookOpen },
  { label: "Progresso", icon: BarChart3, active: true },
  { label: "Tutor IA", icon: MessageSquare },
];

const RESOURCE_CARDS = [
  { title: "Diagnóstico adaptativo", tone: "from-[#7c6cff]/30 to-[#5b4dff]/10" },
  { title: "Simulado cronometrado", tone: "from-[#b0ff57]/25 to-[#7c6cff]/10" },
  { title: "Trilha personalizada", tone: "from-white/10 to-[#7c6cff]/15" },
  { title: "Métricas por área", tone: "from-[#5b4dff]/20 to-black/20" },
  { title: "Tutor IA com contexto", tone: "from-[#b0ff57]/15 to-white/5" },
  { title: "Progresso semanal", tone: "from-white/8 to-[#7c6cff]/12" },
];

type MarketingOsmoPlatformMockProps = {
  className?: string;
  variant?: "default" | "clipped";
};

/** Mock visual da plataforma — substitua por screenshot real via `imageSrc` no CTA. */
export function MarketingOsmoPlatformMock({
  className,
  variant = "default",
}: MarketingOsmoPlatformMockProps) {
  const isClipped = variant === "clipped";

  return (
    <div
      className={cn(
        "flex h-full min-h-[280px] flex-col overflow-hidden border border-white/10 bg-[#151314]",
        isClipped
          ? "rounded-tl-2xl rounded-tr-xl border-r-0 border-b-0 shadow-none"
          : "rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2.5",
          isClipped && "hidden",
        )}
      >
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[9px] tracking-wide text-white/30">
          enemplus.app / progresso
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[28%] shrink-0 border-r border-white/10 bg-[#211d1c] p-3 sm:block">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles className="size-3.5 text-[#b0ff57]" />
            <span className="text-[11px] font-semibold tracking-wide text-white">
              ENEM+
            </span>
          </div>
          <nav className="mt-4 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px]",
                  item.active
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/40",
                )}
              >
                <item.icon className="size-3 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col bg-[#151314]">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[10px] text-white/35">Recursos gratuitos</p>
            <p className="mt-0.5 text-sm font-medium text-white/90">
              Sua evolução no ENEM
              <sup className="ml-1 text-[10px] text-[#b0ff57]">6</sup>
            </p>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-2.5 sm:p-4 lg:grid-cols-3 lg:gap-3 lg:p-5">
            {[...RESOURCE_CARDS, ...RESOURCE_CARDS.slice(0, 3)].map((card, index) => (
              <div
                key={`${card.title}-${index}`}
                className="flex flex-col overflow-hidden rounded-lg border border-white/8 bg-[#161616]"
              >
                <div
                  className={cn(
                    "min-h-[4.5rem] flex-1 bg-gradient-to-br sm:min-h-[5.5rem] lg:min-h-[6.5rem]",
                    card.tone,
                  )}
                />
                <p className="truncate px-2 py-1.5 text-[9px] text-white/55 sm:text-[10px]">
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
