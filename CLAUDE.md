# AUTONOMOUS STUDIO — Project Dashboard Spec
### Claude Code Implementation Brief

> **Purpose**: Organisational UI dashboard for setting up, managing, and monitoring a multi-agent autonomous TV/film generation system. Covers the full pipeline: cluster nodes, memory infrastructure, agent orchestration, LoRA adapter libraries, world lore management, and generation pipelines.
>
> **Target user**: Solo technical operator (VFX supervisor / creative technologist) running a 4-node home GPU cluster, building a Star Wars / Stranger Things scale multi-series AI production system.
>
> **Deployment context**: Local web app, served from the Ubuntu hub node (RTX A4000). No auth required. Dark, cinematic aesthetic — this is a virtual studio control room, not a SaaS product.

---

## 1. Aesthetic Direction

**Concept**: _Virtual Production Control Room meets Retro-Futurist Mission Control._

Think IMAX post suite crossed with a 1970s NASA ops floor — dense data, dramatic negative space, surgical precision. Not cyberpunk, not generic dashboard grey. This is where serious creative work gets done.

**Visual Language:**
- **Background**: Near-black warm slate (`#0d0d0f` base) with subtle fine-grain noise texture overlay. Not pure black — there's warmth and depth.
- **Accent system**: Three-tier:
  - **Primary**: Deep amber/gold (`#c8922a`) — represents active compute, running processes
  - **Secondary**: Electric cyan (`#00d4c8`) — represents memory, data flow, retrieval
  - **Tertiary**: Muted coral (`#e06c5a`) — represents warnings, training in progress, high-load states
- **Typography**:
  - Display/headings: `"Bebas Neue"` or `"Antonio"` — tall, condensed, industrial authority
  - UI labels: `"Space Mono"` — monospace for all data values, metrics, codes
  - Body/descriptions: `"DM Sans"` — clean humanist, slightly warm
- **Layout**: Dense multi-column grid with deliberate asymmetry. Left sidebar navigation (narrow, icon+label). Main content area in a 12-column responsive grid. Top bar is a persistent global status strip — always visible.
- **Cards**: Slightly elevated (`box-shadow` with warm amber glow on active states). Hairline borders (`1px solid rgba(200,146,42,0.15)`). Rounded corners minimal (`4px`).
- **Iconography**: Use `lucide-react` exclusively. Icon size uniform at 16px in body, 20px in headers.
- **Motion**: Subtle — data values count up on load, progress bars animate in, status indicators pulse slowly. No flashy transitions. Everything feels like it has weight and consequence.
- **Status indicators**: Pulsing dot components: green (online), amber (training/busy), red (offline/error), cyan (retrieving/querying).

**Key aesthetic rule**: Every panel should feel like it's showing real operational data from a running system. Numbers, statuses, progress bars — all should feel live even when static.

---

## 2. Application Structure

### 2.1 Top-Level Navigation (Left Sidebar)

Fixed left sidebar, 64px wide collapsed / 220px expanded, with hover-to-expand behaviour.

```
AUTONOMOUS STUDIO
─────────────────
⬡  OVERVIEW          (home / mission control)
◈  CLUSTER           (node management)
⬟  LORE LAYER        (memory + knowledge)
◉  AGENTS            (orchestration + personas)
⊞  LORE LIBRARY      (world lore management)
⊡  ADAPTER VAULT     (LoRA registry)
⊛  TRAINING          (Unsloth Studio integration)
⊕  GENERATION        (pipeline + queue)
⊜  SERIES REGISTRY   (multi-series universe)
◎  SETTINGS          (config + env)
─────────────────
● SYSTEM STATUS      (bottom — always visible)
```

Each nav item has:
- Icon (lucide-react)
- Label (Space Mono, 11px, uppercase, letter-spaced)
- Active state: amber left-border glow `3px solid #c8922a`, label brightens
- Badge for counts/alerts where relevant

---

## 3. Section Specifications

---

### 3.1 OVERVIEW — Mission Control

**Layout**: Full-width hero status strip, then 3-column card grid below.

#### 3.1.1 Global Status Strip (top, always visible even outside Overview)
Persistent 48px horizontal bar pinned to top of viewport.

```
[● CLUSTER: 4/4 NODES ONLINE]  [◈ QDRANT: 12,847 VECTORS]  [⬟ NEO4J: 1,203 NODES]  
[⊞ ACTIVE SERIES: 3]  [⊡ ADAPTERS LOADED: 7]  [⊛ TRAINING: IDLE]  [⊕ QUEUE: 2 JOBS]
```

All values in `Space Mono`. Dividers between items. Amber dots for active, cyan for data-state.

#### 3.1.2 System Health Cards (row of 4)

| Card | Metric | Visual |
|------|--------|--------|
| **COMPUTE** | Total VRAM used / available across all nodes | Horizontal segmented bar per node |
| **MEMORY LAYER** | Qdrant vector count + Neo4j node count | Two mini stat blocks |
| **LORE COVERAGE** | % of Series Bible entities embedded | Circular arc progress |
| **ADAPTER STATUS** | Active LoRAs / total registered | Count + small bar chart |

