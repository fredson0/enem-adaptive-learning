/**
 * Paleta Osmo — workspace do aluno
 * Sidebar (#181818) flutua sobre o canvas (#111111 + textura sutil).
 * Área de conteúdo usa o canvas; cards usam tons neutros sem tint azulado.
 */
export const OSMO = {
  canvas: "#111111",
  sidebar: "#141414",
  sidebarWidth: 320,
  surface: "#111111",
  active: "#1e1e1e",
  hover: "#1a1a1a",
  card: "#161616",
  cardHover: "#1a1a1a",
  border: "#262626",
  borderSubtle: "rgba(255,255,255,0.06)",
  muted: "rgba(255,255,255,0.55)",
  accent: "#b0ff57",
} as const;
