import React from 'react';
import {
  ThemeId,
  BuiltinThemeId,
  FontFamily,
  CustomThemeColors,
  FontPairing,
  ThemeDefinition,
  PresentationSettings,
} from '../types/presentation';

export type { ThemeDefinition };

export const THEMES: Record<BuiltinThemeId, ThemeDefinition> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Night',
    category: 'dark',
    description: 'Deep carbon charcoal with crisp electric indigo highlights',
    previewBg: '#090d16',
    previewAccent: '#6366f1',
    bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 text-slate-100',
    textClass: 'text-slate-200',
    headingColor: '#f8fafc',
    accentColor: '#818cf8',
    secondaryColor: '#94a3b8',
    borderClass: 'border-slate-800',
    cardBgClass: 'bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm',
    codeThemeClass: 'bg-slate-950/90 text-slate-100 border border-slate-800',
    customColors: {
      background: '#090d16',
      surface: '#0f172a',
      heading: '#f8fafc',
      text: '#e2e8f0',
      accent: '#818cf8',
      secondary: '#94a3b8',
      border: '#1e293b',
      codeBg: '#050811',
    },
  },
  'clean-white': {
    id: 'clean-white',
    name: 'Architectural Minimal',
    category: 'light',
    description: 'Crisp editorial white canvas with high-contrast neutral slate',
    previewBg: '#ffffff',
    previewAccent: '#0f172a',
    bgClass: 'bg-white text-slate-900',
    textClass: 'text-slate-700',
    headingColor: '#0f172a',
    accentColor: '#2563eb',
    secondaryColor: '#64748b',
    borderClass: 'border-slate-200',
    cardBgClass: 'bg-slate-50 border border-slate-200',
    codeThemeClass: 'bg-slate-900 text-slate-100 border border-slate-800',
    customColors: {
      background: '#ffffff',
      surface: '#f8fafc',
      heading: '#0f172a',
      text: '#334155',
      accent: '#2563eb',
      secondary: '#64748b',
      border: '#e2e8f0',
      codeBg: '#0f172a',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nordic Frost',
    category: 'dark',
    description: 'Arctic night palette with icy cyan and clean frost geometry',
    previewBg: '#242933',
    previewAccent: '#88c0d0',
    bgClass: 'bg-[#242933] text-[#d8dee9]',
    textClass: 'text-[#e5e9f0]',
    headingColor: '#eceff4',
    accentColor: '#88c0d0',
    secondaryColor: '#81a1c1',
    borderClass: 'border-[#3b4252]',
    cardBgClass: 'bg-[#2e3440] border border-[#3b4252]',
    codeThemeClass: 'bg-[#1e222a] text-[#eceff4] border border-[#3b4252]',
    customColors: {
      background: '#242933',
      surface: '#2e3440',
      heading: '#eceff4',
      text: '#e5e9f0',
      accent: '#88c0d0',
      secondary: '#81a1c1',
      border: '#3b4252',
      codeBg: '#1e222a',
    },
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Cyber',
    category: 'dark',
    description: 'Famous gothic developer aesthetic with neon lilac and neon mint',
    previewBg: '#282a36',
    previewAccent: '#bd93f9',
    bgClass: 'bg-[#282a36] text-[#f8f8f2]',
    textClass: 'text-[#e2e8f0]',
    headingColor: '#50fa7b',
    accentColor: '#bd93f9',
    secondaryColor: '#ff79c6',
    borderClass: 'border-[#44475a]',
    cardBgClass: 'bg-[#1e1f29] border border-[#44475a]',
    codeThemeClass: 'bg-[#191a21] text-[#f8f8f2] border border-[#44475a]',
    customColors: {
      background: '#282a36',
      surface: '#1e1f29',
      heading: '#50fa7b',
      text: '#f8f8f2',
      accent: '#bd93f9',
      secondary: '#ff79c6',
      border: '#44475a',
      codeBg: '#191a21',
    },
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Warmth',
    category: 'light',
    description: 'Warm cream book paper tone designed for long-form readability',
    previewBg: '#fdf6e3',
    previewAccent: '#b58900',
    bgClass: 'bg-[#fdf6e3] text-[#657b83]',
    textClass: 'text-[#586e75]',
    headingColor: '#073642',
    accentColor: '#268bd2',
    secondaryColor: '#b58900',
    borderClass: 'border-[#eee8d5]',
    cardBgClass: 'bg-[#f5efdc] border border-[#eee8d5]',
    codeThemeClass: 'bg-[#002b36] text-[#93a1a1] border border-[#073642]',
    customColors: {
      background: '#fdf6e3',
      surface: '#f5efdc',
      heading: '#073642',
      text: '#586e75',
      accent: '#268bd2',
      secondary: '#b58900',
      border: '#eee8d5',
      codeBg: '#002b36',
    },
  },
  navy: {
    id: 'navy',
    name: 'Executive Navy',
    category: 'dark',
    description: 'Deep institutional navy with sky blue precision highlights',
    previewBg: '#0a192f',
    previewAccent: '#38bdf8',
    bgClass: 'bg-gradient-to-b from-[#0a192f] via-[#0d213f] to-[#071326] text-slate-100',
    textClass: 'text-slate-300',
    headingColor: '#f1f5f9',
    accentColor: '#38bdf8',
    secondaryColor: '#60a5fa',
    borderClass: 'border-blue-900/60',
    cardBgClass: 'bg-[#0d213f]/80 border border-blue-900/60',
    codeThemeClass: 'bg-[#06101e] text-slate-100 border border-blue-950',
    customColors: {
      background: '#0a192f',
      surface: '#0d213f',
      heading: '#f1f5f9',
      text: '#cbd5e1',
      accent: '#38bdf8',
      secondary: '#60a5fa',
      border: '#1e3a5f',
      codeBg: '#06101e',
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Botanical Emerald',
    category: 'dark',
    description: 'Deep forest green with organic mint and gold highlights',
    previewBg: '#062c22',
    previewAccent: '#34d399',
    bgClass: 'bg-gradient-to-b from-[#062c22] via-[#083328] to-[#041a14] text-emerald-100',
    textClass: 'text-emerald-200/90',
    headingColor: '#ecfdf5',
    accentColor: '#34d399',
    secondaryColor: '#facc15',
    borderClass: 'border-emerald-900/60',
    cardBgClass: 'bg-[#083328]/80 border border-emerald-900/60',
    codeThemeClass: 'bg-[#031510] text-emerald-100 border border-emerald-950',
    customColors: {
      background: '#062c22',
      surface: '#083328',
      heading: '#ecfdf5',
      text: '#a7f3d0',
      accent: '#34d399',
      secondary: '#facc15',
      border: '#0d4a3a',
      codeBg: '#031510',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Velvet Sunset',
    category: 'dark',
    description: 'Rich wine burgundy with sunset coral and amber highlights',
    previewBg: '#1f101d',
    previewAccent: '#fb7185',
    bgClass: 'bg-gradient-to-br from-[#1f101d] via-[#2d1424] to-[#120811] text-rose-100',
    textClass: 'text-rose-200/90',
    headingColor: '#fff1f2',
    accentColor: '#fb7185',
    secondaryColor: '#fbbf24',
    borderClass: 'border-rose-950',
    cardBgClass: 'bg-[#2a1322]/80 border border-rose-950',
    codeThemeClass: 'bg-[#150713] text-rose-100 border border-rose-950',
    customColors: {
      background: '#1f101d',
      surface: '#2a1322',
      heading: '#fff1f2',
      text: '#fecdd3',
      accent: '#fb7185',
      secondary: '#fbbf24',
      border: '#4c1d3d',
      codeBg: '#150713',
    },
  },
};

export const FONT_CLASSES: Record<FontFamily, { fontClass: string; label: string }> = {
  sans: {
    fontClass: 'font-["Outfit",system-ui,sans-serif]',
    label: 'Modern Sans (Outfit & Jakarta)',
  },
  serif: {
    fontClass: 'font-serif',
    label: 'Editorial Serif (Georgia / Playfair)',
  },
  mono: {
    fontClass: 'font-mono',
    label: 'Technical Mono (JetBrains Mono)',
  },
};

/**
 * Curated high-impact font pairings pairing display headings, readable body, and clean code
 */
export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'modern-outfit',
    name: 'Modern Sans',
    headingFont: '"Outfit", system-ui, -apple-system, sans-serif',
    bodyFont: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'modern',
    description: 'Clean, balanced geometric sans ideal for product, startup & keynote decks',
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Serif',
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'editorial',
    description: 'High-contrast luxury serif headlines with modern legible body',
  },
  {
    id: 'cyber-tech',
    name: 'Cyber Technical',
    headingFont: '"Space Grotesk", system-ui, -apple-system, sans-serif',
    bodyFont: '"Inter", system-ui, -apple-system, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'technical',
    description: 'Engineered typographic precision for cloud, infrastructure & developer slides',
  },
  {
    id: 'warm-humanist',
    name: 'Warm Humanist',
    headingFont: '"Inter", system-ui, -apple-system, sans-serif',
    bodyFont: '"Inter", system-ui, -apple-system, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'minimal',
    description: 'Maximum neutral legibility and corporate credibility across all viewports',
  },
  {
    id: 'dynamic-impact',
    name: 'Dynamic Impact',
    headingFont: '"Syne", system-ui, -apple-system, sans-serif',
    bodyFont: '"Outfit", system-ui, -apple-system, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'bold',
    description: 'Extroverted display weight for brand vision, launch announcements & creative pitches',
  },
  {
    id: 'terminal-mono',
    name: 'Terminal Mono',
    headingFont: '"JetBrains Mono", ui-monospace, monospace',
    bodyFont: '"JetBrains Mono", ui-monospace, monospace',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    category: 'technical',
    description: 'Uniform monospaced rhythm tailored for CLI breakdowns and system architecture',
  },
];

