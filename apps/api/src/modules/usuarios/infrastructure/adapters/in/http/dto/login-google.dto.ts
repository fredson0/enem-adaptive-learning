import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LoginGoogleDto {
  @IsString()
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

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
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
