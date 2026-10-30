import React, { useState } from 'react';
import {
  X,
  Lightbulb,
  Plus,
  Layers,
  StickyNote,
  Sparkles,
  Columns,
  Code2,
  Binary,
  AlertCircle,
  Table,
  Palette,
  Upload,
  Workflow,
  Copy,
  Check,
  Search,
  BookOpen,
  Monitor,
  Eye,
  Sliders,
  ArrowRight,
  MousePointerClick,
  FileQuestion,
  LayoutGrid,
} from 'lucide-react';

interface PresentationGuideModalProps {
  onClose: () => void;
  onInsertSnippet?: (snippet: string) => void;
  initialTab?: 'tools' | 'design' | 'shortcuts' | 'markdown';
}

interface ToolInfo {
  id: string;
  name: string;
  buttonLabel: string;
  icon: React.ReactNode;
  iconColor: string;
  badge: string;
  shortDesc: string;
  whatItDoes: string;
  whenToUse: string;
  howToUse: string;
  snippet: string;
  previewType: 'slide' | 'subslide' | 'notes' | 'fragment' | 'columns' | 'code' | 'math' | 'callout' | 'table' | 'color' | 'upload' | 'mermaid' | 'layouts';
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  onClose,
  onInsertSnippet,
  initialTab = 'tools',
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'design' | 'shortcuts' | 'markdown'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string>('slide');

