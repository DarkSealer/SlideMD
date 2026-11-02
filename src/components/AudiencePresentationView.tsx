import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Radio, CheckCircle2 } from 'lucide-react';
import { SlideContent, PresentationDeck } from '../types/presentation';
import { parseMarkdownToSlides } from '../utils/markdownParser';
import { THEMES, FONT_CLASSES, resolveTheme, resolveFontPairing, isColorLight } from '../utils/themes';
import { renderAllMermaidInContainer } from '../utils/mermaidHelper';
import { syncManager, PresenterSyncEvent } from '../utils/presenterSync';

interface AudiencePresentationViewProps {
  initialDeck: PresentationDeck;
}

export const AudiencePresentationView: React.FC<AudiencePresentationViewProps> = ({ initialDeck }) => {
  const [deck, setDeck] = useState<PresentationDeck>(initialDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFragment, setCurrentFragment] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0, active: false });
  const [isConnected, setIsConnected] = useState(false);
  const [showStatusHud, setShowStatusHud] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slideContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse slides from current deck
  const slides: SlideContent[] = parseMarkdownToSlides(deck.markdown);
  const currentSlide = slides[currentIndex] || slides[0] || {
    id: 'empty',
    horizontalIndex: 0,
    verticalIndex: 0,
    rawMarkdown: '',
    htmlContent: '<p>Loading presentation...</p>',
    speakerNotes: '',
    fragmentsCount: 0,
    title: 'Loading',
  };

  const theme = resolveTheme(deck.settings);
  const fontPairing = resolveFontPairing(deck.settings.fontPairingId);
  const font = FONT_CLASSES[deck.settings.fontFamily] || FONT_CLASSES.sans;
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

  // Request state from presenter console & subscribe to sync events
  useEffect(() => {
    // Notify presenter console that audience window is ready
    syncManager.publish({
      type: 'HEARTBEAT_ACK',
      timestamp: Date.now(),
      windowType: 'audience',
    });
    syncManager.publish({ type: 'REQUEST_SYNC' });

    const unsubscribe = syncManager.subscribe((event: PresenterSyncEvent) => {
      if (event.type === 'STATE_SYNC') {
        setCurrentIndex(event.slideIndex);
        setCurrentFragment(event.fragmentIndex);
        setIsBlackedOut(event.isBlackedOut);
        if (event.direction) setSlideDirection(event.direction);
        setIsConnected(true);
      } else if (event.type === 'LASER_MOVE') {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setLaserPos({
          x: rect.left + event.xRatio * rect.width,
          y: rect.top + event.yRatio * rect.height,
          active: event.active,
        });
      } else if (event.type === 'HEARTBEAT_PING') {
        setIsConnected(true);
        syncManager.publish({
          type: 'HEARTBEAT_ACK',
          timestamp: Date.now(),
          windowType: 'audience',
        });
      } else if (event.type === 'DECK_UPDATE') {
        setDeck(event.deck);
      }
    });

    // Auto-hide HUD overlay after 4 seconds
    const hudTimer = setTimeout(() => {
      setShowStatusHud(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(hudTimer);
    };
  }, []);

  // Synchronize fragments in the DOM with active fragment count
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

  const [scale, setScale] = useState(1);
  const baseWidth = 1280;
  const baseHeight = deck.settings.aspectRatio === '4:3' ? 960 : 720;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const availableW = Math.max(100, clientWidth - 20);
      const availableH = Math.max(100, clientHeight - 20);
      const nextScale = Math.min(availableW / baseWidth, availableH / baseHeight);
      setScale(Math.max(nextScale, 0.15));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(updateScale);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [baseWidth, baseHeight]);

  // Render Mermaid diagrams whenever slide changes
  useEffect(() => {
    if (!slideContentRef.current) return;
    renderAllMermaidInContainer(slideContentRef.current, isLightBg);
  }, [currentIndex, currentSlide.htmlContent, isLightBg]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeTransition = currentSlide.transition || deck.settings.transition || 'slide';
  const getTransitionClass = () => {
    if (activeTransition === 'none') return '';
    if (activeTransition === 'fade') return 'slide-anim-fade';
    if (activeTransition === 'zoom') return 'slide-anim-zoom';
    if (activeTransition === 'convex') {
      return slideDirection === 'next' ? 'slide-anim-convex-next' : 'slide-anim-convex-prev';
    }
    return slideDirection === 'next' ? 'slide-anim-slide-next' : 'slide-anim-slide-prev';
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 overflow-hidden select-none cursor-default"
      onMouseMove={() => setShowStatusHud(true)}
      onClick={() => {
        // Clicking once requests fullscreen if not already
        if (!document.fullscreenElement) {
          toggleFullscreen();
        }
      }}
    >
      {/* Blackout Screen Pause */}
      {isBlackedOut && (
        <div className="absolute inset-0 bg-black z-40 flex items-center justify-center">
          <span className="text-slate-700 font-mono text-sm tracking-wider">PAUSED</span>
        </div>
      )}

      {/* Main Slide Stage */}
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
        } ${isCustomTheme ? '' : font.fontClass} ${currentSlide.backgroundColor ? '' : (isCustomTheme ? '' : theme.bgClass)} ${
          isLightBg ? 'theme-light' : 'theme-dark dark'
        } flex flex-col transition-all duration-300`}
      >
        <div className="flex-1 p-12 flex flex-col justify-start overflow-y-auto leading-relaxed">
          <div
            key={`${currentSlide.id}-${currentIndex}`}
            ref={slideContentRef}
            className={`slide-content-wrapper prose max-w-none w-full ${
              deck.settings.centerSlides ? 'my-auto' : ''
            } ${getTransitionClass()}`}
            style={{ color: currentSlide.customTextColor || (theme.customColors ? theme.customColors.text : (isLightBg ? '#0f172a' : '#f1f5f9')) }}
            dangerouslySetInnerHTML={{ __html: currentSlide.htmlContent }}
          />
        </div>

        {/* Progress Bar */}
        {deck.settings.showProgressBar && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/40">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / Math.max(1, slides.length)) * 100}%`,
                backgroundColor: theme.customColors?.accent || theme.accentColor,
              }}
            />
          </div>
        )}

        {/* Slide Counter */}
        {deck.settings.showSlideNumbers && (
          <div className="absolute bottom-4 right-6 text-xs font-mono text-slate-500 select-none">
            {currentIndex + 1} / {slides.length}
          </div>
        )}
      </div>

      {/* Live Mirrored Laser Pointer */}
      {laserPos.active && (
        <div
          className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${laserPos.x}px`,
            top: `${laserPos.y}px`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-rose-500/30 animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-rose-600 border border-white shadow-[0_0_15px_#f43f5e] relative" />
          </div>
        </div>
      )}

      {/* Subtle Projector Connection HUD (Floating) */}
      <div
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/80 backdrop-blur-md text-xs font-medium text-slate-300 shadow-xl transition-opacity duration-300 ${
          showStatusHud ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-medium text-slate-300">
            {isConnected ? 'Projector Synced' : 'Connecting to Presenter...'}
          </span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors ml-1"
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
