export interface SlideBlock {
  id: string;
  type:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'list'
    | 'quote'
    | 'callout'
    | 'code'
    | 'mermaid'
    | 'table'
    | 'directive'
    | 'notes'
    | 'other';
  raw: string;
  text: string;
  listPrefix?: string;
  calloutHeader?: string;
  startLine: number;
  endLine: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
}

export interface SlideBounds {
  startLine: number;
  endLine: number;
  slideMarkdown: string;
  beforeLines: string[];
  afterLines: string[];
  delimiter: string;
}

export interface ActiveFormattingState {
  blockType: SlideBlock['type'];
  tagLabel: string;
  isBold: boolean;
  isExplicitBold: boolean;
  isItalic: boolean;
  isExplicitItalic: boolean;
  isStrike: boolean;
  isCode: boolean;
  color: string | null;
  computedColor: string;
  fontSize: string;
  fontWeight: string;
  selectedText: string;
}

/**
 * Converts CSS rgb/rgba or 3-digit hex strings to standard 6-digit lowercase hex (#rrggbb).
 */
export function normalizeCssColorToHex(colorStr: string | null | undefined): string | null {
  if (!colorStr) return null;
  const trimmed = colorStr.trim().toLowerCase();
  if (!trimmed || trimmed === 'inherit' || trimmed === 'initial' || trimmed === 'transparent') {
    return null;
  }

  if (trimmed.startsWith('#')) {
    if (trimmed.length === 4) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return trimmed;
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10)))
      .toString(16)
      .padStart(2, '0');
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10)))
      .toString(16)
      .padStart(2, '0');
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10)))
      .toString(16)
      .padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  return trimmed;
}

/**
 * Strips Markdown tokens and HTML tags so we can compare plain text against DOM innerText.
 */
export function stripFormattingForMatch(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/\*([\s\S]*?)\*/g, '$1')
    .replace(/~~([\s\S]*?)~~/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^(\*|-|\+|\d+\.)\s+/, '')
    .replace(/^>\s*(\[!(?:NOTE|TIP|WARNING|IMPORTANT)\]\s*)?/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Wraps non-whitespace core content with a Markdown token while keeping leading/trailing spaces outside.
 */
function wrapMarkdownTokenPreservingSpaces(text: string, token: string): string {
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return text;
  const [, leading, core, trailing] = match;
  if (core.startsWith(token) && core.endsWith(token) && core.length > token.length * 2) {
    return text;
  }
  return `${leading}${token}${core}${token}${trailing}`;
}

/**
 * Recursively serializes a live DOM element's child nodes into clean inline Markdown.
 * Preserves sibling formatting (bold, italic, strike, code, color spans, links) accurately.
 */
export function domNodeToInlineMarkdown(rootEl: HTMLElement): string {
  function serializeNode(node: Node, prevSiblingWasBr: boolean): string {
    if (node.nodeType === Node.TEXT_NODE) {
      let txt = (node.textContent || '').replace(/\u00a0/g, ' ');
      if (prevSiblingWasBr) {
        txt = txt.replace(/^\r?\n+/, '');
      }
      // HTML text node newlines (outside <pre>/<code>) are layout whitespace, not semantic line breaks
      txt = txt.replace(/\r?\n/g, ' ');
      return txt;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') {
      return '  \n';
    }

    // Inline code element
    if (tag === 'code') {
      const codeText = (el.textContent || '').replace(/\u00a0/g, ' ');
      if (!codeText) return '';
      let res = wrapMarkdownTokenPreservingSpaces(codeText, '`');
      const inlineColor = normalizeCssColorToHex(el.style.color || el.getAttribute('color'));
      if (inlineColor) {
        res = `<span style="color: ${inlineColor}">${res}</span>`;
      }
      return res;
    }

    let inner = serializeChildren(el);
    if (!inner) return '';

    const isBoldTag =
      tag === 'strong' ||
      tag === 'b' ||
      el.style.fontWeight === 'bold' ||
      Number(el.style.fontWeight) >= 700;
    const isItalicTag = tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
    const isStrikeTag =
      tag === 'del' ||
      tag === 's' ||
      tag === 'strike' ||
      (el.style.textDecoration && el.style.textDecoration.includes('line-through'));

    if (isStrikeTag) {
      inner = wrapMarkdownTokenPreservingSpaces(inner, '~~');
    }
    if (isItalicTag) {
      inner = wrapMarkdownTokenPreservingSpaces(inner, '*');
    }
    if (isBoldTag) {
      inner = wrapMarkdownTokenPreservingSpaces(inner, '**');
    }

    if (tag === 'a') {
      const href = el.getAttribute('href') || '#';
      inner = `[${inner}](${href})`;
    }

    const rawColor = el.style.color || el.getAttribute('color');
    const hexColor = normalizeCssColorToHex(rawColor);
    if (hexColor) {
      // Avoid double-wrapping if inner is already a single outer color span
      const singleSpanMatch = inner.match(
        /^(\s*)<span\s+style="color:\s*[^"]+">([\s\S]*?)<\/span>(\s*)$/i
      );
      if (singleSpanMatch && !singleSpanMatch[2].includes('<span')) {
        inner = `${singleSpanMatch[1]}<span style="color: ${hexColor}">${singleSpanMatch[2]}</span>${singleSpanMatch[3]}`;
      } else {
        const spaceMatch = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
        if (spaceMatch && spaceMatch[2]) {
          inner = `${spaceMatch[1]}<span style="color: ${hexColor}">${spaceMatch[2]}</span>${spaceMatch[3]}`;
        }
      }
    }

    if (tag === 'div' || tag === 'p') {
      return `\n${inner}`;
    }

    return inner;
  }

  function serializeChildren(parent: HTMLElement): string {
    let result = '';
    const children = Array.from(parent.childNodes);
    for (let i = 0; i < children.length; i++) {
      const prevNode = i > 0 ? children[i - 1] : null;
      const prevWasBr =
        Boolean(prevNode && prevNode.nodeType === Node.ELEMENT_NODE && (prevNode as HTMLElement).tagName.toLowerCase() === 'br');
      result += serializeNode(children[i], prevWasBr);
    }
    return result;
  }

  let markdown = serializeChildren(rootEl)
    .replace(/\n{2,}/g, '  \n')
    .trim();

  // Check if rootEl itself was given an inline style.color directly
  const rootInlineColor = normalizeCssColorToHex(rootEl.style.color);
  if (rootInlineColor && markdown) {
    const singleSpanMatch = markdown.match(/^<span\s+style="color:\s*[^"]+">([\s\S]*?)<\/span>$/i);
    if (singleSpanMatch && !singleSpanMatch[1].includes('<span')) {
      markdown = `<span style="color: ${rootInlineColor}">${singleSpanMatch[1]}</span>`;
    } else if (!markdown.startsWith('<span style="color:')) {
      markdown = `<span style="color: ${rootInlineColor}">${markdown}</span>`;
    }
  }

  return markdown;
}

