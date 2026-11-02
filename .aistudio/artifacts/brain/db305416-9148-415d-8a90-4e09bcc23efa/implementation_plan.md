# Visual Drag-and-Drop & Click-to-Edit Formatting Toolbar (WYSIWYG Overlay)

Empower non-technical creators to format text, modify headings, change colors, and reorder slide sections directly on the visual slide preview with real-time two-way Markdown synchronization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification:
> - **Activation Method**: Direct click on any slide element or text selection in the slide preview immediately activates the contextual floating formatting toolbar and enables inline editing.
> - **Two-Way Synchronization**: Real-time bi-directional synchronization that instantly reflects visual edits back into the underlying Markdown editor (with smart line-offset tracking to avoid cursor displacement).
> - **Initial Feature Scope**: Rich text formatting (Bold, Italic, Strikethrough, Inline Code, Text Color), Heading level switching (H1, H2, H3, Paragraph), Text alignment, Block insertion, and Visual block drag handles (reordering slide paragraphs, lists, and callouts).

---

## 1. Overview & Core Concept

### What It Does
While SlideMD is built on the speed and portability of Markdown, non-technical users often hesitate when they need to remember syntax rules for headings (`#`), bold text (`**`), colored spans (`<span style="color:...">`), or nested lists.

The **WYSIWYG Slide Overlay** bridges this gap: users can simply click any text directly inside the slide preview to edit it inline, select text to reveal a floating formatting toolbar, pick colors from a visual palette, switch heading hierarchies, and grab drag handles to reorder slide blocks. Every change automatically compiles to clean, canonical Markdown in real time.

### Target Audience & Persona
- **Non-Technical Presenters & Educators**: Who want Google Slides / Keynote-style visual editing convenience without giving up the lightweight elegance of Markdown.
- **Fast Iterators**: Presenters who notice a typo or want to restyle a heading during rehearsal and prefer clicking the slide directly over searching through lines of code.

### Key Value
- Zero Markdown learning curve for new or non-technical team members.
- Visual immediacy: see typography, spacing, and colors update in real time on the actual slide canvas.
- Complete bi-directional fidelity: power users can still edit raw Markdown at any moment, and visual edits produce clean, human-readable Markdown without proprietary lock-in.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Inline Text Editing**:
   - The user clicks on any heading, paragraph, bullet point, or quote on the slide preview.
   - The element enters inline edit mode with a subtle brand outline, autofocusing the caret at the clicked position.
   - Typing directly updates the slide text and automatically pushes the edit to the active slide's section in the Markdown editor.

2. **Floating Formatting Toolbar (Selection Overlay)**:
   - When text is highlighted or focused, a compact, floating toolbar appears above the element:
     - **Block Type Selector**: Switch between `H1`, `H2`, `H3`, `Paragraph`, and `Bullet List`.
     - **Style Toggles**: Bold (`B`), Italic (*I*), Strikethrough (~~S~~), and Inline Code (`<>`).
     - **Color Picker Dropdown**: Swatches with theme-matching accent colors and custom hex input.
     - **Alignment Buttons**: Left, Center, and Right alignment.
     - **Block Actions**: Move Up, Move Down, or Delete Block.

3. **Block Reordering (Drag Handles)**:
   - When hovering over block elements (headings, list items, callouts, diagrams) in preview mode, a discreet `GripVertical` handle appears on the left margin.
   - Users can drag the block up or down (or click the Up/Down chevron buttons) to reorder sections. The Markdown parser swaps the corresponding lines seamlessly.

4. **Block Insertion Bar**:
   - A quiet `+` button appears between blocks on hover, allowing users to insert a new heading, paragraph, bullet list, or image with one click.

### Visual Styling & Component Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ Floating WYSIWYG Toolbar (Dark Glass / Backdrop Blur)                  │
│ ┌─────────┬───┬───┬───┬────┬───────┬─────┬───────┬────┬───────────┐   │
│ │ Heading ▼│ B │ I │ S │ <> │ Color▼│ ≡ ⸬ │ Up/Dn │ 🗑 │ Close [x]│   │
│ └─────────┴───┴───┴───┴────┴───────┴─────┴───────┴────┴───────────┘   │
└────────────────────────────────────────────────────────────────────────┘
          ▼ (Pointer carrot pointing to active slide element)
