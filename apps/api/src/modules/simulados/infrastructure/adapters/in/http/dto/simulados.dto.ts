import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { parseAreaEnem } from '../../../../../../questoes/core/application/helpers/area-enem';

const AREAS = ['linguagens', 'humanas', 'natureza', 'matematica'] as const;
const QUANTIDADES = [5, 10, 20, 45] as const;

export class CriarSimuladoDto {
  @IsOptional()
  @IsString()
  @IsIn(AREAS)
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2009)
  @Max(2030)
  ano?: number;

  @Type(() => Number)
  @IsInt()
  @IsIn(QUANTIDADES)
  quantidade!: number;

  get areaEnum() {
    return this.area ? parseAreaEnem(this.area) : undefined;
  }
}

export class EnviarRespostaDto {
  @IsString()
  @MinLength(1)
  questaoId!: string;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e'])
  alternativa!: string;
}
