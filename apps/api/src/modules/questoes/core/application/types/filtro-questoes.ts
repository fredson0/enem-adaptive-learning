import type { AreaEnem } from '@generated/prisma';

export type FiltroQuestoes = {
  area?: AreaEnem;
  /** Um único ano (legado). Ignorado se `anos` estiver preenchido. */
  ano?: number;
  /** Vários anos — ex.: [2018, 2019, 2020]. Vazio = todos os anos. */
  anos?: number[];
  /** Busca no enunciado (OR entre termos) — ex.: função, eletromagnetismo */
  termosBusca?: string[];
};
