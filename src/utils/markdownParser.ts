import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import { SlideContent, TransitionType } from '../types/presentation';

// Configure marked with highlight.js
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Parses raw Markdown text into a structured array of slides (both horizontal and vertical).
 */
export function parseMarkdownToSlides(markdownText: string): SlideContent[] {
  if (!markdownText || !markdownText.trim()) {
    return [
      {
        id: 'slide-0-0',
        horizontalIndex: 0,
        verticalIndex: 0,
        rawMarkdown: '# Welcome\n\nStart typing Markdown to craft your presentation.',
        htmlContent: '<div class="slide-center"><h1 class="text-4xl font-bold">Welcome</h1><p class="text-lg opacity-80 mt-4">Start typing Markdown to craft your presentation.</p></div>',
        speakerNotes: '',
        fragmentsCount: 0,
        title: 'Welcome',
      },
    ];
  }

  // Normalize line breaks
  const normalizedText = markdownText.replace(/\r\n/g, '\n');

  // Split into horizontal slide sections using `\n---\n`
  // We match `\n---\n` while ignoring dashes inside code blocks or frontmatter
  const horizontalChunks = splitSections(normalizedText, '---');

  const slides: SlideContent[] = [];
  let hIdx = 0;

  for (const hChunk of horizontalChunks) {
    if (!hChunk.trim()) continue;

    // Check if this horizontal section contains vertical slides (`\n--\n`)
    const verticalChunks = splitSections(hChunk, '--');

    let vIdx = 0;
    for (const vChunk of verticalChunks) {
      if (!vChunk.trim()) continue;

      const slide = processSingleSlide(vChunk, hIdx, vIdx);
      slides.push(slide);
      vIdx++;
    }

    hIdx++;
  }

  return slides.length > 0
    ? slides
    : [
        {
          id: 'slide-0-0',
          horizontalIndex: 0,
          verticalIndex: 0,
          rawMarkdown: '# Slide 1\n\nEmpty slide',
          htmlContent: '<h1>Slide 1</h1><p>Empty slide</p>',
          speakerNotes: '',
          fragmentsCount: 0,
          title: 'Slide 1',
        },
      ];
}

/**
 * Split text by a separator delimiter line (e.g. `---` or `--`), ensuring we don't split inside ``` code blocks
 */
function splitSections(text: string, separator: '---' | '--'): string[] {
  const lines = text.split('\n');
  const sections: string[] = [];
  let currentSection: string[] = [];
  let inCodeBlock = false;

  const isSep = (line: string) => {
    const trimmed = line.trim();
    if (separator === '---') {
      return trimmed === '---';
    } else {
      // Must be `--` and NOT `---`
      return trimmed === '--';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock && isSep(line)) {
      sections.push(currentSection.join('\n'));
      currentSection = [];
    } else {
      currentSection.push(line);
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection.join('\n'));
  }

  return sections;
}

/**
 * Process a single slide chunk: extract speaker notes, directives, fragments, and convert markdown to HTML
 */
