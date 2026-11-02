# Visual Theme Customizer with Real-time Palette & Font Pairing Creator

A comprehensive visual studio for crafting bespoke presentation themes with live slide canvas preview, intelligent color harmonies, curated editorial and modern font pairings, custom hex pickers, and automated persistence into both local storage and export bundles.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core user preferences have been confirmed and incorporated as architectural requirements:

- **Confirmed Decision 1 (Surface Placement)**: The Visual Theme Customizer will launch as a dedicated full-featured modal dialog triggered from the Top Navigation "Theme" button, replacing the simple static selector with an expansive two-column studio (Controls on the left, Real-time interactive slide preview on the right).
- **Confirmed Decision 2 (Customizer Capabilities)**: Includes curated harmonious color palettes (High-contrast Dark, Warm Editorial, Technical Cyan, Botanical Emerald, Sunset Wine, and Nordic Frost), custom hex pickers with contrast ratio indicators, and curated font pairings (Hero display font + Body font + Monospace code) with immediate live slide preview.
- **Confirmed Decision 3 (Persistence & Portability)**: Custom themes are stored in `localStorage` (`slidecraft_custom_themes_v1`), assigned unique IDs, accessible across all presentations on the device, and bundled directly into the standalone HTML and JSON deck exports so presentation decks look identical on any recipient machine.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the existing theme picker into an interactive design studio. Users can either pick from existing battle-tested themes, modify individual color tokens (Background, Canvas Surface, Primary Accent, Secondary Highlight, Text Heading, Text Body, and Code Block), choose curated display + body font pairings, or generate harmonious palettes with 1-click presets. Every change updates a live mini slide preview in real time before applying.
- **Target Audience / Persona**: Engineers, product leaders, designers, educators, and technical speakers who need their presentation decks to match company brand colors, event visual identities, or distinct aesthetic vibes without touching CSS or configuration files.
- **Key Value**: Eliminates the frustration of guessing hex codes and CSS classes in markdown. Presenters see instant, tangible visual feedback for their slides, verify accessibility contrast on the fly, and save reusable custom themes that travel with their deck.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Launching the Studio**: User clicks the "Theme" button in the Top Navigation bar. A modal dialog opens with a tabbed or split-view layout:
   - **Left Panel (Customizer Controls)**: 
     - *Theme Selector & Preset Drawer*: Switch between built-in themes or saved custom themes.
     - *Color Palette Studio*: Primary background, card surface, primary accent, secondary accent, heading text, and body text. Features curated harmonic swatches, quick brightness/contrast check, and native color pickers with hex text input.
     - *Font Pairing Studio*: Curated font pairings (e.g. *Modern Geometric*: Outfit + Plus Jakarta Sans; *Editorial Luxury*: Playfair Display + Source Serif 4; *Clean Tech*: DM Sans + Inter; *Developer Mono*: JetBrains Mono + Outfit).
     - *Slide Transitions & Frame Options*: Transition animations (Slide, Fade, Convex, Zoom), Aspect Ratio (16:9 vs 4:3), and layout toggles.
   - **Right Panel (Real-Time Interactive Canvas Preview)**:
     - Displays a scaled, live rendering of the user's *current active slide* (or a sample slide with headings, bullet lists, code blocks, and callouts).
     - Instant CSS variable / class reflection: when the user changes a color or font, the preview updates synchronously with zero lag.
2. **Saving Custom Themes**:
   - User clicks "Save as Custom Theme", enters a friendly name (e.g., "Acme Brand Dark"), and the theme is saved to local storage with a generated palette swatch badge.
   - The active presentation deck's settings are updated to reference this custom theme.
3. **Applying & Closing**:
   - User clicks "Apply to Deck" or "Done". The modal closes, and the main slide stage immediately reflects the new theme and font styling across all slides.

