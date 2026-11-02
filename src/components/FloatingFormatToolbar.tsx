import React, { useState, useEffect } from 'react';
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

  // Sync customHex input with the currently inspected element's color when selection changes
  useEffect(() => {
    if (activeHexColor && activeHexColor.startsWith('#')) {
      setCustomHex(activeHexColor);
    }
  }, [activeHexColor]);

  // Clamp toolbar coordinates so it floats cleanly above or below the target element and stays inside the viewport
  const toolbarWidth = 540;
  const toolbarHeight = 76;
  const padding = 12;

  let left = position.x + position.width / 2 - toolbarWidth / 2;
  left = Math.max(padding, Math.min(window.innerWidth - toolbarWidth - padding, left));

  let top = position.y - toolbarHeight - 12;
  if (top < 60) {
    top = position.y + position.height + 12;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 100,
      }}
      className="floating-format-toolbar flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150 select-none"
      onMouseDown={(e) => {
        // Prevent losing selection in the contentEditable element unless interacting with color hex input
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* Top Status Bar: Current Formatting Inspector */}
      <div className="flex items-center justify-between gap-3 px-2.5 py-1 border-b border-slate-800/90 bg-slate-950/60 rounded-t-xl text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-indigo-400 uppercase tracking-wider">
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
                className="truncate max-w-[130px] text-cyan-300 italic"
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
              className={`px-1.5 py-0.2 rounded font-semibold ${
                isBoldActive
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
              title={isBoldActive ? 'Explicit Bold (**text**)' : 'Heading Default Bold'}
            >
              Bold
            </span>
          )}
          {(isItalicActive || isComputedItalic) && (
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-semibold">
              Italic
            </span>
          )}
          {isStrikeActive && (
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-semibold">
              Strike
            </span>
          )}
          {isCodeActive && (
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-mono">
              Code
            </span>
          )}
          {!isNonTextBlock && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-800/90 border border-slate-700/80 font-mono text-slate-300"
              title={hasExplicitColor ? `Custom Color: ${activeHexColor}` : `Theme Color: ${activeHexColor}`}
            >
              <span
                className="w-2 h-2 rounded-full border border-white/30"
                style={{ backgroundColor: activeHexColor }}
              />
              {activeHexColor}
            </span>
          )}
        </div>
      </div>

      {/* Main Action Controls Row */}
      <div className="flex items-center gap-1 p-1">
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 font-medium hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
            title="Change Block Heading or Type"
          >
            {currentType === 'h1' && <Heading1 className="w-3.5 h-3.5 text-indigo-400" />}
            {currentType === 'h2' && <Heading2 className="w-3.5 h-3.5 text-cyan-400" />}
            {(currentType === 'h3' || currentType === 'h4') && (
              <Heading3 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {currentType === 'p' && <Pilcrow className="w-3.5 h-3.5 text-slate-400" />}
            {currentType === 'list' && <List className="w-3.5 h-3.5 text-amber-400" />}
            {(currentType === 'quote' || currentType === 'callout') && (
              <Quote className="w-3.5 h-3.5 text-purple-400" />
            )}
            {isNonTextBlock && <Box className="w-3.5 h-3.5 text-sky-400" />}
            <span className="uppercase text-[11px] font-semibold">{currentType}</span>
          </button>

          {showTypeMenu && !isNonTextBlock && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
              {[
                { type: 'h1' as const, label: 'Heading 1 (#)', icon: Heading1, color: 'text-indigo-400' },
                { type: 'h2' as const, label: 'Heading 2 (##)', icon: Heading2, color: 'text-cyan-400' },
                { type: 'h3' as const, label: 'Heading 3 (###)', icon: Heading3, color: 'text-emerald-400' },
                { type: 'p' as const, label: 'Paragraph (Body)', icon: Pilcrow, color: 'text-slate-400' },
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 text-left ${
                      isSelected ? 'bg-indigo-600/20 text-white font-semibold' : 'text-slate-300 hover:text-white'
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
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isBoldActive
                ? 'bg-indigo-600/35 text-indigo-200 border border-indigo-500/50 shadow-inner'
                : isComputedBold
                ? 'bg-slate-800/80 text-indigo-300 border border-slate-700'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
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
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isItalicActive || isComputedItalic
                ? 'bg-indigo-600/35 text-indigo-200 border border-indigo-500/50 shadow-inner'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
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
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isStrikeActive
                ? 'bg-indigo-600/35 text-indigo-200 border border-indigo-500/50 shadow-inner'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
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
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isCodeActive
                ? 'bg-indigo-600/35 text-indigo-200 border border-indigo-500/50 shadow-inner'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              hasExplicitColor
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={`Current Text Color: ${activeHexColor}`}
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span
              className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
              style={{ backgroundColor: activeHexColor }}
            />
          </button>

          {showColorPopover && !isNonTextBlock && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2.5 z-50 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Text Color
                </span>
                {hasExplicitColor && (
                  <button
                    onClick={() => {
                      onChangeTextColor(null);
                      setShowColorPopover(false);
                    }}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
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
                          ? 'border-white ring-2 ring-indigo-500/80 scale-105'
                          : 'border-white/20'
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
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-200"
                />
                <button
                  onClick={() => {
                    onChangeTextColor(customHex);
                    setShowColorPopover(false);
                  }}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium"
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
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move Block Up (↑)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveBlock('down')}
            disabled={blockIndex >= totalBlocks - 1}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
              className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Insert Block Below (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {showInsertMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onInsertBlock('h2');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white text-left"
                >
                  <Heading2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Heading</span>
                </button>
                <button
                  onClick={() => {
                    onInsertBlock('p');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white text-left"
                >
                  <Pilcrow className="w-3.5 h-3.5 text-slate-400" />
                  <span>Paragraph</span>
                </button>
                <button
                  onClick={() => {
                    onInsertBlock('list');
                    setShowInsertMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white text-left"
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
            className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
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
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo last change (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        {/* Done / Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Done Editing (Escape)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
