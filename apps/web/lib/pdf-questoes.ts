import {
  baixarHtml,
  escapeHtml,
  imprimirHtml,
  sanitizarNomeArquivo,
} from "@/lib/pdf-print";

export type PdfQuestaoItem = {
  id: string;
  ano: number;
  indice: number;
  area: string;
  areaLabel: string;
  disciplina: string;
  contexto: string;
  introducaoAlternativas: string | null;
  alternativas: { letra: string; texto: string }[];
  imagemUrl: string | null;
  gabarito: string;
};

export type PdfQuestoesPayload = {
  titulo: string;
  assuntoNome: string;
  areaSlug: string | null;
  incluirGabarito: boolean;
  questoes: PdfQuestaoItem[];
};

function limparContexto(contexto: string): string {
  return contexto
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatarParagrafos(texto: string): string {
  return limparContexto(texto)
    .split(/\n{2,}/)
    .map((paragrafo) => `<p>${escapeHtml(paragrafo.replace(/\n/g, " "))}</p>`)
    .join("");
}

function montarQuestaoHtml(questao: PdfQuestaoItem, numero: number): string {
  const imagem = questao.imagemUrl
    ? `<figure class="figura"><img src="${escapeHtml(questao.imagemUrl)}" alt="Figura da questão ${numero}" /></figure>`
    : "";

  const introducao = questao.introducaoAlternativas
    ? `<p class="intro-alt">${escapeHtml(questao.introducaoAlternativas)}</p>`
    : "";

  const alternativas = questao.alternativas
    .map(
      (alt) =>
        `<li><span class="letra">${escapeHtml(alt.letra)}</span><span>${escapeHtml(alt.texto)}</span></li>`,
    )
    .join("");

  return `<article class="questao">
    <header class="questao-header">
      <span class="numero">Questão ${numero}</span>
      <span class="meta">ENEM ${questao.ano} · ${escapeHtml(questao.areaLabel)} · #${questao.indice}</span>
    </header>
    <div class="enunciado">${formatarParagrafos(questao.contexto)}</div>
    ${imagem}
    ${introducao}
    <ol class="alternativas">${alternativas}</ol>
  </article>`;
}

function montarGabaritoHtml(questoes: PdfQuestaoItem[]): string {
  const linhas = questoes
    .map(
      (questao, index) =>
        `<tr><td>${index + 1}</td><td>ENEM ${questao.ano} · #${questao.indice}</td><td><strong>${escapeHtml(questao.gabarito)}</strong></td></tr>`,
    )
    .join("");

  return `<section class="gabarito page-break">
    <h2>Gabarito</h2>
    <table>
      <thead><tr><th>#</th><th>Questão</th><th>Resposta</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  </section>`;
}

export function montarHtmlQuestoes(payload: PdfQuestoesPayload): string {
  const questoesHtml = payload.questoes
    .map((questao, index) => montarQuestaoHtml(questao, index + 1))
    .join("");

  const gabarito = payload.incluirGabarito
    ? montarGabaritoHtml(payload.questoes)
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.titulo)}</title>
  <style>
    @page { margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #111;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 20px;
    }
    header.doc {
      border-bottom: 2px solid #111;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .marca {
      font-size: 9pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #555;
    }
    h1 { font-size: 20pt; margin: 8px 0 4px; line-height: 1.2; }
    .subtitulo { color: #444; font-size: 10.5pt; margin: 0; }
    .questao {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
      page-break-inside: avoid;
    }
    .questao-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      font-size: 9.5pt;
      color: #555;
    }
    .numero {
      font-weight: 700;
      color: #111;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .enunciado p { margin: 0 0 8px; }
    .intro-alt { margin: 10px 0 6px; font-weight: 600; }
    .figura {
      margin: 12px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .figura img {
      max-width: 100%;
      max-height: 280px;
      object-fit: contain;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 6px;
      background: #fafafa;
    }
    .alternativas {
      list-style: none;
      margin: 12px 0 0;
      padding: 0;
    }
    .alternativas li {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 8px;
      margin-bottom: 8px;
      align-items: start;
    }
    .letra {
      display: inline-flex;
      width: 24px;
      height: 24px;
      align-items: center;
      justify-content: center;
      border: 1px solid #111;
      border-radius: 999px;
      font-weight: 700;
      font-size: 10pt;
    }
    .gabarito { margin-top: 28px; }
    .gabarito h2 { font-size: 14pt; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
    th { background: #f3f3f3; }
    .page-break { page-break-before: always; }
    footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
    }
  </style>
</head>
<body>
  <header class="doc">
    <div class="marca">ENEM+IA · Banco de questões</div>
    <h1>${escapeHtml(payload.titulo)}</h1>
    <p class="subtitulo">${payload.questoes.length} questão${payload.questoes.length === 1 ? "" : "ões"} oficiais do ENEM${payload.incluirGabarito ? " · gabarito ao final" : ""}</p>
  </header>
  ${questoesHtml}
  ${gabarito}
  <footer>Material gerado pelo ENEM+IA · Uso pessoal para estudos</footer>
</body>
</html>`;
}

export function baixarQuestoesComoPdf(
  payload: PdfQuestoesPayload,
  janelaPreAberta?: Window | null,
) {
  imprimirHtml(montarHtmlQuestoes(payload), janelaPreAberta);
}

export function baixarQuestoesComoHtml(payload: PdfQuestoesPayload) {
  baixarHtml(
    `${sanitizarNomeArquivo(payload.titulo)}.html`,
    montarHtmlQuestoes(payload),
  );
}

export function usuarioPediuPdfQuestoes(mensagem: string): boolean {
  const texto = mensagem.toLowerCase();
  return (
    /quest(ões|oes)|prova|simulado|exercícios|exercicios/.test(texto) &&
    (/pdf|baixar|imprimir|material|exportar/.test(texto) ||
      /ger(ar|e)\s/.test(texto))
  );
}
