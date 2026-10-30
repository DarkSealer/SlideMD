import React, { useRef, useState } from 'react';
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
} from 'lucide-react';
import { PresentationDeck } from '../types/presentation';
import { STARTER_TEMPLATES } from '../utils/storage';
import { THEMES } from '../utils/themes';

interface DecksLibraryModalProps {
  decks: PresentationDeck[];
  activeDeckId: string;
  onSelectDeck: (id: string) => void;
  onCreateDeck: () => void;
  onDuplicateDeck: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onImportDeck: (deck: PresentationDeck) => void;
  onClose: () => void;
}

export const DecksLibraryModal: React.FC<DecksLibraryModalProps> = ({
  decks,
  activeDeckId,
  onSelectDeck,
  onCreateDeck,
  onDuplicateDeck,
  onDeleteDeck,
  onImportDeck,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'templates'>('saved');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (err) {
        console.error('Failed to import presentation file:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/70 border border-amber-800/80 rounded-lg text-amber-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Presentation Library</h2>
              <p className="text-xs text-slate-400">Stored offline in LocalStorage · Synced across sessions</p>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deck</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'saved'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Saved Decks ({decks.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'templates'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Starter Templates ({STARTER_TEMPLATES.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'saved' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const isActive = deck.id === activeDeckId;
                const theme = THEMES[deck.settings.theme] || THEMES.obsidian;

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
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.previewBg }}
                          />
                          <span className="text-[11px] font-mono text-slate-400 capitalize">
                            {theme.name} · {deck.settings.aspectRatio}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/60 flex items-center gap-1">
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
                          <button
                            onClick={() => {
                              if (confirm(`Delete presentation "${deck.title}"?`)) {
                                onDeleteDeck(deck.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Deck"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STARTER_TEMPLATES.map((tmpl) => {
                const theme = THEMES[tmpl.settings.theme] || THEMES.obsidian;
                return (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.previewBg }}
                        />
                        <span className="text-[11px] font-mono text-slate-400 capitalize">
                          {theme.name}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white mb-1">{tmpl.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-indigo-400 font-mono">Template</span>
                      <button
                        onClick={() => {
                          onImportDeck({
                            ...tmpl,
                            id: `deck-${Date.now()}`,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                          });
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
