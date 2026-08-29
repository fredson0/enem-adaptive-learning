import type { LacunasResponse } from "@/lib/metricas";

const SUGESTOES_PADRAO = [
  " funções do 2º grau",
  " interpretação de texto",
  " o que mais cai em matemática",
  " como funciona a trilha",
];

export function montarSugestoesAnimadasTutor(
  lacunas: LacunasResponse | null,
): string[] {
  if (!lacunas?.lacunas?.length) {
    return SUGESTOES_PADRAO;
  }

  const principal = lacunas.lacunas[0];
  const area = principal.label.toLowerCase();

  return [
    ` minhas lacunas em ${area}`,
    ` o que mais cai em ${area}`,
    ` ${principal.simuladoSugerido.quantidade} questões de ${area}`,
    " como está meu progresso",
  ];
}

export type SugestaoTutorChip = {
  id: string;
  label: string;
  mensagem: string;
};

export function montarChipsSugestoesTutor(
  lacunas: LacunasResponse | null,
): SugestaoTutorChip[] {
  if (!lacunas?.lacunas?.length) {
    return [
      {
        id: "treino",
        label: "Primeiro treino",
        mensagem: "Monta um treino de 5 questões para eu começar",
      },
      {
        id: "frequencia-mt",
        label: "O que mais cai",
        mensagem: "O que mais cai em matemática no banco?",
      },
      {
        id: "trilha",
        label: "Como funciona",
        mensagem: "Como funciona a trilha personalizada?",
      },
    ];
  }

  const principal = lacunas.lacunas[0];

  return [
    {
      id: "lacunas",
      label: "Minhas lacunas",
      mensagem: "Quais são minhas maiores lacunas?",
    },
    {
      id: "progresso",
      label: "Meu progresso",
      mensagem: "Como está meu desempenho?",
    },
    {
      id: "cobertura",
      label: "Minha cobertura",
      mensagem: "Qual é minha cobertura de questões?",
    },
    {
      id: "frequencia",
      label: `O que cai em ${principal.label}`,
      mensagem: `O que mais cai em ${principal.label.toLowerCase()} no banco?`,
    },
    {
      id: "treino-focado",
      label: `Treino ${principal.label}`,
      mensagem: `Monta ${principal.simuladoSugerido.quantidade} questões de ${principal.label.toLowerCase()}`,
    },
  ];
}
