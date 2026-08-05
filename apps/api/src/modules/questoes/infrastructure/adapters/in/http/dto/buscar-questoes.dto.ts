import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { parseAreaEnem } from '../../../../../core/application/helpers/area-enem';

const AREAS = ['linguagens', 'humanas', 'natureza', 'matematica'] as const;

export class BuscarQuestoesQueryDto {
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

  get areaEnum() {
    return this.area ? parseAreaEnem(this.area) : undefined;
  }
}
