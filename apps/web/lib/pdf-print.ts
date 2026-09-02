export function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sanitizarNomeArquivo(titulo: string): string {
  return (
    titulo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "material-enem"
  );
}

/** Abre a janela no clique do usuário (antes do await) para evitar bloqueio de pop-up. */
export function abrirJanelaImpressao(titulo = "ENEM+IA"): Window | null {
  try {
    const janela = window.open("about:blank", "_blank");
    if (janela && !janela.closed) {
      janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><title>${escapeHtml(titulo)}</title></head>
<body style="font-family:system-ui,sans-serif;padding:32px;color:#333;">
  <p>Preparando seu material…</p>
</body>
</html>`);
      janela.document.close();
    }
    return janela;
  } catch {
    return null;
  }
}

export function imprimirHtml(html: string, janelaPreAberta?: Window | null) {
  const imprimirEmJanela = (janela: Window) => {
    janela.document.open();
    janela.document.write(html);
    janela.document.close();

    const disparar = () => {
      janela.focus();
      janela.print();
    };

    if (janela.document.readyState === "complete") {
      setTimeout(disparar, 80);
    } else {
      janela.onload = () => setTimeout(disparar, 80);
    }
  };

  if (janelaPreAberta && !janelaPreAberta.closed) {
    imprimirEmJanela(janelaPreAberta);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Não foi possível preparar a impressão. Tente novamente.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => iframe.remove();
  const disparar = () => {
    win.focus();
    win.print();
    setTimeout(cleanup, 1000);
  };

  if (doc.readyState === "complete") {
    setTimeout(disparar, 120);
  } else {
    iframe.onload = () => setTimeout(disparar, 120);
  }
}

export function baixarHtml(nomeArquivo: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo.endsWith(".html") ? nomeArquivo : `${nomeArquivo}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
