import mermaid from 'mermaid';

export interface MermaidSnippet {
  id: string;
  label: string;
  badge: string;
  description: string;
  code: string;
}

export const MERMAID_SNIPPETS: MermaidSnippet[] = [
  {
    id: 'flowchart',
    label: 'Flowchart / Graph',
    badge: 'graph LR',
    description: 'Architecture flows, decision trees, and service pipelines.',
    code: `\`\`\`mermaid
graph LR
    User([End User]) --> API[API Gateway]
    API --> Auth{Valid Token?}
    Auth -- Yes --> App[App Service]
    Auth -- No --> Err[401 Denied]
    App --> Cache[(Redis L1)]
    App --> DB[(Database)]

    style User fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
    style API fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style Auth fill:#3730a3,stroke:#a5b4fc,stroke-width:2px,color:#fff
    style App fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5
    style Err fill:#7f1d1d,stroke:#f87171,stroke-width:2px,color:#fecaca
    style Cache fill:#065f46,stroke:#10b981,stroke-width:2px,color:#ecfdf5
    style DB fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#f8fafc
\`\`\``,
  },
  {
    id: 'xychart',
    label: 'XY Chart (Bar & Line)',
    badge: 'xychart-beta',
    description: 'Data metrics, latency comparisons, and performance benchmarks.',
    code: `\`\`\`mermaid
xychart-beta
    title "P99 Latency vs Workload (ms - Lower is Better)"
    x-axis ["1k req/s", "10k req/s", "50k req/s", "100k req/s", "500k req/s"]
    y-axis "Latency (ms)" 0 --> 120
    bar [15, 24, 42, 68, 105]
    line [12, 20, 38, 59, 94]
\`\`\``,
  },
  {
    id: 'sequence',
    label: 'Sequence Diagram',
    badge: 'sequenceDiagram',
    description: 'Step-by-step actor interactions and synchronous/asynchronous flows.',
    code: `\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Web App
    participant Auth as Auth Server
    participant API as API Cluster
    participant DB as Postgres DB

    User->>App: Click Sign In
    App->>Auth: OAuth 2.0 Auth Request
    Auth-->>App: Access Token (JWT)
    App->>API: GET /api/v1/profile (Bearer token)
    API->>DB: Query user record
    DB-->>API: User row data
    API-->>App: 200 OK { user }
    App-->>User: Welcome Dashboard!
\`\`\``,
  },
  {
    id: 'state',
    label: 'State Machine Diagram',
    badge: 'stateDiagram-v2',
    description: 'Lifecycle states, transitions, triggers, and error recovery.',
    code: `\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: Fetch Data
    Loading --> Success: 200 OK
    Loading --> Error: Network Failure
    Error --> Loading: Retry (Backoff)
    Error --> Idle: Reset
    Success --> [*]
\`\`\``,
  },
  {
    id: 'pie',
    label: 'Pie Chart',
    badge: 'pie',
    description: 'Percentage distribution, category breakdown, and market share.',
    code: `\`\`\`mermaid
pie title "Compute Resource Allocation"
    "Edge Serverless" : 48
    "Database Replicas" : 26
    "Event Streaming" : 16
    "Observability" : 10
\`\`\``,
  },
  {
    id: 'class',
    label: 'Class Diagram',
    badge: 'classDiagram',
    description: 'Object-oriented models, entities, fields, and inheritance.',
    code: `\`\`\`mermaid
classDiagram
    class SlideDeck {
      +String id
      +String title
      +SlideContent[] slides
      +exportHtml() String
    }
    class SlideContent {
      +String id
      +String htmlContent
      +String speakerNotes
    }
    SlideDeck "1" *-- "many" SlideContent
\`\`\``,
  },
  {
    id: 'git',
    label: 'Git Branching Graph',
    badge: 'gitGraph',
    description: 'Trunk-based development, release cuts, and feature branches.',
    code: `\`\`\`mermaid
gitGraph
    commit id: "v1.0"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "add parser"
    commit id: "add xychart"
    checkout main
    merge feature/mermaid id: "PR #42"
    commit id: "v1.1 release" tag: "v1.1.0"
\`\`\``,
  },
  {
    id: 'mindmap',
    label: 'Mindmap',
    badge: 'mindmap',
    description: 'Brainstorming topics, hierarchical concepts, and feature roadmaps.',
    code: `\`\`\`mermaid
mindmap
  root((SlideCraft))
    Markdown Engine
      Standard GFM
      Custom Directives
      LaTeX Math
    Mermaid Diagrams
      Flowcharts
      xychart-beta
      Sequence
    Presentations
      Split Editor
      Presenter Console
      Standalone HTML
\`\`\``,
  },
];