/**
 * Curated Harmonic Color Palettes for instant 1-click styling
 */
export interface ColorHarmonyPreset {
  id: string;
  name: string;
  category: 'dark' | 'light';
  description: string;
  colors: CustomThemeColors;
}

export const COLOR_HARMONY_PRESETS: ColorHarmonyPreset[] = [
  {
    id: 'preset-cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'dark',
    description: 'Deep violet charcoal with neon fuchsia, electric cyan and lime pop',
    colors: {
      background: '#0b0b14',
      surface: '#141424',
      heading: '#38bdf8',
      text: '#e2e8f0',
      accent: '#f43f5e',
      secondary: '#4ade80',
      border: '#232338',
      codeBg: '#08080f',
    },
  },
  {
    id: 'preset-minimal-editorial',
    name: 'Editorial Cream',
    category: 'light',
    description: 'Warm gallery ivory canvas with charcoal serif text and royal cobalt accent',
    colors: {
      background: '#faf9f5',
      surface: '#f3efe6',
      heading: '#18181b',
      text: '#3f3f46',
      accent: '#2563eb',
      secondary: '#d97706',
      border: '#e7e3d8',
      codeBg: '#1e293b',
    },
  },
  {
    id: 'preset-nordic-aurora',
    name: 'Nordic Aurora',
    category: 'dark',
    description: 'Glacial slate with arctic ice cyan, mint aurora and frost lavender',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      heading: '#7dd3fc',
      text: '#e2e8f0',
      accent: '#34d399',
      secondary: '#a78bfa',
      border: '#334155',
      codeBg: '#090d16',
    },
  },
  {
    id: 'preset-terracotta',
    name: 'Warm Terracotta',
    category: 'dark',
    description: 'Earthy roasted espresso canvas with baked clay orange and desert sand',
    colors: {
      background: '#191514',
      surface: '#28201e',
      heading: '#ffedd5',
      text: '#fed7aa',
      accent: '#f97316',
      secondary: '#eab308',
      border: '#3d302c',
      codeBg: '#120e0d',
    },
  },
  {
    id: 'preset-tokyo-night',
    name: 'Tokyo Midnight',
    category: 'dark',
    description: 'Vaporwave midnight slate with soft lavender, neon blue and mint',
    colors: {
      background: '#16161e',
      surface: '#1f2335',
      heading: '#c0caf5',
      text: '#a9b1d6',
      accent: '#7aa2f7',
      secondary: '#bb9af7',
      border: '#292e42',
      codeBg: '#13141c',
    },
  },
  {
    id: 'preset-gold-obsidian',
    name: 'Obsidian & Gold',
    category: 'dark',
    description: 'Ultra-matte carbon black with warm brushed gold and pearl white',
    colors: {
      background: '#121212',
      surface: '#1e1e1e',
      heading: '#fbbf24',
      text: '#f3f4f6',
      accent: '#f59e0b',
      secondary: '#d97706',
      border: '#2e2e2e',
      codeBg: '#0a0a0a',
    },
  },
  {
    id: 'preset-forest-emerald',
    name: 'Evergreen Canopy',
    category: 'dark',
    description: 'Deep British racing green with organic mint and golden sunbeam',
    colors: {
      background: '#05221b',
      surface: '#0b3228',
      heading: '#ecfdf5',
      text: '#d1fae5',
      accent: '#10b981',
      secondary: '#facc15',
      border: '#114a3c',
      codeBg: '#031712',
    },
  },
  {
    id: 'preset-executive-steel',
    name: 'Executive Steel',
    category: 'light',
    description: 'Clean architectural silver white with institutional deep blue and slate',
    colors: {
      background: '#ffffff',
      surface: '#f1f5f9',
      heading: '#0f172a',
      text: '#334155',
      accent: '#0284c7',
      secondary: '#64748b',
      border: '#cbd5e1',
      codeBg: '#0f172a',
    },
  },
];

