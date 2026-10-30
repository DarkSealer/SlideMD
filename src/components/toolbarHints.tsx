import React from 'react';

export interface ToolbarHintContent {
  title: string;
  description: string;
  preview: React.ReactNode;
}

const Slide: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-md border border-slate-700 bg-slate-900 p-1.5 flex flex-col gap-1 ${className}`}>{children}</div>
);

const Line: React.FC<{ w?: string; color?: string }> = ({ w = 'w-full', color = 'bg-slate-600' }) => (
  <div className={`h-1 rounded-full ${color} ${w}`} />
);

const Heading: React.FC<{ w?: string; color?: string }> = ({ w = 'w-1/2', color = 'bg-slate-300' }) => (
  <div className={`h-1.5 rounded-full ${color} ${w}`} />
);

const Arrow: React.FC<{ dir?: 'right' | 'down' }> = ({ dir = 'right' }) => (
  <span className="text-slate-500 text-xs leading-none">{dir === 'right' ? '→' : '↓'}</span>
);

const Tag: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${className}`}>{children}</span>
);

const Avatar: React.FC<{ className?: string }> = ({ className = 'bg-indigo-400/70' }) => (
  <div className={`w-4 h-4 rounded-full shrink-0 ${className}`} />
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 160 70" className="w-40 h-[70px]" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Hints for the items inside the Layouts and Diagram dropdown menus.
export const ITEM_HINTS: Record<string, ToolbarHintContent> = {
  'layout:kpi-grid': {
    title: 'KPI Metric Grid',
    description: 'Big, bold numbers with a small change indicator. Ideal for results, growth and key figures.',
    preview: (
      <div className="flex gap-1.5">
        {[['98%', '+4.2%'], ['1.2M', '+18%'], ['42ms', '-9ms']].map(([n, d]) => (
          <div key={n} className="w-12 rounded-md border border-slate-700 bg-slate-900 py-1.5 text-center">
            <div className="text-[11px] font-bold text-slate-100">{n}</div>
            <div className="text-[8px] font-medium text-emerald-400">{d}</div>
          </div>
        ))}
      </div>
    ),
  },
  'layout:hero-quote': {
    title: 'Hero Quote',
    description: 'One large, memorable quote with the speaker’s photo and name. Great for testimonials.',
    preview: (
      <Slide className="w-40 items-center gap-1">
        <span className="text-indigo-300 text-2xl leading-4 font-serif">“</span>
        <Line w="w-28" color="bg-slate-300" />
        <Line w="w-20" color="bg-slate-300" />
        <div className="flex items-center gap-1 mt-0.5"><Avatar /><Line w="w-10" /></div>
      </Slide>
    ),
  },
  'layout:comparison': {
    title: 'Before vs. After',
    description: 'Two columns that show a problem next to its fix, or the old way next to the new way.',
    preview: (
      <div className="flex gap-1.5 w-40">
        <div className="flex-1 rounded-md border border-rose-500/50 bg-rose-950/30 p-1.5 flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-rose-300">Before</span>
          <span className="text-[9px] text-rose-200/80">✕ Slow</span>
          <span className="text-[9px] text-rose-200/80">✕ Manual</span>
        </div>
        <div className="flex-1 rounded-md border border-emerald-500/50 bg-emerald-950/30 p-1.5 flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-emerald-300">After</span>
          <span className="text-[9px] text-emerald-200/80">✓ Fast</span>
          <span className="text-[9px] text-emerald-200/80">✓ Automatic</span>
        </div>
      </div>
    ),
  },
  'layout:timeline': {
    title: 'Timeline Roadmap',
    description: 'Shows a plan in steps over time, with a status badge on each milestone.',
    preview: (
      <div className="w-40">
        <div className="relative flex justify-between px-2">
          <div className="absolute left-3 right-3 top-[5px] h-px bg-slate-600" />
          {['bg-emerald-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-slate-500'].map((c, i) => (
            <div key={i} className={`relative w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-slate-400">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => <span key={q} className="w-7 text-center">{q}</span>)}
        </div>
        <div className="flex justify-between mt-1">
          <Tag className="bg-emerald-900/60 text-emerald-300">Done</Tag>
          <Tag className="bg-indigo-900/60 text-indigo-300">Now</Tag>
          <Tag className="bg-slate-800 text-slate-400">Next</Tag>
        </div>
      </div>
    ),
  },
  'layout:team-grid': {
    title: 'Team Profiles',
    description: 'Introduce people with a photo, name and role side by side.',
    preview: (
      <div className="flex gap-2">
        {['bg-indigo-400/70', 'bg-emerald-400/70', 'bg-amber-400/70'].map((c) => (
          <div key={c} className="w-12 rounded-md border border-slate-700 bg-slate-900 py-1.5 flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full ${c}`} />
            <Line w="w-8" color="bg-slate-300" />
            <Line w="w-6" />
          </div>
        ))}
      </div>
    ),
  },
  'diagram:flowchart': {
    title: 'Flowchart',
    description: 'Boxes joined by arrows to explain a process, a decision or how parts connect.',
    preview: (
      <Svg>
        <rect x="4" y="25" width="32" height="20" rx="4" stroke="#34d399" fill="#064e3b55" />
        <path d="M36 35h14" stroke="#64748b" /><path d="M47 32l3 3-3 3" stroke="#64748b" />
        <path d="M50 35l14-14 14 14-14 14z" stroke="#38bdf8" fill="#0c4a6e55" />
        <path d="M78 35h14" stroke="#64748b" /><path d="M89 32l3 3-3 3" stroke="#64748b" />
        <rect x="92" y="8" width="32" height="20" rx="4" stroke="#c084fc" fill="#581c8755" />
        <rect x="92" y="42" width="32" height="20" rx="4" stroke="#fb923c" fill="#7c2d1255" />
        <path d="M78 35l6-14h8M78 35l6 14h8" stroke="#64748b" />
      </Svg>
    ),
  },
  'diagram:xychart': {
    title: 'Bar and Line Chart',
    description: 'Compares numbers across categories or over time, with bars and a trend line.',
    preview: (
      <Svg>
        <path d="M14 6v56h140" stroke="#475569" />
        {[[22, 38], [48, 28], [74, 20], [100, 30], [126, 12]].map(([x, y]) => (
          <rect key={x} x={x} y={y} width="16" height={62 - y} rx="2" fill="#38bdf8aa" />
        ))}
        <path d="M30 34l26-10 26-8 26 10 26-18" stroke="#fbbf24" strokeWidth="2" />
      </Svg>
    ),
  },
  'diagram:sequence': {
    title: 'Sequence Diagram',
    description: 'Shows who talks to whom, step by step, like a conversation between systems or people.',
    preview: (
      <Svg>
        {[28, 80, 132].map((x) => (
          <g key={x}>
            <rect x={x - 16} y="2" width="32" height="12" rx="3" stroke="#34d399" fill="#064e3b55" />
            <path d={`M${x} 14v52`} stroke="#475569" strokeDasharray="3 3" />
          </g>
        ))}
        <path d="M28 28h50" stroke="#e2e8f0" /><path d="M74 25l4 3-4 3" stroke="#e2e8f0" />
        <path d="M80 42h50" stroke="#e2e8f0" /><path d="M126 39l4 3-4 3" stroke="#e2e8f0" />
        <path d="M130 56H32" stroke="#94a3b8" strokeDasharray="3 3" /><path d="M36 53l-4 3 4 3" stroke="#94a3b8" />
      </Svg>
    ),
  },
  'diagram:state': {
    title: 'State Diagram',
    description: 'Maps the stages something moves through, such as order status, and what triggers each change.',
    preview: (
      <Svg>
        <circle cx="8" cy="35" r="4" fill="#94a3b8" />
        <path d="M12 35h10" stroke="#64748b" />
        <rect x="22" y="24" width="38" height="22" rx="8" stroke="#38bdf8" fill="#0c4a6e55" />
        <path d="M60 35h14" stroke="#64748b" /><path d="M71 32l3 3-3 3" stroke="#64748b" />
        <rect x="74" y="24" width="38" height="22" rx="8" stroke="#c084fc" fill="#581c8755" />
        <path d="M112 35h14" stroke="#64748b" />
        <circle cx="134" cy="35" r="7" stroke="#94a3b8" /><circle cx="134" cy="35" r="3.5" fill="#94a3b8" />
        <path d="M93 24c0-14-56-14-56 0" stroke="#64748b" />
      </Svg>
    ),
  },
  'diagram:pie': {
    title: 'Pie Chart',
    description: 'Shows how a whole is split into parts, such as market share or budget.',
    preview: (
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full" style={{ background: 'conic-gradient(#38bdf8 0 45%, #34d399 45% 75%, #fbbf24 75% 90%, #fb7185 90% 100%)' }} />
        <div className="flex flex-col gap-1 text-[9px] text-slate-300">
          <span><span className="text-sky-400">●</span> 45%</span>
          <span><span className="text-emerald-400">●</span> 30%</span>
          <span><span className="text-amber-400">●</span> 15%</span>
          <span><span className="text-rose-400">●</span> 10%</span>
        </div>
      </div>
    ),
  },
  'diagram:class': {
    title: 'Class Diagram',
    description: 'Boxes listing the parts of a system and how they relate. Mostly used by software teams.',
    preview: (
      <Svg>
        <rect x="4" y="6" width="56" height="40" rx="3" stroke="#38bdf8" fill="#0c4a6e33" />
        <path d="M4 18h56M4 32h56" stroke="#38bdf8" />
        <rect x="100" y="24" width="56" height="40" rx="3" stroke="#c084fc" fill="#581c8733" />
        <path d="M100 36h56M100 50h56" stroke="#c084fc" />
        <path d="M60 26h20v18h20" stroke="#64748b" /><path d="M60 26l5-4v8z" fill="#64748b" />
      </Svg>
    ),
  },
  'diagram:git': {
    title: 'Git Branch Graph',
    description: 'Shows how work splits into branches and merges back together over time.',
    preview: (
      <Svg>
        <path d="M10 20h140" stroke="#38bdf8" strokeWidth="2" />
        <path d="M40 20c8 0 8 30 20 30h50c8 0 8-30 20-30" stroke="#34d399" strokeWidth="2" />
        {[10, 40, 150].map((x) => <circle key={x} cx={x} cy="20" r="4" fill="#38bdf8" />)}
        {[65, 85, 105].map((x) => <circle key={x} cx={x} cy="50" r="4" fill="#34d399" />)}
        <circle cx="120" cy="20" r="4" fill="#38bdf8" />
      </Svg>
    ),
  },
  'diagram:mindmap': {
    title: 'Mind Map',
    description: 'One central idea with related ideas branching out around it. Good for brainstorming.',
    preview: (
      <Svg>
        <path d="M80 35L34 14M80 35L34 56M80 35l46-21M80 35l46 21" stroke="#64748b" />
        <ellipse cx="80" cy="35" rx="22" ry="11" stroke="#fbbf24" fill="#78350f55" />
        {[[22, 14], [22, 56], [138, 14], [138, 56]].map(([x, y], i) => (
          <rect key={i} x={x - 16} y={y - 6} width="32" height="12" rx="6" stroke={['#38bdf8', '#34d399', '#c084fc', '#fb7185'][i]} />
        ))}
      </Svg>
    ),
  },
};

export const TOOLBAR_HINTS: Record<string, ToolbarHintContent> = {
  ...ITEM_HINTS,
  slide: {
    title: 'New slide',
    description: 'Starts a fresh slide after the current one. Use it for every new topic.',
    preview: (
      <div className="flex items-center gap-2">
        <Slide className="w-16 h-11"><Heading /><Line /><Line w="w-2/3" /></Slide>
        <Arrow />
        <Slide className="w-16 h-11 border-indigo-500 ring-1 ring-indigo-500/40"><Heading color="bg-indigo-300" /><Line /><Line w="w-1/2" /></Slide>
      </div>
    ),
  },
  subslide: {
    title: 'Sub-slide',
    description: 'Adds a detail slide that belongs to the slide above it. It plays right after its main slide and is marked “sub” in the slide strip.',
    preview: (
      <div className="flex flex-col items-center gap-1">
        <Slide className="w-16 h-8"><Heading /><Line /></Slide>
        <Arrow dir="down" />
        <Slide className="w-16 h-8 border-cyan-500 ring-1 ring-cyan-500/40"><Heading color="bg-cyan-300" /><Line /></Slide>
      </div>
    ),
  },
  note: {
    title: 'Speaker note',
    description: 'Private talking points that only you see in presenter mode. The audience never sees them.',
    preview: (
      <div className="flex items-center gap-2">
        <Slide className="w-16 h-11"><Heading /><Line /><Line w="w-2/3" /></Slide>
        <div className="w-20 rounded-md border border-amber-500/50 bg-amber-950/40 p-1.5 flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-amber-300">Only you see this</span>
          <Line color="bg-amber-700" />
          <Line w="w-2/3" color="bg-amber-700" />
        </div>
      </div>
    ),
  },
  fragment: {
    title: 'Step-by-step reveal',
    description: 'Shows a point only when you click, so the audience follows your voice instead of reading ahead.',
    preview: (
      <Slide className="w-36 gap-1.5">
        <Heading />
        <div className="flex items-center gap-1.5"><span className="text-purple-300 text-[10px]">●</span><Line w="w-24" color="bg-slate-300" /></div>
        <div className="flex items-center gap-1.5 opacity-60"><span className="text-purple-300 text-[10px]">●</span><Line w="w-20" color="bg-purple-400" /><Tag className="bg-purple-900/60 text-purple-200">click</Tag></div>
        <div className="flex items-center gap-1.5 opacity-20"><span className="text-purple-300 text-[10px]">●</span><Line w="w-16" /></div>
      </Slide>
    ),
  },
  columns: {
    title: 'Columns',
    description: 'Puts content side by side. Great for before and after, pros and cons, or a photo next to text.',
    preview: (
      <Slide className="w-40">
        <Heading />
        <div className="flex gap-1.5">
          <div className="flex-1 rounded border border-emerald-600/50 bg-emerald-950/30 p-1 flex flex-col gap-1"><Heading w="w-2/3" color="bg-emerald-300" /><Line /><Line w="w-3/4" /></div>
          <div className="flex-1 rounded border border-emerald-600/50 bg-emerald-950/30 p-1 flex flex-col gap-1"><Heading w="w-2/3" color="bg-emerald-300" /><Line /><Line w="w-3/4" /></div>
        </div>
      </Slide>
    ),
  },
  code: {
    title: 'Code block',
    description: 'Shows computer code in a neat dark box with automatic syntax colors.',
    preview: (
      <div className="w-40 rounded-md bg-slate-950 border border-slate-700 p-2 font-mono text-[10px] leading-snug">
        <div><span className="text-purple-400">function</span> <span className="text-sky-300">solve</span>() {'{'}</div>
        <div className="pl-3"><span className="text-purple-400">return</span> <span className="text-amber-300">true</span>;</div>
        <div>{'}'}</div>
      </div>
    ),
  },
  math: {
    title: 'Math equation',
    description: 'Displays formulas and scientific equations with proper math symbols.',
    preview: (
      <div className="w-40 rounded-md bg-slate-900 border border-slate-700 py-2.5 text-center font-serif text-lg italic text-rose-200">
        E = mc<sup className="text-xs">2</sup>
      </div>
    ),
  },
  callout: {
    title: 'Callout',
    description: 'A colored highlight card for a key takeaway, tip or warning that should stand out.',
    preview: (
      <div className="w-40 rounded-md border-l-4 border-yellow-400 bg-yellow-950/30 p-2 flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-yellow-300">ⓘ Note</span>
        <Line color="bg-yellow-700" />
        <Line w="w-2/3" color="bg-yellow-700" />
      </div>
    ),
  },
  table: {
    title: 'Table',
    description: 'A grid of rows and columns for prices, timelines, comparisons or numbers.',
    preview: (
      <div className="w-40 rounded-md border border-slate-700 overflow-hidden text-[9px]">
        <div className="grid grid-cols-3 bg-slate-800 text-slate-200 font-semibold"><span className="px-1.5 py-0.5">Item</span><span className="px-1.5 py-0.5">Metric</span><span className="px-1.5 py-0.5">Status</span></div>
        <div className="grid grid-cols-3 text-slate-400 border-t border-slate-700"><span className="px-1.5 py-0.5">Alpha</span><span className="px-1.5 py-0.5">99.8%</span><span className="px-1.5 py-0.5 text-emerald-400">Active</span></div>
        <div className="grid grid-cols-3 text-slate-400 border-t border-slate-700"><span className="px-1.5 py-0.5">Beta</span><span className="px-1.5 py-0.5">42 ms</span><span className="px-1.5 py-0.5 text-sky-400">Ready</span></div>
      </div>
    ),
  },
  layouts: {
    title: 'Ready-made layouts',
    description: 'Opens a menu of designed slides, such as big numbers, a hero quote, before/after, a timeline or a team page. Pick one and fill in your words.',
    preview: (
      <div className="grid grid-cols-2 gap-1.5 w-40">
        <Slide className="h-10 items-center justify-center"><div className="flex gap-1"><div className="w-3 h-3 rounded-sm bg-indigo-400/70" /><div className="w-3 h-3 rounded-sm bg-indigo-400/70" /><div className="w-3 h-3 rounded-sm bg-indigo-400/70" /></div></Slide>
        <Slide className="h-10 items-center justify-center"><span className="text-indigo-300 text-lg leading-none">“</span><Line w="w-3/4" /></Slide>
        <Slide className="h-10"><div className="flex gap-1 h-full"><div className="flex-1 rounded-sm bg-rose-400/40" /><div className="flex-1 rounded-sm bg-emerald-400/40" /></div></Slide>
        <Slide className="h-10 justify-center"><div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /><Line /><span className="w-2 h-2 rounded-full bg-indigo-400" /></div></Slide>
      </div>
    ),
  },
  diagram: {
    title: 'Diagrams and charts',
    description: 'Opens a menu of flowcharts, bar charts, sequence diagrams and more. They are drawn from simple text, so they stay sharp on any screen.',
    preview: (
      <div className="flex items-center gap-1.5">
        <div className="px-2 py-1 rounded border border-emerald-500 bg-emerald-950/40 text-[9px] text-emerald-200">Start</div>
        <Arrow />
        <div className="px-2 py-1 rounded border border-sky-500 bg-sky-950/40 text-[9px] text-sky-200">Step</div>
        <Arrow />
        <div className="px-2 py-1 rounded border border-purple-500 bg-purple-950/40 text-[9px] text-purple-200">Done</div>
      </div>
    ),
  },
  color: {
    title: 'Text color',
    description: 'Select some words in the editor first, then pick a color to make them stand out.',
    preview: (
      <div className="w-40 rounded-md bg-slate-900 border border-slate-700 p-2 text-[11px] text-slate-300">
        Grow revenue by <span style={{ color: '#6ee7b7' }} className="font-semibold">40%</span> this <span style={{ color: '#fda4af' }} className="font-semibold">quarter</span>
      </div>
    ),
  },
  upload: {
    title: 'Upload a file',
    description: 'Loads an existing Markdown (.md) file from your computer into the editor. Your current text will be replaced.',
    preview: (
      <div className="flex items-center gap-2">
        <div className="w-9 h-11 rounded border border-indigo-500/60 bg-indigo-950/40 flex items-end justify-center pb-1 text-[9px] font-semibold text-indigo-300">.md</div>
        <Arrow />
        <Slide className="w-20 h-11"><Heading /><Line /><Line w="w-2/3" /></Slide>
      </div>
    ),
  },
};
