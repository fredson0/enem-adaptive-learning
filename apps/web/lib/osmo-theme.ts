/**
 * Paleta Osmo — workspace do aluno
 * Sidebar (#181818) flutua sobre o canvas (#111111 + textura sutil).
 * Área de conteúdo usa o canvas; cards usam tons neutros sem tint azulado.
 */
export const OSMO = {
  canvas: "#111111",
  sidebar: "#181818",
  surface: "#111111",
  active: "#252525",
  hover: "#1f1f1f",
  card: "#161616",
  cardHover: "#1a1a1a",
  border: "#2a2a2a",
  borderSubtle: "rgba(255,255,255,0.06)",
  muted: "rgba(255,255,255,0.55)",
  accent: "#b0ff57",
} as const;
