import { Type, Transform } from 'class-transformer';
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
import { parseModoSimulado } from '../../../../../core/application/helpers/modo-simulado.config';

const AREAS = ['linguagens', 'humanas', 'natureza', 'matematica'] as const;
const MODOS = ['treino', 'modalidade', 'cronometrado'] as const;
const QUANTIDADES = [5, 10, 20, 45] as const;
const STATUS = ['EM_ANDAMENTO', 'CONCLUIDO'] as const;

export class CriarSimuladoDto {
  @IsOptional()
  @IsString()
  @IsIn(MODOS)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  modo?: string;

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

  @IsOptional()
  priorizarNaoDominadas?: boolean;

  get areaEnum() {
    return this.area ? parseAreaEnem(this.area) : undefined;
  }

  get modoEnum() {
    return parseModoSimulado(this.modo);
  }
}

export class GerarSimuladoComIaDto {
  @IsString()
  @MinLength(10)
  @MaxLength(800)
  pedido!: string;

  @IsOptional()
  @IsString()
  @IsIn(MODOS)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  modo?: string;

  get modoEnum() {
    return parseModoSimulado(this.modo);
  }
}

export class ListarSimuladosQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(MODOS)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  modo?: string;

  @IsOptional()
  @IsString()
  @IsIn(STATUS)
  status?: (typeof STATUS)[number];

  @IsOptional()
  @IsString()
  @IsIn(AREAS)
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  get modoEnum() {
    return this.modo ? parseModoSimulado(this.modo) : undefined;
  }

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
