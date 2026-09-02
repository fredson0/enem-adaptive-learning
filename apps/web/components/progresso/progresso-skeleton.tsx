export function ProgressoSkeleton({
  variant = "section",
}: {
  variant?: "hub" | "section";
}) {
  if (variant === "hub") {
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl animate-pulse flex-col gap-3 md:gap-8">
        <div className="shrink-0 space-y-2">
          <div className="hidden h-3 w-20 rounded bg-white/[0.06] sm:block" />
          <div className="h-8 w-48 rounded bg-white/[0.06]" />
          <div className="h-4 w-full max-w-md rounded bg-white/[0.04]" />
        </div>
        <div className="-mx-4 flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden px-4 scrollbar-none md:mx-0 md:grid md:h-auto md:flex-none md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="w-[min(82vw,22rem)] shrink-0 rounded-[2rem] border border-white/[0.06] bg-[#161616] max-md:h-full md:h-[420px] md:w-auto"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 animate-pulse">
      <div className="h-4 w-28 rounded bg-white/[0.06]" />
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-white/[0.06]" />
        <div className="h-4 w-full max-w-md rounded bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
        <div className="h-44 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
        <div className="h-72 rounded-[14px] border border-white/[0.06] bg-[#161616] md:col-span-2" />
      </div>
    </div>
  );
}