let currentThemeMode: 'light' | 'dark' | null = null;

export function initializeMermaid(isLight: boolean = false) {
  const targetMode = isLight ? 'light' : 'dark';
  if (currentThemeMode === targetMode) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    theme: 'base',
    themeVariables: isLight
      ? {
          darkMode: false,
          background: 'transparent',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: '13px',

          // Primary nodes
          primaryColor: '#eef2ff',
          primaryTextColor: '#1e1b4b',
          primaryBorderColor: '#6366f1',

          // Secondary & Tertiary
          secondaryColor: '#f8fafc',
          secondaryTextColor: '#334155',
          secondaryBorderColor: '#94a3b8',
          tertiaryColor: '#f1f5f9',
          tertiaryTextColor: '#475569',
          tertiaryBorderColor: '#cbd5e1',

          // Lines and arrows
          lineColor: '#6366f1',
          arrowheadColor: '#6366f1',
          defaultLinkColor: '#6366f1',

          // Edge labels (Yes / No / Conditions)
          edgeLabelBackground: '#ffffff',
          labelBackground: '#ffffff',
          labelTextColor: '#312e81',
          labelBorder: '#c7d2fe',

          // Clusters
          clusterBkg: '#f8fafc',
          clusterBorder: '#cbd5e1',
          titleColor: '#0f172a',
          nodeBorder: '#6366f1',
          mainBkg: '#eef2ff',
          nodeTextColor: '#1e1b4b',

          // Sequence diagrams
          actorBkg: '#eef2ff',
          actorBorder: '#6366f1',
          actorTextColor: '#1e1b4b',
          actorLineColor: '#94a3b8',
          signalColor: '#6366f1',
          signalTextColor: '#1e1b4b',
          labelBoxBkgColor: '#eef2ff',
          labelBoxBorderColor: '#6366f1',

          // State diagrams
          labelColor: '#1e1b4b',
          altBackground: '#f1f5f9',
        }
      : {
          darkMode: true,
          background: 'transparent',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: '13px',

          // Primary nodes - sleek dark indigo cards
          primaryColor: '#1e1b4b',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#818cf8',

          // Secondary & Tertiary
          secondaryColor: '#0f172a',
          secondaryTextColor: '#e2e8f0',
          secondaryBorderColor: '#475569',
          tertiaryColor: '#1e293b',
          tertiaryTextColor: '#cbd5e1',
          tertiaryBorderColor: '#334155',

          // Lines and arrows - vibrant neon indigo
          lineColor: '#818cf8',
          arrowheadColor: '#818cf8',
          defaultLinkColor: '#818cf8',

          // Edge labels
          edgeLabelBackground: '#0f172a',
          labelBackground: '#0f172a',
          labelTextColor: '#c7d2fe',
          labelBorder: '#4f46e5',

          // Clusters
          clusterBkg: '#0f172a',
          clusterBorder: '#334155',
          titleColor: '#f8fafc',
          nodeBorder: '#818cf8',
          mainBkg: '#1e1b4b',
          nodeTextColor: '#f8fafc',

          // Sequence diagrams
          actorBkg: '#1e1b4b',
          actorBorder: '#818cf8',
          actorTextColor: '#f8fafc',
          actorLineColor: '#64748b',
          signalColor: '#818cf8',
          signalTextColor: '#e0e7ff',
          labelBoxBkgColor: '#1e1b4b',
          labelBoxBorderColor: '#818cf8',

          // State diagrams
          labelColor: '#f8fafc',
          altBackground: '#1e293b',
        },
    flowchart: {
      htmlLabels: true,
      curve: 'basis', // Smooth, modern bezier curves
      padding: 14,
      nodeSpacing: 40,
      rankSpacing: 40,
      useMaxWidth: true,
    },
    sequence: {
      diagramMarginX: 30,
      diagramMarginY: 30,
      actorMargin: 50,
      width: 140,
      height: 44,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      messageAlign: 'center',
      mirrorActors: true,
      bottomMarginAdj: 20,
      useMaxWidth: true,
    },
    gantt: {
      useMaxWidth: true,
      fontSize: 12,
    },
  });
  currentThemeMode = targetMode;
}

