import type { DepoimentoItem } from '../../domain/depoimentos.mock';

export type DepoimentoRecord = {
  id: string;
  usuarioId: string;
  texto: string;
  papel: string | null;
  aprovado: boolean;
  criadoEm: Date;
  usuario: {
    nome: string;
  };
};

export const DEPOIMENTOS_REPOSITORY = Symbol('DEPOIMENTOS_REPOSITORY');

export interface DepoimentosRepositoryPort {
  listarAprovadosOrdenados(): Promise<DepoimentoRecord[]>;
  buscarPorUsuarioId(usuarioId: string): Promise<DepoimentoRecord | null>;
  salvar(input: {
    usuarioId: string;
    texto: string;
    papel?: string | null;
  }): Promise<DepoimentoRecord>;
}

export type DepoimentoPublicoResponse = {
  depoimentos: DepoimentoItem[];
  totalReais: number;
  totalMocks: number;
};

export type MeuDepoimentoResponse = {
  depoimento: {
    id: string;
    texto: string;
    papel: string | null;
    criadoEm: string;
  } | null;
};
