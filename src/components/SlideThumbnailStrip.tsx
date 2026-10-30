import React from 'react';
import { SlideContent, PresentationSettings } from '../types/presentation';
import { THEMES } from '../utils/themes';

interface SlideThumbnailStripProps {
  slides: SlideContent[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  settings: PresentationSettings;
}

export const SlideThumbnailStrip: React.FC<SlideThumbnailStripProps> = ({
  slides,
  currentIndex,
  onSelectSlide,
  settings,
}) => {
  const theme = THEMES[settings.theme] || THEMES.obsidian;

  return (
    <div className="h-20 bg-slate-950/95 border-t border-slate-800/80 px-4 flex items-center gap-3 overflow-x-auto select-none shrink-0 z-10 no-scrollbar">
      <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap pl-1">
        SLIDES
      </div>

      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(index)}
            className={`relative flex-shrink-0 w-28 h-14 rounded-md overflow-hidden border text-left transition-all p-1.5 flex flex-col justify-between ${
              isActive
                ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg scale-105'
                : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: slide.backgroundColor || theme.previewBg,
            }}
          >
            <div className="flex items-center justify-between text-[9px] font-mono opacity-60">
              <span>{index + 1}</span>
              {slide.verticalIndex > 0 && <span className="text-cyan-400">sub</span>}
              {slide.speakerNotes && <span className="text-amber-400">📝</span>}
            </div>

            <div
              className="text-[10px] font-medium leading-tight truncate"
              style={{ color: theme.headingColor }}
            >
              {slide.title}
            </div>
          </button>
        );
      })}
    </div>
  );
};
