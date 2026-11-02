import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  parseSlideToBlocks,
  getSlideBounds,
  replaceSlideInPresentation,
  replaceBlockInSlideMarkdown,
  serializeBlockToMarkdown,
  changeBlockTypeInSlide,
  moveBlockInSlideMarkdown,
  insertBlockInSlideMarkdown,
  deleteBlockFromSlideMarkdown,
  domNodeToInlineMarkdown,
  applyDomInlineFormat,
  applyDomColorFormat,
  inspectDomFormatting,
  stripFormattingForMatch,
  SlideBlock,
  ActiveFormattingState,
} from '../utils/slideBlockParser';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';

interface VisualSlideOverlayProps {
  slideIndex: number;
  markdown: string;
  onUpdateMarkdown?: (newMarkdown: string, immediate?: boolean) => void;
  slideContainerRef: React.RefObject<HTMLDivElement | null>;
  isLightBg: boolean;
  scale: number;
  onEditingChange?: (isTyping: boolean) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const TEXT_EDITABLE_BLOCK_TYPES = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'list', 'quote', 'callout']);
const SELECTABLE_BLOCK_TYPES = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'list',
  'quote',
  'callout',
  'code',
  'mermaid',
  'table',
]);

function getSelectableDomNodes(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, blockquote, .slide-callout, pre, .slide-mermaid-wrapper, table'
    )
  ) as HTMLElement[];

  return candidates.filter((el) => {
    const tag = el.tagName.toLowerCase();
    // Ignore internal SVG/paragraph nodes inside Mermaid diagrams or KaTeX math
    if (!el.classList.contains('slide-mermaid-wrapper') && el.closest('.slide-mermaid-wrapper')) {
      return false;
    }
    if (el.closest('.katex-display')) return false;
    // Ignore paragraphs inside list items, blockquotes, or callouts
    if (tag === 'p' && el.closest('li, blockquote')) return false;
    // If a callout wrapper is matched, prefer the inner .slide-callout-body for text editing
    if (tag === 'blockquote' && el.classList.contains('slide-callout')) return true;
    return true;
  });
}

function getEditableTargetForDomNode(el: HTMLElement): HTMLElement {
  if (el.classList.contains('slide-callout')) {
    const body = el.querySelector('.slide-callout-body') as HTMLElement | null;
    if (body) return body;
  }
  return el;
}

