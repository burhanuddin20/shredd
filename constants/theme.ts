/**
 * Attack on Titan inspired military theme colors
 * Near-black background with muted military green accents
 */

import { Platform } from 'react-native';

const tintColorLight = '#556B2F'; // Muted military green
const tintColorDark = '#6B705C'; // Desaturated military green

export const Colors = {
  light: {
    text: '#1a1a1a',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    // Attack on Titan military theme colors
    primary: '#0B0C0C', // Near-black
    secondary: '#111111', // Dark surface
    accent: '#556B2F', // Muted military green
    accentSecondary: '#6B705C', // Desaturated military green
    beige: '#D0C9B3', // Desaturated beige
    surface: '#111111', // Dark surface
    surfaceDark: '#0B0C0C', // Near-black
    border: '#2A2A2A', // Dark border
    danger: '#B22222', // Military red
    warning: '#DAA520', // Military gold
    success: '#556B2F', // Military green
    rankGold: '#DAA520', // Military gold
    rankSilver: '#C0C0C0', // Military silver
    rankBronze: '#CD7F32', // Military bronze
  },
  dark: {
    text: '#D0C9B3', // Desaturated beige
    background: '#0B0C0C', // Near-black
    tint: tintColorDark,
    icon: '#6B705C', // Desaturated military green
    tabIconDefault: '#6B705C',
    tabIconSelected: '#556B2F', // Muted military green
    // Attack on Titan military theme colors
    primary: '#0B0C0C', // Near-black
    secondary: '#111111', // Dark surface
    accent: '#556B2F', // Muted military green
    accentSecondary: '#6B705C', // Desaturated military green
    beige: '#D0C9B3', // Desaturated beige
    surface: '#111111', // Dark surface
    surfaceDark: '#0B0C0C', // Near-black
    border: '#2A2A2A', // Dark border
    danger: '#B22222', // Military red
    warning: '#DAA520', // Military gold
    success: '#556B2F', // Military green
    rankGold: '#DAA520', // Military gold
    rankSilver: '#C0C0C0', // Military silver
    rankBronze: '#CD7F32', // Military bronze
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Military stencil font for headers */
    military: 'Arial-BoldMT',
    /** Clean modern sans-serif for body text */
    body: 'system-ui',
    /** Monospace for numbers/countdown */
    mono: 'ui-monospace',
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
  },
  default: {
    military: 'Arial',
    body: 'normal',
    mono: 'monospace',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
  },
  web: {
    military: "'Arial Black', 'Impact', 'Helvetica Neue', Arial, sans-serif",
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
  },
});