/**
 * Legacy helper kept for compatibility: parses an HTML string via a temporary element.
 */
export function htmlToInlineMarkdown(html: string): string {
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return domNodeToInlineMarkdown(temp);
  }
  return html.trim();
}

/**
 * Finds the closest ancestor matching any of the given tag names between `node` and `boundaryEl`.
 */
function findClosestInlineAncestor(
  node: Node | null,
  boundaryEl: HTMLElement,
  tagNames: string[]
): HTMLElement | null {
  let curr: Node | null = node;
  const tagSet = new Set(tagNames.map((t) => t.toLowerCase()));
  while (curr && curr !== boundaryEl) {
    if (curr.nodeType === Node.ELEMENT_NODE) {
      const el = curr as HTMLElement;
      if (tagSet.has(el.tagName.toLowerCase())) {
        return el;
      }
    }
    curr = curr.parentNode;
  }
  return null;
}

/**
 * Finds the closest ancestor with an explicit inline color between `node` and `boundaryEl`.
 */
function findClosestColorAncestor(node: Node | null, boundaryEl: HTMLElement): HTMLElement | null {
  let curr: Node | null = node;
  while (curr && curr !== boundaryEl) {
    if (curr.nodeType === Node.ELEMENT_NODE) {
      const el = curr as HTMLElement;
      if (el.style?.color || el.getAttribute('color')) {
        return el;
      }
    }
    curr = curr.parentNode;
  }
  return null;
}

/**
 * Unwraps an element in the DOM, replacing it with its child nodes.
 */
function unwrapDomElement(el: HTMLElement): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

/**
 * Inspects the current formatting of the active DOM element and any active text selection inside it.
 * Used to display live formatting state (Block Type, Bold, Italic, Strike, Code, Color, Font Size) in the toolbar.
 */
