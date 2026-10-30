import LZString from 'lz-string';
import { PresentationDeck } from '../types/presentation';
import { parseMarkdownToSlides } from './markdownParser';
import { THEMES } from './themes';

/**
 * Generates an interactive, completely standalone HTML file containing the entire presentation,
 * styling, themes, keyboard controls, speaker notes, and fragment navigation.
 * No internet or server required when opened in any browser.
 */
export function generateStandaloneHtml(deck: PresentationDeck): string {
  const slides = parseMarkdownToSlides(deck.markdown);
  const theme = THEMES[deck.settings.theme] || THEMES.obsidian;

  const slidesJson = JSON.stringify(
    slides.map((s) => ({
      id: s.id,
      h: s.horizontalIndex,
      v: s.verticalIndex,
      title: s.title,
      html: s.htmlContent,
      notes: s.speakerNotes,
      bg: s.backgroundColor,
      fragments: s.fragmentsCount,
      textColor: s.customTextColor,
    }))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(deck.title)} - SlideCraft Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; overflow: hidden; font-family: 'Outfit', system-ui, -apple-system, sans-serif; background: #000; color: #fff; }
    
    #presentation-viewport {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: ${theme.previewBg};
    }

    .slide-stage {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: ${deck.settings.aspectRatio === '4:3' ? '133.33vh' : '177.78vh'};
      max-height: ${deck.settings.aspectRatio === '4:3' ? '75vw' : '56.25vw'};
      aspect-ratio: ${deck.settings.aspectRatio === '4:3' ? '4/3' : '16/9'};
      display: flex;
      flex-direction: column;
      justify-content: ${deck.settings.centerSlides ? 'center' : 'flex-start'};
      padding: clamp(2rem, 5vw, 5rem);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      color: ${theme.category === 'light' ? '#1e293b' : '#f1f5f9'};
    }

    h1, h2, h3, h4 { color: ${theme.headingColor}; font-weight: 700; line-height: 1.2; margin-bottom: 0.8rem; }
    h1 { font-size: clamp(2.2rem, 4.5vw, 3.8rem); }
    h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); }
    h3 { font-size: clamp(1.3rem, 2.5vw, 2rem); }
    p, li { font-size: clamp(1rem, 1.8vw, 1.35rem); line-height: 1.6; margin-bottom: 0.8rem; }
    ul, ol { padding-left: 2rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.5rem; }

    .slide-columns { display: flex; gap: 2rem; width: 100%; margin: 1.5rem 0; }
    .slide-col { flex: 1; }

    pre {
      background: #0d1117;
      color: #e6edf3;
      padding: 1.2rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 1rem 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 1.05rem; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.15); }
    th { font-weight: 600; color: ${theme.accentColor}; border-bottom: 2px solid ${theme.accentColor}; }

    /* Columns Layout */
    .slide-columns {
      display: flex;
      flex-direction: row;
      gap: 1.5rem;
      margin: 1.25rem 0;
      width: 100%;
      align-items: flex-start;
    }
    .slide-col {
      flex: 1 1 0%;
      min-width: 0;
    }
    .slide-col > :first-child { margin-top: 0; }
    .slide-col > :last-child { margin-bottom: 0; }
    .slide-col p { margin-bottom: 0.6rem; line-height: 1.6; }
    @media (max-width: 640px) {
      .slide-columns { flex-direction: column; }
    }

    /* Fragments */
    .slide-fragment { opacity: 0; transform: translateY(12px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .slide-fragment.visible { opacity: 1; transform: translateY(0); }

    /* Callouts */
    .slide-callout { border-radius: 8px; padding: 1rem 1.25rem; margin: 1.25rem 0; border: 1px solid; }
    .slide-callout-warning {
      background-color: ${theme.category === 'light' ? '#fef3c7' : 'rgba(120, 53, 15, 0.35)'};
      border-color: ${theme.category === 'light' ? '#f59e0b' : 'rgba(245, 158, 11, 0.55)'};
      color: ${theme.category === 'light' ? '#78350f' : '#fef3c7'};
    }
    .slide-callout-warning .callout-header { color: ${theme.category === 'light' ? '#92400e' : '#fde68a'}; }
    .slide-callout-tip {
      background-color: ${theme.category === 'light' ? '#d1fae5' : 'rgba(6, 78, 59, 0.35)'};
      border-color: ${theme.category === 'light' ? '#10b981' : 'rgba(16, 185, 129, 0.55)'};
      color: ${theme.category === 'light' ? '#064e3b' : '#d1fae5'};
    }
    .slide-callout-note {
      background-color: ${theme.category === 'light' ? '#dbeafe' : 'rgba(30, 58, 138, 0.35)'};
      border-color: ${theme.category === 'light' ? '#3b82f6' : 'rgba(59, 130, 246, 0.55)'};
      color: ${theme.category === 'light' ? '#1e3a8a' : '#dbeafe'};
    }
    .slide-callout-important {
      background-color: ${theme.category === 'light' ? '#ffe4e6' : 'rgba(136, 19, 55, 0.35)'};
      border-color: ${theme.category === 'light' ? '#f43f5e' : 'rgba(244, 63, 94, 0.55)'};
      color: ${theme.category === 'light' ? '#881337' : '#ffe4e6'};
    }

    /* Progress bar */
    #progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: ${theme.accentColor};
      transition: width 0.25s ease;
      z-index: 100;
    }

    /* Slide counter */
    #slide-counter {
      position: absolute;
      bottom: 1.25rem;
      right: 1.5rem;
      font-size: 0.85rem;
      font-family: ui-monospace, monospace;
      color: rgba(255, 255, 255, 0.5);
      z-index: 100;
      user-select: none;
    }

    /* Controls HUD */
    .hud-controls {
      position: absolute;
      bottom: 1.25rem;
      left: 1.5rem;
      display: flex;
      gap: 0.5rem;
      opacity: 0.2;
      transition: opacity 0.2s;
      z-index: 100;
    }
    .hud-controls:hover { opacity: 1; }
    .hud-btn {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .hud-btn:hover { background: rgba(0, 0, 0, 0.9); border-color: ${theme.accentColor}; }

    /* Speaker Notes Window */
    #notes-modal {
      display: none;
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 380px;
      max-height: 400px;
      background: #0f172a;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      padding: 1.25rem;
      z-index: 999;
      overflow-y: auto;
    }
    #notes-modal.open { display: block; }
    .notes-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #94a3b8; }
    .notes-content { font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; }

    /* Overview Mode */
    #overview-grid {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 15, 26, 0.96);
      z-index: 2000;
      overflow-y: auto;
      padding: 3rem;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    #overview-grid.open { display: grid; }
    .grid-slide-card {
      aspect-ratio: 16/9;
      background: #1e293b;
      border: 2px solid #334155;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      overflow: hidden;
      transform: scale(1);
      transition: transform 0.2s, border-color 0.2s;
    }
    .grid-slide-card:hover { transform: scale(1.04); border-color: ${theme.accentColor}; }
    .grid-slide-card.active { border-color: ${theme.accentColor}; box-shadow: 0 0 0 3px ${theme.accentColor}44; }

    /* Keyframe animations for slide changes */
    @keyframes slideInFromRight {
      0% { opacity: 0; transform: translateX(60px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInFromLeft {
      0% { opacity: 0; transform: translateX(-60px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInSlide {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes zoomInSlide {
      0% { opacity: 0; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes convexInNext {
      0% { opacity: 0; transform: perspective(1000px) rotateY(18deg) scale(0.92); }
      100% { opacity: 1; transform: perspective(1000px) rotateY(0deg) scale(1); }
    }
    @keyframes convexInPrev {
      0% { opacity: 0; transform: perspective(1000px) rotateY(-18deg) scale(0.92); }
      100% { opacity: 1; transform: perspective(1000px) rotateY(0deg) scale(1); }
    }

    .slide-anim-slide-next { animation: slideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .slide-anim-slide-prev { animation: slideInFromLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .slide-anim-fade { animation: fadeInSlide 0.32s ease-in-out both; }
    .slide-anim-zoom { animation: zoomInSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .slide-anim-convex-next { animation: convexInNext 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .slide-anim-convex-prev { animation: convexInPrev 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

    /* Slide Fragments */
    .slide-fragment {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      margin: 0.5rem 0;
    }
    .slide-fragment.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    /* Mermaid Diagrams */
    .slide-mermaid-wrapper { width: 100%; margin: 1rem 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .slide-mermaid-render { width: 100%; max-height: 420px; display: flex; align-items: center; justify-content: center; border-radius: 1rem; padding: 1.25rem; background: radial-gradient(ellipse at top, rgba(30, 27, 75, 0.45), rgba(15, 23, 42, 0.75)); border: 1px solid rgba(99, 102, 241, 0.3); overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); }
    .slide-mermaid-render svg { max-width: 100% !important; max-height: 390px !important; width: auto !important; height: auto !important; display: block; margin: 0 auto; }
    .slide-mermaid-render svg filter { display: none !important; }
    .slide-mermaid-render .node rect, .slide-mermaid-render .node polygon, .slide-mermaid-render .node circle, .slide-mermaid-render .node ellipse { rx: 10px !important; ry: 10px !important; stroke-width: 1.75px !important; }
    .slide-mermaid-render .edgePath path.path { stroke-width: 2px !important; stroke-linecap: round !important; }
    .slide-mermaid-render .edgeLabel .label { background: #0f172a !important; border: 1px solid rgba(99, 102, 241, 0.5) !important; border-radius: 9999px !important; padding: 3px 10px !important; font-size: 11px !important; font-weight: 600 !important; color: #c7d2fe !important; }

    /* Pre-Built Visual Slide Patterns */
    .slide-kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; margin: 1.5rem 0; width: 100%; }
    .slide-kpi-card { padding: 1.5rem 1.25rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; justify-content: center; }
    .slide-kpi-val { font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; margin-bottom: 0.5rem; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .slide-kpi-label { font-size: clamp(0.95rem, 1.3vw, 1.15rem); font-weight: 650; margin-bottom: 0.25rem; }
    .slide-kpi-sub { font-size: clamp(0.75rem, 1vw, 0.875rem); opacity: 0.65; }

    .slide-hero-quote { margin: 2rem 0; padding: 2rem; border-radius: 1.25rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); position: relative; }
    .slide-quote-glyph { font-size: 3.5rem; line-height: 1; font-family: Georgia, serif; color: #818cf8; opacity: 0.6; margin-bottom: -0.5rem; user-select: none; }
    .slide-quote-text { font-size: clamp(1.2rem, 2.2vw, 1.75rem) !important; font-weight: 500 !important; font-style: italic !important; line-height: 1.45 !important; margin-bottom: 1.5rem !important; border: none !important; padding: 0 !important; }
    .slide-quote-author { display: flex; align-items: center; gap: 1rem; }
    .slide-quote-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #9333ea); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; color: #ffffff; }
    .slide-quote-name { font-size: clamp(0.95rem, 1.3vw, 1.15rem); font-weight: 700; }
    .slide-quote-role { font-size: clamp(0.8rem, 1vw, 0.9rem); opacity: 0.65; }

    .slide-comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin: 1.5rem 0; width: 100%; }
    .slide-compare-col { padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); }
    .slide-compare-col.before { border-color: rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.03); }
    .slide-compare-col.after { border-color: rgba(34, 197, 94, 0.35); background: rgba(34, 197, 94, 0.04); }
    .slide-compare-header { margin-bottom: 1rem; }
    .slide-compare-header h3 { margin: 0.35rem 0 0 0 !important; font-size: clamp(1.1rem, 1.8vw, 1.4rem) !important; font-weight: 700; }
    .slide-compare-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .slide-compare-tag.active { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }

    .slide-timeline { display: flex; gap: 1.25rem; margin: 1.75rem 0; width: 100%; }
    .slide-timeline-item { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .slide-timeline-marker { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #818cf8; }
    .slide-timeline-card { padding: 1.25rem; border-radius: 0.875rem; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); height: 100%; display: flex; flex-direction: column; }
    .slide-timeline-card h4 { font-size: clamp(0.95rem, 1.3vw, 1.15rem); font-weight: 700; margin-bottom: 0.4rem; }
    .slide-timeline-card p { font-size: clamp(0.8rem, 1.1vw, 0.9rem); opacity: 0.7; line-height: 1.45; margin-bottom: 0.75rem; flex: 1; }
    .slide-timeline-badge { display: inline-block; align-self: flex-start; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 8px; border-radius: 9999px; }
    .slide-timeline-badge.done { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .slide-timeline-badge.current { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }
    .slide-timeline-badge.next { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

    .slide-team-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; margin: 1.5rem 0; width: 100%; }
    .slide-team-card { padding: 1.5rem 1.25rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); display: flex; flex-direction: column; }
    .slide-team-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; color: #ffffff; margin-bottom: 0.75rem; }
    .slide-team-card h4 { font-size: clamp(1rem, 1.4vw, 1.2rem); font-weight: 700; margin-bottom: 0.2rem; }
    .slide-team-role { font-size: clamp(0.75rem, 1vw, 0.85rem); font-weight: 600; color: #818cf8; margin-bottom: 0.5rem; }
    .slide-team-card p { font-size: clamp(0.8rem, 1.1vw, 0.9rem); opacity: 0.7; line-height: 1.45; margin-bottom: 0; }
  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
</head>
<body>
  <div id="presentation-viewport">
    <div id="stage" class="slide-stage" style="perspective: 1200px;"></div>
    <div id="progress-bar"></div>
    <div id="slide-counter">1 / 1</div>

    <div class="hud-controls">
      <button class="hud-btn" onclick="prev()">❮ Prev</button>
      <button class="hud-btn" onclick="next()">Next ❯</button>
      <button class="hud-btn" onclick="toggleNotes()">Notes (S)</button>
      <button class="hud-btn" onclick="toggleOverview()">Grid (O)</button>
      <button class="hud-btn" onclick="toggleFullscreen()">Fullscreen (F)</button>
    </div>

    <div id="notes-modal">
      <div class="notes-header">
        <span>SPEAKER NOTES</span>
        <span onclick="toggleNotes()" style="cursor:pointer">✕</span>
      </div>
      <div id="notes-content" class="notes-content">No notes for this slide.</div>
    </div>

    <div id="overview-grid"></div>
  </div>

  <script>
    const slidesData = ${slidesJson};
    let currentIndex = 0;
    let currentFragment = 0;

    const stage = document.getElementById('stage');
    const progressBar = document.getElementById('progress-bar');
    const slideCounter = document.getElementById('slide-counter');
    const notesModal = document.getElementById('notes-modal');
    const notesContent = document.getElementById('notes-content');
    const overviewGrid = document.getElementById('overview-grid');

    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: '${theme.category === 'light' ? 'neutral' : 'dark'}',
        securityLevel: 'loose'
      });
    }

    function renderSlide(index, fragmentStep = 0, direction = 'next', triggerAnim = false) {
      if (index < 0) index = 0;
      if (index >= slidesData.length) index = slidesData.length - 1;
      const isSlideChange = index !== currentIndex || triggerAnim;
      currentIndex = index;
      currentFragment = fragmentStep;

      const slide = slidesData[currentIndex];
      stage.innerHTML = slide.html;

      // Asynchronously render any Mermaid diagrams
      if (window.mermaid) {
        const wrappers = stage.querySelectorAll('.slide-mermaid-wrapper');
        wrappers.forEach(async (wrapper, i) => {
          const rawCodeEncoded = wrapper.getAttribute('data-mermaid-code');
          const target = wrapper.querySelector('.slide-mermaid-render');
          if (rawCodeEncoded && target) {
            try {
              const code = decodeURIComponent(rawCodeEncoded);
              const { svg } = await window.mermaid.render('exp-mermaid-' + Date.now() + '-' + i, code);
              target.innerHTML = svg;
            } catch (err) {
              console.warn(err);
            }
          }
        });
      }

      // Handle custom background
      if (slide.bg) {
        stage.style.background = slide.bg;
      } else {
        stage.style.background = '${theme.previewBg}';
      }

      // Handle text color
      if (slide.textColor) {
        stage.style.color = slide.textColor;
      } else {
        stage.style.color = '${theme.category === 'light' ? '#1e293b' : '#f1f5f9'}';
      }

      // Apply slide transition animation on slide switch
      if (isSlideChange) {
        const animType = slide.transition || '${deck.settings.transition || 'slide'}';
        stage.classList.remove('slide-anim-slide-next', 'slide-anim-slide-prev', 'slide-anim-fade', 'slide-anim-zoom', 'slide-anim-convex-next', 'slide-anim-convex-prev');
        void stage.offsetWidth; // Trigger DOM reflow to restart CSS animation
        if (animType === 'slide') {
          stage.classList.add(direction === 'next' ? 'slide-anim-slide-next' : 'slide-anim-slide-prev');
        } else if (animType === 'fade') {
          stage.classList.add('slide-anim-fade');
        } else if (animType === 'zoom') {
          stage.classList.add('slide-anim-zoom');
        } else if (animType === 'convex') {
          stage.classList.add(direction === 'next' ? 'slide-anim-convex-next' : 'slide-anim-convex-prev');
        }
      }

      // Update fragments
      const fragments = stage.querySelectorAll('.slide-fragment');
      fragments.forEach((frag) => {
        const fragIdx = parseInt(frag.getAttribute('data-fragment-index') || '0', 10);
        if (fragIdx <= currentFragment) {
          frag.classList.add('visible');
        } else {
          frag.classList.remove('visible');
        }
      });

      // Update progress and slide numbers
      const pct = ((currentIndex + 1) / slidesData.length) * 100;
      progressBar.style.width = pct + '%';
      slideCounter.textContent = (currentIndex + 1) + ' / ' + slidesData.length;

      // Update notes
      notesContent.textContent = slide.notes && slide.notes.trim() ? slide.notes : 'No speaker notes for this slide.';
    }

    function next() {
      const slide = slidesData[currentIndex];
      const fragments = stage.querySelectorAll('.slide-fragment');
      if (currentFragment < fragments.length) {
        currentFragment++;
        renderSlide(currentIndex, currentFragment, 'next', false);
      } else if (currentIndex < slidesData.length - 1) {
        renderSlide(currentIndex + 1, 0, 'next', true);
      }
    }

    function prev() {
      if (currentFragment > 0) {
        currentFragment--;
        renderSlide(currentIndex, currentFragment, 'prev', false);
      } else if (currentIndex > 0) {
        const prevSlide = slidesData[currentIndex - 1];
        renderSlide(currentIndex - 1, prevSlide.fragments || 0, 'prev', true);
      }
    }

    function toggleNotes() {
      notesModal.classList.toggle('open');
    }

    function toggleOverview() {
      if (overviewGrid.classList.contains('open')) {
        overviewGrid.classList.remove('open');
      } else {
        overviewGrid.innerHTML = '';
        slidesData.forEach((s, idx) => {
          const card = document.createElement('div');
          card.className = 'grid-slide-card' + (idx === currentIndex ? ' active' : '');
          card.innerHTML = '<div style="font-weight:bold; font-size: 0.9rem; margin-bottom: 0.4rem;">' + (idx+1) + '. ' + s.title + '</div><div style="font-size:0.75rem; opacity:0.7; overflow:hidden; max-height:80px;">' + s.html.replace(/<[^>]*>?/gm, ' ') + '</div>';
          card.onclick = () => {
            renderSlide(idx, 0);
            overviewGrid.classList.remove('open');
          };
          overviewGrid.appendChild(card);
        });
        overviewGrid.classList.add('open');
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    // Keyboard events
    window.addEventListener('keydown', (e) => {
      if (overviewGrid.classList.contains('open') && e.key !== 'Escape' && e.key !== 'o') return;

      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prev();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleNotes();
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          toggleOverview();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          overviewGrid.classList.remove('open');
          notesModal.classList.remove('open');
          break;
      }
    });

    // Initial render
    renderSlide(0, 0);
  </script>
</body>
</html>`;
}

/**
 * Generates an HTML document optimized specifically for printing or saving to PDF.
 */
export function generatePrintPdfHtml(deck: PresentationDeck): string {
  const slides = parseMarkdownToSlides(deck.markdown);
  const theme = THEMES[deck.settings.theme] || THEMES.obsidian;

  const slidesHtml = slides
    .map(
      (slide, index) => `
    <div class="print-slide-page">
      <div class="print-slide-inner" style="background: ${slide.backgroundColor || theme.previewBg}; color: ${slide.customTextColor || (theme.category === 'light' ? '#0f172a' : '#f8fafc')};">
        ${slide.htmlContent}
        <div class="print-slide-footer">
          <span>${escapeHtml(deck.title)}</span>
          <span>${index + 1} / ${slides.length}</span>
        </div>
      </div>
    </div>
  `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(deck.title)} - Print / PDF</title>
  <style>
    @page {
      size: 11in 6.1875in; /* 16:9 landscape */
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      color: ${theme.category === 'light' ? '#0f172a' : '#f8fafc'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-actions {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .print-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .print-btn:hover { background: #1d4ed8; }
    .print-slide-page {
      width: 100vw;
      height: 100vh;
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #000;
    }
    .print-slide-inner {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: ${deck.settings.centerSlides ? 'center' : 'flex-start'};
      padding: 3.5rem;
      border-radius: 4px;
    }
    h1, h2, h3 { color: ${theme.headingColor}; margin-bottom: 1rem; line-height: 1.2; }
    h1 { font-size: 2.8rem; }
    h2 { font-size: 2.2rem; }
    h3 { font-size: 1.6rem; }
    p, li { font-size: 1.25rem; line-height: 1.6; margin-bottom: 0.8rem; }
    .slide-columns { display: flex; gap: 2rem; width: 100%; margin: 1.5rem 0; }
    .slide-col { flex: 1; }
    pre {
      background: #0f172a;
      color: #f1f5f9;
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.95rem;
      margin: 1rem 0;
    }
    .print-slide-footer {
      position: absolute;
      bottom: 1.5rem;
      left: 3.5rem;
      right: 3.5rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      opacity: 0.6;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 0.5rem;
    }
    @media print {
      .print-actions { display: none !important; }
      .print-slide-page {
        width: 100%;
        height: 100vh;
        padding: 0;
        background: transparent;
      }
      .print-slide-inner {
        width: 100%;
        height: 100%;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <div>
      <strong>Ready to Export PDF:</strong> In the print preview, select <em>Destination: Save as PDF</em>, <em>Layout: Landscape</em>, and check <em>Background graphics</em>.
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${slidesHtml}
  <script>
    // Auto-trigger print dialog after brief render settle
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
}

/**
 * Encodes a presentation deck into a compressed shareable URL hash
 */
export function generateShareUrl(deck: PresentationDeck): string {
  try {
    const json = JSON.stringify(deck);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const url = new URL(window.location.href);
    url.hash = `deck=${compressed}`;
    return url.toString();
  } catch (err) {
    console.error('Failed to encode share URL:', err);
    return window.location.href;
  }
}

/**
 * Decodes a presentation deck from a URL hash if present
 */
export function decodeShareUrl(): PresentationDeck | null {
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('deck=')) {
      const match = hash.match(/deck=([^&]+)/);
      if (match && match[1]) {
        const decompressed = LZString.decompressFromEncodedURIComponent(match[1]);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (parsed && parsed.title && parsed.markdown) {
            return parsed as PresentationDeck;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to decode deck from URL:', err);
  }
  return null;
}

/**
 * Triggers a client-side file download with the given content and filename.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