export const CUSTOM_THEMES_STORAGE_KEY = 'slidecraft_custom_themes_v1';

/**
 * Loads custom themes from local storage
 */
export function getSavedCustomThemes(): Record<string, ThemeDefinition> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom themes from storage', err);
    return {};
  }
}

/**
 * Persists a custom theme to local storage
 */
export function saveCustomThemeToStorage(theme: ThemeDefinition): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedCustomThemes();
    current[theme.id] = { ...theme, isCustom: true };
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save custom theme to storage', err);
  }
}

/**
 * Deletes a custom theme from local storage
 */
export function deleteCustomThemeFromStorage(themeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedCustomThemes();
    delete current[themeId];
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to delete custom theme from storage', err);
  }
}

/**
 * Merges built-in themes with any saved custom themes
 */
export function getAllAvailableThemes(): Record<string, ThemeDefinition> {
  const customThemes = getSavedCustomThemes();
  return {
    ...THEMES,
    ...customThemes,
  };
}

/**
 * Resolves the active theme definition from presentation settings.
 * If settings has an embedded customTheme, it takes precedence.
 */
export function resolveTheme(settings: PresentationSettings): ThemeDefinition {
  if (settings.customTheme) {
    return settings.customTheme;
  }
  const all = getAllAvailableThemes();
  if (all[settings.theme]) {
    return all[settings.theme];
  }
  return THEMES.obsidian;
}