export function inspectDomFormatting(
  editableEl: HTMLElement,
  block: SlideBlock | null
): ActiveFormattingState {
  const tag = editableEl.tagName.toLowerCase();
  const blockType: SlideBlock['type'] =
    block?.type ||
    (tag === 'h1'
      ? 'h1'
      : tag === 'h2'
      ? 'h2'
      : tag === 'h3'
      ? 'h3'
      : tag === 'h4'
      ? 'h4'
      : tag === 'li'
      ? 'list'
      : tag === 'blockquote'
      ? 'quote'
      : 'p');

  const tagLabels: Record<string, string> = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    p: 'Paragraph',
    list: 'Bullet List',
    quote: 'Quote Block',
    callout: 'Callout Box',
    code: 'Code Block',
    mermaid: 'Mermaid Diagram',
    table: 'Table',
  };

  const sel = typeof window !== 'undefined' ? window.getSelection() : null;
  let targetNode: Node = editableEl;
  let selectedText = '';

  if (sel && sel.rangeCount > 0 && editableEl.contains(sel.anchorNode)) {
    targetNode = sel.anchorNode!;
    if (!sel.isCollapsed && editableEl.contains(sel.focusNode)) {
      selectedText = sel.toString().trim();
      // If selection starts at an element node, inspect the first text node inside the range
      const range = sel.getRangeAt(0);
      if (range.commonAncestorContainer && editableEl.contains(range.commonAncestorContainer)) {
        targetNode = range.startContainer;
      }
    }
  }

  const targetElement =
    targetNode.nodeType === Node.ELEMENT_NODE
      ? (targetNode as HTMLElement)
      : targetNode.parentElement || editableEl;

  // Check explicit inline tags around the selection or entire element
  const hasStrongAncestor = Boolean(findClosestInlineAncestor(targetNode, editableEl, ['strong', 'b']));
  const hasEmAncestor = Boolean(findClosestInlineAncestor(targetNode, editableEl, ['em', 'i']));
  const hasStrikeAncestor = Boolean(
    findClosestInlineAncestor(targetNode, editableEl, ['del', 's', 'strike'])
  );
  const hasCodeAncestor = Boolean(findClosestInlineAncestor(targetNode, editableEl, ['code']));
  const colorAncestor = findClosestColorAncestor(targetNode, editableEl);

  // Also check if the whole editableEl has a single wrapper child when selection is on editableEl itself
  const onlyChild =
    editableEl.children.length === 1 &&
    editableEl.children[0].textContent?.trim() === editableEl.textContent?.trim()
      ? (editableEl.children[0] as HTMLElement)
      : null;

  const isExplicitBold =
    hasStrongAncestor ||
    Boolean(editableEl.querySelector('strong, b') && editableEl.querySelector('strong, b')?.textContent?.trim() === editableEl.textContent?.trim());
  const isExplicitItalic =
    hasEmAncestor ||
    Boolean(editableEl.querySelector('em, i') && editableEl.querySelector('em, i')?.textContent?.trim() === editableEl.textContent?.trim());
  const isStrike =
    hasStrikeAncestor ||
    Boolean(editableEl.querySelector('del, s, strike') && editableEl.querySelector('del, s, strike')?.textContent?.trim() === editableEl.textContent?.trim());
  const isCode =
    hasCodeAncestor ||
    Boolean(editableEl.querySelector('code') && editableEl.querySelector('code')?.textContent?.trim() === editableEl.textContent?.trim());

  let explicitColor: string | null = null;
  if (colorAncestor) {
    explicitColor = normalizeCssColorToHex(
      colorAncestor.style.color || colorAncestor.getAttribute('color')
    );
  } else if (editableEl.style.color) {
    explicitColor = normalizeCssColorToHex(editableEl.style.color);
  } else if (onlyChild && (onlyChild.style.color || onlyChild.getAttribute('color'))) {
    explicitColor = normalizeCssColorToHex(onlyChild.style.color || onlyChild.getAttribute('color'));
  } else {
    // Check if there is a top-level span[style*="color"] wrapping the element's text
    const colorSpan = editableEl.querySelector('span[style*="color"]') as HTMLElement | null;
    if (colorSpan && colorSpan.textContent?.trim() === editableEl.textContent?.trim()) {
      explicitColor = normalizeCssColorToHex(colorSpan.style.color);
    }
  }

  let computedColor = '#f1f5f9';
  let fontSize = '18px';
  let fontWeight = '400';
  let isComputedBold = false;
  let isComputedItalic = false;

  if (typeof window !== 'undefined') {
    const computed = window.getComputedStyle(targetElement);
    computedColor = normalizeCssColorToHex(computed.color) || '#f1f5f9';
    fontSize = `${Math.round(parseFloat(computed.fontSize) || 16)}px`;
    fontWeight = computed.fontWeight || '400';
    isComputedBold = fontWeight === 'bold' || Number(fontWeight) >= 650;
    isComputedItalic = computed.fontStyle === 'italic';
  }

  return {
    blockType,
    tagLabel: tagLabels[blockType] || tag.toUpperCase(),
    isBold: isExplicitBold || isComputedBold,
    isExplicitBold,
    isItalic: isExplicitItalic || isComputedItalic,
    isExplicitItalic,
    isStrike,
    isCode,
    color: explicitColor,
    computedColor: explicitColor || computedColor,
    fontSize,
    fontWeight,
    selectedText,
  };
}

