import { ThemeId, FontFamily } from '../types/presentation';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light';
  description: string;
  previewBg: string;
  previewAccent: string;
  // CSS styles applied to the slide viewport
  bgClass: string;
  textClass: string;
  headingColor: string;
  accentColor: string;
  secondaryColor: string;
  borderClass: string;
  cardBgClass: string;
  codeThemeClass: string;
  customCss?: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
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
 * Returns true if a color or background string is perceived as light.
 */
export function isColorLight(color?: string): boolean {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  if (['white', '#fff', '#ffffff', '#fafafa', '#f8fafc', '#f1f5f9', '#f3f4f6', '#fdf6e3', '#f5efdc'].includes(c)) {
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
