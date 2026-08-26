/**
 * Design Tokens — TradeDash
 * Single source of truth for all color, spacing, and chart style constants.
 * These mirror the CSS custom properties in globals.css @theme block.
 */

// ─── Navy Palette ────────────────────────────────────────────────────────────
export const NAVY = {
  950: "#040d21",
  900: "#071330",
  800: "#0d1f4c",
  700: "#122666",
  600: "#1a3380",
} as const;

// ─── Gold Palette ────────────────────────────────────────────────────────────
export const GOLD = {
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
} as const;

// ─── Semantic Surface Tokens ─────────────────────────────────────────────────
export const SURFACE = {
  /** Main content area background — navy-800 */
  surface: NAVY[800],
  /** Card / panel background — navy-900 */
  card: NAVY[900],
  /** Dividers and element borders */
  border: "#1e2d5a",
  /** Muted / secondary text */
  muted: "#4a5a8a",
} as const;

// ─── State / Status Colors ───────────────────────────────────────────────────
export const STATUS_COLORS = {
  success: "#22c55e",
  danger:  "#ef4444",
  warning: "#f59e0b",
  info:    "#3b82f6",
} as const;

// ─── Signal / Badge Colors ───────────────────────────────────────────────────
export const BADGE_COLORS = {
  pending:    { bg: "#1e2d5a", text: "#fbbf24" },
  entered:    { bg: "#0d2340", text: "#3b82f6" },
  "target-hit": { bg: "#0a2e1c", text: "#22c55e" },
  "sl-hit":   { bg: "#2e0f0f", text: "#ef4444" },
  cancelled:  { bg: "#1a1a2e", text: "#6b7280" },
} as const;

export type BadgeStatus = keyof typeof BADGE_COLORS;

// ─── Chart Colors ────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  /** Primary line / bar — gold */
  primary: GOLD[500],
  /** Secondary line / bar */
  secondary: "#3b82f6",
  /** Profit / positive area */
  profit: "#22c55e",
  /** Loss / negative area */
  loss: "#ef4444",
  /** Chart background */
  background: NAVY[900],
  /** Grid lines */
  grid: "#1e2d5a",
  /** Axis text */
  axisText: "#4a5a8a",
  /** Crosshair */
  crosshair: "#4a5a8a",
} as const;

/** Lightweight Charts baseline options (apply with Object.assign) */
export const CHART_BASE_OPTIONS = {
  layout: {
    background: { color: CHART_COLORS.background },
    textColor: CHART_COLORS.axisText,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: CHART_COLORS.grid },
    horzLines: { color: CHART_COLORS.grid },
  },
  crosshair: {
    vertLine: { color: CHART_COLORS.crosshair, labelBackgroundColor: NAVY[700] },
    horzLine: { color: CHART_COLORS.crosshair, labelBackgroundColor: NAVY[700] },
  },
  timeScale: {
    borderColor: CHART_COLORS.grid,
  },
  rightPriceScale: {
    borderColor: CHART_COLORS.grid,
  },
} as const;

// ─── Spacing Scale ───────────────────────────────────────────────────────────
export const SPACING = {
  sidebarWidth:       240,
  sidebarWidthCollapsed: 64,
  topBarHeight:       60,
  mobileNavHeight:    56,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const FONT_FAMILY = {
  ui:   "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────────────────────
export const Z_INDEX = {
  sidebar:   40,
  topBar:    50,
  dropdown:  60,
  modal:     70,
  toast:     80,
} as const;

// ─── Convenience re-export ───────────────────────────────────────────────────
export const tokens = {
  navy:    NAVY,
  gold:    GOLD,
  surface: SURFACE,
  status:  STATUS_COLORS,
  badge:   BADGE_COLORS,
  chart:   CHART_COLORS,
  spacing: SPACING,
  font:    FONT_FAMILY,
  z:       Z_INDEX,
} as const;

export default tokens;