/**
 * Applies or toggles Bold, Italic, Strikethrough, or Code directly on the live DOM inside `editableEl`
 * without corrupting sibling formatted elements on the same line.
 */
export function applyDomInlineFormat(
  editableEl: HTMLElement,
  format: 'bold' | 'italic' | 'strike' | 'code'
): void {
  const tagMap: Record<typeof format, { create: string; match: string[] }> = {
    bold: { create: 'strong', match: ['strong', 'b'] },
    italic: { create: 'em', match: ['em', 'i'] },
    strike: { create: 'del', match: ['del', 's', 'strike'] },
    code: { create: 'code', match: ['code'] },
  };

  const { create, match } = tagMap[format];
  const sel = window.getSelection();

  // Case 1: User highlighted a specific non-collapsed range inside editableEl
  if (
    sel &&
    sel.rangeCount > 0 &&
    !sel.isCollapsed &&
    editableEl.contains(sel.anchorNode) &&
    editableEl.contains(sel.focusNode) &&
    sel.toString().trim().length > 0 &&
    sel.toString().trim().length < (editableEl.textContent || '').trim().length
  ) {
    const range = sel.getRangeAt(0);
    const existingAncestor =
      findClosestInlineAncestor(range.startContainer, editableEl, match) ||
      findClosestInlineAncestor(range.endContainer, editableEl, match);

    if (existingAncestor && existingAncestor.textContent?.trim() === sel.toString().trim()) {
      // Unwrap the existing tag and re-select its contents
      const parent = existingAncestor.parentNode;
      unwrapDomElement(existingAncestor);
      if (parent) {
        parent.normalize();
      }
      return;
    }

    // Wrap the selected range in the new inline element
    const fragment = range.extractContents();
    // Unwrap any nested identical tags inside fragment to prevent duplicate nesting
    match.forEach((mTag) => {
      fragment.querySelectorAll(mTag).forEach((nested) => unwrapDomElement(nested as HTMLElement));
    });

    const wrapper = document.createElement(create);
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);

    // Keep the newly formatted text selected
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(newRange);
    return;
  }

  // Case 2: Cursor is collapsed inside a specific inline tag (e.g. clicking inside a bold word in a sentence)
  if (sel && sel.rangeCount > 0 && sel.isCollapsed && editableEl.contains(sel.anchorNode)) {
    const existingAncestor = findClosestInlineAncestor(sel.anchorNode, editableEl, match);
    if (existingAncestor) {
      unwrapDomElement(existingAncestor);
      editableEl.normalize();
      return;
    }
  }

  // Case 3: Toggle the format across the entire editableEl
  const fullMatchingElements = Array.from(editableEl.querySelectorAll(match.join(','))).filter(
    (el) => el.textContent?.trim() === editableEl.textContent?.trim()
  );

  if (fullMatchingElements.length > 0) {
    fullMatchingElements.forEach((el) => unwrapDomElement(el as HTMLElement));
    editableEl.normalize();
  } else {
    const wrapper = document.createElement(create);
    while (editableEl.firstChild) {
      wrapper.appendChild(editableEl.firstChild);
    }
    editableEl.appendChild(wrapper);
  }
}

/**
 * Applies or resets text color on the selected range or entire `editableEl` in the DOM
 * without corrupting sibling elements on the same line.
 */