#### 3.1.3 Recent Activity Feed (left, 60% width)

Scrollable event log showing last 50 pipeline events:

```
[TIMESTAMP]  [AGENT]     [EVENT TYPE]       [DETAIL]
14:32:01     Scene Writer  RAG_QUERY          Retrieved 7 chunks for S01E04 scene 12
14:31:58     Extractor     VECTOR_INSERT      +23 vectors committed to 'darkmatter_s01'
14:31:45     vLLM          LORA_SWAP          Loaded adapter: DARK_MATTER_S01 (r=32)
14:30:12     Unsloth       TRAIN_COMPLETE     Universe voice LoRA — loss: 0.847 ✓
14:29:03     Neo4j         CONSTRAINT_FAIL    Character 'Kel Aran' marked DEAD in S01E02
```

Each row: timestamp in cyan, agent in amber, event type as coloured tag, detail in muted white. Filterable by agent/type. Auto-scroll toggle.

#### 3.1.4 Quick Actions Panel (right, 40% width)

Vertical stack of large action buttons:

```
[▶ START GENERATION RUN]
[+ NEW SERIES]
[⊛ TRIGGER LoRA RETRAIN]
[◈ REFRESH VECTOR INDEX]
[⬟ REBUILD KNOWLEDGE GRAPH]
```

Each button styled as a tall pill (full width, 52px height) — amber-outlined for primary, ghost for secondary. Hover fills with amber glow.

---

### 3.2 CLUSTER — Node Management

**Layout**: 4-column grid of node cards (one per GPU node), then a connection topology diagram below.

#### 3.2.1 Node Cards

Each node card contains:

```
┌─────────────────────────────────────┐
│  ● ONLINE                    [EDIT] │
│  RTX 5090 — Windows Workstation     │
│  ─────────────────────────────────  │
│  VRAM       32 GB  ████████░░  78%  │
│  RAM        64 GB  ██████░░░░  61%  │
│  GPU TEMP   68°C   ██████░░░░       │
│  ─────────────────────────────────  │
│  ACTIVE SERVICE    vLLM v0.8        │
│  LOADED ADAPTERS   7 × LoRA         │
│  CURRENT ROLE      Primary Compute  │
│  ─────────────────────────────────  │
│  HOST              192.168.1.42     │
│  PORT              8000             │
│  LITELLM ALIAS     vllm-5090        │
│  ─────────────────────────────────  │
│  [  SERVICES  ]  [  TERMINAL  ]     │
└─────────────────────────────────────┘
```

Node cards have a subtle left border that changes colour by status:
- Green glow: Online + idle
- Amber glow: Online + busy (training or inferring)
- Coral glow: Warning / high temp
- Grey: Offline

**All 4 nodes defined:**

| Node | GPU | RAM | Primary Role | Services |
|------|-----|-----|--------------|---------|
| **Ubuntu Hub** | RTX A4000 16GB | 64GB | Orchestration + Infrastructure | Qdrant, Neo4j, LiteLLM, n8n |
| **Windows Workstation** | RTX 5090 32GB | 128GB | Primary Compute | vLLM (multi-LoRA), ComfyUI, Unsloth |
| **Laptop** | RTX 3060 12GB | 32GB | Secondary Inference | Ollama, overflow vLLM |
| **MacBook Pro** | M1 Max 32GB | 64GB | Dev + Orchestration | LangGraph dev, MLX, n8n |

#### 3.2.2 Service Status Table (below node cards)

Full-width table of all running services across the cluster:

| Service | Node | Port | Status | Version | Actions |
|---------|------|------|--------|---------|---------|
| LiteLLM Proxy | Ubuntu Hub | 4000 | ● Running | v1.42.1 | [Restart] [Config] |
| Qdrant | Ubuntu Hub | 6333 | ● Running | v1.13.2 | [Dashboard] [Config] |
| Neo4j Community | Ubuntu Hub | 7474 | ● Running | v5.25.0 | [Browser] [Config] |
| n8n | Ubuntu Hub | 5678 | ● Running | v1.68.0 | [Open] [Config] |
| vLLM (primary) | RTX 5090 | 8000 | ● Running | v0.8.1 | [LoRAs] [Config] |
| ComfyUI | RTX 5090 | 8188 | ● Running | latest | [Open] [Config] |
| Unsloth Studio | RTX 5090 | 7860 | ◌ Idle | v2026.03 | [Open] [Config] |
| Ollama | RTX 3060 | 11434 | ● Running | v0.6.0 | [Models] [Config] |

Status dots: pulsing amber when busy, solid green when idle+healthy.

#### 3.2.3 Network Topology Diagram

Simple SVG/canvas node graph showing the 4 nodes as circles connected by animated lines. Line thickness = traffic volume. Hover node = show active connections. Rendered using D3 or simple SVG with CSS animations.

---

### 3.3 LORE LAYER — Memory Infrastructure

**Layout**: Two-column split: Qdrant panel (left) / Neo4j panel (right), with a unified query tester at bottom.

