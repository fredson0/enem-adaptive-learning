"use client";

import { fetchMe } from "@/lib/api";
import { isOnboardingComplete } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await fetchMe();
      if (cancelled || !user) return;

      if (!isOnboardingComplete(user) && pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
