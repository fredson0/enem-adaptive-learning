import { TutorPageClient } from "@/components/workspace/tutor-page-client";
import { Suspense } from "react";

export default function TutorPage() {
  return (
    <Suspense>
      <TutorPageClient />
    </Suspense>
  );
}