export function applyDomColorFormat(editableEl: HTMLElement, color: string | null): void {
  const sel = window.getSelection();

  // Case 1: User highlighted a specific substring inside editableEl
  if (
    sel &&
    sel.rangeCount > 0 &&
    !sel.isCollapsed &&
    editableEl.contains(sel.anchorNode) &&
    editableEl.contains(sel.focusNode) &&
    sel.toString().trim().length > 0 &&
    sel.toString().trim().length < (editableEl.textContent || '').trim().length
  ) {
    const range = sel.getRangeAt(0);
    const existingColorAncestor =
      findClosestColorAncestor(range.startContainer, editableEl) ||
      findClosestColorAncestor(range.endContainer, editableEl);

    if (existingColorAncestor && existingColorAncestor.textContent?.trim() === sel.toString().trim()) {
      if (!color) {
        existingColorAncestor.style.removeProperty('color');
        existingColorAncestor.removeAttribute('color');
        if (
          existingColorAncestor.tagName.toLowerCase() === 'span' &&
          !existingColorAncestor.getAttribute('style')
        ) {
          unwrapDomElement(existingColorAncestor);
        }
      } else {
        existingColorAncestor.style.color = color;
      }
      return;
    }

    if (!color) return;

    const fragment = range.extractContents();
    // Remove conflicting nested color styles inside the selected fragment
    fragment.querySelectorAll('[style*="color"], font[color]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.removeProperty('color');
      htmlEl.removeAttribute('color');
      if (htmlEl.tagName.toLowerCase() === 'span' && !htmlEl.getAttribute('style')) {
        unwrapDomElement(htmlEl);
      }
    });

    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(fragment);
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
    return;
  }

  // Case 2: Cursor is collapsed inside a colored phrase smaller than the whole block
  if (sel && sel.rangeCount > 0 && sel.isCollapsed && editableEl.contains(sel.anchorNode)) {
    const existingColorAncestor = findClosestColorAncestor(sel.anchorNode, editableEl);
    if (
      existingColorAncestor &&
      existingColorAncestor.textContent?.trim() !== editableEl.textContent?.trim()
    ) {
      if (!color) {
        existingColorAncestor.style.removeProperty('color');
        existingColorAncestor.removeAttribute('color');
        if (
          existingColorAncestor.tagName.toLowerCase() === 'span' &&
          !existingColorAncestor.getAttribute('style')
        ) {
          unwrapDomElement(existingColorAncestor);
        }
      } else {
        existingColorAncestor.style.color = color;
      }
      return;
    }
  }

  // Case 3: Apply or reset color on the entire block
  editableEl.style.removeProperty('color');
  editableEl.querySelectorAll('[style*="color"], font[color]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.removeProperty('color');
    htmlEl.removeAttribute('color');
    if (htmlEl.tagName.toLowerCase() === 'span' && !htmlEl.getAttribute('style')) {
      unwrapDomElement(htmlEl);
    }
  });

  if (color) {
    const span = document.createElement('span');
    span.style.color = color;
    while (editableEl.firstChild) {
      span.appendChild(editableEl.firstChild);
    }
    editableEl.appendChild(span);
  }
}

/**
 * Finds the line boundaries and content of a target slide within the full markdown presentation.
 */
export function getSlideBounds(fullMarkdown: string, slideIndex: number): SlideBounds | null {
  const lines = fullMarkdown.replace(/\r\n/g, '\n').split('\n');
  const sections: { startLine: number; endLine: number; lines: string[]; delimiter: string }[] = [];

  let currentStart = 0;
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('```')) {
      inCode = !inCode;
    }

    if (!inCode && (trimmed === '---' || trimmed === '--')) {
      sections.push({
        startLine: currentStart,
        endLine: i,
        lines: lines.slice(currentStart, i),
        delimiter: trimmed,
      });
      currentStart = i + 1;
    }
  }

  sections.push({
    startLine: currentStart,
    endLine: lines.length,
    lines: lines.slice(currentStart),
    delimiter: '',
  });

  const target = sections[slideIndex];
  if (!target) return null;

  const beforeLines = lines.slice(0, target.startLine);
  const afterLines = target.endLine < lines.length ? lines.slice(target.endLine) : [];

  return {
    startLine: target.startLine,
    endLine: target.endLine,
    slideMarkdown: target.lines.join('\n'),
    beforeLines,
    afterLines,
    delimiter: target.delimiter,
  };
}

/**
 * Reassembles the full presentation markdown with an updated slide markdown.
 */
export function replaceSlideInPresentation(
  fullMarkdown: string,
  slideIndex: number,
  newSlideMarkdown: string
): string {
  const bounds = getSlideBounds(fullMarkdown, slideIndex);
  if (!bounds) return fullMarkdown;

  const newSlideLines = newSlideMarkdown.split('\n');
  const parts: string[] = [];

  if (bounds.beforeLines.length > 0) {
    parts.push(bounds.beforeLines.join('\n'));
  }

  parts.push(newSlideLines.join('\n'));

  if (bounds.afterLines.length > 0) {
    parts.push(bounds.afterLines.join('\n'));
  }

  return parts.join('\n');
}

