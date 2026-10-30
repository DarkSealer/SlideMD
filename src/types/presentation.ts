export type ThemeId =
  | 'obsidian'
  | 'clean-white'
  | 'nord'
  | 'dracula'
  | 'solarized'
  | 'navy'
  | 'emerald'
  | 'sunset';

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
}

export interface PresentationDeck {
  id: string;
  title: string;
  description: string;
  markdown: string;
  settings: PresentationSettings;
  createdAt: number;
  updatedAt: number;
}
