# SPACEJUNKER

SpaceJunker is a self-evolving AI TV production studio for a single operator with a GPU cluster — writing, directing, world-building, and generating full episodic story worlds from one cinematic control room.

It coordinates a six-agent LangGraph pipeline backed by a hybrid Qdrant + Neo4j memory system, a tiered LoRA adapter library, and integrated training and visual generation — all running locally on commodity hardware. No subscriptions. No rate limits. No creative ceiling.

The system maintains a living knowledge graph of your fictional universe — every character, faction, location, relationship, and canon event — and enforces narrative consistency automatically across every scene it generates. Characters stay alive until they die. Factions remember their alliances. The world accumulates history.

This is what it looks like when AI stops being a tool you prompt and starts being a production crew you direct.

Built with React + Vite. Runs locally — no auth, no cloud dependency.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## The System at a Glance

| Capability | Detail |
|---|---|
| **Cluster** | 4-node GPU cluster (RTX A4000 · RTX 5090 · RTX 3060 · M1 Max) |
| **Agents** | 6 LangGraph agents (Showrunner → World Builder → Head Writer → Scene Writer → Story Editor → Researcher) |
| **Memory** | Qdrant vector DB + Neo4j knowledge graph — hybrid RAG + graph queries |
| **Adapters** | 9 LoRA adapters across 3 tiers (Universe / Series / Character) for LLM + FLUX + Wan2.2 |
| **Training** | Unsloth Studio integration for QLoRA fine-tuning |
| **Generation** | Full episode pipeline: beat sheet → script → visual frames → video |

---

## Overview

A persistent top bar shows live cluster state at all times:

```
● CLUSTER: 4/4 NODES ONLINE  ◈ QDRANT: 12,847 VECTORS  ⬟ NEO4J: 1,203 NODES
⊞ ACTIVE SERIES: 3  ⊡ ADAPTERS LOADED: 7  ⊛ TRAINING: IDLE  ⊕ QUEUE: 2 JOBS
```

**The 5-Stage Workflow**

```
[1] INGEST LORE     →  [2] EMBED + GRAPH   →  [3] TRAIN LoRAs
        ↓
[4] GENERATE SCRIPT →  [5] GENERATE VISUALS
```

---

## Example Universe — Dark Matter

The reference universe used throughout the tutorial and in-app examples.

### Character Dossiers — Main Cast

---

**KAEL THERON** · Field Commander, Iron Conclave (defected)

> *"The Conclave taught me that loyalty is a leash. I cut mine at Keth."*

Former enforcer who defected after discovering the Vault-7 conspiracy. Tactically brilliant, morally compromised. Speaks in clipped, precise sentences — rarely uses contractions. Favours understatement in moments of high tension.

| Status | Faction | First Appears | LoRA |
|---|---|---|---|
| ALIVE | Iron Conclave (ex) | S01E01 | `kael_theron_voice` r=16 |

---

**SERA VANCE** · Independent Operative

> *"I don't need a map. I need a reason."*

Black-market intelligence broker turned reluctant ally. Reads people faster than she reads rooms — which is saying something. Dry wit deployed as armour. Doesn't forgive, but occasionally suspends judgement.

| Status | Faction | First Appears | LoRA |
|---|---|---|---|
| ALIVE | None (independent) | S01E02 | `sera_vance_voice` r=16 |

---

**DIRECTOR MAREN** · Iron Conclave High Command

> *"Kael was my finest work. The fact that he turned means I taught him too well."*

The primary antagonist of Series 01. Architect of the Vault-7 programme. Operates entirely through institutional authority — never raises her voice, never needs to.

| Status | Faction | First Appears |
|---|---|---|
| ALIVE | Iron Conclave | S01E03 |

---

**THE ARCHIVIST** · Unknown affiliation

> *"Everything that's ever been hidden eventually becomes a primary source."*

Information broker of indeterminate age and allegiance. Sole custodian of pre-Conclave historical records. Trades in verified facts — refuses speculation, never lies, never tells the whole truth.

| Status | Faction | First Appears |
|---|---|---|
| ALIVE | Unknown | S01E05 |

---

### Major Factions

| Faction | Status | Description |
|---|---|---|
| **Iron Conclave** | Active | The dominant military-administrative authority. Maintains power through information control and institutional loyalty. |
| **The Drift Collective** | Fractured | Loose network of outer-rim settlements and free traders. No central leadership — operates on mutual interest and reputation. |
| **Vault-7 Remnants** | Classified | Survivors and witnesses of the Vault-7 incident. Status and membership deliberately obscured from official records. |