  const tools: ToolInfo[] = [
    {
      id: 'slide',
      name: 'New Slide (Horizontal)',
      buttonLabel: 'Slide (---)',
      icon: <Plus className="w-4 h-4" />,
      iconColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/50',
      badge: 'Basics',
      shortDesc: 'Starts a brand new slide in your presentation.',
      whatItDoes: 'Creates a clean horizontal transition to the next slide in your presentation. In SlideCraft, three dashes (---) tell the app that a new slide begins here.',
      whenToUse: 'Whenever you start a new topic, section, or key point in your presentation.',
      howToUse: 'Click the "Slide (---)" button, or simply press Enter twice and type three hyphens "---" followed by your slide title with a "#" heading.',
      snippet: '\n\n---\n\n## Next Chapter Title\n\n- Main takeaway or key insight\n- Supporting context\n',
      previewType: 'slide',
    },
    {
      id: 'subslide',
      name: 'Sub-slide (Vertical Deep Dive)',
      buttonLabel: 'Sub-slide (--)',
      icon: <Layers className="w-4 h-4" />,
      iconColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50',
      badge: 'Structure',
      shortDesc: 'A vertical sub-slide nested beneath the main slide.',
      whatItDoes: 'Adds a secondary slide that can be navigated down (↓ arrow). It lets you dive deeper into a subject without breaking the horizontal flow of your main story.',
      whenToUse: 'Perfect for detailed data charts, technical appendices, extra proof, or answers to anticipated audience questions that you can skip if you are short on time.',
      howToUse: 'Click "Sub-slide (--)" or type two hyphens "--" on a line by itself. When presenting, press the Down Arrow to reveal it.',
      snippet: '\n\n--\n\n### Deep Dive: Supporting Data\n\nDetailed breakdown or bonus technical evidence.\n',
      previewType: 'subslide',
    },
    {
      id: 'notes',
      name: 'Speaker Notes',
      buttonLabel: 'Speaker Note',
      icon: <StickyNote className="w-4 h-4" />,
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-700/50',
      badge: 'Presenter Secret',
      shortDesc: 'Private notes visible ONLY to you on your speaker screen.',
      whatItDoes: 'Allows you to write secret prompts, reminders, and cues. The audience only sees your visual slide, while your presenter console shows your private script alongside a stopwatch.',
      whenToUse: 'Use on every important slide to remind yourself of stats, quotes, humorous anecdotes, or when to ask the audience questions.',
      howToUse: 'Type "Note:" at the bottom of any slide, followed by your speaking cues. When presenting, press "S" to open the dual-screen Presenter Console!',
      snippet: '\nNote:\nRemind the audience of our 40% growth last quarter. Pause for questions.\n',
      previewType: 'notes',
    },
    {
      id: 'fragment',
      name: 'Fragment (Step-by-step Animation)',
      buttonLabel: 'Fragment',
      icon: <Sparkles className="w-4 h-4" />,
      iconColor: 'text-purple-400 bg-purple-950/60 border-purple-700/50',
      badge: 'Audience Focus',
      shortDesc: 'Reveals points one click at a time during your talk.',
      whatItDoes: 'Keeps bullet points or sentences hidden until you click next or press the Spacebar. Instead of the audience reading the whole slide at once, they follow your speech.',
      whenToUse: 'When listing 3-5 key points, surprising statistics, or a sequence of steps.',
      howToUse: 'Wrap any paragraph or list item between ":::fragment" and ":::". During presentation mode, each press of the Spacebar reveals the next fragment!',
      snippet: '\n:::fragment\n1. First key milestone (appears on first click)\n:::\n\n:::fragment\n2. Second breakthrough (appears on second click)\n:::\n',
      previewType: 'fragment',
    },
    {
      id: 'columns',
      name: 'Two-Column / Multi-Column Grid',
      buttonLabel: 'Columns',
      icon: <Columns className="w-4 h-4" />,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
      badge: 'Layout',
      shortDesc: 'Splits your slide content cleanly into side-by-side columns.',
      whatItDoes: 'Places content into responsive columns side by side instead of one tall boring list.',
      whenToUse: 'Before vs. After, Pros vs. Cons, Speaker Bio (Photo on left, text on right), or Product Feature comparisons.',
      howToUse: 'Use ":::columns", then ":::column" for each column, and close with ":::". Each column can contain headers, bold text, lists, and images!',
      snippet: '\n:::columns\n:::column\n### Option A: The Monolith\n- Slower deployment\n- Higher complexity\n:::column\n### Option B: Cloud Edge\n- Instant scaling\n- 85% lower latency\n:::\n',
      previewType: 'columns',
    },
    {
      id: 'code',
      name: 'Code Snippet Block',
      buttonLabel: 'Code',
      icon: <Code2 className="w-4 h-4" />,
      iconColor: 'text-sky-400 bg-sky-950/60 border-sky-700/50',
      badge: 'Technical',
      shortDesc: 'Formats code with beautiful syntax highlighting.',
      whatItDoes: 'Renders code, formulas, or terminal commands inside an elegant dark card with colorized keywords.',
      whenToUse: 'When showing programming code (JavaScript, Python, HTML, SQL, etc.) or command line commands.',
      howToUse: 'Wrap your code in three backticks "```" followed by the language name (e.g. ```python). SlideCraft colors it automatically.',
      snippet: '\n```typescript\nfunction launchRocket(thrust: number): boolean {\n  return thrust > 9000;\n}\n```\n',
      previewType: 'code',
    },
    {
      id: 'math',
      name: 'Math & Science Equation',
      buttonLabel: 'Math',
      icon: <Binary className="w-4 h-4" />,
      iconColor: 'text-rose-400 bg-rose-950/60 border-rose-700/50',
      badge: 'Formulas',
      shortDesc: 'Renders mathematical equations and scientific notations.',
      whatItDoes: 'Converts LaTeX math expressions into crisp, centered formulas and equations.',
      whenToUse: 'Financial calculations, scientific presentations, physics, statistics, or engineering formulas.',
      howToUse: 'Wrap formulas inside "$$" for a centered formula card, or single "$" for inline math.',
      snippet: '\n$$\n\\text{ROI} = \\frac{\\text{Net Profit}}{\\text{Cost of Investment}} \\times 100\\%\n$$\n',
      previewType: 'math',
    },
    {
      id: 'callout',
      name: 'Callout Alert Box',
      buttonLabel: 'Callout',
      icon: <AlertCircle className="w-4 h-4" />,
      iconColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-700/50',
      badge: 'Visual Punch',
      shortDesc: 'An eye-catching colored box for important takeaways.',
      whatItDoes: 'Creates a highlighted box that immediately draws attention. Supports [!NOTE] (blue), [!TIP] (green), [!WARNING] (amber), and [!IMPORTANT] (red).',
      whenToUse: 'When there is one critical rule, warning, or golden recommendation you do NOT want anyone to miss.',
      howToUse: 'Type "> [!NOTE]" or "> [!WARNING]" followed by "> Your text here". SlideCraft styles it with high-contrast text that stays readable on both dark and light themes.',
      snippet: '\n> [!TIP]\n> Always test your presentation with the projector before your audience arrives!\n',
      previewType: 'callout',
    },
    {
      id: 'table',
      name: 'Data Table',
      buttonLabel: 'Table',
      icon: <Table className="w-4 h-4" />,
      iconColor: 'text-slate-300 bg-slate-900 border-slate-700/50',
      badge: 'Data',
      shortDesc: 'Clean rows and columns for comparisons and pricing.',
      whatItDoes: 'Formats tabular information with neat border lines and an accent-colored header row.',
      whenToUse: 'Comparing metrics, pricing plans, timelines, project milestones, or survey results.',
      howToUse: 'Use vertical pipes "|" to separate columns and hyphens "| :--- |" to set text alignment.',
      snippet: '\n| Plan | Speed | Storage | Price |\n| :--- | :--- | :--- | :--- |\n| Starter | 1 Gbps | 50 GB | Free |\n| Pro | 10 Gbps | 500 GB | $19/mo |\n',
      previewType: 'table',
    },
    {
      id: 'mermaid',
      name: 'Mermaid Diagrams & Charts',
      buttonLabel: 'Diagram',
      icon: <Workflow className="w-4 h-4" />,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
      badge: 'Visual Charts',
      shortDesc: 'Create system flowcharts, XY bar/line data charts, sequence diagrams, and mindmaps with simple text.',
      whatItDoes: 'Transforms plain readable text into sharp, interactive vector diagrams and modern charts. Supports "graph TD" flowcharts, "xychart-beta" quantitative bar/line charts, "sequenceDiagram" API request flows, state machines, and pie charts.',
      whenToUse: 'When showing architectures, process workflows, system sequences, user journeys, or data benchmarks instead of static screenshots.',
      howToUse: 'Click "Diagram" in the Insert bar to pick a template, or type ```mermaid followed by your diagram definition. SlideCraft renders the SVG automatically!',
      snippet: `\`\`\`mermaid
graph LR
    User([End User]) --> API[API Gateway]
    API --> Auth{Valid Token?}
    Auth -- Yes --> App[App Service]
    Auth -- No --> Err[401 Denied]
    App --> DB[(Database)]
\`\`\``,
      previewType: 'mermaid',
    },
    {
      id: 'layouts',
      name: 'Pre-Built Visual Slide Layouts',
      buttonLabel: 'Layouts',
      icon: <LayoutGrid className="w-4 h-4" />,
      iconColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/50',
      badge: 'Patterns',
      shortDesc: 'Pre-built KPI metrics, quotes, before/after comparisons, roadmaps, and team showcases.',
      whatItDoes: 'Inserts executive-grade visual layouts pre-styled with responsive CSS grids, gradient values, quotation glyphs, and status badges.',
      whenToUse: 'When you want high-impact visual slides (KPI cards, customer testimonials, roadmap milestones, or team rosters) without manually writing complex layout HTML.',
      howToUse: 'Click the "Layouts" dropdown in the editor toolbar, then choose any of the 5 pre-built templates to insert at your cursor.',
      snippet: `---

## Key Performance Indicators

<div class="slide-kpi-grid">
  <div class="slide-kpi-card">
    <div class="slide-kpi-val">+185%</div>
    <div class="slide-kpi-label">Throughput Velocity</div>
    <div class="slide-kpi-sub">+42% YoY expansion</div>
  </div>
  <div class="slide-kpi-card">
    <div class="slide-kpi-val">&lt; 24ms</div>
    <div class="slide-kpi-label">P99 Edge Latency</div>
    <div class="slide-kpi-sub">Across 32 global PoPs</div>
  </div>
  <div class="slide-kpi-card">
    <div class="slide-kpi-val">99.99%</div>
    <div class="slide-kpi-label">Availability SLA</div>
    <div class="slide-kpi-sub">Zero unplanned downtime</div>
  </div>
</div>`,
      previewType: 'layouts',
    },
    {
      id: 'color',
      name: 'Text Colorizer Tool',
      buttonLabel: 'Color',
      icon: <Palette className="w-4 h-4" />,
      iconColor: 'text-pink-400 bg-pink-950/60 border-pink-700/50',
      badge: 'Styling',
      shortDesc: 'Change text color to boost contrast or highlight keywords.',
      whatItDoes: 'Wraps selected words in a colored badge or applies a slide-wide text color so your words never blend into light or dark backgrounds.',
      whenToUse: 'When you want a crucial phrase to stand out in bright mint, amber, or rose, or when using a light background theme and needing darker high-contrast text.',
      howToUse: 'Highlight any text in the editor, click "Color" in the Insert bar, and choose a palette color swatch.',
      snippet: '<span style="color: #6ee7b7">highlighted key phrase</span>',
      previewType: 'color',
    },
    {
      id: 'upload',
      name: 'Upload Existing Markdown',
      buttonLabel: 'Upload .md',
      icon: <Upload className="w-4 h-4" />,
      iconColor: 'text-indigo-300 bg-indigo-950/70 border-indigo-800/60',
      badge: 'Import',
      shortDesc: 'Import an existing .md presentation file from your computer.',
      whatItDoes: 'Lets you open presentation files you already wrote in Notion, Obsidian, GitHub, or any text editor.',
      whenToUse: 'When migrating an existing talk or collaborating with someone who emailed you a markdown file.',
      howToUse: 'Click "Upload .md" and select your file, or simply drag and drop the .md file directly onto the editor canvas!',
      snippet: '# My Imported Presentation\n\nSlide content...\n',
      previewType: 'upload',
    },
  ];