#### 3.3.1 Qdrant Panel

```
QDRANT VECTOR DATABASE                    ● 192.168.1.10:6333

COLLECTIONS
─────────────────────────────────────────────────────
NAME                    VECTORS    DIM    STATUS    SIZE
darkmatter_episodic      4,231     768    ● Active   12 MB
darkmatter_lore          2,847     768    ● Active    8 MB
darkmatter_dialogue      1,923     768    ● Active    6 MB
universe_foundation      8,412     768    ● Active   24 MB
[+ NEW COLLECTION]
─────────────────────────────────────────────────────

COLLECTION CONFIG (selected: darkmatter_episodic)
Embedding Model    nomic-embed-text-v1.5
Distance Metric    Cosine
HNSW m             16
HNSW ef_construct  100
Quantization       Scalar int8

PAYLOAD INDEXES
  entity_type    keyword
  season         integer
  episode        integer
  characters     keyword[]
  location       keyword
  canon_tier     integer
```

Stats row at top: Total vectors, total collections, RAM usage, disk usage — in amber monospace.

Action buttons: [TEST QUERY] [REINDEX] [EXPORT] [SETTINGS]

#### 3.3.2 Neo4j Panel

```
NEO4J KNOWLEDGE GRAPH                     ● 192.168.1.10:7474

GRAPH STATISTICS
  Nodes           1,203    │  Relationships   3,847
  Characters        342    │  BELONGS_TO         621
  Factions          48     │  KNOWS              892
  Locations         127    │  PART_OF            403
  Events            412    │  OCCURRED_AT        891
  Organisations     89     │  CAUSED             489

RECENT CONSTRAINTS FIRED
14:32:01  ✗ FAIL  Kel Aran referenced as ALIVE in S01E04 — status: DEAD (S01E02)
14:28:44  ✓ PASS  Location 'Vault-7' correctly referenced (established S01E01)
14:25:12  ✓ PASS  Faction 'Iron Conclave' status: ACTIVE — confirmed

CYPHER QUICK QUERY
┌────────────────────────────────────────────────────┐
│ MATCH (c:Character)-[:BELONGS_TO]->(f:Faction)     │
│ WHERE f.name = 'Iron Conclave'                     │
│ RETURN c.name, c.status                            │
└────────────────────────────────────────────────────┘
[RUN QUERY]  [OPEN BROWSER]
```

#### 3.3.3 Unified Lore Query Tester (full width, bottom)

```
LORE LAYER QUERY TESTER
─────────────────────────────────────────────────────

QUERY TYPE    [○ Semantic/RAG]  [○ Graph/Neo4j]  [● Hybrid]

INPUT
┌────────────────────────────────────────────────────────────────────────┐
│ What is the relationship between Kael Theron and the Iron Conclave?    │
└────────────────────────────────────────────────────────────────────────┘

FILTERS   Season: [ALL ▼]   Characters: [Kael Theron ×]   Canon Tier: [1 ▼]

[▶ RUN QUERY]

RESULTS
─────────────────────────────────────────────────────
SOURCE          SCORE    CONTENT
Qdrant [RAG]    0.923    "Kael swore his oath to the Iron Conclave..."  [S01E01]
Neo4j [Graph]   —        BELONGS_TO (since Episode 1), role: FIELD_COMMANDER
Qdrant [RAG]    0.871    "The Conclave branded him a traitor after..."  [S01E06]
─────────────────────────────────────────────────────
LATENCY   Qdrant: 12ms   Neo4j: 4ms   Total: 18ms
```

---

### 3.4 AGENTS — Orchestration

**Layout**: Agent roster as visual card grid, plus a live execution graph below showing the current LangGraph workflow state.

#### 3.4.1 Agent Roster Cards

For each agent, a card with:

```
┌─────────────────────────────────────┐
│  ◉ SCENE WRITER              ACTIVE │
│  ─────────────────────────────────  │
│  Framework    LangGraph Node        │
│  Model        Qwen2.5-14B-Q4        │
│  LoRA         DARKMATTER_S02 (r=32) │
│  LoRA         KAEL_VOICE (r=16)     │
│  ─────────────────────────────────  │
│  Last Run     14:32:01              │
│  Avg Latency  4.2s                  │
│  Tokens/Run   2,847                 │
│  ─────────────────────────────────  │
│  SYSTEM PROMPT EXCERPT              │
│  "You are a cinematic scene writer  │
│   for the Dark Matter universe..."  │
│  ─────────────────────────────────  │
│  [  CONFIGURE  ]  [  TEST  ]        │
└─────────────────────────────────────┘
```

**All 6 agents defined** (from white paper architecture):

| Agent | Role | Model Suggestion | LoRAs |
|-------|------|-----------------|-------|
| **Showrunner** | Orchestrator / Supervisor | 30B model, high capability | Universe Foundation |
| **World Builder** | Series Bible creation | 14B, long context | Universe + Series |
| **Head Writer** | Beat sheets / arc planning | 14B, structured output | Universe + Series |
| **Scene Writer** | Script generation | 14B, creative | Series + Character voice |
| **Story Editor** | Consistency checking | 7B, fast, evaluator | Universe + Series |
| **Researcher** | Lore retrieval specialist | 7B, RAG-optimised | None (pure retrieval) |