/**
 * Surgically replaces ONLY the lines belonging to `targetBlock` (`startLine`..`endLine`)
 * in `slideMarkdown`, leaving all other lines, blank lines, tables, columns, and blocks 100% untouched!
 */
export function replaceBlockInSlideMarkdown(
  slideMarkdown: string,
  targetBlock: SlideBlock,
  newBlockMarkdown: string
): string {
  const lines = slideMarkdown.replace(/\r\n/g, '\n').split('\n');
  const before = lines.slice(0, targetBlock.startLine);
  const after = lines.slice(targetBlock.endLine);
  return [...before, newBlockMarkdown, ...after].join('\n');
}

/**
 * Checks if a trimmed line is a structural directive, container fence, or non-paragraph boundary.
 */
function isSpecialBoundaryLine(trimmed: string): boolean {
  if (!trimmed) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('```')) return true;
  if (trimmed.startsWith('>')) return true;
  if (trimmed.startsWith('<!--')) return true;
  if (trimmed.startsWith(':::')) return true;
  if (trimmed.startsWith('|')) return true;
  if (trimmed.startsWith('$$')) return true;
  if (/^<\/?(?:div|section|table|thead|tbody|tr|td|th|ul|ol|li|blockquote)\b/i.test(trimmed)) {
    return true;
  }
  if (trimmed.toLowerCase().startsWith('note:')) return true;
  if (/^(\*|-|\+|\d+\.)\s/.test(trimmed)) return true;
  return false;
}

/**
 * Parses a single slide's markdown into structured, editable blocks with exact line ranges.
 * Preserves `:::columns`, `:::fragment`, tables, callouts, and HTML containers without flattening them.
 */
export function parseSlideToBlocks(slideMarkdown: string): SlideBlock[] {
  const lines = slideMarkdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: SlideBlock[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines between blocks
    if (!trimmed) {
      i++;
      continue;
    }

    // HTML comments or :::columns / :::column / :::fragment / ::: fences or structural HTML tags
    if (
      (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) ||
      trimmed.startsWith(':::') ||
      /^<\/?(?:div|section)\b/i.test(trimmed)
    ) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'directive',
        raw: line,
        text: trimmed,
        startLine: i,
        endLine: i + 1,
      });
      i++;
      continue;
    }

    // Speaker Notes
    if (trimmed.toLowerCase().startsWith('note:')) {
      const startLine = i;
      const noteLines = [line];
      i++;
      while (i < lines.length) {
        noteLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'notes',
        raw: noteLines.join('\n'),
        text: noteLines.slice(1).join('\n').trim(),
        startLine,
        endLine: i,
      });
      continue;
    }

    // Code blocks / Mermaid diagrams
    if (trimmed.startsWith('```')) {
      const isMermaid = trimmed.startsWith('```mermaid');
      const startLine = i;
      const codeLines = [line];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `block-${blockIndex++}`,
        type: isMermaid ? 'mermaid' : 'code',
        raw: codeLines.join('\n'),
        text: codeLines.slice(1, -1).join('\n'),
        startLine,
        endLine: i,
      });
      continue;
    }

    // Markdown Tables
    if (trimmed.startsWith('|')) {
      const startLine = i;
      const tableLines = [line];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'table',
        raw: tableLines.join('\n'),
        text: tableLines.join('\n'),
        startLine,
        endLine: i,
      });
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingType = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
        blocks.push({
          id: `block-${blockIndex++}`,
          type: headingType,
          raw: line,
          text: match[2],
          startLine: i,
          endLine: i + 1,
        });
        i++;
        continue;
      }
    }

    // Blockquote or Callout (> [!NOTE], > [!TIP], etc.)
    if (trimmed.startsWith('>')) {
      const startLine = i;
      const quoteLines = [line];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i]);
        i++;
      }
      const firstLineClean = quoteLines[0].replace(/^\s*>\s?/, '').trim();
      const calloutMatch = firstLineClean.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT)\]/i);
      if (calloutMatch && quoteLines.length > 1) {
        const bodyClean = quoteLines
          .slice(1)
          .map((l) => l.replace(/^\s*>\s?/, ''))
          .join('\n');
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'callout',
          calloutHeader: `> [!${calloutMatch[1].toUpperCase()}]`,
          raw: quoteLines.join('\n'),
          text: bodyClean,
          startLine,
          endLine: i,
        });
      } else {
        const cleaned = quoteLines.map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'quote',
          raw: quoteLines.join('\n'),
          text: cleaned,
          startLine,
          endLine: i,
        });
      }
      continue;
    }

    // Individual List Item (bullet or numbered)
    const listMatch = line.match(/^(\s*(?:\*|-|\+|\d+\.)\s+)(.*)$/);
    if (listMatch) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'list',
        listPrefix: listMatch[1],
        raw: line,
        text: listMatch[2],
        startLine: i,
        endLine: i + 1,
      });
      i++;
      continue;
    }

    // Regular Paragraphs
    const startLine = i;
    const pLines = [line];
    i++;
    while (i < lines.length && !isSpecialBoundaryLine(lines[i].trim())) {
      pLines.push(lines[i]);
      i++;
    }

    blocks.push({
      id: `block-${blockIndex++}`,
      type: 'p',
      raw: pLines.join('\n'),
      text: pLines.join('\n'),
      startLine,
      endLine: i,
    });
  }

  return blocks;
}

