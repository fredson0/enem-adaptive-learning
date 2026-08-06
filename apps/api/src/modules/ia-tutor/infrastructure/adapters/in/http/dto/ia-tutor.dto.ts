import { IsArray, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MensagemHistoricoDto {
  @IsString()
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(8000)
  texto!: string;
}

export class EnviarMensagemTutorDto {
  @IsString()
  @MaxLength(4000)
  mensagem!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensagemHistoricoDto)
  historico?: MensagemHistoricoDto[];
}

export class ExplicarErroDto {
  @IsUUID()
  questaoId!: string;

  @IsString()
  @MaxLength(1)
  alternativaMarcada!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  perguntaExtra?: string;
}

export class PedirDicaDto {
  @IsUUID()
  questaoId!: string;
}
