import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  StickyNote,
  Radio,
  Sparkles,
  Palette,
  Check,
  RotateCcw,
} from 'lucide-react';
import { SlideContent, PresentationSettings } from '../types/presentation';
import { THEMES, FONT_CLASSES, isColorLight } from '../utils/themes';
import { setSlideTextColorInMarkdown, wrapTextWithColor } from '../utils/markdownParser';
import { renderAllMermaidInContainer } from '../utils/mermaidHelper';

interface SlideViewerProps {
  slides: SlideContent[];
  currentIndex: number;
  onNavigateSlide: (newIndex: number) => void;
  settings: PresentationSettings;
  onStartFullscreen: () => void;
  onOpenPresenterConsole: () => void;
  markdown?: string;
  onUpdateMarkdown?: (newMarkdown: string) => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  slides,
  currentIndex,
  onNavigateSlide,
  settings,
  onStartFullscreen,
  onOpenPresenterConsole,
  markdown = '',
  onUpdateMarkdown,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [activeFragment, setActiveFragment] = useState(0);
  const [showAllFragments, setShowAllFragments] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#6ee7b7');
  const [highlightedText, setHighlightedText] = useState('');
  const [isLaserPointerActive, setIsLaserPointerActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [previewTransitionTrigger, setPreviewTransitionTrigger] = useState(0);

  const prevIndexRef = useRef(currentIndex);
  const prevTransitionRef = useRef(settings.transition);
  const slideContentRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentIndex] || slides[0];
  const theme = THEMES[settings.theme] || THEMES.obsidian;
  const font = FONT_CLASSES[settings.fontFamily] || FONT_CLASSES.sans;

