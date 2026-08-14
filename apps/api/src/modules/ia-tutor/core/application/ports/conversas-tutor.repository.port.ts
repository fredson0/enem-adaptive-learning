import type { MensagemHistorico } from './ia-engine.port';

export type ConversaResumo = {
  id: string;
  titulo: string;
  preview: string;
  atualizadoEm: Date;
};

export type ConversaCompleta = {
  id: string;
  titulo: string;
  mensagens: MensagemHistorico[];
  atualizadoEm: Date;
};

export interface ConversasTutorRepositoryPort {
  listar(userId: string): Promise<ConversaResumo[]>;
  obterPorId(userId: string, conversaId: string): Promise<ConversaCompleta | null>;
  criar(userId: string, titulo?: string): Promise<{ id: string }>;
  adicionarMensagens(
    conversaId: string,
    mensagens: MensagemHistorico[],
  ): Promise<void>;
  atualizarTitulo(conversaId: string, titulo: string): Promise<void>;
  excluir(userId: string, conversaId: string): Promise<void>;
}

export const CONVERSAS_TUTOR_REPOSITORY = Symbol('CONVERSAS_TUTOR_REPOSITORY');
