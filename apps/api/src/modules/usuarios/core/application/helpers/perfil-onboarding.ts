import type { PerfilAlunoData } from '../ports/usuarios.repository.port';

export function isPerfilOnboardingCompleto(
  perfil: Pick<
    PerfilAlunoData,
    'cursoObjetivo' | 'serieEscolar' | 'tipoEnsinoMedio'
  >,
): boolean {
  return Boolean(
    perfil.cursoObjetivo && perfil.serieEscolar && perfil.tipoEnsinoMedio,
  );
}
