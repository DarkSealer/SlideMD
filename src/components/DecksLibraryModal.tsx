import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Upload,
  Calendar,
  Sparkles,
  CheckCircle,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Briefcase,
  Minimize2,
  Palette,
  GraduationCap,
  Terminal,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react';
import { PresentationDeck, TemplateCategory } from '../types/presentation';
import { STARTER_TEMPLATES } from '../utils/storage';
import { resolveTheme, resolveFontPairing } from '../utils/themes';
import { parseMarkdownToSlides } from '../utils/markdownParser';

interface DecksLibraryModalProps {
  decks: PresentationDeck[];
  activeDeckId: string;
  onSelectDeck: (id: string) => void;
  onCreateDeck: () => void;
  onDuplicateDeck: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onImportDeck: (deck: PresentationDeck) => void;
  onClose: () => void;
  initialTab?: 'templates' | 'saved';
}

const CATEGORIES: Array<{
  id: 'All' | TemplateCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'All',
    label: 'All Templates',
    icon: Layers,
    description: 'Browse our complete collection of pre-designed presentation decks',
  },
  {
    id: 'Corporate',
    label: 'Corporate',
    icon: Briefcase,
    description: 'Executive QBRs, board decks, product roadmaps & venture pitches',
  },
  {
    id: 'Minimalist',
    label: 'Minimalist',
    icon: Minimize2,
    description: 'High-contrast editorial grids, Swiss typography & essentialist keynotes',
  },
  {
    id: 'Creative',
    label: 'Creative',
    icon: Palette,
    description: 'Brand lookbooks, agency direction, media launches & visual storytelling',
  },
  {
    id: 'Academic',
    label: 'Academic',
    icon: GraduationCap,
    description: 'Research paper defenses, KaTeX proofs, ablation tables & university seminars',
  },
  {
    id: 'Technical',
    label: 'Technical',
    icon: Terminal,
    description: 'System architecture, Mermaid topologies, benchmarks & engineering workshops',
  },
];

