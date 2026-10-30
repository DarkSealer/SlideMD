import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  StickyNote,
  Columns,
  Code2,
  Binary,
  AlertCircle,
  Table,
  Upload,
  Sparkles,
  Layers,
  Palette,
  Workflow,
  ChevronDown,
  LayoutGrid,
  Gauge,
  Quote,
  Split,
  Milestone,
  Users,
} from 'lucide-react';
import { MERMAID_SNIPPETS } from '../utils/mermaidHelper';
import { SLIDE_LAYOUT_PATTERNS } from '../utils/slideLayoutSnippets';
import { useToolbarHint } from './ToolbarHint';

// Renders a dropdown panel in a portal on document.body, positioned under its
// parent element, so it floats above the editor instead of being clipped by
// the horizontally scrolling toolbar.
const FloatingPanel: React.FC<{
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClose, className = '', children }) => {
  const markerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const anchor = markerRef.current?.parentElement;
    if (!anchor) return;
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = panelRef.current?.offsetWidth ?? 0;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setPos({ top: rect.bottom + 6, left });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, []);

  useEffect(() => {
    const anchor = markerRef.current?.parentElement;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      <span ref={markerRef} className="hidden" />
      {createPortal(
        <div
          ref={panelRef}
          data-hint-panel=""
          className={className}
          style={{
            position: 'fixed',
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            visibility: pos ? 'visible' : 'hidden',
            maxWidth: 'calc(100vw - 16px)',
            zIndex: 100,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorSlideChange?: (slideIndex: number) => void;
  onOpenGuide?: (initialTab?: 'tools' | 'tour' | 'design' | 'shortcuts' | 'markdown') => void;
  currentSlideIndex: number;
  totalSlides: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onCursorSlideChange,
  onOpenGuide,
  currentSlideIndex,
  totalSlides,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showMermaidMenu, setShowMermaidMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const { bind: hintBind, tooltip: hintTooltip } = useToolbarHint(showColorMenu || showMermaidMenu || showLayoutMenu);

  // Wrap selected text or insert span with color
  const wrapSelectedTextWithColor = (color: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const selected = current.substring(start, end);
    const textToWrap = selected || 'colored text';
    const wrapped = `<span style="color: ${color}">${textToWrap}</span>`;

    const newValue = current.substring(0, start) + wrapped + current.substring(end);
    onChange(newValue);
    setShowColorMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + wrapped.length, start + wrapped.length);
    }, 10);
  };

  // Insert a snippet at cursor position
  const insertSnippet = (snippet: string, cursorOffset = 0) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const newValue = current.substring(0, start) + snippet + current.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length + cursorOffset, start + snippet.length + cursorOffset);
    }, 10);
  };

  // Handle Tab key to insert 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertSnippet('  ');
    }
  };

  // Determine which slide the cursor is currently on
  const handleSelectOrKeyUp = () => {
    if (!textareaRef.current || !onCursorSlideChange) return;
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursor);

    // Count horizontal separators before cursor
    const lines = textBeforeCursor.split('\n');
    let slideCount = 0;
    let inCode = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('```')) inCode = !inCode;
      if (!inCode && (line === '---' || line === '--')) {
        slideCount++;
      }
    }

    onCursorSlideChange(slideCount);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.type.includes('text'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const lineCount = value.split('\n').length;

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 border-r border-slate-800 relative transition-colors ${
        isDragging ? 'bg-indigo-950/20 ring-2 ring-indigo-500 ring-inset' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Quick Snippet Bar */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto text-xs shrink-0 select-none no-scrollbar" {...hintBind}>
        {hintTooltip}
        <span className="text-slate-500 font-mono text-[11px] px-1 whitespace-nowrap">Insert:</span>

        <button
          onClick={() => insertSnippet('\n\n---\n\n## Slide Title\n\nSlide content...\n\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="slide"
        >
          <Plus className="w-3 h-3 text-indigo-400" />
          <span>Slide (---)</span>
        </button>

        <button
          onClick={() => insertSnippet('\n\n--\n\n### Sub-slide Title\n\nNested content...\n\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="subslide"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>Sub-slide (--)</span>
        </button>

        <button
          onClick={() => insertSnippet('\n\nNote:\nPresenter speaker note for this slide.\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="note"
        >
          <StickyNote className="w-3 h-3 text-amber-400" />
          <span>Speaker Note</span>
        </button>

        <button
          onClick={() => insertSnippet('\n:::fragment\nKey bullet or point appears on click\n:::\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="fragment"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Fragment</span>
        </button>

        <button
          onClick={() => insertSnippet('\n:::columns\n:::column\n### Column 1\nLeft content\n:::column\n### Column 2\nRight content\n:::\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="columns"
        >
          <Columns className="w-3 h-3 text-emerald-400" />
          <span>Columns</span>
        </button>

        <button
          onClick={() => insertSnippet('\n```typescript\nfunction solve(input: string): boolean {\n  return true;\n}\n```\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="code"
        >
          <Code2 className="w-3 h-3 text-sky-400" />
          <span>Code</span>
        </button>

        <button
          onClick={() => insertSnippet('\n$$\nE = mc^2\n$$\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="math"
        >
          <Binary className="w-3 h-3 text-rose-400" />
          <span>Math</span>
        </button>

        <button
          onClick={() => insertSnippet('\n> [!NOTE]\n> Strategic insight or key takeaway.\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="callout"
        >
          <AlertCircle className="w-3 h-3 text-yellow-400" />
          <span>Callout</span>
        </button>

        <button
          onClick={() => insertSnippet('\n| Item | Metric | Status |\n| :--- | :--- | :--- |\n| Alpha | 99.8% | Active |\n| Beta | 42 ms | Ready |\n')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
          data-hint="table"
        >
          <Table className="w-3 h-3 text-slate-300" />
          <span>Table</span>
        </button>

        {/* Visual Slide Layout Patterns */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayoutMenu(!showLayoutMenu);
              setShowMermaidMenu(false);
              setShowColorMenu(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
            data-hint="layouts"
          >
            <LayoutGrid className="w-3 h-3 text-indigo-400" />
            <span>Layouts</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {showLayoutMenu && (
            <FloatingPanel onClose={() => setShowLayoutMenu(false)} className="w-80 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Insert Visual Slide Layout</span>
                </span>
                <button
                  onClick={() => setShowLayoutMenu(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto no-scrollbar">
                {SLIDE_LAYOUT_PATTERNS.map((pattern) => {
                  const Icon =
                    pattern.iconName === 'Gauge'
                      ? Gauge
                      : pattern.iconName === 'Quote'
                      ? Quote
                      : pattern.iconName === 'Split'
                      ? Split
                      : pattern.iconName === 'Milestone'
                      ? Milestone
                      : Users;

                  return (
                    <button
                      key={pattern.id}
                      data-hint={`layout:${pattern.id}`}
                      data-hint-side="right"
                      onClick={() => {
                        insertSnippet(`\n\n${pattern.snippet.trim()}\n\n`);
                        setShowLayoutMenu(false);
                      }}
                      className="flex items-start gap-2.5 text-left p-2 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-indigo-500 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-slate-200 group-hover:text-indigo-400 text-xs truncate">
                            {pattern.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {pattern.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Semantic Markdown & responsive CSS</span>
                <span className="text-indigo-400 font-medium">1-Click Insert</span>
              </div>
            </FloatingPanel>
          )}
        </div>

        {/* Mermaid Diagram Tool */}
        <div className="relative">
          <button
            onClick={() => setShowMermaidMenu(!showMermaidMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
            data-hint="diagram"
          >
            <Workflow className="w-3 h-3 text-emerald-400" />
            <span>Diagram</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {showMermaidMenu && (
            <FloatingPanel onClose={() => setShowMermaidMenu(false)} className="w-80 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Insert Mermaid Diagram</span>
                </span>
                <button
                  onClick={() => setShowMermaidMenu(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto no-scrollbar">
                {MERMAID_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.id}
                    data-hint={`diagram:${snippet.id}`}
                    data-hint-side="right"
                    onClick={() => {
                      insertSnippet(`\n\n${snippet.code}\n\n`);
                      setShowMermaidMenu(false);
                    }}
                    className="flex flex-col text-left p-2 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-slate-200 group-hover:text-emerald-400 text-xs">
                        {snippet.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {snippet.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {snippet.description}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Renders live responsive SVG charts</span>
                <code className="text-emerald-400 font-mono text-[9px]">```mermaid</code>
              </div>
            </FloatingPanel>
          )}
        </div>

        {/* Color Text / Span Tool */}
        <div className="relative">
          <button
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
            data-hint="color"
          >
            <Palette className="w-3 h-3 text-pink-400" />
            <span>Color</span>
          </button>

          {showColorMenu && (
            <FloatingPanel onClose={() => setShowColorMenu(false)} className="w-56 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pb-1 border-b border-slate-800">
                <span>Colorize Text</span>
                <button onClick={() => setShowColorMenu(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 py-1">
                {[
                  { color: '#ffffff', label: 'White' },
                  { color: '#0f172a', label: 'Dark Slate' },
                  { color: '#6ee7b7', label: 'Mint' },
                  { color: '#fde68a', label: 'Amber' },
                  { color: '#7dd3fc', label: 'Cyan' },
                  { color: '#fda4af', label: 'Rose' },
                  { color: '#d8b4fe', label: 'Purple' },
                  { color: '#fb923c', label: 'Orange' },
                ].map(({ color, label }) => (
                  <button
                    key={color}
                    onClick={() => wrapSelectedTextWithColor(color)}
                    title={label}
                    className="w-full h-6 rounded border border-slate-700 flex items-center justify-center hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Wraps selected text in <code className="text-pink-300">&lt;span style=&quot;color: ...&quot;&gt;</code>
              </div>
            </FloatingPanel>
          )}
        </div>

        <div className="ml-auto pl-2 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.txt,.markdown"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 transition-colors whitespace-nowrap"
            data-hint="upload"
          >
            <Upload className="w-3 h-3" />
            <span>Upload .md</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Bar */}
        <div className="w-11 py-3 bg-slate-950 border-r border-slate-900/80 text-right pr-2.5 font-mono text-xs text-slate-600 select-none overflow-hidden shrink-0">
          {Array.from({ length: Math.min(lineCount, 500) }).map((_, i) => (
            <div key={i} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleSelectOrKeyUp}
          onClick={handleSelectOrKeyUp}
          placeholder="# Presentation Title&#10;&#10;Write markdown slides separated by ---&#10;&#10;Note:&#10;Add speaker notes here."
          spellCheck={false}
          className="flex-1 h-full p-3 font-mono text-xs sm:text-sm text-slate-200 bg-transparent resize-none focus:outline-none leading-6 overflow-y-auto selection:bg-indigo-600/40"
        />

        {/* Drag & drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none z-20">
            <Upload className="w-12 h-12 text-indigo-400 mb-2 animate-bounce" />
            <p className="text-lg font-semibold text-white">Drop Markdown file here</p>
            <p className="text-sm text-indigo-200">Will replace current editor contents</p>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="h-7 px-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{value.length} chars</span>
          <span>·</span>
          <span className="text-indigo-400">{totalSlides} slides detected</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Active Slide: {currentSlideIndex + 1} / {totalSlides}</span>
        </div>
      </div>
    </div>
  );
};
