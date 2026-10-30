# Graph Report - SlideMD  (2026-10-30)

## Corpus Check
- Corpus is ~31,507 words - fits in a single context window. You may not need a graph.

## Summary
- 217 nodes · 498 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Presentation & Modal UI
- Dev Dependencies
- App Shell & Editor
- Runtime Dependencies
- TypeScript Config
- Export Engine
- PWA & Top Nav
- Markdown Editor & Mermaid
- Markdown Parser & Viewer
- Vite Build Plugins
- Icon Generation
- Entry & React DOM
- NPM Scripts
- Presenter Sync

## God Nodes (most connected - your core abstractions)
1. `App()` - 23 edges
2. `react` - 18 edges
3. `compilerOptions` - 16 edges
4. `lucide-react` - 14 edges
5. `PresentationDeck` - 14 edges
6. `PresentationSettings` - 13 edges
7. `parseMarkdownToSlides()` - 12 edges
8. `SlideContent` - 11 edges
9. `renderAllMermaidInContainer()` - 11 edges
10. `THEMES` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `AudiencePresentationView()`  [EXTRACTED]
  src/App.tsx → src/components/AudiencePresentationView.tsx
- `App()` --calls--> `ExportModal()`  [EXTRACTED]
  src/App.tsx → src/components/ExportModal.tsx
- `App()` --calls--> `FullscreenPresentation()`  [EXTRACTED]
  src/App.tsx → src/components/FullscreenPresentation.tsx
- `App()` --calls--> `OfflineIndicator()`  [EXTRACTED]
  src/App.tsx → src/components/OfflineIndicator.tsx
- `App()` --calls--> `PresenterModal()`  [EXTRACTED]
  src/App.tsx → src/components/PresenterModal.tsx

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "Presentation & Modal UI"
Cohesion: 0.17
Nodes (27): lucide-react, AudiencePresentationView(), AudiencePresentationViewProps, DecksLibraryModalProps, ExportModalProps, FullscreenPresentation(), FullscreenPresentationProps, PresenterModal() (+19 more)

### Community 1 - "Dev Dependencies"
Cohesion: 0.09
Nodes (29): devDependencies, autoprefixer@^10.4.21, esbuild@^0.25.0, tailwindcss@^4.3.3, tsx@^4.21.0, @types/canvas-confetti@^1.9.0, @types/express@^4.17.21, @types/katex@^0.16.8 (+21 more)

### Community 2 - "App Shell & Editor"
Cohesion: 0.22
Nodes (18): App(), DecksLibraryModal(), MarkdownEditor(), PresentationGuideModal(), PresentationGuideModalProps, ToolInfo, SlideThumbnailStrip(), ThemeSettingsPanel() (+10 more)

### Community 3 - "Runtime Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, canvas-confetti@^1.9.4, dotenv@^17.2.3, express@^4.21.2, @google/genai@^2.4.0, lucide-react@^0.546.0, lz-string@^1.5.0, marked@^18.1.1 (+11 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 5 - "Export Engine"
Cohesion: 0.30
Nodes (12): ExportModal(), escapeHtml(), generatePrintPdfHtml(), generateShareUrl(), generateStandaloneHtml(), triggerDownload(), parseMarkdownToSlides(), splitSections() (+4 more)

### Community 6 - "PWA & Top Nav"
Cohesion: 0.27
Nodes (9): react, OfflineIndicator(), PWAInstallButton(), PWAInstallButtonProps, TopNav(), TopNavProps, useOnlineStatus(), BeforeInstallPromptEvent (+1 more)

### Community 7 - "Markdown Editor & Mermaid"
Cohesion: 0.19
Nodes (10): mermaid@^12.2.0, mermaid, MarkdownEditorProps, escapeHtml(), initializeMermaid(), MERMAID_SNIPPETS, MermaidSnippet, renderMermaidDiagram() (+2 more)

### Community 8 - "Markdown Parser & Viewer"
Cohesion: 0.29
Nodes (11): highlight.js@^11.12.0, highlight.js, SlideViewer(), enhanceCallouts(), enhanceCodeBlocks(), escapeHtml(), extractAndProcessColumns(), processSingleSlide() (+3 more)

### Community 9 - "Vite Build Plugins"
Cohesion: 0.20
Nodes (8): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, vite-plugin-pwa@^2.0.0, @tailwindcss/vite, vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 10 - "Icon Generation"
Cohesion: 0.28
Nodes (8): sharp@^0.35.5, sharp, BG, extractIcon(), generate(), logoPath, publicDir, square()

### Community 11 - "Entry & React DOM"
Cohesion: 0.29
Nodes (4): katex@^0.19.1, react-dom@^19.0.1, katex, react-dom

### Community 12 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `PWA & Top Nav` to `Presentation & Modal UI`, `Dev Dependencies`, `App Shell & Editor`, `Runtime Dependencies`, `Export Engine`, `Markdown Editor & Mermaid`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Should `Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09425287356321839 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Presentation & Modal UI` to `Dev Dependencies`, `App Shell & Editor`, `Runtime Dependencies`, `Export Engine`, `PWA & Top Nav`, `Markdown Editor & Mermaid`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Dev Dependencies`, `Markdown Editor & Mermaid`, `Markdown Parser & Viewer`, `Vite Build Plugins`, `Entry & React DOM`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._