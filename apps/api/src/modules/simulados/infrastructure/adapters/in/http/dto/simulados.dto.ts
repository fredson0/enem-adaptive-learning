import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { parseAreaEnem } from '../../../../../../questoes/core/application/helpers/area-enem';

const AREAS = ['linguagens', 'humanas', 'natureza', 'matematica'] as const;
const QUANTIDADES = [5, 10, 20, 45] as const;

export class CriarSimuladoDto {
  @IsOptional()
  @IsString()
  @IsIn(AREAS)
  area?: string;

  /** @deprecated Use `anos`. Mantido para compatibilidade. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2009)
  @Max(2030)
  ano?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(2009, { each: true })
  @Max(2030, { each: true })
  anos?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(60, { each: true })
  termosBusca?: string[];

  @Type(() => Number)
  @IsInt()
  @IsIn(QUANTIDADES)
  quantidade!: number;

  get areaEnum() {
    return this.area ? parseAreaEnem(this.area) : undefined;
  }
}

export class GerarSimuladoComIaDto {
  @IsString()
  @MinLength(10)
  @MaxLength(800)
  pedido!: string;
}

export class EnviarRespostaDto {
  @IsString()
  @MinLength(1)
  questaoId!: string;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e'])
  alternativa!: string;
}
