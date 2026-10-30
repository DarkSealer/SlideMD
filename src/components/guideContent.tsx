import React from 'react';
import {
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
  LayoutGrid,
  Columns2,
  FolderOpen,
  Download,
  Play,
  Monitor,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

export interface WalkthroughLine {
  code: string;
  meaning: string;
}

export interface GuideTool {
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
  /** A realistic example written the way a presenter would use it. */
  example: { situation: string; code: string; lines: WalkthroughLine[] };
  tips?: string[];
  /** Key into TOOLBAR_HINTS used to draw the "what your audience sees" picture. */
  hintKey: string;
  /** Tools that open a menu list their choices in the guide too. */
  menu?: 'layouts' | 'diagrams';
  /** What gets inserted by the Insert Example button. */
  snippet: string;
}

const ic = 'w-4 h-4';

export const GUIDE_TOOLS: GuideTool[] = [
  {
    id: 'slide',
    name: 'New Slide',
    buttonLabel: 'Slide (---)',
    icon: <Plus className={ic} />,
    iconColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/50',
    badge: 'Basics',
    shortDesc: 'Starts a brand new slide.',
    whatItDoes:
      'Everything you write is split into slides. Three dashes (---) on their own line mean "the next slide starts here".',
    whenToUse: 'Every time you move to a new topic, question or key point. Slides are free, so use plenty.',
    howToUse:
      'Click Slide (---). It adds the dashes plus a ready-to-edit title and text. Or type --- on an empty line yourself.',
    example: {
      situation: 'A two-slide mini talk: a welcome slide followed by an agenda slide.',
      code: '# Welcome\nThanks for joining today.\n\n---\n\n## Agenda\n- Where we are\n- Where we are going',
      lines: [
        { code: '# Welcome', meaning: 'A heading. One # makes a huge title, ## a medium one, ### a small one.' },
        { code: 'Thanks for joining today.', meaning: 'Plain text. It shows up exactly as typed.' },
        { code: '---', meaning: 'The divider. Everything above is slide 1, everything below is slide 2.' },
        { code: '- Where we are', meaning: 'A dash and a space at the start of a line makes a bullet point.' },
      ],
    },
    tips: ['Leave an empty line above and below the --- so it is read as a divider.', 'The slide strip at the bottom shows every slide. Click one to jump to it.'],
    hintKey: 'slide',
    snippet: '\n\n---\n\n## Agenda\n\n- Where we are\n- Where we are going\n',
  },
  {
    id: 'subslide',
    name: 'Sub-slide',
    buttonLabel: 'Sub-slide (--)',
    icon: <Layers className={ic} />,
    iconColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50',
    badge: 'Structure',
    shortDesc: 'A follow-up slide that belongs to the slide above it.',
    whatItDoes:
      'Groups extra detail under a main slide. Two dashes (--) start a sub-slide. It plays right after its main slide and is marked "sub" in the slide strip.',
    whenToUse: 'For backup details, proof, charts or answers to likely questions that belong to one main idea.',
    howToUse: 'Click Sub-slide (--), or type -- on an empty line. Keep presenting with the arrow keys or Space as usual.',
    example: {
      situation: 'A main slide about sales with a detail slide behind it.',
      code: '## Sales grew 40%\nOur best quarter yet.\n\n--\n\n### How we did it\n- New pricing\n- Faster onboarding',
      lines: [
        { code: '## Sales grew 40%', meaning: 'The main slide.' },
        { code: '--', meaning: 'Two dashes: the next part is a detail slide of the main slide above.' },
        { code: '### How we did it', meaning: 'The sub-slide title. It stays grouped with its main slide.' },
      ],
    },
    tips: ['One main slide = three dashes (---). Detail under it = two dashes (--).'],
    hintKey: 'subslide',
    snippet: '\n\n--\n\n### Deep Dive: Supporting Data\n\nDetailed breakdown or bonus evidence.\n',
  },
  {
    id: 'notes',
    name: 'Speaker Note',
    buttonLabel: 'Speaker Note',
    icon: <StickyNote className={ic} />,
    iconColor: 'text-amber-400 bg-amber-950/60 border-amber-700/50',
    badge: 'Presenter only',
    shortDesc: 'Private reminders only you can see.',
    whatItDoes:
      'Notes are your script. The audience never sees them. You read them in the Presenter Console next to a timer, or peek at them with the Notes button under the preview.',
    whenToUse: 'On any slide where you want reminders: numbers to quote, a story to tell, a question to ask.',
    howToUse:
      'Click Speaker Note, then type your reminder. Everything after the word Note: on that slide becomes the note. To read them while presenting, press S or click Notes in the top bar.',
    example: {
      situation: 'A slide with a private reminder at the bottom.',
      code: '## Our results\n- Revenue up 40%\n\nNote:\nPause here and ask if anyone is surprised.',
      lines: [
        { code: '## Our results', meaning: 'The slide the audience sees.' },
        { code: 'Note:', meaning: 'The magic word. Everything after it stays private.' },
        { code: 'Pause here and ask…', meaning: 'Only visible to you in the Presenter Console (S).' },
      ],
    },
    tips: ['Prefer hidden-comment style? <!-- note: your text --> works too.', 'Exporting to PowerPoint? You can choose to include the notes.'],
    hintKey: 'note',
    snippet: '\nNote:\nRemind the audience of our 40% growth last quarter. Pause for questions.\n',
  },
  {
    id: 'fragment',
    name: 'Step-by-step Reveal',
    buttonLabel: 'Fragment',
    icon: <Sparkles className={ic} />,
    iconColor: 'text-purple-400 bg-purple-950/60 border-purple-700/50',
    badge: 'Audience focus',
    shortDesc: 'Shows one point at a time as you click.',
    whatItDoes:
      'Hides a block until you press Next, so people listen to you instead of reading ahead. Each fragment block appears on its own click.',
    whenToUse: 'Lists of 3 to 5 points, a surprise number, or any step-by-step story.',
    howToUse:
      'Put the text between :::fragment and :::. While presenting, each press of Space or → reveals the next block. In the preview, use Show All / Reset Steps to test it.',
    example: {
      situation: 'Three goals that appear one at a time.',
      code: ':::fragment\n1. Grow revenue\n:::\n\n:::fragment\n2. Cut costs\n:::\n\n:::fragment\n3. Delight customers\n:::',
      lines: [
        { code: ':::fragment', meaning: 'Start of a hidden block.' },
        { code: '1. Grow revenue', meaning: 'Whatever you write here is hidden until the click.' },
        { code: ':::', meaning: 'End of the block. Add another block for the next click.' },
      ],
    },
    tips: ['Every block is its own click. Three blocks = three clicks.'],
    hintKey: 'fragment',
    snippet: '\n:::fragment\n1. First key milestone (appears on first click)\n:::\n\n:::fragment\n2. Second breakthrough (appears on second click)\n:::\n',
  },
  {
    id: 'columns',
    name: 'Columns',
    buttonLabel: 'Columns',
    icon: <Columns className={ic} />,
    iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    badge: 'Layout',
    shortDesc: 'Puts content side by side.',
    whatItDoes: 'Splits a slide into two or more columns. Each column can hold headings, lists, bold text and images.',
    whenToUse: 'Before and after, pros and cons, old way vs new way, or a photo beside text.',
    howToUse: 'Click Columns, then edit the text. Start with :::columns, begin each column with :::column, and end with :::.',
    example: {
      situation: 'Comparing two options.',
      code: ':::columns\n:::column\n### Option A\n- Cheaper\n:::column\n### Option B\n- Faster\n:::',
      lines: [
        { code: ':::columns', meaning: 'Opens the column area.' },
        { code: ':::column', meaning: 'Starts one column. Repeat it for each extra column.' },
        { code: '### Option A', meaning: 'Normal content goes inside a column.' },
        { code: ':::', meaning: 'Closes the whole column area.' },
      ],
    },
    tips: ['Add a third :::column to get three columns.'],
    hintKey: 'columns',
    snippet: '\n:::columns\n:::column\n### Option A: The Monolith\n- Slower deployment\n- Higher complexity\n:::column\n### Option B: Cloud Edge\n- Instant scaling\n- 85% lower latency\n:::\n',
  },
  {
    id: 'code',
    name: 'Code Block',
    buttonLabel: 'Code',
    icon: <Code2 className={ic} />,
    iconColor: 'text-sky-400 bg-sky-950/60 border-sky-700/50',
    badge: 'Technical',
    shortDesc: 'Shows computer code in a neat dark box.',
    whatItDoes: 'Keeps code spacing exactly as typed and colors the words for readability. Each block gets a Copy button.',
    whenToUse: 'Whenever you show code, a command, or any text that must keep its exact spacing.',
    howToUse: 'Click Code, then replace the sample. The line with three backticks and a language name opens the block; three backticks alone close it.',
    example: {
      situation: 'Showing a tiny JavaScript function.',
      code: '```javascript\nfunction hello() {\n  return "Hi!";\n}\n```',
      lines: [
        { code: '```javascript', meaning: 'Three backticks plus the language (python, sql, html…) start the box.' },
        { code: 'function hello() {…}', meaning: 'Your code, copied as you want it to appear.' },
        { code: '```', meaning: 'Three backticks close the box.' },
      ],
    },
    tips: ['No code? You can ignore this button entirely.'],
    hintKey: 'code',
    snippet: '\n```typescript\nfunction launchRocket(thrust: number): boolean {\n  return thrust > 9000;\n}\n```\n',
  },
  {
    id: 'math',
    name: 'Math Equation',
    buttonLabel: 'Math',
    icon: <Binary className={ic} />,
    iconColor: 'text-rose-400 bg-rose-950/60 border-rose-700/50',
    badge: 'Formulas',
    shortDesc: 'Turns a formula into clean math notation.',
    whatItDoes: 'Draws fractions, powers, roots and symbols the way a textbook does, using the standard LaTeX math language.',
    whenToUse: 'Finance formulas, science, statistics, engineering.',
    howToUse: 'Click Math and edit the formula between the $$ lines. For a small formula inside a sentence, wrap it in single $ signs.',
    example: {
      situation: 'Showing how return on investment is calculated.',
      code: '$$\n\\frac{\\text{Profit}}{\\text{Cost}} \\times 100\\%\n$$',
      lines: [
        { code: '$$', meaning: 'Opens and closes a big, centered formula.' },
        { code: '\\frac{A}{B}', meaning: 'A fraction: A on top of B.' },
        { code: 'x^2', meaning: 'x squared (the ^ means "to the power of").' },
        { code: '$E=mc^2$', meaning: 'Single $ signs put a small formula inside a sentence.' },
      ],
    },
    tips: ['If a formula looks like plain text, check for a missing } or $.'],
    hintKey: 'math',
    snippet: '\n$$\n\\text{ROI} = \\frac{\\text{Net Profit}}{\\text{Cost of Investment}} \\times 100\\%\n$$\n',
  },
  {
    id: 'callout',
    name: 'Callout',
    buttonLabel: 'Callout',
    icon: <AlertCircle className={ic} />,
    iconColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-700/50',
    badge: 'Visual punch',
    shortDesc: 'A colored card for the one thing nobody should miss.',
    whatItDoes: 'Highlights a message in a colored box with a label. Four kinds: NOTE, TIP, WARNING and IMPORTANT, each with its own color.',
    whenToUse: 'The main takeaway, a safety warning, or a tip.',
    howToUse: 'Click Callout and change the word in the brackets (NOTE, TIP, WARNING or IMPORTANT) and the text after it.',
    example: {
      situation: 'A warning on a deployment slide.',
      code: '> [!WARNING]\n> Back up your data before upgrading.',
      lines: [
        { code: '> [!WARNING]', meaning: 'The > makes a quote box. The word in [! ] picks the type and color.' },
        { code: '> Back up your data…', meaning: 'Your message. Start every line with > to keep it inside the box.' },
      ],
    },
    tips: ['Use no more than one callout per slide so it stays special.'],
    hintKey: 'callout',
    snippet: '\n> [!TIP]\n> Always test your presentation with the projector before your audience arrives!\n',
  },
  {
    id: 'table',
    name: 'Table',
    buttonLabel: 'Table',
    icon: <Table className={ic} />,
    iconColor: 'text-slate-300 bg-slate-900 border-slate-700/50',
    badge: 'Data',
    shortDesc: 'Rows and columns for numbers and comparisons.',
    whatItDoes: 'Draws a tidy grid with a highlighted header row.',
    whenToUse: 'Pricing, schedules, side-by-side numbers, survey results.',
    howToUse: 'Click Table and edit the cells. Separate cells with | and keep the dashed line under the header.',
    example: {
      situation: 'A tiny pricing table.',
      code: '| Plan | Price |\n| :--- | :--- |\n| Starter | Free |\n| Pro | $19/mo |',
      lines: [
        { code: '| Plan | Price |', meaning: 'The header row. Each | separates one column from the next.' },
        { code: '| :--- | :--- |', meaning: 'The line under the header. It must be there. Colons set alignment.' },
        { code: '| Starter | Free |', meaning: 'A normal row. Add as many as you need.' },
      ],
    },
    tips: ['The columns do not need to line up in the editor. Only the | symbols matter.'],
    hintKey: 'table',
    snippet: '\n| Plan | Speed | Storage | Price |\n| :--- | :--- | :--- | :--- |\n| Starter | 1 Gbps | 50 GB | Free |\n| Pro | 10 Gbps | 500 GB | $19/mo |\n',
  },
  {
    id: 'layouts',
    name: 'Ready-made Layouts',
    buttonLabel: 'Layouts',
    icon: <LayoutGrid className={ic} />,
    iconColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/50',
    badge: 'Menu of 5',
    shortDesc: 'Designed slides you fill in with your own words.',
    whatItDoes: 'Opens a menu of finished slide designs. Pick one and a complete slide is added at your cursor.',
    whenToUse: 'When you want a polished slide fast: big numbers, a testimonial, a before/after, a roadmap or a team page.',
    howToUse: 'Click Layouts, hover a choice to preview it, then click it. Replace the sample words and numbers with yours. Keep the structure the same.',
    example: {
      situation: 'You pick KPI Metric Grid and get cards like this.',
      code: '<div class="slide-kpi-card">\n  <div class="slide-kpi-val">+185%</div>\n  <div class="slide-kpi-label">Throughput</div>\n</div>',
      lines: [
        { code: '+185%', meaning: 'The big number. Change it to your own.' },
        { code: 'Throughput', meaning: 'The label under the number. Change it too.' },
        { code: '<div …> … </div>', meaning: 'Layout boxes. Leave these in place and only edit the words between them.' },
      ],
    },
    tips: ['Change only the words and numbers. The < > pieces make the design work.'],
    hintKey: 'layouts',
    menu: 'layouts',
    snippet: '',
  },
  {
    id: 'diagram',
    name: 'Diagrams & Charts',
    buttonLabel: 'Diagram',
    icon: <Workflow className={ic} />,
    iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    badge: 'Menu of 8',
    shortDesc: 'Draws flowcharts and charts from a few lines of text.',
    whatItDoes: 'You write short text and the app draws a sharp diagram that stays crisp on any screen. Eight kinds are included.',
    whenToUse: 'Processes, plans, timelines of events, comparisons, sales splits, and how systems talk to each other.',
    howToUse: 'Click Diagram, hover a choice to preview it, then click it. Edit the words inside the box that appears. Do not delete the mermaid lines at the top and bottom.',
    example: {
      situation: 'A three-step process.',
      code: '```mermaid\ngraph LR\n  A[Idea] --> B[Build] --> C[Launch]\n```',
      lines: [
        { code: '```mermaid', meaning: 'Tells the app "draw a diagram from the lines below".' },
        { code: 'graph LR', meaning: 'A flowchart that reads left to right (TD would read top to bottom).' },
        { code: 'A[Idea] --> B[Build]', meaning: 'Two boxes joined by an arrow. The words in [ ] show on the box.' },
        { code: '```', meaning: 'Closes the diagram.' },
      ],
    },
    tips: ['If a diagram shows an error, a bracket or arrow is probably missing.', 'You can also type :::mermaid … ::: instead of the backticks.'],
    hintKey: 'diagram',
    menu: 'diagrams',
    snippet: '```mermaid\ngraph LR\n  A[Idea] --> B[Build] --> C[Launch]\n```\n',
  },
  {
    id: 'color',
    name: 'Text Color',
    buttonLabel: 'Color',
    icon: <Palette className={ic} />,
    iconColor: 'text-pink-400 bg-pink-950/60 border-pink-700/50',
    badge: 'Styling',
    shortDesc: 'Colors the words you select.',
    whatItDoes:
      'Wraps the selected words in a color tag so they stand out. With nothing selected it inserts a sample word you can replace.',
    whenToUse: 'To emphasize a key number or phrase. Use sparingly.',
    howToUse:
      'Select words in the editor, click Color, pick a swatch. To change the color of a whole slide, use Text Color above the preview instead.',
    example: {
      situation: 'Highlight one number.',
      code: 'Revenue grew <span style="color: #6ee7b7">40%</span> this year.',
      lines: [
        { code: '<span style="color: #6ee7b7">', meaning: 'Starts the color. The code after # is the color.' },
        { code: '40%', meaning: 'The words that get colored.' },
        { code: '</span>', meaning: 'Ends the color.' },
      ],
    },
    tips: ['Dark text on a light theme, light text on a dark theme. White on white will be invisible.'],
    hintKey: 'color',
    snippet: 'Revenue grew <span style="color: #6ee7b7">40%</span> this year.\n',
  },
  {
    id: 'upload',
    name: 'Upload .md File',
    buttonLabel: 'Upload .md',
    icon: <Upload className={ic} />,
    iconColor: 'text-indigo-300 bg-indigo-950/70 border-indigo-800/60',
    badge: 'Import',
    shortDesc: 'Loads a Markdown file from your computer.',
    whatItDoes: 'Reads a .md or .txt file and puts its text in the editor. It replaces what is there now, so save or export first if you want to keep it.',
    whenToUse: 'Starting from a file written in another app, or sent to you by a colleague.',
    howToUse: 'Click Upload .md and choose a file, or drag the file onto the editor.',
    example: {
      situation: 'A colleague emails talk.md.',
      code: '(drag talk.md into the editor)',
      lines: [
        { code: 'Click Upload .md', meaning: 'Pick the file in the window that opens.' },
        { code: 'or drag and drop', meaning: 'Drop it anywhere on the editor.' },
        { code: 'Tip', meaning: 'Want to keep the old text? Use Decks to start a new deck first.' },
      ],
    },
    hintKey: 'upload',
    snippet: '# My Imported Presentation\n\nSlide content...\n',
  },
];

export interface TourItem {
  icon: React.ReactNode;
  color: string;
  title: string;
  where: string;
  summary: string;
  points: string[];
}

const ti = 'w-4 h-4';

export const GUIDE_TOUR: TourItem[] = [
  {
    icon: <Columns2 className={ti} />,
    color: 'text-sky-400 bg-sky-950/60 border-sky-700/50',
    title: 'Split View, Editor and Preview',
    where: 'Top bar, center',
    summary: 'Choose how much room you give writing versus the live result.',
    points: [
      'Split View: write on the left, watch the slide on the right.',
      'Editor: a full-width writing area.',
      'Preview: just the slide with its controls.',
      'The title in the top-left is clickable. Click it to rename your presentation.',
    ],
  },
  {
    icon: <Save className={ti} />,
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    title: 'Automatic saving, even offline',
    where: 'Top bar, "Synced locally"',
    summary: 'Everything is saved in your browser while you type. Nothing is uploaded.',
    points: [
      'No Save button is needed.',
      'Works with no internet. The badge turns amber and says "Working offline".',
      'Clearing your browser data removes decks, so export anything important.',
      'Install: the Install button adds SlideMD to your computer or phone as an app.',
    ],
  },
  {
    icon: <FolderOpen className={ti} />,
    color: 'text-amber-400 bg-amber-950/60 border-amber-700/50',
    title: 'Decks library',
    where: 'Top bar, Decks',
    summary: 'Keep several presentations and start from ready-made examples.',
    points: [
      'Saved decks: open, duplicate or delete your presentations.',
      'Starter Templates: three finished talks to learn from or reuse.',
      'New Deck starts a blank presentation.',
      'Import File brings in a .md or .json file as a separate deck.',
    ],
  },
  {
    icon: <Palette className={ti} />,
    color: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/50',
    title: 'Theme and look',
    where: 'Top bar, Theme',
    summary: 'Change the whole look of every slide at once.',
    points: [
      '8 color themes, from Obsidian Night and Executive Navy to Architectural Minimal.',
      'Typography: Modern Sans, Editorial Serif or Technical Mono.',
      'Slide transition: Slide, Fade, Convex, Zoom or Instant.',
      'Aspect ratio: 16:9 widescreen or 4:3 standard.',
      'Switches for slide numbers, a progress bar and vertical centering.',
    ],
  },
  {
    icon: <Palette className={ti} />,
    color: 'text-pink-400 bg-pink-950/60 border-pink-700/50',
    title: 'Text Color for one slide',
    where: 'Above the preview, Text Color',
    summary: 'Change the text color of just the current slide.',
    points: [
      'Pick a color, then Apply to Slide in .md. It is saved in the slide as <!-- color: … -->.',
      'Reset Slide to Theme Default removes it.',
    ],
  },
  {
    icon: <ImageIcon className={ti} />,
    color: 'text-rose-400 bg-rose-950/60 border-rose-700/50',
    title: 'Backgrounds and per-slide settings',
    where: 'Type in the editor',
    summary: 'Give one slide its own background or transition. Add the line anywhere in that slide.',
    points: [
      '<!-- bg: #1e1e2e --> sets a background color.',
      '<!-- .slide: data-background-image="https://…" --> sets a background picture.',
      '<!-- transition: zoom --> picks how this slide enters.',
      '<!-- color: #ffffff --> sets the text color.',
    ],
  },
  {
    icon: <Download className={ti} />,
    color: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50',
    title: 'Export and share',
    where: 'Top bar, Export',
    summary: 'Take your presentation with you.',
    points: [
      'Interactive standalone HTML: one file that opens in any browser, even offline.',
      'PowerPoint (.pptx): editable in PowerPoint, with an option to include speaker notes.',
      'PDF: opens the print view so you can save slides as a PDF.',
      'Shareable web link: marked "Coming soon".',
    ],
  },
  {
    icon: <Play className={ti} />,
    color: 'text-indigo-300 bg-indigo-950/70 border-indigo-800/60',
    title: 'Present (fullscreen)',
    where: 'Top bar, Present',
    summary: 'Runs your slides fullscreen for the audience.',
    points: [
      'Move with arrow keys, Space or the on-screen buttons.',
      'Laser pointer, speaker notes and a Slide Overview grid (O) are in the bottom toolbar.',
      'B blacks out the screen. Esc exits.',
    ],
  },
  {
    icon: <Monitor className={ti} />,
    color: 'text-amber-300 bg-amber-950/60 border-amber-700/50',
    title: 'Presenter Console (Notes)',
    where: 'Top bar, Notes (or press S)',
    summary: 'Your private control panel, for a second screen.',
    points: [
      'Shows the current and next slide, your notes, and a timer you can reset.',
      'Open the clean presentation window and drag it to the projector.',
      'The audience screen follows your slide changes automatically.',
      'L toggles the laser on the projector. B blacks out the audience display.',
    ],
  },
  {
    icon: <Sparkles className={ti} />,
    color: 'text-purple-400 bg-purple-950/60 border-purple-700/50',
    title: 'Preview controls',
    where: 'Around the slide preview',
    summary: 'Check your slide as you write.',
    points: [
      'Prev / Next steps through slides and reveal steps.',
      'Show All / Reset Steps tests step-by-step reveals.',
      'The slide menu in the corner jumps to any slide. The strip at the bottom does too.',
      'Laser, Notes peek and Fullscreen buttons sit above the slide.',
    ],
  },
];
