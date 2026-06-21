export type RoleUsuario = 'ALUNO' | 'PROFESSOR' | 'ADMIN';

export interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  fotoUrl?: string | null;
  role?: RoleUsuario;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Usuario {
  private readonly _id: string;
  private _nome: string;
  private _email: string;
  private _fotoUrl: string | null;
  private _role: RoleUsuario;
  private readonly _criadoEm: Date;
  private _atualizadoEm: Date;

  private constructor(props: UsuarioProps) {
    // Usamos o crypto nativo do Node para gerar o UUID caso não venha do banco
    this._id = props.id || crypto.randomUUID();
    this._nome = props.nome;
    this._email = props.email;
    this._fotoUrl = props.fotoUrl || null;
    this._role = props.role || 'ALUNO';
    this._criadoEm = props.criadoEm || new Date();
    this._atualizadoEm = props.atualizadoEm || new Date();
  }

  // Método de Fábrica para criação segura com validações
  public static criar(props: UsuarioProps): Usuario {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('O nome do usuário não pode ser vazio.');
    }

    if (!props.email || !props.email.includes('@')) {
      throw new Error('O e-mail do usuário é inválido.');
    }

    return new Usuario(props);
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get nome(): string {
    return this._nome;
  }
  get email(): string {
    return this._email;
  }
  get fotoUrl(): string | null {
    return this._fotoUrl;
  }
  get role(): RoleUsuario {
    return this._role;
  }
  get criadoEm(): Date {
    return this._criadoEm;
  }
  get updatedAt(): Date {
    return this._atualizadoEm;
  }

  // Regra de Negócio: Atualizar nome ou foto
  public atualizarPerfil(nome: string, fotoUrl?: string): void {
    this._nome = nome;
    if (fotoUrl) this._fotoUrl = fotoUrl;
    this._atualizadoEm = new Date();
  }
}