---

## Production Pipeline

Every episode passes through a six-stage pipeline. Each stage is handled by a dedicated agent backed by its own LoRA adapter stack.

| Stage | Agent | Input | Output |
|---|---|---|---|
| `01` | **Showrunner** | Series Bible + episode brief | Season arc, episode beats |
| `02` | **World Builder** | Beats + Lore Layer query | World state, active constraints |
| `03` | **Head Writer** | Beats + world state | Detailed scene-by-scene outline |
| `04` | **Scene Writer** | Outline + RAG context | Full screenplay scenes |
| `05` | **Story Editor** | Draft script | Consistency-checked revision |
| `06` | **Researcher** | Any query | Lore-grounded facts from Qdrant + Neo4j |

**Episode Trace — Dark Matter S02E04**

```
✓  14:29:03  SHOWRUNNER    series-bible + ep brief    →  beat sheet (12 beats)
✓  14:30:12  WORLD BUILDER beat sheet + RAG           →  world state snapshot
✓  14:31:02  HEAD WRITER   beats + world state        →  scene outline (38 scenes)
◌  14:32:01  SCENE WRITER  outline + char context     →  scene 12 / 38...
○  —         STORY EDITOR  completed draft            →  —
○  —         VISUAL AGENT  approved script            →  —
```

---

## Cluster

| Node | GPU | VRAM | RAM | Primary Role |
|---|---|---|---|---|
| **Ubuntu Hub** | RTX A4000 | 16 GB | 64 GB | Orchestration + Infrastructure |
| **Windows Workstation** | RTX 5090 | 32 GB | 128 GB | Primary Compute |
| **Laptop** | RTX 3060 | 12 GB | 32 GB | Secondary Inference |
| **MacBook Pro** | M1 Max | 32 GB unified | 64 GB | Dev + Orchestration |

**LiteLLM** runs on the Hub as a unified proxy, routing inference requests to whichever node has capacity.

### Service Registry

| Service | Node | Port | Role |
|---|---|---|---|
| LiteLLM Proxy | Ubuntu Hub | 4000 | Unified model gateway |
| Qdrant | Ubuntu Hub | 6333 | Vector database |
| Neo4j | Ubuntu Hub | 7474 | Knowledge graph |
| n8n | Ubuntu Hub | 5678 | Workflow automation |
| vLLM (primary) | RTX 5090 | 8000 | Multi-LoRA inference |
| ComfyUI | RTX 5090 | 8188 | Image/video generation |
| Unsloth Studio | RTX 5090 | 7860 | LoRA training |
| Ollama | RTX 3060 | 11434 | Secondary inference |

---

## Memory Layer

Two complementary systems handle world knowledge:

### Qdrant — Vector Collections

| Collection | Vectors | Use |
|---|---|---|
| `universe_foundation` | 8,412 | Cross-series world rules, physics, timeline |
| `darkmatter_episodic` | 4,231 | Episode-level scene context |
| `darkmatter_lore` | 2,847 | Characters, factions, locations |
| `darkmatter_dialogue` | 1,923 | Voice-matched dialogue examples |

**Example RAG Query**

```
Query:   "What is Kael's relationship to the Iron Conclave?"
Filters: characters=["Kael Theron"], canon_tier=1

Results:
  [0.923]  "Kael swore his oath to the Iron Conclave..."  [S01E01]
  [0.871]  "The Conclave branded him a traitor after..."  [S01E06]
  [0.834]  "Field Commander Theron executed the Keth operation..."  [S01E01]
  Latency: Qdrant 12ms · Neo4j 4ms · Total 18ms
```

### Neo4j — Knowledge Graph

```
Nodes:          1,203    Relationships:  3,847
  Characters      342      BELONGS_TO       621
  Factions         48      KNOWS            892
  Locations       127      PART_OF          403
  Events          412      OCCURRED_AT      891
  Organisations    89      CAUSED           489
```

The graph fires **canon constraints** during generation — if an agent references a dead character as alive, or a destroyed location as intact, Neo4j catches it before the draft is committed.

```
✗ FAIL  Kel Aran referenced as ALIVE in S01E04 — status: DEAD (S01E02)
✓ PASS  Location 'Vault-7' correctly referenced (established S01E01)
✓ PASS  Faction 'Iron Conclave' status: ACTIVE — confirmed
```

---

## Adapter Vault

LoRA adapters are organised in a three-tier hierarchy:

### Tier Structure