#### 3.4.2 LangGraph Workflow Visualiser

Live SVG/D3 directed graph showing the current workflow state. Nodes are agent cards, edges are message flows. Active node has amber glow + pulsing ring. Completed nodes are solid green. Failed nodes coral. Hovering an edge shows the payload being passed.

Show current run metadata above the graph:
```
CURRENT RUN   Series: DARK MATTER  Season: 02  Episode: 04  Scene: 12
STARTED       14:31:02   ELAPSED   1m 02s
```

#### 3.4.3 Agent Configuration Panel (slide-out on [CONFIGURE])

Full-screen slide-out or modal containing:
- Model selector dropdown (populated from LiteLLM registered models)
- LoRA adapter multi-select (from Adapter Vault)
- System prompt editor (large textarea with syntax highlighting)
- Temperature / max_tokens / top_p sliders
- Memory config (Qdrant collection name, retrieval top_k)
- Save / Test / Reset buttons

---

### 3.5 LORE LIBRARY — World Lore Management

**Layout**: Left panel = Series Bible tree navigator. Right panel = entity detail / editor.

#### 3.5.1 Series Bible Navigator (left, 35% width)

Hierarchical tree view:

```
▼ DARK MATTER UNIVERSE
  ▼ FOUNDATION
    ◈ World Rules (12 entries)
    ◈ Physics / Magic System (8 entries)
    ◈ Timeline (47 entries)
  ▼ CHARACTERS (342)
    ▼ MAIN CAST
      ▸ Kael Theron
      ▸ Sera Vance
      ▸ [+12 more]
    ▼ SUPPORTING (89)
    ▼ DECEASED (34)
  ▼ FACTIONS (48)
    ▸ Iron Conclave
    ▸ The Drift Collective
    ▸ [+46 more]
  ▼ LOCATIONS (127)
  ▼ EVENTS (412)
  ▶ SERIES 01: DARK MATTER
  ▶ SERIES 02: THE CONCLAVE WARS
  ▶ SERIES 03: [PLANNED]
```

Search bar at top. Filter by canon tier, entity type, series. `[+ ADD ENTITY]` button.

Entities show a small coloured indicator:
- Cyan dot: Embedded in Qdrant
- Amber dot: In Neo4j graph
- Both: Fully indexed
- Grey: Not yet processed

#### 3.5.2 Entity Detail Panel (right, 65% width)

When an entity is selected:

```
CHARACTER                                     ◈ EMBEDDED  ⬟ IN GRAPH
Kael Theron
─────────────────────────────────────────────────────────────────────
CANON TIER     1 (Film-level canon)
STATUS         ALIVE
FACTION        Iron Conclave (FIELD_COMMANDER)
FIRST APPEARS  S01E01
LAST SEEN      S02E06

DESCRIPTION
A former enforcer for the Iron Conclave who defected after discovering
the Vault-7 conspiracy. Tactically brilliant but morally compromised
by his past service. Speaks in clipped, precise sentences. Rarely uses
contractions. Favours understatement in moments of high tension.

CANONICAL FACTS (12)
  ○ Born: Outer Rim station Theta-9, cycle 2247
  ○ Has a scar above his left eye from the Siege of Keth
  ○ Cannot use dark-field technology due to neural sensitivity
  [+9 more...]

RELATIONSHIPS
  ↔ Sera Vance      ALLY (complicated / unspoken tension)
  ↔ Director Maren  ANTAGONIST (former superior)
  ↔ The Archivist   INFORMANT (mutual benefit)

EMBEDDING STATUS
  Last embedded:    14:31:58    Chunk count: 7    Collection: darkmatter_lore

[  EDIT  ]  [  RE-EMBED  ]  [  VIEW IN NEO4J  ]  [  GENERATE LoRA DATA  ]
```

The `[GENERATE LoRA DATA]` button opens a sub-panel to auto-generate training pairs for this entity using the Claude API, ready for Unsloth training.

#### 3.5.3 Lore Ingestion Pipeline (tab within section)

Drag-and-drop zone for ingesting new lore documents:

```
INGEST NEW LORE
─────────────────────────────────────────────────────
[  DROP FILES HERE — PDF, TXT, MD, DOCX  ]

PIPELINE STEPS (run in sequence)
  [1] PARSE & CHUNK          → Recursive character splitter (1500 tok / 200 overlap)
  [2] CLASSIFY ENTITIES      → Extract characters, locations, events, rules
  [3] EMBED                  → nomic-embed-text → Qdrant
  [4] GRAPH UPDATE           → Extract relationships → Neo4j
  [5] GENERATE TRAINING DATA → Auto-create LoRA training pairs via LLM

  [▶ RUN FULL PIPELINE]  [Configure Steps ▼]

RECENT INGESTIONS
  darkmatter_S02_bible.pdf     2,847 chunks    14 min ago    ✓ Complete
  kael_theron_extended.md        312 chunks    1 hr ago      ✓ Complete
  conclave_history.pdf         1,204 chunks    3 hr ago      ◌ Embedding...
```