export const VisualSlideOverlay: React.FC<VisualSlideOverlayProps> = ({
  slideIndex,
  markdown,
  onUpdateMarkdown,
  slideContainerRef,
  onEditingChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [blocks, setBlocks] = useState<SlideBlock[]>([]);
  const [activeFormatting, setActiveFormatting] = useState<ActiveFormattingState | null>(null);

  const blocksRef = useRef<SlideBlock[]>([]);
  const markdownRef = useRef(markdown);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const activeOuterElementRef = useRef<HTMLElement | null>(null);
  const activeBlockIndexRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const typingResetTimerRef = useRef<any>(null);
  const isKeyboardTypingRef = useRef(false);
  const prevSlideIndexRef = useRef(slideIndex);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  useEffect(() => {
    activeBlockIndexRef.current = activeBlockIndex;
  }, [activeBlockIndex]);

  const refreshActiveFormatting = useCallback(() => {
    if (!activeElementRef.current || activeBlockIndexRef.current === null) {
      setActiveFormatting(null);
      return;
    }
    const block = blocksRef.current[activeBlockIndexRef.current] || null;
    const inspected = inspectDomFormatting(activeElementRef.current, block);
    setActiveFormatting(inspected);
  }, []);

  // Listen to selectionchange so highlighting any word immediately updates the formatting inspector
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!activeElementRef.current || activeBlockIndexRef.current === null) return;
      refreshActiveFormatting();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [refreshActiveFormatting]);

  // Close active editing when switching to a different slide or pressing Escape
  const handleClose = useCallback(() => {
    if (activeElementRef.current) {
      activeElementRef.current.contentEditable = 'false';
      activeElementRef.current.oninput = null;
      activeElementRef.current.onkeydown = null;
      activeElementRef.current.onkeyup = null;
      activeElementRef.current.onmouseup = null;
      activeElementRef.current = null;
    }
    if (activeOuterElementRef.current) {
      activeOuterElementRef.current.classList.remove('wysiwyg-active-element');
      activeOuterElementRef.current = null;
    }
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);
    setActiveBlockIndex(null);
    activeBlockIndexRef.current = null;
    setActiveFormatting(null);
    setToolbarPos(null);
  }, [onEditingChange]);

  useEffect(() => {
    if (prevSlideIndexRef.current !== slideIndex) {
      prevSlideIndexRef.current = slideIndex;
      handleClose();
    }
  }, [slideIndex, handleClose]);

  const updateToolbarPosition = useCallback(() => {
    const targetEl = activeOuterElementRef.current || activeElementRef.current;
    if (!targetEl) {
      setToolbarPos(null);
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    setToolbarPos({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateToolbarPosition);
    window.addEventListener('scroll', updateToolbarPosition, true);
    return () => {
      window.removeEventListener('resize', updateToolbarPosition);
      window.removeEventListener('scroll', updateToolbarPosition, true);
    };
  }, [updateToolbarPosition]);

  // Surgically commits an updated text for `blockIdx` into the current slide's markdown without touching any other blocks
  const commitSurgicalBlockTextUpdate = useCallback(
    (blockIdx: number, updatedInlineMd: string, immediate: boolean) => {
      const currentMd = markdownRef.current;
      const bounds = getSlideBounds(currentMd, slideIndex);
      if (!bounds) return;

      const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);
      if (blockIdx < 0 || blockIdx >= currentBlocks.length) return;

      const targetBlock = { ...currentBlocks[blockIdx] };
      targetBlock.text = updatedInlineMd;
      const newBlockRaw = serializeBlockToMarkdown(targetBlock);

      const newSlideMd = replaceBlockInSlideMarkdown(
        bounds.slideMarkdown,
        currentBlocks[blockIdx],
        newBlockRaw
      );
      const newFullMd = replaceSlideInPresentation(currentMd, slideIndex, newSlideMd);

      markdownRef.current = newFullMd;
      const reparsed = parseSlideToBlocks(newSlideMd);
      blocksRef.current = reparsed;
      setBlocks(reparsed);

      onUpdateMarkdown?.(newFullMd, immediate);
    },
    [onUpdateMarkdown, slideIndex]
  );

  // Bind keyboard and selection listeners onto a DOM element for a given block index
  const bindEditableElement = useCallback(
    (outerEl: HTMLElement, blockIdx: number) => {
      const editableEl = getEditableTargetForDomNode(outerEl);
      const block = blocksRef.current[blockIdx] || null;
      const isTextEditable = block ? TEXT_EDITABLE_BLOCK_TYPES.has(block.type) : true;

      if (activeElementRef.current && activeElementRef.current !== editableEl) {
        activeElementRef.current.contentEditable = 'false';
        activeElementRef.current.oninput = null;
        activeElementRef.current.onkeydown = null;
        activeElementRef.current.onkeyup = null;
        activeElementRef.current.onmouseup = null;
      }
      if (activeOuterElementRef.current && activeOuterElementRef.current !== outerEl) {
        activeOuterElementRef.current.classList.remove('wysiwyg-active-element');
      }

      outerEl.classList.add('wysiwyg-active-element');
      activeOuterElementRef.current = outerEl;
      activeElementRef.current = editableEl;

      if (isTextEditable) {
        editableEl.contentEditable = 'true';
        editableEl.spellcheck = false;
      } else {
        editableEl.contentEditable = 'false';
      }

      const rect = outerEl.getBoundingClientRect();
      setToolbarPos({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      setActiveFormatting(inspectDomFormatting(editableEl, block));

      editableEl.onmouseup = () => {
        refreshActiveFormatting();
      };

      editableEl.onkeyup = () => {
        refreshActiveFormatting();
      };

      if (isTextEditable) {
        editableEl.onkeydown = (e: KeyboardEvent) => {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const modifier = isMac ? e.metaKey : e.ctrlKey;
          if (modifier && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
            return;
          }
          isKeyboardTypingRef.current = true;
          onEditingChange?.(true);
        };

        editableEl.oninput = () => {
          isKeyboardTypingRef.current = true;
          onEditingChange?.(true);

          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            if (!activeElementRef.current) return;
            const updatedText = domNodeToInlineMarkdown(activeElementRef.current);
            commitSurgicalBlockTextUpdate(blockIdx, updatedText, false);
            refreshActiveFormatting();

            if (typingResetTimerRef.current) clearTimeout(typingResetTimerRef.current);
            typingResetTimerRef.current = setTimeout(() => {
              isKeyboardTypingRef.current = false;
              onEditingChange?.(false);
            }, 250);
          }, 120);
        };
      }
    },
    [commitSurgicalBlockTextUpdate, onEditingChange, refreshActiveFormatting]
  );

  // Sync blocks from markdown whenever markdown or slideIndex changes (including Undo/Redo & style edits)
  useEffect(() => {
    const bounds = getSlideBounds(markdown, slideIndex);
    const parsed = bounds ? parseSlideToBlocks(bounds.slideMarkdown) : [];
    blocksRef.current = parsed;
    setBlocks(parsed);

    // If a block is currently selected and we are not mid-keystroke, re-attach active outline to updated DOM node
    if (!isKeyboardTypingRef.current && activeBlockIndexRef.current !== null && slideContainerRef.current) {
      const idx = activeBlockIndexRef.current;
      if (idx >= 0 && idx < parsed.length) {
        requestAnimationFrame(() => {
          if (!slideContainerRef.current) return;
          const domNodes = getSelectableDomNodes(slideContainerRef.current);
          const selectableBlockIndices = parsed
            .map((b, i) => (SELECTABLE_BLOCK_TYPES.has(b.type) ? i : -1))
            .filter((i) => i !== -1);
          const domOrderIdx = selectableBlockIndices.indexOf(idx);
          const targetDomNode = domOrderIdx >= 0 ? domNodes[domOrderIdx] : null;
          if (targetDomNode) {
            bindEditableElement(targetDomNode, idx);
          }
        });
      } else {
        handleClose();
      }
    }
  }, [markdown, slideIndex, slideContainerRef, bindEditableElement, handleClose]);

  // Global Escape key to finish visual editing
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeBlockIndexRef.current !== null) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleClose]);

  // Click detector on slide container elements
  useEffect(() => {
    const container = slideContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.floating-format-toolbar')) return;

      const clickedEl = target.closest(
        'h1, h2, h3, h4, h5, h6, p, li, blockquote, .slide-callout, pre, .slide-mermaid-wrapper, table'
      ) as HTMLElement | null;

      if (!clickedEl || !container.contains(clickedEl) || clickedEl.closest('.katex-display')) {
        if (activeElementRef.current) {
          handleClose();
        }
        return;
      }

      // If user clicked a <p> inside an <li> or <blockquote>, resolve to the parent <li> or <blockquote>
      const resolvedOuterEl =
        clickedEl.tagName.toLowerCase() === 'p' && clickedEl.closest('li, blockquote')
          ? (clickedEl.closest('li, blockquote') as HTMLElement)
          : clickedEl.closest('.slide-mermaid-wrapper')
          ? (clickedEl.closest('.slide-mermaid-wrapper') as HTMLElement)
          : clickedEl;

      // If clicked on an already active element, just update toolbar position and formatting state
      if (activeOuterElementRef.current === resolvedOuterEl) {
        updateToolbarPosition();
        refreshActiveFormatting();
        return;
      }

      const bounds = getSlideBounds(markdownRef.current, slideIndex);
      if (!bounds) return;
      const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);
      blocksRef.current = currentBlocks;
      setBlocks(currentBlocks);

      // Match clicked DOM node to corresponding block index
      const domNodes = getSelectableDomNodes(container);
      const clickedDomIdx = domNodes.indexOf(resolvedOuterEl);
      const selectableBlockIndices = currentBlocks
        .map((b, i) => (SELECTABLE_BLOCK_TYPES.has(b.type) ? i : -1))
        .filter((i) => i !== -1);

      let matchedIdx = -1;
      if (clickedDomIdx >= 0 && clickedDomIdx < selectableBlockIndices.length) {
        matchedIdx = selectableBlockIndices[clickedDomIdx];
      } else {
        const editableTarget = getEditableTargetForDomNode(resolvedOuterEl);
        const targetPlain = stripFormattingForMatch(editableTarget.innerText || '');
        matchedIdx = currentBlocks.findIndex(
          (b) =>
            SELECTABLE_BLOCK_TYPES.has(b.type) &&
            stripFormattingForMatch(b.text) === targetPlain
        );
      }

      if (matchedIdx === -1) {
        matchedIdx = selectableBlockIndices[0] ?? 0;
      }

      setActiveBlockIndex(matchedIdx);
      activeBlockIndexRef.current = matchedIdx;
      bindEditableElement(resolvedOuterEl, matchedIdx);
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [
    slideContainerRef,
    slideIndex,
    bindEditableElement,
    handleClose,
    updateToolbarPosition,
    refreshActiveFormatting,
  ]);

  // Inline formatting action (Bold, Italic, Strikethrough, Code) - modifies live DOM range & surgical slide line range
  const handleFormatInline = (format: 'bold' | 'italic' | 'strike' | 'code') => {
    if (activeBlockIndex === null || !activeElementRef.current) return;
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    applyDomInlineFormat(activeElementRef.current, format);
    const updatedInlineMd = domNodeToInlineMarkdown(activeElementRef.current);
    commitSurgicalBlockTextUpdate(activeBlockIndex, updatedInlineMd, true);
    refreshActiveFormatting();
  };

  // Change text color (or reset when null) - modifies live DOM range & surgical slide line range
  const handleChangeTextColor = (color: string | null) => {
    if (activeBlockIndex === null || !activeElementRef.current) return;
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    applyDomColorFormat(activeElementRef.current, color);
    const updatedInlineMd = domNodeToInlineMarkdown(activeElementRef.current);
    commitSurgicalBlockTextUpdate(activeBlockIndex, updatedInlineMd, true);
    refreshActiveFormatting();
  };

  // Change block type (H1, H2, H3, P, List, Quote) - surgical line replacement
  const handleChangeBlockType = (newType: 'h1' | 'h2' | 'h3' | 'p' | 'list' | 'quote') => {
    if (activeBlockIndex === null) return;
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    const bounds = getSlideBounds(markdownRef.current, slideIndex);
    if (!bounds) return;
    const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);

    const newSlideMd = changeBlockTypeInSlide(
      bounds.slideMarkdown,
      currentBlocks,
      activeBlockIndex,
      newType
    );
    const newFullMd = replaceSlideInPresentation(markdownRef.current, slideIndex, newSlideMd);
    markdownRef.current = newFullMd;
    onUpdateMarkdown?.(newFullMd, true);
  };

  // Move block up or down - surgical line range swap that skips directive fences
  const handleMoveBlock = (direction: 'up' | 'down') => {
    if (activeBlockIndex === null) return;
    const bounds = getSlideBounds(markdownRef.current, slideIndex);
    if (!bounds) return;
    const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);

    const { newSlideMarkdown, newBlockIndex } = moveBlockInSlideMarkdown(
      bounds.slideMarkdown,
      currentBlocks,
      activeBlockIndex,
      direction
    );
    if (newBlockIndex === activeBlockIndex) return;

    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    const newFullMd = replaceSlideInPresentation(
      markdownRef.current,
      slideIndex,
      newSlideMarkdown
    );
    markdownRef.current = newFullMd;

    setActiveBlockIndex(newBlockIndex);
    activeBlockIndexRef.current = newBlockIndex;

    onUpdateMarkdown?.(newFullMd, true);
  };

  // Insert block - surgical line insertion
  const handleInsertBlock = (type: 'h1' | 'h2' | 'p' | 'list') => {
    if (activeBlockIndex === null) return;
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    const bounds = getSlideBounds(markdownRef.current, slideIndex);
    if (!bounds) return;
    const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);

    const newSlideMd = insertBlockInSlideMarkdown(
      bounds.slideMarkdown,
      currentBlocks,
      activeBlockIndex,
      type
    );
    const newFullMd = replaceSlideInPresentation(markdownRef.current, slideIndex, newSlideMd);
    markdownRef.current = newFullMd;

    const nextIdx = activeBlockIndex + 1;
    setActiveBlockIndex(nextIdx);
    activeBlockIndexRef.current = nextIdx;

    onUpdateMarkdown?.(newFullMd, true);
  };

  // Delete block - surgical line deletion
  const handleDeleteBlock = () => {
    if (activeBlockIndex === null) return;
    isKeyboardTypingRef.current = false;
    onEditingChange?.(false);

    const bounds = getSlideBounds(markdownRef.current, slideIndex);
    if (!bounds) return;
    const currentBlocks = parseSlideToBlocks(bounds.slideMarkdown);

    const newSlideMd = deleteBlockFromSlideMarkdown(
      bounds.slideMarkdown,
      currentBlocks,
      activeBlockIndex
    );
    const newFullMd = replaceSlideInPresentation(markdownRef.current, slideIndex, newSlideMd);
    markdownRef.current = newFullMd;
    handleClose();

    onUpdateMarkdown?.(newFullMd, true);
  };

  const activeBlock = activeBlockIndex !== null ? blocks[activeBlockIndex] || null : null;

  return (
    <>
      {toolbarPos && activeBlockIndex !== null && (
        <FloatingFormatToolbar
          position={toolbarPos}
          activeBlock={activeBlock}
          activeFormatting={activeFormatting}
          blockIndex={activeBlockIndex}
          totalBlocks={blocks.length}
          onFormatInline={handleFormatInline}
          onChangeBlockType={handleChangeBlockType}
          onChangeTextColor={handleChangeTextColor}
          onMoveBlock={handleMoveBlock}
          onInsertBlock={handleInsertBlock}
          onDeleteBlock={handleDeleteBlock}
          onUndo={() => {
            isKeyboardTypingRef.current = false;
            onEditingChange?.(false);
            onUndo?.();
          }}
          onRedo={() => {
            isKeyboardTypingRef.current = false;
            onEditingChange?.(false);
            onRedo?.();
          }}
          canUndo={canUndo}
          canRedo={canRedo}
          onClose={handleClose}
        />
      )}
    </>
  );
};
