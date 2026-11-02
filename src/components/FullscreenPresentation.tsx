import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Radio,
  StickyNote,
  LayoutGrid,
} from 'lucide-react';
import { SlideContent, PresentationSettings } from '../types/presentation';
import { THEMES, FONT_CLASSES, resolveTheme, resolveFontPairing, isColorLight } from '../utils/themes';
import { renderAllMermaidInContainer } from '../utils/mermaidHelper';

interface FullscreenPresentationProps {
  slides: SlideContent[];
  initialIndex?: number;
  settings: PresentationSettings;
  onClose: () => void;
  onOpenPresenterNotes: () => void;
}

export const FullscreenPresentation: React.FC<FullscreenPresentationProps> = ({
  slides,
  initialIndex = 0,
  settings,
  onClose,
  onOpenPresenterNotes,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentFragment, setCurrentFragment] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [showOverview, setShowOverview] = useState(false);
  const [showNotesPopup, setShowNotesPopup] = useState(false);

  const prevIndexRef = useRef(currentIndex);
  const slideContentRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentIndex] || slides[0];
  const theme = resolveTheme(settings);
  const fontPairing = resolveFontPairing(settings.fontPairingId);
  const font = FONT_CLASSES[settings.fontFamily] || FONT_CLASSES.sans;

  // Request browser fullscreen when mounting
  useEffect(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // user pressed Esc natively
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle dynamic container scaling to maintain 16:9 or 4:3 aspect ratio in fullscreen
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = 1280;
      const targetHeight = settings.aspectRatio === '4:3' ? 960 : 720;

      const availableW = Math.max(100, clientWidth - 20);
      const availableH = Math.max(100, clientHeight - 20);

      const scaleW = availableW / targetWidth;
      const scaleH = availableH / targetHeight;
      const nextScale = Math.min(scaleW, scaleH);
      setScale(Math.max(nextScale, 0.15));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [settings.aspectRatio]);

  const baseWidth = 1280;
  const baseHeight = settings.aspectRatio === '4:3' ? 960 : 720;

  // Track slide index changes and initialize fragment count according to navigation direction
  useEffect(() => {
    if (currentIndex > prevIndexRef.current) {
      setSlideDirection('next');
      setCurrentFragment(0);
    } else if (currentIndex < prevIndexRef.current) {
      setSlideDirection('prev');
      setCurrentFragment(currentSlide.fragmentsCount || 0);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, currentSlide.fragmentsCount]);

  // Synchronize fragments in the DOM with active fragment step
  useEffect(() => {
    if (!slideContentRef.current) return;
    const fragmentEls = slideContentRef.current.querySelectorAll('.slide-fragment');
    fragmentEls.forEach((el: Element) => {
      const fragIdx = parseInt(el.getAttribute('data-fragment-index') || '0', 10);
      if (fragIdx <= currentFragment) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }, [currentFragment, currentIndex, currentSlide.htmlContent]);

  const isLightBg = isColorLight(currentSlide.backgroundColor) || theme.category === 'light';

  // Render Mermaid diagrams whenever slide content or theme changes
  useEffect(() => {
    if (!slideContentRef.current) return;
    renderAllMermaidInContainer(slideContentRef.current, isLightBg);
  }, [currentIndex, currentSlide.htmlContent, isLightBg]);

  const activeTransition = currentSlide.transition || settings.transition || 'slide';
  const getTransitionClass = () => {
    if (activeTransition === 'none') return '';
    if (activeTransition === 'fade') return 'slide-anim-fade';
    if (activeTransition === 'zoom') return 'slide-anim-zoom';
    if (activeTransition === 'convex') {
      return slideDirection === 'next' ? 'slide-anim-convex-next' : 'slide-anim-convex-prev';
    }
    return slideDirection === 'next' ? 'slide-anim-slide-next' : 'slide-anim-slide-prev';
  };

  const next = () => {
    if (currentFragment < currentSlide.fragmentsCount) {
      setCurrentFragment((prev) => prev + 1);
    } else if (currentIndex < slides.length - 1) {
      setSlideDirection('next');
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentFragment > 0) {
      setCurrentFragment((prev) => prev - 1);
    } else if (currentIndex > 0) {
      const prevSlide = slides[currentIndex - 1];
      setSlideDirection('prev');
      setCurrentIndex((prev) => prev - 1);
      setCurrentFragment(prevSlide.fragmentsCount || 0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview && e.key !== 'Escape' && e.key !== 'o' && e.key !== 'O') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prev();
          break;
        case 'b':
        case 'B':
        case '.':
          setIsBlackedOut((prev) => !prev);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setShowNotesPopup((prev) => !prev);
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          setShowOverview((prev) => !prev);
          break;
        case 'Escape':
          if (showOverview) {
            setShowOverview(false);
          } else if (showNotesPopup) {
            setShowNotesPopup(false);
          } else {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentFragment, showOverview, showNotesPopup]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Blackout Screen Mode for presenter pauses */}
      {isBlackedOut && (
        <div className="absolute inset-0 bg-black z-40 flex items-center justify-center">
          <span className="text-slate-600 font-mono text-sm">Paused (Press B to resume)</span>
        </div>
      )}

      {/* Main Slide Presentation Stage Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Scaled Presentation Slide Box */}
        {(() => {
          const isLightBg = isColorLight(currentSlide.backgroundColor) || isColorLight(theme.customColors?.background || theme.previewBg) || theme.category === 'light';
          const isCustomTheme = Boolean(theme.isCustom || theme.customColors);
          const customStyles: React.CSSProperties = {
            '--slide-bg': theme.customColors?.background || theme.previewBg,
            '--slide-surface': theme.customColors?.surface || (isLightBg ? '#f1f5f9' : '#1e293b'),
            '--slide-heading': theme.customColors?.heading || theme.headingColor,
            '--slide-text': theme.customColors?.text || (isLightBg ? '#0f172a' : '#f1f5f9'),
            '--slide-accent': theme.customColors?.accent || theme.accentColor,
            '--slide-secondary': theme.customColors?.secondary || theme.secondaryColor,
            '--slide-border': theme.customColors?.border || (isLightBg ? '#cbd5e1' : '#334155'),
            '--slide-code-bg': theme.customColors?.codeBg || (isLightBg ? '#0f172a' : '#08080f'),
            '--slide-heading-font': fontPairing.headingFont,
            '--slide-body-font': fontPairing.bodyFont,
            '--slide-mono-font': fontPairing.monoFont,
          } as React.CSSProperties;

          return (
            <div
              data-theme-category={isLightBg ? 'light' : 'dark'}
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                backgroundColor: currentSlide.backgroundColor || undefined,
                perspective: '1200px',
                ...customStyles,
              }}
              className={`relative shadow-2xl rounded-xl overflow-hidden border shrink-0 ${
                isCustomTheme ? 'slide-custom-theme' : (isLightBg ? 'border-slate-300' : theme.borderClass)
              } ${isCustomTheme ? '' : font.fontClass} ${
                currentSlide.backgroundColor ? '' : (isCustomTheme ? '' : theme.bgClass)
              } ${isLightBg ? 'theme-light' : 'theme-dark dark'} flex flex-col transition-all duration-300`}
            >
              <div
                className="flex-1 p-12 flex flex-col justify-start overflow-y-auto leading-relaxed"
              >
                <div
                  key={`${currentSlide.id}-${currentIndex}`}
                  ref={slideContentRef}
                  className={`slide-content-wrapper prose max-w-none w-full ${
                    settings.centerSlides ? 'my-auto' : ''
                  } ${getTransitionClass()}`}
                  style={{ color: currentSlide.customTextColor || (theme.customColors ? theme.customColors.text : (isLightBg ? '#0f172a' : '#f1f5f9')) }}
                  dangerouslySetInnerHTML={{ __html: currentSlide.htmlContent }}
                />
              </div>

              {/* Progress Bar */}
              {settings.showProgressBar && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/40">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / slides.length) * 100}%`,
                      backgroundColor: theme.customColors?.accent || theme.accentColor,
                    }}
                  />
                </div>
              )}

              {/* Slide Counter */}
              {settings.showSlideNumbers && (
                <div className={`absolute bottom-4 right-6 text-sm font-mono opacity-60 ${isLightBg ? 'text-slate-700' : 'text-slate-300'}`}>
                  {currentIndex + 1} / {slides.length}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Laser Pointer Red Glow Effect */}
      {isLaserActive && (
        <div
          className="pointer-events-none fixed z-50 w-6 h-6 rounded-full bg-red-500 shadow-[0_0_20px_8px_rgba(239,68,68,0.9)] -translate-x-1/2 -translate-y-1/2"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Subtle Floating Bottom HUD Controls */}
      <div className="absolute bottom-4 left-6 flex items-center gap-1.5 opacity-20 hover:opacity-100 transition-opacity z-30 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
        <button
          onClick={prev}
          disabled={currentIndex === 0 && currentFragment === 0}
          className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={next}
          disabled={currentIndex === slides.length - 1 && currentFragment >= currentSlide.fragmentsCount}
          className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40"
          title="Next (Right Arrow / Space)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {currentSlide.fragmentsCount > 0 && (
          <div className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-[11px] font-mono text-purple-300">
            Step {currentFragment}/{currentSlide.fragmentsCount}
          </div>
        )}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={() => setIsLaserActive(!isLaserActive)}
          className={`p-1 rounded transition-colors ${
            isLaserActive ? 'text-red-400 bg-red-950/60' : 'text-slate-300 hover:text-white'
          }`}
          title="Laser Pointer"
        >
          <Radio className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowNotesPopup(!showNotesPopup)}
          className="p-1 rounded text-slate-300 hover:text-white"
          title="Speaker Notes (S)"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowOverview(!showOverview)}
          className="p-1 rounded text-slate-300 hover:text-white"
          title="Slide Overview Matrix (O)"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            onClose();
          }}
          className="p-1 rounded text-slate-300 hover:text-rose-400 ml-1"
          title="Exit Presentation (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notes Floating Modal */}
      {showNotesPopup && (
        <div className="absolute bottom-16 right-8 w-96 max-h-72 bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md z-40 text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 font-semibold text-xs text-amber-400">
            <span>SPEAKER NOTES · SLIDE {currentIndex + 1}</span>
            <button onClick={() => setShowNotesPopup(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="text-sm overflow-y-auto max-h-56 leading-relaxed whitespace-pre-wrap">
            {currentSlide.speakerNotes || 'No notes for this slide.'}
          </div>
        </div>
      )}

      {/* Overview Matrix Grid Modal */}
      {showOverview && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-8 md:p-12 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">Slide Overview Grid</h2>
            <button
              onClick={() => setShowOverview(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
            >
              Close (Esc)
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowOverview(false);
                }}
                className={`aspect-video p-4 rounded-xl text-left border flex flex-col justify-between transition-all transform hover:scale-105 ${
                  idx === currentIndex
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
                style={{
                  backgroundColor: s.backgroundColor || theme.previewBg,
                }}
              >
                <div className="text-xs font-mono opacity-60 flex justify-between">
                  <span>{idx + 1}</span>
                  {s.speakerNotes && <span>📝</span>}
                </div>
                <div className="font-semibold text-sm truncate" style={{ color: theme.headingColor }}>
                  {s.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
