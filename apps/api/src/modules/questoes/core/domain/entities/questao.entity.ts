import type { AreaEnem } from '@generated/prisma';

export type AlternativaQuestao = {
  letra: string;
  texto: string;
};

export type QuestaoProps = {
  id: string;
  enemDevId: string;
  ano: number;
  area: AreaEnem;
  indice: number;
  disciplina: string;
  contexto: string;
  introducaoAlternativas: string | null;
  alternativas: AlternativaQuestao[];
  gabarito: string;
  imagemUrl: string | null;
};

export class Questao {
  private constructor(private readonly props: QuestaoProps) {}

  static criar(props: QuestaoProps): Questao {
    return new Questao(props);
  }

  get id() {
    return this.props.id;
  }

  get enemDevId() {
    return this.props.enemDevId;
  }

  get ano() {
    return this.props.ano;
  }

  get area() {
    return this.props.area;
  }

  get indice() {
    return this.props.indice;
  }

  get disciplina() {
    return this.props.disciplina;
  }

  get contexto() {
    return this.props.contexto;
  }

  get introducaoAlternativas() {
    return this.props.introducaoAlternativas;
  }

  get alternativas() {
    return this.props.alternativas;
  }

  get gabarito() {
    return this.props.gabarito;
  }

  get imagemUrl() {
    return this.props.imagemUrl;
  }

  /** Resposta pública — sem gabarito (durante simulado). */
  toPublico() {
    return {
      id: this.id,
      ano: this.ano,
      area: this.area,
      indice: this.indice,
      contexto: this.contexto,
      introducaoAlternativas: this.introducaoAlternativas,
      alternativas: this.alternativas.map(({ letra, texto }) => ({ letra, texto })),
      imagemUrl: this.imagemUrl,
    };
  }

  toJSON() {
    return {
      ...this.toPublico(),
      gabarito: this.gabarito,
    };
  }
}