---

### 3.6 ADAPTER VAULT — LoRA Registry

**Layout**: Full-width sortable/filterable table of all LoRA adapters, with a detail panel on row click, and training data management below.

#### 3.6.1 Adapter Registry Table

Filter bar: `[ALL ▼]` `[LLM ▼]` `[DIFFUSION ▼]` `[TIER 1 ▼]` `[ACTIVE ▼]` `[Search...]`

```
NAME                   TYPE    MODEL BASE      RANK  TIER   STATUS    SIZE    LAST TRAINED
─────────────────────────────────────────────────────────────────────────────────────────────
universe_voice         LLM     Qwen2.5-14B     r=64  T1     ● Merged  342 MB  2026-03-20
darkmatter_s01         LLM     Qwen2.5-14B     r=32  T2     ● Active  171 MB  2026-03-18
darkmatter_s02         LLM     Qwen2.5-14B     r=32  T2     ● Active  171 MB  2026-03-25
kael_theron_voice      LLM     Qwen2.5-14B     r=16  T3     ● Active   86 MB  2026-03-19
sera_vance_voice       LLM     Qwen2.5-14B     r=16  T3     ○ Loaded   86 MB  2026-03-19
darkmatter_style       FLUX    FLUX.1-dev      r=32  T2     ● Active  384 MB  2026-03-21
kael_identity          FLUX    FLUX.1-dev      r=16  T3     ● Active  192 MB  2026-03-22
sera_identity          FLUX    FLUX.1-dev      r=16  T3     ● Active  192 MB  2026-03-22
darkmatter_video       WAN2.2  Wan2.2-T2V-14B  r=16  T2     ◌ Training 96 MB  TRAINING...
```

Column headers sortable. Status icons: ● solid = active in vLLM, ○ hollow = cached CPU, ◌ pulsing = training, — = not loaded.

Tier badges: T1 = Universe (gold), T2 = Series (silver), T3 = Character (bronze).

#### 3.6.2 Adapter Detail Panel (slide-out on row click)

```
ADAPTER DETAIL: darkmatter_s02
────────────────────────────────────────────────────
TYPE            LLM LoRA (SFT)
BASE MODEL      Qwen2.5-14B-Instruct
RANK            32  │  ALPHA    32  │  DROPOUT    0.05
TARGET MODULES  q_proj, k_proj, v_proj, o_proj,
                gate_proj, up_proj, down_proj
TRAINED ON      Dark Matter Series 02 episodes 1-6
TRAINING DATE   2026-03-25  │  DURATION  47 min
TRAINING LOSS   0.724 (final)  │  EVAL LOSS  0.791
DATASET SIZE    1,402 pairs  │  EPOCHS  3
FILE PATH       /adapters/llm/darkmatter_s02/
GGUF EXPORT     ✓ Available  (Q4_K_M)
────────────────────────────────────────────────────
PERFORMANCE NOTES
  Works best with Universe Foundation LoRA as base.
  Stack weight: 1.0 (do not combine with other series LoRAs)
  Character voice LoRAs: stack at 0.7 max

SERVED IN VLLM   ● YES — lora_name: "darkmatter_s02"
AGENTS USING     Scene Writer, Head Writer

[  EDIT METADATA  ]  [  RETRAIN  ]  [  EXPORT GGUF  ]  [  DEPRECATE  ]
```

#### 3.6.3 LoRA Composition Planner (tab)

Visual UI for planning multi-LoRA stacking:

```
COMPOSITION PLANNER
────────────────────────────────────────────────────
SCENARIO   [Scene Writer — Kael Theron dialogue  ▼]

STACK (drag to reorder)
  [1] universe_voice        weight: 1.0  [MERGED — always on]
  [2] darkmatter_s02        weight: 1.0  [━━━━━━━━━━━━━━━━━━]
  [3] kael_theron_voice     weight: 0.7  [━━━━━━━━━━━━━]

ESTIMATED VRAM COST
  Base model (Q4):   6.8 GB
  LoRA 2 (r=32):     0.17 GB
  LoRA 3 (r=16):     0.09 GB
  KV Cache:          2.0 GB
  ─────────────────────────
  TOTAL:             9.06 GB  ✓ Fits RTX 5090

[  VALIDATE COMPOSITION  ]  [  SAVE PRESET  ]  [  DEPLOY TO VLLM  ]
```

Warning if total adapter weight exceeds 1.5 (interference risk). Warning if combined VRAM exceeds 28GB (safe limit for 5090 during inference).

---

### 3.7 TRAINING — Unsloth Studio Integration

**Layout**: Training job queue (top), active training monitor (centre), completed jobs log (bottom).

#### 3.7.1 Training Job Queue

