import { useContext, useState, useMemo } from 'react'
import {
  Search, X, ChevronUp, ChevronDown, ArrowUpDown,
  Zap, ExternalLink, Download, Trash2, Edit3,
  Play, Save, CheckCircle, AlertTriangle, Info,
  ChevronRight, MoveUp, MoveDown,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import ProgressBar from '../components/ui/ProgressBar'
import './AdapterVault.css'

// ── Tier badge config ──
const TIER_CONFIG = {
  1: { label: 'T1 UNIVERSE', cls: 'tier-1' },
  2: { label: 'T2 SERIES',   cls: 'tier-2' },
  3: { label: 'T3 CHARACTER',cls: 'tier-3' },
}

// ── Status config ──
const STATUS_CONFIG = {
  merged:   { dot: 'active',   label: 'MERGED',   cls: 'status-merged' },
  active:   { dot: 'active',   label: 'ACTIVE',   cls: 'status-active' },
  loaded:   { dot: 'idle',     label: 'LOADED',   cls: 'status-loaded' },
  training: { dot: 'training', label: 'TRAINING', cls: 'status-training' },
  idle:     { dot: 'idle',     label: 'IDLE',     cls: 'status-idle' },
}

// ── VRAM cost calculation ──
const BASE_VRAM = { 'Qwen2.5-14B': 6.8, 'FLUX.1-dev': 14.2, 'Wan2.2-T2V-14B': 7.1 }
const KV_CACHE  = 2.0
function loraVram(rank) {
  if (rank >= 64) return 0.34
  if (rank >= 32) return 0.17
  if (rank >= 16) return 0.09
  return 0.04
}

// ── Preset composition scenarios ──
const PRESETS = [
  {
    id: 'kael-dialogue',
    label: 'Scene Writer — Kael Theron dialogue',
    baseModel: 'Qwen2.5-14B',
    stack: [
      { adapterId: 'universe_voice',     weight: 1.0, locked: true },
      { adapterId: 'darkmatter_s02',     weight: 1.0, locked: false },
      { adapterId: 'kael_theron_voice',  weight: 0.7, locked: false },
    ],
  },
  {
    id: 'sera-dialogue',
    label: 'Scene Writer — Sera Vance dialogue',
    baseModel: 'Qwen2.5-14B',
    stack: [
      { adapterId: 'universe_voice',    weight: 1.0, locked: true },
      { adapterId: 'darkmatter_s02',    weight: 1.0, locked: false },
      { adapterId: 'sera_vance_voice',  weight: 0.7, locked: false },
    ],
  },
  {
    id: 'head-writer',
    label: 'Head Writer — arc planning',
    baseModel: 'Qwen2.5-14B',
    stack: [
      { adapterId: 'universe_voice',  weight: 1.0, locked: true },
      { adapterId: 'darkmatter_s02',  weight: 1.0, locked: false },
    ],
  },
  {
    id: 'visual-kael',
    label: 'Visual — Kael identity',
    baseModel: 'FLUX.1-dev',
    stack: [
      { adapterId: 'darkmatter_style', weight: 0.55, locked: false },
      { adapterId: 'kael_identity',    weight: 0.85, locked: false },
    ],
  },
]

export default function AdapterVault() {
  const { adapters } = useContext(SystemContext)

  const [tab,           setTab]           = useState('registry')
  const [search,        setSearch]        = useState('')
  const [typeFilter,    setTypeFilter]    = useState('ALL')
  const [tierFilter,    setTierFilter]    = useState('ALL')
  const [statusFilter,  setStatusFilter]  = useState('ALL')
  const [sortCol,       setSortCol]       = useState('name')
  const [sortDir,       setSortDir]       = useState('asc')
  const [selectedId,    setSelectedId]    = useState(null)
  const [presetIdx,     setPresetIdx]     = useState(0)
  const [compStack,     setCompStack]     = useState(PRESETS[0].stack)
  const [compBase,      setCompBase]      = useState(PRESETS[0].baseModel)

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = [...adapters]
    if (search)               list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'ALL') list = list.filter(a => a.type === typeFilter)
    if (tierFilter !== 'ALL') list = list.filter(a => a.tier === Number(tierFilter))
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter)

    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return list
  }, [adapters, search, typeFilter, tierFilter, statusFilter, sortCol, sortDir])

  const selected = adapters.find(a => a.id === selectedId) ?? null

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function SortIcon({ col }) {
    if (sortCol !== col) return <ArrowUpDown size={11} className="sort-icon-idle" />
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  // ── Preset selection ──
  function selectPreset(idx) {
    setPresetIdx(idx)
    setCompStack(JSON.parse(JSON.stringify(PRESETS[idx].stack)))
    setCompBase(PRESETS[idx].baseModel)
  }

  // ── Comp stack helpers ──
  function setWeight(idx, val) {
    setCompStack(prev => prev.map((item, i) => i === idx ? { ...item, weight: val } : item))
  }
  function moveUp(idx) {
    if (idx === 0) return
    setCompStack(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }
  function moveDown(idx) {
    setCompStack(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }
  function removeFromStack(idx) {
    setCompStack(prev => prev.filter((_, i) => i !== idx))
  }
  function addToStack(adapterId) {
    if (compStack.find(s => s.adapterId === adapterId)) return
    setCompStack(prev => [...prev, { adapterId, weight: 1.0, locked: false }])
  }

  // ── VRAM calculation ──
  const baseVram  = BASE_VRAM[compBase] ?? 6.8
  const loraItems = compStack.map(s => {
    const a = adapters.find(x => x.id === s.adapterId)
    return { name: s.adapterId, rank: a?.rank ?? 32, vram: loraVram(a?.rank ?? 32) }
  })
  const totalVram  = baseVram + loraItems.reduce((sum, l) => sum + l.vram, 0) + KV_CACHE
  const totalWeight = compStack.reduce((sum, s) => sum + s.weight, 0)
  const vramWarning   = totalVram > 28
  const weightWarning = totalWeight > 1.5

  return (
    <div className="vault">

      {/* ── Title ── */}
      <div className="vault-title-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>Adapter Vault</h1>
          <p className="section-label" style={{ marginTop: 4 }}>
            {adapters.length} adapters registered · {adapters.filter(a => a.servedInVLLM).length} served in vLLM
          </p>
        </div>
        <div className="vault-tabs">
          <button className={`vault-tab ${tab === 'registry' ? 'active' : ''}`} onClick={() => setTab('registry')}>
            REGISTRY
          </button>
          <button className={`vault-tab ${tab === 'composition' ? 'active' : ''}`} onClick={() => setTab('composition')}>
            COMPOSITION PLANNER
          </button>
        </div>
      </div>

      {tab === 'registry' && (
        <div className={`vault-registry ${selected ? 'with-panel' : ''}`}>

          {/* ── Main Table Area ── */}
          <div className="vault-main">
            {/* Filter bar */}
            <div className="vault-filters">
              <div className="vault-search-wrap">
                <Search size={13} color="var(--text-muted)" />
                <input
                  className="vault-search"
                  placeholder="Search adapters..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="vault-search-clear" onClick={() => setSearch('')}>
                    <X size={11} />
                  </button>
                )}
              </div>

              <FilterPills
                value={typeFilter}
                onChange={setTypeFilter}
                options={['ALL', 'LLM', 'FLUX', 'WAN2.2']}
                label="TYPE"
              />
              <FilterPills
                value={tierFilter}
                onChange={setTierFilter}
                options={['ALL', '1', '2', '3']}
                labels={{ ALL: 'ALL TIERS', '1': 'T1 UNIVERSE', '2': 'T2 SERIES', '3': 'T3 CHARACTER' }}
                label="TIER"
              />
              <FilterPills
                value={statusFilter}
                onChange={setStatusFilter}
                options={['ALL', 'merged', 'active', 'loaded', 'training']}
                labels={{ ALL: 'ALL STATUS', merged: 'MERGED', active: 'ACTIVE', loaded: 'LOADED', training: 'TRAINING' }}
                label="STATUS"
              />

              <span className="vault-count font-mono">
                {filtered.length} <span className="text-muted">/ {adapters.length}</span>
              </span>
            </div>

            {/* Table */}
            <div className="card vault-table-wrap">
              <table className="vault-table">
                <thead>
                  <tr>
                    {[
                      { col: 'name',        label: 'NAME' },
                      { col: 'type',        label: 'TYPE' },
                      { col: 'modelBase',   label: 'MODEL BASE' },
                      { col: 'rank',        label: 'RANK' },
                      { col: 'tier',        label: 'TIER' },
                      { col: 'status',      label: 'STATUS' },
                      { col: 'size',        label: 'SIZE' },
                      { col: 'lastTrained', label: 'LAST TRAINED' },
                    ].map(({ col, label }) => (
                      <th key={col} onClick={() => handleSort(col)} className="sortable-th">
                        {label} <SortIcon col={col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(adapter => {
                    const tier   = TIER_CONFIG[adapter.tier]
                    const status = STATUS_CONFIG[adapter.status] ?? STATUS_CONFIG.idle
                    const isSel  = selectedId === adapter.id

                    return (
                      <tr
                        key={adapter.id}
                        className={`vault-row ${isSel ? 'vault-row-selected' : ''}`}
                        onClick={() => setSelectedId(isSel ? null : adapter.id)}
                      >
                        <td>
                          <span className="vault-adapter-name font-mono">{adapter.name}</span>
                          {adapter.servedInVLLM && (
                            <span className="vault-vllm-badge">vLLM</span>
                          )}
                        </td>
                        <td>
                          <span className={`tag vault-type-tag vault-type-${adapter.type.toLowerCase().replace('.', '')}`}>
                            {adapter.type}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontSize: 11 }}>{adapter.modelBase}</span>
                        </td>
                        <td>
                          <span className="font-mono text-amber" style={{ fontSize: 11 }}>r={adapter.rank}</span>
                        </td>
                        <td>
                          <span className={`tag vault-tier-badge ${tier?.cls}`}>{tier?.label}</span>
                        </td>
                        <td>
                          <div className="vault-status-cell">
                            <StatusDot status={status.dot} size="sm" />
                            <span className={`font-mono vault-status-text ${status.cls}`}>{status.label}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {adapter.size ?? '—'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {adapter.lastTrained ?? <span className="text-amber">TRAINING…</span>}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Detail Panel (slide-in) ── */}
          <div className={`vault-detail-panel ${selected ? 'open' : ''}`}>
            {selected && <AdapterDetail adapter={selected} onClose={() => setSelectedId(null)} />}
          </div>

        </div>
      )}

      {tab === 'composition' && (
        <CompositionPlanner
          adapters={adapters}
          presets={PRESETS}
          presetIdx={presetIdx}
          compStack={compStack}
          compBase={compBase}
          baseVram={baseVram}
          loraItems={loraItems}
          totalVram={totalVram}
          totalWeight={totalWeight}
          vramWarning={vramWarning}
          weightWarning={weightWarning}
          onSelectPreset={selectPreset}
          onSetWeight={setWeight}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onRemove={removeFromStack}
          onAdd={addToStack}
        />
      )}
    </div>
  )
}

// ── Filter Pills ──────────────────────────────────────────────────────────
function FilterPills({ value, onChange, options, labels = {}, label }) {
  return (
    <div className="filter-pills">
      {options.map(opt => (
        <button
          key={opt}
          className={`filter-pill ${value === opt ? 'active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {labels[opt] ?? opt}
        </button>
      ))}
    </div>
  )
}

// ── Adapter Detail Panel ──────────────────────────────────────────────────
function AdapterDetail({ adapter, onClose }) {
  const tier   = TIER_CONFIG[adapter.tier]
  const status = STATUS_CONFIG[adapter.status] ?? STATUS_CONFIG.idle

  return (
    <div className="detail-inner">
      <div className="detail-header">
        <div className="detail-title-group">
          <span className={`tag vault-tier-badge ${tier?.cls}`}>{tier?.label}</span>
          <span className="detail-type font-mono">{adapter.type}</span>
        </div>
        <button className="detail-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <h2 className="detail-name font-mono">{adapter.name}</h2>
      <p className="detail-desc">{adapter.description}</p>

      <div className="detail-divider" />

      {/* Core config */}
      <div className="detail-section-label">Configuration</div>
      <div className="detail-grid">
        <div className="detail-kv">
          <span className="detail-k">BASE MODEL</span>
          <span className="detail-v font-mono">{adapter.modelBase}</span>
        </div>
        <div className="detail-kv">
          <span className="detail-k">RANK</span>
          <span className="detail-v font-mono text-amber">r={adapter.rank}</span>
        </div>
        <div className="detail-kv">
          <span className="detail-k">ALPHA</span>
          <span className="detail-v font-mono">{adapter.alpha}</span>
        </div>
        <div className="detail-kv">
          <span className="detail-k">DROPOUT</span>
          <span className="detail-v font-mono">{adapter.dropout}</span>
        </div>
        {adapter.triggerWord && (
          <div className="detail-kv">
            <span className="detail-k">TRIGGER WORD</span>
            <span className="detail-v font-mono text-amber">{adapter.triggerWord}</span>
          </div>
        )}
        <div className="detail-kv">
          <span className="detail-k">FILE PATH</span>
          <span className="detail-v font-mono" style={{ fontSize: 10 }}>{adapter.filePath}</span>
        </div>
        <div className="detail-kv">
          <span className="detail-k">GGUF EXPORT</span>
          <span className={`detail-v font-mono ${adapter.ggufExport ? 'text-green' : 'text-muted'}`}>
            {adapter.ggufExport ? '✓ Available' : '—'}
          </span>
        </div>
        <div className="detail-kv">
          <span className="detail-k">SIZE</span>
          <span className="detail-v font-mono">{adapter.size ?? '—'}</span>
        </div>
      </div>

      {adapter.trainLoss != null && (
        <>
          <div className="detail-divider" />
          <div className="detail-section-label">Training</div>
          <div className="detail-grid">
            <div className="detail-kv">
              <span className="detail-k">DATE</span>
              <span className="detail-v font-mono">{adapter.lastTrained ?? 'In progress'}</span>
            </div>
            <div className="detail-kv">
              <span className="detail-k">DURATION</span>
              <span className="detail-v font-mono">{adapter.trainDuration ?? '—'}</span>
            </div>
            <div className="detail-kv">
              <span className="detail-k">DATASET</span>
              <span className="detail-v font-mono">{adapter.datasetSize?.toLocaleString()} pairs</span>
            </div>
            <div className="detail-kv">
              <span className="detail-k">EPOCHS</span>
              <span className="detail-v font-mono">{adapter.epochs}</span>
            </div>
            <div className="detail-kv">
              <span className="detail-k">TRAIN LOSS</span>
              <span className="detail-v font-mono text-amber">{adapter.trainLoss}</span>
            </div>
            <div className="detail-kv">
              <span className="detail-k">EVAL LOSS</span>
              <span className="detail-v font-mono">{adapter.evalLoss}</span>
            </div>
          </div>

          {/* Mini loss bar */}
          <div className="detail-loss-bars">
            <div className="detail-loss-row">
              <span className="detail-k">TRAIN LOSS</span>
              <ProgressBar value={Math.max(0, 2 - adapter.trainLoss)} max={2} accent="amber" size="xs" />
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--amber)', width: 36, textAlign: 'right' }}>
                {adapter.trainLoss}
              </span>
            </div>
            <div className="detail-loss-row">
              <span className="detail-k">EVAL LOSS</span>
              <ProgressBar value={Math.max(0, 2 - adapter.evalLoss)} max={2} accent="cyan" size="xs" />
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--cyan)', width: 36, textAlign: 'right' }}>
                {adapter.evalLoss}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Deployment */}
      <div className="detail-divider" />
      <div className="detail-section-label">Deployment</div>
      <div className="detail-kv">
        <span className="detail-k">SERVED IN VLLM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={adapter.servedInVLLM ? 'active' : 'offline'} size="sm" />
          <span className={`detail-v font-mono ${adapter.servedInVLLM ? 'text-green' : 'text-muted'}`}>
            {adapter.servedInVLLM ? `YES — ${adapter.loraName}` : 'NO'}
          </span>
        </div>
      </div>
      {adapter.agents?.length > 0 && (
        <div className="detail-kv" style={{ marginTop: 8 }}>
          <span className="detail-k">AGENTS USING</span>
          <div className="detail-agents">
            {adapter.agents.map(ag => (
              <span key={ag} className="tag tag-amber" style={{ fontSize: 9 }}>{ag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="detail-divider" />
      <div className="detail-actions">
        <button className="btn-ghost detail-action-btn">
          <Edit3 size={12} /> EDIT METADATA
        </button>
        <button className="btn-ghost detail-action-btn">
          <Zap size={12} /> RETRAIN
        </button>
        {adapter.ggufExport && (
          <button className="btn-ghost detail-action-btn">
            <Download size={12} /> EXPORT GGUF
          </button>
        )}
        <button className="btn-ghost detail-action-btn detail-deprecate-btn">
          <Trash2 size={12} /> DEPRECATE
        </button>
      </div>
    </div>
  )
}

// ── Composition Planner ───────────────────────────────────────────────────
function CompositionPlanner({
  adapters, presets, presetIdx, compStack, compBase,
  baseVram, loraItems, totalVram, totalWeight,
  vramWarning, weightWarning,
  onSelectPreset, onSetWeight, onMoveUp, onMoveDown, onRemove, onAdd,
}) {
  const [addSearch, setAddSearch] = useState('')

  const availableAdapters = adapters.filter(a =>
    a.type === 'LLM' &&
    !compStack.find(s => s.adapterId === a.id) &&
    (addSearch === '' || a.name.toLowerCase().includes(addSearch.toLowerCase()))
  )

  return (
    <div className="comp-layout">
      <div className="comp-main">
        {/* Scenario selector */}
        <div className="card comp-panel">
          <div className="comp-panel-header">
            <span className="section-label">Scenario</span>
          </div>
          <div className="comp-scenarios">
            {presets.map((p, i) => (
              <button
                key={p.id}
                className={`comp-scenario-btn ${presetIdx === i ? 'active' : ''}`}
                onClick={() => onSelectPreset(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="card comp-panel">
          <div className="comp-panel-header">
            <span className="section-label">Stack</span>
            <span className="section-label text-muted" style={{ fontSize: 9 }}>
              Drag to reorder · Combined weight: {totalWeight.toFixed(1)}
              {weightWarning && <span className="text-coral"> ⚠ INTERFERENCE RISK</span>}
            </span>
          </div>

          <div className="comp-stack">
            {compStack.map((item, idx) => {
              const adapter = adapters.find(a => a.id === item.adapterId)
              if (!adapter) return null
              const tier = TIER_CONFIG[adapter.tier]

              return (
                <div key={item.adapterId} className="comp-stack-item">
                  <div className="comp-stack-order">
                    <button
                      className="comp-order-btn"
                      onClick={() => onMoveUp(idx)}
                      disabled={idx === 0}
                    >
                      <MoveUp size={11} />
                    </button>
                    <span className="comp-order-num font-mono">{idx + 1}</span>
                    <button
                      className="comp-order-btn"
                      onClick={() => onMoveDown(idx)}
                      disabled={idx === compStack.length - 1}
                    >
                      <MoveDown size={11} />
                    </button>
                  </div>

                  <div className="comp-stack-info">
                    <div className="comp-stack-name-row">
                      <span className="font-mono comp-stack-name">{adapter.name}</span>
                      <span className={`tag vault-tier-badge ${tier?.cls}`} style={{ fontSize: 9 }}>
                        {tier?.label}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        r={adapter.rank}
                      </span>
                    </div>
                    <div className="comp-stack-meta">
                      <span className="section-label" style={{ fontSize: 9 }}>{adapter.modelBase}</span>
                      <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                        VRAM: +{loraVram(adapter.rank).toFixed(2)} GB
                      </span>
                    </div>
                  </div>

                  <div className="comp-weight-control">
                    {item.locked ? (
                      <div className="comp-weight-locked">
                        <span className="tag tag-muted" style={{ fontSize: 9 }}>MERGED — ALWAYS ON</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono comp-weight-val text-amber">
                          {item.weight.toFixed(1)}
                        </span>
                        <input
                          type="range"
                          className="comp-weight-slider"
                          min={0}
                          max={1}
                          step={0.05}
                          value={item.weight}
                          onChange={e => onSetWeight(idx, parseFloat(e.target.value))}
                        />
                        <div className="comp-weight-bar">
                          <div
                            className="comp-weight-fill"
                            style={{ width: `${item.weight * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {!item.locked && (
                    <button className="comp-remove-btn" onClick={() => onRemove(idx)}>
                      <X size={11} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add adapter */}
          <div className="comp-add-row">
            <Search size={11} color="var(--text-muted)" />
            <input
              className="comp-add-search"
              placeholder="Add adapter to stack..."
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
            />
          </div>
          {addSearch && (
            <div className="comp-add-results">
              {availableAdapters.slice(0, 5).map(a => (
                <button key={a.id} className="comp-add-item" onClick={() => { onAdd(a.id); setAddSearch('') }}>
                  <span className="font-mono" style={{ fontSize: 11 }}>{a.name}</span>
                  <span className="text-muted" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>r={a.rank}</span>
                </button>
              ))}
              {availableAdapters.length === 0 && (
                <span className="comp-add-empty">No matching adapters available</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VRAM calculator */}
      <div className="comp-sidebar">
        <div className={`card comp-panel comp-vram ${vramWarning ? 'vram-warning' : ''}`}>
          <div className="comp-panel-header">
            <span className="section-label">Estimated VRAM Cost</span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{compBase}</span>
          </div>

          <div className="vram-rows">
            <div className="vram-row">
              <span className="vram-label">Base model (Q4)</span>
              <span className="font-mono vram-val">{baseVram.toFixed(1)} GB</span>
            </div>
            {loraItems.map((l, i) => (
              <div key={i} className="vram-row vram-lora-row">
                <span className="vram-label">
                  {compStack[i]?.locked ? '└ ' : '└ '}{l.name} (r={l.rank})
                </span>
                <span className="font-mono vram-val vram-lora">{l.vram.toFixed(2)} GB</span>
              </div>
            ))}
            <div className="vram-row">
              <span className="vram-label">KV Cache</span>
              <span className="font-mono vram-val">{KV_CACHE.toFixed(1)} GB</span>
            </div>
          </div>

          <div className="vram-divider" />

          <div className="vram-total-row">
            <span className="vram-total-label font-mono">TOTAL</span>
            <span className={`font-mono vram-total-val ${vramWarning ? 'text-coral' : 'text-green'}`}>
              {totalVram.toFixed(2)} GB
            </span>
          </div>

          <div className="vram-target">
            <ProgressBar
              value={totalVram}
              max={32}
              accent={vramWarning ? 'coral' : 'green'}
              size="xs"
            />
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
              Limit: 28 GB (RTX 5090 safe)
            </span>
          </div>

          {vramWarning && (
            <div className="vram-alert vram-alert-coral">
              <AlertTriangle size={12} />
              VRAM exceeds 28 GB safe limit for inference on RTX 5090
            </div>
          )}
          {weightWarning && (
            <div className="vram-alert vram-alert-amber">
              <AlertTriangle size={12} />
              Combined adapter weight &gt;1.5 — interference risk
            </div>
          )}
          {!vramWarning && !weightWarning && (
            <div className="vram-alert vram-alert-green">
              <CheckCircle size={12} />
              Composition valid · Fits RTX 5090
            </div>
          )}
        </div>

        {/* Deploy actions */}
        <div className="card comp-panel">
          <div className="comp-deploy-actions">
            <button className="btn-ghost comp-deploy-btn">
              <CheckCircle size={13} />
              VALIDATE COMPOSITION
            </button>
            <button className="btn-ghost comp-deploy-btn">
              <Save size={13} />
              SAVE PRESET
            </button>
            <button className={`btn-primary comp-deploy-btn ${vramWarning ? 'disabled' : ''}`}>
              <Play size={13} />
              DEPLOY TO VLLM
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
