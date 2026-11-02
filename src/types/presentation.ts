export type BuiltinThemeId =
  | 'obsidian'
  | 'clean-white'
  | 'nord'
  | 'dracula'
  | 'solarized'
  | 'navy'
  | 'emerald'
  | 'sunset';

export type ThemeId = BuiltinThemeId | (string & {});

export interface CustomThemeColors {
  background: string;
  surface: string;
  heading: string;
  text: string;
  accent: string;
  secondary: string;
  border: string;
  codeBg: string;
}

export interface FontPairing {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  category: 'modern' | 'editorial' | 'minimal' | 'bold' | 'technical';
  description: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light';
  description: string;
  previewBg: string;
  previewAccent: string;
  bgClass: string;
  textClass: string;
  headingColor: string;
  accentColor: string;
  secondaryColor: string;
  borderClass: string;
  cardBgClass: string;
  codeThemeClass: string;
  customCss?: string;
  isCustom?: boolean;
  customColors?: CustomThemeColors;
  fontPairingId?: string;
}

export type TransitionType = 'slide' | 'fade' | 'convex' | 'zoom' | 'none';

export type AspectRatio = '16:9' | '4:3';

export type FontFamily = 'sans' | 'serif' | 'mono';

export interface SlideContent {
  id: string;
  horizontalIndex: number;
  verticalIndex: number;
  rawMarkdown: string;
  htmlContent: string;
  speakerNotes: string;
  backgroundColor?: string;
  backgroundImage?: string;
  customClass?: string;
  transition?: TransitionType;
  fragmentsCount: number;
  title: string;
  customTextColor?: string;
}

export interface PresentationSettings {
  theme: ThemeId;
  transition: TransitionType;
  aspectRatio: AspectRatio;
  fontFamily: FontFamily;
  showSlideNumbers: boolean;
  showProgressBar: boolean;
  centerSlides: boolean;
  codeHighlightTheme: 'github-dark' | 'github-light' | 'atom-one-dark' | 'monokai';
  customTheme?: ThemeDefinition;
  fontPairingId?: string;
}

export type TemplateCategory =
  | 'Corporate'
  | 'Minimalist'
  | 'Creative'
  | 'Academic'
  | 'Technical';

export interface PresentationDeck {
  id: string;
  title: string;
  description: string;
  markdown: string;
  settings: PresentationSettings;
  createdAt: number;
  updatedAt: number;
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  estimatedDuration?: string;
  featured?: boolean;
}

