export function ProgressoSkeleton({
  variant = "section",
}: {
  variant?: "hub" | "section";
}) {
  if (variant === "hub") {
    return (
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 py-2">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-white/[0.06]" />
          <div className="h-8 w-48 rounded bg-white/[0.06]" />
          <div className="h-4 w-full max-w-md rounded bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[380px] rounded-[2rem] border border-white/[0.06] bg-[#161616] sm:h-[400px]"
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
