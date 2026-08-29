"use client";

export function WorkspaceSkipLink() {
  return (
    <a
      href="#workspace-main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-[var(--osmo-border)] focus:bg-[var(--osmo-sidebar)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-osmo focus:outline-none focus:ring-2 focus:ring-osmo-accent"
    >
      Pular para o conteúdo
    </a>
  );
}
