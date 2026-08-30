import type { RespostaDisciplinaBruta } from '../ports/metricas.repository.port';

const AREA_LABELS: Record<string, string> = {
  MATEMATICA: 'Matemática',
  LINGUAGENS: 'Linguagens',
  HUMANAS: 'Ciências Humanas',
  NATUREZA: 'Ciências da Natureza',
};

const AREA_SLUGS: Record<string, string> = {
  MATEMATICA: 'matematica',
  LINGUAGENS: 'linguagens',
  HUMANAS: 'humanas',
  NATUREZA: 'natureza',
};

export type { RespostaDisciplinaBruta };

export type LacunaDisciplinaResumo = {
  disciplina: string;
  area: RespostaDisciplinaBruta['area'];
  slug: string;
  label: string;
  erros: number;
  acertos: number;
  total: number;
  taxaErro: number;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  mensagem: string;
};

function prioridadeDisciplina(taxaErro: number, erros: number): LacunaDisciplinaResumo['prioridade'] {
  if (erros >= 3 && taxaErro >= 60) return 'Alta';
  if (erros >= 2 && taxaErro >= 45) return 'Média';
  return 'Baixa';
}

function formatarDisciplinaLabel(disciplina: string): string {
  const limpa = disciplina.trim();
  if (!limpa) return 'Disciplina';
  return limpa.charAt(0).toUpperCase() + limpa.slice(1);
}

/** Agrega lacunas por `questoes.disciplina` a partir das respostas do aluno. */
export function agregarLacunasPorDisciplina(
  respostas: RespostaDisciplinaBruta[],
  options?: { minimoTentativas?: number; limite?: number },
): LacunaDisciplinaResumo[] {
  const minimoTentativas = options?.minimoTentativas ?? 2;
  const limite = options?.limite ?? 12;

  const mapa = new Map<
    string,
    {
      disciplina: string;
      area: RespostaDisciplinaBruta['area'];
      erros: number;
      acertos: number;
    }
  >();

  for (const resposta of respostas) {
    const disciplina = resposta.disciplina?.trim();
    if (!disciplina) continue;

    const chave = `${resposta.area}::${disciplina.toLowerCase()}`;
    const atual = mapa.get(chave) ?? {
      disciplina,
      area: resposta.area,
      erros: 0,
      acertos: 0,
    };

    if (resposta.correto) {
      atual.acertos += 1;
    } else {
      atual.erros += 1;
    }

    mapa.set(chave, atual);
  }

  return [...mapa.values()]
    .map((item) => {
      const total = item.erros + item.acertos;
      const taxaErro =
        total > 0 ? Math.round((item.erros / total) * 1000) / 10 : 0;
      const prioridade = prioridadeDisciplina(taxaErro, item.erros);
      const labelArea = AREA_LABELS[item.area] ?? item.area;
      const disciplinaLabel = formatarDisciplinaLabel(item.disciplina);

      return {
        disciplina: disciplinaLabel,
        area: item.area,
        slug: AREA_SLUGS[item.area] ?? item.area.toLowerCase(),
        label: labelArea,
        erros: item.erros,
        acertos: item.acertos,
        total,
        taxaErro,
        prioridade,
        mensagem:
          item.erros === 0
            ? `${disciplinaLabel} está indo bem em ${labelArea}.`
            : prioridade === 'Alta'
              ? `${disciplinaLabel} concentra ${item.erros} erro${item.erros === 1 ? '' : 's'} (${taxaErro}% de erro em ${labelArea}).`
              : `${disciplinaLabel} pede revisão em ${labelArea} — ${item.erros} erro${item.erros === 1 ? '' : 's'} registrado${item.erros === 1 ? '' : 's'}.`,
      };
    })
    .filter((item) => item.total >= minimoTentativas && item.erros > 0)
    .sort((a, b) => {
      if (b.erros !== a.erros) return b.erros - a.erros;
      if (b.taxaErro !== a.taxaErro) return b.taxaErro - a.taxaErro;
      return b.total - a.total;
    })
    .slice(0, limite);
}

export function selecionarDisciplinasPorArea(
  lacunas: LacunaDisciplinaResumo[],
  areaSlug: string,
  limite = 3,
): string[] {
  return lacunas
    .filter((item) => item.slug === areaSlug)
    .slice(0, limite)
    .map((item) => item.disciplina);
}

export function mesclarDisciplinasSugeridas(
  reais: string[],
  declaradas: string[],
  fallback: string[],
  limite = 3,
): string[] {
  const resultado: string[] = [];

  for (const item of [...reais, ...declaradas, ...fallback]) {
    const normalizado = item.trim();
    if (!normalizado) continue;
    const jaExiste = resultado.some(
      (existente) => existente.toLowerCase() === normalizado.toLowerCase(),
    );
    if (jaExiste) continue;
    resultado.push(normalizado);
    if (resultado.length >= limite) break;
  }

  return resultado;
}
