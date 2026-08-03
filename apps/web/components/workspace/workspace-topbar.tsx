import { PlanBadge } from "@/components/workspace/plan-badge";

type WorkspaceTopbarProps = {
  title: string;
  description?: string;
};

export function WorkspaceTopbar({ title, description }: WorkspaceTopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--osmo-border)] px-6 py-5 md:px-8">
      <div>
        <p className="mb-1 font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
          Workspace
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-white/55">{description}</p>
        )}
      </div>

      <PlanBadge />
    </header>
  );
}
