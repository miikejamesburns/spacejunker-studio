import { useContext, useState } from 'react'
import {
  Crown, Globe, FileText, Film, BookOpen, Search,
  Settings, Play, X, Save, RotateCcw,
  Database, Sliders, Activity, CircleDot, Zap,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import './Agents.css'

// ── Per-agent icon ──────────────────────────────────────
const AGENT_ICONS = {
  showrunner:      Crown,
  'world-builder': Globe,
  'head-writer':   FileText,
  'scene-writer':  Film,
  'story-editor':  BookOpen,
  researcher:      Search,
}

// ── LiteLLM registered models ──────────────────────────
const AVAILABLE_MODELS = [
  'Qwen2.5-32B-Instruct-Q4_K_M',
  'Qwen2.5-14B-Instruct-Q4_K_M',
  'Qwen2.5-7B-Instruct-Q4_K_M',
  'Llama-3.1-70B-Instruct-Q4',
  'Llama-3.1-8B-Instruct-Q4',
  'Mistral-Nemo-12B-Q4_K_M',
]

const QDRANT_COLLECTIONS = [
  'universe_foundation',
  'darkmatter_episodic',
  'darkmatter_lore',
  'darkmatter_dialogue',
  'all',
]

// ── SVG Workflow graph data ────────────────────────────
// Node positions: x,y = top-left corner
const GRAPH_NODES = [
  { id: 'showrunner',    label: 'Showrunner',    x: 80,  y: 36,  w: 160, h: 48 },
  { id: 'world-builder', label: 'World Builder', x: 80,  y: 116, w: 160, h: 48 },
  { id: 'head-writer',   label: 'Head Writer',   x: 80,  y: 196, w: 160, h: 48 },
  { id: 'scene-writer',  label: 'Scene Writer',  x: 80,  y: 276, w: 160, h: 48 },
  { id: 'story-editor',  label: 'Story Editor',  x: 80,  y: 356, w: 160, h: 48 },
  { id: 'researcher',    label: 'Researcher',    x: 490, y: 196, w: 160, h: 48 },
]

// Hardcoded SVG paths between nodes
// Main nodes cx=160; Researcher cx=570
// Vertical edges: bottom/top of main nodes
// Lateral edges: sides, with bezier curves
const GRAPH_EDGES = [
  {
    id: 'e1', from: 'showrunner', to: 'world-builder', type: 'main',
    path: 'M 160,84 L 160,116',
    tip: { x: 164, y: 100 },
    payload: 'Series brief + episode directive',
  },
  {
    id: 'e2', from: 'world-builder', to: 'head-writer', type: 'main',
    path: 'M 160,164 L 160,196',
    tip: { x: 164, y: 180 },
    payload: 'Canonical lore context + series state',
  },
  {
    id: 'e3', from: 'head-writer', to: 'scene-writer', type: 'main',
    path: 'M 160,244 L 160,276',
    tip: { x: 164, y: 260 },
    payload: 'Beat sheet + scene outline [S02E04 · sc.12]',
  },
  {
    id: 'e4', from: 'scene-writer', to: 'story-editor', type: 'main',
    path: 'M 160,324 L 160,356',
    tip: { x: 164, y: 340 },
    payload: 'Draft scene text (1,247 tokens generated)',
  },
  {
    id: 'e5', from: 'story-editor', to: 'showrunner', type: 'feedback',
    path: 'M 80,380 C 22,380 22,60 80,60',
    tip: { x: 26, y: 220 },
    payload: 'Consistency report + revision flags',
  },
  {
    id: 'e6', from: 'showrunner', to: 'researcher', type: 'retrieval',
    path: 'M 240,60 C 380,60 570,120 570,196',
    tip: { x: 400, y: 76 },
    payload: 'Lore query context + search intent',
  },
  {
    id: 'e7', from: 'researcher', to: 'world-builder', type: 'retrieval',
    path: 'M 490,214 C 400,214 300,140 240,140',
    tip: { x: 370, y: 172 },
    payload: '12 foundation chunks retrieved (Qdrant)',
  },
  {
    id: 'e8', from: 'researcher', to: 'head-writer', type: 'retrieval',
    path: 'M 490,220 L 240,220',
    tip: { x: 365, y: 214 },
    payload: 'Character + event data (Neo4j + Qdrant)',
  },
  {
    id: 'e9', from: 'researcher', to: 'scene-writer', type: 'retrieval',
    path: 'M 490,226 C 400,226 300,300 240,300',
    tip: { x: 370, y: 268 },
    payload: '7 RAG chunks · 3 graph facts · avg 14ms',
  },
]

function getRunState(nodeId, stages) {
  if (nodeId === 'researcher') return 'retrieving'
  const stage = stages?.find(s => s.id === nodeId)
  if (!stage) return 'pending'
  return stage.status  // 'done' | 'active' | 'pending'
}

function isEdgeLive(edge, stages) {
  const activeId = stages?.find(s => s.status === 'active')?.id
  if (!activeId) return false
  return (
    edge.from === activeId || edge.to === activeId ||
    edge.from === 'researcher' || edge.to === 'researcher'
  )
}

// ── Workflow SVG Visualiser ─────────────────────────────
function WorkflowVisualiser({ stages }) {
  const [hoveredEdge, setHoveredEdge] = useState(null)

  return (
    <div className="workflow-svg-wrap">
      <svg viewBox="0 0 720 440" className="workflow-svg" aria-label="Agent workflow graph">
        <defs>
          <marker id="arr-main" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(200,146,42,0.55)" />
          </marker>
          <marker id="arr-retrieval" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(0,212,200,0.55)" />
          </marker>
          <marker id="arr-feedback" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(200,146,42,0.30)" />
          </marker>
        </defs>

        {/* ── Edges ── */}
        {GRAPH_EDGES.map(edge => {
          const live = isEdgeLive(edge, stages)
          const hovered = hoveredEdge?.id === edge.id
          return (
            <g key={edge.id}
              onMouseEnter={() => setHoveredEdge(edge)}
              onMouseLeave={() => setHoveredEdge(null)}>
              <path
                d={edge.path}
                fill="none"
                strokeWidth={hovered ? 2 : 1.5}
                className={`edge-path edge-${edge.type} ${live ? 'edge-live' : ''}`}
                markerEnd={`url(#arr-${edge.type})`}
              />
              {/* Wide invisible hit area */}
              <path d={edge.path} fill="none" stroke="transparent" strokeWidth="14" />
            </g>
          )
        })}

        {/* ── Nodes ── */}
        {GRAPH_NODES.map(node => {
          const state     = getRunState(node.id, stages)
          const isActive  = state === 'active'
          const isRetriev = state === 'retrieving'
          const isDone    = state === 'done'
          const cx = node.x + node.w / 2

          return (
            <g key={node.id}>
              {/* Pulse ring */}
              {(isActive || isRetriev) && (
                <rect
                  x={node.x - 5} y={node.y - 5}
                  width={node.w + 10} height={node.h + 10}
                  rx="7" fill="none"
                  stroke={isRetriev ? 'var(--cyan)' : 'var(--amber)'}
                  className="node-pulse-ring"
                />
              )}
              {/* Node body */}
              <rect
                x={node.x} y={node.y}
                width={node.w} height={node.h}
                rx="4"
                fill={
                  isActive  ? 'rgba(200,146,42,0.10)' :
                  isRetriev ? 'rgba(0,212,200,0.07)'  :
                  isDone    ? 'rgba(76,175,125,0.08)'  :
                              'rgba(20,20,24,0.90)'
                }
                stroke={
                  isActive  ? 'var(--amber)'    :
                  isRetriev ? 'var(--cyan)'     :
                  isDone    ? 'var(--green)'    :
                              'var(--border-dim)'
                }
                strokeWidth={isActive || isRetriev ? 1.5 : 1}
              />
              {/* Status dot */}
              <circle
                cx={node.x + node.w - 10} cy={node.y + 10} r="4"
                fill={
                  isActive  ? 'var(--amber)' :
                  isRetriev ? 'var(--cyan)'  :
                  isDone    ? 'var(--green)' :
                              '#2a2a32'
                }
                className={isActive || isRetriev ? 'node-dot-pulse' : ''}
              />
              {/* Label */}
              <text
                x={cx - 8} y={node.y + node.h / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`node-label ${isActive ? 'nlabel-active' : ''} ${isRetriev ? 'nlabel-retrieve' : ''} ${isDone ? 'nlabel-done' : ''} ${state === 'pending' ? 'nlabel-pending' : ''}`}
              >
                {node.label}
              </text>
              {/* Done checkmark */}
              {isDone && (
                <text
                  x={node.x + node.w - 22} y={node.y + node.h / 2 + 1}
                  dominantBaseline="middle"
                  className="node-check"
                >✓</text>
              )}
            </g>
          )
        })}

        {/* Section labels */}
        <text x="80"  y="14"  className="graph-section-label">PIPELINE</text>
        <text x="490" y="178" className="graph-section-label">SUPPORT</text>
      </svg>

      {/* Hovered edge tooltip */}
      {hoveredEdge && (
        <div className="edge-tooltip" style={{
          left: `${(hoveredEdge.tip.x / 720) * 100}%`,
          top:  `${(hoveredEdge.tip.y / 440) * 100}%`,
        }}>
          <span className={`edge-tt-type ett-${hoveredEdge.type}`}>
            {hoveredEdge.type.toUpperCase()}
          </span>
          <span className="edge-tt-payload">{hoveredEdge.payload}</span>
        </div>
      )}
    </div>
  )
}

// ── Stage pipeline bar ──────────────────────────────────
function StagePipeline({ stages }) {
  return (
    <div className="stage-pipeline">
      {stages.map((stage, i) => (
        <div key={stage.id} className="stage-item">
          <span className={`stage-chip stage-${stage.status}`}>
            {stage.status === 'done'    && <span className="stage-check">✓</span>}
            {stage.status === 'active'  && <span className="stage-dot stage-dot-active" />}
            {stage.status === 'pending' && <span className="stage-dot stage-dot-pending" />}
            {stage.label}
          </span>
          {i < stages.length - 1 && <span className="stage-arrow">›</span>}
        </div>
      ))}
    </div>
  )
}

// ── LoRA tag ────────────────────────────────────────────
function LoraTag({ name, weight }) {
  return (
    <span className="agent-lora-tag">
      <span className="lora-tag-name">{name}</span>
      <span className="lora-tag-weight">×{weight}</span>
    </span>
  )
}

// ── Single Agent Card ───────────────────────────────────
function AgentCard({ agent, isActive, onConfigure, onTest }) {
  const Icon = AGENT_ICONS[agent.id] || CircleDot
  const isCyan = agent.id === 'researcher'

  return (
    <div className={`agent-card ${isActive ? 'agent-active' : ''} ${isCyan ? 'agent-cyan' : ''}`}>
      <div className="agent-card-head">
        <div className="agent-name-group">
          <Icon size={15} className={isCyan ? 'icon-cyan' : isActive ? 'icon-amber' : 'icon-muted'} />
          <span className="agent-name">{agent.name.toUpperCase()}</span>
        </div>
        <StatusDot
          status={isActive && isCyan ? 'retrieving' : isActive ? 'active' : 'idle'}
          size="sm"
        />
      </div>

      <div className="agent-meta">
        <div className="agent-meta-row">
          <span className="agent-meta-k">FRAMEWORK</span>
          <span className="agent-meta-v">{agent.framework}</span>
        </div>
        <div className="agent-meta-row">
          <span className="agent-meta-k">MODEL</span>
          <span className="agent-meta-v agent-model">{agent.model}</span>
        </div>
      </div>

      <div className="agent-loras">
        {agent.loras.length > 0
          ? agent.loras.map(l => <LoraTag key={l.name} name={l.name} weight={l.weight} />)
          : <span className="agent-no-lora">No LoRA — pure retrieval</span>
        }
      </div>

      <div className="agent-divider" />

      <div className="agent-stats">
        <div className="agent-stat">
          <span className="agent-stat-k">LAST RUN</span>
          <span className="agent-stat-v stat-cyan">{agent.lastRun}</span>
        </div>
        <div className="agent-stat">
          <span className="agent-stat-k">AVG LAT</span>
          <span className="agent-stat-v">{agent.avgLatency}</span>
        </div>
        <div className="agent-stat">
          <span className="agent-stat-k">TOK/RUN</span>
          <span className="agent-stat-v">{agent.tokensPerRun.toLocaleString()}</span>
        </div>
      </div>

      <div className="agent-divider" />

      <div className="agent-prompt">
        <span className="agent-prompt-label">SYSTEM PROMPT</span>
        <p className="agent-prompt-text">{agent.systemPromptExcerpt}</p>
      </div>

      <div className="agent-card-btns">
        <button className="btn-ghost agent-btn" onClick={() => onConfigure(agent)}>
          <Settings size={11} /> CONFIGURE
        </button>
        <button className="btn-ghost agent-btn" onClick={() => onTest(agent)}>
          <Play size={11} /> TEST
        </button>
      </div>
    </div>
  )
}

// ── Config slide-out panel ──────────────────────────────
function AgentConfigPanel({ agent, adapters, onClose }) {
  const llmAdapters = adapters.filter(a => a.type === 'LLM')
  const Icon = AGENT_ICONS[agent.id] || CircleDot

  const [cfg, setCfg] = useState({
    model:       agent.model,
    loras:       agent.loras,
    temperature: agent.temperature,
    maxTokens:   agent.maxTokens,
    topP:        0.9,
    collection:  agent.memory?.collection || 'universe_foundation',
    topK:        agent.memory?.topK || 10,
    systemPrompt: agent.systemPromptExcerpt.replace(
      '...',
      ' You have access to the lore database via RAG retrieval and the Neo4j knowledge graph. Always verify character status before referencing them in generated content.',
    ),
  })

  function toggleLora(name, tier) {
    setCfg(prev => {
      const has = prev.loras.find(l => l.name === name)
      if (has) return { ...prev, loras: prev.loras.filter(l => l.name !== name) }
      return { ...prev, loras: [...prev.loras, { name, weight: 1.0 }] }
    })
  }

  function setLoraWeight(name, weight) {
    setCfg(prev => ({
      ...prev,
      loras: prev.loras.map(l => l.name === name ? { ...l, weight: +weight } : l),
    }))
  }

  return (
    <div className="config-panel">
      <div className="config-head">
        <div className="config-head-title">
          <Icon size={15} className="icon-amber" />
          <span className="config-agent-name">{agent.name.toUpperCase()}</span>
          <span className="config-agent-role">{agent.role}</span>
        </div>
        <button className="config-close" onClick={onClose}><X size={13} /></button>
      </div>

      <div className="config-body">
        {/* Model */}
        <div className="cfg-section">
          <div className="cfg-label"><Zap size={11} className="icon-amber" /> MODEL</div>
          <select className="cfg-select" value={cfg.model}
            onChange={e => setCfg(p => ({ ...p, model: e.target.value }))}>
            {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* LoRA adapters */}
        <div className="cfg-section">
          <div className="cfg-label"><Sliders size={11} className="icon-amber" /> LORA ADAPTERS</div>
          <div className="cfg-lora-list">
            {llmAdapters.map(adapter => {
              const active = cfg.loras.find(l => l.name === adapter.name)
              return (
                <div key={adapter.name} className={`cfg-lora-row ${active ? 'cfg-lora-on' : ''}`}>
                  <label className="cfg-lora-check">
                    <input type="checkbox" checked={!!active}
                      onChange={() => toggleLora(adapter.name)} />
                    <span className="cfg-lora-name">{adapter.name}</span>
                    <span className="cfg-lora-tier">T{adapter.tier}</span>
                  </label>
                  {active && (
                    <div className="cfg-weight-row">
                      <span className="cfg-weight-label">WT</span>
                      <input type="range" min="0.1" max="1.0" step="0.05"
                        value={active.weight}
                        className="cfg-slider"
                        onChange={e => setLoraWeight(adapter.name, e.target.value)} />
                      <span className="cfg-weight-val">{active.weight.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Parameters */}
        <div className="cfg-section">
          <div className="cfg-label"><Sliders size={11} className="icon-amber" /> PARAMETERS</div>
          <div className="cfg-params">
            <div className="cfg-param-row">
              <span className="cfg-param-key">TEMP</span>
              <input type="range" min="0" max="1.5" step="0.05"
                value={cfg.temperature} className="cfg-slider"
                onChange={e => setCfg(p => ({ ...p, temperature: +e.target.value }))} />
              <span className="cfg-param-val">{cfg.temperature.toFixed(2)}</span>
            </div>
            <div className="cfg-param-row">
              <span className="cfg-param-key">MAX TOK</span>
              <input type="range" min="512" max="16384" step="512"
                value={cfg.maxTokens} className="cfg-slider"
                onChange={e => setCfg(p => ({ ...p, maxTokens: +e.target.value }))} />
              <span className="cfg-param-val">{cfg.maxTokens.toLocaleString()}</span>
            </div>
            <div className="cfg-param-row">
              <span className="cfg-param-key">TOP P</span>
              <input type="range" min="0.5" max="1.0" step="0.01"
                value={cfg.topP} className="cfg-slider"
                onChange={e => setCfg(p => ({ ...p, topP: +e.target.value }))} />
              <span className="cfg-param-val">{cfg.topP.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="cfg-section">
          <div className="cfg-label"><Database size={11} className="icon-cyan" /> MEMORY CONFIG</div>
          <div className="cfg-params">
            <div className="cfg-param-row">
              <span className="cfg-param-key">COLLECTION</span>
              <select className="cfg-select cfg-select-sm" value={cfg.collection}
                onChange={e => setCfg(p => ({ ...p, collection: e.target.value }))}>
                {QDRANT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="cfg-param-row">
              <span className="cfg-param-key">TOP K</span>
              <input type="range" min="3" max="30" step="1"
                value={cfg.topK} className="cfg-slider"
                onChange={e => setCfg(p => ({ ...p, topK: +e.target.value }))} />
              <span className="cfg-param-val">{cfg.topK}</span>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="cfg-section cfg-section-grow">
          <div className="cfg-label"><Activity size={11} className="icon-amber" /> SYSTEM PROMPT</div>
          <textarea
            className="cfg-prompt"
            value={cfg.systemPrompt}
            onChange={e => setCfg(p => ({ ...p, systemPrompt: e.target.value }))}
            rows={8}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="config-footer">
        <button className="btn-ghost cfg-footer-btn">
          <RotateCcw size={11} /> RESET
        </button>
        <button className="btn-ghost cfg-footer-btn">
          <Play size={11} /> TEST
        </button>
        <button className="btn-primary cfg-footer-btn">
          <Save size={11} /> SAVE
        </button>
      </div>
    </div>
  )
}

// ── Test Result Banner ──────────────────────────────────
function TestBanner({ agent, onClose }) {
  const latency = (parseFloat(agent.avgLatency) * (0.85 + Math.random() * 0.3)).toFixed(1)
  const tokens  = Math.floor(agent.tokensPerRun * (0.8 + Math.random() * 0.4))

  const output = agent.id === 'showrunner'
    ? 'Directive acknowledged. Initiating S02E04 scene 12 pipeline. Scene Writer assigned with DARKMATTER_S02 + KAEL_VOICE adapters. Lore pre-fetch initiated for Vault-7 context.'
    : agent.id === 'researcher'
    ? '// Qdrant: "Vault-7 location canonical facts" → 7 chunks (avg score: 0.891)\n// Neo4j: MATCH (l:Location {name:"Vault-7"}) → 3 relationships\n// 10 context items prepared for downstream agents'
    : agent.systemPromptExcerpt.replace('...', '') + ' [TEST ✓] All canonical constraints passed. 0 violations detected.'

  return (
    <div className="test-banner">
      <div className="test-banner-head">
        <span className="test-banner-label">TEST — {agent.name.toUpperCase()}</span>
        <div className="test-meta">
          <span className="test-k">LATENCY</span>
          <span className="test-v test-amber">{latency}s</span>
          <span className="test-k">TOKENS</span>
          <span className="test-v">{tokens.toLocaleString()}</span>
          <span className="test-k">STATUS</span>
          <span className="test-v test-green">PASS</span>
        </div>
        <button className="test-close" onClick={onClose}><X size={12} /></button>
      </div>
      <pre className="test-output">{output}</pre>
    </div>
  )
}

// ── Main Agents page ────────────────────────────────────
export default function Agents() {
  const { agents, adapters, generation } = useContext(SystemContext)
  const [configAgent, setConfigAgent]   = useState(null)
  const [testAgent, setTestAgent]       = useState(null)

  const stages   = generation?.active?.stages || []
  const run      = generation?.active
  const activeId = stages.find(s => s.status === 'active')?.id

  function handleConfigure(agent) {
    setTestAgent(null)
    setConfigAgent(prev => (prev?.id === agent.id ? null : agent))
  }

  function handleTest(agent) {
    setConfigAgent(null)
    setTestAgent(prev => (prev?.id === agent.id ? null : agent))
  }

  return (
    <div className="agents-page">

      {/* ── Roster + Config Panel ── */}
      <div className={`roster-section ${configAgent ? 'roster-with-panel' : ''}`}>
        <div className="agents-grid">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={agent.id === activeId || (agent.id === 'researcher' && !!activeId)}
              onConfigure={handleConfigure}
              onTest={handleTest}
            />
          ))}
        </div>

        {configAgent && (
          <AgentConfigPanel
            agent={configAgent}
            adapters={adapters}
            onClose={() => setConfigAgent(null)}
          />
        )}
      </div>

      {/* ── Test banner ── */}
      {testAgent && (
        <TestBanner agent={testAgent} onClose={() => setTestAgent(null)} />
      )}

      {/* ── Workflow Visualiser ── */}
      <div className="workflow-section">
        <div className="workflow-head">
          <div className="workflow-title-row">
            <Activity size={16} className="icon-amber" />
            <span className="section-title">LANGGRAPH WORKFLOW</span>
            {run && <StatusDot status="active" size="sm" label="Live" />}
          </div>

          {run && (
            <div className="run-meta-bar">
              <span className="run-meta-item">
                <span className="run-meta-k">SERIES</span>
                <span className="run-meta-v run-amber">{run.series.toUpperCase()}</span>
              </span>
              <span className="run-sep">·</span>
              <span className="run-meta-item">
                <span className="run-meta-k">S</span>
                <span className="run-meta-v">{run.season}</span>
                <span className="run-meta-k" style={{ marginLeft: 6 }}>E</span>
                <span className="run-meta-v">{run.episode}</span>
              </span>
              <span className="run-sep">·</span>
              <span className="run-meta-item">
                <span className="run-meta-k">SCENE</span>
                <span className="run-meta-v">{run.currentScene}/{run.totalScenes}</span>
              </span>
              <span className="run-sep">·</span>
              <span className="run-meta-item">
                <span className="run-meta-k">STARTED</span>
                <span className="run-meta-v">{run.startedAt}</span>
              </span>
              <span className="run-sep">·</span>
              <span className="run-meta-item">
                <span className="run-meta-k">ELAPSED</span>
                <span className="run-meta-v">
                  {run.elapsedMin}m {String(run.elapsedSec).padStart(2,'0')}s
                </span>
              </span>
            </div>
          )}
        </div>

        {run && (
          <div className="pipeline-bar-wrap">
            <StagePipeline stages={stages} />
          </div>
        )}

        <div className="workflow-body">
          <WorkflowVisualiser stages={stages} />

          {/* Legend */}
          <div className="workflow-legend">
            <div className="legend-row">
              <div className="legend-item">
                <span className="leg-line leg-main" />
                <span className="leg-label">Pipeline</span>
              </div>
              <div className="legend-item">
                <span className="leg-line leg-retrieval" />
                <span className="leg-label">Retrieval</span>
              </div>
              <div className="legend-item">
                <span className="leg-line leg-feedback" />
                <span className="leg-label">Feedback</span>
              </div>
            </div>
            <div className="legend-divider" />
            <div className="legend-row">
              <div className="legend-item">
                <span className="leg-dot leg-done" />
                <span className="leg-label">Done</span>
              </div>
              <div className="legend-item">
                <span className="leg-dot leg-active" />
                <span className="leg-label">Active</span>
              </div>
              <div className="legend-item">
                <span className="leg-dot leg-pending" />
                <span className="leg-label">Pending</span>
              </div>
              <div className="legend-item">
                <span className="leg-dot leg-retrieve" />
                <span className="leg-label">Retrieving</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