#### Visual Identity & Theme
- **Aesthetic Direction**: Refined, dark-slate SaaS design studio interface with disciplined micro-interactions.
- **Color Palette & Contrast**: Deep slate canvas (`#0b0f19`), structural panels (`#111827`), hairline borders (`#1f2937`), and electric indigo/cyan action accents (`#6366f1` / `#06b6d4`).
- **Typography & Hierarchy**: 
  - Section headers: SemiBold title-case (13px, tracking-wide, unboxed).
  - Swatch labels: Clean 11px font with monospace hex labels (`font-mono text-[11px]`).
  - No decorative status dots, no fake telemetry, and no pill badge clutter.
- **Component Styling & Layout**:
  - Two-column responsive modal: 55% controls panel with organized collapsible accordion sections, 45% sticky live preview box with theme category badge.
  - Buttons follow the 2:1 horizontal-to-vertical padding discipline (`px-3 py-1.5` or `px-4 py-2`).

#### Interactive Feedback & Motion
- Real-time swatch hover effects with subtle border scaling (`scale-105 transition-transform`).
- Live slide preview reflects transitions and color changes within $\le 50\text{ms}$ using CSS custom properties (`--slide-bg`, `--slide-heading`, `--slide-accent`, `--slide-text`, `--slide-border`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Custom Theme Data Model & Resolution**
  - *Chosen Approach*: Expand `ThemeDefinition` to support custom hex properties directly (`bgClass`, `customBgColor`, `headingColor`, `accentColor`, `secondaryColor`, `textClass`, `borderClass`, `cardBgClass`, `isCustom?: boolean`).
  - *Why*: Built-in themes rely on Tailwind utility classes, while user-generated themes need arbitrary user-picked hex values. Supporting inline CSS custom properties on the slide container (`--slide-bg`, etc.) bridges arbitrary hex colors seamlessly with Tailwind's utility system without generating runtime stylesheet bloat.
  - *Alternatives Considered*: Writing dynamic CSS rules into `<style>` tags at runtime; rejected as harder to sanitize, serialize, and bundle into export files.

- **Decision 2: Live Preview Strategy in Modal**
  - *Chosen Approach*: Render an actual mini `SlideViewer` stage inside the modal using the user's current presentation slide (falling back to a rich demo slide if current slide is empty).
  - *Why*: Users want to see how *their exact slide content* looks with the new colors and fonts (including tables, code blocks, and diagrams), rather than an abstract generic card.

- **Decision 3: Export Bundling & Portable Storage**
  - *Chosen Approach*: Store user custom themes in `localStorage` (`slidecraft_custom_themes_v1`), and embed the custom theme definition directly inside the `PresentationDeck` object (`deck.customTheme?: ThemeDefinition`).
  - *Why*: When exporting to standalone single-file HTML, PDF, or sharing via JSON, the custom theme definitions are fully serialized into the file. The recipient gets identical styling even if they open the presentation on an offline machine without having the theme saved in their local storage.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SlideMD Presentation Workspace                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    [Click "Theme" Button in TopNav]
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               ThemeSettingsPanel (Visual Theme Customizer Modal)            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           Left Panel: Controls       │       Right Panel: Live Preview      │
│ ┌──────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ 1. Built-in & Custom Theme Grid  │ │ │ Mini Slide Stage (16:9 / 4:3)    │ │
│ │   [Obsidian] [Nord] [Custom +]   │ │ │                                  │ │
│ ├──────────────────────────────────┤ │ │  # Slide Title (Font Heading)    │ │
│ │ 2. Color Palette Creator         │ │ │  Body text (Font Body)           │ │
│ │   - Canvas Background (Hex/Picker│ │ │  ┌────────────────────────────┐  │ │
│ │   - Heading Text Color           │ │ │  │ Accent Card / Table / Code │  │ │
│ │   - Body Text Color              │ │ │  └────────────────────────────┘  │ │
│ │   - Primary Accent Color         │ │ │                                  │ │
│ │   - Card Surface Color           │ │ └──────────────────────────────────┘ │
│ ├──────────────────────────────────┤ │                                      │
│ │ 3. Font Pairing Selector         │ │ [Theme Contrast Score: 8.4:1 AA ✓]   │
│ │   [Modern Sans] [Editorial] ... │ │                                      │
│ ├──────────────────────────────────┤ │                                      │
│ │ 4. Slide Transition & Layout     │ │                                      │
│ └──────────────────────────────────┘ │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ Actions: [Save as New Custom Theme] [Reset Defaults]   [Cancel] [Apply & Done]│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
         ┌────────────────────────────┐ ┌───────────────────────────┐
         │ LocalStorage Custom Themes │ │ Active Deck Settings Sync │
         │ 'slidecraft_custom_themes' │ │ settings.theme = customId │
         └────────────────────────────┘ └─────────────┬─────────────┘
                                                      ▼
                                        ┌───────────────────────────┐
                                        │ Export Engine (HTML/JSON) │
                                        │ Embeds theme CSS vars     │
                                        └───────────────────────────┘
```

#### Data Model Extensions

```typescript
// src/types/presentation.ts
export type ThemeId =
  | 'obsidian'
  | 'clean-white'
  | 'nord'
  | 'dracula'
  | 'solarized'
  | 'navy'
  | 'emerald'
  | 'sunset'
  | string; // Allows dynamic custom theme IDs, e.g. "custom-1730541200"

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
  category: 'sans' | 'serif' | 'display' | 'mono';
  googleFontImport?: string;
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
  customColors?: CustomThemeColors;
  fontPairingId?: string;
  isCustom?: boolean;
}
```

#### Step-by-Step Implementation Sequence

1. **Theme Utility & Font Pairing Engine (`src/utils/themes.ts`)**:
   - Add `CUSTOM_FONT_PAIRINGS` with distinctive pairings (Modern Sans, Editorial Serif, Condensed Dynamic, Monospace Minimal, Neo-Grotesque).
   - Implement `getAllThemes(): Record<string, ThemeDefinition>` that loads built-in themes merged with user custom themes from `localStorage`.
   - Add helper functions: `saveCustomTheme(theme: ThemeDefinition)`, `deleteCustomTheme(themeId: string)`, `createCustomThemeFromColors(name, colors, fontPairing)`.
   - Compute real-time WCAG luminance contrast ratios (`getContrastRatio(fgHex, bgHex)`) to warn the user if a text color lacks legibility against their background.

2. **Visual Theme Customizer Modal (`src/components/ThemeSettingsPanel.tsx`)**:
   - Upgrade the modal into a two-column responsive layout with:
     - Preset theme cards with one-click selection.
     - Live Palette Customizer with hex inputs, interactive color pickers, and curated harmonious palette shortcuts.
     - Font pairing picker showing live heading and body sample previews.
     - Interactive mini slide preview showing the current slide or demo slide with immediate CSS variable bindings.
     - "Save as Custom Theme" dialog with custom name input and delete affordance for previously saved custom themes.

3. **Slide Viewer & Canvas Integration (`src/components/SlideViewer.tsx` & `FullscreenPresentation.tsx`)**:
   - Update slide container styles to bind `customColors` to CSS variables (`--slide-bg`, `--slide-heading`, `--slide-accent`, `--slide-surface`) so custom hex palettes render seamlessly without needing pre-compiled Tailwind classes.
   - Apply the selected font family to headings and body elements dynamically.

4. **Standalone HTML & Deck Export Engine (`src/utils/exportEngine.ts` & `src/utils/storage.ts`)**:
   - Update `generateStandaloneHtml` to inject custom theme CSS variables into the exported HTML document so exported presentations look identical offline.
   - Ensure `PresentationDeck` embeds custom theme definitions when shared or exported to JSON.

5. **Verification**:
   - Run `lint_applet` and `compile_applet` to verify zero TypeScript errors and a clean build.
   - Verify creating a custom theme, tuning hex values, testing contrast check, live previewing, and verifying that undo/redo and slide formatting continue to function seamlessly.
