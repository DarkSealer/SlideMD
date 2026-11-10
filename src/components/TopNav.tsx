import React, { useState } from 'react';
import {
  Play,
  Download,
  FolderOpen,
  Palette,
  Columns2,
  FileText,
  MonitorPlay,
  CheckCircle2,
  Share2,
  Lightbulb,
  WifiOff,
  Undo2,
  Redo2,
  LifeBuoy,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface TopNavProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  viewMode: 'split' | 'editor' | 'preview';
  onChangeViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  onOpenThemes: () => void;
  onOpenDecks: () => void;
  onOpenExport: () => void;
  onOpenGuide: () => void;
  onOpenContact: () => void;
  onStartPresenting: () => void;
  onOpenPresenterConsole: () => void;
  totalSlides: number;
  currentSlideIndex: number;
  lastSavedAt: number | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  title,
  onUpdateTitle,
  viewMode,
  onChangeViewMode,
  onOpenThemes,
  onOpenDecks,
  onOpenExport,
  onOpenGuide,
  onOpenContact,
  onStartPresenting,
  onOpenPresenterConsole,
  totalSlides,
  currentSlideIndex,
  lastSavedAt,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const isOnline = useOnlineStatus();

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(title);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2.5 shrink-0 z-30 select-none overflow-x-auto no-scrollbar">
      {/* Zone 1: Brand & Deck Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
        <a href="/" className="flex items-center gap-2 text-slate-100 hover:text-white transition-colors shrink-0" title="SlideMD Home">
          <img src="/logo.png" alt="SlideMD" className="h-7 sm:h-8 w-auto select-none shrink-0" draggable={false} />
        </a>

        <span className="text-slate-700 hidden sm:inline shrink-0" aria-hidden="true">/</span>

        {/* Editable Title */}
        <div className="min-w-0 truncate">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs sm:text-sm font-medium text-slate-100 focus:outline-none w-28 sm:w-40 md:w-48"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(title);
                setIsEditingTitle(true);
              }}
              title="Click to rename presentation"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white truncate block max-w-[90px] sm:max-w-[130px] lg:max-w-[160px] 2xl:max-w-[220px] text-left px-1.5 py-0.5 rounded hover:bg-slate-800/60 transition-colors"
            >
              {title}
            </button>
          )}
        </div>

        {/* Saved offline / online indicator */}
        {isOnline ? (
          <div
            className="hidden 2xl:flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 whitespace-nowrap shrink-0"
            title="All changes are continuously stored in local storage and work 100% offline"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Synced</span>
          </div>
        ) : (
          <div
            className="hidden 2xl:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80 whitespace-nowrap animate-pulse shrink-0"
            title="Device is offline. All slides remain fully functional and saved locally."
          >
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Zone 2: Viewport Mode Segmented Controls */}
      <div className="hidden md:flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'split' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View: Markdown editor and live preview"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Split</span>
        </button>
        <button
          onClick={() => onChangeViewMode('editor')}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'editor' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Editor focus mode"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Editor</span>
        </button>
        <button
          onClick={() => onChangeViewMode('preview')}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'preview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Preview slide mode"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Preview</span>
        </button>
      </div>

      {/* Global Undo & Redo Controls */}
      {(onUndo || onRedo) && (
        <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 xl:px-2 xl:py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline text-[11px]">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 xl:px-2 xl:py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline text-[11px]">Redo</span>
          </button>
        </div>
      )}

      {/* Zone 3: Primary Actions (Guaranteed to fit without clipping Notes) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <PWAInstallButton />

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/70 rounded-lg border border-amber-600/50 hover:border-amber-500 transition-all whitespace-nowrap shadow-sm shadow-amber-950/30"
          title="Open Presentation Guide & Hints: Learn how each Insert tool works and best practices for gorgeous slides"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden 2xl:inline">Guide & Hints</span>
          <span className="hidden lg:inline 2xl:hidden">Guide</span>
        </button>

        <button
          onClick={onOpenThemes}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          title="Customize Theme & Transitions"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">Theme</span>
        </button>

        <button
          onClick={onOpenDecks}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          title="Open Examples & Starter Templates Library"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Examples</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
          title="Export Standalone HTML, PDF, or Share Link"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* The footer (and its contact link) is hidden below md, so expose it here on small screens */}
        <button
          onClick={onOpenContact}
          className="md:hidden flex items-center px-2 py-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          title="Report a bug, share feedback, or contact us"
          aria-label="Report a bug or contact us"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
        </button>

        <div className="flex items-center shrink-0">
          <button
            onClick={onStartPresenting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-l-lg transition-colors shadow-sm shadow-indigo-900/50 whitespace-nowrap"
            title="Start Fullscreen Slideshow (F)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Present</span>
          </button>
          <button
            onClick={onOpenPresenterConsole}
            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-100 bg-indigo-700 hover:bg-indigo-600 rounded-r-lg border-l border-indigo-400/40 transition-colors whitespace-nowrap"
            title="Open Dual-Screen Presenter Console with Speaker Notes & Timer (S)"
          >
            Notes
          </button>
        </div>
      </div>
    </header>
  );
};