┌────────────────────────────────────────────────────────────────────────┐
│  # Product Roadmap 2026 [Active Editing Element with Focus Ring]       │
│                                                                        │
│  [:: Grip]  • Milestone 1: Visual WYSIWYG editing engine               │
│  [:: Grip]  • Milestone 2: Proportional slide scaling                  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Aesthetic Direction**: Floating dark-glass toolbar (`bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl`) with crisp typography and subtle micro-transitions.
- **Button Grouping**: Clean segmented button clusters with `gap-1`, single-line text, and icons (`lucide-react`).
- **No Pill Badges**: Clean unboxed controls adhering to the Universal Frontend Design Constitution.
- **Mobile & Split-Screen Grace**: Clamped position calculations that prevent the floating toolbar from clipping outside the slide viewport or overlapping the top navigation bar.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid ContentEditable with Markdown AST Source Mapping
- **Chosen Approach**: Parse the active slide's raw Markdown into an indexed AST of blocks (Headings, Paragraphs, Lists, Code, Blockquotes). Each rendered HTML element carries a `data-block-id` and line-range metadata. When an inline edit occurs, only that specific block's source lines are updated and re-serialized into the full Markdown document.
- **Why**: Pure `contenteditable` on the entire slide often generates messy HTML tag soup (`<div><br><span>`) that corrupts Markdown. By isolating edits to individual AST blocks and applying clean markdown serialization per block, we guarantee pristine, standard Markdown output at all times.
- **Alternatives Considered**: Full external rich-text editor (e.g. TipTap or ProseMirror) was rejected because it introduces heavyweight bundle dependencies and frequently rewrites custom Markdown directives (like `<!-- color: ... -->` and `Note:` speaker notes).

### Decision 2: Real-Time Debounced Markdown Synchronization
- **Chosen Approach**: Input events in the visual editor immediately update the slide DOM locally for instant 60fps typing feedback, while queuing a debounced (150ms) update to the parent Markdown document state.
- **Why**: Keeps typing lag-free while preventing the Monaco / CodeMirror editor from resetting its selection or lagging on large presentations.

### Decision 3: Non-Destructive Block Reordering
- **Chosen Approach**: Slide blocks are demarcated by line numbers in the slide's section. Dragging or clicking Move Up/Down swaps the exact slice of Markdown lines and immediately triggers the slide preview re-render.
- **Why**: Completely reliable, preserves frontmatter and slide delimiters (`---`), and works offline without external libraries.

---

## 4. Technical Architecture & Component Hierarchy

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│ SlideCraft Application State (src/App.tsx)                             │
│ ┌─────────────────────────┐           ┌─────────────────────────────┐ │
│ │ markdown: string        │ ◄───────┐ │ settings: PresSettings      │ │
│ └───────────┬─────────────┘         │ └──────────────┬──────────────┘ │
└─────────────┼───────────────────────┼────────────────┼────────────────┘
              ▼                       │                ▼
┌──────────────────────────┐          │ ┌─────────────────────────────┐
│ MarkdownEditor.tsx       │          │ │ SlideViewer.tsx             │
│ (Raw CodeMirror/Monaco)  │          │ │ (Slide Preview Viewport)    │
└──────────────────────────┘          │ └──────────────┬──────────────┘
                                      │                ▼
                             ┌────────┴───────────────────────────────┐
                             │ VisualSlideOverlay.tsx                 │
                             │ (Click-to-Edit & Drag Controller)      │
                             │                                        │
                             │ ┌────────────────────────────────────┐ │
                             │ │ FloatingFormatToolbar.tsx          │ │
                             │ │ - Heading Switcher (H1..H3, P)     │ │
                             │ │ - Inline Style Toggles (B, I, S, `)│ │
                             │ │ - Text Color Palette Dropdown      │ │
                             │ │ - Alignment Controls (L, C, R)     │ │
                             │ └────────────────────────────────────┘ │
                             │ ┌────────────────────────────────────┐ │
                             │ │ BlockDragHandle & Order Controls   │ │
                             │ │ - Move Block Up / Down             │ │
                             │ │ - Quick Insert Block Toolbar       │ │
                             │ └────────────────────────────────────┘ │
                             └────────────────────────────────────────┘
```

### Component & File Mapping

1. **`src/components/VisualSlideOverlay.tsx`**:
   - Wraps the slide preview content.
   - Detects clicks and text selections within the slide container.
   - Calculates absolute/fixed coordinates for the floating toolbar relative to the selected DOM element.
   - Handles `contentEditable` focus, blur, and input events.

2. **`src/components/FloatingFormatToolbar.tsx`**:
   - The floating popover bar housing format buttons, heading dropdown, color palette, and block reordering tools.
   - Executes standard document commands (`execCommand` / selection range wrapping) and maps them to Markdown tokens (`**`, `*`, `~~`, `<code>`, `<span style="color:...">`).

3. **`src/utils/slideBlockParser.ts`**:
   - Splits a single slide's Markdown into discrete editable blocks (e.g., `# Title`, `Paragraph`, `- List item`).
   - Provides utilities:
     - `updateBlockInMarkdown(markdown, slideIndex, blockIndex, newContent)`
     - `reorderBlocksInMarkdown(markdown, slideIndex, fromIndex, toIndex)`
     - `insertBlockInMarkdown(markdown, slideIndex, targetIndex, blockType)`

4. **Integration with `SlideViewer.tsx`**:
   - Seamlessly enabled when viewing the slide in Split or Preview mode.
   - Automatically disabled in Fullscreen Presentation and Presenter Console modes so presenting remains undisturbed.
