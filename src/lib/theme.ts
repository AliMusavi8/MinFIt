// ─── FlowNote Streak — Design System ────────────────────

export const colors = {
  // Core palette from plan
  primary: '#32CD32',        // Lime Green
  primaryDark: '#28A428',    // Darker green for pressed states
  primaryLight: '#4AE04A',   // Lighter green for highlights
  primaryMuted: 'rgba(50, 205, 50, 0.15)', // Subtle green tint
  primaryGlow: 'rgba(50, 205, 50, 0.25)',

  // Backgrounds
  bg: '#00000E',             // Deep dark background
  bgCard: '#0A0A1A',         // Card background
  bgElevated: '#111128',     // Elevated surfaces
  bgInput: '#0D0D20',        // Input fields
  bgModal: '#080818',        // Modal background

  // Surfaces
  surface: '#161630',        // Subtle surface
  surfaceHover: '#1C1C3A',   // Hover state

  // Text
  text: '#F0F0F5',           // Primary text
  textSecondary: '#8888A0',  // Secondary text
  textMuted: '#555570',      // Muted text
  textOnPrimary: '#00000E',  // Text on primary color

  // Accents
  cream: '#E1EBC8',          // Light green/cream accent
  creamMuted: 'rgba(225, 235, 200, 0.1)',

  // Semantic
  danger: '#FF4D6A',
  dangerMuted: 'rgba(255, 77, 106, 0.15)',
  warning: '#FFB84D',
  success: '#32CD32',

  // Borders
  border: '#1E1E3A',
  borderLight: '#2A2A4A',

  // Streak heatmap levels
  heatmap0: '#0A0A1A',      // No activity
  heatmap1: 'rgba(50, 205, 50, 0.2)',
  heatmap2: 'rgba(50, 205, 50, 0.4)',
  heatmap3: 'rgba(50, 205, 50, 0.6)',
  heatmap4: '#32CD32',       // Full activity
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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
  hero: 48,
} as const;
