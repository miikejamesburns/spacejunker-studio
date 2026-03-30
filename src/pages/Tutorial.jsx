import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Server, Database, GitBranch, Layers, Zap, Bot,
  Film, ChevronRight, CheckCircle, Circle, AlertTriangle,
  Cpu, HardDrive, Network, Shield, Eye, ArrowRight,
  Star, Users, Map, Clock, BarChart2, Activity,
} from 'lucide-react'
import './Tutorial.css'

// ── Chapter definitions ───────────────────────────────────
const CHAPTERS = [
  { id: 'welcome',    label: 'Welcome',           icon: BookOpen },
  { id: 'universe',   label: 'The Dark Matter Universe', icon: Star },
  { id: 'pipeline',   label: 'Full Pipeline',     icon: Activity },
  { id: 'cluster',    label: 'Your Cluster',      icon: Server },
  { id: 'memory',     label: 'Memory Layer',      icon: Database },
  { id: 'adapters',   label: 'Adapter Vault',     icon: Layers },
  { id: 'agents',     label: 'Agent Pipeline',    icon: Bot },
  { id: 'generation', label: 'Generation Run',    icon: Film },
]

// ── Progress indicator ────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div className="tut-progress-bar">
      <div className="tut-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Chapter nav ───────────────────────────────────────────
function ChapterNav({ active, completed, onJump }) {
  return (
    <nav className="tut-chapter-nav">
      <div className="tut-chapter-nav-title">CHAPTERS</div>
      {CHAPTERS.map((ch, i) => {
        const done = completed.includes(ch.id)
        const isActive = active === ch.id
        return (
          <button
            key={ch.id}
            className={`tut-chapter-item ${isActive ? 'tut-chapter-active' : ''} ${done ? 'tut-chapter-done' : ''}`}
            onClick={() => onJump(ch.id)}
          >
            <span className="tut-chapter-num">{String(i + 1).padStart(2, '0')}</span>
            <ch.icon size={12} />
            <span className="tut-chapter-label">{ch.label}</span>
            {done && <CheckCircle size={10} className="tut-chapter-check" />}
          </button>
        )
      })}
    </nav>
  )
}

// ── Callout box ───────────────────────────────────────────
function Callout({ type = 'info', children }) {
  const icons = { info: Eye, warn: AlertTriangle, tip: Star, key: Shield }
  const Icon = icons[type] || Eye
  return (
    <div className={`tut-callout tut-callout-${type}`}>
      <Icon size={14} className="tut-callout-icon" />
      <div className="tut-callout-body">{children}</div>
    </div>
  )
}

