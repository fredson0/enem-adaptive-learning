import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspacePageTransition } from "@/components/workspace/workspace-page-transition";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="osmo-canvas-bg flex h-screen gap-2.5 overflow-hidden pl-2 pr-3 pt-2.5 pb-2.5 md:gap-3 md:pl-2.5 md:pr-4 md:pt-3 md:pb-3">
      <WorkspaceSidebar />
      <WorkspacePageTransition>{children}</WorkspacePageTransition>
    </div>
  );
}