export const DecksLibraryModal: React.FC<DecksLibraryModalProps> = ({
  decks,
  activeDeckId,
  onSelectDeck,
  onCreateDeck,
  onDuplicateDeck,
  onDeleteDeck,
  onImportDeck,
  onClose,
  initialTab = 'templates',
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'templates'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'All' | TemplateCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<PresentationDeck | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [customDeckTitle, setCustomDeckTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-compute parsed slides for each starter template
  const templatesWithSlides = useMemo(() => {
    return STARTER_TEMPLATES.map((tmpl) => {
      const parsedSlides = parseMarkdownToSlides(tmpl.markdown);
      return {
        template: tmpl,
        slides: parsedSlides,
        slideCount: parsedSlides.length,
      };
    });
  }, []);

  // Filtered templates based on category and search query
  const filteredTemplates = useMemo(() => {
    return templatesWithSlides.filter(({ template }) => {
      const matchesCategory =
        selectedCategory === 'All' || template.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = template.title.toLowerCase().includes(q);
      const inDesc = template.description.toLowerCase().includes(q);
      const inCategory = (template.category || '').toLowerCase().includes(q);
      const inTags = (template.tags || []).some((t) => t.toLowerCase().includes(q));
      return inTitle || inDesc || inCategory || inTags;
    });
  }, [templatesWithSlides, selectedCategory, searchQuery]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: STARTER_TEMPLATES.length };
    for (const tmpl of STARTER_TEMPLATES) {
      if (tmpl.category) {
        counts[tmpl.category] = (counts[tmpl.category] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Active preview slides
  const previewSlides = useMemo(() => {
    if (!previewTemplate) return [];
    return parseMarkdownToSlides(previewTemplate.markdown);
  }, [previewTemplate]);

  const handleOpenTemplatePreview = (tmpl: PresentationDeck) => {
    setPreviewTemplate(tmpl);
    setPreviewSlideIndex(0);
    setCustomDeckTitle(tmpl.title);
  };

  const handleUseTemplate = (tmpl: PresentationDeck, overrideTitle?: string) => {
    const finalTitle = (overrideTitle ?? tmpl.title).trim() || tmpl.title;
    onImportDeck({
      ...tmpl,
      id: `deck-${Date.now()}`,
      title: finalTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.title && parsed.markdown) {
            onImportDeck({
              ...parsed,
              id: `deck-${Date.now()}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            onClose();
            return;
          }
        }

        // Otherwise assume markdown
        const newDeck: PresentationDeck = {
          id: `deck-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Imported from ${file.name}`,
          markdown: text,
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
        onImportDeck(newDeck);
        onClose();
      } catch (err) {
        console.error('Failed to import presentation file:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-950/80 border border-indigo-800/70 rounded-lg text-indigo-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Template Gallery & Deck Library
              </h2>
              <p className="text-xs text-slate-400">
                Start from a pre-designed presentation template or manage your saved decks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.md,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Import .md or .json presentation"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import File</span>
            </button>

            <button
              onClick={onCreateDeck}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Blank Deck</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('templates');
                setPreviewTemplate(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Template Gallery ({STARTER_TEMPLATES.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('saved');
                setPreviewTemplate(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Saved Decks ({decks.length})</span>
            </button>
          </div>

          {activeTab === 'templates' && !previewTemplate && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, topics, math..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {activeTab === 'templates' ? (
          previewTemplate ? (
            /* Interactive Template Slide Inspector */
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Gallery</span>
                  </button>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-indigo-400">
                        {previewTemplate.category || 'Template'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{previewSlides.length} slides</span>
                      {previewTemplate.estimatedDuration && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{previewTemplate.estimatedDuration}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{previewTemplate.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <label htmlFor="custom-deck-title" className="text-xs text-slate-400">
                      Deck Title:
                    </label>
                    <input
                      id="custom-deck-title"
                      type="text"
                      value={customDeckTitle}
                      onChange={(e) => setCustomDeckTitle(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-white w-56 focus:outline-none"
                      placeholder="Presentation title..."
                    />
                  </div>
                  <button
                    onClick={() => handleUseTemplate(previewTemplate, customDeckTitle)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Use This Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left 2 Columns: Live Rendered Slide Stage */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  {(() => {
                    const currentSlide = previewSlides[previewSlideIndex] || previewSlides[0];
                    const theme = resolveTheme(previewTemplate.settings);
                    const pairing = resolveFontPairing(
                      previewTemplate.settings.fontPairingId || theme.fontPairingId
                    );
                    const inlineStyles = {
                      '--slide-bg': theme.customColors?.background || theme.previewBg,
                      '--slide-surface': theme.customColors?.surface || theme.previewBg,
                      '--slide-heading': theme.customColors?.heading || theme.headingColor,
                      '--slide-text': theme.customColors?.text || '#e2e8f0',
                      '--slide-accent': theme.customColors?.accent || theme.accentColor,
                      '--slide-secondary': theme.customColors?.secondary || theme.secondaryColor,
                      '--font-heading': pairing.headingFont,
                      '--font-body': pairing.bodyFont,
                      '--font-mono': pairing.monoFont,
                    } as React.CSSProperties;

                    return (
                      <div className="flex flex-col gap-3">
                        <div
                          className={`relative aspect-video w-full rounded-xl overflow-hidden border border-slate-700/80 shadow-xl flex flex-col justify-center p-8 ${
                            theme.isCustom ? 'custom-theme-stage' : theme.bgClass
                          }`}
                          style={{
                            ...inlineStyles,
                            backgroundColor: theme.customColors?.background || theme.previewBg,
                          }}
                        >
                          <div
                            className="slide-content prose prose-invert max-w-none text-sm md:text-base overflow-y-auto max-h-full"
                            style={{
                              fontFamily: pairing.bodyFont,
                              color: theme.customColors?.text,
                            }}
                            dangerouslySetInnerHTML={{
                              __html: currentSlide?.htmlContent || '',
                            }}
                          />

                          <div className="absolute bottom-3 right-4 text-[11px] font-mono opacity-60">
                            Slide {previewSlideIndex + 1} / {previewSlides.length}
                          </div>
                        </div>

                        {/* Slide Stepper Controls */}
                        <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-4 py-2">
                          <button
                            onClick={() =>
                              setPreviewSlideIndex((prev) => Math.max(0, prev - 1))
                            }
                            disabled={previewSlideIndex === 0}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous Slide</span>
                          </button>

                          <span className="text-xs text-slate-400 font-medium">
                            {currentSlide?.title || `Slide ${previewSlideIndex + 1}`}
                          </span>

                          <button
                            onClick={() =>
                              setPreviewSlideIndex((prev) =>
                                Math.min(previewSlides.length - 1, prev + 1)
                              )
                            }
                            disabled={previewSlideIndex >= previewSlides.length - 1}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 transition-colors"
                          >
                            <span>Next Slide</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column: Slide Outline & Template Specs */}
                <div className="flex flex-col gap-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4 overflow-y-auto">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      About This Template
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {previewTemplate.description}
                    </p>
                  </div>

                  {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Included Features
                      </h4>
                      <p className="text-xs text-slate-300">
                        {previewTemplate.tags.join(' · ')}
                      </p>
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Slide Structure ({previewSlides.length} Slides)
                    </h4>
                    <div className="space-y-1.5">
                      {previewSlides.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => setPreviewSlideIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            idx === previewSlideIndex
                              ? 'bg-indigo-600/20 border border-indigo-500/50 text-white font-medium'
                              : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <span className="truncate">
                            {idx + 1}. {s.title || `Slide ${idx + 1}`}
                          </span>
                          {s.verticalIndex > 0 && (
                            <span className="text-[10px] font-mono text-slate-500 ml-2 shrink-0">
                              sub
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Template Gallery Grid View */
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Category Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          isSelected
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{cat.label}</span>
                        <span className="text-[11px] text-slate-500 ml-0.5">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Context Subtitle */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.description}
                </span>
                <span>
                  Showing {filteredTemplates.length} of {STARTER_TEMPLATES.length} templates
                </span>
              </div>

              {/* Templates Grid */}
              {filteredTemplates.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm font-medium text-slate-300 mb-1">
                    No templates match your filter
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Try clearing your search query or switching to All Templates.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredTemplates.map(({ template: tmpl, slides, slideCount }) => {
                    const theme = resolveTheme(tmpl.settings);
                    const pairing = resolveFontPairing(
                      tmpl.settings.fontPairingId || theme.fontPairingId
                    );
                    const firstSlide = slides[0];

                    return (
                      <div
                        key={tmpl.id}
                        className="group rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Visual Miniature Slide Preview Header */}
                          <div
                            onClick={() => handleOpenTemplatePreview(tmpl)}
                            className="relative h-36 w-full p-5 flex flex-col justify-between cursor-pointer overflow-hidden border-b border-slate-800/80"
                            style={{
                              backgroundColor:
                                theme.customColors?.background || theme.previewBg,
                            }}
                          >
                            {/* Decorative accent bar */}
                            <div
                              className="w-10 h-1 rounded-full"
                              style={{ backgroundColor: theme.accentColor }}
                            />

                            <div className="my-auto">
                              <div
                                className="text-sm font-bold line-clamp-1 tracking-tight"
                                style={{
                                  color: theme.headingColor,
                                  fontFamily: pairing.headingFont,
                                }}
                              >
                                {firstSlide?.title || tmpl.title}
                              </div>
                              <div
                                className="text-[11px] line-clamp-1 mt-0.5 opacity-80"
                                style={{
                                  color: theme.secondaryColor,
                                  fontFamily: pairing.bodyFont,
                                }}
                              >
                                {tmpl.author || theme.name} · {pairing.name}
                              </div>
                            </div>

                            {/* Bottom Miniature Metadata Strip */}
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: theme.accentColor }}
                                />
                                <span
                                  className="opacity-75 font-mono text-[10px]"
                                  style={{ color: theme.headingColor }}
                                >
                                  {theme.name}
                                </span>
                              </div>

                              <span
                                className="opacity-75 font-mono text-[10px]"
                                style={{ color: theme.headingColor }}
                              >
                                {slideCount} slides
                              </span>
                            </div>

                            {/* Hover Preview Overlay */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 text-white text-xs font-medium shadow-lg">
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Preview {slideCount} Slides</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4">
                            {/* Clean Unboxed Metadata */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                              <span className="font-medium text-indigo-400">
                                {tmpl.category || 'General'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{slideCount} slides</span>
                              {tmpl.estimatedDuration && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {tmpl.estimatedDuration}
                                  </span>
                                </>
                              )}
                            </div>

                            <h3 className="font-semibold text-sm text-white mb-1">
                              {tmpl.title}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                              {tmpl.description}
                            </p>

                            {tmpl.tags && tmpl.tags.length > 0 && (
                              <div className="text-[11px] text-slate-500 truncate">
                                {tmpl.tags.join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenTemplatePreview(tmpl)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Slides</span>
                          </button>

                          <button
                            onClick={() => handleUseTemplate(tmpl)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                          >
                            <span>Use Template</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        ) : (
          /* Saved Decks View */
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Looking for a pre-designed layout?
                </h3>
                <p className="text-xs text-slate-400">
                  Explore Corporate, Minimalist, Creative, Academic, and Technical templates in the gallery.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('templates')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse Template Gallery</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const isActive = deck.id === activeDeckId;
                const theme = resolveTheme(deck.settings);
                const isConfirmingDelete = confirmDeleteId === deck.id;

                return (
                  <div
                    key={deck.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isActive
                        ? 'bg-slate-800/80 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <div
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.previewBg }}
                          />
                          <span className="font-mono text-[11px]">
                            {theme.name} · {deck.settings.aspectRatio}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm text-white line-clamp-1 mb-1">
                        {deck.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {deck.description || 'Custom presentation markdown.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onDuplicateDeck(deck.id)}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Duplicate Deck"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {decks.length > 1 && (
                          isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 rounded px-2 py-0.5">
                              <button
                                onClick={() => {
                                  onDeleteDeck(deck.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[11px] font-semibold text-rose-300 hover:text-white"
                              >
                                Confirm
                              </button>
                              <span className="text-slate-600">·</span>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[11px] text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(deck.id)}
                              className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Deck"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}

                        <button
                          onClick={() => {
                            onSelectDeck(deck.id);
                            onClose();
                          }}
                          className={`ml-2 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white'
                          }`}
                        >
                          {isActive ? 'Current' : 'Open'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
