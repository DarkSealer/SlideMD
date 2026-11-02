import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Palette,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  Quote,
  X,
  Check,
  Undo2,
  Redo2,
  RotateCcw,
  Box,
} from 'lucide-react';
import { SlideBlock, ActiveFormattingState } from '../utils/slideBlockParser';

export interface FloatingFormatToolbarProps {
  position: { x: number; y: number; width: number; height: number };
  activeBlock: SlideBlock | null;
  activeFormatting?: ActiveFormattingState | null;
  blockIndex: number;
  totalBlocks: number;
  onFormatInline: (format: 'bold' | 'italic' | 'strike' | 'code') => void;
  onChangeBlockType: (type: 'h1' | 'h2' | 'h3' | 'p' | 'list' | 'quote') => void;
  onChangeTextColor: (color: string | null) => void;
  onMoveBlock: (direction: 'up' | 'down') => void;
  onInsertBlock: (type: 'h1' | 'h2' | 'p' | 'list') => void;
  onDeleteBlock: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#38bdf8' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Light Slate', value: '#f1f5f9' },
  { name: 'Dark Slate', value: '#0f172a' },
];

const NON_TEXT_BLOCKS = new Set(['mermaid', 'code', 'table', 'directive']);

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  activeBlock,
  activeFormatting,
  blockIndex,
  totalBlocks,
  onFormatInline,
  onChangeBlockType,
  onChangeTextColor,
  onMoveBlock,
  onInsertBlock,
  onDeleteBlock,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClose,
}) => {
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [customHex, setCustomHex] = useState('#38bdf8');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(390);

  const currentType = activeFormatting?.blockType || activeBlock?.type || 'p';
  const isNonTextBlock = NON_TEXT_BLOCKS.has(currentType);

  const isBoldActive = activeFormatting ? activeFormatting.isExplicitBold : false;
  const isComputedBold = activeFormatting ? activeFormatting.isBold : false;
  const isItalicActive = activeFormatting ? activeFormatting.isExplicitItalic : false;
  const isComputedItalic = activeFormatting ? activeFormatting.isItalic : false;
  const isStrikeActive = activeFormatting ? activeFormatting.isStrike : false;
  const isCodeActive = activeFormatting ? activeFormatting.isCode : false;

  const activeHexColor =
    activeFormatting?.color || activeFormatting?.computedColor || '#f1f5f9';
  const hasExplicitColor = Boolean(activeFormatting?.color);

  useEffect(() => {
    if (activeHexColor && activeHexColor.startsWith('#')) {
      setCustomHex(activeHexColor);
    }
  }, [activeHexColor]);

  useLayoutEffect(() => {
    if (toolbarRef.current) {
      setMeasuredWidth(toolbarRef.current.offsetWidth || 390);
    }
  }, [activeFormatting, currentType]);

  const padding = 12;
  let left = position.x + position.width / 2 - measuredWidth / 2;
  left = Math.max(padding, Math.min(window.innerWidth - measuredWidth - padding, left));

  // Place above the selected element using translateY(-100%) so the bottom edge of the toolbar
  // is guaranteed to sit 14px above the element and NEVER cover the text being edited.
  // If the element is too close to the top header (< 165px), place cleanly 14px below the element.
  const placeAbove = position.y > 165;
  const anchorTop = placeAbove
    ? position.y - 14
    : Math.min(window.innerHeight - 80, position.y + position.height + 14);

  // Open popovers upward when there is room above so popovers don't cover the active text either
  const openMenusUpward = placeAbove && position.y > 310;
  const menuPositionClass = openMenusUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5';

  const toolbarContent = (
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${anchorTop}px`,
        transform: placeAbove ? 'translateY(-100%)' : 'none',
        zIndex: 9999,
      }}
      className="floating-format-toolbar flex flex-col bg-slate-900/95 border border-slate-700/90 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md text-slate-100 text-[11px] select-none"
      onMouseDown={(e) => {
        // Prevent losing selection in the contentEditable element unless interacting with color hex input
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* Compact Status Bar: Current Formatting Inspector */}
      <div className="flex items-center justify-between gap-2.5 px-2.5 py-1 border-b border-slate-800/90 bg-slate-950/75 rounded-t-lg text-[10px] text-slate-300">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-indigo-400 uppercase tracking-wider">
            {activeFormatting?.tagLabel || currentType.toUpperCase()}
          </span>
          {activeFormatting?.fontSize && (
            <>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300" title="Computed Font Size">
                {activeFormatting.fontSize}
              </span>
            </>
          )}
          {activeFormatting?.selectedText && (
            <>
              <span className="text-slate-600">•</span>
              <span
                className="truncate max-w-[120px] text-cyan-300 italic"
                title={`Selected text: "${activeFormatting.selectedText}"`}
              >
                &ldquo;{activeFormatting.selectedText}&rdquo;
              </span>
            </>
          )}
        </div>

        {/* Active Formatting Summary Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {(isBoldActive || isComputedBold) && (
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                isBoldActive
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                  : 'bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
              title={isBoldActive ? 'Explicit Bold (**text**)' : 'Heading Default Bold'}
            >
              Bold
            </span>
          )}
          {(isItalicActive || isComputedItalic) && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-semibold">
              Italic
            </span>
          )}
          {isStrikeActive && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-semibold">
              Strike
            </span>
          )}
          {isCodeActive && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-mono">
              Code
            </span>
          )}
          {!isNonTextBlock && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800/90 border border-slate-700/80 font-mono text-[10px] text-slate-200"
              title={hasExplicitColor ? `Custom Color: ${activeHexColor}` : `Theme Color: ${activeHexColor}`}
            >
              <span
                className="w-2 h-2 rounded-full border border-white/40 shrink-0"
                style={{ backgroundColor: activeHexColor }}
              />
              {activeHexColor}
            </span>
          )}
        </div>
      </div>

      {/* Main Action Controls Row */}
      <div className="flex items-center gap-0.5 px-1.5 py-1">
        {/* Block Type Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              if (isNonTextBlock) return;
              setShowTypeMenu(!showTypeMenu);
              setShowColorPopover(false);
              setShowInsertMenu(false);
            }}
            disabled={isNonTextBlock}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-slate-100 font-semibold hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
            title="Change Block Heading or Type"
          >
            {currentType === 'h1' && <Heading1 className="w-3.5 h-3.5 text-indigo-400" />}
            {currentType === 'h2' && <Heading2 className="w-3.5 h-3.5 text-cyan-400" />}
            {(currentType === 'h3' || currentType === 'h4') && (
              <Heading3 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {currentType === 'p' && <Pilcrow className="w-3.5 h-3.5 text-slate-300" />}
            {currentType === 'list' && <List className="w-3.5 h-3.5 text-amber-400" />}
            {(currentType === 'quote' || currentType === 'callout') && (
              <Quote className="w-3.5 h-3.5 text-purple-400" />
            )}
            {isNonTextBlock && <Box className="w-3.5 h-3.5 text-sky-400" />}
            <span className="uppercase text-[11px] font-bold">{currentType}</span>
          </button>

          {showTypeMenu && !isNonTextBlock && (
            <div className={`absolute ${menuPositionClass} left-0 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs`}>
              {[
                { type: 'h1' as const, label: 'Heading 1 (#)', icon: Heading1, color: 'text-indigo-400' },
                { type: 'h2' as const, label: 'Heading 2 (##)', icon: Heading2, color: 'text-cyan-400' },
                { type: 'h3' as const, label: 'Heading 3 (###)', icon: Heading3, color: 'text-emerald-400' },
                { type: 'p' as const, label: 'Paragraph (Body)', icon: Pilcrow, color: 'text-slate-300' },
                { type: 'list' as const, label: 'Bullet List (- )', icon: List, color: 'text-amber-400' },
                { type: 'quote' as const, label: 'Quote Block (>)', icon: Quote, color: 'text-purple-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = currentType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      onChangeBlockType(item.type);
                      setShowTypeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-800 text-left ${
                      isSelected ? 'bg-indigo-600/25 text-white font-semibold' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Inline Formatting: Bold, Italic, Strikethrough, Code */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onFormatInline('bold')}
            disabled={isNonTextBlock}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isBoldActive
                ? 'bg-indigo-600/40 text-white border border-indigo-400/60 shadow-inner'
                : isComputedBold
                ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                : 'hover:bg-slate-800 text-slate-200 hover:text-white'
            }`}
            title={
              isBoldActive
                ? 'Bold Active — Click to remove (**text**)'
                : 'Bold (**text**)'
            }
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFormatInline('italic')}
            disabled={isNonTextBlock}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isItalicActive || isComputedItalic
                ? 'bg-indigo-600/40 text-white border border-indigo-400/60 shadow-inner'
                : 'hover:bg-slate-800 text-slate-200 hover:text-white'
            }`}
            title={
              isItalicActive
                ? 'Italic Active — Click to remove (*text*)'
                : 'Italic (*text*)'
            }
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFormatInline('strike')}
            disabled={isNonTextBlock}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isStrikeActive
                ? 'bg-indigo-600/40 text-white border border-indigo-400/60 shadow-inner'
                : 'hover:bg-slate-800 text-slate-200 hover:text-white'
            }`}
            title={
              isStrikeActive
                ? 'Strikethrough Active — Click to remove (~~text~~)'
                : 'Strikethrough (~~text~~)'
            }
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFormatInline('code')}
            disabled={isNonTextBlock}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isCodeActive
                ? 'bg-indigo-600/40 text-white border border-indigo-400/60 shadow-inner'
                : 'hover:bg-slate-800 text-slate-200 hover:text-white'
            }`}
            title={
              isCodeActive
                ? 'Inline Code Active — Click to remove (`code`)'
                : 'Inline Code (`code`)'
            }
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Color Swatch Picker with Live Current Color Indicator */}
        <div className="relative">
          <button
            onClick={() => {
              if (isNonTextBlock) return;
              setShowColorPopover(!showColorPopover);
              setShowTypeMenu(false);
              setShowInsertMenu(false);
            }}
            disabled={isNonTextBlock}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              hasExplicitColor
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'hover:bg-slate-800 text-slate-200 hover:text-white'
            }`}
            title={`Current Text Color: ${activeHexColor}`}
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span
              className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: activeHexColor }}
            />
          </button>

          {showColorPopover && !isNonTextBlock && (
            <div className={`absolute ${menuPositionClass} left-0 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2.5 z-50 text-xs`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  Text Color
                </span>
                {hasExplicitColor && (
                  <button
                    onClick={() => {
                      onChangeTextColor(null);
                      setShowColorPopover(false);
                    }}
                    className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-rose-400 transition-colors font-medium"
                    title="Reset to default theme color"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {PRESET_COLORS.map((c) => {
                  const isCurrentColor =
                    activeHexColor.toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      onClick={() => {
                        onChangeTextColor(c.value);
                        setShowColorPopover(false);
                      }}
                      className={`w-6 h-6 rounded-md border hover:scale-110 transition-transform shadow-sm flex items-center justify-center ${
                        isCurrentColor
                          ? 'border-white ring-2 ring-indigo-500 scale-105'
                          : 'border-white/25'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={`${c.name} (${c.value})`}
                    >
                      {isCurrentColor && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            c.value === '#f1f5f9' ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 pt-1.5 border-t border-slate-800">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-100"
                />
                <button
                  onClick={() => {
                    onChangeTextColor(customHex);
                    setShowColorPopover(false);
                  }}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Block Reordering & Modification */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onMoveBlock('up')}
            disabled={blockIndex <= 0}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Block Up (↑)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveBlock('down')}
            disabled={blockIndex >= totalBlocks - 1}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Block Down (↓)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Insert New Block Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowInsertMenu(!showInsertMenu);
                setShowTypeMenu(false);
                setShowColorPopover(false);
              }}
              className="p-1.5 rounded-md hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Insert Block Below (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {showInsertMenu && (
              <div className={`absolute ${menuPositionClass} left-0 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs`}>
                <button
                  onClick={() => {
                    onInsertBlock('h2');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white text-left"
                >
                  <Heading2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Heading</span>
                </button>
                <button
                  onClick={() => {
                    onInsertBlock('p');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white text-left"
                >
                  <Pilcrow className="w-3.5 h-3.5 text-slate-300" />
                  <span>Paragraph</span>
                </button>
                <button
                  onClick={() => {
                    onInsertBlock('list');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 hover:text-white text-left"
                >
                  <List className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bullet List</span>
                </button>
              </div>
            )}
          </div>

          {/* Delete Block */}
          <button
            onClick={onDeleteBlock}
            className="p-1.5 rounded-md hover:bg-red-950/70 text-slate-300 hover:text-red-400 transition-colors"
            title="Delete Block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Undo & Redo Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Done / Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Done Editing (Escape)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(toolbarContent, document.body);
  }

  return toolbarContent;
};
