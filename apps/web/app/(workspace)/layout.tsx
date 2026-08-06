import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { TokensIaProvider } from "@/components/workspace/tokens-ia-provider";
import { TutorSessionProvider } from "@/components/workspace/tutor-session-provider";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspacePageTransition } from "@/components/workspace/workspace-page-transition";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TokensIaProvider>
      <TutorSessionProvider>
        <div className="osmo-canvas-bg relative h-screen w-screen overflow-hidden">
          <OnboardingGuard />
          <WorkspacePageTransition>{children}</WorkspacePageTransition>
          <WorkspaceSidebar />
        </div>
      </TutorSessionProvider>
    </TokensIaProvider>
  );
}
