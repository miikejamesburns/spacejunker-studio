import { useContext, useState } from 'react'
import {
  Edit3,
  Terminal,
  LayoutGrid,
  RefreshCw,
  Settings,
  ExternalLink,
  ChevronDown,
  Cpu,
  MemoryStick,
  Thermometer,
  Zap,
  Layers,
  Network,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import ProgressBar from '../components/ui/ProgressBar'
import './Cluster.css'

// Map service status to StatusDot status
function serviceStatusToDot(s) {
  if (s === 'busy')    return 'training'
  if (s === 'running') return 'active'
  if (s === 'idle')    return 'idle'
  if (s === 'error')   return 'error'
  return 'offline'
}

// Node card left-border accent
function nodeAccent(node) {
  if (node.status === 'offline')  return 'grey'
  if (node.status === 'warning' || node.gpuTemp > 80) return 'coral'
  if (node.status === 'busy')     return 'amber'
  return 'green'
}

// Node card label for status
function nodeStatusLabel(node) {
  if (node.status === 'offline')  return 'OFFLINE'
  if (node.status === 'warning')  return 'WARNING'
  if (node.activity === 'training')  return 'TRAINING'
  if (node.activity === 'inferring') return 'INFERRING'
  return 'ONLINE'
}

export default function Cluster() {
  const { nodes, services } = useContext(SystemContext)
  const [nodeFilter, setNodeFilter] = useState('ALL')
  const [hoveredNode, setHoveredNode] = useState(null)

  const nodeOptions = ['ALL', ...nodes.map(n => n.name)]

  const filteredServices = nodeFilter === 'ALL'
    ? services
    : services.filter(s => s.node === nodeFilter)

  return (
    <div className="cluster">

      {/* ── Title ── */}
      <div className="cluster-title-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>Cluster</h1>
          <p className="section-label" style={{ marginTop: 4 }}>
            {nodes.filter(n => n.status !== 'offline').length}/{nodes.length} nodes online · {services.filter(s => s.status === 'running' || s.status === 'busy').length} services active
          </p>
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} />
          REFRESH
        </button>
      </div>

      {/* ── Node Cards (4-column grid) ── */}
      <div className="cluster-nodes-grid">
        {nodes.map(node => {
          const accent = nodeAccent(node)
          const statusLabel = nodeStatusLabel(node)
          const vramPct = Math.round((node.vramUsed / node.vramTotal) * 100)
          const ramPct  = Math.round((node.ramUsed  / node.ramTotal)  * 100)
          const tempAccent = node.gpuTemp > 80 ? 'coral' : node.gpuTemp > 70 ? 'amber' : 'green'

          return (
            <div
              key={node.id}
              className={`card node-card node-accent-${accent}`}
            >
              {/* Header */}
              <div className="node-card-header">
                <div className="node-status-row">
                  <StatusDot
                    status={
                      node.status === 'offline'  ? 'offline'  :
                      node.status === 'warning'  ? 'error'    :
                      node.activity === 'training' ? 'training' : 'active'
                    }
                    size="sm"
                  />
                  <span className={`node-status-label font-mono node-status-${accent}`}>
                    {statusLabel}
                  </span>
                </div>
                <button className="node-edit-btn">
                  <Edit3 size={12} />
                </button>
              </div>

              {/* GPU + Name */}
              <div className="node-title">
                <span className="node-gpu font-mono">{node.gpu}</span>
                <span className="node-name">{node.name}</span>
              </div>

              <div className="node-divider" />

              {/* Resource bars */}
              <div className="node-resources">
                <div className="node-resource-row">
                  <Cpu size={11} color="var(--text-muted)" strokeWidth={1.5} />
                  <span className="node-res-label font-mono">VRAM</span>
                  <span className="node-res-total font-mono">{node.vramTotal} GB</span>
                  <div className="node-res-bar">
                    <ProgressBar
                      value={node.vramUsed}
                      max={node.vramTotal}
                      accent={vramPct > 90 ? 'coral' : vramPct > 75 ? 'amber' : 'green'}
                      size="xs"
                    />
                  </div>
                  <span className={`node-res-pct font-mono ${vramPct > 90 ? 'text-coral' : vramPct > 75 ? 'text-amber' : ''}`}>
                    {vramPct}%
                  </span>
                </div>

                <div className="node-resource-row">
                  <MemoryStick size={11} color="var(--text-muted)" strokeWidth={1.5} />
                  <span className="node-res-label font-mono">RAM</span>
                  <span className="node-res-total font-mono">{node.ramTotal} GB</span>
                  <div className="node-res-bar">
                    <ProgressBar
                      value={node.ramUsed}
                      max={node.ramTotal}
                      accent={ramPct > 90 ? 'coral' : 'cyan'}
                      size="xs"
                    />
                  </div>
                  <span className="node-res-pct font-mono">{ramPct}%</span>
                </div>

                <div className="node-resource-row">
                  <Thermometer size={11} color="var(--text-muted)" strokeWidth={1.5} />
                  <span className="node-res-label font-mono">TEMP</span>
                  <span className="node-res-total font-mono">&nbsp;</span>
                  <div className="node-res-bar">
                    <ProgressBar
                      value={node.gpuTemp}
                      max={100}
                      accent={tempAccent}
                      size="xs"
                    />
                  </div>
                  <span className={`node-res-pct font-mono text-${tempAccent}`}>
                    {node.gpuTemp}°C
                  </span>
                </div>
              </div>

              <div className="node-divider" />

              {/* Service + role info */}
              <div className="node-info-rows">
                <div className="node-info-row">
                  <span className="node-info-key font-mono">ACTIVE SERVICE</span>
                  <span className="node-info-val font-mono text-amber">{node.activeService}</span>
                </div>
                <div className="node-info-row">
                  <Layers size={10} color="var(--text-muted)" />
                  <span className="node-info-key font-mono">LOADED ADAPTERS</span>
                  <span className="node-info-val font-mono">
                    {node.loadedAdapters > 0
                      ? <>{node.loadedAdapters} <span className="text-muted">× LoRA</span></>
                      : <span className="text-muted">—</span>
                    }
                  </span>
                </div>
                <div className="node-info-row">
                  <Zap size={10} color="var(--text-muted)" />
                  <span className="node-info-key font-mono">CURRENT ROLE</span>
                  <span className="node-info-val font-mono">{node.role}</span>
                </div>
              </div>

              <div className="node-divider" />

              {/* Network info */}
              <div className="node-info-rows">
                <div className="node-info-row">
                  <span className="node-info-key font-mono">HOST</span>
                  <span className="node-info-val font-mono text-cyan">{node.host}</span>
                </div>
                <div className="node-info-row">
                  <span className="node-info-key font-mono">PORT</span>
                  <span className="node-info-val font-mono">{node.port}</span>
                </div>
                <div className="node-info-row">
                  <span className="node-info-key font-mono">LITELLM ALIAS</span>
                  <span className="node-info-val font-mono text-amber">{node.litellmAlias}</span>
                </div>
              </div>

              <div className="node-divider" />

              {/* Services chip list */}
              <div className="node-services-chips">
                {node.services.map(svc => (
                  <span key={svc} className="node-svc-chip">{svc}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="node-actions">
                <button className="btn-ghost node-action-btn">
                  <LayoutGrid size={12} />
                  SERVICES
                </button>
                <button className="btn-ghost node-action-btn">
                  <Terminal size={12} />
                  TERMINAL
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Service Status Table ── */}
      <div className="card cluster-services">
        <div className="services-header">
          <div className="services-title-group">
            <span className="section-title" style={{ fontSize: 16 }}>Services</span>
            <span className="section-label">
              {services.filter(s => s.status === 'running' || s.status === 'busy').length} running
            </span>
          </div>
          {/* Node filter */}
          <div className="services-filter">
            {nodeOptions.map(opt => (
              <button
                key={opt}
                className={`services-filter-btn ${nodeFilter === opt ? 'active' : ''}`}
                onClick={() => setNodeFilter(opt)}
              >
                {opt === 'ALL' ? opt : opt.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <table className="services-table">
          <thead>
            <tr>
              <th>SERVICE</th>
              <th>NODE</th>
              <th>PORT</th>
              <th>STATUS</th>
              <th>VERSION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(svc => (
              <tr key={svc.id}>
                <td>
                  <span className="font-mono" style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                    {svc.name}
                  </span>
                </td>
                <td>
                  <span className="font-mono" style={{ fontSize: 11 }}>{svc.node}</span>
                </td>
                <td>
                  <span className="font-mono text-cyan" style={{ fontSize: 11 }}>{svc.port}</span>
                </td>
                <td>
                  <StatusDot status={serviceStatusToDot(svc.status)} label={svc.status.toUpperCase()} size="sm" />
                </td>
                <td>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{svc.version}</span>
                </td>
                <td>
                  <div className="svc-action-group">
                    {svc.actions.map(action => (
                      <button key={action} className="svc-action-btn">
                        {action === 'Open' || action === 'Dashboard' || action === 'Browser'
                          ? <><ExternalLink size={10} /> {action.toUpperCase()}</>
                          : <>{action.toUpperCase()}</>
                        }
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Network Topology ── */}
      <div className="card cluster-topology">
        <div className="topology-header">
          <div className="topology-title-group">
            <Network size={16} color="var(--cyan)" strokeWidth={1.5} />
            <span className="section-title" style={{ fontSize: 16 }}>Network Topology</span>
          </div>
          <span className="section-label">Hover a node to highlight connections</span>
        </div>
        <TopologyDiagram nodes={nodes} />
      </div>

    </div>
  )
}

// ── Topology Diagram ──────────────────────────────────────────────────────
const TOPOLOGY_NODES = [
  { id: 'ubuntu-hub',      x: 160, y: 130, label: 'Ubuntu Hub',    sub: 'RTX A4000',  color: 'var(--cyan)' },
  { id: 'win-workstation', x: 380, y: 60,  label: 'Win Station',   sub: 'RTX 5090',   color: 'var(--amber)' },
  { id: 'laptop',          x: 320, y: 220, label: 'Laptop',        sub: 'RTX 3060',   color: 'var(--green)' },
  { id: 'macbook',         x: 530, y: 150, label: 'MacBook Pro',   sub: 'M1 Max',     color: 'var(--green)' },
]

// Connections: [from, to, thickness (1–4), label]
const TOPOLOGY_EDGES = [
  { from: 'ubuntu-hub', to: 'win-workstation', thickness: 4, label: 'LiteLLM proxy · vLLM' },
  { from: 'ubuntu-hub', to: 'laptop',          thickness: 2, label: 'Ollama overflow' },
  { from: 'ubuntu-hub', to: 'macbook',         thickness: 2, label: 'n8n · LangGraph dev' },
  { from: 'win-workstation', to: 'laptop',     thickness: 1, label: 'LoRA sync' },
  { from: 'win-workstation', to: 'macbook',    thickness: 1, label: 'ComfyUI API' },
]

function TopologyDiagram({ nodes: liveNodes }) {
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const nodeMap = Object.fromEntries(TOPOLOGY_NODES.map(n => [n.id, n]))
  const liveMap  = Object.fromEntries(liveNodes.map(n => [n.id, n]))

  function isEdgeHighlighted(edge) {
    if (!hovered) return true
    return edge.from === hovered || edge.to === hovered
  }

  function isNodeHighlighted(nodeId) {
    if (!hovered) return true
    if (nodeId === hovered) return true
    return TOPOLOGY_EDGES.some(
      e => (e.from === hovered && e.to === nodeId) || (e.to === hovered && e.from === nodeId)
    )
  }

  return (
    <div className="topology-wrap">
      <svg
        width="100%"
        viewBox="0 0 700 290"
        className="topology-svg"
        onClick={() => setHovered(null)}
      >
        <defs>
          {/* Animated gradient for active connections */}
          <linearGradient id="edge-grad-active" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--amber)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="edge-grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {TOPOLOGY_EDGES.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to   = nodeMap[edge.to]
          const highlighted = isEdgeHighlighted(edge)
          const strokeW = edge.thickness * 1.5

          return (
            <g key={i} className="topology-edge">
              {/* Base line */}
              <line
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={highlighted ? 'rgba(200,146,42,0.3)' : 'rgba(200,146,42,0.06)'}
                strokeWidth={strokeW}
                strokeLinecap="round"
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              {/* Animated data flow dash */}
              {highlighted && (
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x}   y2={to.y}
                  stroke="var(--amber)"
                  strokeWidth={strokeW * 0.6}
                  strokeLinecap="round"
                  strokeDasharray={`${edge.thickness * 6} ${edge.thickness * 18}`}
                  opacity={0.6}
                  style={{
                    animation: `topology-flow ${2.5 - edge.thickness * 0.3}s linear infinite`,
                    filter: 'drop-shadow(0 0 3px rgba(200,146,42,0.6))',
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {TOPOLOGY_NODES.map(tnode => {
          const live      = liveMap[tnode.id]
          const highlight = isNodeHighlighted(tnode.id)
          const isActive  = hovered === tnode.id
          const accent    = live
            ? (live.status === 'busy' ? 'var(--amber)' : live.status === 'warning' ? 'var(--coral)' : 'var(--green)')
            : 'var(--text-muted)'
          const r         = isActive ? 30 : 26

          return (
            <g
              key={tnode.id}
              className="topology-node"
              style={{
                cursor: 'pointer',
                opacity: highlight ? 1 : 0.3,
                transition: 'opacity 0.2s',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setHovered(hovered === tnode.id ? null : tnode.id)
              }}
            >
              {/* Outer glow ring */}
              {isActive && (
                <circle
                  cx={tnode.x} cy={tnode.y} r={r + 8}
                  fill="none"
                  stroke={accent}
                  strokeWidth={1}
                  opacity={0.3}
                  style={{ animation: 'topology-ring-pulse 2s ease-in-out infinite' }}
                />
              )}
              {/* Body */}
              <circle
                cx={tnode.x} cy={tnode.y} r={r}
                fill="#1a1a1f"
                stroke={accent}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${accent})` : 'none', transition: 'all 0.2s' }}
              />
              {/* Status dot */}
              <circle
                cx={tnode.x + r - 6}
                cy={tnode.y - r + 6}
                r={4}
                fill={accent}
                style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
              />
              {/* Label */}
              <text
                x={tnode.x} y={tnode.y - 4}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="10"
                fontFamily="Space Mono, monospace"
                fontWeight="400"
                letterSpacing="0.5"
                style={{ textTransform: 'uppercase' }}
              >
                {tnode.label.split(' ')[0]}
              </text>
              <text
                x={tnode.x} y={tnode.y + 8}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="8"
                fontFamily="Space Mono, monospace"
              >
                {tnode.sub}
              </text>

              {/* VRAM label below node */}
              {live && (
                <text
                  x={tnode.x} y={tnode.y + r + 16}
                  textAnchor="middle"
                  fill={accent}
                  fontSize="9"
                  fontFamily="Space Mono, monospace"
                >
                  {live.vramUsed.toFixed(1)}/{live.vramTotal}GB
                </text>
              )}
            </g>
          )
        })}

        {/* Edge label on hover */}
        {hovered && TOPOLOGY_EDGES
          .filter(e => e.from === hovered || e.to === hovered)
          .map((edge, i) => {
            const from = nodeMap[edge.from]
            const to   = nodeMap[edge.to]
            const mx   = (from.x + to.x) / 2
            const my   = (from.y + to.y) / 2 - 10
            return (
              <g key={i}>
                <rect
                  x={mx - edge.label.length * 2.8}
                  y={my - 8}
                  width={edge.label.length * 5.6}
                  height={14}
                  rx="3"
                  fill="rgba(13,13,15,0.9)"
                  stroke="var(--border)"
                />
                <text
                  x={mx} y={my + 2}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="8"
                  fontFamily="Space Mono, monospace"
                >
                  {edge.label}
                </text>
              </g>
            )
          })
        }
      </svg>

      {/* Legend */}
      <div className="topology-legend">
        <span className="topology-legend-item">
          <span className="topo-leg-line topo-leg-thick" />
          High traffic
        </span>
        <span className="topology-legend-item">
          <span className="topo-leg-line topo-leg-thin" />
          Low traffic
        </span>
        <span className="topology-legend-item">
          <span className="topo-leg-dot" style={{ background: 'var(--green)' }} />
          Online / idle
        </span>
        <span className="topology-legend-item">
          <span className="topo-leg-dot" style={{ background: 'var(--amber)' }} />
          Online / busy
        </span>
      </div>
    </div>
  )
}
