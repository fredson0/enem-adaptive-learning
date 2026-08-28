export function ProgressoSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-44 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
        <div className="h-44 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-[14px] border border-white/[0.06] bg-[#161616]"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
        <div className="h-72 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
      </div>

      <div className="h-52 rounded-[14px] border border-white/[0.06] bg-[#161616]" />
    </div>
  );
}
