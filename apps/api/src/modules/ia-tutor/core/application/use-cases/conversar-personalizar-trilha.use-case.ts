import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort, MensagemHistorico } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { buildPersonalizarTrilhaSystemPrompt } from '../helpers/trilha-tutor.helper';
import {
  avaliarEscopoMensagem,
  respostaForaEscopo,
} from '../helpers/tutor-escopo.helper';
import { sanitizarRespostaTutor } from '../helpers/tutor-formato.helper';
import { getAssuntoById } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';

export type ConversarPersonalizarTrilhaInput = {
  userId: string;
  areaSlug?: string;
  assuntoId?: string;
  assuntoNome?: string;
  mensagem?: string;
  historico?: MensagemHistorico[];
  iniciar?: boolean;
};

@Injectable()
export class ConversarPersonalizarTrilhaUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(ObterTrilhaUseCase)
    private readonly obterTrilhaUseCase: ObterTrilhaUseCase,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
  ) {}

  async execute(input: ConversarPersonalizarTrilhaInput) {
    const trilha = await this.obterTrilhaUseCase.execute(input.userId);

    if (!trilha.diagnosticoCompleto) {
      throw new ServiceUnavailableException(
        'Complete o diagnóstico antes de personalizar a trilha.',
      );
    }

    const slug = input.areaSlug ?? trilha.areaPrioritaria;
    const area = trilha.areas.find((item) => item.slug === slug);

    if (!area) {
      throw new BadRequestException('Área inválida para personalização.');
    }

    const historico = input.historico ?? [];
    const iniciar = Boolean(input.iniciar) && historico.length === 0;

    if (!iniciar && !input.mensagem?.trim()) {
      throw new BadRequestException('Mensagem obrigatória.');
    }

    if (input.mensagem?.trim()) {
      const escopo = avaliarEscopoMensagem(input.mensagem, historico, {
        entrevista: true,
      });
      if (escopo.escopo === 'fora_escopo') {
        const tokens = await this.usoTokens.obterSaldo(input.userId);
        return {
          resposta: respostaForaEscopo(escopo.motivo),
          areaSlug: area.slug,
          podeFinalizar: false,
          tokens,
        };
      }
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    await this.usoTokens.consumir(input.userId, 1);

    const assuntoCatalogo = input.assuntoId
      ? getAssuntoById(input.assuntoId)
      : undefined;
    const assuntoNome =
      input.assuntoNome?.trim() || assuntoCatalogo?.nome || undefined;

    const systemPrompt = buildPersonalizarTrilhaSystemPrompt({
      areaLabel: area.label,
      areaSlug: area.slug,
      disciplinas: assuntoNome ? [assuntoNome] : area.disciplinasSugeridas,
      assuntoNome,
      progresso: area.progresso,
      proximaEtapa: area.proximaEtapa?.titulo,
      metaEnem: trilha.metaEnem,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
    });

    const textoUsuario = iniciar
      ? assuntoNome
        ? `Olá! Quero montar minha checklist personalizada para estudar ${assuntoNome} em ${area.label}.`
        : 'Olá! Quero montar minha checklist personalizada para esta área.'
      : input.mensagem!.trim();

    const resposta = sanitizarRespostaTutor(
      await this.iaEngine.enviarMensagem({
        texto: textoUsuario,
        historico,
        nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
        systemPromptOverride: systemPrompt,
      }),
    );

    const respostasUsuario =
      historico.filter((m) => m.role === 'user').length + (iniciar ? 0 : 1);

    return {
      resposta,
      areaSlug: area.slug,
      podeFinalizar:
        respostasUsuario >= 2 || /finalizar/i.test(resposta),
    };
  }
}