/**
 * Resolves font pairing from id or settings
 */
export function resolveFontPairing(pairingId?: string): FontPairing {
  if (!pairingId) return FONT_PAIRINGS[0];
  const found = FONT_PAIRINGS.find((p) => p.id === pairingId);
  return found || FONT_PAIRINGS[0];
}

/**
 * Helper to compute WCAG 2.1 relative luminance and contrast ratio between two hex colors
 */
export function getWcagContrast(fgHex: string, bgHex: string): {
  ratio: number;
  label: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  pass: boolean;
} {
  const getLuminance = (hex: string): number => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    if (clean.length !== 6) return 0.5;

    const r8 = parseInt(clean.substring(0, 2), 16) / 255;
    const g8 = parseInt(clean.substring(2, 4), 16) / 255;
    const b8 = parseInt(clean.substring(4, 6), 16) / 255;

    const r = r8 <= 0.04045 ? r8 / 12.92 : Math.pow((r8 + 0.055) / 1.055, 2.4);
    const g = g8 <= 0.04045 ? g8 / 12.92 : Math.pow((g8 + 0.055) / 1.055, 2.4);
    const b = b8 <= 0.04045 ? b8 / 12.92 : Math.pow((b8 + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(fgHex);
  const l2 = getLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;

  if (ratio >= 7.0) {
    return { ratio, label: 'AAA', pass: true };
  } else if (ratio >= 4.5) {
    return { ratio, label: 'AA', pass: true };
  } else if (ratio >= 3.0) {
    return { ratio, label: 'AA Large', pass: true };
  } else {
    return { ratio, label: 'Fail', pass: false };
  }
}

/**
 * Returns true if a color or background string is perceived as light.
 */
export function isColorLight(color?: string): boolean {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  if (['white', '#fff', '#ffffff', '#fafafa', '#f8fafc', '#f1f5f9', '#f3f4f6', '#fdf6e3', '#f5efdc', '#faf9f5'].includes(c)) {
    return true;
  }
  if (c.startsWith('#')) {
    const hex = c.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 140;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 140;
    }
  }
  if (c.startsWith('rgb')) {
    const parts = c.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      return (r * 299 + g * 587 + b * 114) / 1000 > 140;
    }
  }
  return false;
}
