# SlideCraft: 100% Free Tier Architecture & Product Roadmap

## 1. Zero Infrastructure Cost Guarantee

SlideCraft is architected from the ground up as a **zero-marginal-cost client-side application**. Because computation, storage, and presentation delivery happen in the user's browser, the application can remain **100% free forever** without incurring server bills.

### Cost Breakdown:
| Resource | Architecture Implementation | Monthly Cost |
| :--- | :--- | :--- |
| **Compute / Rendering** | Markdown compilation (`marked`), KaTeX math formatting, and Mermaid SVG generation run entirely in client JavaScript. | **$0.00** |
| **Database** | Decks, slides, settings, and speaker notes are saved locally in browser `localStorage`. | **$0.00** |
| **Asset Storage** | Zero server uploads required. Standalone HTML packaging bundles CSS and scripts directly. | **$0.00** |
| **Hosting** | Static single-page application (SPA). Can be served indefinitely on free static tiers (GitHub Pages, Cloudflare Pages, Vercel Hobby). | **$0.00** |

---

## 2. Current Core Capabilities

1. **Live Split-Pane Markdown Editor**: Instantaneous preview compilation as you type.
2. **Dual-Axis Slides**: Horizontal topic slides (`---`) and vertical deep-dive sub-slides (`--`).
3. **Built-in KaTeX Math**: Full LaTeX equation typesetting ($$display$$ and $inline$).
4. **Mermaid Diagrams & Charts**: Flowcharts (`graph LR / TD`), quantitative bar/line charts (`xychart-beta`), sequence diagrams (`sequenceDiagram`), state machines, and mindmaps.
5. **Presenter Console (`S`)**: Wall clock, elapsed presentation timer, confidence monitor with next slide preview, and private speaker notes.
6. **Fullscreen Delivery (`F`)**: Laser pointer mode, blackout pauses (`B`), and bird's-eye slide grid matrix (`O`).
7. **Offline Standalone HTML Export**: Single self-contained HTML file that opens in any browser with full navigation, themes, and notes without requiring internet.
8. **Print-to-PDF**: Pre-formatted 16:9 landscape layout for crisp vector PDF generation.

---

## 3. High-Leverage Roadmap (Ranked by End-User Value)

### Tier 1: Real-World Presentation Utility (P0)

#### 1. True Dual-Window Presenter Mode (`BroadcastChannel` API) — [IMPLEMENTED]
- **Status**: Live & operational.
- **Implementation**: Zero-cost, zero-server inter-window sync using `BroadcastChannel` with fallback to `localStorage` storage events. Presenters can launch an external clean presentation display (`?view=audience`) on a secondary monitor while controlling notes, slides, fragments, blackout, and synchronized laser pointer on their primary display.
- **Cost**: **$0** (built into modern browsers).

#### 2. Offline PWA (Progressive Web App) — [IMPLEMENTED]
- **Status**: Live & operational.
- **Implementation**: Full Progressive Web App powered by `vite-plugin-pwa`, complete with Web App Manifest, 192px/512px/maskable and Apple touch icons, Service Worker asset precaching, Google Fonts runtime caching, reactive online/offline status banner, and in-app install prompt with guided iOS Add-to-Home-Screen support.
- **Cost**: **$0**.

#### 3. Audience QR Code Sharing — [PLANNED]
- **Problem**: Attendees constantly ask for the slides after a talk.
- **Solution**: A "Share with Audience" tool that generates an SVG QR code directly on the final slide or in a modal. Attendees scan the QR code from their seats to view or download the presentation.
- **Cost**: **$0** (client-side SVG generation).

---

### Tier 2: Slide Authoring & Visual Polish (P1)

#### 4. Pre-Built Visual Layout Snippets — [IMPLEMENTED]
- **Status**: Live & operational.
- **Implementation**: Dedicated `Layouts` toolbar dropdown in MarkdownEditor with 1-click insertion for 5 core slide patterns: KPI Metric Grid, Hero Quote Callout, Before vs. After Comparison, Milestone Timeline Roadmap, and Team Profile Grid. Styled with responsive scoped CSS supporting both light and dark themes, as well as standalone offline HTML export bundling.
- **Cost**: **$0**.

#### 5. Image Clipboard Paste (`Ctrl+V` / `Cmd+V`) & Free Unsplash
- Allow users to paste screenshots or images directly from their clipboard into the editor canvas, auto-embedding as inline base64 or local object URLs.
- Provide a free modal searching copyright-free stock photography via Unsplash.

#### 6. Custom Backgrounds & Gradient Designer
- Expand theme options to let users pick smooth CSS mesh gradients (e.g., deep midnight indigo, emerald gradient, clean minimalist paper) without typing raw HTML.

---

### Tier 3: Interoperability & Export Utility (P2)

#### 7. Client-Side PowerPoint (.pptx) Export — [IMPLEMENTED]
- **Status**: Live & operational.
- **Implementation**: Pure browser-side synthesis via `pptxgenjs` creating editable Microsoft PowerPoint (.pptx) slide decks with native titles, bullet runs, code blocks, tables, aspect ratio matching (16:9 / 4:3), and embedded speaker notes for PowerPoint Presenter View.
- **Cost**: **$0** (zero cloud APIs or server conversion utilities).

#### 8. Enhanced Print-to-PDF Engine
- Fine-tune `@media print` CSS rules (`size: 16in 9in landscape; break-after: page;`) for pixel-perfect PDF export via browser print dialog.

#### 9. Markdown Interoperability (Marp & Obsidian)
- Seamless import and export compatibility with Obsidian Slides and Marp presentation markdown files.

---

## 4. Potential Future Premium / Monetization Vectors (If Ever Activated)

If a paid or monetization tier is introduced in the future, these features represent genuine enterprise/pro value while keeping the core slide builder free:

1. **Cloud URL Sharing & Live Web Presentation Hosting**: Custom short links (e.g. `slidecraft.io/p/my-talk`) with real-time audience view counters.
2. **Real-Time Remote Control**: Advance slides from your phone via WebSocket or mobile QR controller.
3. **Team Brand Kits**: Shared corporate themes, custom fonts, and company logos.
4. **Cloud Auto-Sync**: Multi-device sync across desktop and mobile.
