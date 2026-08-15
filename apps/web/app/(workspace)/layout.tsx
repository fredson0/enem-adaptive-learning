import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthProvider } from "@/components/auth/auth-provider";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { TokensIaProvider } from "@/components/workspace/tokens-ia-provider";
import { TutorSessionProvider } from "@/components/workspace/tutor-session-provider";
import { WorkspaceLenisGuard } from "@/components/workspace/workspace-lenis-guard";
import { WorkspaceScrollProvider } from "@/components/workspace/workspace-scroll-context";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspacePageTransition } from "@/components/workspace/workspace-page-transition";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <TokensIaProvider>
          <TutorSessionProvider>
            <WorkspaceScrollProvider>
              <div className="osmo-canvas-bg relative h-screen w-screen overflow-hidden">
                <WorkspaceLenisGuard />
                <OnboardingGuard />
                <WorkspacePageTransition>{children}</WorkspacePageTransition>
                <WorkspaceSidebar />
              </div>
            </WorkspaceScrollProvider>
          </TutorSessionProvider>
        </TokensIaProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