let counter = 0;

/**
 * Renders a single raw Mermaid diagram string into an SVG string.
 */
export async function renderMermaidDiagram(code: string, isLight: boolean = false): Promise<string> {
  initializeMermaid(isLight);

  const cleanCode = code.trim();
  const id = `mermaid-chart-${Date.now()}-${++counter}`;

  try {
    const { svg } = await mermaid.render(id, cleanCode);
    return svg;
  } catch (err) {
    // If an error element was left in document body by mermaid, remove it
    const errorEl = document.getElementById(id) || document.getElementById(`d${id}`);
    if (errorEl) {
      errorEl.remove();
    }
    throw err;
  }
}

/**
 * Scans a DOM container for any .slide-mermaid-wrapper elements and asynchronously renders Mermaid SVGs.
 */
export async function renderAllMermaidInContainer(
  container: HTMLElement | null,
  isLight: boolean = false
): Promise<void> {
  if (!container) return;
  const mermaidWrappers = container.querySelectorAll<HTMLElement>('.slide-mermaid-wrapper');
  if (mermaidWrappers.length === 0) return;

  for (const wrapper of Array.from(mermaidWrappers)) {
    const rawCodeEncoded = wrapper.getAttribute('data-mermaid-code');
    if (!rawCodeEncoded) continue;

    let rawCode = '';
    try {
      rawCode = decodeURIComponent(rawCodeEncoded).trim();
    } catch {
      rawCode = rawCodeEncoded.trim();
    }

    const renderTarget = wrapper.querySelector<HTMLElement>('.slide-mermaid-render');
    if (!renderTarget) continue;

    const currentCode = wrapper.getAttribute('data-rendered-code');
    const currentTheme = wrapper.getAttribute('data-rendered-theme');
    const targetTheme = isLight ? 'light' : 'dark';

    // Already rendered matching code and theme
    if (currentCode === rawCode && currentTheme === targetTheme && renderTarget.querySelector('svg')) {
      continue;
    }

    try {
      const svg = await renderMermaidDiagram(rawCode, isLight);
      renderTarget.innerHTML = svg;
      wrapper.setAttribute('data-rendered-code', rawCode);
      wrapper.setAttribute('data-rendered-theme', targetTheme);

      // Ensure SVG is responsive, scaled to slide bounds, and clean
      const svgEl = renderTarget.querySelector('svg');
      if (svgEl) {
        // Strip hardcoded fixed height/width attributes so viewBox rules
        svgEl.removeAttribute('height');
        svgEl.removeAttribute('width');
        svgEl.style.maxWidth = '100%';
        svgEl.style.maxHeight = '390px';
        svgEl.style.width = 'auto';
        svgEl.style.height = 'auto';
        svgEl.style.display = 'block';
        svgEl.style.margin = '0 auto';
        svgEl.classList.add('mermaid-svg');

        // Remove blurry muddy drop-shadow filters from SVG defs
        const filters = svgEl.querySelectorAll('filter');
        filters.forEach((f) => f.remove());
      }
    } catch (err) {
      // Clean up any error element injected by mermaid
      const injectedError = document.querySelector('[id^="dmermaid-chart-"]');
      if (injectedError) injectedError.remove();

      renderTarget.innerHTML = `
        <div class="flex flex-col items-center justify-center p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-center max-w-lg mx-auto">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
            <span>⚠️</span>
            <span>Mermaid Diagram (Validating Syntax...)</span>
          </div>
          <pre class="text-[11px] font-mono text-slate-400 max-h-32 overflow-auto text-left w-full p-2 bg-slate-950/80 rounded border border-slate-800">${escapeHtml(rawCode)}</pre>
        </div>
      `;
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
