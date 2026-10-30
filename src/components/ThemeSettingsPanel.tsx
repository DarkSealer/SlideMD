import React from 'react';
import {
  X,
  Palette,
  Type,
  MoveHorizontal,
  Ratio,
  Check,
  Settings,
} from 'lucide-react';
import {
  PresentationSettings,
  ThemeId,
  TransitionType,
  AspectRatio,
  FontFamily,
} from '../types/presentation';
import { THEMES, FONT_CLASSES } from '../utils/themes';

interface ThemeSettingsPanelProps {
  settings: PresentationSettings;
  onChangeSettings: (newSettings: PresentationSettings) => void;
  onClose: () => void;
}

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({
  settings,
  onChangeSettings,
  onClose,
}) => {
  const update = (partial: Partial<PresentationSettings>) => {
    onChangeSettings({ ...settings, ...partial });
  };

  const transitions: { id: TransitionType; label: string; desc: string }[] = [
    { id: 'slide', label: 'Slide', desc: 'Smooth horizontal glide' },
    { id: 'fade', label: 'Fade', desc: 'Gentle cross-fade dissolve' },
    { id: 'convex', label: 'Convex', desc: '3D cylinder turn' },
    { id: 'zoom', label: 'Zoom', desc: 'Dynamic scale zoom' },
    { id: 'none', label: 'Instant', desc: 'Immediate transition' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/70 border border-indigo-800/80 rounded-lg text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Presentation Themes & Styling</h2>
              <p className="text-xs text-slate-400">Customize color palettes, typography, and transition pacing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Section 1: Themes Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Theme Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(THEMES).map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => update({ theme: theme.id })}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-md scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.previewBg }}
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.previewAccent }}
                        />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {theme.name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {theme.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Typography Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Typography Pairing</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(FONT_CLASSES) as FontFamily[]).map((f) => {
                const isSelected = settings.fontFamily === f;
                return (
                  <button
                    key={f}
                    onClick={() => update({ fontFamily: f })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-medium">{FONT_CLASSES[f].label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 capitalize">{f} system</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Transition Effects */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span>Slide Transition</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {transitions.map((t) => {
                const isSelected = settings.transition === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => update({ transition: t.id })}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Aspect Ratio & Slide Layout Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ratio className="w-3.5 h-3.5" />
                <span>Aspect Ratio</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => update({ aspectRatio: '16:9' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    settings.aspectRatio === '16:9'
                      ? 'bg-slate-800 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  16:9 Widescreen
                </button>
                <button
                  onClick={() => update({ aspectRatio: '4:3' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    settings.aspectRatio === '4:3'
                      ? 'bg-slate-800 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  4:3 Standard
                </button>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="space-y-2 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.showSlideNumbers}
                  onChange={(e) => update({ showSlideNumbers: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Display Slide Numbers</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.showProgressBar}
                  onChange={(e) => update({ showProgressBar: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Show Presentation Progress Bar</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.centerSlides}
                  onChange={(e) => update({ centerSlides: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Vertically Center Slide Contents</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