/**
 * Converts a SlideBlock back to its raw Markdown string representation.
 */
export function serializeBlockToMarkdown(block: SlideBlock): string {
  switch (block.type) {
    case 'h1':
      return `# ${block.text.replace(/\s*\n\s*/g, ' ').trim()}`;
    case 'h2':
      return `## ${block.text.replace(/\s*\n\s*/g, ' ').trim()}`;
    case 'h3':
      return `### ${block.text.replace(/\s*\n\s*/g, ' ').trim()}`;
    case 'h4':
      return `#### ${block.text.replace(/\s*\n\s*/g, ' ').trim()}`;
    case 'quote':
      return block.text
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n');
    case 'callout':
      return [
        block.calloutHeader || '> [!NOTE]',
        ...block.text.split('\n').map((l) => `> ${l}`),
      ].join('\n');
    case 'p':
      return block.text;
    case 'list': {
      const prefix = block.listPrefix || '- ';
      return block.text
        .split('\n')
        .map((l) => (l.trim() ? `${prefix}${l.trim()}` : l))
        .join('\n');
    }
    case 'code':
    case 'mermaid':
    case 'table':
    case 'directive':
      return block.raw;
    case 'notes':
      return `Note:\n${block.text}`;
    default:
      return block.raw;
  }
}

/**
 * Reassembles an array of SlideBlocks into a slide Markdown string (fallback helper).
 */
export function serializeBlocksToSlide(blocks: SlideBlock[]): string {
  if (blocks.length === 0) return '';
  const serialized: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const current = serializeBlockToMarkdown(blocks[i]);
    if (i === 0) {
      serialized.push(current);
    } else {
      const prevType = blocks[i - 1].type;
      const currType = blocks[i].type;
      if (prevType === 'list' && currType === 'list') {
        serialized.push('\n' + current);
      } else {
        serialized.push('\n\n' + current);
      }
    }
  }

  return serialized.join('');
}

/**
 * Surgically changes a single block's type in `slideMarkdown` without touching any other lines on the slide.
 */
export function changeBlockTypeInSlide(
  slideMarkdown: string,
  blocks: SlideBlock[],
  blockIndex: number,
  newType: 'h1' | 'h2' | 'h3' | 'p' | 'quote' | 'list'
): string {
  if (blockIndex < 0 || blockIndex >= blocks.length) return slideMarkdown;

  const target = { ...blocks[blockIndex] };
  if (newType === 'list') {
    target.type = 'list';
    target.listPrefix = target.listPrefix || '- ';
  } else {
    target.type = newType;
  }

  const newBlockMd = serializeBlockToMarkdown(target);
  return replaceBlockInSlideMarkdown(slideMarkdown, blocks[blockIndex], newBlockMd);
}

/**
 * Legacy wrapper for changeBlockType
 */
export function changeBlockType(
  blocks: SlideBlock[],
  blockIndex: number,
  newType: 'h1' | 'h2' | 'h3' | 'p' | 'quote' | 'list'
): string {
  if (blockIndex < 0 || blockIndex >= blocks.length) return serializeBlocksToSlide(blocks);
  const updated = [...blocks];
  const target = { ...updated[blockIndex] };
  if (newType === 'list') {
    target.type = 'list';
    target.listPrefix = target.listPrefix || '- ';
  } else {
    target.type = newType;
  }
  target.raw = serializeBlockToMarkdown(target);
  updated[blockIndex] = target;
  return serializeBlocksToSlide(updated);
}

/**
 * Surgically swaps two blocks in `slideMarkdown` by their line ranges, preserving all other lines verbatim.
 */
