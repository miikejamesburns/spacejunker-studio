# SpaceJunker — Developer Guide

> Local React/Vite dashboard for managing a multi-agent AI TV/film generation system on a 4-node GPU cluster.
> Served from Ubuntu Hub (RTX A4000). No auth. Desktop-only (min 1280px).

---

## Running the App

```bash
npm run dev        # dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

Serve the `dist/` folder from the hub node with any static file server:

```bash
npx serve dist
# or: python3 -m http.server 3000 --directory dist
```

---

## Project Structure

```
src/
├── App.jsx                  # Router + Layout wrapper
├── main.jsx                 # React root, SystemProvider mount
├── styles/
│   └── globals.css          # Design tokens (CSS vars), resets, shared utility classes
├── context/
│   └── SystemContext.jsx    # Global state + live simulation intervals
├── data/
│   └── mockData.js          # All mock data (1045 lines) — single source of truth
├── components/
│   ├── layout/
│   │   ├── Layout.jsx/css   # Page shell (sidebar + topbar + content area)
│   │   ├── Sidebar.jsx/css  # Left nav, hover-to-expand, active state
│   │   └── TopBar.jsx/css   # Persistent 48px global status strip
│   └── ui/
│       ├── StatusDot.jsx/css     # Pulsing coloured status indicator
│       ├── MetricCard.jsx/css    # Compact stat card (label / value / delta)
│       ├── ProgressBar.jsx/css   # Segmented retro-style progress bar
│       └── LogFeed.jsx/css       # Scrollable monospace event log
└── pages/
    ├── Overview.jsx/css          # Mission control — health cards, feed, actions
    ├── Cluster.jsx/css           # 4-node cards + service table
    ├── LoreLayer.jsx/css         # Qdrant + Neo4j panels + hybrid query tester
    ├── Agents.jsx/css            # Agent roster + SVG workflow visualiser + config panel
    ├── LoreLibrary.jsx/css       # Bible tree navigator + entity detail + ingest pipeline
    ├── AdapterVault.jsx/css      # LoRA registry + detail panel + composition planner
    ├── Training.jsx/css          # Queue + live loss chart + new job wizard
    ├── Generation.jsx            # Pipeline monitor + queue + visual panel (stub)
    ├── SeriesRegistry.jsx/css    # Universe header + series grid + 5-tab detail view
    └── Settings.jsx/css          # 8-section config page with sidebar nav
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Overview |
| `/cluster` | Cluster |
| `/lore-layer` | Lore Layer |
| `/agents` | Agents |
| `/lore-library` | Lore Library |
| `/adapter-vault` | Adapter Vault |
| `/training` | Training |
| `/generation` | Generation |
| `/series` | Series Registry |
| `/settings` | Settings |

---

## Design System

All tokens live in `src/styles/globals.css` as CSS custom properties on `:root`.

### Colour Palette

| Token | Value | Semantic use |
|---|---|---|
| `--bg-base` | `#0d0d0f` | Page background |
| `--bg-raised` | `#1a1a1f` | Cards, panels |
| `--bg-elevated` | `#1f1f26` | Inputs, code areas |
| `--bg-hover` | `#22222a` | Table row hover |
| `--amber` | `#c8922a` | Active compute, primary accent |
| `--cyan` | `#00d4c8` | Memory, data flow, retrieval |
| `--coral` | `#e06c5a` | Errors, warnings, high load |
| `--green` | `#4caf7d` | Online, healthy, pass |
| `--border` | `rgba(200,146,42,0.15)` | All hairline borders |
| `--text-primary` | `#e8e6e0` | Body text |
| `--text-secondary` | `#9b9790` | Supporting text |
| `--text-muted` | `#5a5855` | Labels, timestamps |

### Typography

| Token | Font | Used for |
|---|---|---|
| `--font-display` | Bebas Neue / Antonio | Section titles, entity names, dramatic headings |
| `--font-mono` | Space Mono | All data values, timestamps, codes, labels |
| `--font-body` | DM Sans | Descriptions, prose, body copy |

### Layout Constants

```css
--sidebar-collapsed:  64px
--sidebar-expanded:   220px
--topbar-height:      48px
```

### Shared Button Classes

Defined in `globals.css` — use everywhere, do not redefine per-page:

```jsx
<button className="btn-primary">Primary action</button>
<button className="btn-ghost">Secondary / ghost action</button>
```

---

## Global State — SystemContext

Import anywhere with:

```jsx
import { useContext } from 'react'
import { SystemContext } from '../context/SystemContext'

const { nodes, adapters, training, ... } = useContext(SystemContext)
```

### Context value shape

```js
{
  // Static (from mockData.js, never mutated)
  services,           // Service[] — cluster service table rows
  qdrantCollections,  // QdrantCollection[]
  qdrantStats,        // { totalVectors, totalCollections, ramUsage, diskUsage, host }
  neo4jStats,         // { host, nodes, relationships, breakdown, recentConstraints }
  adapters,           // Adapter[] — full LoRA registry
  agents,             // Agent[] — 6 agent configs
  universe,           // Universe — top-level universe metadata
  series,             // Series[] — 2 active + 1 planned
  loreEntities,       // LoreEntity[] — 11 entities with full metadata
  seriesEpisodes,     // { [seriesId]: Episode[] }
  seriesConsistencyLog, // { [seriesId]: ConstraintCheck[] }

  // Live (updated by setInterval — do not mutate directly)
  nodes,              // Node[] — VRAM/temp/status updated every 5s
  activityLog,        // LogEntry[] — new entry appended every 10s
  systemStatus,       // { clusterOnline, qdrantVectors, neo4jNodes, ... }
  training,           // { active: TrainingJob, queue: TrainingJob[] } — step/loss updated every 10s
  generation,         // { active: GenerationRun, queue: GenerationJob[] } — tokens updated every 3s
}
```

### Live simulation intervals

Three `setInterval` loops run inside `SystemProvider`:

| Interval | Period | What it does |
|---|---|---|
| Node telemetry | 5s | Random-walks `vramUsed` (±2%) and `gpuTemp` (±1.5°C) on each node |
| Activity log | 10s | Appends a new log entry from `LOG_TEMPLATES`, keeps last 100 |
| Training progress | 10s | Increments `currentStep`, decays `currentTrainLoss` / `currentEvalLoss` |
| Generation tokens | 3s | Increments `tokensGenerated` toward `tokensEstimated` |

---

## Mock Data Reference

**File:** `src/data/mockData.js`

All data is exported as named constants. Extend here when adding new pages or features.

### Key exports

| Export | Shape | Notes |
|---|---|---|
| `nodes` | `Node[4]` | Ubuntu Hub, Win Workstation, Laptop, MacBook Pro |
| `services` | `Service[8]` | LiteLLM, Qdrant, Neo4j, n8n, vLLM, ComfyUI, Unsloth, Ollama |
| `qdrantCollections` | `Collection[8]` | darkmatter_*, universe_foundation, conclave_wars, characters_voice, ... |
| `qdrantStats` | object | Totals: 21,847 vectors across 8 collections |
| `neo4jStats` | object | 1,203 nodes, 3,847 relationships, breakdown by type |
| `adapters` | `Adapter[9]` | universe_voice, darkmatter_s01/s02, voice LoRAs, FLUX LoRAs, WAN2.2 |
| `agents` | `Agent[6]` | Showrunner, World Builder, Head Writer, Scene Writer, Story Editor, Researcher |
| `universe` | object | The Dark Matter Universe — top-level metadata |
| `series` | `Series[3]` | Dark Matter, The Conclave Wars, Project 3 (planned) |
| `loreEntities` | `LoreEntity[11]` | Characters, factions, locations with embed status |
| `seriesEpisodes` | `{[id]: Episode[]}` | dark-matter-s01 (6 ep), conclave-wars-s01 (4 ep) |
| `seriesConsistencyLog` | `{[id]: Check[]}` | PASS/FAIL constraint history per series |
| `trainingJobs` | object | Active job + queue of 3 |
| `generationState` | object | Active run (DM S02E04) + queue of 2 |
| `activityLog` | `LogEntry[50]` | Seed entries for the Overview feed |

---

## UI Components

### StatusDot

```jsx
import StatusDot from '../components/ui/StatusDot'

<StatusDot status="active" />       // green pulsing
<StatusDot status="training" />     // amber pulsing
<StatusDot status="retrieving" />   // cyan fast-pulsing
<StatusDot status="idle" />         // green solid
<StatusDot status="offline" />      // grey solid
<StatusDot status="error" />        // coral solid
```

