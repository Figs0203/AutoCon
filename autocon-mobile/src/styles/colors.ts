/**
 * Paleta de colores centralizada de AutoCon.
 * Extraída del mock-up de diseño para mantener consistencia visual.
 */

export const Colors = {
  // ── Primarios ──────────────────────────────────────────────────
  headerDark: "#1B2A4A",
  headerMid: "#243557",
  accent: "#D4A017",
  accentLight: "#F0C040",
  background: "#F5F6FA",
  white: "#FFFFFF",

  // ── Texto ──────────────────────────────────────────────────────
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textWhite: "#FFFFFF",
  textWhiteMuted: "rgba(255,255,255,0.7)",

  // ── Tarjetas de estadísticas ───────────────────────────────────
  cardGreen: "#E8F5E9",
  cardGreenIcon: "#C8E6C9",
  cardGreenIconFg: "#2E7D32",

  cardYellow: "#FFF8E1",
  cardYellowIcon: "#FFE0B2",
  cardYellowIconFg: "#E6A100",

  cardBlue: "#E3F2FD",
  cardBlueIcon: "#BBDEFB",
  cardBlueIconFg: "#1565C0",

  cardPurple: "#F3E5F5",
  cardPurpleIcon: "#E1BEE7",
  cardPurpleIconFg: "#6A1B9A",

  // ── Badges de estado ───────────────────────────────────────────
  badgeCompletado: "#E8F5E9",
  badgeCompletadoText: "#2E7D32",
  badgeEnProgreso: "#FFF8E1",
  badgeEnProgresoText: "#E6A100",
  badgePendiente: "#FFF3E0",
  badgePendienteText: "#E65100",
  badgeBorrador: "#E3F2FD",
  badgeBorradorText: "#1565C0",

  // ── Superficies ────────────────────────────────────────────────
  searchBar: "rgba(255,255,255,0.15)",
  searchBarPlaceholder: "rgba(255,255,255,0.5)",
  cardBorder: "#E5E7EB",
  shadow: "#000000",

  // ── Tab bar ────────────────────────────────────────────────────
  tabActive: "#D4A017",
  tabInactive: "#9CA3AF",
} as const;

export type ColorKey = keyof typeof Colors;
