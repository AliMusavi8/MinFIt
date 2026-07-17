// ─── FlowNote Streak — Design System ────────────────────
// Material 3 inspired dark theme with green primary accent
// Aligned with reference design specifications

export const colors = {
  // Primary palette
  primary: '#55ea4d',           // Vivid green (Material primary)
  primaryContainer: '#32cd32',  // Lime green container
  primaryDark: '#28A428',       // Darker green for pressed states
  primaryLight: '#75ff68',      // Lighter green for highlights
  primaryMuted: 'rgba(85, 234, 77, 0.15)',
  primaryGlow: 'rgba(85, 234, 77, 0.25)',

  // Surface system (Material 3 tonal elevation)
  bg: '#00000E',                       // Deep dark background
  surface: '#0e150b',                  // Surface base
  surfaceDim: '#0e150b',               // Surface dim
  surfaceContainer: '#1a2217',         // Surface container
  surfaceContainerLow: '#161e13',      // Surface container low
  surfaceContainerHigh: '#242c21',     // Surface container high
  surfaceContainerHighest: '#2f372b',  // Surface container highest
  surfaceBright: '#333c30',            // Surface bright

  // Legacy surface aliases (for minimal refactoring)
  bgCard: '#0E0E1E',
  bgElevated: '#111128',
  bgInput: '#0D0D20',
  bgModal: '#080818',
  surfaceHover: '#1C1C3A',
  surfaceSubtle: '#0E0E1E',

  // Text (Material 3 on-surface)
  text: '#dce6d4',             // on-surface / on-background
  textSecondary: '#bccbb4',    // on-surface-variant
  textMuted: '#869580',        // outline
  textOnPrimary: '#003a03',    // on-primary
  onBackground: '#dce6d4',
  onSurface: '#dce6d4',
  onSurfaceVariant: '#bccbb4',

  // Accents
  cream: '#F5F5DC',            // Warm cream for best streak badge
  creamMuted: 'rgba(225, 235, 200, 0.1)',
  secondary: '#c1cba9',
  secondaryContainer: '#414a30',

  // Semantic
  danger: '#dc143c',
  dangerContainer: '#93000a',
  dangerMuted: 'rgba(220, 20, 60, 0.15)',
  warning: '#FFB84D',
  success: '#55ea4d',

  // Borders
  border: '#1E1E3A',
  borderLight: '#2A2A4A',
  borderSelf: 'rgba(240, 240, 245, 0.06)',
  outlineVariant: '#3d4a39',

  // Streak heatmap levels
  heatmap0: '#0A0A1A',
  heatmap1: 'rgba(50, 205, 50, 0.2)',
  heatmap2: 'rgba(50, 205, 50, 0.4)',
  heatmap3: 'rgba(50, 205, 50, 0.6)',
  heatmap4: '#32CD32',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 56,
  // Label styles
  labelSm: 12,
  labelMd: 14,
  // Headline styles
  headlineMd: 24,
  headlineLg: 32,
  headlineLgMobile: 28,
  // Navigation
  navItem: 13,
} as const;
