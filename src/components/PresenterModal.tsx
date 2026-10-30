import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Timer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Type,
  Radio,
  Tv,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { SlideContent, PresentationSettings, PresentationDeck } from '../types/presentation';
import { THEMES, isColorLight } from '../utils/themes';
import { renderAllMermaidInContainer } from '../utils/mermaidHelper';
import { syncManager, launchAudienceWindow, PresenterSyncEvent } from '../utils/presenterSync';

interface PresenterModalProps {
  slides: SlideContent[];
  currentIndex: number;
  onNavigateSlide: (index: number) => void;
  settings: PresentationSettings;
  deck?: PresentationDeck;
  onClose: () => void;
}

export const PresenterModal: React.FC<PresenterModalProps> = ({
  slides,
  currentIndex,
  onNavigateSlide,
  settings,
  deck,
  onClose,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [notesFontSize, setNotesFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [currentFragment, setCurrentFragment] = useState(0);
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [isAudienceConnected, setIsAudienceConnected] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0, active: false });

  const currentSlide = slides[currentIndex] || slides[0];
  const nextSlide = slides[currentIndex + 1] || null;
  const theme = THEMES[settings.theme] || THEMES.obsidian;
  const currentSlideContentRef = useRef<HTMLDivElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const isCurrentLight = isColorLight(currentSlide.backgroundColor) || theme.category === 'light';

  // Broadcast current presentation state to external windows
  const broadcastCurrentState = (slideIdx: number, fragIdx: number, blackedOut: boolean, dir?: 'next' | 'prev') => {
    syncManager.publish({
      type: 'STATE_SYNC',
      slideIndex: slideIdx,
      fragmentIndex: fragIdx,
      isBlackedOut: blackedOut,
      direction: dir,
    });
  };

  // Setup dual-monitor sync channel listeners and heartbeats
  useEffect(() => {
    broadcastCurrentState(currentIndex, currentFragment, isBlackedOut);

    // Initial ping to discover any already-open audience window
    syncManager.publish({ type: 'HEARTBEAT_PING', timestamp: Date.now() });

    const pingInterval = setInterval(() => {
      syncManager.publish({ type: 'HEARTBEAT_PING', timestamp: Date.now() });
    }, 2500);

    const unsubscribe = syncManager.subscribe((event: PresenterSyncEvent) => {
      if (event.type === 'HEARTBEAT_ACK' && event.windowType === 'audience') {
        setIsAudienceConnected(true);
      } else if (event.type === 'REQUEST_SYNC') {
        setIsAudienceConnected(true);
        broadcastCurrentState(currentIndex, currentFragment, isBlackedOut);
      }
    });

    return () => {
      clearInterval(pingInterval);
      unsubscribe();
    };
  }, [currentIndex, currentFragment, isBlackedOut]);

  // Synchronize fragments in presenter preview
  useEffect(() => {
    if (!currentSlideContentRef.current) return;
    const fragmentEls = currentSlideContentRef.current.querySelectorAll('.slide-fragment');
    fragmentEls.forEach((el: Element) => {
      const fragIdx = parseInt(el.getAttribute('data-fragment-index') || '0', 10);
      if (fragIdx <= currentFragment) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }, [currentFragment, currentIndex, currentSlide.htmlContent]);

  // Render Mermaid diagrams in presenter console
  useEffect(() => {
    if (!currentSlideContentRef.current) return;
    renderAllMermaidInContainer(currentSlideContentRef.current, isCurrentLight);
  }, [currentIndex, currentSlide.htmlContent, isCurrentLight]);

  // Real-time wall clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Presentation stopwatch
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentFragment < currentSlide.fragmentsCount) {
      const nextFrag = currentFragment + 1;
      setCurrentFragment(nextFrag);
      broadcastCurrentState(currentIndex, nextFrag, isBlackedOut, 'next');
    } else if (currentIndex < slides.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentFragment(0);
      onNavigateSlide(nextIdx);
      broadcastCurrentState(nextIdx, 0, isBlackedOut, 'next');
    }
  };

  const handlePrev = () => {
    if (currentFragment > 0) {
      const prevFrag = currentFragment - 1;
      setCurrentFragment(prevFrag);
      broadcastCurrentState(currentIndex, prevFrag, isBlackedOut, 'prev');
    } else if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevFragCount = slides[prevIdx]?.fragmentsCount || 0;
      setCurrentFragment(prevFragCount);
      onNavigateSlide(prevIdx);
      broadcastCurrentState(prevIdx, prevFragCount, isBlackedOut, 'prev');
    }
  };

  const toggleBlackout = () => {
    const nextState = !isBlackedOut;
    setIsBlackedOut(nextState);
    broadcastCurrentState(currentIndex, currentFragment, nextState);
  };

  // Handle laser tracking over current slide preview
  const handleMouseMovePreview = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const xClamped = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const yClamped = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const xRatio = xClamped / rect.width;
    const yRatio = yClamped / rect.height;

    setLaserPos({ x: xClamped, y: yClamped, active: true });

    syncManager.publish({
      type: 'LASER_MOVE',
      xRatio,
      yRatio,
      active: true,
    });
  };

  const handleMouseLeavePreview = () => {
    setLaserPos((prev) => ({ ...prev, active: false }));
    syncManager.publish({
      type: 'LASER_MOVE',
      xRatio: 0,
      yRatio: 0,
      active: false,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleBlackout();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLaserActive((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentFragment, isBlackedOut, isLaserActive]);

  const fontClassMap = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-slate-100 select-none">
      {/* Top Telemetry & Controls Bar */}
      <div className="h-14 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-xs sm:text-sm tracking-wide text-white">PRESENTER CONSOLE</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Wall Clock */}
          <div className="hidden sm:flex items-center gap-2 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Elapsed Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-cyan-400 font-semibold">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>{formatTimer(seconds)}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
                title={isRunning ? 'Pause Timer' : 'Resume Timer'}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setSeconds(0);
                  setIsRunning(false);
                }}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dual-Display Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dual Monitor Sync Button & Status */}
          <button
            onClick={() => launchAudienceWindow(deck?.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
              isAudienceConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/60'
                : 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900/60'
            }`}
            title="Open clean presentation window to drag to your projector or external monitor"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isAudienceConnected ? 'Projector Synced' : 'Launch Projector Window'}
            </span>
            <span className="md:hidden">Projector</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setIsLaserActive(!isLaserActive)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isLaserActive
                ? 'bg-rose-950 text-rose-300 border-rose-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Laser Pointer on Projector (L)"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Laser (L)</span>
          </button>

          {/* Blackout Toggle */}
          <button
            onClick={toggleBlackout}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isBlackedOut
                ? 'bg-amber-950 text-amber-300 border-amber-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Blackout / Pause Audience Display (B)"
          >
            {isBlackedOut ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isBlackedOut ? 'Paused (B)' : 'Pause (B)'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Notes font sizing */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
            <Type className="w-3.5 h-3.5 mr-1" />
            {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setNotesFontSize(size)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  notesFontSize === size ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Presenter Console (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Dual Console Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6">
        {/* Left Column: Live Previews (Current Slide & Next Slide) */}
        <div className="w-full md:w-7/12 flex flex-col gap-4 overflow-hidden">
          {/* Current Slide Confidence Box */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-0 shadow-xl">
            <div className="h-8 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">CURRENT SLIDE</span>
                {currentSlide.fragmentsCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                    Step {currentFragment} of {currentSlide.fragmentsCount}
                  </span>
                )}
                {isBlackedOut && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                    BLACKOUT ACTIVE
                  </span>
                )}
              </div>
              <span className="truncate max-w-xs">{currentSlide.title}</span>
            </div>

            <div
              ref={previewBoxRef}
              onMouseMove={handleMouseMovePreview}
              onMouseLeave={handleMouseLeavePreview}
              className={`flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-950 relative ${
                isLaserActive ? 'cursor-crosshair' : ''
              }`}
            >
              <div
                data-theme-category={isCurrentLight ? 'light' : 'dark'}
                className={`w-full aspect-video rounded-xl p-6 sm:p-8 shadow-inner border border-slate-800 overflow-y-auto flex flex-col justify-center presenter-preview relative ${
                  isCurrentLight ? 'theme-light' : 'theme-dark dark'
                }`}
                style={{
                  backgroundColor: currentSlide.backgroundColor || theme.previewBg,
                  color: isCurrentLight ? '#0f172a' : '#f8fafc',
                }}
              >
                <div
                  ref={currentSlideContentRef}
                  className="slide-content-wrapper prose max-w-none text-xs sm:text-sm"
                  style={{ color: currentSlide.customTextColor || (isCurrentLight ? '#0f172a' : '#f8fafc') }}
                  dangerouslySetInnerHTML={{ __html: currentSlide.htmlContent }}
                />

                {/* Laser Pointer Preview */}
                {laserPos.active && (
                  <div
                    className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white shadow-[0_0_10px_#f43f5e]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Slide Preview Box */}
          <div className="h-44 sm:h-48 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shrink-0 shadow-lg">
            <div className="h-7 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="text-cyan-400">NEXT SLIDE PREVIEW</span>
              <span className="truncate max-w-xs">{nextSlide ? nextSlide.title : 'End of Presentation'}</span>
            </div>
            <div className="flex-1 p-3 flex items-center justify-center bg-slate-950/50">
              {nextSlide ? (
                (() => {
                  const isNextLight = isColorLight(nextSlide.backgroundColor) || theme.category === 'light';
                  return (
                    <div
                      data-theme-category={isNextLight ? 'light' : 'dark'}
                      className={`w-72 aspect-video rounded-lg p-3 overflow-hidden border border-slate-800 text-[10px] ${
                        isNextLight ? 'theme-light' : 'theme-dark dark'
                      }`}
                      style={{
                        backgroundColor: nextSlide.backgroundColor || theme.previewBg,
                        color: isNextLight ? '#0f172a' : '#f8fafc',
                      }}
                    >
                      <div className="font-bold truncate mb-1">{nextSlide.title}</div>
                      <div className="opacity-70 line-clamp-3">
                        {nextSlide.htmlContent.replace(/<[^>]*>?/gm, ' ')}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-xs text-slate-600 font-mono">No more slides in deck</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Private Speaker Script & Navigation Dock */}
        <div className="w-full md:w-5/12 flex flex-col gap-4 overflow-hidden">
          {/* Speaker Notes Box */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
            <div className="h-8 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 shrink-0">
              <span className="text-amber-400 font-bold">PRIVATE SPEAKER SCRIPT</span>
              <span className="text-[11px] text-slate-500 font-mono">Audience cannot see this</span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-slate-900/60 font-sans text-slate-200 leading-relaxed select-text">
              {currentSlide.speakerNotes && currentSlide.speakerNotes.trim() ? (
                <div className={`whitespace-pre-wrap ${fontClassMap[notesFontSize]}`}>
                  {currentSlide.speakerNotes}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <span className="text-sm">No speaker notes written for this slide.</span>
                  <span className="text-xs text-slate-700 mt-1">
                    Add notes in the editor using <code className="text-amber-500/70 font-mono">Note: talking points</code>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Large Navigation & Slide Advance Dock */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 && currentFragment === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back (←)</span>
            </button>

            <div className="text-center px-2">
              <div className="text-xs font-mono text-slate-400">
                <span className="text-white font-bold text-sm">{currentIndex + 1}</span> / {slides.length}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1 && currentFragment >= currentSlide.fragmentsCount}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-950 flex items-center justify-center gap-2"
            >
              <span>{currentFragment < currentSlide.fragmentsCount ? 'Reveal (Space)' : 'Next (→)'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
