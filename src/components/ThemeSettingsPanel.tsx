import React, { useState, useMemo } from 'react';
import {
  X,
  Palette,
  Type,
  MoveHorizontal,
  Check,
  Save,
  Trash2,
  Sparkles,
  Sliders,
  Eye,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Copy,
} from 'lucide-react';
import {
  PresentationSettings,
  ThemeId,
  TransitionType,
  AspectRatio,
  FontFamily,
  SlideContent,
  CustomThemeColors,
  ThemeDefinition,
} from '../types/presentation';
import {
  THEMES,
  FONT_PAIRINGS,
  COLOR_HARMONY_PRESETS,
  getSavedCustomThemes,
  saveCustomThemeToStorage,
  deleteCustomThemeFromStorage,
  resolveTheme,
  resolveFontPairing,
  getWcagContrast,
  isColorLight,
} from '../utils/themes';

interface ThemeSettingsPanelProps {
  settings: PresentationSettings;
  onChangeSettings: (newSettings: PresentationSettings) => void;
  onClose: () => void;
  currentSlideContent?: SlideContent;
}

type TabType = 'presets' | 'palette' | 'typography' | 'layout';

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({
  settings,
  onChangeSettings,
  onClose,
  currentSlideContent,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('palette');
  const [previewMode, setPreviewMode] = useState<'current' | 'specimen'>('current');
  const [customThemes, setCustomThemes] = useState<Record<string, ThemeDefinition>>(() =>
    getSavedCustomThemes()
  );
  const [saveThemeName, setSaveThemeName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Active theme and active colors
  const activeTheme = useMemo(() => resolveTheme(settings), [settings]);
  const activePairing = useMemo(
    () => resolveFontPairing(settings.fontPairingId),
    [settings.fontPairingId]
  );

  // Derive working custom colors from current theme
  const currentColors: CustomThemeColors = useMemo(() => {
    if (activeTheme.customColors) {
      return activeTheme.customColors;
    }
    const isLight = activeTheme.category === 'light';
    return {
      background: activeTheme.previewBg,
      surface: isLight ? '#f8fafc' : '#1e293b',
      heading: activeTheme.headingColor,
      text: isLight ? '#334155' : '#cbd5e1',
      accent: activeTheme.accentColor,
      secondary: activeTheme.secondaryColor,
      border: isLight ? '#e2e8f0' : '#334155',
      codeBg: isLight ? '#0f172a' : '#08080f',
    };
  }, [activeTheme]);

  const [workingColors, setWorkingColors] = useState<CustomThemeColors>(currentColors);

  // Update working colors if active theme changes externally
  React.useEffect(() => {
    setWorkingColors(currentColors);
  }, [currentColors]);

  // Apply partial updates to PresentationSettings
  const updateSettings = (partial: Partial<PresentationSettings>) => {
    onChangeSettings({ ...settings, ...partial });
  };

  // Change individual color in the palette customizer
  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    const nextColors = { ...workingColors, [key]: value };
    setWorkingColors(nextColors);

    const isLight = isColorLight(nextColors.background);
    const updatedCustomTheme: ThemeDefinition = {
      id: settings.customTheme?.id || `custom-${Date.now()}`,
      name: settings.customTheme?.name || 'Custom Theme',
      category: isLight ? 'light' : 'dark',
      description: 'User-customized color palette & typography',
      previewBg: nextColors.background,
      previewAccent: nextColors.accent,
      bgClass: '',
      textClass: '',
      headingColor: nextColors.heading,
      accentColor: nextColors.accent,
      secondaryColor: nextColors.secondary,
      borderClass: '',
      cardBgClass: '',
      codeThemeClass: '',
      isCustom: true,
      customColors: nextColors,
      fontPairingId: settings.fontPairingId || 'modern-outfit',
    };

    updateSettings({
      theme: updatedCustomTheme.id,
      customTheme: updatedCustomTheme,
    });
  };

  // Select a built-in theme
  const handleSelectBuiltinTheme = (themeId: ThemeId) => {
    const targetTheme = THEMES[themeId as keyof typeof THEMES];
    if (targetTheme) {
      updateSettings({
        theme: targetTheme.id,
        customTheme: undefined,
      });
      if (targetTheme.customColors) {
        setWorkingColors(targetTheme.customColors);
      }
    }
  };

  // Select a saved custom theme
  const handleSelectSavedCustomTheme = (theme: ThemeDefinition) => {
    updateSettings({
      theme: theme.id,
      customTheme: theme,
      fontPairingId: theme.fontPairingId || settings.fontPairingId,
    });
    if (theme.customColors) {
      setWorkingColors(theme.customColors);
    }
  };

  // Apply a curated color harmony preset
  const handleApplyPreset = (presetColors: CustomThemeColors, presetName: string) => {
    setWorkingColors(presetColors);
    const isLight = isColorLight(presetColors.background);
    const customTheme: ThemeDefinition = {
      id: `custom-${presetName.toLowerCase().replace(/\s+/g, '-')}`,
      name: presetName,
      category: isLight ? 'light' : 'dark',
      description: `Harmonious ${presetName} palette`,
      previewBg: presetColors.background,
      previewAccent: presetColors.accent,
      bgClass: '',
      textClass: '',
      headingColor: presetColors.heading,
      accentColor: presetColors.accent,
      secondaryColor: presetColors.secondary,
      borderClass: '',
      cardBgClass: '',
      codeThemeClass: '',
      isCustom: true,
      customColors: presetColors,
      fontPairingId: settings.fontPairingId || 'modern-outfit',
    };

    updateSettings({
      theme: customTheme.id,
      customTheme,
    });
  };

  // Save current custom theme to localStorage
  const handleSaveTheme = () => {
    const trimmed = saveThemeName.trim();
    if (!trimmed) return;

    const themeId = `custom-${Date.now()}`;
    const isLight = isColorLight(workingColors.background);
    const newTheme: ThemeDefinition = {
      id: themeId,
      name: trimmed,
      category: isLight ? 'light' : 'dark',
      description: `Custom ${trimmed} theme created in SlideMD`,
      previewBg: workingColors.background,
      previewAccent: workingColors.accent,
      bgClass: '',
      textClass: '',
      headingColor: workingColors.heading,
      accentColor: workingColors.accent,
      secondaryColor: workingColors.secondary,
      borderClass: '',
      cardBgClass: '',
      codeThemeClass: '',
      isCustom: true,
      customColors: workingColors,
      fontPairingId: settings.fontPairingId || 'modern-outfit',
    };

    saveCustomThemeToStorage(newTheme);
    setCustomThemes(getSavedCustomThemes());
    updateSettings({
      theme: newTheme.id,
      customTheme: newTheme,
    });
    setSaveThemeName('');
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  // Delete saved custom theme
  const handleDeleteCustomTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomThemeFromStorage(themeId);
    setCustomThemes(getSavedCustomThemes());
    if (settings.theme === themeId) {
      updateSettings({
        theme: 'obsidian',
        customTheme: undefined,
      });
    }
  };

  // Font pairing change
  const handleSelectFontPairing = (pairingId: string) => {
    const chosenPairing = FONT_PAIRINGS.find((p) => p.id === pairingId);
    let updatedCustomTheme = settings.customTheme;
    if (updatedCustomTheme) {
      updatedCustomTheme = {
        ...updatedCustomTheme,
        fontPairingId: pairingId,
      };
    }
    // Also map to approximate legacy fontFamily
    const mappedFontFamily: FontFamily =
      chosenPairing?.category === 'editorial'
        ? 'serif'
        : chosenPairing?.category === 'technical'
        ? 'mono'
        : 'sans';

    updateSettings({
      fontPairingId: pairingId,
      fontFamily: mappedFontFamily,
      customTheme: updatedCustomTheme,
    });
  };

  // Accessibility contrast calculations
  const headingContrast = useMemo(
    () => getWcagContrast(workingColors.heading, workingColors.background),
    [workingColors.heading, workingColors.background]
  );

  const textContrast = useMemo(
    () => getWcagContrast(workingColors.text, workingColors.background),
    [workingColors.text, workingColors.background]
  );

  const accentContrast = useMemo(
    () => getWcagContrast(workingColors.accent, workingColors.background),
    [workingColors.accent, workingColors.background]
  );

  const transitions: { id: TransitionType; label: string }[] = [
    { id: 'slide', label: 'Slide' },
    { id: 'fade', label: 'Fade' },
    { id: 'convex', label: 'Convex 3D' },
    { id: 'zoom', label: 'Zoom' },
    { id: 'none', label: 'None' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Theme & Palette Customizer</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  Real-time Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Design custom color palettes, font pairings, and transitions with live slide preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close theme customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 bg-slate-950/60 border-b border-slate-800 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Presets & Themes</span>
            {Object.keys(customThemes).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                {Object.keys(customThemes).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('palette')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'palette'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Palette Studio (Hex)</span>
          </button>

          <button
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'typography'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Font Pairings</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'layout'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoveHorizontal className="w-4 h-4" />
            <span>Layout & Transitions</span>
          </button>
        </div>

        {/* 2-Column Studio Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Controls (Tabs) */}
          <div className="lg:col-span-6 xl:col-span-5 p-5 overflow-y-auto space-y-6 border-r border-slate-800/80 bg-slate-900/40">
            {/* TAB 1: PRESETS & THEMES */}
            {activeTab === 'presets' && (
              <div className="space-y-6">
                {/* User's Saved Custom Themes */}
                {Object.keys(customThemes).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Your Custom Themes
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Saved in browser
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.values(customThemes).map((th) => {
                        const isSelected = settings.theme === th.id;
                        return (
                          <div
                            key={th.id}
                            onClick={() => handleSelectSavedCustomTheme(th)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-md'
                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-inner"
                                style={{ backgroundColor: th.previewBg }}
                              />
                              <div
                                className="w-3 h-3 rounded-full shrink-0 -ml-1.5"
                                style={{ backgroundColor: th.previewAccent }}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-100 truncate">
                                  {th.name}
                                </div>
                                <div className="text-[10px] text-slate-400 capitalize">
                                  {th.category} mode
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                              <button
                                onClick={(e) => handleDeleteCustomTheme(th.id, e)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                                title="Delete this custom theme"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1-Click Curated Harmonic Palettes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Curated Harmonic Palettes</span>
                    </span>
                    <span className="text-[11px] text-slate-500">1-Click Generate</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COLOR_HARMONY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.colors, preset.name)}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {preset.category}
                          </span>
                        </div>
                        {/* Swatch Strip */}
                        <div className="flex h-3 rounded overflow-hidden border border-slate-800/80 w-full mb-2">
                          <div className="flex-1" style={{ backgroundColor: preset.colors.background }} />
                          <div className="flex-1" style={{ backgroundColor: preset.colors.heading }} />
                          <div className="flex-1" style={{ backgroundColor: preset.colors.accent }} />
                          <div className="flex-1" style={{ backgroundColor: preset.colors.secondary }} />
                          <div className="flex-1" style={{ backgroundColor: preset.colors.surface }} />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Built-in Theme Library */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    Built-in Themes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.values(THEMES).map((theme) => {
                      const isSelected =
                        settings.theme === theme.id && !settings.customTheme;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleSelectBuiltinTheme(theme.id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-md'
                              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
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
              </div>
            )}

            {/* TAB 2: PALETTE STUDIO (HEX COLOR PICKERS) */}
            {activeTab === 'palette' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Color Variables & Hex Pickers
                    </label>
                    <button
                      onClick={() => {
                        const defaultTheme = THEMES.obsidian;
                        if (defaultTheme.customColors) {
                          setWorkingColors(defaultTheme.customColors);
                          handleApplyPreset(defaultTheme.customColors, 'Obsidian Night');
                        }
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Obsidian</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Tune each individual color channel. Changes instantly update the live slide preview and active presentation.
                  </p>
                </div>

                {/* 2-Column Grid of Hex Color Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Background */}
                  <ColorInputRow
                    label="Slide Background"
                    varName="--slide-bg"
                    color={workingColors.background}
                    onChange={(val) => handleColorChange('background', val)}
                  />

                  {/* Surface Cards */}
                  <ColorInputRow
                    label="Card / Surface"
                    varName="--slide-surface"
                    color={workingColors.surface}
                    onChange={(val) => handleColorChange('surface', val)}
                  />

                  {/* Heading Color */}
                  <ColorInputRow
                    label="Heading (H1 - H6)"
                    varName="--slide-heading"
                    color={workingColors.heading}
                    onChange={(val) => handleColorChange('heading', val)}
                  />

                  {/* Body Text */}
                  <ColorInputRow
                    label="Body Text"
                    varName="--slide-text"
                    color={workingColors.text}
                    onChange={(val) => handleColorChange('text', val)}
                  />

                  {/* Primary Accent */}
                  <ColorInputRow
                    label="Primary Accent"
                    varName="--slide-accent"
                    color={workingColors.accent}
                    onChange={(val) => handleColorChange('accent', val)}
                  />

                  {/* Secondary Accent */}
                  <ColorInputRow
                    label="Secondary Highlight"
                    varName="--slide-secondary"
                    color={workingColors.secondary}
                    onChange={(val) => handleColorChange('secondary', val)}
                  />

                  {/* Border Color */}
                  <ColorInputRow
                    label="Borders & Dividers"
                    varName="--slide-border"
                    color={workingColors.border}
                    onChange={(val) => handleColorChange('border', val)}
                  />

                  {/* Code Block Background */}
                  <ColorInputRow
                    label="Code Block Container"
                    varName="--slide-code-bg"
                    color={workingColors.codeBg}
                    onChange={(val) => handleColorChange('codeBg', val)}
                  />
                </div>

                {/* WCAG Contrast Ratio Badges */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Accessibility & WCAG Contrast</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Against Slide Background</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">Headings</div>
                      <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                        {headingContrast.ratio}:1
                      </div>
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          headingContrast.pass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {headingContrast.label}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">Body Text</div>
                      <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                        {textContrast.ratio}:1
                      </div>
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          textContrast.pass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {textContrast.label}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">Accent</div>
                      <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                        {accentContrast.ratio}:1
                      </div>
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          accentContrast.pass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {accentContrast.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Theme as Custom Preset */}
                <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200">
                      Save as Reusable Custom Theme
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Saves this palette & font pairing to your browser and bundles it automatically into single-file deck exports.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Acme Brand 2026"
                      value={saveThemeName}
                      onChange={(e) => setSaveThemeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTheme();
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSaveTheme}
                      disabled={!saveThemeName.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                  {showSaveSuccess && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved! Available across all your presentations in SlideMD.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY PAIRINGS */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Curated Font Pairings
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Each pairing couples an expressive display headline typeface with a legible body font and crisp monospace code.
                  </p>
                </div>

                <div className="space-y-3">
                  {FONT_PAIRINGS.map((fp) => {
                    const isSelected = activePairing.id === fp.id;
                    return (
                      <button
                        key={fp.id}
                        onClick={() => handleSelectFontPairing(fp.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-md'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{fp.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300">
                              {fp.category}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                        </div>

                        {/* Visual Font Specimen */}
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-1 mb-2">
                          <div
                            style={{ fontFamily: fp.headingFont }}
                            className="text-base font-bold text-slate-100"
                          >
                            The Future of Architectural Design
                          </div>
                          <div
                            style={{ fontFamily: fp.bodyFont }}
                            className="text-xs text-slate-400 leading-normal"
                          >
                            Real-time systems delivering scalable distributed workflows with clarity.
                          </div>
                          <div
                            style={{ fontFamily: fp.monoFont }}
                            className="text-[11px] text-emerald-400 font-mono pt-0.5"
                          >
                            const computeScale = (w, h) =&gt; Math.min(w, h);
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500">{fp.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: LAYOUT & TRANSITIONS */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                {/* Slide Transition */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                    <MoveHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Slide Transition Pacing</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {transitions.map((t) => {
                      const isSelected = settings.transition === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => updateSettings({ transition: t.id })}
                          className={`p-3 rounded-xl border text-center transition-all ${
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

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Aspect Ratio
                  </label>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => updateSettings({ aspectRatio: '16:9' })}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        settings.aspectRatio === '16:9'
                          ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      16:9 Widescreen (Modern)
                    </button>
                    <button
                      onClick={() => updateSettings({ aspectRatio: '4:3' })}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        settings.aspectRatio === '4:3'
                          ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      4:3 Standard (Classic)
                    </button>
                  </div>
                </div>

                {/* Visual Slide Toggles */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.showSlideNumbers}
                      onChange={(e) => updateSettings({ showSlideNumbers: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Display slide counter (e.g. 1 / 9)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.showProgressBar}
                      onChange={(e) => updateSettings({ showProgressBar: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Show presentation progress bar at bottom of slide</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.centerSlides}
                      onChange={(e) => updateSettings({ centerSlides: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Vertically center slide content</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Scaled Slide Preview */}
          <div className="lg:col-span-6 xl:col-span-7 p-5 flex flex-col min-h-0 bg-slate-950/70">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-time Slide Canvas Preview</span>
                </span>
              </div>

              {/* Toggle Specimen vs Current Slide */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setPreviewMode('current')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    previewMode === 'current'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active Slide
                </button>
                <button
                  onClick={() => setPreviewMode('specimen')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    previewMode === 'specimen'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Design Specimen
                </button>
              </div>
            </div>

            {/* Live Interactive Scaled Slide Stage */}
            <div className="flex-1 rounded-xl border border-slate-800/80 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] overflow-hidden relative shadow-inner">
              <div
                style={{
                  width: '100%',
                  maxWidth: settings.aspectRatio === '4:3' ? '540px' : '640px',
                  aspectRatio: settings.aspectRatio === '4:3' ? '4/3' : '16/9',
                  backgroundColor: workingColors.background,
                  color: workingColors.text,
                  borderColor: workingColors.border,
                  fontFamily: activePairing.bodyFont,
                }}
                className="relative rounded-lg border shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-200 select-none"
              >
                {/* Inner Content */}
                <div className="space-y-3">
                  {previewMode === 'specimen' ? (
                    <>
                      <h1
                        style={{
                          color: workingColors.heading,
                          fontFamily: activePairing.headingFont,
                        }}
                        className="text-xl sm:text-2xl font-bold tracking-tight leading-tight"
                      >
                        Modern Architecture & Scaling
                      </h1>
                      <p
                        style={{ color: workingColors.text }}
                        className="text-xs sm:text-sm leading-relaxed"
                      >
                        Distributed microservices orchestrated at planetary scale with sub-millisecond event streaming.
                      </p>

                      {/* Columns Preview */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div
                          style={{
                            backgroundColor: workingColors.surface,
                            borderColor: workingColors.border,
                          }}
                          className="p-2.5 rounded-lg border text-[11px] space-y-1"
                        >
                          <div
                            style={{
                              color: workingColors.accent,
                              fontFamily: activePairing.headingFont,
                            }}
                            className="font-bold text-xs"
                          >
                            High Availability
                          </div>
                          <div style={{ color: workingColors.text }}>
                            Active-active multi-region replication.
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: workingColors.surface,
                            borderColor: workingColors.border,
                          }}
                          className="p-2.5 rounded-lg border text-[11px] space-y-1"
                        >
                          <div
                            style={{
                              color: workingColors.secondary,
                              fontFamily: activePairing.headingFont,
                            }}
                            className="font-bold text-xs"
                          >
                            Latency P99
                          </div>
                          <div style={{ color: workingColors.text }}>
                            Predictable performance envelope under load.
                          </div>
                        </div>
                      </div>

                      {/* Code Snippet Specimen */}
                      <pre
                        style={{
                          backgroundColor: workingColors.codeBg,
                          borderColor: workingColors.border,
                          fontFamily: activePairing.monoFont,
                        }}
                        className="p-2 rounded text-[11px] border font-mono text-slate-200 overflow-x-auto"
                      >
                        <code>export const deploy = async () =&gt; stream();</code>
                      </pre>
                    </>
                  ) : currentSlideContent ? (
                    <div
                      className="slide-content-wrapper prose max-w-none text-xs sm:text-sm"
                      style={{
                        color: workingColors.text,
                        fontFamily: activePairing.bodyFont,
                      }}
                      dangerouslySetInnerHTML={{ __html: currentSlideContent.htmlContent }}
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      No active slide content available.
                    </div>
                  )}
                </div>

                {/* Slide Footer Elements */}
                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] opacity-70">
                  <span style={{ color: workingColors.text }}>
                    {activeTheme.name} · {activePairing.name}
                  </span>
                  {settings.showSlideNumbers && (
                    <span className="font-mono" style={{ color: workingColors.text }}>
                      1 / 9
                    </span>
                  )}
                </div>

                {/* Progress Bar Preview */}
                {settings.showProgressBar && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div
                      className="h-full w-1/3 transition-all"
                      style={{ backgroundColor: workingColors.accent }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar Under Preview */}
            <div className="mt-3 py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: workingColors.accent }}
                  />
                  <span>Accent: {workingColors.accent}</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="truncate max-w-[200px]">{activePairing.name}</span>
              </div>

              <div className="font-mono text-[11px] text-indigo-400">
                {settings.aspectRatio}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Theme auto-synced with presentation deck and exports</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              Done & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ColorInputRowProps {
  label: string;
  varName: string;
  color: string;
  onChange: (hex: string) => void;
}

const ColorInputRow: React.FC<ColorInputRowProps> = ({
  label,
  varName,
  color,
  onChange,
}) => {
  return (
    <div className="p-2.5 rounded-xl border border-slate-800/90 bg-slate-950/60 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-200 truncate">{label}</div>
        <div className="text-[10px] font-mono text-slate-500 truncate">{varName}</div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Native color picker */}
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
          />
        </div>

        {/* Hex input */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          maxLength={9}
          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-slate-200 text-center uppercase focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
};
