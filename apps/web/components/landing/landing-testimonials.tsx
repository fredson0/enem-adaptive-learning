"use client";

import { TestimonialSubmitPanel } from "@/components/landing/testimonial-submit-panel";
import {
  DesignTestimonial,
  type DesignTestimonialItem,
} from "@/components/ui/design-testimonial";
import { listarDepoimentosPublicos } from "@/lib/depoimentos";
import { MOCK_TESTIMONIALS } from "@/lib/testimonials";
import { useCallback, useEffect, useState } from "react";

export function LandingTestimonials() {
  const [testimonials, setTestimonials] =
    useState<DesignTestimonialItem[]>(MOCK_TESTIMONIALS);
  const [totalReais, setTotalReais] = useState(0);

  const refreshTestimonials = useCallback(async () => {
    try {
      const data = await listarDepoimentosPublicos();
      setTestimonials(data.depoimentos);
      setTotalReais(data.totalReais);
    } catch {
      setTestimonials(MOCK_TESTIMONIALS);
      setTotalReais(0);
    }
  }, []);

  useEffect(() => {
    void refreshTestimonials();
  }, [refreshTestimonials]);

  return (
    <>
      <DesignTestimonial testimonials={testimonials} />
      <TestimonialSubmitPanel
        totalReais={totalReais}
        totalMocks={MOCK_TESTIMONIALS.length}
        onSubmitted={refreshTestimonials}
      />
    </>
  );
}
