import type { EnviarMensagemIaInput } from '../ports/ia-engine.port';

export type IaModelTier = 'default' | 'exatas';

const AREAS_EXATAS = new Set(['MATEMATICA', 'NATUREZA']);

export function isAreaExatas(area?: string | null): boolean {
  return area != null && AREAS_EXATAS.has(area);
}

export function resolverModelTier(input: {
  areaEnem?: string;
  modelTier?: IaModelTier;
}): IaModelTier {
  if (input.modelTier) return input.modelTier;
  return isAreaExatas(input.areaEnem) ? 'exatas' : 'default';
}

export function enriquecerInputModelTier(
  input: EnviarMensagemIaInput,
): EnviarMensagemIaInput {
  const modelTier = resolverModelTier(input);
  if (modelTier === input.modelTier) return input;
  return { ...input, modelTier };
}

/** Monta lista de modelos: exatas usa env dedicado quando configurado. */
export function montarCandidatosModelo(options: {
  tier: IaModelTier;
  configuredDefault?: string;
  configuredExatas?: string;
  fallbacks: readonly string[];
}): string[] {
  const exatas = options.configuredExatas?.trim();
  const padrao = options.configuredDefault?.trim();
  const primary =
    options.tier === 'exatas' && exatas ? exatas : padrao;

  if (!primary) return [...options.fallbacks];

  return [primary, ...options.fallbacks.filter((model) => model !== primary)];
}
