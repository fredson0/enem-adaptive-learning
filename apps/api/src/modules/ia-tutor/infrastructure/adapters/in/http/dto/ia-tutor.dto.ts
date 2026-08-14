import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
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
  @IsUUID()
  conversaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  anexoUrl?: string;
}

export class PresignAnexoDto {
  @IsString()
  @MaxLength(80)
  contentType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fileName?: string;
}

export class CriarConversaDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensagemHistoricoDto)
  mensagens?: MensagemHistoricoDto[];
}

export class AtualizarConversaDto {
  @IsString()
  @MaxLength(120)
  titulo!: string;
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

export class ConversarPersonalizarTrilhaDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  areaSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  assuntoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  assuntoNome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mensagem?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensagemHistoricoDto)
  historico?: MensagemHistoricoDto[];

  @IsOptional()
  iniciar?: boolean;
}

export class FinalizarPersonalizarTrilhaDto {
  @IsString()
  @MaxLength(20)
  areaSlug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  assuntoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  assuntoNome?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensagemHistoricoDto)
  historico!: MensagemHistoricoDto[];
}
