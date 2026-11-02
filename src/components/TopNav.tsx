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
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-3 sm:px-4 md:px-5 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 select-none">
      {/* Zone 1: Brand & Deck Title (Guaranteed never to be covered or crushed) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-[200px] sm:max-w-xs md:max-w-sm">
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
              className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs sm:text-sm font-medium text-slate-100 focus:outline-none w-32 sm:w-48 md:w-56"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(title);
                setIsEditingTitle(true);
              }}
              title="Click to rename presentation"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white truncate block max-w-[100px] sm:max-w-[160px] md:max-w-[200px] text-left px-1.5 py-0.5 rounded hover:bg-slate-800/60 transition-colors"
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
            <span>Synced locally</span>
          </div>
        ) : (
          <div
            className="hidden xl:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80 whitespace-nowrap animate-pulse shrink-0"
            title="Device is offline. All slides remain fully functional and saved locally."
          >
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span>Working offline</span>
          </div>
        )}
      </div>

      {/* Zone 2: Viewport Mode Segmented Controls (Icons-only on medium screens, full text on xl) */}
      <div className="hidden md:flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'split' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View: Markdown editor and live preview"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Split View</span>
        </button>
        <button
          onClick={() => onChangeViewMode('editor')}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'editor' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Editor focus mode"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Editor</span>
        </button>
        <button
          onClick={() => onChangeViewMode('preview')}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            viewMode === 'preview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Preview slide mode"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Preview</span>
        </button>
      </div>

      {/* Global Undo & Redo Controls */}
      {(onUndo || onRedo) && (
        <div className="flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 sm:px-2 sm:py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 sm:px-2 sm:py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Redo</span>
          </button>
        </div>
      )}

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <PWAInstallButton />

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/70 rounded-lg border border-amber-600/50 hover:border-amber-500 transition-all whitespace-nowrap shadow-sm shadow-amber-950/30"
          title="Open Presentation Guide & Hints: Learn how each Insert tool works and best practices for gorgeous slides"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden xl:inline">Guide & Hints</span>
          <span className="hidden lg:inline xl:hidden">Guide</span>
        </button>

        <button
          onClick={onOpenThemes}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          title="Customize Theme & Transitions"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">Theme</span>
        </button>

        <button
          onClick={onOpenDecks}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          title="Open Examples & Starter Templates Library"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Examples</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
          title="Export Standalone HTML, PDF, or Share Link"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="flex items-center">
          <button
            onClick={onStartPresenting}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-l-lg transition-colors shadow-sm shadow-indigo-900/50 whitespace-nowrap"
            title="Start Fullscreen Slideshow (F)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Present</span>
          </button>
          <button
            onClick={onOpenPresenterConsole}
            className="px-2 py-1.5 text-xs font-medium text-indigo-100 bg-indigo-700 hover:bg-indigo-600 rounded-r-lg border-l border-indigo-500/40 transition-colors whitespace-nowrap"
            title="Open Dual-Screen Presenter Console with Speaker Notes & Timer (S)"
          >
            Notes
          </button>
        </div>
      </div>
    </header>
  );
};
