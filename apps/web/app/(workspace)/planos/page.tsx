"use client";

import { usePlano } from "@/components/workspace/plano-provider";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { PLANOS_CATALOGO } from "@/lib/plano";

export default function PlanosPage() {
  const { plano, loading } = usePlano();

  return (
    <WorkspaceSection title="Planos" count={PLANOS_CATALOGO.length}>
      <div className="mb-6 max-w-2xl rounded-[14px] border border-[#b0ff57]/20 bg-[#b0ff57]/[0.06] px-5 py-4">
        <p className="text-sm font-medium text-[#b0ff57]">Inclusão digital</p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          O plano Gratuito é pensado para alunos de escola pública. Ao assinar o
          Apoio, você amplia seus tokens de IA e ajuda a manter o acesso
          gratuito para quem mais precisa.
        </p>
      </div>

      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        {PLANOS_CATALOGO.map((catalogo) => {
          const isAtual = !loading && plano.tipo === catalogo.tipo;
          const tokensLabel =
            catalogo.tipo === "GRATUITO"
              ? `${isAtual ? plano.tokensDiarios : 10} tokens IA/dia`
              : "200 tokens IA/dia";

          return (
            <div
              key={catalogo.tipo}
              className={`rounded-[14px] border p-6 md:p-7 ${
                catalogo.highlighted
                  ? "border-white/10 bg-[#161616] ring-1 ring-white/10"
                  : "border-white/[0.06] bg-[var(--osmo-card)]"
              } ${isAtual ? "ring-1 ring-[#b0ff57]/40" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-white/45">{catalogo.name}</p>
                {isAtual ? (
                  <span className="rounded-full bg-[#b0ff57]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#b0ff57]">
                    Plano atual
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-3xl font-medium tracking-tight text-white">
                {catalogo.price}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                {catalogo.description}
              </p>
              <ul className="mt-6 space-y-2.5">
                <li className="text-sm text-white/70">· {tokensLabel}</li>
                {catalogo.features.slice(1).map((feature) => (
                  <li key={feature} className="text-sm text-white/70">
                    · {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isAtual || catalogo.highlighted}
                className={`mt-7 w-full rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  isAtual
                    ? "cursor-default border border-white/10 bg-white/[0.04] text-white/55"
                    : catalogo.highlighted
                      ? "bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                      : "border border-white/10 bg-transparent text-white hover:bg-white/[0.04]"
                }`}
              >
                {isAtual
                  ? "Plano atual"
                  : catalogo.highlighted
                    ? "Assinar com Mercado Pago (em breve)"
                    : "Plano atual"}
              </button>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
}
