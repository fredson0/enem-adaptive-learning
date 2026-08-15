"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { getLoginPath, isGuestAllowedPath } from "@/lib/login-redirect";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();
  const guestAllowed = isGuestAllowedPath(pathname);

  useEffect(() => {
    if (isLoading || isAuthenticated || guestAllowed) return;
    router.replace(getLoginPath(pathname));
  }, [guestAllowed, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <div className="osmo-canvas-bg h-screen w-screen" aria-busy="true" />;
  }

  if (!isAuthenticated && !guestAllowed) {
    return <div className="osmo-canvas-bg h-screen w-screen" aria-busy="true" />;
  }

  return <>{children}</>;
}
