import { WorkspaceSection } from "@/components/workspace/workspace-section";

const PLANS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    description: "Para alunos de escola pública. Tokens IA diários limitados.",
    features: ["20 tokens IA/dia", "Simulados ilimitados", "Métricas básicas"],
    highlighted: false,
  },
  {
    name: "Apoio",
    price: "R$ 20/mês",
    description: "Mais tokens de IA e apoio à inclusão digital do projeto.",
    features: [
      "200 tokens IA/dia",
      "Prioridade no tutor",
      "Subsidia alunos gratuitos",
    ],
    highlighted: true,
  },
];

export default function PlanosPage() {
  return (
    <WorkspaceSection title="Planos" count={PLANS.length}>
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[14px] border p-6 md:p-7 ${
              plan.highlighted
                ? "border-white/10 bg-[#161616] ring-1 ring-white/10"
                : "border-white/[0.06] bg-[#141414]"
            }`}
          >
            <p className="text-sm text-white/45">{plan.name}</p>
            <p className="mt-3 text-3xl font-medium tracking-tight text-white">
              {plan.price}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {plan.description}
            </p>
            <ul className="mt-6 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm text-white/70">
                  · {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-7 w-full rounded-full px-4 py-2.5 text-sm font-medium transition ${
                plan.highlighted
                  ? "bg-white text-black hover:bg-white/90"
                  : "border border-white/10 bg-transparent text-white hover:bg-white/[0.04]"
              }`}
            >
              {plan.highlighted ? "Assinar com Mercado Pago" : "Plano atual"}
            </button>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}
