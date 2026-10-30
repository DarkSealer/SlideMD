export interface SlideLayoutPattern {
  id: string;
  name: string;
  description: string;
  iconName: 'Gauge' | 'Quote' | 'Split' | 'Milestone' | 'Users';
  snippet: string;
}

export const SLIDE_LAYOUT_PATTERNS: SlideLayoutPattern[] = [
  {
    id: 'kpi-grid',
    name: 'KPI Metric Grid',
    description: '3-card high-impact metrics with delta subtitles',
    iconName: 'Gauge',
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
</div>

Note:
Highlight the latency drop in APAC region during Q3.
`,
  },
  {
    id: 'hero-quote',
    name: 'Hero Quote Callout',
    description: 'Editorial quotation with avatar and role attribution',
    iconName: 'Quote',
    snippet: `---

## Industry Perspective

<div class="slide-hero-quote">
  <div class="slide-quote-glyph">“</div>
  <blockquote class="slide-quote-text">
    Architecture is the set of decisions you wish you could get right early in a project. SlideMD made our vision instantly clear to stakeholders.
  </blockquote>
  <div class="slide-quote-author">
    <div class="slide-quote-avatar">EV</div>
    <div>
      <div class="slide-quote-name">Dr. Elena Vance</div>
      <div class="slide-quote-role">Principal Systems Architect · Apex Global</div>
    </div>
  </div>
</div>

Note:
Pause here to let the audience reflect on the architecture quote.
`,
  },
  {
    id: 'comparison',
    name: 'Before vs. After Comparison',
    description: '2-column comparative layout for evolution or pros/cons',
    iconName: 'Split',
    snippet: `---

## Architecture Evolution

<div class="slide-comparison">
  <div class="slide-compare-col before">
    <div class="slide-compare-header">
      <span class="slide-compare-tag">Legacy</span>
      <h3>Monolithic Pipeline</h3>
    </div>
    <ul>
      <li><strong>45 min</strong> cold-start deploy cycles</li>
      <li>Single shared point of failure</li>
      <li>Tightly coupled database locks</li>
      <li>Manual multi-step rollbacks</li>
    </ul>
  </div>
  <div class="slide-compare-col after">
    <div class="slide-compare-header">
      <span class="slide-compare-tag active">Modern</span>
      <h3>Distributed Edge Engine</h3>
    </div>
    <ul>
      <li><strong>Sub-second</strong> serverless deploys</li>
      <li>Multi-region automated failover</li>
      <li>Decoupled event-driven pub/sub state</li>
      <li>Instant zero-downtime rollbacks</li>
    </ul>
  </div>
</div>

Note:
Emphasize the shift from monolithic database locks to event-driven state.
`,
  },
  {
    id: 'timeline',
    name: 'Timeline Roadmap',
    description: 'Phased milestone journey with status badges',
    iconName: 'Milestone',
    snippet: `---

## Strategic Roadmap

<div class="slide-timeline">
  <div class="slide-timeline-item">
    <div class="slide-timeline-marker">Phase 01</div>
    <div class="slide-timeline-card">
      <h4>Foundation & Engine</h4>
      <p>Markdown AST parser, KaTeX math typesetting, and local autosave.</p>
      <span class="slide-timeline-badge done">Completed</span>
    </div>
  </div>
  <div class="slide-timeline-item">
    <div class="slide-timeline-marker">Phase 02</div>
    <div class="slide-timeline-card">
      <h4>Dual-Screen Sync</h4>
      <p>Zero-latency BroadcastChannel projector mirror with laser pointer.</p>
      <span class="slide-timeline-badge current">Current</span>
    </div>
  </div>
  <div class="slide-timeline-item">
    <div class="slide-timeline-marker">Phase 03</div>
    <div class="slide-timeline-card">
      <h4>Global Distribution</h4>
      <p>Offline PWA cache, interactive layouts, and high-fidelity exports.</p>
      <span class="slide-timeline-badge next">Target Q4</span>
    </div>
  </div>
</div>

Note:
Walk through Phase 02 deliverable timelines and current beta milestones.
`,
  },
  {
    id: 'team-grid',
    name: 'Team Profile Showcase',
    description: '3-member leadership or team member card grid',
    iconName: 'Users',
    snippet: `---

## Core Leadership Team

<div class="slide-team-grid">
  <div class="slide-team-card">
    <div class="slide-team-avatar">AR</div>
    <h4>Alex Rivera</h4>
    <div class="slide-team-role">Lead Systems Architect</div>
    <p>Specializes in distributed protocols, edge networks, and state synchronization.</p>
  </div>
  <div class="slide-team-card">
    <div class="slide-team-avatar">MP</div>
    <h4>Maya Patel</h4>
    <div class="slide-team-role">Head of Product Design</div>
    <p>Focused on typographic precision, zero-clutter ergonomics, and accessibility.</p>
  </div>
  <div class="slide-team-card">
    <div class="slide-team-avatar">JR</div>
    <h4>Julian Rossi</h4>
    <div class="slide-team-role">Principal Infrastructure</div>
    <p>Leads high-efficiency client runtimes and zero-cost offline storage architecture.</p>
  </div>
</div>

Note:
Introduce core leads and highlight their domain expertise.
`,
  },
];
