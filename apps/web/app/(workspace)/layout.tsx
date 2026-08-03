import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspacePageTransition } from "@/components/workspace/workspace-page-transition";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="osmo-canvas-bg relative h-screen w-screen overflow-hidden">
      <WorkspacePageTransition>{children}</WorkspacePageTransition>
      <WorkspaceSidebar />
    </div>
  );
}