// ── Screen mock ───────────────────────────────────────────
function ScreenMock({ label, children }) {
  return (
    <div className="tut-screen-mock">
      <div className="tut-screen-titlebar">
        <span className="tut-screen-dot tut-dot-red" />
        <span className="tut-screen-dot tut-dot-amber" />
        <span className="tut-screen-dot tut-dot-green" />
        <span className="tut-screen-title">{label}</span>
      </div>
      <div className="tut-screen-body">{children}</div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────
function Section({ id, icon: Icon, num, title, subtitle, children }) {
  return (
    <section className="tut-section" id={id} data-chapter={id}>
      <div className="tut-section-header">
        <div className="tut-section-num">{String(num).padStart(2, '0')}</div>
        <div className="tut-section-head-text">
          <div className="tut-section-label">
            <Icon size={14} className="icon-amber" />
            <span>{subtitle}</span>
          </div>
          <h2 className="tut-section-title">{title}</h2>
        </div>
      </div>
      <div className="tut-section-body">{children}</div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 1 — WELCOME
// ══════════════════════════════════════════════════════════
function WelcomeChapter() {
  return (
    <Section id="welcome" icon={BookOpen} num={1} title="Mission Control" subtitle="WELCOME BRIEFING">
      <div className="tut-hero-grid">
        <div className="tut-hero-text">
          <p className="tut-lead">
            You are operating an autonomous AI production system — a virtual studio capable of generating
            complete TV and film content at series scale, with full continuity, consistent character voices,
            and cinematic visual output.
          </p>
          <p className="tut-body">
            This dashboard is your mission control. Every panel reflects a live system component.
            Nothing here is decorative — each section controls a real part of the pipeline.
          </p>
          <div className="tut-capability-list">
            {[
              { icon: Database, label: 'Vector memory', desc: 'Semantic retrieval across 21,847 embedded lore chunks' },
              { icon: GitBranch, label: 'Knowledge graph', desc: 'Neo4j constraint checking for perfect continuity' },
              { icon: Layers, label: 'LoRA adapters', desc: '9 fine-tuned adapters spanning universe, series, and character voice' },
              { icon: Bot, label: '6-agent pipeline', desc: 'Showrunner → World Builder → Writer → Editor orchestration' },
              { icon: Film, label: 'Multimodal output', desc: 'Script, character images, and motion video from a single brief' },
            ].map(c => (
              <div className="tut-capability-row" key={c.label}>
                <c.icon size={14} className="icon-amber" />
                <span className="tut-cap-label">{c.label}</span>
                <span className="tut-cap-desc">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control room metaphor diagram */}
        <div className="tut-hero-diagram">
          <svg viewBox="0 0 320 280" className="tut-control-room-svg">
            {/* Outer ring */}
            <circle cx="160" cy="140" r="120" fill="none" stroke="rgba(200,146,42,0.1)" strokeWidth="1" />
            <circle cx="160" cy="140" r="80"  fill="none" stroke="rgba(200,146,42,0.08)" strokeWidth="1" />
            <circle cx="160" cy="140" r="40"  fill="rgba(200,146,42,0.06)" stroke="rgba(200,146,42,0.2)" strokeWidth="1" />

            {/* Centre — the orchestrator */}
            <text x="160" y="136" textAnchor="middle" fill="#c8922a" fontSize="9" fontFamily="Space Mono">SHOW</text>
            <text x="160" y="148" textAnchor="middle" fill="#c8922a" fontSize="9" fontFamily="Space Mono">RUNNER</text>

            {/* Orbital nodes */}
            {[
              { angle: -90, label: 'LORE\nLAYER',    color: '#00d4c8', icon: '◈' },
              { angle: -18, label: 'SCENE\nWRITER',  color: '#c8922a', icon: '◉' },
              { angle:  54, label: 'COMFY\nUI',       color: '#4caf7d', icon: '⊞' },
              { angle: 126, label: 'ADAPTER\nVAULT', color: '#c8922a', icon: '⊡' },
              { angle: 198, label: 'NEO4J\nGRAPH',   color: '#00d4c8', icon: '⬟' },
            ].map((n, i) => {
              const rad = (n.angle * Math.PI) / 180
              const x = 160 + 90 * Math.cos(rad)
              const y = 140 + 90 * Math.sin(rad)
              return (
                <g key={i}>
                  <line x1="160" y1="140" x2={x} y2={y}
                    stroke={n.color} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
                  <circle cx={x} cy={y} r="18" fill="rgba(13,13,15,0.9)"
                    stroke={n.color} strokeWidth="1" />
                  <text x={x} y={y - 3} textAnchor="middle" fill={n.color} fontSize="10">{n.icon}</text>
                  {n.label.split('\n').map((line, li) => (
                    <text key={li} x={x} y={y + 8 + li * 10} textAnchor="middle"
                      fill={n.color} fontSize="6" fontFamily="Space Mono">{line}</text>
                  ))}
                </g>
              )
            })}

            {/* Pulsing centre dot */}
            <circle cx="160" cy="140" r="4" fill="#c8922a">
              <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <p className="tut-diagram-caption">The Showrunner orchestrates all subsystems from the centre of the pipeline</p>
        </div>
      </div>

      <div className="tut-workflow-strip">
        {['INGEST LORE', 'EMBED + GRAPH', 'TRAIN LORAS', 'CONFIGURE AGENTS', 'GENERATE'].map((step, i, arr) => (
          <div className="tut-wf-step" key={step}>
            <div className="tut-wf-step-box">
              <span className="tut-wf-step-num">{i + 1}</span>
              <span className="tut-wf-step-label">{step}</span>
            </div>
            {i < arr.length - 1 && <ArrowRight size={14} className="tut-wf-arrow" />}
          </div>
        ))}
      </div>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 2 — THE DARK MATTER UNIVERSE
// ══════════════════════════════════════════════════════════
const CHARACTERS = [
  {
    name: 'KAEL THERON',
    role: 'FIELD COMMANDER → DEFECTOR',
    faction: 'Iron Conclave (former)',
    status: 'ALIVE',
    statusColor: '#4caf7d',
    tier: 'MAIN CAST',
    firstSeen: 'S01E01',
    loraName: 'kael_theron_voice',
    loraRank: 'r=16',
    traits: ['Tactically brilliant', 'Morally compromised', 'Clipped speech', 'Rarely uses contractions'],
    bio: 'A former enforcer for the Iron Conclave who defected after discovering the Vault-7 conspiracy. Speaks in precise, economical sentences. Understatement in moments of high tension.',
    sampleLine: 'Six months. You knew. The whole time.',
    color: '#c8922a',
  },
  {
    name: 'SERA VANCE',
    role: 'INTELLIGENCE OPERATIVE',
    faction: 'Independent',
    status: 'ALIVE',
    statusColor: '#4caf7d',
    tier: 'MAIN CAST',
    firstSeen: 'S01E01',
    loraName: 'sera_vance_voice',
    loraRank: 'r=16',
    traits: ['Ruthlessly pragmatic', 'Dry wit', 'Long-game thinker', 'Distrusts ideology'],
    bio: 'Operative with no permanent allegiance. Allies with Kael out of mutual necessity. Their tension is unspoken and persistent. She plays the long game — always has an exit prepared.',
    sampleLine: 'I didn\'t save you. I preserved a useful asset. There\'s a difference.',
    color: '#00d4c8',
  },
  {
    name: 'DIRECTOR MAREN',
    role: 'HEAD OF THE IRON CONCLAVE',
    faction: 'Iron Conclave',
    status: 'ALIVE',
    statusColor: '#4caf7d',
    tier: 'ANTAGONIST',
    firstSeen: 'S01E02',
    loraName: null,
    loraRank: null,
    traits: ['Absolute authority', 'Believes the ends justify all means', 'Genuinely sorrowful about Kael', 'Never raises her voice'],
    bio: 'Kael\'s former superior and mentor. Authorised the Vault-7 programme not from cruelty but from a cold calculation about survival. She considers Kael\'s defection a personal failure.',
    sampleLine: 'I gave you every opportunity to understand. You chose sentiment.',
    color: '#e06c5a',
  },
  {
    name: 'THE ARCHIVIST',
    role: 'INFORMATION BROKER',
    faction: 'Neutral',
    status: 'ALIVE',
    statusColor: '#4caf7d',
    tier: 'SUPPORTING',
    firstSeen: 'S01E03',
    loraName: null,
    loraRank: null,
    traits: ['Ancient', 'Speaks in precise riddles', 'Never lies, rarely tells the full truth', 'Mutual benefit only'],
    bio: 'An entity of unknown origin who has observed the political architecture of multiple civilisations. Provides intelligence to Kael on a strictly transactional basis. Its motives are its own.',
    sampleLine: 'The vault was sealed three centuries before your organisation existed. Ask yourself who built the lock.',
    color: '#9b9790',
  },
]

const FACTIONS = [
  {
    name: 'IRON CONCLAVE',
    status: 'ACTIVE',
    desc: 'The dominant political-military body. Operates through enforcement of "civilisational stability". Controls the dark-field technology that underpins interstellar transit.',
    nodes: 342, color: '#e06c5a',
  },
  {
    name: 'THE DRIFT COLLECTIVE',
    status: 'ACTIVE',
    desc: 'Loose federation of outer-rim stations that rejected Conclave governance. Resourceful, decentralised, and chronically underpowered. Kael\'s primary allies post-defection.',
    nodes: 127, color: '#00d4c8',
  },
  {
    name: 'THE VAULT PROGRAMME',
    status: 'CLASSIFIED',
    desc: 'The conspiracy at the centre of Series 01. A long-running Conclave project to weaponise dark-field technology against civilian populations for population management.',
    nodes: 48, color: '#c8922a',
  },
]

function UniverseChapter() {
  const [activeChar, setActiveChar] = useState(0)
  const char = CHARACTERS[activeChar]

  return (
    <Section id="universe" icon={Star} num={2} title="The Dark Matter Universe" subtitle="WORLD REFERENCE">
      <p className="tut-body">
        The tutorial uses the <span className="tut-hl-amber">Dark Matter Universe</span> as its working example —
        a Star Wars-scale multi-series fictional world already loaded into the system.
        All characters, factions, and locations referenced in this guide are real entities in the knowledge graph.
      </p>

      {/* Universe stat strip */}
      <div className="tut-universe-strip">
        {[
          { label: 'CHARACTERS', val: '342', icon: Users, color: 'amber' },
          { label: 'FACTIONS',   val: '48',  icon: Shield, color: 'coral' },
          { label: 'LOCATIONS',  val: '127', icon: Map, color: 'cyan' },
          { label: 'EVENTS',     val: '412', icon: Clock, color: 'amber' },
          { label: 'SERIES',     val: '2',   icon: Film, color: 'green' },
          { label: 'EPISODES',   val: '10',  icon: Star, color: 'amber' },
          { label: 'VECTORS',    val: '21,847', icon: Database, color: 'cyan' },
          { label: 'GRAPH NODES', val: '1,203', icon: GitBranch, color: 'cyan' },
        ].map(s => (
          <div className="tut-uni-stat" key={s.label}>
            <s.icon size={12} className={`icon-${s.color}`} />
            <span className={`tut-uni-val tut-uni-val-${s.color}`}>{s.val}</span>
            <span className="tut-uni-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Character dossiers */}
      <div className="tut-dossier-section">
        <h3 className="tut-subsection-title">CHARACTER DOSSIERS</h3>
        <div className="tut-dossier-layout">
          {/* Character selector */}
          <div className="tut-char-selector">
            {CHARACTERS.map((c, i) => (
              <button
                key={c.name}
                className={`tut-char-btn ${activeChar === i ? 'tut-char-btn-active' : ''}`}
                style={{ '--char-color': c.color }}
                onClick={() => setActiveChar(i)}
              >
                <span className="tut-char-btn-name">{c.name}</span>
                <span className="tut-char-btn-role">{c.tier}</span>
              </button>
            ))}
          </div>

          {/* Dossier card */}
          <div className="tut-dossier-card" style={{ '--char-color': char.color }}>
            <div className="tut-dossier-header">
              <div className="tut-dossier-id">
                <div className="tut-dossier-name">{char.name}</div>
                <div className="tut-dossier-role">{char.role}</div>
              </div>
              <div className="tut-dossier-meta">
                <div className="tut-dossier-meta-row">
                  <span className="tut-meta-k">FACTION</span>
                  <span className="tut-meta-v">{char.faction}</span>
                </div>
                <div className="tut-dossier-meta-row">
                  <span className="tut-meta-k">STATUS</span>
                  <span className="tut-meta-v" style={{ color: char.statusColor }}>{char.status}</span>
                </div>
                <div className="tut-dossier-meta-row">
                  <span className="tut-meta-k">FIRST SEEN</span>
                  <span className="tut-meta-v">{char.firstSeen}</span>
                </div>
                {char.loraName && (
                  <div className="tut-dossier-meta-row">
                    <span className="tut-meta-k">VOICE LORA</span>
                    <span className="tut-meta-v tut-lora-tag">{char.loraName} ({char.loraRank})</span>
                  </div>
                )}
              </div>
            </div>

            <p className="tut-dossier-bio">{char.bio}</p>

            <div className="tut-dossier-traits">
              <span className="tut-traits-label">KEY TRAITS</span>
              <div className="tut-traits-list">
                {char.traits.map(t => <span key={t} className="tut-trait-tag">{t}</span>)}
              </div>
            </div>

            <div className="tut-dossier-sample">
              <span className="tut-sample-label">CANONICAL DIALOGUE SAMPLE</span>
              <blockquote className="tut-sample-quote" style={{ borderColor: char.color }}>
                "{char.sampleLine}"
              </blockquote>
            </div>

            {/* Visual fingerprint — unique SVG waveform per character */}
            <div className="tut-char-fingerprint">
              <svg viewBox={`0 0 240 32`} className="tut-fingerprint-svg">
                {Array.from({ length: 60 }, (_, i) => {
                  const seed = (char.name.charCodeAt(i % char.name.length) * (i + 1) * 31) % 100
                  const h = 4 + (seed / 100) * 24
                  return (
                    <rect key={i} x={i * 4} y={(32 - h) / 2} width="2.5" height={h}
                      fill={char.color} opacity={0.3 + (seed / 100) * 0.7} rx="1" />
                  )
                })}
              </svg>
              <span className="tut-fingerprint-label">VOICE SIGNATURE — {char.loraName || 'NO LORA TRAINED'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factions */}
      <div className="tut-factions-section">
        <h3 className="tut-subsection-title">MAJOR FACTIONS</h3>
        <div className="tut-factions-grid">
          {FACTIONS.map(f => (
            <div className="tut-faction-card" key={f.name} style={{ '--faction-color': f.color }}>
              <div className="tut-faction-top">
                <span className="tut-faction-name">{f.name}</span>
                <span className="tut-faction-status" style={{ color: f.color }}>{f.status}</span>
              </div>
              <p className="tut-faction-desc">{f.desc}</p>
              <div className="tut-faction-nodes">
                <GitBranch size={10} />
                <span>{f.nodes} Neo4j nodes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="tip">
        Every character, faction, location, and event in this universe is stored in both Qdrant (for semantic search)
        and Neo4j (for relationship traversal). Navigate to <strong>Lore Library</strong> to browse and edit
        these entities directly.
      </Callout>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 3 — FULL PIPELINE
// ══════════════════════════════════════════════════════════
const PIPELINE_STAGES = [
  {
    id: 'ingest',
    label: 'LORE INGESTION',
    color: '#00d4c8',
    icon: BookOpen,
    desc: 'Drop raw source material (PDFs, scripts, notes) into the Lore Library ingestion pipeline.',
    example: 'darkmatter_S02_bible.pdf → 2,847 chunks parsed',
    output: '→ Text chunks, entity candidates',
  },
  {
    id: 'embed',
    label: 'EMBED + INDEX',
    color: '#00d4c8',
    icon: Database,
    desc: 'nomic-embed-text-v1.5 encodes every chunk. Vectors committed to Qdrant collections. Relationships written to Neo4j.',
    example: '21,847 vectors · 8 collections · Cosine, dim=768',
    output: '→ Qdrant collections, Neo4j graph',
  },
  {
    id: 'train',
    label: 'LORA TRAINING',
    color: '#c8922a',
    icon: Zap,
    desc: 'Unsloth QLoRA trains universe, series, and character voice adapters on Qwen2.5-14B-Instruct.',
    example: 'kael_theron_voice: 1,402 pairs · r=16 · 47 min · loss 0.724',
    output: '→ Adapter files (.safetensors)',
  },
  {
    id: 'load',
    label: 'ADAPTER LOADING',
    color: '#c8922a',
    icon: Layers,
    desc: 'vLLM multi-LoRA loads the trained adapters. LiteLLM routes agent requests to the right model+adapter combination.',
    example: '7 adapters loaded · universe_voice merged · r=16–64',
    output: '→ vLLM ready, LiteLLM routing active',
  },
  {
    id: 'orchestrate',
    label: 'AGENT PIPELINE',
    color: '#c8922a',
    icon: Bot,
    desc: 'LangGraph orchestrates 6 specialised agents. Each agent RAG-queries Qdrant, checks Neo4j constraints, and generates output.',
    example: 'Showrunner → Head Writer → Scene Writer → Story Editor',
    output: '→ Script, beat sheet, scene breakdown',
  },
  {
    id: 'visual',
    label: 'VISUAL PIPELINE',
    color: '#4caf7d',
    icon: Film,
    desc: 'ComfyUI renders character images and scene illustrations using FLUX LoRAs. WAN2.2 generates motion video clips.',
    example: 'darkmatter_style (0.55) + kael_identity (0.85) · 28 steps',
    output: '→ Images, video frames',
  },
]

function PipelineChapter() {
  const [hovered, setHovered] = useState(null)

  return (
    <Section id="pipeline" icon={Activity} num={3} title="The Full Production Pipeline" subtitle="END-TO-END WORKFLOW">
      <p className="tut-body">
        Every episode generated by SpaceJunker passes through six stages.
        The system is designed so that each stage feeds the next — raw lore becomes structured memory,
        memory enables accurate generation, generation produces both text and visuals simultaneously.
      </p>

      {/* Main pipeline diagram */}
      <div className="tut-pipeline-diagram">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.id} className="tut-pipe-wrapper">
            <div
              className={`tut-pipe-stage ${hovered === stage.id ? 'tut-pipe-hovered' : ''}`}
              style={{ '--stage-color': stage.color }}
              onMouseEnter={() => setHovered(stage.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="tut-pipe-top">
                <span className="tut-pipe-num">{String(i + 1).padStart(2, '0')}</span>
                <stage.icon size={16} />
              </div>
              <div className="tut-pipe-label">{stage.label}</div>
              <div className="tut-pipe-output">{stage.output}</div>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="tut-pipe-connector">
                <svg viewBox="0 0 24 40" width="24" height="40">
                  <line x1="12" y1="0" x2="12" y2="30" stroke="rgba(200,146,42,0.3)" strokeWidth="1" />
                  <polygon points="6,28 18,28 12,38" fill="rgba(200,146,42,0.3)" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hover detail */}
      <div className="tut-pipe-detail">
        {hovered ? (
          (() => {
            const s = PIPELINE_STAGES.find(s => s.id === hovered)
            return (
              <div className="tut-pipe-detail-inner" style={{ borderColor: s.color }}>
                <div className="tut-pipe-detail-label" style={{ color: s.color }}>{s.label}</div>
                <p className="tut-pipe-detail-desc">{s.desc}</p>
                <div className="tut-pipe-detail-example">
                  <span className="tut-pipe-ex-label">EXAMPLE</span>
                  <span className="tut-pipe-ex-val">{s.example}</span>
                </div>
              </div>
            )
          })()
        ) : (
          <div className="tut-pipe-detail-placeholder">
            Hover a stage for details
          </div>
        )}
      </div>

      {/* Data flow table */}
      <h3 className="tut-subsection-title">DATA FLOW — DARK MATTER S02E04</h3>
      <ScreenMock label="GENERATION PIPELINE — EPISODE TRACE">
        <div className="tut-trace-table">
          {[
            { stage: 'INGESTION',   input: 'darkmatter_S02_bible.pdf',              output: '2,847 chunks → Qdrant', status: 'done' },
            { stage: 'EMBEDDING',   input: '2,847 chunks · nomic-embed-text-v1.5',  output: '+2,847 vectors committed', status: 'done' },
            { stage: 'GRAPH',       input: 'Entity extraction pass',                output: '47 new relationships → Neo4j', status: 'done' },
            { stage: 'TRAINING',    input: 'kael_theron_voice dataset (1,402 pairs)',output: 'Adapter ready · loss 0.724', status: 'done' },
            { stage: 'SHOWRUNNER',  input: 'Brief: S02E04 "The Vault Antechamber"', output: 'Beat sheet · 12 scene outlines', status: 'done' },
            { stage: 'SCENE WRITER',input: 'Beat 12: Kael confronts Maren',        output: 'Script scene · 2,847 tokens', status: 'active' },
            { stage: 'VISUAL',      input: 'Scene 12 description + LoRA stack',     output: '6 frames queued in ComfyUI', status: 'pending' },
          ].map(row => (
            <div className="tut-trace-row" key={row.stage}>
              <span className={`tut-trace-status tut-trace-${row.status}`}>
                {row.status === 'done' ? '✓' : row.status === 'active' ? '◌' : '○'}
              </span>
              <span className="tut-trace-stage">{row.stage}</span>
              <span className="tut-trace-input">{row.input}</span>
              <span className="tut-trace-arrow">→</span>
              <span className="tut-trace-output">{row.output}</span>
            </div>
          ))}
        </div>
      </ScreenMock>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 4 — CLUSTER
// ══════════════════════════════════════════════════════════
const NODES = [
  {
    name: 'UBUNTU HUB',
    gpu: 'RTX A4000', vram: 16, role: 'Orchestration + Infrastructure',
    host: '192.168.1.10', color: '#00d4c8',
    services: ['Qdrant :6333', 'Neo4j :7474', 'LiteLLM :4000', 'n8n :5678'],
    vramUsed: 11.2, temp: 62,
    why: 'Always-on infrastructure node. Low VRAM, high availability. Runs the memory layer and routing.',
  },
  {
    name: 'WIN WORKSTATION',
    gpu: 'RTX 5090', vram: 32, role: 'Primary Compute',
    host: '192.168.1.42', color: '#c8922a',
    services: ['vLLM :8000', 'ComfyUI :8188', 'Unsloth :7860'],
    vramUsed: 24.8, temp: 71,
    why: '32GB VRAM fits the full 14B model Q4 + 3 LoRA adapters + KV cache simultaneously. The workhorse.',
  },
  {
    name: 'LAPTOP',
    gpu: 'RTX 3060', vram: 12, role: 'Secondary Inference',
    host: '192.168.1.55', color: '#4caf7d',
    services: ['Ollama :11434', 'vLLM overflow'],
    vramUsed: 4.2, temp: 54,
    why: 'Handles lighter 7B tasks via Ollama. Overflow capacity when the 5090 is training.',
  },
  {
    name: 'MACBOOK PRO',
    gpu: 'M1 Max (32GB)', vram: 32, role: 'Dev + Orchestration',
    host: '192.168.1.71', color: '#9b9790',
    services: ['LangGraph dev :3001', 'MLX inference', 'n8n'],
    vramUsed: 8.4, temp: 48,
    why: 'LangGraph agent development and testing. MLX runs small models for rapid iteration.',
  },
]

function ClusterChapter() {
  return (
    <Section id="cluster" icon={Server} num={4} title="Your 4-Node GPU Cluster" subtitle="CLUSTER ARCHITECTURE">
      <p className="tut-body">
        The cluster is a heterogeneous network of four machines, each specialised for a different role.
        LiteLLM on the hub acts as a unified proxy — agents always talk to LiteLLM, which routes to the
        right node and model.
      </p>

      <div className="tut-cluster-grid">
        {NODES.map(node => {
          const pct = Math.round((node.vramUsed / node.vram) * 100)
          return (
            <div className="tut-node-card" key={node.name} style={{ '--node-color': node.color }}>
              <div className="tut-node-header">
                <div className="tut-node-dot" />
                <span className="tut-node-name">{node.name}</span>
              </div>
              <div className="tut-node-gpu">{node.gpu} · {node.vram}GB VRAM</div>
              <div className="tut-node-host">{node.host}</div>

              {/* VRAM bar */}
              <div className="tut-node-vram-row">
                <span className="tut-node-vram-label">VRAM</span>
                <div className="tut-node-vram-bar">
                  <div className="tut-node-vram-fill" style={{ width: `${pct}%`, background: node.color }} />
                </div>
                <span className="tut-node-vram-pct">{pct}%</span>
              </div>

              <div className="tut-node-services">
                {node.services.map(s => <span key={s} className="tut-service-tag">{s}</span>)}
              </div>

              <p className="tut-node-why">{node.why}</p>
            </div>
          )
        })}
      </div>

      {/* Network diagram */}
      <div className="tut-network-diagram">
        <svg viewBox="0 0 580 160" className="tut-network-svg">
          {/* LiteLLM proxy centre */}
          <rect x="230" y="60" width="120" height="40" rx="4"
            fill="rgba(200,146,42,0.08)" stroke="rgba(200,146,42,0.4)" strokeWidth="1" />
          <text x="290" y="78" textAnchor="middle" fill="#c8922a" fontSize="8" fontFamily="Space Mono">LITELLM PROXY</text>
          <text x="290" y="91" textAnchor="middle" fill="#c8922a" fontSize="7" fontFamily="Space Mono">192.168.1.10:4000</text>

          {/* Nodes */}
          {[
            { x: 40,  y: 60, label: 'UBUNTU HUB',   sub: '192.168.1.10', color: '#00d4c8' },
            { x: 430, y: 20, label: 'RTX 5090',      sub: '192.168.1.42', color: '#c8922a' },
            { x: 430, y: 100,label: 'RTX 3060',      sub: '192.168.1.55', color: '#4caf7d' },
            { x: 530, y: 60, label: 'M1 MAX',        sub: '192.168.1.71', color: '#9b9790' },
          ].map((n, i) => (
            <g key={i}>
              <line x1={n.x + 60} y1={n.y + 20} x2="230" y2="80"
                stroke={n.color} strokeWidth="0.8" strokeDasharray="4,4" opacity="0.4" />
              <rect x={n.x} y={n.y} width="110" height="40" rx="3"
                fill="rgba(13,13,15,0.9)" stroke={n.color} strokeWidth="1" />
              <text x={n.x + 55} y={n.y + 17} textAnchor="middle" fill={n.color} fontSize="8" fontFamily="Space Mono">{n.label}</text>
              <text x={n.x + 55} y={n.y + 30} textAnchor="middle" fill={n.color} fontSize="7" fontFamily="Space Mono" opacity="0.7">{n.sub}</text>
            </g>
          ))}
        </svg>
        <p className="tut-diagram-caption">
          All agent requests route through LiteLLM. The proxy resolves model aliases (e.g. <code>qwen2.5-14b-vllm</code>) to the correct node and port.
        </p>
      </div>

      <Callout type="key">
        <strong>LiteLLM alias convention:</strong> Agents reference models by alias (<code>qwen2.5-14b-vllm</code>, not raw endpoints).
        This means you can migrate a model to a different node without touching any agent configuration — only the LiteLLM alias mapping changes.
      </Callout>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 5 — MEMORY LAYER
// ══════════════════════════════════════════════════════════
function MemoryChapter() {
  return (
    <Section id="memory" icon={Database} num={5} title="The Memory Layer" subtitle="QDRANT + NEO4J">
      <p className="tut-body">
        The memory layer has two complementary systems working in tandem.
        <span className="tut-hl-cyan"> Qdrant</span> handles semantic similarity —
        "find me everything about Vault-7 and the Iron Conclave's early history."
        <span className="tut-hl-amber"> Neo4j</span> handles structural relationships —
        "who knows about Vault-7, and are any of them currently in the same location as Kael?"
      </p>

      <div className="tut-memory-split">
        {/* Qdrant */}
        <div className="tut-memory-panel tut-memory-qdrant">
          <div className="tut-memory-panel-title">
            <Database size={14} className="icon-cyan" />
            QDRANT — SEMANTIC MEMORY
          </div>

          <div className="tut-qdrant-collections">
            {[
              { name: 'universe_foundation', vectors: 8412,  use: 'Core world rules, physics, timeline' },
              { name: 'darkmatter_lore',      vectors: 2847,  use: 'Series-specific lore and context' },
              { name: 'darkmatter_dialogue',  vectors: 1923,  use: 'Canonical speech patterns' },
              { name: 'darkmatter_episodic',  vectors: 4231,  use: 'Scene-level episodic memory' },
              { name: 'characters_voice',     vectors: 892,   use: 'Character voice profiles' },
            ].map(c => (
              <div className="tut-collection-row" key={c.name}>
                <div className="tut-coll-top">
                  <span className="tut-coll-name">{c.name}</span>
                  <span className="tut-coll-count">{c.vectors.toLocaleString()} vectors</span>
                </div>
                <div className="tut-coll-bar">
                  <div className="tut-coll-fill" style={{ width: `${(c.vectors / 8412) * 100}%` }} />
                </div>
                <span className="tut-coll-use">{c.use}</span>
              </div>
            ))}
          </div>

          <div className="tut-rag-example">
            <div className="tut-rag-label">EXAMPLE RAG QUERY</div>
            <ScreenMock label="QDRANT SIMILARITY SEARCH">
              <div className="tut-rag-content">
                <div className="tut-rag-query">
                  Query: <span className="tut-hl-cyan">"What does Kael know about the dark-field inhibitor?"</span>
                </div>
                <div className="tut-rag-results">
                  {[
                    { score: '0.934', text: '"Kael had seen the inhibitor specifications..."', src: 'S01E03', col: 'darkmatter_lore' },
                    { score: '0.901', text: '"The inhibitor was never meant for civilian—"', src: 'S01E05', col: 'darkmatter_episodic' },
                    { score: '0.878', text: '"Dark-field inhibition requires neural isolation..."', src: 'universe', col: 'universe_foundation' },
                  ].map((r, i) => (
                    <div className="tut-rag-result-row" key={i}>
                      <span className="tut-rag-score">{r.score}</span>
                      <span className="tut-rag-text">{r.text}</span>
                      <span className="tut-rag-src">[{r.src}]</span>
                    </div>
                  ))}
                </div>
                <div className="tut-rag-meta">Latency: 12ms · Collection: darkmatter_lore + universe_foundation</div>
              </div>
            </ScreenMock>
          </div>
        </div>

        {/* Neo4j */}
        <div className="tut-memory-panel tut-memory-neo4j">
          <div className="tut-memory-panel-title">
            <GitBranch size={14} className="icon-amber" />
            NEO4J — RELATIONSHIP GRAPH
          </div>

          {/* Mini graph visualisation */}
          <div className="tut-neo4j-graph">
            <svg viewBox="0 0 280 200" className="tut-graph-svg">
              {/* Nodes */}
              {[
                { x: 140, y: 100, label: 'Kael Theron',    type: 'Character', color: '#c8922a', r: 22 },
                { x: 50,  y: 50,  label: 'Iron Conclave',  type: 'Faction',   color: '#e06c5a', r: 18 },
                { x: 230, y: 50,  label: 'Sera Vance',     type: 'Character', color: '#00d4c8', r: 18 },
                { x: 50,  y: 150, label: 'Vault-7',        type: 'Location',  color: '#c8922a', r: 16 },
                { x: 230, y: 150, label: 'Dir. Maren',     type: 'Character', color: '#e06c5a', r: 18 },
                { x: 140, y: 170, label: 'The Archivist',  type: 'Character', color: '#9b9790', r: 14 },
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.x} cy={n.y} r={n.r}
                    fill="rgba(13,13,15,0.95)" stroke={n.color} strokeWidth="1.5" />
                  <text x={n.x} y={n.y - 3} textAnchor="middle"
                    fill={n.color} fontSize="6" fontFamily="Space Mono">{n.label.split(' ')[0]}</text>
                  <text x={n.x} y={n.y + 6} textAnchor="middle"
                    fill={n.color} fontSize="6" fontFamily="Space Mono" opacity="0.7">{n.label.split(' ')[1] || ''}</text>
                </g>
              ))}

              {/* Edges */}
              {[
                { x1:140, y1:100, x2:50,  y2:50,  label:'MEMBER_OF (former)', color:'#e06c5a' },
                { x1:140, y1:100, x2:230, y2:50,  label:'ALLIED_WITH',         color:'#00d4c8' },
                { x1:140, y1:100, x2:50,  y2:150, label:'KNOWS_ABOUT',         color:'#c8922a' },
                { x1:140, y1:100, x2:230, y2:150, label:'ANTAGONIST',          color:'#e06c5a' },
                { x1:140, y1:100, x2:140, y2:170, label:'INFORMANT',           color:'#9b9790' },
              ].map((e, i) => (
                <g key={i}>
                  <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={e.color} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.5" />
                </g>
              ))}
            </svg>
          </div>

          <div className="tut-constraint-example">
            <div className="tut-rag-label">CONTINUITY CONSTRAINT CHECK</div>
            <ScreenMock label="NEO4J CONSTRAINT RESULT">
              <div className="tut-constraint-content">
                <div className="tut-constraint-query">
                  Cypher: <span className="tut-hl-amber">MATCH (c:Character &#123;name:'Kael Theron'&#125;) RETURN c.status</span>
                </div>
                <div className="tut-constraint-result tut-constraint-pass">
                  ✓ PASS · status: ALIVE · last_seen: S02E06
                </div>
                <div className="tut-constraint-query" style={{marginTop: 8}}>
                  Scene attempted to reference: <span className="tut-hl-coral">"Kel Aran" (status: DEAD since S01E02)</span>
                </div>
                <div className="tut-constraint-result tut-constraint-fail">
                  ✗ FAIL · Character DEAD — scene requeued for correction
                </div>
              </div>
            </ScreenMock>
          </div>
        </div>
      </div>

      <Callout type="info">
        The hybrid query tester in <strong>Lore Layer</strong> lets you run both a Qdrant semantic search
        and a Neo4j Cypher query simultaneously, with results merged and ranked. Use this to verify
        that a piece of lore is both semantically retrievable and structurally consistent.
      </Callout>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 6 — ADAPTER VAULT
// ══════════════════════════════════════════════════════════
const LORA_STACK = [
  { name: 'universe_voice',    tier: 'T1', rank: 64, weight: 1.0, type: 'LLM', desc: 'Universe-wide narrative voice. Always active. Merged into base model.', vram: 0 },
  { name: 'darkmatter_s02',   tier: 'T2', rank: 32, weight: 1.0, type: 'LLM', desc: 'Series 02 lore knowledge, tone, and continuity. Full weight.', vram: 0.17 },
  { name: 'kael_theron_voice', tier: 'T3', rank: 16, weight: 0.7, type: 'LLM', desc: 'Character voice: clipped, precise, no contractions. Reduced weight to preserve series tone.', vram: 0.09 },
]

function AdaptersChapter() {
  return (
    <Section id="adapters" icon={Layers} num={6} title="The Adapter Vault" subtitle="LORA ARCHITECTURE">
      <p className="tut-body">
        LoRA adapters are the system's institutional memory at the model level.
        Where Qdrant stores <em>what happened</em>, LoRAs encode <em>how the universe speaks</em> —
        the specific narrative voice, vocabulary, and stylistic fingerprint of the fiction.
      </p>

      {/* Tier pyramid */}
      <div className="tut-lora-pyramid">
        <div className="tut-pyramid-tier tut-tier-1">
          <div className="tut-tier-badge tut-tier-badge-1">T1 · UNIVERSE</div>
          <div className="tut-tier-content">
            <div className="tut-tier-name">universe_voice</div>
            <div className="tut-tier-meta">r=64 · MERGED · Always active</div>
            <div className="tut-tier-desc">The foundational voice of the entire Dark Matter Universe. Every other adapter stacks on top of this. Trained on all universe-level world-building documents.</div>
          </div>
        </div>
        <div className="tut-pyramid-tier tut-tier-2">
          <div className="tut-tier-badge tut-tier-badge-2">T2 · SERIES</div>
          <div className="tut-tier-content">
            <div className="tut-tier-name">darkmatter_s01 &nbsp;·&nbsp; darkmatter_s02</div>
            <div className="tut-tier-meta">r=32 · weight: 1.0 · Active per-series</div>
            <div className="tut-tier-desc">Series-specific lore, recurring locations, faction dynamics, and season arc knowledge. Swapped per generation job based on target series.</div>
          </div>
        </div>
        <div className="tut-pyramid-tier tut-tier-3">
          <div className="tut-tier-badge tut-tier-badge-3">T3 · CHARACTER</div>
          <div className="tut-tier-content">
            <div className="tut-tier-name">kael_theron_voice &nbsp;·&nbsp; sera_vance_voice</div>
            <div className="tut-tier-meta">r=16 · weight: 0.7 · Stacked per-scene</div>
            <div className="tut-tier-desc">Individual character voice adapters. Applied at reduced weight (0.7 max) to ensure character voice is subordinate to series tone. Never combine two T3 LLM adapters — interference risk.</div>
          </div>
        </div>
      </div>

      {/* Composition example */}
      <h3 className="tut-subsection-title">EXAMPLE COMPOSITION — KAEL SCENE</h3>
      <div className="tut-composition-example">
        <div className="tut-comp-stack">
          <div className="tut-comp-stack-label">LORA STACK FOR: Scene Writer · Kael POV</div>
          {LORA_STACK.map((a, i) => (
            <div className="tut-comp-layer" key={a.name}
              style={{ '--layer-color': a.tier === 'T1' ? '#c8922a' : a.tier === 'T2' ? '#9b9790' : '#4caf7d' }}>
              <div className="tut-comp-layer-left">
                <span className={`tut-tier-dot tut-tier-dot-${a.tier.toLowerCase().replace('t','')}`}>
                  {a.tier}
                </span>
                <span className="tut-comp-name">{a.name}</span>
                <span className="tut-comp-rank">r={a.rank}</span>
              </div>
              <div className="tut-comp-weight-bar">
                <div className="tut-comp-weight-fill" style={{ width: `${a.weight * 100}%` }} />
                <span className="tut-comp-weight-label">{a.weight === 1.0 ? 'merged' : `×${a.weight}`}</span>
              </div>
              <div className="tut-comp-desc">{a.desc}</div>
            </div>
          ))}
        </div>

        <div className="tut-comp-vram">
          <div className="tut-comp-vram-title">VRAM BUDGET — RTX 5090 (32GB)</div>
          {[
            { label: 'Qwen2.5-14B Q4',     gb: 6.8,  color: '#c8922a' },
            { label: 'darkmatter_s02 (r=32)', gb: 0.17, color: '#9b9790' },
            { label: 'kael_voice (r=16)',    gb: 0.09, color: '#4caf7d' },
            { label: 'KV Cache',             gb: 2.0,  color: '#5a5855' },
            { label: 'Available',            gb: 22.94, color: 'rgba(255,255,255,0.06)' },
          ].map(r => (
            <div className="tut-vram-row" key={r.label}>
              <span className="tut-vram-label">{r.label}</span>
              <div className="tut-vram-bar-outer">
                <div className="tut-vram-bar-inner"
                  style={{ width: `${(r.gb / 32) * 100}%`, background: r.color }} />
              </div>
              <span className="tut-vram-gb">{r.gb.toFixed(2)} GB</span>
            </div>
          ))}
          <div className="tut-vram-total">
            <span>TOTAL IN USE</span>
            <span className="tut-vram-total-val">9.06 GB <span className="tut-hl-green">✓ Fits</span></span>
          </div>
        </div>
      </div>

      <Callout type="warn">
        Do not combine two T3 LLM adapters in a single stack. The interference between competing character
        voices degrades output quality significantly. Stack T1 + T2 + one T3 maximum for any single agent run.
      </Callout>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 7 — AGENTS
// ══════════════════════════════════════════════════════════
const AGENTS_DEF = [
  { name: 'SHOWRUNNER',    model: 'Qwen2.5-32B', loras: ['universe_voice'], role: 'Orchestrator — breaks the brief into beats, assigns scenes, manages continuity at episode level.', color: '#c8922a' },
  { name: 'WORLD BUILDER', model: 'Qwen2.5-14B', loras: ['universe_voice', 'darkmatter_s02'], role: 'Expands series bible entries, creates new locations and faction lore on demand.', color: '#c8922a' },
  { name: 'HEAD WRITER',   model: 'Qwen2.5-14B', loras: ['universe_voice', 'darkmatter_s02'], role: 'Produces beat sheets and scene outlines from the Showrunner\'s episode brief.', color: '#c8922a' },
  { name: 'SCENE WRITER',  model: 'Qwen2.5-14B', loras: ['darkmatter_s02', 'kael_theron_voice'], role: 'Generates full scene scripts. Queries Qdrant before each scene. Receives Neo4j constraint feedback.', color: '#00d4c8' },
  { name: 'STORY EDITOR',  model: 'Qwen2.5-7B',  loras: ['universe_voice'], role: 'Fast evaluator. Checks continuity, pacing, and consistency. Returns pass/fail with specific notes.', color: '#4caf7d' },
  { name: 'RESEARCHER',    model: 'Qwen2.5-7B',  loras: [], role: 'Lore retrieval specialist. Pure RAG — queries Qdrant and Neo4j, formats results for other agents.', color: '#00d4c8' },
]

function AgentsChapter() {
  const [activeAgent, setActiveAgent] = useState(3) // Scene Writer by default

  return (
    <Section id="agents" icon={Bot} num={7} title="The 6-Agent Pipeline" subtitle="AGENT ORCHESTRATION">
      <p className="tut-body">
        The pipeline is a LangGraph directed graph. The Showrunner is the supervisor node —
        it receives the brief, delegates to writers, collects output, and coordinates the editorial pass.
        Each agent has its own model, LoRA stack, and memory configuration.
      </p>

      {/* Agent roster */}
      <div className="tut-agents-layout">
        <div className="tut-agent-list">
          {AGENTS_DEF.map((a, i) => (
            <button
              key={a.name}
              className={`tut-agent-item ${activeAgent === i ? 'tut-agent-active' : ''}`}
              style={{ '--agent-color': a.color }}
              onClick={() => setActiveAgent(i)}
            >
              <Bot size={12} />
              <span className="tut-agent-item-name">{a.name}</span>
              <ChevronRight size={10} className="tut-agent-chevron" />
            </button>
          ))}
        </div>

        <div className="tut-agent-detail" style={{ '--agent-color': AGENTS_DEF[activeAgent].color }}>
          <div className="tut-agent-detail-name">{AGENTS_DEF[activeAgent].name}</div>
          <div className="tut-agent-detail-model">
            <Cpu size={11} /> {AGENTS_DEF[activeAgent].model}
          </div>
          <div className="tut-agent-detail-loras">
            {AGENTS_DEF[activeAgent].loras.length > 0
              ? AGENTS_DEF[activeAgent].loras.map(l => (
                  <span key={l} className="tut-agent-lora-tag">{l}</span>
                ))
              : <span className="tut-agent-no-lora">No LoRA — pure retrieval</span>
            }
          </div>
          <p className="tut-agent-detail-role">{AGENTS_DEF[activeAgent].role}</p>

          {activeAgent === 3 && (
            <div className="tut-agent-trace">
              <div className="tut-agent-trace-title">SCENE WRITER — EXECUTION TRACE</div>
              {[
                { step: 'Receive beat',     detail: '"Kael confronts Maren in the Vault antechamber"', status: 'done' },
                { step: 'RAG query ×7',    detail: 'Retrieved 7 chunks · vault, maren, kael recent · 14ms', status: 'done' },
                { step: 'Neo4j check',      detail: 'Kael ALIVE ✓ · Maren at Vault-7 ✓ · Vault-7 accessible ✓', status: 'done' },
                { step: 'Load LoRA stack',  detail: 'darkmatter_s02 (1.0) + kael_theron_voice (0.7)', status: 'done' },
                { step: 'Generate script',  detail: '2,847 tokens · 42s · 3,847 tok/s', status: 'active' },
                { step: 'Story Editor',     detail: 'Awaiting scene output for continuity check', status: 'pending' },
              ].map(t => (
                <div className="tut-trace-row" key={t.step}>
                  <span className={`tut-trace-status tut-trace-${t.status}`}>
                    {t.status === 'done' ? '✓' : t.status === 'active' ? '◌' : '○'}
                  </span>
                  <span className="tut-trace-stage">{t.step}</span>
                  <span className="tut-trace-input">{t.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sample output */}
      <h3 className="tut-subsection-title">SAMPLE SCENE OUTPUT — DM S02E04, SCENE 12</h3>
      <ScreenMock label="SCENE WRITER OUTPUT · 2,847 TOKENS GENERATED">
        <div className="tut-script-output">
          <div className="tut-script-slug">INT. VAULT ANTECHAMBER — NIGHT</div>
          <div className="tut-script-action">
            The antechamber is cold. Kael's breath fogs in the emergency lighting.
            His hand stays near his holster — not touching it. Not yet.
          </div>
          <div className="tut-script-action">
            MAREN stands at the far console, her back to him. She knew he was coming.
          </div>
          <div className="tut-script-dialogue">
            <span className="tut-script-speaker">KAEL</span>
            <span className="tut-script-line">Six months.</span>
          </div>
          <div className="tut-script-dialogue">
            <span className="tut-script-speaker">MAREN</span>
            <span className="tut-script-line">
              <em>(not turning)</em><br />
              Longer than that.
            </span>
          </div>
          <div className="tut-script-dialogue">
            <span className="tut-script-speaker">KAEL</span>
            <span className="tut-script-line">You knew. The whole time.</span>
          </div>
          <div className="tut-script-action">
            A beat. She turns. There's no defiance in her face — only something that
            might be called regret, if the Iron Conclave had ever trained its directors
            to show it.
          </div>
          <div className="tut-script-dialogue">
            <span className="tut-script-speaker">MAREN</span>
            <span className="tut-script-line">
              I gave you every opportunity to understand.<br />
              You chose sentiment.
            </span>
          </div>
          <div className="tut-script-generating">
            <span className="tut-script-gen-dot" />
            generating...
          </div>
        </div>
      </ScreenMock>

      <Callout type="tip">
        Notice Kael's dialogue: short sentences, no contractions, maximum information density.
        This is the <strong>kael_theron_voice</strong> adapter (r=16) at work —
        trained on 1,402 canonical dialogue pairs extracted from the series bible.
      </Callout>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// CHAPTER 8 — GENERATION RUN
// ══════════════════════════════════════════════════════════
function GenerationChapter() {
  const [step, setStep] = useState(0)
  const GEN_STEPS = [
    { label: '01 · BRIEF',      desc: 'Open Generation → New Job. Select series (Dark Matter), season (02), episode (04). Provide a one-line brief.', action: 'Enter: "S02E04 — Kael confronts Maren in the Vault antechamber. The Conclave\'s secret is revealed."' },
    { label: '02 · SHOWRUNNER', desc: 'The Showrunner agent receives the brief and breaks it into a 12-scene beat sheet. Each beat specifies the story function and primary characters.', action: 'Output: 12 beats, ~800 tokens, 8.2s' },
    { label: '03 · HEAD WRITER',desc: 'Head Writer expands each beat into a full scene outline — setting, action, dialogue purpose, character state going in/out.', action: 'Output: 12 outlines, ~3,200 tokens, 22s' },
    { label: '04 · SCENE WRITER',desc: 'Scene Writer generates each scene in sequence. Before each scene: RAG query (7 chunks avg), Neo4j constraint check. LoRA stack: darkmatter_s02 + kael_theron_voice.', action: 'Output: 12 full scenes, ~28,000 tokens, ~8 min' },
    { label: '05 · STORY EDITOR',desc: 'Story Editor reviews the full episode draft. Checks: character consistency, continuity violations, pacing. Issues inline notes.', action: 'Output: Pass 94% · 2 constraint flags · revision notes' },
    { label: '06 · VISUAL',     desc: 'ComfyUI renders key frames for flagged scenes using darkmatter_style (0.55) + kael_identity (0.85). WAN2.2 generates motion clips if requested.', action: 'Output: 24 frames · 6 motion clips · 2,847×1,604' },
  ]

  return (
    <Section id="generation" icon={Film} num={8} title="Running a Generation Job" subtitle="PRODUCTION WALKTHROUGH">
      <p className="tut-body">
        This walkthrough generates a complete episode of Dark Matter — Series 02, Episode 04.
        Follow the steps below to understand exactly what happens at each stage of the pipeline.
      </p>

      <div className="tut-gen-steps">
        <div className="tut-gen-step-list">
          {GEN_STEPS.map((s, i) => (
            <button
              key={i}
              className={`tut-gen-step-btn ${step === i ? 'tut-gen-step-active' : ''} ${step > i ? 'tut-gen-step-done' : ''}`}
              onClick={() => setStep(i)}
            >
              {step > i ? <CheckCircle size={12} /> : step === i ? <Circle size={12} className="icon-amber" /> : <Circle size={12} />}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="tut-gen-step-detail">
          <div className="tut-gen-step-label">{GEN_STEPS[step].label}</div>
          <p className="tut-gen-step-desc">{GEN_STEPS[step].desc}</p>
          <div className="tut-gen-step-action">
            <span className="tut-gen-action-label">RESULT</span>
            <span className="tut-gen-action-val">{GEN_STEPS[step].action}</span>
          </div>
          <div className="tut-gen-step-nav">
            <button className="btn-ghost tut-gen-nav-btn" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              ← PREV
            </button>
            <button className="btn-primary tut-gen-nav-btn" disabled={step === GEN_STEPS.length - 1} onClick={() => setStep(s => s + 1)}>
              NEXT →
            </button>
          </div>
        </div>
      </div>

      {/* Final output summary */}
      <h3 className="tut-subsection-title">EPISODE OUTPUT SUMMARY — DM S02E04</h3>
      <div className="tut-output-summary">
        {[
          { label: 'SCENES',         val: '12',        icon: Film,      color: 'amber' },
          { label: 'TOTAL TOKENS',   val: '~32,000',   icon: BarChart2, color: 'amber' },
          { label: 'RAG QUERIES',    val: '84',        icon: Database,  color: 'cyan' },
          { label: 'GRAPH CHECKS',   val: '36',        icon: GitBranch, color: 'cyan' },
          { label: 'VIOLATIONS',     val: '2',         icon: AlertTriangle, color: 'coral' },
          { label: 'CONSISTENCY',    val: '94%',       icon: Shield,    color: 'green' },
          { label: 'IMAGES GEN',     val: '24',        icon: Eye,       color: 'green' },
          { label: 'RUNTIME',        val: '~12 min',   icon: Clock,     color: 'amber' },
        ].map(s => (
          <div className="tut-output-stat" key={s.label}>
            <s.icon size={14} className={`icon-${s.color}`} />
            <span className={`tut-output-val tut-uni-val-${s.color}`}>{s.val}</span>
            <span className="tut-output-label">{s.label}</span>
          </div>
        ))}
      </div>

      <Callout type="key">
        The 2 continuity violations flagged by the Story Editor are automatically requeued for correction:
        the Scene Writer re-generates those specific scenes with a constraint note injected into the prompt,
        informed by the exact Neo4j path that failed. No human intervention needed.
      </Callout>

      {/* What's next */}
      <div className="tut-whats-next">
        <h3 className="tut-subsection-title">YOU'RE READY. START HERE:</h3>
        <div className="tut-next-grid">
          {[
            { page: 'LORE LIBRARY', path: '/lore-library', desc: 'Browse the Dark Matter universe entities. Edit Kael\'s character sheet. Run the ingestion pipeline on new source material.', icon: BookOpen, color: '#c8922a' },
            { page: 'ADAPTER VAULT', path: '/adapter-vault', desc: 'Inspect the loaded LoRA adapters. Use the Composition Planner to design a stack for a new character.', icon: Layers, color: '#c8922a' },
            { page: 'TRAINING',     path: '/training',      desc: 'Trigger a new training run. Monitor the live loss curve. Queue a FLUX character identity adapter for visual generation.', icon: Zap, color: '#c8922a' },
            { page: 'GENERATION',   path: '/generation',    desc: 'Launch a generation run for DM S02E05. The full pipeline is already configured.', icon: Film, color: '#4caf7d' },
          ].map(n => (
            <a key={n.page} href={n.path} className="tut-next-card" style={{ '--next-color': n.color }}>
              <div className="tut-next-card-top">
                <n.icon size={16} style={{ color: n.color }} />
                <span className="tut-next-page">{n.page}</span>
                <ChevronRight size={14} className="tut-next-chevron" />
              </div>
              <p className="tut-next-desc">{n.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN TUTORIAL PAGE
// ══════════════════════════════════════════════════════════
export default function Tutorial() {
  const contentRef = useRef(null)
  const [activeChapter, setActiveChapter] = useState('welcome')
  const [completed, setCompleted] = useState([])
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function onScroll() {
      // Track scroll percentage
      const { scrollTop, scrollHeight, clientHeight } = el
      const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
      setScrollPct(Math.min(100, pct))

      // Detect which chapter is in view
      const sections = el.querySelectorAll('[data-chapter]')
      let current = 'welcome'
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        if (rect.top - elRect.top < 200) {
          current = sec.getAttribute('data-chapter')
        }
      })
      setActiveChapter(current)

      // Mark chapters as completed when scrolled past
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        if (rect.bottom - elRect.top < 100) {
          const id = sec.getAttribute('data-chapter')
          setCompleted(prev => prev.includes(id) ? prev : [...prev, id])
        }
      })
    }

    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function jumpToChapter(id) {
    const el = contentRef.current
    if (!el) return
    const target = el.querySelector(`[data-chapter="${id}"]`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="tut-page">
      <ProgressBar pct={scrollPct} />
      <div className="tut-layout">
        <ChapterNav active={activeChapter} completed={completed} onJump={jumpToChapter} />
        <div className="tut-content" ref={contentRef}>
          <WelcomeChapter />
          <UniverseChapter />
          <PipelineChapter />
          <ClusterChapter />
          <MemoryChapter />
          <AdaptersChapter />
          <AgentsChapter />
          <GenerationChapter />
        </div>
      </div>
    </div>
  )
}