  const handleCopy = (tool: ToolInfo) => {
    navigator.clipboard.writeText(tool.snippet);
    setCopiedId(tool.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (tool: ToolInfo) => {
    if (onInsertSnippet) {
      onInsertSnippet(tool.snippet);
      setInsertedId(tool.id);
      setTimeout(() => setInsertedId(null), 2000);
    }
  };

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buttonLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

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
                Master the Insert bar tools and learn how to create crisp, high-impact slides
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
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Insert Bar Tools Explained</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">11</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'design'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>7 Golden Rules for Great Slides</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Presenting & Shortcuts</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'markdown'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
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
                    placeholder="Search tools (e.g. columns, animation, notes)..."
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
                      No tool matched &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;columns&rdquo;, &ldquo;notes&rdquo;, or &ldquo;slide&rdquo;.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Tool Breakdown */}
              <div className="w-full lg:w-7/12 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto">
                {/* Header of selected tool */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${selectedTool.iconColor}`}>
                      {selectedTool.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedTool.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          Button: &ldquo;{selectedTool.buttonLabel}&rdquo;
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedTool.shortDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(selectedTool)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                      title="Copy markdown template snippet"
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

                    {onInsertSnippet && (
                      <button
                        onClick={() => handleInsert(selectedTool)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
                        title="Insert this example directly into your presentation"
                      >
                        {insertedId === selectedTool.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Inserted!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Insert Example</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Step Simple Explanations for Non-Technical Users */}
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
                      <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>What it does (in plain English)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-7">{selectedTool.whatItDoes}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>When you should use it</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-7">{selectedTool.whenToUse}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>How to use it</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-7">{selectedTool.howToUse}</p>
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                    <span>Markdown Code Sample</span>
                    <span className="text-[11px] text-slate-500 font-normal">What gets added to your document</span>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed select-all">
                    {selectedTool.snippet.trim()}
                  </pre>
                </div>
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
                    SlideCraft callouts are automatically high-contrast!
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
                    SlideCraft includes a built-in dual-screen console. Click <strong>Notes</strong> in the top bar or press <strong>S</strong> during presentation to open your private control deck with:
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
                      <h4 className="text-xs font-bold text-white">Fullscreen SlideShow (Press &ldquo;F&rdquo;)</h4>
                      <p className="text-[11px] text-slate-400">Pure distraction-free projection</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hides the editor, toolbar, and browser chrome for clean stage projection. Supports laser pointer simulator, black screen blackout, and smooth hardware-accelerated transitions.
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
                    { key: 'Space or →', action: 'Advance to next slide or next animated fragment' },
                    { key: '←', action: 'Go back to previous slide or previous fragment' },
                    { key: '↓', action: 'Navigate down to vertical sub-slide' },
                    { key: '↑', action: 'Navigate up back to parent slide' },
                    { key: 'F', action: 'Toggle Fullscreen presentation mode' },
                    { key: 'S', action: 'Open Speaker Console with private notes and timer' },
                    { key: 'B or .', action: 'Blackout screen (toggle blank black screen to focus room attention)' },
                    { key: 'Esc', action: 'Exit fullscreen mode or close modal' },
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
                SlideCraft uses standard, friendly Markdown. Here are the core formatting tags you can type directly into the editor:
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
