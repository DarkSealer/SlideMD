import { PresentationDeck } from '../types/presentation';
import { normalizeSlideDirectives } from './markdownParser';

const STORAGE_KEY_DECKS = 'slidecraft_decks_v4';
const STORAGE_KEY_ACTIVE = 'slidecraft_active_deck_id';

export const STARTER_TEMPLATES: PresentationDeck[] = [
  {
    id: 'deck-tech-pitch',
    title: 'Modern Architecture & Scaling Systems',
    description: 'Technical architecture deck featuring distributed systems topology, Mermaid diagrams, code snippets, latency benchmarks, and mathematical verification.',
    category: 'Technical',
    tags: ['Mermaid Diagrams', 'Code Blocks', 'KaTeX Math', 'Benchmarks'],
    author: 'Systems Architecture Team',
    estimatedDuration: '15 min',
    featured: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    settings: {
      theme: 'obsidian',
      transition: 'slide',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'cyber-tech',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'atom-one-dark',
    },
    markdown: `# Modern Architecture & Scaling Systems
High-throughput distributed systems at planetary scale

:::columns
:::column
**Author:** Engineering Architecture Team  
**Focus:** Reliability, Latency & Microservices  
:::column
**Runtime:** Cloud-Native / Edge  
**Status:** Production Grade  
:::

Note:
Welcome everyone to the tech architecture overview. Today we'll cover our transition from monolith to event-driven microservices. Keep in mind questions can be held until the final Q&A section.

---

## The Core Challenge

Modern web applications face three fundamental scaling bottlenecks:

:::fragment
1. **Synchronous Network Cascades**: One slow downstream service blocks entire user requests.
:::

:::fragment
2. **State Mutability Invariants**: Race conditions in shared cache layers during concurrent writes.
:::

:::fragment
3. **Global Edge Serialization**: High round-trip times across multi-region datacenters.
:::

> [!WARNING]
> Unmitigated synchronous RPC trees increase P99 latency by over 380% during peak traffic spikes.

Note:
Emphasize point #1 here. Our latency monitoring showed that 70% of timeouts were caused by nested blocking HTTP calls.

--

### Deep Dive: Latency Profile

Vertical sub-slide examining edge vs origin round-trips:

| Metric | Legacy Monolith | Distributed Edge Engine |
| :--- | :--- | :--- |
| **P50 Latency** | 145 ms | **18 ms** |
| **P99 Latency** | 920 ms | **64 ms** |
| **Throughput** | 12,000 req/s | **185,000 req/s** |
| **Cold Boot** | 12.4 s | **Zero (Wasm)** |

Note:
Notice the 8x drop in P99 latency. This directly correlates with our edge compute worker topology.

---

## System Architecture

Distributed edge mesh topology:

\`\`\`mermaid
graph LR
    Client([💻 Client]) --> CDN[⚡ Edge CDN]
    CDN --> Router[🔀 API Router]
    Router --> Auth{🔐 Valid Token?}
    Auth -- Yes --> Workers[⚙️ Edge Workers]
    Auth -- No --> Err[🛑 401 Blocked]
    Workers --> Cache[(⚡ Redis Cache)]
    Workers --> Bus[[📡 Kafka Stream]]
    Bus --> Svc[📦 Order Svc]
    Bus --> Analytics[📊 Analytics]

    style Client fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
    style CDN fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style Router fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style Auth fill:#3730a3,stroke:#a5b4fc,stroke-width:2px,color:#fff
    style Workers fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5
    style Err fill:#7f1d1d,stroke:#f87171,stroke-width:2px,color:#fecaca
    style Cache fill:#065f46,stroke:#10b981,stroke-width:2px,color:#ecfdf5
    style Bus fill:#581c87,stroke:#c084fc,stroke-width:2px,color:#f3e8ff
    style Svc fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#f8fafc
    style Analytics fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#f8fafc
\`\`\`

Note:
Explain the edge router validation before dispatching to the Kafka streaming bus.

---

## Latency vs Concurrency Benchmark

Quantitative evaluation across peak load conditions:

\`\`\`mermaid
xychart-beta
    title "P99 Latency vs Traffic (ms - Lower is Better)"
    x-axis ["1k req/s", "10k req/s", "50k req/s", "100k req/s", "250k req/s"]
    y-axis "Latency (ms)" 0 --> 120
    bar [12, 18, 34, 58, 92]
    line [10, 15, 29, 48, 80]
\`\`\`

Note:
Highlight that even under 250k req/s, our P99 stays strictly below 100ms!

--

### Sequence: Distributed Order Lifecycle

Vertical sub-slide tracking the zero-loss transaction lifecycle:

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant Edge as Edge Gateway
    participant Bus as Event Bus
    participant Svc as Order Service
    participant DB as Postgres Shard

    User->>Edge: POST /api/orders
    Edge->>Bus: Publish order.pending
    Bus-->>Edge: ACK Event ID
    Edge-->>User: 202 Accepted { orderId }
    Bus->>Svc: Deliver Event
    Svc->>DB: Persist State
    DB-->>Svc: Commit OK
\`\`\`

Note:
Point out the 12ms immediate 202 Accepted acknowledgement to the mobile user.

---

## Event-Driven Worker Code

Clean implementation using streaming state:

\`\`\`typescript
import { createEventBus, StreamHandler } from '@scale/core';

export const orderPipeline = createEventBus({
  topic: 'orders.v1',
  concurrency: 64,
  retryPolicy: { maxRetries: 3, backoffMs: 250 }
});

orderPipeline.subscribe(async (event: OrderEvent) => {
  // 1. Optimistic edge ledger update
  const session = await edgeDB.reserveInventory(event.items);
  
  // 2. Dispatch parallel payment intent
  const payment = await paymentGateway.authorize({
    orderId: event.id,
    amount: event.totalCents,
  });

  return { status: 'confirmed', receipt: payment.txId };
});
\`\`\`

Note:
Highlight the optimistic concurrency model on line 12. If the payment authorization fails, compensation transactions roll back the edge reservation.

---

## Mathematical Verification

Our queue invariant guarantees deterministic bounded wait times:

$$W_q = \\frac{\\lambda}{\\mu(\\mu - \\lambda)} \\cdot \\left(1 + \\frac{C_a^2 + C_s^2}{2}\\right)$$

Where:
- $\\lambda$ represents incoming request arrival frequency
- $\\mu$ represents deterministic edge worker processing capacity
- $C_a^2$ and $C_s^2$ represent arrival and service variance coefficients

> [!TIP]
> Keeping worker queue utilization below 75% maintains exponential latency stability.

Note:
Walk through the Kingman formula approximation on this slide. This proves why our auto-scaler targets 70% CPU instead of 90%.

---

## Roadmap & Next Steps

:::columns
:::column
### Phase 1: Edge Mesh
- Global state replication
- 24 edge points of presence
- Wasm runtime isolation
:::
:::column
### Phase 2: Autonomous Scaling
- Dynamic query routing
- Zero-downtime blue/green
- Automated failover
:::
:::

Note:
Wrap up the presentation by reiterating the Q4 deadlines. Thank the team and open the floor for questions.
`,
  },
  {
    id: 'deck-executive-qbr',
    title: 'Executive Quarterly Business Review (QBR)',
    description: 'Board-ready corporate presentation covering ARR trajectory, unit economics, cohort retention, and strategic OKRs.',
    category: 'Corporate',
    tags: ['Board Deck', 'Financials', 'OKRs', 'Metrics'],
    author: 'Executive Leadership',
    estimatedDuration: '20 min',
    featured: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 5400000,
    settings: {
      theme: 'navy',
      transition: 'fade',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'warm-humanist',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'github-dark',
    },
    markdown: `# Q3 Executive Business Review
Scaling Enterprise Adoption & Operational Efficiency

:::columns
:::column
**Prepared For:** Board of Directors & Executive Staff  
**Fiscal Period:** Q3 FY2026  
:::column
**Net ARR Growth:** +44% YoY  
**Net Dollar Retention:** 128%  
:::

Note:
Welcome everyone to the Q3 Board and Executive Review. We outperformed our top-line net new ARR target by 14% while improving gross margins by 320 basis points.

---

## Executive Summary & Headline KPIs

| Performance Indicator | Q3 Target | Q3 Actual | YoY Delta |
| :--- | :--- | :--- | :--- |
| **Annual Recurring Revenue** | $48.5M | **$52.4M** | +44.2% |
| **Enterprise Customers (>100k)** | 115 | **132** | +51.7% |
| **Gross Margin (Non-GAAP)** | 78.0% | **81.2%** | +320 bps |
| **CAC Payback Period** | 16 mos | **13.2 mos** | -2.8 mos |

> [!TIP]
> Enterprise multi-year agreements accounted for 68% of all new bookings in Q3, up from 49% in Q2.

Note:
Call attention to the CAC payback reduction from 16 months down to 13.2 months driven by self-serve product-led expansion.

---

## Quarterly Revenue Trajectory

Consistent compounding across enterprise and mid-market segments:

\`\`\`mermaid
xychart-beta
    title "Quarterly Ending ARR ($ Millions)"
    x-axis ["Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"]
    y-axis "ARR ($M)" 25 --> 60
    bar [36.3, 39.8, 43.5, 47.9, 52.4]
    line [36.3, 39.8, 43.5, 47.9, 52.4]
\`\`\`

Note:
We added $4.5M in net new ARR this quarter with zero churn in our Fortune 500 cohort.

---

## Strategic Growth Pillars for Q4

:::columns
:::column
### 1. Up-Market Expansion
- Dedicated Federal & Financial Services compliance suite
- SOC2 Type II + ISO 27001 automated attestation
- Custom SLA & dedicated VPC deployment tier
:::
:::column
### 2. Product-Led Velocity
- Frictionless team workspace provisioning
- Instant SSO & SCIM directory sync
- AI-assisted onboarding workflows reducing time-to-value by 60%
:::
:::

Note:
Our Q4 pipeline already has $19.2M in late-stage qualified enterprise opportunities.

---

## Q4 Resource Allocation & OKRs

:::fragment
1. **Achieve $58.5M Ending ARR** with >125% Net Dollar Retention across all cohorts.
:::

:::fragment
2. **Launch EMEA Regional Data Residency** (Frankfurt & Dublin clusters) by November 15.
:::

:::fragment
3. **Maintain Rule of 55+** combining revenue growth rate and free cash flow margin.
:::

Note:
Open the floor to the Board for questions on EMEA expansion and Q4 hiring plan.
`,
  },
  {
    id: 'deck-product-strategy',
    title: 'Product Strategy & Vision 2027',
    description: 'Executive strategy presentation with clear milestones, market indicators, and clean minimal aesthetic.',
    category: 'Corporate',
    tags: ['Product Roadmap', 'Strategy', 'Market Thesis', '3-Column'],
    author: 'VP of Product',
    estimatedDuration: '12 min',
    featured: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
    settings: {
      theme: 'clean-white',
      transition: 'fade',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'modern-outfit',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'github-dark',
    },
    markdown: `# Product Strategy & Vision 2027
Accelerating documentation-to-presentation workflows

**Executive Briefing** · *Design & Engineering*

Note:
Welcome leaders. Today we present the strategic trajectory for documentation tooling over the next three fiscal years.

---

## The Strategic Thesis

Knowledge workers spend **4.2 hours per week** manually reformatting technical specs and Markdown notes into presentable slides.

:::fragment
- **Raw Documentation**: Markdown is the universal standard for technical clarity.
:::

:::fragment
- **The Presentation Gap**: Standard presentation software requires manual copy-paste, layout dragging, and broken code styles.
:::

:::fragment
- **The Solution**: Zero-friction markdown converter with instant interactive web slides, themes, and one-click cloud exports.
:::

Note:
Reference the 4.2 hours figure from our internal survey of 250 engineering teams.

---

## Measurable Outcomes

:::columns
:::column
### 90% Time Saved
From markdown draft to live presentation deck in under 60 seconds.
:::
:::column
### Zero Broken Syntax
Real syntax highlighting with copyable code blocks and math rendering.
:::
:::column
### Portable Delivery
Standalone single-file HTML and vector PDF export requiring no accounts.
:::
:::

> [!NOTE]
> Offline local storage ensures engineers can draft presentations anywhere, even without Wi-Fi.

Note:
Mention our offline-first capability. Crucial for conferences and on-site client presentations.

---

## Summary & Next Milestones

1. **Q1**: Standalone offline HTML and print-to-PDF export
2. **Q2**: Real-time presenter console with dual-screen timer
3. **Q3**: Enterprise brand themes and instant cloud link sharing

*Thank you for your time.*
`,
  },
  {
    id: 'deck-swiss-manifesto',
    title: 'Swiss Design Manifesto & Grid Architecture',
    description: 'Ultra-clean minimalist presentation built on International Typographic Style, asymmetric grids, and negative space.',
    category: 'Minimalist',
    tags: ['Typography', 'Grid Systems', 'Design Systems', 'Minimal'],
    author: 'Design Systems Studio',
    estimatedDuration: '10 min',
    featured: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 6000000,
    settings: {
      theme: 'clean-white',
      transition: 'none',
      aspectRatio: '16:9',
      fontFamily: 'serif',
      fontPairingId: 'editorial-serif',
      showSlideNumbers: true,
      showProgressBar: false,
      centerSlides: true,
      codeHighlightTheme: 'github-light',
    },
    markdown: `# Form Follows Clarity
Principles of International Typographic Architecture

**Zurich · Basel · 2026**

Note:
Pause on this title slide for 5 seconds. Let the typographic hierarchy and negative space set the tone.

---

## 01. The Grid as Order

> "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to their personal style."
> — *Josef Müller-Brockmann*

:::columns
:::column
### Mathematical Proportion
Every margin, column gutter, and baseline increment derives from an 8-point modular scale.
:::
:::column
### Objective Legibility
Typography should communicate content with zero ornamental distortion or visual noise.
:::
:::

Note:
Discuss how our design tokens map directly to modular typographic scales.

---

## 02. Typographic Hierarchy

| Scale Level | Role | Weight | Tracking |
| :--- | :--- | :--- | :--- |
| **Display H1** | Primary Statement | 700 Bold | -0.03em |
| **Section H2** | Structural Anchor | 600 SemiBold | -0.02em |
| **Body Prose** | Sustained Reading | 400 Regular | 0.00em |
| **Caption / Meta** | Contextual Index | 500 Medium | +0.04em |

---

## 03. Reduction to Essentials

:::fragment
- **Remove decorative borders** when spatial grouping suffices.
:::

:::fragment
- **Limit chromatic accents** to a single purposeful signal color.
:::

:::fragment
- **Preserve generous whitespace** so every idea commands undivided attention.
:::

Note:
Less, but better. Close with a review of the component library audit.
`,
  },
  {
    id: 'deck-nordic-keynote',
    title: 'Essentialist Product Keynote',
    description: 'Calm, high-contrast Nordic minimalist deck designed for product launches, design reviews, and customer keynotes.',
    category: 'Minimalist',
    tags: ['Keynote', 'Nordic Theme', 'Calm UI', 'Product Launch'],
    author: 'Product Design Lead',
    estimatedDuration: '12 min',
    featured: false,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 8200000,
    settings: {
      theme: 'nord',
      transition: 'fade',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'modern-outfit',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'atom-one-dark',
    },
    markdown: `# Quiet Technology
Designing Tools That Respect Human Attention

**Annual Keynote · Stockholm**

Note:
Welcome the audience. Today we are unveiling a calmer, faster way to work.

---

## The Attention Crisis

Digital workspaces have become noisy casinos competing for notifications.

:::columns
:::column
### 275 Interruptions
Average daily context switches experienced by modern product teams.
:::
:::column
### 23 Minutes
Time required to regain deep flow state after a single notification alert.
:::
:::

---

## Three Tenets of Calm Software

1. **Default to Silence**: Surface status only when human judgment is genuinely required.
2. **Instant Local Speed**: Every interaction responds in under 16 milliseconds.
3. **Keyboard-First Flow**: Navigate from idea to execution without lifting your hands.

> [!NOTE]
> True speed is the absence of friction between thought and medium.

---

## Available Today

- **Zero-Configuration Sync** across desktop and web
- **Offline-First Storage** with instant local snapshots
- **Open Standards** — pure Markdown in, portable HTML out
`,
  },
  {
    id: 'deck-creative-lookbook',
    title: 'Brand Identity & Creative Direction Lookbook',
    description: 'Expressive agency pitch and creative direction deck featuring bold Syne typography, tonal matrices, and campaign storytelling.',
    category: 'Creative',
    tags: ['Brand Identity', 'Creative Pitch', 'Agency', 'Visual Direction'],
    author: 'Creative Studio',
    estimatedDuration: '15 min',
    featured: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 4800000,
    settings: {
      theme: 'sunset',
      transition: 'zoom',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'dynamic-impact',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'monokai',
    },
    markdown: `# SOLSTICE // 2027
Global Brand Reimagined · Creative Direction & Visual Identity

**Prepared by Atelier Nova**

Note:
Set an energetic, visionary tone. This rebrand bridges heritage craftsmanship with kinetic digital culture.

---

## Creative Manifesto

We don't build static logos. We architect **living sensory ecosystems** that adapt across physical retail, motion, and spatial web.

:::columns
:::column
### Bold & Kinetic
Expressive display typography that commands instant cultural presence on every screen.
:::
:::column
### Warmly Human
Tactile color harmonies inspired by twilight terracotta, solar amber, and deep obsidian.
:::
:::column
### Radically Cohesive
One unified visual grammar across packaging, flagship stores, and mobile experiences.
:::
:::

---

## Brand Voice & Tonal Matrix

| Dimension | We Are | We Are Never |
| :--- | :--- | :--- |
| **Voice** | Magnetic, articulate, daring | Corporate, jargon-heavy, timid |
| **Visuals** | High-contrast editorial warmth | Generic stock minimalism |
| **Motion** | Fluid physics with purposeful snap | Gratuitous or sluggish transitions |

---

## Campaign Rollout Architecture

\`\`\`mermaid
graph LR
    Teaser([✨ Cultural Teaser]) --> Drop[🔥 Global Flagship Drop]
    Drop --> Digital[🌐 Interactive Web Lookbook]
    Drop --> PopUp[🏛️ Tokyo / Paris / NYC Pop-Ups]
    Digital --> Community[⚡ Creator Co-Labs]
    PopUp --> Community

    style Teaser fill:#4c1d3d,stroke:#fb7185,stroke-width:2px,color:#fff1f2
    style Drop fill:#881337,stroke:#fbbf24,stroke-width:2px,color:#fff1f2
    style Digital fill:#4c1d3d,stroke:#fb7185,stroke-width:2px,color:#fff1f2
    style PopUp fill:#4c1d3d,stroke:#fb7185,stroke-width:2px,color:#fff1f2
    style Community fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ecfdf5
\`\`\`

Note:
Walk through the 4-week synchronized launch cadence across Tokyo, Paris, and New York.
`,
  },
  {
    id: 'deck-media-storytelling',
    title: 'Interactive Storytelling & Media Launch',
    description: 'Lush emerald-toned creative deck for documentary pitches, cultural campaigns, and experiential media production.',
    category: 'Creative',
    tags: ['Storytelling', 'Media Pitch', 'Campaign', 'Production'],
    author: 'Narrative Lab',
    estimatedDuration: '15 min',
    featured: false,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 9600000,
    settings: {
      theme: 'emerald',
      transition: 'convex',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      fontPairingId: 'dynamic-impact',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'monokai',
    },
    markdown: `# CANOPY: Voices of the Biosphere
An Interactive Documentary & Spatial Audio Expedition

**Creative Treatment & Production Bible**

---

## Narrative Arc

Three interconnected acts exploring how acoustic ecology reveals the hidden pulse of old-growth forests:

:::fragment
1. **Act I — The Subterranean Network**: Mycorrhizal communication beneath the forest floor.
:::

:::fragment
2. **Act II — The Acoustic Canopy**: Bio-acoustic signatures across 24 hours of rainfall and dawn chorus.
:::

:::fragment
3. **Act III — The Human Threshold**: Indigenous stewardship and autonomous solar listening stations.
:::

---

## Multi-Platform Experience

:::columns
:::column
### Feature Documentary
90-minute theatrical and streaming cut captured in 8K anamorphic format.
:::
:::column
### Interactive Web Atlas
Real-time spatial audio map streaming live rainforest hydrophones and spectrograms.
:::
:::
`,
  },
  {
    id: 'deck-academic-research',
    title: 'Sparse Mixture-of-Experts & Scaling Laws',
    description: 'Academic research defense and conference paper presentation with KaTeX mathematical proofs, methodology flowcharts, and ablation tables.',
    category: 'Academic',
    tags: ['KaTeX Math', 'Research Paper', 'Ablation Tables', 'Citations'],
    author: 'Dept. of Computer Science',
    estimatedDuration: '25 min',
    featured: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 4200000,
    settings: {
      theme: 'solarized',
      transition: 'slide',
      aspectRatio: '16:9',
      fontFamily: 'serif',
      fontPairingId: 'editorial-serif',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'github-light',
    },
    markdown: `# Compute-Optimal Routing in Sparse Mixture-of-Experts
Empirical Scaling Laws and Load-Balanced Token Allocation

:::columns
:::column
**Authors:** Dr. E. Vance, K. Takahashi, Prof. M. Lindqvist  
**Institution:** Institute for Computational Intelligence  
:::column
**Venue:** NeurIPS / ICML Symposium 2026  
**Paper ID:** #4812-Oral  
:::

Note:
Good morning everyone. Today I will present our recent findings on compute-optimal token routing in sparse Mixture-of-Experts transformers.

---

## 1. Research Motivation & Problem Formulation

Dense language models scale predictably with compute $C$, but incur prohibitive inference FLOPs per token. Sparse Mixture-of-Experts (MoE) decouple parameter count $N$ from active compute $k$:

$$y = \\sum_{i=1}^{E} G(x)_i \\cdot F_i(x), \\quad \\text{where } \\|G(x)\\|_0 = k \\ll E$$

However, conventional top-$k$ softmax gating suffers from two pathological failure modes:
- **Routing Collapse**: Early expert monopoly starves specialized sub-networks.
- **Token Dropping**: Capacity factor overflows during domain shifts.

---

## 2. Proposed Sinkhorn-Regularized Router

We formulate token-to-expert assignment as an entropically regularized optimal transport problem:

$$\\mathcal{L}_{\\text{total}}(\\theta) = \\mathcal{L}_{\\text{CE}}(\\theta) + \\alpha \\sum_{i=1}^{E} f_i \\cdot P_i + \\beta D_{\\text{KL}}\\left(\\bar{P} \\,\\|\\, \\mathcal{U}(1/E)\\right)$$

\`\`\`mermaid
graph LR
    Tokens([Token Embeddings X]) --> Gate[Sinkhorn Router G]
    Gate --> Exp1[Expert 1: Syntax]
    Gate --> Exp2[Expert 2: Symbolic Math]
    Gate --> Exp3[Expert E: Code Synthesis]
    Exp1 --> Combine((Weighted Sum))
    Exp2 --> Combine
    Exp3 --> Combine
    Combine --> Out([Layer Norm + Residual])
\`\`\`

---

## 3. Empirical Evaluation & Ablation Study

Evaluation across 1.2T tokens on reasoning, math, and code benchmarks (64 Experts, $k=2$ active):

| Routing Mechanism | GSM8K (Math) | HumanEval (Code) | Expert Utilization Entropy | Throughput (tok/s) |
| :--- | :--- | :--- | :--- | :--- |
| **Dense Baseline (13B)** | 58.4% | 44.2% | — | 1,420 |
| **Standard Top-2 AuxLoss** | 71.2% | 58.9% | 0.81 | 3,890 |
| **Expert Choice Routing** | 73.8% | 61.4% | 0.94 | 4,010 |
| **Sinkhorn-MoE (Ours)** | **78.6%** | **66.8%** | **0.99** | **4,150** |

> [!TIP]
> Sinkhorn-MoE achieves near-uniform expert entropy (0.99) while improving GSM8K accuracy by +7.4% over standard auxiliary loss routing.

---

## 4. Conclusion & Open-Source Release

1. **Theoretical Guarantee**: Bounded gradient variance under Sinkhorn routing steps.
2. **Pareto Frontier**: 3.1x reduction in training FLOPs to match dense 70B perplexity.
3. **Reproducibility**: Checkpoints, Triton kernels, and evaluation harness released under Apache 2.0.

*Questions & Discussion*
`,
  },
  {
    id: 'deck-university-seminar',
    title: 'University Lecture & Graduate Seminar',
    description: 'Structured academic lecture template featuring learning objectives, formal theorem blocks, historical timelines, and discussion prompts.',
    category: 'Academic',
    tags: ['Lecture', 'Curriculum', 'Theorems', 'Higher Ed'],
    author: 'Faculty of Sciences',
    estimatedDuration: '45 min',
    featured: false,
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 12000000,
    settings: {
      theme: 'navy',
      transition: 'slide',
      aspectRatio: '16:9',
      fontFamily: 'serif',
      fontPairingId: 'editorial-serif',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'github-dark',
    },
    markdown: `# CS 402: Distributed Consensus & Fault Tolerance
Lecture 07 — The Paxos & Raft State Machine Replication Paradigm

**Fall Semester · Graduate Systems Seminar**

---

## Today's Learning Objectives

By the end of this seminar, you will be able to:

1. Formulate the **FLP Impossibility Result** in asynchronous network models.
2. Prove **Leader Completeness** in Raft across arbitrary network partitions.
3. Analyze log replication safety invariants under Byzantine vs. Crash-Stop failures.

---

## Fundamental Theorem: Quorum Intersection

Any two majority quorums $Q_1, Q_2 \\subseteq \\mathcal{N}$ in a cluster of $2f + 1$ nodes must overlap by at least one honest replica:

$$|Q_1| + |Q_2| > |\\mathcal{N}| \\implies Q_1 \\cap Q_2 \\neq \\emptyset$$

> [!IMPORTANT]
> Safety never depends on wall-clock timing assumptions; liveness requires only partial synchrony.

---

## Seminar Discussion & Reading Assignment

:::columns
:::column
### Seminar Prompt
Why does Raft restrict leader election solely to candidates whose log is at least as up-to-date as any majority quorum?
:::
:::column
### Next Week's Reading
- Lamport (1998), *The Part-Time Parliament*
- Ongaro & Ousterhout (2014), *In Search of an Understandable Consensus Algorithm*
:::
:::
`,
  },
  {
    id: 'deck-workshop-tutorial',
    title: 'Interactive Web Engineering Workshop',
    description: 'Hands-on tutorial slide deck demonstrating fragments, live code comparisons, keyboard shortcuts, and presenter notes.',
    category: 'Technical',
    tags: ['Workshop', 'Live Coding', 'Tutorial', 'Developer'],
    author: 'Developer Relations',
    estimatedDuration: '30 min',
    featured: false,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 14400000,
    settings: {
      theme: 'dracula',
      transition: 'convex',
      aspectRatio: '16:9',
      fontFamily: 'mono',
      fontPairingId: 'terminal-mono',
      showSlideNumbers: true,
      showProgressBar: true,
      centerSlides: true,
      codeHighlightTheme: 'atom-one-dark',
    },
    markdown: `# Interactive Web Engineering
Step-by-Step Workshop on Modern Web Components

Press **Space** or **Right Arrow** to advance.

Note:
Welcome everyone to the workshop! Ask attendees to make sure their local dev environments are spun up.

---

## Keyboard Shortcuts in SlideMD

Take control of your presentation:

- **Arrow Right / Left** : Next or Previous slide
- **Arrow Down / Up** : Vertical sub-slides
- **F** : Toggle Fullscreen presentation mode
- **S** : Open Speaker Notes & Presenter Console
- **O** : Open Slide Grid Matrix Overview
- **B** : Blackout screen for pauses

Note:
Test out pressing 'O' to show the audience the bird's-eye slide matrix view.

---

## Workshop Exercise 1

:::columns
:::column
### Code
\`\`\`javascript
function calculateScore(items) {
  return items
    .filter(x => x.active)
    .reduce((sum, x) => sum + x.pts, 0);
}
\`\`\`
:::
:::column
### Expected Output
\`\`\`json
{
  "total": 42,
  "verified": true,
  "status": "passed"
}
\`\`\`
:::
:::

Note:
Give participants 3 minutes to inspect the filter reduce logic.
`,
  },
];