export function reorderBlocksInSlideMarkdown(
  slideMarkdown: string,
  blocks: SlideBlock[],
  fromIndex: number,
  toIndex: number
): string {
  if (
    fromIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex < 0 ||
    toIndex >= blocks.length ||
    fromIndex === toIndex
  ) {
    return slideMarkdown;
  }

  const lines = slideMarkdown.replace(/\r\n/g, '\n').split('\n');
  const firstIdx = Math.min(fromIndex, toIndex);
  const secondIdx = Math.max(fromIndex, toIndex);

  const firstBlock = blocks[firstIdx];
  const secondBlock = blocks[secondIdx];

  const beforeFirst = lines.slice(0, firstBlock.startLine);
  const firstLines = lines.slice(firstBlock.startLine, firstBlock.endLine);
  const middleLines = lines.slice(firstBlock.endLine, secondBlock.startLine);
  const secondLines = lines.slice(secondBlock.startLine, secondBlock.endLine);
  const afterSecond = lines.slice(secondBlock.endLine);

  return [
    ...beforeFirst,
    ...secondLines,
    ...middleLines,
    ...firstLines,
    ...afterSecond,
  ].join('\n');
}

/**
 * Moves a block up or down while skipping over structural `directive` fences (`:::columns`, `:::column`, `:::`)
 * and `notes` blocks so column/fragment fences are never corrupted.
 */
export function moveBlockInSlideMarkdown(
  slideMarkdown: string,
  blocks: SlideBlock[],
  fromIndex: number,
  direction: 'up' | 'down'
): { newSlideMarkdown: string; newBlockIndex: number } {
  const step = direction === 'up' ? -1 : 1;
  let targetIdx = fromIndex + step;

  while (
    targetIdx >= 0 &&
    targetIdx < blocks.length &&
    (blocks[targetIdx].type === 'directive' || blocks[targetIdx].type === 'notes')
  ) {
    targetIdx += step;
  }

  if (targetIdx < 0 || targetIdx >= blocks.length) {
    return { newSlideMarkdown: slideMarkdown, newBlockIndex: fromIndex };
  }

  const newSlideMarkdown = reorderBlocksInSlideMarkdown(
    slideMarkdown,
    blocks,
    fromIndex,
    targetIdx
  );
  return { newSlideMarkdown, newBlockIndex: targetIdx };
}

/**
 * Surgically inserts a new block into `slideMarkdown` right after `afterIndex`.
 */
export function insertBlockInSlideMarkdown(
  slideMarkdown: string,
  blocks: SlideBlock[],
  afterIndex: number,
  blockType: 'h1' | 'h2' | 'p' | 'list' | 'quote'
): string {
  let newBlockMd = 'Type your new slide text here...';
  switch (blockType) {
    case 'h1':
      newBlockMd = '# New Heading 1';
      break;
    case 'h2':
      newBlockMd = '## New Section Subtitle';
      break;
    case 'list':
      newBlockMd = '- New bullet point';
      break;
    case 'quote':
      newBlockMd = '> Inspiring takeaway or quote';
      break;
    default:
      newBlockMd = 'Type your new slide text here...';
  }

  const lines = slideMarkdown.replace(/\r\n/g, '\n').split('\n');
  if (afterIndex >= 0 && afterIndex < blocks.length) {
    const targetBlock = blocks[afterIndex];
    const before = lines.slice(0, targetBlock.endLine);
    const after = lines.slice(targetBlock.endLine);
    const separator = targetBlock.type === 'list' && blockType === 'list' ? [newBlockMd] : ['', newBlockMd];
    return [...before, ...separator, ...after].join('\n');
  }

  return [...lines, '', newBlockMd].join('\n');
}

/**
 * Surgically deletes a single block's lines from `slideMarkdown` without altering any other blocks.
 */
export function deleteBlockFromSlideMarkdown(
  slideMarkdown: string,
  blocks: SlideBlock[],
  blockIndex: number
): string {
  if (blockIndex < 0 || blockIndex >= blocks.length) return slideMarkdown;
  const target = blocks[blockIndex];
  const lines = slideMarkdown.replace(/\r\n/g, '\n').split('\n');
  const before = lines.slice(0, target.startLine);
  const after = lines.slice(target.endLine);
  // If deleting leaves two consecutive blank lines, collapse one blank line cleanly
  if (before.length > 0 && after.length > 0 && before[before.length - 1].trim() === '' && after[0].trim() === '') {
    after.shift();
  }
  return [...before, ...after].join('\n');
}
