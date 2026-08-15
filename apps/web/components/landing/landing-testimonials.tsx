const TESTIMONIALS = [
  {
    quote:
      "Pela primeira vez entendi onde estava errando de verdade. As métricas por área mudaram como eu organizo a semana de estudo.",
    name: "Ana Clara",
    role: "3º ano — escola pública, SP",
  },
  {
    quote:
      "O tutor IA não dá resposta pronta — ele me guia no raciocínio. Parece ter um professor do meu lado quando travo numa questão.",
    name: "Lucas M.",
    role: "Vestibulando, MG",
  },
  {
    quote:
      "Simulado + trilha no mesmo lugar economiza tempo. Estudo o que importa em vez de ficar pulando de matéria sem critério.",
    name: "Juliana R.",
    role: "Cursinho + ENEM+, RJ",
  },
];

export function LandingTestimonials() {
  return (
    <section
      id="depoimentos"
      data-scroll-section
      className="bg-white px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-[#0b1220]/40 uppercase">
            Depoimentos
          </p>
          <h2 className="font-display mt-4 text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-[#0b1220]">
            Quem usa, sente a diferença
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-[#fafaf9] p-6 md:p-7"
            >
              <blockquote className="text-base leading-relaxed text-[#0b1220]/75">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-black/[0.06] pt-4">
                <p className="text-sm font-semibold text-[#0b1220]">{item.name}</p>
                <p className="mt-0.5 text-xs text-[#0b1220]/45">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