function processSingleSlide(rawChunk: string, horizontalIndex: number, verticalIndex: number): SlideContent {
  let content = rawChunk;
  let speakerNotes = '';
  let backgroundColor: string | undefined;
  let backgroundImage: string | undefined;
  let customClass: string | undefined;
  let transition: TransitionType | undefined;
  let customTextColor: string | undefined;

  // 1. Extract speaker notes
  // Reveal pattern: `Note:` or `note:` at start of line until end of slide, or `:::notes ... :::`, or `<!-- note: ... -->`
  const notesMatch1 = content.match(/<!--\s*notes?:\s*([\s\S]*?)-->/i);
  if (notesMatch1) {
    speakerNotes += (notesMatch1[1] || '').trim();
    content = content.replace(notesMatch1[0], '');
  }

  const notesMatch2 = content.match(/:::notes\s*([\s\S]*?):::/i);
  if (notesMatch2) {
    speakerNotes += (speakerNotes ? '\n\n' : '') + (notesMatch2[1] || '').trim();
    content = content.replace(notesMatch2[0], '');
  }

  const notesMatch3 = content.match(/\n[Nn]ote:\s*([\s\S]*)$/);
  if (notesMatch3) {
    speakerNotes += (speakerNotes ? '\n\n' : '') + (notesMatch3[1] || '').trim();
    content = content.substring(0, notesMatch3.index);
  }

  // 2. Extract slide directives:
  // e.g. <!-- .slide: data-background-color="#123" data-transition="zoom" class="foo" -->
  const slideDirective = content.match(/<!--\s*\.slide:\s*(.*?)-->/);
  if (slideDirective) {
    const attrs = slideDirective[1];
    const bgMatch = attrs.match(/data-background(?:-color)?=["']([^"']+)["']/);
    if (bgMatch) backgroundColor = bgMatch[1];

    const bgImgMatch = attrs.match(/data-background-image=["']([^"']+)["']/);
    if (bgImgMatch) backgroundImage = bgImgMatch[1];

    const transMatch = attrs.match(/data-transition=["']([^"']+)["']/);
    if (transMatch) transition = transMatch[1] as TransitionType;

    const classMatch = attrs.match(/class=["']([^"']+)["']/);
    if (classMatch) customClass = classMatch[1];

    const colorMatch = attrs.match(/(?:data-)?color=["']([^"']+)["']/);
    if (colorMatch) customTextColor = colorMatch[1];

    content = content.replace(slideDirective[0], '');
  }

  // Simple direct syntax: <!-- bg: #1e1e2e --> or <!-- bg-image: url(...) -->
  const simpleBg = content.match(/<!--\s*bg:\s*([^\s>]+)\s*-->/);
  if (simpleBg) {
    backgroundColor = simpleBg[1];
    content = content.replace(simpleBg[0], '');
  }

  const simpleTrans = content.match(/<!--\s*transition:\s*([^\s>]+)\s*-->/);
  if (simpleTrans) {
    transition = simpleTrans[1] as TransitionType;
    content = content.replace(simpleTrans[0], '');
  }

  // Simple direct syntax: <!-- color: #6ee7b7 --> or <!-- text-color: #fff -->
  const simpleColor = content.match(/<!--\s*(?:text-)?color:\s*([^\s>]+)\s*-->/i);
  if (simpleColor) {
    customTextColor = simpleColor[1];
    content = content.replace(simpleColor[0], '');
  }

  // 3. Process custom markdown extensions before passing to marked:

  // Protect code blocks from math parsing
  const mathProtectedCodeBlocks: string[] = [];
  content = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    mathProtectedCodeBlocks.push(match);
    return `<!-- __SLIDE_CODE_BLOCK_${mathProtectedCodeBlocks.length - 1}__ -->`;
  });

  // Render LaTeX math formulas with KaTeX
  // Display math: $$ formula $$
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_m, formula) => {
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display my-5 py-3 px-4 rounded-xl text-center overflow-x-auto text-lg leading-relaxed">${rendered}</div>`;
    } catch {
      return `<div class="katex-display my-4 py-2 px-4 rounded text-center font-mono text-base overflow-x-auto"><code>${escapeHtml(formula.trim())}</code></div>`;
    }
  });

  // Inline math: $ formula $
  content = content.replace(/(?<!\\)\$([^\$\n]+)\$/g, (_m, formula) => {
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return `<span class="katex-inline inline-block px-1">${rendered}</span>`;
    } catch {
      return `<code class="katex-inline px-1.5 py-0.5 rounded font-mono text-sm">${escapeHtml(formula.trim())}</code>`;
    }
  });

  // Restore protected code blocks
  content = content.replace(/<!-- __SLIDE_CODE_BLOCK_(\d+)__ -->/g, (_m, id) => {
    return mathProtectedCodeBlocks[Number(id)] || '';
  });

  // Mermaid Diagram: `:::mermaid` ... `:::`
  content = content.replace(/:::mermaid\s*([\s\S]*?):::/gi, (_m, mermaidCode) => {
    return `\n\`\`\`mermaid\n${mermaidCode.trim()}\n\`\`\`\n`;
  });

  // Fragments: `:::fragment` ... `:::`
  let fragmentCounter = 0;
  content = content.replace(/:::fragment\s*([\s\S]*?):::/g, (_m, fragmentBody) => {
    fragmentCounter++;
    const innerHtml = marked.parse(fragmentBody.trim()) as string;
    return `<div class="slide-fragment" data-fragment-index="${fragmentCounter}">${innerHtml}</div>`;
  });

  // Support for `<!-- .element: class="fragment" -->`
  content = content.replace(/([^\n]+)\s*<!--\s*\.element:\s*class=["']([^"']*fragment[^"']*)["']\s*-->/g, (_m, elementText) => {
    fragmentCounter++;
    const innerHtml = marked.parseInline(elementText.trim()) as string;
    return `<div class="slide-fragment inline-block" data-fragment-index="${fragmentCounter}">${innerHtml}</div>`;
  });

  // Two-column / multi-column layout (:::columns ... :::column ... :::)
  const { content: processedContent, columnBlocks } = extractAndProcessColumns(content);
  content = processedContent;

  // Extract Title from first header (H1, H2, or H3)
  const titleMatch = content.match(/^(?:#+)\s+(.+)$/m);
  const slideTitle = titleMatch ? titleMatch[1].trim() : `Slide ${horizontalIndex + 1}${verticalIndex > 0 ? '.' + (verticalIndex + 1) : ''}`;

  // Parse Markdown to HTML
  let parsedHtml = '';
  try {
    parsedHtml = marked.parse(content) as string;
  } catch (err) {
    parsedHtml = `<p class="text-rose-400">Markdown Parse Error: ${String(err)}</p><pre>${escapeHtml(content)}</pre>`;
  }

  // Restore column blocks into parsed HTML
  parsedHtml = parsedHtml.replace(/<!--\s*__SLIDE_COLUMNS_BLOCK_(\d+)__\s*-->/g, (_m, idStr) => {
    return columnBlocks[Number(idStr)] || '';
  });

  // Post-process HTML for enhanced elements:
  // Syntax highlighting for code blocks
  parsedHtml = enhanceCodeBlocks(parsedHtml);

  // Callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
  parsedHtml = enhanceCallouts(parsedHtml);

  return {
    id: `slide-${horizontalIndex}-${verticalIndex}`,
    horizontalIndex,
    verticalIndex,
    rawMarkdown: rawChunk,
    htmlContent: parsedHtml,
    speakerNotes,
    backgroundColor,
    backgroundImage,
    customClass,
    transition,
    fragmentsCount: fragmentCounter,
    title: slideTitle,
    customTextColor,
  };
}

/**
 * Replaces <pre><code class="language-xyz">...</code></pre> with syntax-highlighted HTML
 */
function enhanceCodeBlocks(html: string): string {
  return html.replace(/<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, (_match, classAttr, codeContent) => {
    const decoded = unescapeHtml(codeContent);
    const classStr = (classAttr || '').toLowerCase();
    const langMatch = classStr.match(/(?:language-|lang-)?([a-zA-Z0-9_-]+)/);
    const lang = langMatch ? langMatch[1] : '';
    const normalizedLang = lang.toLowerCase();

    const isMermaidKeyword = /^\s*(graph\s+(?:TD|TB|BT|RL|LR)|flowchart|sequenceDiagram|xychart-beta|stateDiagram|classDiagram|erDiagram|gantt|pie|gitGraph|mindmap)\b/.test(decoded.trim());

    if (normalizedLang === 'mermaid' || normalizedLang === 'mermaid-chart' || (normalizedLang === '' && isMermaidKeyword)) {
      return `
        <div class="slide-mermaid-wrapper my-4 flex flex-col items-center justify-center w-full" data-mermaid-code="${encodeURIComponent(decoded)}">
          <div class="slide-mermaid-render flex items-center justify-center w-full min-h-[140px] p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-x-auto shadow-md">
            <div class="mermaid-placeholder flex items-center gap-2 text-xs font-mono text-indigo-400 py-6">
              <span class="inline-block animate-pulse text-sm">📊</span> Rendering Mermaid diagram...
            </div>
          </div>
        </div>
      `;
    }

    let highlighted = '';
    const validLang = lang && hljs.getLanguage(lang) ? lang : undefined;

    try {
      if (validLang) {
        highlighted = hljs.highlight(decoded, { language: validLang, ignoreIllegals: true }).value;
      } else {
        highlighted = hljs.highlightAuto(decoded).value;
      }
    } catch {
      highlighted = escapeHtml(decoded);
    }

    const langBadge = validLang || 'code';

    return `
      <div class="code-block-wrapper relative my-4 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950/80 shadow-md">
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
          <span class="font-medium text-slate-300 uppercase tracking-wider">${langBadge}</span>
          <button class="copy-code-btn px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" data-code="${encodeURIComponent(decoded)}" onclick="navigator.clipboard.writeText(decodeURIComponent(this.getAttribute('data-code'))); this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 1500)">
            Copy
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-sm font-mono leading-relaxed"><code class="hljs ${validLang ? 'language-' + validLang : ''}">${highlighted}</code></pre>
      </div>
    `;
  });
}

/**
 * Parses markdown blockquote callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
 */
function enhanceCallouts(html: string): string {
  return html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|IMPORTANT|INFO)\]([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_match, type, content) => {
    const t = type.toUpperCase();
    let calloutTypeClass = 'slide-callout-note';
    let label = 'Note';
    let icon = 'ℹ';

    if (t === 'TIP') {
      calloutTypeClass = 'slide-callout-tip';
      label = 'Pro Tip';
      icon = '💡';
    } else if (t === 'WARNING') {
      calloutTypeClass = 'slide-callout-warning';
      label = 'Warning';
      icon = '⚠️';
    } else if (t === 'IMPORTANT') {
      calloutTypeClass = 'slide-callout-important';
      label = 'Important';
      icon = '🚨';
    }

    return `
      <div class="slide-callout ${calloutTypeClass} my-4 p-4 rounded-lg border text-sm leading-relaxed">
        <div class="callout-header flex items-center gap-2 font-semibold mb-1 text-xs uppercase tracking-wider">
          <span>${icon}</span>
          <span>${label}</span>
        </div>
        <div class="callout-body font-normal">${content.trim()}</div>
      </div>
    `;
  });
}