```
TRAINING QUEUE
────────────────────────────────────────────────────────────────────
JOB NAME              TYPE    MODEL BASE      PRIORITY  SCHEDULED     STATUS
darkmatter_s02_update LLM     Qwen2.5-14B     HIGH      NOW           ◌ RUNNING
conclave_wars_s01     LLM     Qwen2.5-14B     MED       +2h           ○ QUEUED
the_archivist_voice   LLM     Qwen2.5-14B     LOW       +4h           ○ QUEUED
vault_location_flux   FLUX    FLUX.1-dev       MED       TONIGHT       ○ QUEUED
────────────────────────────────────────────────────────────────────
[  + NEW TRAINING JOB  ]                            Node: RTX 5090 [CHANGE]
```

#### 3.7.2 Active Training Monitor

```
ACTIVE JOB: darkmatter_s02_update                         ◌ TRAINING

BASE MODEL       Qwen2.5-14B-Instruct    NODE        RTX 5090 (32GB)
ADAPTER          darkmatter_s02          VRAM USED   11.2 / 32 GB
RANK             32                      GPU TEMP    71°C
DATASET SIZE     1,402 pairs             ELAPSED     23m 41s
EPOCHS           3/3                     ETA         ~4 min

TRAINING PROGRESS  ████████████████████████░░░░░░░░░░░░  2/3 epochs  63%

LIVE METRICS (updates every 10s)
  STEP    TRAIN LOSS    EVAL LOSS    LR         TOKENS/SEC
  843     0.741         0.798        1.24e-4    3,847
  840     0.749         0.801        1.31e-4    3,901
  835     0.762         0.812        1.38e-4    3,812

LOSS CURVE (last 200 steps)
  ┌──────────────────────────────────────────────────────────┐
  │ 1.2 ╮                                                    │
  │ 1.0  ╲                                                   │
  │ 0.8   ╲___                                               │
  │ 0.6       ╲────────────────────────────────              │
  │ 0.4                                                      │
  └──────────────────────────────────────────────────────────┘
  TRAIN ──  EVAL ─ ─

[  ABORT  ]  [  PAUSE  ]  [  OPEN UNSLOTH STUDIO  ]
```

Loss curve rendered as an SVG line chart, updating live.

#### 3.7.3 New Training Job Wizard

Full-screen modal / page, step-based:

**Step 1: Adapter Type**
```
What are you training?
  [○ LLM LoRA — Narrative Voice / Knowledge]
  [○ FLUX LoRA — Character Identity]
  [○ FLUX LoRA — Visual Style / Universe]
  [○ WAN 2.2 LoRA — Video Motion Style]
```

**Step 2: Configuration** (depends on type selected):

For LLM LoRA:
```
JOB NAME          [darkmatter_s02_update          ]
BASE MODEL        [Qwen2.5-14B-Instruct    ▼]
TIER              [T2 — Series             ▼]
SERIES            [Dark Matter             ▼]
RANK              [32] (slider: 8 / 16 / 32 / 64)
ALPHA             [32] (auto-match rank)
DROPOUT           [0.05]
LEARNING RATE     [2e-4]
EPOCHS            [3]
MAX SEQ LENGTH    [4096]
TRAINING METHOD   [● QLoRA]  [○ Full SFT]

TRAINING DATA
  ○ Use auto-generated from Lore Library   [1,402 pairs ready]
  ○ Upload custom JSONL file
  ○ Mix both (recommended)
  GENERAL EXAMPLES MIX    10% [slider]
```

For FLUX LoRA:
```
JOB NAME          [kael_theron_v2              ]
MODEL             [FLUX.1-dev          ▼]
TRAINING TOOL     [● kohya-ss]  [○ AI-Toolkit]  [○ SimpleTuner]
TRIGGER WORD      [KAEL_THERON]
RANK              [16] (slider)
STEPS             [1500]
LEARNING RATE     [4e-4]

TRAINING IMAGES
  [  DROP 15–20 CURATED IMAGES HERE  ]
  Uploaded: 0 images  (need minimum 15)
  ○ Include augmentation (flip, brightness, crop)

CAPTIONS
  ○ Auto-generate with BLIP-2
  ○ Manual captions (recommended)
```

**Step 3: Review + Launch**

Shows summary card of all settings, estimated VRAM, estimated time, estimated storage. `[▶ LAUNCH TRAINING]` button.

#### 3.7.4 Completed Jobs Log

Simple table: Job name, type, date, duration, final loss, adapter file size, actions [View Metrics] [Deploy] [Archive].

---

### 3.8 GENERATION — Pipeline & Queue

**Layout**: Active run monitor (top half), generation queue (bottom half), visual preview strip (right column).

#### 3.8.1 Active Generation Run

