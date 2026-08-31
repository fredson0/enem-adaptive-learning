"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { getLoginPath } from "@/lib/login-redirect";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    router.replace(getLoginPath(pathname));
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <div className="osmo-canvas-bg h-screen w-screen" aria-busy="true" />;
  }

  if (!isAuthenticated) {
    return <div className="osmo-canvas-bg h-screen w-screen" aria-busy="true" />;
  }

  return <>{children}</>;
}
