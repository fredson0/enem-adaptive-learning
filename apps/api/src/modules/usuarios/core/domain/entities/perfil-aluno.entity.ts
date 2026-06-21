export interface PerfilAlunoProps {
  userId: string;
  cursoObjetivo?: string | null;
  tempoDiarioMinutos?: number;
  nivelAtual?: string;
  atualizadoEm?: Date;
}

export class PerfilAluno {
  private readonly _userId: string;
  private _cursoObjetivo: string | null;
  private _tempoDiarioMinutos: number;
  private _nivelAtual: string;
  private _atualizadoEm: Date;

  private constructor(props: PerfilAlunoProps) {
    this._userId = props.userId;
    this._cursoObjetivo = props.cursoObjetivo || null;
    this._tempoDiarioMinutos = props.tempoDiarioMinutos || 120; // 2 horas padrão
    this._nivelAtual = props.nivelAtual || 'INICIANTE';
    this._atualizadoEm = props.atualizadoEm || new Date();
  }

  public static criar(props: PerfilAlunoProps): PerfilAluno {
    if (!props.userId) {
      throw new Error('O perfil deve estar vinculado a um ID de usuário válido.');
    }
    return new PerfilAluno(props);
  }

  get userId(): string {
    return this._userId;
  }
  get cursoObjetivo(): string | null {
    return this._cursoObjetivo;
  }
  get tempoDiarioMinutos(): number {
    return this._tempoDiarioMinutos;
  }
  get nivelAtual(): string {
    return this._nivelAtual;
  }
  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  // Regra de Negócio: Atualizar dados de Onboarding
  public atualizarDados(curso: string, tempo: number, nivel: string): void {
    this._cursoObjetivo = curso;
    this._tempoDiarioMinutos = tempo;
    this._nivelAtual = nivel;
    this._atualizadoEm = new Date();
  }
}
