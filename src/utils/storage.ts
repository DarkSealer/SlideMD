import { PresentationDeck } from '../types/presentation';
import { normalizeSlideDirectives } from './markdownParser';

const STORAGE_KEY_DECKS = 'slidecraft_decks_v4';
const STORAGE_KEY_ACTIVE = 'slidecraft_active_deck_id';

export const STARTER_TEMPLATES: PresentationDeck[] = [
  {
    id: 'deck-tech-pitch',
    title: 'Modern Architecture & Scaling Systems',
    description: 'Technical pitch deck featuring system architecture, code snippets, benchmarks, and speaker notes.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
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
    id: 'deck-product-strategy',
    title: 'Product Strategy & Vision 2027',
    description: 'Executive strategy presentation with clear milestones, market indicators, and clean minimal aesthetic.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
    settings: {
      theme: 'clean-white',
      transition: 'fade',
      aspectRatio: '16:9',
      fontFamily: 'sans',
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
    id: 'deck-workshop-tutorial',
    title: 'Interactive Web Engineering Workshop',
    description: 'Hands-on tutorial slide deck demonstrating fragments, interactive exercises, and presenter notes.',
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 14400000,
    settings: {
      theme: 'dracula',
      transition: 'convex',
      aspectRatio: '16:9',
      fontFamily: 'mono',
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
  // Fallback to starter templates and persist
  localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(STARTER_TEMPLATES));
  return STARTER_TEMPLATES;
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
