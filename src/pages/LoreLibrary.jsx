import { useContext, useState, useRef } from 'react'
import {
  ChevronRight, ChevronDown, Plus, Search,
  Users, Shield, MapPin, Calendar, BookOpen, Layers,
  Database, GitBranch, RefreshCw, Edit3, Cpu,
  Upload, FileText, CheckCircle, AlertCircle,
  X, Play, Settings, Zap, Clock,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import './LoreLibrary.css'

// ── Static tree definition ─────────────────────────────
const TREE = [
  {
    id: 'foundation', label: 'FOUNDATION', Icon: Layers,
    children: [
      { id: 'world-rules', label: 'World Rules',     count: 12, type: 'abstract' },
      { id: 'physics',     label: 'Physics / Magic', count: 8,  type: 'abstract' },
      { id: 'timeline',    label: 'Timeline',         count: 47, type: 'abstract' },
    ],
  },
  {
    id: 'characters', label: 'CHARACTERS', Icon: Users, count: 342,
    children: [
      {
        id: 'main-cast', label: 'Main Cast',
        children: [
          { id: 'n-kael',      entityId: 'kael-theron',   label: 'Kael Theron',    type: 'entity' },
          { id: 'n-sera',      entityId: 'sera-vance',    label: 'Sera Vance',     type: 'entity' },
          { id: 'n-maren',     entityId: 'dir-maren',     label: 'Director Maren', type: 'entity' },
          { id: 'n-archivist', entityId: 'the-archivist', label: 'The Archivist',  type: 'entity' },
        ],
      },
      {
        id: 'supporting', label: 'Supporting', count: 89,
        children: [
          { id: 'n-voss', entityId: 'cmdr-voss', label: 'Commander Voss', type: 'entity' },
        ],
      },
      {
        id: 'deceased', label: 'Deceased', count: 34,
        children: [
          { id: 'n-drath', entityId: 'admiral-drath', label: 'Admiral Drath', type: 'entity' },
        ],
      },
    ],
  },
  {
    id: 'factions', label: 'FACTIONS', Icon: Shield, count: 48,
    children: [
      { id: 'n-conclave', entityId: 'iron-conclave',    label: 'Iron Conclave',       type: 'entity' },
      { id: 'n-drift',    entityId: 'drift-collective', label: 'The Drift Collective', type: 'entity' },
    ],
  },
  {
    id: 'locations', label: 'LOCATIONS', Icon: MapPin, count: 127,
    children: [
      { id: 'n-vault7', entityId: 'vault-7',           label: 'Vault-7',            type: 'entity' },
      { id: 'n-isa',    entityId: 'iron-station-alpha', label: 'Iron Station Alpha', type: 'entity' },
    ],
  },
  {
    id: 'events', label: 'EVENTS', Icon: Calendar, count: 412,
    children: [
      { id: 'n-keth', entityId: 'siege-of-keth', label: 'Siege of Keth', type: 'entity' },
    ],
  },
  { id: 'series-01', label: 'Series 01: Dark Matter',       type: 'series', seriesStatus: 'active'  },
  { id: 'series-02', label: 'Series 02: The Conclave Wars', type: 'series', seriesStatus: 'active'  },
  { id: 'series-03', label: 'Series 03: Fragments',         type: 'series', seriesStatus: 'planned' },
]

const PIPELINE_STEPS = [
  { id: 1, key: 'parse',    label: 'PARSE & CHUNK',          desc: 'Recursive character splitter · 1500 tok / 200 overlap' },
  { id: 2, key: 'classify', label: 'CLASSIFY ENTITIES',      desc: 'Extract characters, locations, events, rules' },
  { id: 3, key: 'embed',    label: 'EMBED',                  desc: 'nomic-embed-text-v1.5 → Qdrant' },
  { id: 4, key: 'graph',    label: 'GRAPH UPDATE',           desc: 'Extract relationships → Neo4j' },
  { id: 5, key: 'training', label: 'GENERATE TRAINING DATA', desc: 'Auto-create LoRA training pairs via LLM' },
]

const RECENT_INGESTIONS = [
  { name: 'darkmatter_S02_bible.pdf', chunks: 2847, ago: '14 min ago',  status: 'done'      },
  { name: 'kael_theron_extended.md',  chunks: 312,  ago: '1 hr ago',    status: 'done'      },
  { name: 'conclave_history.pdf',     chunks: 1204, ago: '3 hr ago',    status: 'embedding' },
]

// ── Embedding status dots ──────────────────────────────
function EmbedDots({ embeddedIn }) {
  return (
    <span className="embed-dots">
      <span className={`embed-dot ${embeddedIn?.qdrant  ? 'dot-cyan'  : 'dot-dim'}`} title="Qdrant" />
      <span className={`embed-dot ${embeddedIn?.neo4j   ? 'dot-amber' : 'dot-dim'}`} title="Neo4j"  />
    </span>
  )
}

// ── Recursive tree node ────────────────────────────────
function TreeNode({ node, depth, entities, selected, expanded, onToggle, onSelect, search }) {
  const entity   = node.entityId ? entities.find(e => e.id === node.entityId) : null
  const isGroup  = !!node.children
  const isSeries = node.type === 'series'
  const isEntity = node.type === 'entity' && !!entity
  const isOpen   = expanded.has(node.id)
  const { Icon } = node

  // Search filter
  if (search) {
    const q = search.toLowerCase()
    if (isEntity && !entity.name.toLowerCase().includes(q)) return null
    if (isGroup && !nodeHasMatch(node, entities, q)) return null
  }

  return (
    <>
      <div
        className={`tree-row ${isEntity ? 'tree-entity' : ''} ${isEntity && selected === node.entityId ? 'tree-selected' : ''} ${isSeries ? 'tree-series-row' : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={() => {
          if (isGroup && !isSeries) onToggle(node.id)
          else if (isEntity)        onSelect(node.entityId)
        }}
      >
        {/* Chevron */}
        <span className="tree-chevron">
          {isGroup && !isSeries
            ? isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />
            : null
          }
        </span>

        {/* Top-level group icon */}
        {Icon && depth === 0 && <Icon size={12} className="tree-group-icon" />}

        {/* Label */}
        <span className={`tree-label ${depth === 0 && isGroup ? 'tree-label-top' : ''} ${isSeries ? 'tree-label-series' : ''} ${node.type === 'abstract' ? 'tree-label-abstract' : ''}`}>
          {isEntity ? entity.name : node.label}
        </span>

        {/* Count */}
        {node.count != null && !isEntity && (
          <span className="tree-count">{node.count.toLocaleString()}</span>
        )}

        {/* Series status badge */}
        {isSeries && (
          <span className={`tree-series-badge badge-${node.seriesStatus}`}>
            {node.seriesStatus.toUpperCase()}
          </span>
        )}

        {/* Entity embed dots */}
        {isEntity && entity.embeddedIn && (
          <EmbedDots embeddedIn={entity.embeddedIn} />
        )}
      </div>

      {/* Children */}
      {isGroup && isOpen && node.children.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          entities={entities}
          selected={selected}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
          search={search}
        />
      ))}
    </>
  )
}

function nodeHasMatch(node, entities, q) {
  if (!node.children) return false
  for (const child of node.children) {
    if (child.entityId) {
      const e = entities.find(e => e.id === child.entityId)
      if (e && e.name.toLowerCase().includes(q)) return true
    }
    if (child.children && nodeHasMatch(child, entities, q)) return true
  }
  return false
}

// ── Bible navigator (left panel) ──────────────────────
function BibleNav({ entities, selected, onSelect }) {
  const [expanded, setExpanded] = useState(
    new Set(['characters', 'main-cast', 'factions', 'locations', 'events'])
  )
  const [search, setSearch] = useState('')

  function toggleNode(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="bible-nav">
      {/* Search bar */}
      <div className="bible-search-row">
        <Search size={12} className="icon-muted" />
        <input
          className="bible-search-input"
          placeholder="Search entities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="bible-search-clear" onClick={() => setSearch('')}>
            <X size={10} />
          </button>
        )}
      </div>

      {/* Universe root label */}
      <div className="bible-universe-root">
        <BookOpen size={12} className="icon-amber" />
        <span className="bible-universe-name">THE DARK MATTER UNIVERSE</span>
      </div>

      {/* Tree */}
      <div className="bible-tree">
        {TREE.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            entities={entities}
            selected={selected}
            expanded={expanded}
            onToggle={toggleNode}
            onSelect={onSelect}
            search={search}
          />
        ))}
      </div>

      {/* Add entity */}
      <div className="bible-nav-footer">
        <button className="lore-add-entity-btn">
          <Plus size={12} /> ADD ENTITY
        </button>
      </div>
    </div>
  )
}

// ── Entity detail (right panel) ────────────────────────
function EntityDetail({ entity }) {
  const [showAllFacts, setShowAllFacts] = useState(false)
  const [loraPanel, setLoraPanel]       = useState(false)
  const [loraRunning, setLoraRunning]   = useState(false)
  const [loraResult, setLoraResult]     = useState(null)
  const [loraPairs, setLoraPairs]       = useState(120)

  if (!entity) {
    return (
      <div className="entity-empty">
        <BookOpen size={32} className="entity-empty-icon" />
        <span className="entity-empty-label">Select an entity from the navigator</span>
        <span className="entity-empty-sub">Characters · Factions · Locations · Events</span>
      </div>
    )
  }

  const facts        = entity.facts || []
  const visibleFacts = showAllFacts ? facts : facts.slice(0, 5)
  const hasMore      = facts.length > 5

  function handleGenerateLora() {
    setLoraRunning(true)
    setLoraResult(null)
    setTimeout(() => {
      setLoraRunning(false)
      setLoraResult({ pairs: loraPairs, time: '2.4s' })
    }, 2400)
  }

  const bothIndexed = entity.embeddedIn?.qdrant && entity.embeddedIn?.neo4j
  const qdrantOnly  = entity.embeddedIn?.qdrant && !entity.embeddedIn?.neo4j
  const notIndexed  = !entity.embeddedIn?.qdrant && !entity.embeddedIn?.neo4j

  return (
    <div className="entity-detail">
      {/* Header */}
      <div className="entity-detail-head">
        <div className="entity-badges">
          <span className="entity-type-badge">{entity.type.toUpperCase()}</span>
          <span className={`entity-tier-badge tier-${entity.canonTier}`}>
            T{entity.canonTier} · {entity.canonTier === 1 ? 'Film-level canon' : 'Series canon'}
          </span>
          {bothIndexed  && <span className="entity-idx-badge idx-both"><Database size={10} /> EMBEDDED <GitBranch size={10} /> IN GRAPH</span>}
          {qdrantOnly   && <span className="entity-idx-badge idx-qdrant"><Database size={10} /> EMBEDDED</span>}
          {notIndexed   && <span className="entity-idx-badge idx-none"><AlertCircle size={10} /> NOT INDEXED</span>}
        </div>
        <h2 className="entity-name">{entity.name}</h2>
      </div>

      {/* Meta */}
      <div className="entity-meta-grid">
        {entity.status && (
          <div className="entity-meta-cell">
            <span className="emeta-k">STATUS</span>
            <span className={`emeta-v ${entity.status === 'ALIVE' || entity.status === 'ACTIVE' ? 'v-green' : entity.status === 'DECEASED' || entity.status === 'PAST' ? 'v-coral' : ''}`}>
              {entity.status}
            </span>
          </div>
        )}
        {entity.faction && (
          <div className="entity-meta-cell">
            <span className="emeta-k">FACTION</span>
            <span className="emeta-v">{entity.faction}
              {entity.factionRole && <span className="emeta-role"> · {entity.factionRole}</span>}
            </span>
          </div>
        )}
        {entity.firstAppears && (
          <div className="entity-meta-cell">
            <span className="emeta-k">FIRST APPEARS</span>
            <span className="emeta-v v-cyan">{entity.firstAppears}</span>
          </div>
        )}
        {entity.lastSeen && (
          <div className="entity-meta-cell">
            <span className="emeta-k">LAST SEEN</span>
            <span className="emeta-v v-cyan">{entity.lastSeen}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="entity-section">
        <p className="entity-desc">{entity.description}</p>
      </div>

      {/* Facts */}
      {facts.length > 0 && (
        <div className="entity-section">
          <div className="entity-section-head">
            <span className="entity-section-label">CANONICAL FACTS</span>
            <span className="entity-section-count">({facts.length})</span>
          </div>
          <ul className="entity-facts">
            {visibleFacts.map((fact, i) => (
              <li key={i} className="entity-fact">
                <span className="fact-bullet">○</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button className="entity-show-more" onClick={() => setShowAllFacts(p => !p)}>
              {showAllFacts ? '− Show fewer' : `+ ${facts.length - 5} more...`}
            </button>
          )}
        </div>
      )}

      {/* Relationships */}
      {entity.relationships?.length > 0 && (
        <div className="entity-section">
          <div className="entity-section-head">
            <span className="entity-section-label">RELATIONSHIPS</span>
          </div>
          <div className="entity-rels">
            {entity.relationships.map((rel, i) => (
              <div key={i} className="entity-rel-row">
                <span className="rel-arrow">↔</span>
                <span className="rel-entity">{rel.entity}</span>
                <span className={`rel-type rel-${rel.type.toLowerCase().replace(/_/g, '-')}`}>
                  {rel.type.replace(/_/g, ' ')}
                </span>
                {rel.note && <span className="rel-note">{rel.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedding status */}
      <div className="entity-section">
        <div className="entity-section-head">
          <span className="entity-section-label">EMBEDDING STATUS</span>
        </div>
        <div className="entity-embed-row">
          <div className="embed-stat">
            <span className="estat-k">LAST EMBEDDED</span>
            <span className="estat-v v-cyan">{entity.lastEmbedded || '—'}</span>
          </div>
          <div className="embed-stat">
            <span className="estat-k">CHUNK COUNT</span>
            <span className="estat-v">{entity.chunkCount || 0}</span>
          </div>
          <div className="embed-stat">
            <span className="estat-k">COLLECTION</span>
            <span className="estat-v v-cyan">{entity.collection || '—'}</span>
          </div>
        </div>
      </div>

      {/* LoRA generation panel */}
      {loraPanel && (
        <div className="lora-gen-panel">
          <div className="lora-gen-head">
            <span className="lora-gen-title">GENERATE LoRA TRAINING DATA</span>
            <button className="lora-gen-close" onClick={() => { setLoraPanel(false); setLoraResult(null) }}>
              <X size={12} />
            </button>
          </div>
          <div className="lora-gen-body">
            <div className="lora-cfg-row">
              <span className="lora-cfg-k">PAIRS</span>
              <input type="range" min="20" max="500" step="10"
                value={loraPairs}
                className="lora-gen-slider"
                onChange={e => setLoraPairs(+e.target.value)} />
              <span className="lora-cfg-v">{loraPairs}</span>
            </div>
            <div className="lora-cfg-row">
              <span className="lora-cfg-k">FORMAT</span>
              <span className="lora-cfg-v v-amber">Alpaca</span>
            </div>
            <div className="lora-cfg-row">
              <span className="lora-cfg-k">INCLUDE</span>
              <span className="lora-cfg-v">Dialogue · Knowledge · Reasoning</span>
            </div>
          </div>

          {loraResult ? (
            <div className="lora-gen-result">
              <CheckCircle size={12} className="icon-green" />
              <span>Generated {loraResult.pairs} pairs in {loraResult.time}</span>
              <button className="btn-ghost lora-export-btn">EXPORT JSONL</button>
            </div>
          ) : (
            <button
              className={`btn-primary lora-run-btn ${loraRunning ? 'btn-busy' : ''}`}
              onClick={handleGenerateLora}
              disabled={loraRunning}
            >
              {loraRunning
                ? <><span className="lora-spinner" /> GENERATING...</>
                : <><Zap size={12} /> GENERATE {loraPairs} PAIRS</>}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="entity-actions">
        <button className="btn-ghost entity-act-btn"><Edit3 size={11} /> EDIT</button>
        <button className="btn-ghost entity-act-btn"><RefreshCw size={11} /> RE-EMBED</button>
        <button className="btn-ghost entity-act-btn"><GitBranch size={11} /> VIEW IN NEO4J</button>
        <button
          className={`btn-ghost entity-act-btn ${loraPanel ? 'act-on' : ''}`}
          onClick={() => setLoraPanel(p => !p)}
        >
          <Cpu size={11} /> GENERATE LoRA DATA
        </button>
      </div>
    </div>
  )
}

// ── Ingest pipeline tab ────────────────────────────────
function IngestPanel() {
  const [isDragging, setIsDragging]     = useState(false)
  const [droppedFiles, setDroppedFiles] = useState([])
  const [stepStates, setStepStates]     = useState({})
  const [isRunning, setIsRunning]       = useState(false)
  const fileInputRef = useRef(null)

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave()  { setIsDragging(false) }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    setDroppedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, status: 'ready' }))])
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files)
    setDroppedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, status: 'ready' }))])
  }

  async function runPipeline() {
    if (!droppedFiles.length) return
    setIsRunning(true)
    setStepStates({})
    const delays = [1800, 1400, 2400, 1600, 2000]
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const { key } = PIPELINE_STEPS[i]
      setStepStates(p => ({ ...p, [key]: 'running' }))
      await new Promise(r => setTimeout(r, delays[i]))
      setStepStates(p => ({ ...p, [key]: 'done' }))
    }
    setIsRunning(false)
    setDroppedFiles(prev => prev.map(f => ({ ...f, status: 'done' })))
  }

  const allDone = PIPELINE_STEPS.every(s => stepStates[s.key] === 'done')

  return (
    <div className="ingest-panel">
      {/* Drop zone */}
      <div className="ingest-block">
        <div className="ingest-block-label"><Upload size={12} className="icon-amber" /> INGEST NEW LORE</div>
        <div
          className={`drop-zone ${isDragging ? 'dz-active' : ''} ${droppedFiles.length ? 'dz-has-files' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !droppedFiles.length && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef} type="file" multiple
            accept=".pdf,.txt,.md,.docx"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          {droppedFiles.length === 0 ? (
            <div className="dz-empty">
              <Upload size={24} className="dz-icon" />
              <span className="dz-label">DROP FILES HERE — PDF, TXT, MD, DOCX</span>
              <span className="dz-sub">or click to browse</span>
            </div>
          ) : (
            <div className="dz-file-list">
              {droppedFiles.map((f, i) => (
                <div key={i} className="dz-file-row">
                  <FileText size={12} className="icon-amber" />
                  <span className="dz-file-name">{f.name}</span>
                  <span className="dz-file-size">{f.size ? `${(f.size/1024).toFixed(0)} KB` : '—'}</span>
                  {f.status === 'done'
                    ? <CheckCircle size={12} className="icon-green" />
                    : <button className="dz-remove" onClick={e => { e.stopPropagation(); setDroppedFiles(p => p.filter((_,j) => j !== i)) }}><X size={10} /></button>
                  }
                </div>
              ))}
              <button className="dz-add-more" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                <Plus size={11} /> Add more files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="ingest-block">
        <div className="ingest-block-label"><Settings size={12} className="icon-amber" /> PIPELINE STEPS (run in sequence)</div>
        <div className="pipeline-steps">
          {PIPELINE_STEPS.map((step, i) => {
            const state = stepStates[step.key]
            return (
              <div key={step.id} className={`pip-step pip-${state || 'idle'}`}>
                <div className="pip-step-num">
                  {state === 'done'    ? <CheckCircle size={14} className="icon-green" />
                 : state === 'running' ? <span className="pip-spinner" />
                 :                       <span className="pip-idx">{i + 1}</span>}
                </div>
                <div className="pip-step-body">
                  <span className="pip-step-label">{step.label}</span>
                  <span className="pip-step-desc">→ {step.desc}</span>
                </div>
                {state === 'done'    && <span className="pip-status-done">DONE</span>}
                {state === 'running' && <span className="pip-status-run">RUNNING</span>}
              </div>
            )
          })}
        </div>
        <div className="pipeline-run-row">
          <button
            className={`btn-primary pip-run-btn ${isRunning ? 'btn-busy' : ''}`}
            onClick={runPipeline}
            disabled={isRunning || !droppedFiles.length}
          >
            {isRunning
              ? <><span className="pip-spinner" /> RUNNING...</>
              : <><Play size={12} /> RUN FULL PIPELINE</>}
          </button>
          <button className="btn-ghost pip-config-btn">
            <Settings size={11} /> Configure Steps
          </button>
          {allDone && !isRunning && (
            <span className="pip-done-msg">
              <CheckCircle size={12} className="icon-green" /> Pipeline complete
            </span>
          )}
        </div>
      </div>

      {/* Recent ingestions */}
      <div className="ingest-block">
        <div className="ingest-block-label"><Clock size={12} className="icon-amber" /> RECENT INGESTIONS</div>
        <div className="recent-table-wrap">
          <table className="base-table">
            <thead>
              <tr>
                <th>FILE</th>
                <th>CHUNKS</th>
                <th>INGESTED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_INGESTIONS.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={11} className="icon-muted" />
                      {r.name}
                    </div>
                  </td>
                  <td className="font-mono">{r.chunks.toLocaleString()}</td>
                  <td className="font-mono text-muted">{r.ago}</td>
                  <td>
                    {r.status === 'done'
                      ? <span className="ingest-done"><CheckCircle size={11} /> Complete</span>
                      : <span className="ingest-running"><span className="dot-pulse-sm" /> Embedding...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────
export default function LoreLibrary() {
  const { loreEntities, universe } = useContext(SystemContext)
  const [activeTab, setActiveTab]   = useState('bible')
  const [selectedId, setSelectedId] = useState('kael-theron')

  const selectedEntity = loreEntities?.find(e => e.id === selectedId) || null

  return (
    <div className="lore-lib-page">
      {/* Page header */}
      <div className="lore-lib-topbar">
        <div className="lore-lib-title">
          <BookOpen size={18} className="icon-amber" />
          <span className="section-title">LORE LIBRARY</span>
          <span className="lore-universe-name">{universe?.name}</span>
        </div>
        <div className="lore-lib-tabs">
          <button
            className={`lore-lib-tab ${activeTab === 'bible' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('bible')}
          >
            <BookOpen size={12} /> SERIES BIBLE
          </button>
          <button
            className={`lore-lib-tab ${activeTab === 'ingest' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('ingest')}
          >
            <Upload size={12} /> INGEST PIPELINE
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'bible' ? (
        <div className="lore-lib-split">
          <BibleNav
            entities={loreEntities || []}
            selected={selectedId}
            onSelect={setSelectedId}
          />
          <EntityDetail entity={selectedEntity} />
        </div>
      ) : (
        <IngestPanel />
      )}
    </div>
  )
}
