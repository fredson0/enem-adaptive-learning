import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";

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
    features: ["200 tokens IA/dia", "Prioridade no tutor", "Subsidia alunos gratuitos"],
    highlighted: true,
  },
];

export default function PlanosPage() {
  return (
    <>
      <WorkspaceTopbar
        title="Planos"
        description="Escolha como apoiar sua preparação e a inclusão digital no ENEM."
      />

      <div className="grid flex-1 gap-4 p-6 md:grid-cols-2 md:p-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[10px] border p-6 ${
              plan.highlighted
                ? "border-white/15 bg-[var(--osmo-card)] ring-1 ring-white/10"
                : "border-[var(--osmo-border)] bg-[var(--osmo-surface)]"
            }`}
          >
            <p className="text-sm text-white/45">{plan.name}</p>
            <p className="mt-2 text-2xl font-medium text-white">{plan.price}</p>
            <p className="mt-3 text-sm text-white/55">{plan.description}</p>
            <ul className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm text-white/75">
                  · {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-6 w-full rounded-[8px] px-4 py-2.5 text-sm font-medium transition ${
                plan.highlighted
                  ? "bg-white text-black hover:bg-white/90"
                  : "border border-[var(--osmo-border)] bg-transparent text-white hover:bg-[var(--osmo-hover)]"
              }`}
            >
              {plan.highlighted ? "Assinar com Mercado Pago" : "Plano atual"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