### MetricCard

```jsx
import MetricCard from '../components/ui/MetricCard'

<MetricCard
  label="TOTAL VECTORS"
  value="12,847"
  delta="+284 today"
  accent="cyan"        // "amber" | "cyan" | "coral" | "green"
/>
```

### ProgressBar

```jsx
import ProgressBar from '../components/ui/ProgressBar'

<ProgressBar
  value={78}
  max={100}
  label="VRAM"
  unit="%"
  accent="amber"       // "amber" | "cyan" | "coral" | "green"
/>
```

Renders as ~20 discrete segments (retro-tech aesthetic, not smooth).

### LogFeed

```jsx
import LogFeed from '../components/ui/LogFeed'

<LogFeed
  entries={activityLog}   // { id, ts, agent, type, detail, typeColor }
  maxHeight={400}
  autoScroll={true}
/>
```

---

## Connecting a Real Backend

The app is designed so that each mock data export in `mockData.js` maps 1:1 to a real API endpoint. To wire up live data:

1. **Replace static imports in `SystemContext.jsx`** with `fetch` calls in `useEffect`
2. **Keep the same shape** — all component code reads from context, nothing talks to APIs directly
3. **Preserve the live intervals** — or replace them with WebSocket subscriptions for true real-time

### Suggested API endpoints

| Context key | Real source |
|---|---|
| `nodes` | Cluster health API (e.g. scrape `nvidia-smi` via node agents) |
| `qdrantCollections` | `GET http://<qdrant-host>:6333/collections` |
| `qdrantStats` | Qdrant telemetry endpoint |
| `neo4jStats` | Cypher query: `MATCH (n) RETURN labels(n), count(n)` |
| `adapters` | vLLM `/v1/models` + local adapter manifest JSON |
| `training` | Unsloth Studio API or local training log watcher |
| `generation` | n8n workflow state / custom orchestration API |
| `activityLog` | Server-sent events or WebSocket from orchestration layer |

---

## Extending the App

### Adding a new page

1. Create `src/pages/MyPage.jsx` and `src/pages/MyPage.css`
2. Add a route in `src/App.jsx`:
   ```jsx
   import MyPage from './pages/MyPage'
   // inside <Routes>:
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add a nav entry in `src/components/layout/Sidebar.jsx` (the `NAV_ITEMS` array)
4. Add mock data to `src/data/mockData.js` and expose it in `SystemContext.jsx`

### Adding a new UI component

Drop it in `src/components/ui/`. Follow the same pattern: one `.jsx` + one `.css`, use CSS variables exclusively, no hardcoded colours.

### Adding a new LoRA adapter

Append to the `adapters` array in `mockData.js`. The Adapter Vault page reads this array directly — no other changes needed.

### Adding a new series

Append to the `series` array in `mockData.js`, add entries to `seriesEpisodes` and `seriesConsistencyLog`. The Series Registry page reads all three.

---

## Known Limitations / Stubs

- **Generation page** (`src/pages/Generation.jsx`) is a stub — the spec calls for a full pipeline monitor, visual preview strip, and generation queue. The active run and queue data is already in `SystemContext` (`generation` key); the page just needs its JSX and CSS written.
- **Network topology diagram** in the Cluster page is a placeholder element — the spec calls for an SVG/D3 node graph with animated traffic lines.
- **LangGraph workflow visualiser** in the Agents page uses static SVG paths — for true live state it would need to consume real LangGraph execution events.
- **Settings** fields are local React state only — no persistence layer. For persistence, wire `onChange` handlers to `localStorage` or a config API.

---

## Aesthetic Rules (enforced throughout)

1. No white backgrounds anywhere. Darkest: `#0d0d0f`. Raised surfaces: up to `#1a1a1f`.
2. All data values in `Space Mono`. Labels in `DM Sans`. Section titles in `Bebas Neue`.
3. Amber = active compute. Cyan = data/retrieval. Coral = errors/warnings. Green = healthy/online.
4. Minimum viewport: 1280px. Mobile is explicitly out of scope.
5. All animations are CSS-only and non-blocking (no JS-driven layout changes during intervals).
