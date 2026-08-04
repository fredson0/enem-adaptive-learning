import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LoginGoogleDto {
  @IsString()
  idToken!: string;
}

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cursoObjetivo?: string;

  @IsOptional()
  @IsString()
  nivelAtual?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(480)
  tempoDiarioMinutos?: number;
}
