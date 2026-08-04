import { Usuario } from '../../domain/entities/usuario.entity';

export const USUARIOS_REPOSITORY = Symbol('USUARIOS_REPOSITORY');

export type PerfilAlunoData = {
  cursoObjetivo: string | null;
  serieEscolar: string | null;
  tipoEnsinoMedio: string | null;
  nivelAtual: string;
  tempoDiarioMinutos: number;
  onboardingCompleto: boolean;
};

export interface UsuariosRepositoryPort {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  salvar(
    usuario: Usuario,
    meta?: { googleSub?: string },
  ): Promise<Usuario>;
  obterPerfilAluno(userId: string): Promise<PerfilAlunoData | null>;
  atualizarPerfilAluno(
    userId: string,
    data: {
      nome?: string;
      fotoUrl?: string | null;
      cursoObjetivo?: string;
      serieEscolar?: string;
      tipoEnsinoMedio?: string;
      nivelAtual?: string;
      tempoDiarioMinutos?: number;
    },
  ): Promise<{ usuario: Usuario; perfil: PerfilAlunoData }>;
}
