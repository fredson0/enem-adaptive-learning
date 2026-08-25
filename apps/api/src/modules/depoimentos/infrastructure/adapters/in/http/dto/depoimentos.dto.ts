import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarDepoimentoDto {
  @IsString()
  @MinLength(20)
  @MaxLength(600)
  texto!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  papel?: string;
}
