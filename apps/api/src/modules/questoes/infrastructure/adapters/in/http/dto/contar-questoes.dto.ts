import { Transform, Type } from 'class-transformer';
import {
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
import { parseAreaEnem } from '../../../../../core/application/helpers/area-enem';

const AREAS = ['linguagens', 'humanas', 'natureza', 'matematica'] as const;

function splitCsv(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.flatMap((v) => String(v).split(','));
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export class ContarQuestoesQueryDto {
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

  @IsOptional()
  @Transform(({ value }) =>
    splitCsv(value)
      ?.map((part) => Number(part))
      .filter((n) => !Number.isNaN(n)),
  )
  @IsArray()
  @IsInt({ each: true })
  @Min(2009, { each: true })
  @Max(2030, { each: true })
  anos?: number[];

  @IsOptional()
  @Transform(({ value }) => splitCsv(value))
  @IsArray()
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(60, { each: true })
  termosBusca?: string[];

  get areaEnum() {
    return this.area ? parseAreaEnem(this.area) : undefined;
  }
}