```
ACTIVE RUN                                           ◌ GENERATING

SERIES       Dark Matter          SEASON   02
EPISODE      04                   SCENE    12 / 38

PIPELINE STAGE       [Showrunner ✓] → [World Builder ✓] → [Head Writer ✓] → [Scene Writer ◌] → [Editor ○] → [Visual ○]

CURRENT STAGE: SCENE WRITER
  Agent         Scene Writer (darkmatter_s02 + kael_theron_voice)
  Input         Beat: "Kael confronts Maren in the Vault antechamber"
  RAG Queries   7 executed  (avg 14ms)
  Neo4j Checks  3 executed  (0 violations)
  Tokens Gen    1,247 / ~3,000 estimated
  Stage Time    42s elapsed

GENERATED SO FAR (live preview)
┌─────────────────────────────────────────────────────────────────────┐
│ INT. VAULT ANTECHAMBER — NIGHT                                      │
│                                                                     │
│ The antechamber is cold. Kael's breath fogs in the emergency       │
│ lighting. His hand stays near his holster — not touching it.       │
│ Not yet.                                                            │
│                                                                     │
│ MAREN stands at the far console, her back to him. She knew         │
│ he was coming.                                                      │
│                                                                     │
│              KAEL                                                   │
│         Six months.                                                 │
│                                        [generating...]              │
└─────────────────────────────────────────────────────────────────────┘

[  ABORT RUN  ]  [  PAUSE  ]  [  MANUAL OVERRIDE  ]
```

#### 3.8.2 Generation Queue

```
GENERATION QUEUE
────────────────────────────────────────────────────────────────────
JOB                    SERIES          TYPE      PRIORITY  STATUS
DM S02E04 Full         Dark Matter     Episode   HIGH      ◌ RUNNING
DM S02E05 Outline      Dark Matter     Outline   MED       ○ QUEUED
CW S01E01 Pilot        Conclave Wars   Episode   HIGH      ○ QUEUED
────────────────────────────────────────────────────────────────────
[  + NEW GENERATION JOB  ]                      [  CLEAR QUEUE  ]
```

#### 3.8.3 Visual Generation (right column, 30% width)

Shows latest generated images/frames from the ComfyUI pipeline for the current episode:

```
VISUAL PIPELINE                  ● ComfyUI Active

SCENE 12 FRAMES
[thumbnail]  [thumbnail]  [thumbnail]
[thumbnail]  [thumbnail]  [thumbnail]

ACTIVE LORAS (ComfyUI)
  darkmatter_style    0.55
  kael_identity       0.85

GENERATION SETTINGS
  Model     FLUX.1-dev
  Steps     28
  CFG       3.5
  Size      1024 × 576

[  OPEN COMFYUI  ]  [  QUEUE VIDEO  ]
```

---

### 3.9 SERIES REGISTRY — Multi-Series Universe

**Layout**: Universe overview hero at top, then a series grid below. Clicking a series expands to full detail.

#### 3.9.1 Universe Header

```
◈ THE DARK MATTER UNIVERSE
─────────────────────────────────────────────────────────────────────
Created    2026-03-01     Series: 2 active, 1 planned
Characters 342             Locations: 127    Factions: 48
Vectors    12,847          Neo4j nodes: 1,203
Universe LoRA    universe_voice (r=64)  ● MERGED
─────────────────────────────────────────────────────────────────────
[  EDIT UNIVERSE  ]  [  ADD SERIES  ]  [  EXPORT BIBLE  ]
```

#### 3.9.2 Series Cards Grid

Each series card:

```
┌─────────────────────────────────────────┐
│  SERIES 01                     ● ACTIVE │
│  DARK MATTER                            │
│  ─────────────────────────────────────  │
│  Episodes      6 generated              │
│  Characters    47 in series             │
│  LoRA          darkmatter_s01 (r=32)    │
│  Style LoRA    darkmatter_style         │
│  ─────────────────────────────────────  │
│  Last generated  2026-03-24             │
│  Consistency     ✓ 94% pass rate        │
│  ─────────────────────────────────────  │
│  [  OPEN  ]  [  GENERATE EPISODE  ]     │
└─────────────────────────────────────────┘
```

Consistency score is the % of Neo4j constraint checks that passed during generation. Coral warning if below 80%.

#### 3.9.3 Series Detail View (full page on [OPEN])

Tabbed interface:
- **Overview**: Series bible summary, tone guide, key characters
- **Episodes**: Grid of generated episodes with status and quick preview
- **Characters**: Table of series-specific characters with embedding status
- **Adapters**: Linked LLM and diffusion LoRAs for this series
- **Consistency Log**: Full history of Neo4j constraint checks

---

### 3.10 SETTINGS — Configuration

Standard settings page with sections:

**LiteLLM Model Registry**
Table of registered model aliases + endpoints. Add/remove models. Test connection.

**Qdrant Configuration**
Collection defaults (embedding model, distance metric, HNSW params). Connection string.

**Neo4j Configuration**
Connection URI, credentials, constraint templates. Test connection + run test query.

**Unsloth / Training**
Default hyperparameters. Training data directory path. Output adapter directory path.

**ComfyUI**
API endpoint. Default workflow JSON paths. Output directory.

**n8n Webhooks**
List of registered n8n webhook URLs (for triggering retraining, ingestion, etc.). Test webhook.

**Environment Variables**
Read-only display of loaded env vars (masked). Shows which are set / missing.

**Export / Backup**
Export full project config as JSON. Export Series Bibles as markdown. Backup adapter manifest.

---

## 4. Component Library (Reusable)

Define these as reusable components throughout the app:

### StatusDot
```jsx
<StatusDot status="active|training|idle|offline|retrieving" label="vLLM" />
```
Renders a pulsing dot + label. Pulse speed: active=slow, training=medium, retrieving=fast.

### MetricCard
```jsx
<MetricCard label="TOTAL VECTORS" value="12,847" delta="+284 today" accent="cyan" />
```
Compact stat card: label small + uppercase, value large monospace, optional delta below.

### ProgressBar
```jsx
<ProgressBar value={78} max={100} label="VRAM" unit="%" accent="amber" />
```
Thin segmented bar (not smooth — segmented into ~20 blocks for that retro-tech feel).

### LogFeed
```jsx
<LogFeed entries={[]} maxHeight={400} autoScroll={true} />
```
Scrollable monospace log. Timestamp, source tag, message. Filterable.

### AdapterTag
```jsx
<AdapterTag name="darkmatter_s01" tier={2} weight={1.0} />
```
Small pill badge showing adapter name, tier colour, and weight. Stacked in sequence shows composition.

### LoraCompositionStack
```jsx
<LoraCompositionStack adapters={[...]} totalVram={9.06} />
```
Visual stacked bar showing all loaded adapters + VRAM allocation.

### LossChart
```jsx
<LossChart trainLoss={[...]} evalLoss={[...]} steps={843} />
```
SVG line chart, two series, minimal axes, amber train + cyan eval lines.

---

## 5. Technical Implementation Notes

### Framework
**React + Vite** (single file for Claude Code initial prototype, then split if needed).
Use `lucide-react` for all icons.
Use `recharts` for loss curves and any chart data.
CSS variables for the full design system — no Tailwind (incompatible with custom aesthetic).

### State Management
Keep it simple: `useState` + `useContext` for a global `systemState` object containing all mock data. No Redux. All data initialised from a `mockData.js` file so the UI is fully functional from day one without a backend.

### Mock Data Requirements
The `mockData.js` file should define realistic placeholder data for:
- 4 cluster nodes with realistic VRAM/temp stats
- 8 Qdrant collections with vector counts
- 1,200+ Neo4j nodes (just the count — no need to enumerate)
- 9 LoRA adapters as in the table above
- 2 active series, 1 planned
- 6 agent configurations
- A training job in progress + 3 queued
- A generation run in progress
- 50 recent log entries

### Routing
React Router with routes:
```
/              → Overview
/cluster       → Cluster
/lore-layer    → Lore Layer
/agents        → Agents
/lore-library  → Lore Library
/adapter-vault → Adapter Vault
/training      → Training
/generation    → Generation
/series        → Series Registry
/settings      → Settings
```

### Live Feel (Simulated)
To make the UI feel alive without a backend:
- `setInterval` every 5s: randomly increment/decrement VRAM usage ±1–3%
- `setInterval` every 10s: add a new log entry to the feed
- If a "training job" is active: increment step counter and update loss value (random walk downward)
- If a "generation run" is active: increment token counter and append to preview text

### Google Fonts
Load via `<link>` in index.html:
```
Bebas Neue (display)
Space Mono (monospace data)
DM Sans (body)
```

---

## 6. Key Design Constraints

1. **No white backgrounds anywhere.** The darkest panels are `#0d0d0f`. Raised surfaces go up to `#1a1a1f`. Input fields: `#141418`.

2. **All data values in Space Mono.** Labels in DM Sans. Section titles in Bebas Neue.

3. **Every section must feel like it has data in it.** No empty states on initial load — mock data fills everything.

4. **The left sidebar is always visible.** Content area scrolls independently.

5. **Mobile is not a requirement.** This is a desktop operations dashboard. Minimum viewport: 1280px.

6. **Animations must not block.** No blocking transitions. Status updates, log appends, and metric refreshes happen without layout shift.

7. **The colour accent must be earned.** Amber is for active compute and warnings. Cyan is for data and retrieval. Coral is for errors and high-load. Don't scatter colour indiscriminately — use it to communicate state.

8. **Dense but not cluttered.** Every pixel of information should justify its presence. But no padding so generous it feels like a landing page. This is a dashboard, not a brochure.

---

## 7. Build Priority Order

Claude Code should build in this sequence:

1. **Shell + navigation** — sidebar, top bar, routing, CSS variables, fonts, global layout
2. **Overview page** — global status strip, health cards, activity feed, quick actions
3. **Cluster page** — 4 node cards, service table
4. **Adapter Vault** — LoRA table, detail panel, composition planner
5. **Training page** — queue, active monitor with live loss chart, new job wizard
6. **Lore Layer** — Qdrant panel, Neo4j panel, query tester
7. **Agents page** — roster cards, workflow visualiser
8. **Lore Library** — bible navigator, entity detail, ingestion pipeline
9. **Series Registry** — universe header, series cards, detail view
10. **Settings** — config panels

Each phase should result in a fully navigable, data-rich UI before moving to the next section.

---

*This spec is the source of truth for the Autonomous Studio dashboard. All design decisions should prioritise operational clarity, cinematic atmosphere, and the feeling of a real system under real control.*