  // Track slide direction and fragment step initialization on slide change
  useEffect(() => {
    if (currentIndex > prevIndexRef.current) {
      setSlideDirection('next');
      setActiveFragment(0);
      setShowAllFragments(false);
    } else if (currentIndex < prevIndexRef.current) {
      setSlideDirection('prev');
      // Stepping backwards into slide: reveal fragments so presenter can step back through
      setActiveFragment(currentSlide.fragmentsCount || 0);
      setShowAllFragments(false);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, currentSlide.fragmentsCount]);

  // Preview transition trigger when user changes transition setting
  useEffect(() => {
    if (settings.transition !== prevTransitionRef.current) {
      prevTransitionRef.current = settings.transition;
      setPreviewTransitionTrigger((c) => c + 1);
    }
  }, [settings.transition]);

  // Sync fragment visibility with DOM elements to execute smooth CSS animations
  useEffect(() => {
    if (!slideContentRef.current) return;
    const fragmentEls = slideContentRef.current.querySelectorAll('.slide-fragment');
    fragmentEls.forEach((el: Element) => {
      const fragIdx = parseInt(el.getAttribute('data-fragment-index') || '0', 10);
      if (showAllFragments || fragIdx <= activeFragment) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }, [activeFragment, currentIndex, currentSlide.htmlContent, showAllFragments]);

  // Handle dynamic container scaling to maintain 16:9 or 4:3 aspect ratio and fill the right side
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = 1280;
      const targetHeight = settings.aspectRatio === '4:3' ? 960 : 720;

      // Available space with minimal padding (16px total) so slide preview fills the right side
      const availableW = Math.max(100, clientWidth - 20);
      const availableH = Math.max(100, clientHeight - 20);

      const scaleW = availableW / targetWidth;
      const scaleH = availableH / targetHeight;
      // Scale to maximally fit within available width and height
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

  // Calculate transition class based on slide-level directive or global setting
  const activeTransition = currentSlide.transition || settings.transition || 'slide';
  const getTransitionClass = () => {
    if (activeTransition === 'none') return '';
    if (activeTransition === 'fade') return 'slide-anim-fade';
    if (activeTransition === 'zoom') return 'slide-anim-zoom';
    if (activeTransition === 'convex') {
      return slideDirection === 'next' ? 'slide-anim-convex-next' : 'slide-anim-convex-prev';
    }
    // Default 'slide'
    return slideDirection === 'next' ? 'slide-anim-slide-next' : 'slide-anim-slide-prev';
  };

  // Handle fragment steps vs slide advances
  const handleNext = () => {
    if (!showAllFragments && activeFragment < currentSlide.fragmentsCount) {
      setActiveFragment((prev) => prev + 1);
    } else if (currentIndex < slides.length - 1) {
      setSlideDirection('next');
      onNavigateSlide(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!showAllFragments && activeFragment > 0) {
      setActiveFragment((prev) => prev - 1);
    } else if (currentIndex > 0) {
      setSlideDirection('prev');
      onNavigateSlide(currentIndex - 1);
    }
  };

  // Keyboard navigation when focusing on slide viewer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      onStartFullscreen();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      onOpenPresenterConsole();
    }
  };

  // Laser pointer mouse move tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isLaserPointerActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const baseWidth = 1280;
  const baseHeight = settings.aspectRatio === '4:3' ? 960 : 720;

  // Custom slide background override if provided in slide markdown directives
  const slideBackground = currentSlide.backgroundColor || undefined;
  const isLightBg = isColorLight(slideBackground) || theme.category === 'light';
  const effectiveTextColor = currentSlide.customTextColor || (isLightBg ? '#0f172a' : '#f1f5f9');

  // Render Mermaid diagrams whenever slide content or theme mode changes
  useEffect(() => {
    if (!slideContentRef.current) return;
    renderAllMermaidInContainer(slideContentRef.current, isLightBg);
  }, [currentIndex, currentSlide.htmlContent, isLightBg]);

  const handleApplySlideColor = (color: string | null) => {
    if (onUpdateMarkdown && markdown) {
      const nextMd = setSlideTextColorInMarkdown(markdown, currentIndex, color);
      onUpdateMarkdown(nextMd);
    }
  };

  const handleApplyTextColorToSelection = (color: string) => {
    if (onUpdateMarkdown && markdown && highlightedText) {
      const nextMd = wrapTextWithColor(markdown, highlightedText, color);
      onUpdateMarkdown(nextMd);
      setHighlightedText('');
    }
  };

  const handleCaptureSelection = () => {
    const sel = window.getSelection()?.toString();
    if (sel && sel.trim().length > 0) {
      setHighlightedText(sel.trim());
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative select-none focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Slide Canvas Header Controls */}
      <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 capitalize">{theme.name}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono text-[11px]">{settings.aspectRatio}</span>
          {currentSlide.customTextColor && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{
                borderColor: currentSlide.customTextColor,
                color: currentSlide.customTextColor,
              }}
            >
              {currentSlide.customTextColor}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Text Color Picker Tool */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showColorPicker || currentSlide.customTextColor
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Change text color (syncs to .md file)"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: currentSlide.customTextColor || selectedColor }} />
              <span className="hidden sm:inline">Text Color</span>
            </button>

            {showColorPicker && (
              <div className="absolute top-9 right-0 w-72 bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md z-40 text-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-200">Text Contrast & Color</span>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Swatches */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1.5">Preset Swatches</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { color: '#ffffff', label: 'White' },
                      { color: '#0f172a', label: 'Dark Slate' },
                      { color: '#6ee7b7', label: 'Mint Green' },
                      { color: '#fde68a', label: 'Amber Gold' },
                      { color: '#7dd3fc', label: 'Sky Cyan' },
                      { color: '#fda4af', label: 'Rose' },
                      { color: '#d8b4fe', label: 'Purple' },
                      { color: '#fb923c', label: 'Orange' },
                      { color: '#e2e8f0', label: 'Light Slate' },
                      { color: '#475569', label: 'Slate Muted' },
                    ].map(({ color, label }) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={label}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-transform hover:scale-110 ${
                          selectedColor.toLowerCase() === color.toLowerCase()
                            ? 'ring-2 ring-indigo-500 scale-105'
                            : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor.toLowerCase() === color.toLowerCase() && (
                          <Check className={`w-3 h-3 ${isColorLight(color) ? 'text-slate-900' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom hex input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[11px] text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      handleApplySlideColor(selectedColor);
                      setShowColorPicker(false);
                    }}
                    className="w-full py-1.5 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply to Slide in .md</span>
                  </button>

                  {highlightedText ? (
                    <button
                      onClick={() => {
                        handleApplyTextColorToSelection(selectedColor);
                        setShowColorPicker(false);
                      }}
                      className="w-full py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors truncate"
                      title={`Wrap "${highlightedText}" in colored span`}
                    >
                      Wrap &quot;{highlightedText.slice(0, 15)}...&quot; in .md
                    </button>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic text-center">
                      Highlight any text on the slide to wrap it in a colored span in .md
                    </p>
                  )}

                  {currentSlide.customTextColor && (
                    <button
                      onClick={() => {
                        handleApplySlideColor(null);
                        setShowColorPicker(false);
                      }}
                      className="w-full py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Slide to Theme Default</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setIsLaserPointerActive(!isLaserPointerActive)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isLaserPointerActive
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Laser Pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Laser</span>
          </button>

          {/* Speaker Notes Drawer Toggle */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              showNotesDrawer
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Peek Speaker Notes"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Fullscreen Mode Button */}
          <button
            onClick={onStartFullscreen}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
            title="Enter Fullscreen Presentation (F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage Viewport */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-2 sm:p-3 overflow-hidden relative bg-slate-950/80 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleCaptureSelection}
      >
        {/* Scaled Presentation Slide Box */}
        <div
          data-theme-category={isLightBg ? 'light' : 'dark'}
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className={`relative shadow-2xl rounded-xl overflow-hidden border shrink-0 ${
            isLightBg ? 'border-slate-300' : theme.borderClass
          } ${font.fontClass} ${
            slideBackground ? '' : theme.bgClass
          } ${isLightBg ? 'theme-light' : 'theme-dark dark'} flex flex-col transition-all duration-300`}
        >
          {/* Custom Background if specified */}
          {slideBackground && (
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{ backgroundColor: slideBackground }}
            />
          )}

          {/* Slide Inner Body */}
          <div
            className="flex-1 p-12 flex flex-col justify-start overflow-y-auto leading-relaxed"
            style={{ perspective: '1200px' }}
          >
            <div
              key={`${currentSlide.id}-${currentIndex}-${previewTransitionTrigger}`}
              ref={slideContentRef}
              className={`slide-content-wrapper prose max-w-none w-full ${
                settings.centerSlides ? 'my-auto' : ''
              } ${getTransitionClass()}`}
              style={{ color: effectiveTextColor }}
              dangerouslySetInnerHTML={{ __html: currentSlide.htmlContent }}
            />
          </div>

          {/* Progress Bar */}
          {settings.showProgressBar && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/40">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / slides.length) * 100}%`,
                  backgroundColor: theme.accentColor,
                }}
              />
            </div>
          )}

          {/* Slide Numbers */}
          {settings.showSlideNumbers && (
            <div className="absolute bottom-3 right-5 text-xs font-mono font-medium opacity-60">
              {currentIndex + 1} / {slides.length}
            </div>
          )}
        </div>

        {/* Laser Pointer Red Glow Effect */}
        {isLaserPointerActive && (
          <div
            className="pointer-events-none fixed z-50 w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_6px_rgba(239,68,68,0.8)] -translate-x-1/2 -translate-y-1/2"
            style={{ left: laserPos.x, top: laserPos.y }}
          />
        )}

        {/* Floating In-Preview Speaker Notes Drawer */}
        {showNotesDrawer && (
          <div className="absolute bottom-6 right-6 w-80 max-h-64 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md z-30 flex flex-col text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400">
                <StickyNote className="w-3.5 h-3.5" />
                <span>SPEAKER NOTES</span>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-48 text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-xs">
              {currentSlide.speakerNotes && currentSlide.speakerNotes.trim() ? (
                currentSlide.speakerNotes
              ) : (
                <span className="text-slate-500 italic">No notes written for this slide yet. Type &quot;Note:&quot; in markdown to add presenter notes.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Bar */}
      <div className="h-12 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 && (showAllFragments || activeFragment === 0)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors font-medium"
            title="Previous Slide / Fragment (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === slides.length - 1 && (showAllFragments || activeFragment >= currentSlide.fragmentsCount)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors font-medium"
            title="Next Slide / Fragment (Right Arrow / Space)"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {currentSlide.fragmentsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-950/50 border border-purple-800/80 rounded-lg px-2.5 py-1 text-purple-200 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {showAllFragments
                  ? `All ${currentSlide.fragmentsCount} Steps Shown`
                  : `Step ${activeFragment} of ${currentSlide.fragmentsCount}`}
              </span>
              <button
                onClick={() => {
                  if (showAllFragments) {
                    setShowAllFragments(false);
                    setActiveFragment(0);
                  } else if (activeFragment < currentSlide.fragmentsCount) {
                    setActiveFragment(currentSlide.fragmentsCount);
                  } else {
                    setActiveFragment(0);
                  }
                }}
                className="ml-1 px-1.5 py-0.5 rounded bg-purple-800/60 hover:bg-purple-700 text-[10px] font-semibold text-purple-100 transition-colors"
                title="Toggle all steps visible or test step animation"
              >
                {showAllFragments || activeFragment >= currentSlide.fragmentsCount ? 'Reset Steps' : 'Show All'}
              </button>
            </div>
          )}
        </div>

        {/* Slide Title Jump Selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentIndex}
            onChange={(e) => onNavigateSlide(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] sm:max-w-xs truncate"
          >
            {slides.map((s, idx) => (
              <option key={s.id} value={idx}>
                {idx + 1}. {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
