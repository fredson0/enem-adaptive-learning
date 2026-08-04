"use client";

import { getStoredUser, isOnboardingComplete } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      return;
    }

    if (!isOnboardingComplete(user) && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [pathname, router]);

  return null;
}