| Tier | Scope | Rank | Example |
|---|---|---|---|
| **T1 — Universe** | All series share this base | r=64 | `universe_voice` — prose style, world physics |
| **T2 — Series** | Single series continuity | r=32 | `darkmatter_s02` — Series 02 narrative voice |
| **T3 — Character** | Individual voice/identity | r=16 | `kael_theron_voice` — Kael's speech patterns |

### Example Composition — Kael Scene · RTX 5090 VRAM Budget

```
universe_voice      weight 1.0  — merged into base weights
darkmatter_s02      weight 1.0  — 0.17 GB
kael_theron_voice   weight 0.7  — 0.09 GB

Base model (Q4):    6.80 GB
LoRA adapters:      0.26 GB
KV cache:           2.00 GB
─────────────────────────────
TOTAL:              9.06 GB  ✓ Fits RTX 5090 (32 GB)
```

### Full Adapter Registry

| Name | Type | Base | Rank | Tier | Status |
|---|---|---|---|---|---|
| `universe_voice` | LLM | Qwen2.5-14B | r=64 | T1 | Merged |
| `darkmatter_s01` | LLM | Qwen2.5-14B | r=32 | T2 | Active |
| `darkmatter_s02` | LLM | Qwen2.5-14B | r=32 | T2 | Active |
| `kael_theron_voice` | LLM | Qwen2.5-14B | r=16 | T3 | Active |
| `sera_vance_voice` | LLM | Qwen2.5-14B | r=16 | T3 | Loaded |
| `darkmatter_style` | FLUX | FLUX.1-dev | r=32 | T2 | Active |
| `kael_identity` | FLUX | FLUX.1-dev | r=16 | T3 | Active |
| `sera_identity` | FLUX | FLUX.1-dev | r=16 | T3 | Active |
| `darkmatter_video` | Wan2.2 | Wan2.2-T2V-14B | r=16 | T2 | Training |

---

## Agent Pipeline

| Agent | Role | Model | LoRAs |
|---|---|---|---|
| **Showrunner** | Orchestrator / supervisor | 30B, high capability | Universe |
| **World Builder** | Series Bible creation + world state | 14B, long context | Universe + Series |
| **Head Writer** | Beat sheets + arc planning | 14B, structured output | Universe + Series |
| **Scene Writer** | Script generation | 14B, creative | Series + Character voice |
| **Story Editor** | Consistency checking | 7B, fast evaluator | Universe + Series |
| **Researcher** | Lore retrieval specialist | 7B, RAG-optimised | None (pure retrieval) |

### Sample Scene Output — DM S02E04, Scene 12

```
INT. VAULT ANTECHAMBER — NIGHT

The antechamber is cold. Kael's breath fogs in the emergency
lighting. His hand stays near his holster — not touching it.
Not yet.

MAREN stands at the far console, her back to him. She knew
he was coming.

                    KAEL
          Six months.

                    MAREN
          I wondered when you'd stop counting.

                    KAEL
          You knew about Vault-7 before Keth.

                    MAREN
          I knew about everything before Keth.
          That was rather the point.
```

*Scene Writer agent · `darkmatter_s02` + `kael_theron_voice` · 7 RAG queries · 3 Neo4j checks · 0 violations*

---

## Running a Generation Job

**6-Stage Generation Walkthrough**

```
[1] Configure Job     Series · Season · Episode · Priority
[2] Lore Retrieval    Qdrant RAG + Neo4j graph pre-fetch
[3] Script Generation Showrunner → Head Writer → Scene Writer pipeline
[4] Consistency Check Story Editor reviews full draft against knowledge graph
[5] Visual Generation ComfyUI processes approved scenes in parallel
[6] Archive           Script + frames committed to series registry
```

**Episode Output Summary — DM S02E04**

| Metric | Value |
|---|---|
| Scenes generated | 38 |
| Total tokens | 47,284 |
| RAG queries | 312 |
| Neo4j checks | 89 |
| Constraint violations | 2 (auto-resolved) |
| Images generated | 114 |
| Generation time | 1h 24m |
| Total cost | ~$0.00 (local) |

---

## Docs

- [`docs/developer-guide.md`](docs/developer-guide.md) — architecture, component API, extension guide
- [`docs/tutorial.pdf`](docs/tutorial.pdf) — printable version of this guide (A4, 8 chapters)

---

## Tech Stack

- **React 18 + Vite 6** — SPA, no SSR
- **React Router v6** — client-side routing
- **lucide-react** — all icons
- **recharts** — loss curves and charts
- **Custom CSS variables** — full design system, no Tailwind
- **Google Fonts** — Bebas Neue · Space Mono · DM Sans
