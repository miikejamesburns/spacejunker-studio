import { useContext, useEffect, useRef, useState } from 'react'
import {
  Play,
  Plus,
  Zap,
  RefreshCw,
  GitBranch,
  ChevronRight,
  Activity,
  Cpu,
  Database,
  Layers,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import MetricCard from '../components/ui/MetricCard'
import ProgressBar from '../components/ui/ProgressBar'
import LogFeed from '../components/ui/LogFeed'
import './Overview.css'

export default function Overview() {
  const {
    nodes,
    systemStatus,
    activityLog,
    qdrantStats,
    neo4jStats,
    adapters,
    training,
    generation,
    series,
  } = useContext(SystemContext)

  const totalVram  = nodes.reduce((s, n) => s + n.vramTotal, 0)
  const usedVram   = nodes.reduce((s, n) => s + n.vramUsed,  0)
  const totalRam   = nodes.reduce((s, n) => s + n.ramTotal,  0)
  const usedRam    = nodes.reduce((s, n) => s + n.ramUsed,   0)
  const loreCoverage = 76

  const activeAdapters = adapters.filter(
    a => a.status === 'active' || a.status === 'merged' || a.status === 'loaded'
  ).length

  return (
    <div className="overview">

      {/* ── Page Title ── */}
      <div className="overview-title-row">
        <h1 className="section-title" style={{ fontSize: 22 }}>Mission Control</h1>
        <div className="overview-title-meta">
          <StatusDot status="active" label="ALL SYSTEMS NOMINAL" />
        </div>
      </div>

      {/* ── Health Cards (row of 4) ── */}
      <div className="overview-health-grid">

        {/* 1. COMPUTE */}
        <div className="card health-card">
          <div className="health-card-header">
            <div className="health-card-title-group">
              <Cpu size={14} color="var(--amber)" strokeWidth={1.5} />
              <span className="section-label">Compute</span>
            </div>
            <StatusDot
              status={nodes.some(n => n.status === 'busy') ? 'training' : 'active'}
              size="sm"
            />
          </div>

          <div className="health-card-value font-mono">
            {usedVram.toFixed(1)}
            <span className="health-unit"> / {totalVram} GB VRAM</span>
          </div>

          <div className="health-nodes">
            {nodes.map(node => {
              const pct = Math.round((node.vramUsed / node.vramTotal) * 100)
              const accent = node.status === 'busy' ? 'amber' : node.status === 'warning' ? 'coral' : 'green'
              return (
                <div key={node.id} className="health-node-row">
                  <span className="health-node-name" title={node.name}>{node.gpu}</span>
                  <ProgressBar value={node.vramUsed} max={node.vramTotal} accent={accent} size="xs" />
                  <span className={`health-node-pct font-mono text-${accent}`}>{pct}%</span>
                </div>
              )
            })}
          </div>

          <div className="health-divider" />

          <div className="health-row-stat">
            <span className="section-label">System RAM</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {usedRam.toFixed(0)} / {totalRam} GB
            </span>
          </div>
          <ProgressBar value={usedRam} max={totalRam} accent="cyan" size="xs" />
        </div>

        {/* 2. MEMORY LAYER */}
        <div className="card health-card">
          <div className="health-card-header">
            <div className="health-card-title-group">
              <Database size={14} color="var(--cyan)" strokeWidth={1.5} />
              <span className="section-label">Memory Layer</span>
            </div>
            <StatusDot status="retrieving" size="sm" />
          </div>

          <div className="health-memory-stats">
            <div className="health-mem-block">
              <span className="health-mem-label">QDRANT</span>
              <span className="health-mem-value font-mono text-cyan">
                {qdrantStats.totalVectors.toLocaleString()}
              </span>
              <span className="health-mem-sub">vectors · {qdrantStats.totalCollections} collections</span>
              <div className="health-mem-bar">
                <div
                  className="health-mem-bar-fill"
                  style={{ width: `${Math.min(100, (qdrantStats.totalVectors / 25000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="health-divider" />

            <div className="health-mem-block">
              <span className="health-mem-label">NEO4J</span>
              <span className="health-mem-value font-mono text-cyan">
                {neo4jStats.nodes.toLocaleString()}
              </span>
              <span className="health-mem-sub">nodes · {neo4jStats.relationships.toLocaleString()} relationships</span>
              <div className="health-mem-bar">
                <div
                  className="health-mem-bar-fill"
                  style={{ width: `${Math.min(100, (neo4jStats.nodes / 2000) * 100)}%`, background: 'var(--cyan)' }}
                />
              </div>
            </div>

            <div className="health-divider" />

            <div className="health-row-stat">
              <span className="section-label">RAM Usage</span>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--cyan-dim)' }}>
                {qdrantStats.ramUsage}
              </span>
            </div>
            <div className="health-row-stat">
              <span className="section-label">Disk</span>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {qdrantStats.diskUsage}
              </span>
            </div>
          </div>
        </div>

        {/* 3. LORE COVERAGE */}
        <div className="card health-card">
          <div className="health-card-header">
            <div className="health-card-title-group">
              <Activity size={14} color="var(--amber)" strokeWidth={1.5} />
              <span className="section-label">Lore Coverage</span>
            </div>
            <StatusDot status="idle" size="sm" />
          </div>

          <div className="health-arc-container">
            <ArcProgress value={loreCoverage} />
            <div className="health-arc-label">
              <span className="health-arc-pct font-mono">{loreCoverage}%</span>
              <span className="section-label" style={{ fontSize: 9 }}>entities embedded</span>
            </div>
          </div>

          <div className="health-divider" />

          <div className="health-coverage-breakdown">
            {[
              { label: 'Characters', pct: 89 },
              { label: 'Locations',  pct: 72 },
              { label: 'Events',     pct: 61 },
              { label: 'Factions',   pct: 94 },
            ].map(({ label, pct }) => (
              <div key={label} className="health-coverage-row">
                <span className="health-node-name">{label}</span>
                <ProgressBar value={pct} max={100} accent="amber" size="xs" />
                <span className="health-node-pct font-mono">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ADAPTER STATUS */}
        <div className="card health-card">
          <div className="health-card-header">
            <div className="health-card-title-group">
              <Layers size={14} color="var(--amber)" strokeWidth={1.5} />
              <span className="section-label">Adapter Status</span>
            </div>
            <StatusDot status="active" size="sm" />
          </div>

          <div className="health-card-value font-mono">
            {activeAdapters}
            <span className="health-unit"> / {adapters.length} active</span>
          </div>

          <div className="health-adapter-bars">
            {['LLM', 'FLUX', 'WAN2.2'].map(type => {
              const total  = adapters.filter(a => a.type === type).length
              const active = adapters.filter(
                a => a.type === type && (a.status === 'active' || a.status === 'merged')
              ).length
              const training = adapters.filter(a => a.type === type && a.status === 'training').length
              return (
                <div key={type} className="health-adapter-row">
                  <span className="health-node-name">{type}</span>
                  <ProgressBar value={active} max={Math.max(total, 1)} accent="amber" size="xs" />
                  <span className="health-node-pct font-mono">
                    {active}<span className="text-muted">/{total}</span>
                  </span>
                  {training > 0 && (
                    <span className="tag tag-amber" style={{ fontSize: 9, padding: '1px 4px' }}>
                      {training} TRNG
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="health-divider" />

          {/* Tier breakdown */}
          <div className="health-tier-row">
            <span className="tag tag-amber" style={{ fontSize: 9 }}>T1 UNIVERSE</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>
              {adapters.filter(a => a.tier === 1).length}
            </span>
          </div>
          <div className="health-tier-row">
            <span className="tag tag-muted" style={{ fontSize: 9 }}>T2 SERIES</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {adapters.filter(a => a.tier === 2).length}
            </span>
          </div>
          <div className="health-tier-row">
            <span className="tag tag-muted" style={{ fontSize: 9 }}>T3 CHARACTER</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {adapters.filter(a => a.tier === 3).length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body: 60 / 40 split ── */}
      <div className="overview-body">

        {/* ── LEFT: Activity Feed ── */}
        <div className="card overview-feed">
          <div className="feed-header">
            <div className="feed-title-group">
              <span className="section-title" style={{ fontSize: 16 }}>Activity Feed</span>
              <span className="tag tag-amber" style={{ fontSize: 9 }}>LIVE</span>
            </div>
          </div>
          <LogFeed entries={activityLog} maxHeight={520} />
        </div>

        {/* ── RIGHT: Actions + Status ── */}
        <div className="overview-right">

          {/* Quick Actions */}
          <div className="card overview-panel">
            <span className="section-label" style={{ marginBottom: 14, display: 'block' }}>
              Quick Actions
            </span>
            <div className="actions-list">
              <button className="btn-action">
                <Play size={14} />
                START GENERATION RUN
              </button>
              <button className="btn-action">
                <Plus size={14} />
                NEW SERIES
              </button>
              <button className="btn-action ghost">
                <Zap size={14} />
                TRIGGER LORA RETRAIN
              </button>
              <button className="btn-action ghost">
                <RefreshCw size={14} />
                REFRESH VECTOR INDEX
              </button>
              <button className="btn-action ghost">
                <GitBranch size={14} />
                REBUILD KNOWLEDGE GRAPH
              </button>
            </div>
          </div>

          {/* Active Generation Run */}
          {generation.active && (
            <div className="card overview-panel">
              <div className="panel-header">
                <span className="section-label">Active Run</span>
                <StatusDot status="retrieving" size="sm" />
              </div>
              <div className="run-meta">
                <span className="font-mono run-series">
                  {generation.active.series}
                </span>
                <span className="run-episode font-mono">
                  S{generation.active.season}E{generation.active.episode} · SCENE {generation.active.currentScene}/{generation.active.totalScenes}
                </span>
              </div>

              {/* Stage pipeline */}
              <div className="run-stages">
                {generation.active.stages.map((stage, i) => (
                  <div key={stage.id} className="run-stage">
                    <span className={`run-stage-dot dot-stage-${stage.status}`} />
                    <span className={`run-stage-label ${stage.status === 'active' ? 'active' : ''}`}>
                      {stage.label}
                    </span>
                    {i < generation.active.stages.length - 1 && (
                      <ChevronRight size={10} color="var(--text-muted)" />
                    )}
                  </div>
                ))}
              </div>

              {/* Token progress */}
              <div className="run-tokens">
                <span className="section-label">Tokens</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>
                  {generation.active.tokensGenerated.toLocaleString()} / ~{generation.active.tokensEstimated.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={generation.active.tokensGenerated}
                max={generation.active.tokensEstimated}
                accent="amber"
                size="xs"
              />

              <div className="run-footer">
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {generation.active.ragQueries} RAG · {generation.active.neo4jChecks} GRAPH
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {generation.active.stageElapsed}
                </span>
              </div>
            </div>
          )}

          {/* Active Training */}
          {training.active && (
            <div className="card overview-panel">
              <div className="panel-header">
                <span className="section-label">Active Training</span>
                <StatusDot status="training" size="sm" />
              </div>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--amber)', display: 'block', marginBottom: 8 }}>
                {training.active.name}
              </span>
              <div className="run-tokens">
                <span className="section-label">
                  Epoch {training.active.currentEpoch}/{training.active.epochs} · Step {training.active.currentStep}
                </span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>
                  loss {training.active.currentTrainLoss}
                </span>
              </div>
              <ProgressBar
                value={training.active.currentStep}
                max={training.active.totalSteps}
                accent="amber"
                size="xs"
              />
              <div className="run-footer" style={{ marginTop: 8 }}>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {training.active.elapsedMin}m {training.active.elapsedSec}s elapsed
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  ETA ~{training.active.etaMin}min
                </span>
              </div>
            </div>
          )}

          {/* Cluster node status */}
          <div className="card overview-panel">
            <span className="section-label" style={{ marginBottom: 10, display: 'block' }}>
              Cluster Nodes
            </span>
            {nodes.map(node => (
              <div key={node.id} className="mini-node">
                <StatusDot
                  status={
                    node.status === 'busy'    ? 'training' :
                    node.status === 'warning' ? 'error'    : 'active'
                  }
                  size="sm"
                />
                <div className="mini-node-info">
                  <span className="mini-node-name">{node.gpu}</span>
                  <span className="mini-node-role">{node.role}</span>
                </div>
                <div className="mini-node-stats">
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {node.vramUsed.toFixed(1)}/{node.vramTotal}GB
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: node.gpuTemp > 75 ? 'var(--coral)' : 'var(--text-muted)' }}>
                    {node.gpuTemp}°C
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Series */}
          <div className="card overview-panel">
            <span className="section-label" style={{ marginBottom: 10, display: 'block' }}>
              Active Series
            </span>
            {series.filter(s => s.status === 'active').map(s => (
              <div key={s.id} className="mini-series">
                <div className="mini-series-header">
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {s.title}
                  </span>
                  <span
                    className={`mini-series-score font-mono ${
                      s.consistencyScore < 80 ? 'text-coral' :
                      s.consistencyScore < 90 ? 'text-amber' : 'text-green'
                    }`}
                  >
                    {s.consistencyScore}%
                  </span>
                </div>
                <span className="section-label" style={{ fontSize: 9 }}>
                  {s.episodesGenerated} episodes · {s.characters} characters
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Arc Progress ──────────────────────────────────────────
function ArcProgress({ value }) {
  const r           = 38
  const strokeWidth = 7
  const cx          = 54
  const cy          = 54
  // Draw a semicircle arc from bottom-left to bottom-right
  const startX = cx - r
  const startY = cy
  const endX   = cx + r
  const endY   = cy
  const circumference = Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width="108" height="62" viewBox="0 0 108 62">
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map(tick => {
        const angle = Math.PI + (tick / 100) * Math.PI
        const tx = cx + (r + 10) * Math.cos(angle)
        const ty = cy + (r + 10) * Math.sin(angle)
        return (
          <text
            key={tick}
            x={tx}
            y={ty}
            fill="rgba(200,146,42,0.25)"
            fontSize="6"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Space Mono, monospace"
          >
            {tick}
          </text>
        )
      })}
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
        fill="none"
        stroke="rgba(200,146,42,0.08)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
        fill="none"
        stroke="var(--amber)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
          filter: 'drop-shadow(0 0 5px rgba(200,146,42,0.55))',
        }}
      />
    </svg>
  )
}
