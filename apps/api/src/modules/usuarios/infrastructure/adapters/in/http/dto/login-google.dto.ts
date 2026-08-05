import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class LoginGoogleDto {
  @IsString()
  @MinLength(20)
  idToken!: string;
}

const SERIE_ESCOLAR = [
  'PRIMEIRO_ANO',
  'SEGUNDO_ANO',
  'TERCEIRO_ANO',
  'NAO_ESTUDA',
] as const;

const TIPO_ENSINO_MEDIO = ['PUBLICO', 'PRIVADO', 'MISTO'] as const;

const NIVEL_ALUNO = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'] as const;

export class RefreshTokenDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  @MinLength(20)
  refreshToken?: string;
}

/**
 * Campos permitidos no perfil. role, plano, tokensDiarios etc. são
 * rejeitados pelo ValidationPipe (forbidNonWhitelisted).
 */
export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cursoObjetivo?: string;

  @IsOptional()
  @IsIn(SERIE_ESCOLAR)
  serieEscolar?: (typeof SERIE_ESCOLAR)[number];

  @IsOptional()
  @IsIn(TIPO_ENSINO_MEDIO)
  tipoEnsinoMedio?: (typeof TIPO_ENSINO_MEDIO)[number];

  @IsOptional()
  @IsIn(NIVEL_ALUNO)
  nivelAtual?: (typeof NIVEL_ALUNO)[number];

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(480)
  tempoDiarioMinutos?: number;
}
