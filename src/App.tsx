import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PresentationDeck, PresentationSettings } from './types/presentation';
import { parseMarkdownToSlides } from './utils/markdownParser';
import {
  getSavedDecks,
  saveDeck,
  deleteDeck as removeDeckFromStorage,
  duplicateDeck as cloneDeckInStorage,
  getActiveDeckId,
  setActiveDeckId,
  STARTER_TEMPLATES,
} from './utils/storage';
import { decodeShareUrl } from './utils/exportEngine';
import { TopNav } from './components/TopNav';
import { MarkdownEditor } from './components/MarkdownEditor';
import { SlideViewer } from './components/SlideViewer';
import { SlideThumbnailStrip } from './components/SlideThumbnailStrip';
import { FullscreenPresentation } from './components/FullscreenPresentation';
import { PresenterModal } from './components/PresenterModal';
import { ExportModal } from './components/ExportModal';
import { ThemeSettingsPanel } from './components/ThemeSettingsPanel';
import { DecksLibraryModal } from './components/DecksLibraryModal';
import { PresentationGuideModal } from './components/PresentationGuideModal';
import { AudiencePresentationView } from './components/AudiencePresentationView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { isAudienceWindow, launchAudienceWindow } from './utils/presenterSync';

export default function App() {
  const [decks, setDecks] = useState<PresentationDeck[]>(() => getSavedDecks());
  const [activeDeckId, setActiveId] = useState<string>(() => getActiveDeckId());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(true);

  // Modals & presentation views
  const [showThemesModal, setShowThemesModal] = useState(false);
  const [showDecksModal, setShowDecksModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState<'tools' | 'design' | 'shortcuts' | 'markdown'>('tools');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresenterConsole, setShowPresenterConsole] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(Date.now());
  const [notification, setNotification] = useState<string | null>(null);

  // Resizable split ratio between editor (left) and preview (right) in percentage
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('slidecraft_split_ratio');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 80) return parsed;
      }
    } catch {}
    return 50;
  });
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const mainContainerRef = useRef<HTMLElement>(null);

  // Drag handler for panel resizing
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!mainContainerRef.current) return;
      const rect = mainContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const relativeX = clientX - rect.left;
      const newPercentage = (relativeX / rect.width) * 100;
      // Clamp between 20% and 80% to maintain comfortable minimums on both sides
      const clamped = Math.max(20, Math.min(80, newPercentage));
      setSplitRatio(clamped);
    };

    const handlePointerUp = () => {
      setIsDraggingSplitter(false);
      try {
        localStorage.setItem('slidecraft_split_ratio', splitRatio.toString());
      } catch {}
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDraggingSplitter, splitRatio]);

  // Check for shared URL hash on initial load
  useEffect(() => {
    const sharedDeck = decodeShareUrl();
    if (sharedDeck) {
      setDecks((prev) => {
        const existing = prev.find((d) => d.id === sharedDeck.id);
        if (existing) return prev;
        return [sharedDeck, ...prev];
      });
      setActiveId(sharedDeck.id);
      saveDeck(sharedDeck);
      setNotification(`Opened shared presentation: "${sharedDeck.title}"`);
      setTimeout(() => setNotification(null), 4000);
    }
  }, []);

  // Retrieve currently active deck with safety fallback
  const activeDeck = useMemo(() => {
    return (
      decks.find((d) => d.id === activeDeckId) ||
      decks[0] ||
      STARTER_TEMPLATES[0]
    );
  }, [decks, activeDeckId]);

  // If this window was launched as the secondary Audience Display, render the clean synchronized stage
  if (isAudienceWindow()) {
    return <AudiencePresentationView initialDeck={activeDeck} />;
  }

  // Parse markdown to slides whenever markdown changes
  const slides = useMemo(() => {
    return parseMarkdownToSlides(activeDeck.markdown);
  }, [activeDeck.markdown]);

  // Keep currentSlideIndex within valid bounds
  useEffect(() => {
    if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, currentSlideIndex]);

  // Auto-save debouncing (300ms) to LocalStorage
  const saveTimeoutRef = useRef<any>(null);
  const handleUpdateActiveDeck = (updates: Partial<PresentationDeck>) => {
    const updated = {
      ...activeDeck,
      ...updates,
      updatedAt: Date.now(),
    };

    setDecks((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDeck(updated);
      setLastSavedAt(Date.now());
    }, 300);
  };

  const handleUpdateTitle = (newTitle: string) => {
    handleUpdateActiveDeck({ title: newTitle });
  };

  const handleUpdateMarkdown = (newMarkdown: string) => {
    handleUpdateActiveDeck({ markdown: newMarkdown });
  };

  const handleUpdateSettings = (newSettings: PresentationSettings) => {
    handleUpdateActiveDeck({ settings: newSettings });
  };

  const handleSelectDeck = (id: string) => {
    setActiveId(id);
    setActiveDeckId(id);
    setCurrentSlideIndex(0);
  };

  const handleCreateDeck = () => {
    const newDeck: PresentationDeck = {
      id: `deck-${Date.now()}`,
      title: 'Untitled Presentation',
      description: 'Created with SlideMD Markdown Studio',
      markdown: `# New Presentation Title\nSubtitle or description goes here\n\n---\n\n## First Slide\n\n- Point 1\n- Point 2\n\nNote:\nPresenter speaker notes go here.\n`,
      settings: {
        theme: 'obsidian',
        transition: 'slide',
        aspectRatio: '16:9',
        fontFamily: 'sans',
        showSlideNumbers: true,
        showProgressBar: true,
        centerSlides: true,
        codeHighlightTheme: 'atom-one-dark',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextDecks = [newDeck, ...decks];
    setDecks(nextDecks);
    setActiveId(newDeck.id);
    setActiveDeckId(newDeck.id);
    setCurrentSlideIndex(0);
    saveDeck(newDeck);
    setShowDecksModal(false);
  };

  const handleDuplicateDeck = (id: string) => {
    const cloned = cloneDeckInStorage(id);
    setDecks((prev) => [cloned, ...prev]);
    setActiveId(cloned.id);
    setActiveDeckId(cloned.id);
    setNotification(`Duplicated presentation: "${cloned.title}"`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteDeck = (id: string) => {
    const updated = removeDeckFromStorage(id);
    setDecks(updated);
    if (activeDeckId === id) {
      const nextId = updated[0]?.id || STARTER_TEMPLATES[0].id;
      setActiveId(nextId);
      setActiveDeckId(nextId);
      setCurrentSlideIndex(0);
    }
  };

  const handleImportDeck = (deck: PresentationDeck) => {
    setDecks((prev) => [deck, ...prev]);
    setActiveId(deck.id);
    setActiveDeckId(deck.id);
    saveDeck(deck);
    setCurrentSlideIndex(0);
    setNotification(`Imported presentation: "${deck.title}"`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenGuide = (tab: 'tools' | 'design' | 'shortcuts' | 'markdown' = 'tools') => {
    setGuideInitialTab(tab);
    setShowGuideModal(true);
  };

  const handleInsertSnippetFromGuide = (snippet: string) => {
    const current = activeDeck.markdown;
    const newMarkdown = current.trimEnd() + '\n\n' + snippet.trim() + '\n';
    handleUpdateMarkdown(newMarkdown);
    setNotification('Sample snippet added to your presentation!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Keyboard shortcuts at app level
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in textarea or input
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'textarea' || activeTag === 'input';

      if (!isInput) {
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setIsFullscreen(true);
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setShowPresenterConsole(true);
        } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleOpenGuide('tools');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Bar Navigation */}
      <TopNav
        title={activeDeck.title}
        onUpdateTitle={handleUpdateTitle}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenThemes={() => setShowThemesModal(true)}
        onOpenDecks={() => setShowDecksModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenGuide={() => handleOpenGuide('tools')}
        onStartPresenting={() => setIsFullscreen(true)}
        onOpenPresenterConsole={() => setShowPresenterConsole(true)}
        totalSlides={slides.length}
        currentSlideIndex={currentSlideIndex}
        lastSavedAt={lastSavedAt}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-indigo-900/90 border border-indigo-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Workspace Split Layout */}
      <main ref={mainContainerRef} className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Markdown Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            style={viewMode === 'split' ? { width: `${splitRatio}%` } : undefined}
            className={`h-full overflow-hidden ${
              viewMode === 'split' ? 'w-full md:w-auto shrink-0' : 'w-full'
            }`}
          >
            <MarkdownEditor
              value={activeDeck.markdown}
              onChange={handleUpdateMarkdown}
              onOpenGuide={handleOpenGuide}
              onCursorSlideChange={(idx) => {
                if (idx >= 0 && idx < slides.length) {
                  setCurrentSlideIndex(idx);
                }
              }}
              currentSlideIndex={currentSlideIndex}
              totalSlides={slides.length}
            />
          </div>
        )}

        {/* Resizable Divider (Draggable middle line in Split View) */}
        {viewMode === 'split' && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor and slide preview panels"
            onMouseDown={() => setIsDraggingSplitter(true)}
            onTouchStart={() => setIsDraggingSplitter(true)}
            onDoubleClick={() => {
              setSplitRatio(50);
              try {
                localStorage.setItem('slidecraft_split_ratio', '50');
              } catch {}
            }}
            title="Drag to resize editor and preview (Double-click to reset 50/50)"
            className={`hidden md:flex w-2 -mx-1 z-20 cursor-col-resize items-center justify-center group relative select-none transition-colors ${
              isDraggingSplitter ? 'bg-indigo-600' : 'bg-transparent hover:bg-indigo-500/50'
            }`}
          >
            {/* Visual handle indicator */}
            <div
              className={`w-0.5 rounded-full transition-all ${
                isDraggingSplitter
                  ? 'h-14 bg-white shadow-[0_0_8px_rgba(99,102,241,1)]'
                  : 'h-8 bg-slate-700 group-hover:bg-indigo-300 group-hover:h-12'
              }`}
            />
          </div>
        )}

        {/* Right Side: Live Slide Viewer */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            style={viewMode === 'split' ? { width: `${100 - splitRatio}%` } : undefined}
            className={`h-full overflow-hidden ${
              viewMode === 'split' ? 'hidden md:flex md:w-auto flex-1' : 'flex w-full'
            }`}
          >
            <SlideViewer
              slides={slides}
              currentIndex={currentSlideIndex}
              onNavigateSlide={setCurrentSlideIndex}
              settings={activeDeck.settings}
              onStartFullscreen={() => setIsFullscreen(true)}
              onOpenPresenterConsole={() => setShowPresenterConsole(true)}
              markdown={activeDeck.markdown}
              onUpdateMarkdown={handleUpdateMarkdown}
            />
          </div>
        )}
      </main>

      {/* Bottom Thumbnail Strip (Optional / Collapsible) */}
      {showThumbnailStrip && (
        <SlideThumbnailStrip
          slides={slides}
          currentIndex={currentSlideIndex}
          onSelectSlide={setCurrentSlideIndex}
          settings={activeDeck.settings}
        />
      )}

      {/* Fullscreen Conference Presentation Mode */}
      {isFullscreen && (
        <FullscreenPresentation
          slides={slides}
          initialIndex={currentSlideIndex}
          settings={activeDeck.settings}
          onClose={() => setIsFullscreen(false)}
          onOpenPresenterNotes={() => {
            setIsFullscreen(false);
            setShowPresenterConsole(true);
          }}
        />
      )}

      {/* Dual-Screen Presenter Console with Speaker Notes & Stopwatch */}
      {showPresenterConsole && (
        <PresenterModal
          slides={slides}
          currentIndex={currentSlideIndex}
          onNavigateSlide={setCurrentSlideIndex}
          settings={activeDeck.settings}
          deck={activeDeck}
          onClose={() => setShowPresenterConsole(false)}
        />
      )}

      {/* One-Click Cloud & Standalone Export Modal */}
      {showExportModal && (
        <ExportModal
          deck={activeDeck}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Theme & Transition Settings Panel */}
      {showThemesModal && (
        <ThemeSettingsPanel
          settings={activeDeck.settings}
          onChangeSettings={handleUpdateSettings}
          onClose={() => setShowThemesModal(false)}
        />
      )}

      {/* Decks Library & Starter Templates Modal */}
      {showDecksModal && (
        <DecksLibraryModal
          decks={decks}
          activeDeckId={activeDeckId}
          onSelectDeck={handleSelectDeck}
          onCreateDeck={handleCreateDeck}
          onDuplicateDeck={handleDuplicateDeck}
          onDeleteDeck={handleDeleteDeck}
          onImportDeck={handleImportDeck}
          onClose={() => setShowDecksModal(false)}
        />
      )}

      {/* Presentation Guide & Hints Modal */}
      {showGuideModal && (
        <PresentationGuideModal
          initialTab={guideInitialTab}
          onClose={() => setShowGuideModal(false)}
          onInsertSnippet={handleInsertSnippetFromGuide}
        />
      )}

      {/* Non-intrusive Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
