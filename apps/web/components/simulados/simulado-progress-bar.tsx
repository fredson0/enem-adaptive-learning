import { cn } from "@/lib/utils";

type SimuladoProgressBarProps = {
  atual: number;
  total: number;
  className?: string;
};

export function SimuladoProgressBar({
  atual,
  total,
  className,
}: SimuladoProgressBarProps) {
  const percentual = total > 0 ? Math.round((atual / total) * 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-white/45">
        <span>
          Questão {Math.min(atual, total)} de {total}
        </span>
        <span>{percentual}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#b0ff57] transition-all duration-300"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
