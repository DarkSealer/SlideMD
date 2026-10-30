# Client-Side PowerPoint (.pptx) Export

Introduce client-side Microsoft PowerPoint (`.pptx`) presentation generation using `pptxgenjs`, enabling users to export their Markdown presentations into fully compatible Office PowerPoint files with zero server infrastructure costs.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification:
> - **Hybrid Slide Composition**:
>   - **Native Editable Elements**: Slide headings, body paragraphs, bullet lists, tables, and callouts are generated as native PowerPoint shapes, text boxes, and table objects.
>   - **Rendered Diagram Vectors**: Complex visual elements like Mermaid flowcharts/charts and KaTeX mathematical formulas are captured as crisp vector/high-DPI PNG images and positioned seamlessly on the slide.
> - **Speaker Notes Integration**: Private presenter speaker notes (defined via `Note: ...` in Markdown) are written directly into PowerPoint's native slide notes drawer (`slide.addNotes()`), visible in PowerPoint Presenter View.
> - **Aspect Ratio Matching**: The PowerPoint canvas dimensions dynamically match the active deck settings (`16:9` widescreen [10 × 5.625 inches] or `4:3` standard [10 × 7.5 inches]).

---

## 1. Overview & Core Concept

While SlideCraft provides standalone HTML and PDF exports, corporate presenters and educators frequently collaborate in organizations where Microsoft PowerPoint (`.pptx`) or Google Slides is the mandatory presentation standard.

This feature adds a 1-click **PowerPoint Presentation (.pptx)** export tool directly inside the existing `ExportModal.tsx`. The entire `.pptx` file is synthesized client-side in browser memory using `pptxgenjs` and downloaded immediately with zero server calls, preserving complete user privacy and keeping the application 100% free forever.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Triggering Export**:
   - The user opens the **Export** modal from the top navigation bar or keyboard shortcut.
   - Alongside "Standalone HTML Document" and "Print-Ready PDF", a new card titled **Microsoft PowerPoint (.pptx)** is displayed with an orange Office presentation icon.

2. **Configuration Options**:
   - **Slide Dimensions**: Displays the current deck's aspect ratio (e.g., `16:9 Widescreen` or `4:3 Standard`).
   - **Speaker Notes Toggle**: Checkbox to include or omit private speaker notes (checked by default).
   - **Theme Adaptation**: Automatically maps theme background colors (e.g. Obsidian slate dark `#020617` or Minimal light `#ffffff`) and typography into the PowerPoint deck master.

3. **Export Execution & Progress**:
   - The user clicks **Download .pptx Presentation**.
   - An export progress state is displayed (*"Compiling slide 3 of 9..."*) while diagrams and KaTeX formulas are converted.
   - The generated `.pptx` file is immediately downloaded to the user's downloads folder.

### Exported Slide Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ PowerPoint Slide (16:9 Widescreen)                                     │
│                                                                        │
│  Main Topic Heading (Native PPTX Title Box)                            │
│  ──────────────────────────────────────────                            │
│                                                                        │
│  • Bullet point 1 (Native editable text run)                           │
│  • Bullet point 2 with bold highlight                                  │
│                                                                        │
│  ┌───────────────────────────┐    ┌─────────────────────────────────┐  │
│  │ Rendered Mermaid SVG      │    │ Native PPTX Table               │  │
│  │ (Embedded High-Res Image) │    │ ├──────────────┬──────────────┤ │  │
│  │                           │    │ │ Latency      │ 24ms         │ │  │
│  │                           │    │ ├──────────────┼──────────────┤ │  │
│  │                           │    │ │ Uptime       │ 99.99%       │ │  │
│  └───────────────────────────┘    └─────────────────────────────────┘  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ PowerPoint Speaker Notes Drawer                                        │
│ "Speaker cue: Explain the shift from monolithic database locks..."     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Generation vs Pure Canvas Rasterization
- **Chosen Approach**: Hybrid composition. Slide text, headings, bullet lists, and tables are written as native PowerPoint objects, while Mermaid charts and KaTeX formulas are rasterized as image elements.
- **Why**: Allows recipients in PowerPoint or Google Slides to edit typos, change text fonts, copy bullet points, and adjust wording, while ensuring complex diagrams and math formulas render identically without requiring special fonts on the recipient's machine.
- **Alternatives Considered**: Full-slide canvas screenshots (creates uneditable "flattened" image slides where text cannot be selected or edited) or pure native vector shapes for all diagrams (impractical due to complex SVG path differences between Mermaid and OpenXML).

### Decision 2: Zero-Server Client Library (`pptxgenjs`)
- **Chosen Approach**: Use `pptxgenjs` running directly in the browser.
- **Why**: 100% free ($0 server bills), works completely offline in PWA mode, and keeps user presentations private on their local device.
- **Alternatives Considered**: Server-side LibreOffice conversion or cloud rendering APIs (violates the zero-cost architecture constraint and breaks offline capability).

---

## 4. Technical Architecture & Implementation Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PowerPoint Export Pipeline                      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             ExportModal: User clicks "Export .pptx"     │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              src/utils/pptxExportEngine.ts              │
       │  1. Initialize PptxGenJS instance                       │
       │  2. Configure layout (16:9 vs 4:3) and theme palette    │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               For Each Slide in Presentation:           │
       │  • Add new PPTX slide with theme background             │
       │  • Parse AST nodes (Headings, Paragraphs, Lists)        │
       │  • Convert Tables to slide.addTable()                   │
       │  • Convert Mermaid / KaTeX to high-res image data URL   │
       │  • Attach Speaker Notes via slide.addNotes()            │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Browser Blob Download (${title}.pptx)       │
       └─────────────────────────────────────────────────────────┘
```

### Component & File Mapping:
1. `package.json`: Install `pptxgenjs` (`^3.12.0`).
2. `src/utils/pptxExportEngine.ts`: Core PowerPoint synthesis module parsing slide Markdown and mapping AST tokens to PptxGenJS slide objects.
3. `src/components/ExportModal.tsx`: Adds the PowerPoint card, export options (notes toggle, format info), and progress indicator.
4. `src/components/PresentationGuideModal.tsx`: Documents PowerPoint export capabilities and compatibility guidelines.

---

## 5. Verification Plan

- **Compilation**: Verify build with `lint_applet` (`tsc --noEmit`) and `compile_applet` (`npm run build`).
- **File Generation**: Verify `.pptx` file creation across all starter templates.
- **Content Verification**:
  - Test editable text boxes for slide titles and body lists.
  - Test embedded speaker notes in PowerPoint Presenter View.
  - Test diagram and KaTeX formula image embedding.
  - Test both 16:9 widescreen and 4:3 standard aspect ratio exports.
