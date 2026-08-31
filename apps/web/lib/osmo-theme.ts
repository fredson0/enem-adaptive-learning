/**
 * Paleta Osmo — workspace do aluno
 * Sidebar flutua sobre o canvas marrom escuro (#231E1B + textura sutil).
 * Área de conteúdo usa o canvas; cards usam tons neutros sem tint azulado.
 */
export const OSMO = {
  canvas: "var(--osmo-canvas)",
  sidebar: "var(--osmo-sidebar)",
  sidebarWidth: 320,
  surface: "var(--osmo-surface)",
  header: "var(--osmo-header)",
  active: "var(--osmo-active)",
  hover: "var(--osmo-hover)",
  card: "var(--osmo-card)",
  cardHover: "var(--osmo-hover)",
  border: "var(--osmo-border)",
  borderSubtle: "var(--osmo-border)",
  muted: "var(--osmo-text-muted)",
  accent: "var(--osmo-accent)",
} as const;
