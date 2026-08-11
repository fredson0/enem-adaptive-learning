import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const AREAS = ['matematica', 'linguagens', 'humanas', 'natureza'] as const;

export class SalvarDiagnosticoTrilhaDto {
  @IsObject()
  autoAvaliacao!: Record<string, number>;

  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(60, { each: true })
  disciplinasFracas!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  metaEnem?: string;

  get autoAvaliacaoNormalizada() {
    const normalizada: Record<string, number> = {};

    for (const slug of AREAS) {
      const valor = Number(this.autoAvaliacao[slug]);
      normalizada[slug] = valor;
    }

    return normalizada;
  }
}
