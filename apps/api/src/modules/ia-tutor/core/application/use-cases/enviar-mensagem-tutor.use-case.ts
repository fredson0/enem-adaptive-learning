import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { buildConversaTitulo } from '../helpers/conversa-title.helper';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort, ImagemAnexo } from '../ports/ia-engine.port';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../ports/object-storage.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

export type EnviarMensagemTutorInput = {
  userId: string;
  mensagem: string;
  conversaId?: string;
  anexoUrl?: string;
};

@Injectable()
export class EnviarMensagemTutorUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
    @Inject(ObterContextoTutorUseCase)
    private readonly obterContextoTutorUseCase: ObterContextoTutorUseCase,
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  private async resolverImagem(anexoUrl?: string): Promise<ImagemAnexo | undefined> {
    if (!anexoUrl) return undefined;

    const key = this.storage.resolverKeyDeUrl(anexoUrl);
    if (!key) return undefined;

    const arquivo = await this.storage.obterArquivo(key);
    if (!arquivo) return undefined;

    return {
      mimeType: arquivo.contentType,
      base64: arquivo.buffer.toString('base64'),
    };
  }

  async execute(input: EnviarMensagemTutorInput) {
    let conversaId = input.conversaId;

    if (conversaId) {
      const existente = await this.conversasRepository.obterPorId(
        input.userId,
        conversaId,
      );
      if (!existente) {
        throw new NotFoundException('Conversa não encontrada');
      }
    } else {
      const criada = await this.conversasRepository.criar(input.userId);
      conversaId = criada.id;
    }

    const conversa = await this.conversasRepository.obterPorId(
      input.userId,
      conversaId,
    );

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    const contextoMetricas = await this.obterContextoTutorUseCase.execute(
      input.userId,
    );
    const custoTokens = input.anexoUrl ? 2 : 1;
    const tokens = await this.usoTokens.consumir(input.userId, custoTokens);
    const imagem = await this.resolverImagem(input.anexoUrl);

    if (input.anexoUrl && !imagem) {
      throw new NotFoundException('Anexo não encontrado. Envie a imagem novamente.');
    }

    const resposta = await this.iaEngine.enviarMensagem({
      texto: input.mensagem,
      historico: conversa?.mensagens,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
      contextoMetricas,
      imagem,
    });

    const novasMensagens = [
      {
        role: 'user' as const,
        texto: input.mensagem,
        anexoUrl: input.anexoUrl,
      },
      { role: 'assistant' as const, texto: resposta },
    ];

    await this.conversasRepository.adicionarMensagens(
      conversaId,
      novasMensagens,
    );

    const todasMensagens = [...(conversa?.mensagens ?? []), ...novasMensagens];
    if (todasMensagens.length <= 2) {
      await this.conversasRepository.atualizarTitulo(
        conversaId,
        buildConversaTitulo(todasMensagens),
      );
    }

    return {
      resposta,
      conversaId,
      tokens,
    };
  }
}