export function getSavedDecks(): PresentationDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DECKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let didRepair = false;
        const repaired = parsed.map((deck: PresentationDeck) => {
          if (deck && typeof deck.markdown === 'string') {
            const fixedMd = normalizeSlideDirectives(deck.markdown);
            if (fixedMd !== deck.markdown) {
              didRepair = true;
              return { ...deck, markdown: fixedMd };
            }
          }
          return deck;
        });
        if (didRepair) {
          localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(repaired));
        }
        return repaired;
      }
    }
  } catch (e) {
    console.error('Failed to load decks from localStorage:', e);
  }
  // Fallback to initial starter decks and persist
  const initialDecks = STARTER_TEMPLATES.slice(0, 3);
  localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(initialDecks));
  return initialDecks;
}

export function saveAllDecks(decks: PresentationDeck[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save decks to localStorage:', e);
  }
}

export function saveDeck(deck: PresentationDeck): void {
  const decks = getSavedDecks();
  const existingIdx = decks.findIndex((d) => d.id === deck.id);
  const updatedDeck = { ...deck, updatedAt: Date.now() };

  if (existingIdx >= 0) {
    decks[existingIdx] = updatedDeck;
  } else {
    decks.unshift(updatedDeck);
  }

  saveAllDecks(decks);
}

export function deleteDeck(deckId: string): PresentationDeck[] {
  const decks = getSavedDecks().filter((d) => d.id !== deckId);
  // Ensure at least one deck exists
  if (decks.length === 0) {
    decks.push(STARTER_TEMPLATES[0]);
  }
  saveAllDecks(decks);
  return decks;
}

export function duplicateDeck(deckId: string): PresentationDeck {
  const decks = getSavedDecks();
  const original = decks.find((d) => d.id === deckId) || STARTER_TEMPLATES[0];
  const newDeck: PresentationDeck = {
    ...original,
    id: `deck-${Date.now()}`,
    title: `${original.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  decks.unshift(newDeck);
  saveAllDecks(decks);
  return newDeck;
}

export function getActiveDeckId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (active) return active;
  } catch {}
  return STARTER_TEMPLATES[0].id;
}

export function setActiveDeckId(deckId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, deckId);
  } catch {}
}
