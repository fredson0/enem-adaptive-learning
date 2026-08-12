import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SalvarDiagnosticoTrilhaDto {
  @IsObject()
  autoAvaliacao!: Record<string, number>;

  @IsArray()
  @ArrayMaxSize(16)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(60, { each: true })
  disciplinasFracas!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  metaEnem?: string;
}

export class MarcarEtapaTrilhaDto {
  @IsString()
  @MinLength(10)
  @MaxLength(40)
  etapaId!: string;

  @IsBoolean()
  concluida!: boolean;
}

export class MarcarChecklistIaDto {
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  itemId!: string;

  @IsBoolean()
  concluida!: boolean;
}
