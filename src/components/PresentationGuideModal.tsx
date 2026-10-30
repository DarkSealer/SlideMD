import React, { useState } from 'react';
import {
  X,
  Lightbulb,
  Plus,
  Sparkles,
  StickyNote,
  Copy,
  Check,
  Search,
  BookOpen,
  Monitor,
  Sliders,
  Compass,
} from 'lucide-react';
import { GUIDE_TOOLS, GUIDE_TOUR, type GuideTool } from './guideContent';
import { TOOLBAR_HINTS, ITEM_HINTS } from './toolbarHints';
import { SLIDE_LAYOUT_PATTERNS } from '../utils/slideLayoutSnippets';
import { MERMAID_SNIPPETS } from '../utils/mermaidHelper';

export type GuideTab = 'tools' | 'tour' | 'design' | 'shortcuts' | 'markdown';

interface PresentationGuideModalProps {
  onClose: () => void;
  onInsertSnippet?: (snippet: string) => void;
  initialTab?: GuideTab;
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  onClose,
  onInsertSnippet,
  initialTab = 'tools',
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string>('slide');
  const tools = GUIDE_TOOLS;

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insert = (id: string, text: string) => {
    if (!onInsertSnippet) return;
    onInsertSnippet(text);
    setInsertedId(id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  const handleCopy = (tool: GuideTool) => copy(tool.id, tool.example.code);
  const handleInsert = (tool: GuideTool) => insert(tool.id, tool.snippet || tool.example.code);

  const filteredTools = tools.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.shortDesc.toLowerCase().includes(q) ||
      t.buttonLabel.toLowerCase().includes(q) ||
      t.whatItDoes.toLowerCase().includes(q) ||
      t.whenToUse.toLowerCase().includes(q)
    );
  });

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const menuChoices =
    selectedTool.menu === 'layouts'
      ? SLIDE_LAYOUT_PATTERNS.map((p) => ({
          id: p.id,
          hintKey: `layout:${p.id}`,
          snippet: `\n\n${p.snippet.trim()}\n\n`,
        }))
      : selectedTool.menu === 'diagrams'
      ? MERMAID_SNIPPETS.map((s) => ({
          id: s.id,
          hintKey: `diagram:${s.id}`,
          snippet: `\n\n${s.code}\n\n`,
        }))
      : [];

  const tabClass = (tab: GuideTab) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
      activeTab === tab
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Presentation Guide & Hints</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Every button and feature explained with simple examples you can try
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/80 text-xs font-medium overflow-x-auto shrink-0 no-scrollbar">
          <button onClick={() => setActiveTab('tools')} className={tabClass('tools')}>
            <Sliders className="w-3.5 h-3.5" />
            <span>Insert Bar Explained</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{tools.length}</span>
          </button>

          <button onClick={() => setActiveTab('tour')} className={tabClass('tour')}>
            <Compass className="w-3.5 h-3.5" />
            <span>App Tour</span>
          </button>

          <button onClick={() => setActiveTab('design')} className={tabClass('design')}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>7 Golden Rules for Great Slides</span>
          </button>

          <button onClick={() => setActiveTab('shortcuts')} className={tabClass('shortcuts')}>
            <Monitor className="w-3.5 h-3.5" />
            <span>Presenting & Shortcuts</span>
          </button>

          <button onClick={() => setActiveTab('markdown')} className={tabClass('markdown')}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>Markdown Cheatsheet</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          {/* TAB 1: INSERT BAR TOOLS */}
          {activeTab === 'tools' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Left Column: Tool Selector & Search */}
              <div className="w-full lg:w-5/12 flex flex-col gap-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search the Insert bar (e.g. columns, chart, notes)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[500px]">
                  {filteredTools.map((tool) => {
                    const isSelected = selectedTool.id === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedToolId(tool.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border shrink-0 ${tool.iconColor}`}>
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {tool.buttonLabel}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                              {tool.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                        </div>
                      </button>
                    );
                  })}

                  {filteredTools.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No tool matched &ldquo;{searchQuery}&rdquo;. Try &ldquo;columns&rdquo;, &ldquo;chart&rdquo;, &ldquo;notes&rdquo; or &ldquo;slide&rdquo;.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Tool Breakdown */}
              <div className="w-full lg:w-7/12 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto">
                {/* Header of selected tool */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${selectedTool.iconColor}`}>
                      {selectedTool.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedTool.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          Button: &ldquo;{selectedTool.buttonLabel}&rdquo;
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedTool.shortDesc}</p>
                    </div>
                  </div>

                  {!selectedTool.menu && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(selectedTool)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                        title="Copy the example text"
                      >
                        {copiedId === selectedTool.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onInsertSnippet && selectedTool.snippet && (
                        <button
                          onClick={() => handleInsert(selectedTool)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
                          title="Adds this example to the end of your presentation"
                        >
                          {insertedId === selectedTool.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to my deck</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Plain-English explanation */}
                <div className="grid grid-cols-1 gap-3 text-xs">
                  {[
                    { n: 1, label: 'What it does', text: selectedTool.whatItDoes, head: 'text-indigo-300', dot: 'bg-indigo-950 border-indigo-700' },
                    { n: 2, label: 'When to use it', text: selectedTool.whenToUse, head: 'text-emerald-300', dot: 'bg-emerald-950 border-emerald-700' },
                    { n: 3, label: 'How to use it', text: selectedTool.howToUse, head: 'text-amber-300', dot: 'bg-amber-950 border-amber-700' },
                  ].map(({ n, label, text, head, dot }) => (
                    <div key={n} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className={`flex items-center gap-2 font-semibold mb-1 ${head}`}>
                        <span className={`w-5 h-5 rounded-full border ${dot} flex items-center justify-center text-[10px]`}>
                          {n}
                        </span>
                        <span>{label}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-7">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Picture of the result */}
                {TOOLBAR_HINTS[selectedTool.hintKey] && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1.5">What your audience will see</div>
                    <div className="flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 px-4 py-7 overflow-hidden">
                      <div style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}>
                        {TOOLBAR_HINTS[selectedTool.hintKey].preview}
                      </div>
                    </div>
                  </div>
                )}

                {/* Worked example, line by line */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                    <span>Example: {selectedTool.example.situation}</span>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed select-all whitespace-pre">
                    {selectedTool.example.code}
                  </pre>
                  <div className="mt-2 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-950/60 text-[11px] font-semibold text-slate-300">
                      What each part means
                    </div>
                    {selectedTool.example.lines.map((line) => (
                      <div key={line.code} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 text-[11px]">
                        <code className="font-mono text-indigo-300 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 sm:w-44 shrink-0 break-all">
                          {line.code}
                        </code>
                        <span className="text-slate-300 leading-relaxed">{line.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choices inside Layouts / Diagram menus */}
                {menuChoices.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1.5">
                      Your {menuChoices.length} choices in this menu
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menuChoices.map((choice) => {
                        const hint = ITEM_HINTS[choice.hintKey];
                        if (!hint) return null;
                        return (
                          <div key={choice.id} className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-center bg-slate-950 border-b border-slate-800 px-3 py-4 min-h-[88px]">
                              {hint.preview}
                            </div>
                            <div className="p-3 flex flex-col gap-2 flex-1">
                              <div>
                                <div className="text-xs font-semibold text-slate-100">{hint.title}</div>
                                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{hint.description}</p>
                              </div>
                              {onInsertSnippet && (
                                <button
                                  onClick={() => insert(choice.hintKey, choice.snippet)}
                                  className="mt-auto self-start flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                >
                                  {insertedId === choice.hintKey ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Add to my deck</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selectedTool.tips && selectedTool.tips.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-100/90">
                    <div className="font-semibold text-amber-300 mb-1">Good to know</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedTool.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: APP TOUR */}
          {activeTab === 'tour' && (
            <div className="flex flex-col gap-5 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-slate-900 border border-sky-800/50">
                <h3 className="text-sm font-bold text-white mb-1">Everything outside the Insert bar</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Write your slides on the left, watch them appear on the right, then present or export. These are the other parts of SlideMD and what each one is for.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUIDE_TOUR.map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>{item.icon}</div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Find it: {item.where}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                      {item.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 7 GOLDEN RULES FOR GREAT SLIDES */}
          {activeTab === 'design' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-800/50 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    How to design presentations people will actually enjoy
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You don&rsquo;t need to be a graphic designer to build stunning slides. Following these 7 practical rules guarantees your message looks professional, readable, and engaging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rule 1 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">One Big Idea Per Slide</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Never pack two unrelated topics onto a single slide. If you have 3 topics, make 3 quick slides. Audiences love slides that move briskly rather than staring at one crowded page for 10 minutes.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/40">
                    Pro tip: Use &ldquo;---&rdquo; freely. Slides are free!
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">The 6 × 6 Rule</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Aim for a maximum of 6 bullet points, and about 6 words per bullet. Your slides are visual reminders for you and the audience—they are NOT a teleprompter or a novel.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded border border-cyan-900/40">
                    Put extra details in Speaker Notes (Note: ...)!
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">Use Fragment Animations for Pacing</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When all 5 points show up immediately, audience eyes wander to point #5 while you are still explaining point #1. Using <code className="text-purple-300">:::fragment</code> reveals each line with a click as you talk.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-purple-400 bg-purple-950/30 px-2.5 py-1 rounded border border-purple-900/40">
                    Keeps audience eyes synchronized with your voice.
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">Split Information into Two Columns</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Human brains love comparing side-by-side elements. Use <code className="text-emerald-300">:::columns</code> to compare &ldquo;Before vs After&rdquo;, &ldquo;Old Way vs New Way&rdquo;, or &ldquo;About the Speaker&rdquo;. It looks 10x more polished than a vertical stack.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/40">
                    Click the &ldquo;Columns&rdquo; button in the toolbar!
                  </div>
                </div>

                {/* Rule 5 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">Always Guard Contrast & Readability</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Make sure text is dark on light backgrounds and bright on dark backgrounds. If a custom theme makes your text hard to read, use the <strong>Color</strong> tool or insert <code className="text-amber-300">&lt;!-- color: #ffffff --&gt;</code> to tune it!
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded border border-amber-900/40">
                    SlideMD callouts are automatically high-contrast!
                  </div>
                </div>

                {/* Rule 6 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-pink-950 text-pink-400 border border-pink-800 flex items-center justify-center font-bold text-xs">
                      6
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">Use Callouts for Big Takeaways</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instead of bolding an entire paragraph, place your core conclusion inside a <code className="text-pink-300">&gt; [!NOTE]</code> or <code className="text-pink-300">&gt; [!TIP]</code> callout box. It acts as an anchor that audience cameras snap photos of.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-pink-400 bg-pink-950/30 px-2.5 py-1 rounded border border-pink-900/40">
                    Provides an immediate visual focal point.
                  </div>
                </div>
              </div>

              {/* Rule 7 Banner */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                  7
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 mb-1">
                    Match Theme to the Room Atmosphere
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If you are speaking on a stage in a darkened room, choose high-contrast dark themes like <strong>Obsidian</strong>, <strong>Midnight Blue</strong>, or <strong>Neon Cyber</strong>. If you are in a bright daylight boardroom or exporting to print/PDF, choose <strong>Minimal Light</strong> or <strong>Nordic Frost</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESENTING & SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Presenter Mode Info */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Speaker Console (Press &ldquo;S&rdquo;)</h4>
                      <p className="text-[11px] text-slate-400">Your secret presenter superpower</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    SlideMD includes a built-in dual-screen console. Click <strong>Notes</strong> in the top bar or press <strong>S</strong> during presentation to open your private control deck with:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                    <li>Current slide preview + upcoming slide preview</li>
                    <li>Large, easy-to-read Speaker Notes</li>
                    <li>Live presentation timer &amp; clock</li>
                    <li>Fragment and slide jumping controls</li>
                  </ul>
                </div>

                {/* Fullscreen Info */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Fullscreen Slideshow (Press &ldquo;F&rdquo; or click Present)</h4>
                      <p className="text-[11px] text-slate-400">Pure distraction-free projection</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hides the editor and toolbar for clean projection. The bottom bar has Previous, Next, Laser pointer, Notes and the Slide Overview grid, and your chosen transition plays between slides.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                    💡 <strong>Pro Tip:</strong> Press <strong>B</strong> during your talk to black out the screen whenever you want the audience to look directly at you instead of reading!
                  </div>
                </div>
              </div>

              {/* Cheatsheet Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 font-bold text-xs text-white">
                  Keyboard Navigation Shortcuts
                </div>
                <div className="divide-y divide-slate-800/80 text-xs">
                  {[
                    { key: 'Space, → or ↓', action: 'Next step, then next slide (sub-slides come in order)' },
                    { key: '←, ↑ or Page Up', action: 'Go back one step or slide' },
                    { key: 'F', action: 'Start the fullscreen presentation (when not typing in the editor)' },
                    { key: 'S', action: 'Open the Presenter Console with notes and timer' },
                    { key: 'B or .', action: 'Black out the screen so the room looks at you' },
                    { key: 'O', action: 'Slide Overview: a grid of all slides to jump to (while presenting)' },
                    { key: 'L', action: 'Laser pointer on the audience screen (in the Presenter Console)' },
                    { key: '? or H', action: 'Open this guide (when not typing in the editor)' },
                    { key: 'Esc', action: 'Close the overlay, exit fullscreen, or close the guide' },
                  ].map(({ key, action }) => (
                    <div key={key} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-850">
                      <span className="font-mono text-indigo-300 font-semibold bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                        {key}
                      </span>
                      <span className="text-slate-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKDOWN CHEATSHEET */}
          {activeTab === 'markdown' && (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                SlideMD uses standard, friendly Markdown. Here are the core formatting tags you can type directly into the editor:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Headers */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Headings</span>
                    <span className="text-[10px] text-slate-500 font-normal">Title hierarchy</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-indigo-300 leading-relaxed">
{`# Main Slide Title (Huge)
## Section Heading (Medium)
### Subsection (Small)`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    The first header on a slide automatically becomes the slide title in the bottom thumbnail strip.
                  </p>
                </div>

                {/* Text Formatting */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Text Emphasis</span>
                    <span className="text-[10px] text-slate-500 font-normal">Bold & Italics</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-emerald-300 leading-relaxed">
{`**Bold text for key words**
*Italic text for subtle notes*
~~Strikethrough for deleted items~~
\`inline code\` for tech terms`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Combine bold words with color tags to make your thesis jump off the screen.
                  </p>
                </div>

                {/* Lists */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Lists & Bullets</span>
                    <span className="text-[10px] text-slate-500 font-normal">Itemized points</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-amber-300 leading-relaxed">
{`- Bullet point item
- Another bullet item
  - Nested sub-bullet

1. Numbered step one
2. Numbered step two`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Wrap list items with <code className="text-amber-300">:::fragment</code> to reveal them one by one.
                  </p>
                </div>

                {/* Links & Images */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Images & Quotes</span>
                    <span className="text-[10px] text-slate-500 font-normal">Visual elements</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-pink-300 leading-relaxed">
{`![Alt text](https://image.url)

> "Simplicity is the soul of efficiency."
> — Austin Freeman`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Images resize automatically to fit widescreen 16:9 slides with clean borders.
                  </p>
                </div>

                {/* Slide Structure */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Slide Dividers</span>
                    <span className="text-[10px] text-slate-500 font-normal">Where slides start</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-cyan-300 leading-relaxed">
{`---   new slide
--    sub-slide (detail under a slide)`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Put each divider on its own line with an empty line above and below.
                  </p>
                </div>

                {/* Notes */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Speaker Notes</span>
                    <span className="text-[10px] text-slate-500 font-normal">Three ways to write them</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-amber-300 leading-relaxed">
{`Note:
Your private reminder

<!-- note: a one-line reminder -->

:::notes
Several lines
of notes
:::`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    All three stay hidden from the audience and appear in the Presenter Console.
                  </p>
                </div>

                {/* Per-slide settings */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 md:col-span-2">
                  <h4 className="font-bold text-white flex items-center justify-between">
                    <span>Per-slide Settings</span>
                    <span className="text-[10px] text-slate-500 font-normal">Add one line anywhere inside a slide</span>
                  </h4>
                  <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-rose-300 leading-relaxed">
{`<!-- bg: #1e1e2e -->                  background color
<!-- .slide: data-background-image="https://…" -->   background picture
<!-- transition: zoom -->               slide, fade, convex, zoom or none
<!-- color: #ffffff -->                 text color`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    These affect only the slide they are written in. Use the Theme panel to change every slide at once.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>You can open this guide anytime by clicking <strong>Guide &amp; Hints</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Got it, Let&rsquo;s Create!
          </button>
        </div>
      </div>
    </div>
  );
};