/**
 * Extracts and formats multi-column layout blocks:
 * :::columns [attributes]
 * :::column [attributes]
 * ...
 * :::column [attributes]
 * ...
 * :::
 */
function extractAndProcessColumns(content: string): { content: string; columnBlocks: string[] } {
  const lines = content.split('\n');
  const resultLines: string[] = [];
  const columnBlocks: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Check if line starts a columns block, e.g. `:::columns` or `::::columns`
    const columnsStartMatch = line.match(/^\s*(:{3,})columns(?:\s+(.*))?$/i);
    if (!columnsStartMatch) {
      resultLines.push(line);
      i++;
      continue;
    }

    const colonLevel = columnsStartMatch[1].length;
    const containerAttrs = columnsStartMatch[2]?.trim() || '';

    interface ColData {
      attrs: string;
      lines: string[];
    }
    const cols: ColData[] = [];
    let currentCol: ColData | null = null;

    i++; // advance past :::columns header

    while (i < lines.length) {
      const curLine = lines[i];

      // Check if this line is an explicit column start: `:::column [attrs]`
      const colStartMatch = curLine.match(/^\s*(:{3,})(?:column|col)(?:\s+(.*))?$/i);
      if (colStartMatch) {
        if (currentCol) {
          cols.push(currentCol);
        }
        currentCol = {
          attrs: colStartMatch[2]?.trim() || '',
          lines: [],
        };
        i++;
        continue;
      }

      // Check if this line is a closing marker: `:::` or `::::`
      const closeMatch = curLine.match(/^\s*(:{3,})\s*$/);
      if (closeMatch) {
        // Look ahead for the next non-empty line
        let nextNonEmpty = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim().length > 0) {
            nextNonEmpty = lines[j].trim();
            break;
          }
        }

        const nextIsCol = /^:{3,}(?:column|col)\b/i.test(nextNonEmpty);
        const nextIsClose = /^:{3,}\s*$/i.test(nextNonEmpty);

        if ((nextIsCol || nextIsClose) && currentCol) {
          // This closes the current column, and another column or outer close follows
          cols.push(currentCol);
          currentCol = null;
          i++;
          continue;
        } else {
          // This closes the entire columns container
          if (currentCol) {
            cols.push(currentCol);
            currentCol = null;
          }
          i++;
          break;
        }
      }

      // Otherwise it's regular content inside the columns block
      if (!currentCol) {
        currentCol = { attrs: '', lines: [] };
      }
      currentCol.lines.push(curLine);
      i++;
    }

    if (currentCol) {
      cols.push(currentCol);
    }

    // Render columns to HTML
    const renderedColsHtml = cols
      .filter((col) => col.lines.some((l) => l.trim().length > 0))
      .map((col) => {
        const colMd = col.lines.join('\n').trim();
        let colHtml = '';
        try {
          colHtml = (marked.parse(colMd) as string).trim();
        } catch {
          colHtml = escapeHtml(colMd);
        }

        let customStyle = '';
        let flexClass = 'flex-1';
        if (col.attrs) {
          const pctMatch = col.attrs.match(/(\d+(?:\.\d+)?%)/);
          if (pctMatch) {
            customStyle = `flex: 0 0 ${pctMatch[1]}; max-width: ${pctMatch[1]};`;
            flexClass = '';
          } else if (/^\d+$/.test(col.attrs)) {
            customStyle = `flex: ${col.attrs} ${col.attrs} 0%;`;
            flexClass = '';
          }
        }

        return `<div class="slide-col ${flexClass} min-w-0" ${customStyle ? `style="${customStyle}"` : ''}>\n${colHtml}\n</div>`;
      })
      .join('\n');

    const blockId = columnBlocks.length;
    const finalColumnsHtml = `<div class="slide-columns flex flex-col md:flex-row gap-6 my-4 w-full items-start ${containerAttrs}">\n${renderedColsHtml}\n</div>`;
    columnBlocks.push(finalColumnsHtml);

    resultLines.push(`\n<!-- __SLIDE_COLUMNS_BLOCK_${blockId}__ -->\n`);
  }

  return {
    content: resultLines.join('\n'),
    columnBlocks,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Updates or sets a slide-level text color directive (<!-- color: ... -->) in markdown
 */
export function setSlideTextColorInMarkdown(
  markdown: string,
  slideIndex: number,
  color: string | null
): string {
  const lines = markdown.split('\n');
  const sections: { startIndex: number; endIndex: number; lines: string[] }[] = [];
  let currentStart = 0;
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('```')) inCode = !inCode;
    if (!inCode && (line === '---' || line === '--')) {
      sections.push({
        startIndex: currentStart,
        endIndex: i,
        lines: lines.slice(currentStart, i),
      });
      currentStart = i + 1;
    }
  }
  sections.push({
    startIndex: currentStart,
    endIndex: lines.length,
    lines: lines.slice(currentStart),
  });

  const target = sections[slideIndex];
  if (!target) return markdown;

  // Filter out any existing <!-- color: ... --> or <!-- text-color: ... -->
  const filteredLines = target.lines.filter(
    (l) => !l.match(/<!--\s*(?:text-)?color:\s*([^\s>]+)\s*-->/i)
  );

  if (color) {
    // Insert new directive at the start of the slide
    filteredLines.unshift(`<!-- color: ${color} -->`);
  }

  // Re-assemble the markdown
  const beforeLines = lines.slice(0, target.startIndex);
  const afterLines = lines.slice(target.endIndex);

  // If there was a separator line at target.endIndex
  if (target.endIndex < lines.length) {
    const sepLine = lines[target.endIndex];
    return [...beforeLines, ...filteredLines, sepLine, ...afterLines.slice(1)].join('\n');
  } else {
    return [...beforeLines, ...filteredLines].join('\n');
  }
}

/**
 * Wraps text snippet in <span style="color: COLOR">text</span> inside markdown
 */
export function wrapTextWithColor(
  markdown: string,
  textToColorize: string,
  color: string
): string {
  if (!textToColorize || !textToColorize.trim()) return markdown;
  const trimmed = textToColorize.trim();
  const wrapped = `<span style="color: ${color}">${trimmed}</span>`;
  return markdown.replace(trimmed, wrapped);
}
