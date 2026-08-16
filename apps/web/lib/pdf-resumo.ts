import {
  abrirJanelaImpressao,
  baixarHtml,
  escapeHtml,
  imprimirHtml,
  sanitizarNomeArquivo,
} from "@/lib/pdf-print";

export type PdfResumoSecao = {
  titulo: string;
  paragrafos: string[];
  topicos?: string[];
};

export type PdfResumoPayload = {
  titulo: string;
  subtitulo?: string;
  secoes: PdfResumoSecao[];
  dicaFinal?: string;
};

function montarHtmlResumo(resumo: PdfResumoPayload): string {
  const secoes = resumo.secoes
    .map((secao) => {
      const paragrafos = secao.paragrafos
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("");
      const topicos = secao.topicos?.length
        ? `<ul>${secao.topicos.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
        : "";

      return `<section class="secao">
        <h2>${escapeHtml(secao.titulo)}</h2>
        ${paragrafos}
        ${topicos}
      </section>`;
    })
    .join("");

  const dica = resumo.dicaFinal
    ? `<aside class="dica"><strong>Dica final:</strong> ${escapeHtml(resumo.dicaFinal)}</aside>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(resumo.titulo)}</title>
  <style>
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #111;
      line-height: 1.55;
      font-size: 11.5pt;
      margin: 0;
      padding: 24px;
    }
    header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; }
    .marca { font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; color: #444; }
    h1 { font-size: 22pt; margin: 8px 0 4px; line-height: 1.2; }
    .subtitulo { color: #444; font-size: 11pt; margin: 0; }
    .secao { margin-bottom: 20px; page-break-inside: avoid; }
    h2 { font-size: 13pt; margin: 0 0 8px; border-left: 3px solid #111; padding-left: 8px; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 8px 18px; padding: 0; }
    li { margin-bottom: 4px; }
    .dica {
      margin-top: 24px;
      padding: 12px 14px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f7f7f7;
      page-break-inside: avoid;
    }
    footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
    }
  </style>
</head>
<body>
  <header>
    <div class="marca">ENEM+ · Material de estudo</div>
    <h1>${escapeHtml(resumo.titulo)}</h1>
    ${resumo.subtitulo ? `<p class="subtitulo">${escapeHtml(resumo.subtitulo)}</p>` : ""}
  </header>
  ${secoes}
  ${dica}
  <footer>Gerado pelo tutor IA do ENEM+ · Uso pessoal para estudos</footer>
</body>
</html>`;
}

/** @deprecated Use abrirJanelaImpressao */
export const abrirJanelaImpressaoResumo = abrirJanelaImpressao;

export function baixarResumoComoPdf(
  resumo: PdfResumoPayload,
  janelaPreAberta?: Window | null,
) {
  imprimirHtml(montarHtmlResumo(resumo), janelaPreAberta);
}

export function baixarResumoComoHtml(resumo: PdfResumoPayload) {
  baixarHtml(
    `${sanitizarNomeArquivo(resumo.titulo)}.html`,
    montarHtmlResumo(resumo),
  );
}

export function usuarioPediuPdf(mensagem: string): boolean {
  const texto = mensagem.toLowerCase();
  return (
    /\bpdf\b/.test(texto) ||
    /ger(ar|e)\s+(um\s+)?pdf/.test(texto) ||
    /baixar\s+(o\s+)?(material|resumo|pdf)/.test(texto) ||
    /material\s+para\s+imprimir/.test(texto) ||
    /exportar\s+(o\s+)?(material|resumo|pdf)/.test(texto)
  );
}

export const CUSTO_TOKENS_PDF_RESUMO = 2;
