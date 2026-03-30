import { useState, useEffect, useRef } from 'react'
import { ArrowDown, X } from 'lucide-react'
import './LogFeed.css'

const TYPE_TAG_CLASS = {
  RAG_QUERY:       'tag-cyan',
  VECTOR_INSERT:   'tag-cyan',
  LORA_SWAP:       'tag-amber',
  TRAIN_COMPLETE:  'tag-green',
  CHECKPOINT:      'tag-amber',
  CONSTRAINT_FAIL: 'tag-coral',
  CONSTRAINT_PASS: 'tag-green',
  GEN_START:       'tag-amber',
  GEN_COMPLETE:    'tag-green',
  EMBED_COMPLETE:  'tag-cyan',
  GRAPH_UPDATE:    'tag-cyan',
  LORA_LOAD:       'tag-amber',
  INGEST_COMPLETE: 'tag-green',
}

const ALL_AGENTS = ['Scene Writer', 'Extractor', 'vLLM', 'Unsloth', 'Neo4j', 'Qdrant', 'Showrunner', 'Head Writer', 'Story Editor', 'ComfyUI', 'Researcher']
const ALL_TYPES  = ['RAG_QUERY', 'VECTOR_INSERT', 'LORA_SWAP', 'TRAIN_COMPLETE', 'CHECKPOINT', 'CONSTRAINT_FAIL', 'CONSTRAINT_PASS', 'GEN_START', 'GEN_COMPLETE', 'EMBED_COMPLETE', 'GRAPH_UPDATE', 'LORA_LOAD', 'INGEST_COMPLETE']

export default function LogFeed({ entries = [], maxHeight = 420 }) {
  const [agentFilter, setAgentFilter] = useState(null)
  const [typeFilter, setTypeFilter]   = useState(null)
  const [autoScroll, setAutoScroll]   = useState(true)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const [showTypeMenu, setShowTypeMenu]   = useState(false)
  const scrollRef = useRef(null)
  const prevLengthRef = useRef(entries.length)

  // Auto-scroll on new entries
  useEffect(() => {
    if (autoScroll && entries.length !== prevLengthRef.current) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevLengthRef.current = entries.length
  }, [entries.length, autoScroll])

  const filtered = entries.filter(e => {
    if (agentFilter && e.agent !== agentFilter) return false
    if (typeFilter  && e.type  !== typeFilter)  return false
    return true
  })

  const hasFilters = agentFilter || typeFilter

  return (
    <div className="log-feed">
      {/* Controls bar */}
      <div className="log-controls">
        <div className="log-filters">
          {/* Agent filter */}
          <div className="log-filter-group">
            <button
              className={`log-filter-btn ${agentFilter ? 'active' : ''}`}
              onClick={() => { setShowAgentMenu(v => !v); setShowTypeMenu(false) }}
            >
              {agentFilter ?? 'ALL AGENTS'}
              {agentFilter && (
                <span
                  className="log-filter-clear"
                  onClick={(e) => { e.stopPropagation(); setAgentFilter(null); setShowAgentMenu(false) }}
                >
                  <X size={10} />
                </span>
              )}
            </button>
            {showAgentMenu && (
              <div className="log-dropdown">
                {ALL_AGENTS.map(a => (
                  <button
                    key={a}
                    className={`log-dropdown-item ${agentFilter === a ? 'selected' : ''}`}
                    onClick={() => { setAgentFilter(a === agentFilter ? null : a); setShowAgentMenu(false) }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type filter */}
          <div className="log-filter-group">
            <button
              className={`log-filter-btn ${typeFilter ? 'active' : ''}`}
              onClick={() => { setShowTypeMenu(v => !v); setShowAgentMenu(false) }}
            >
              {typeFilter ?? 'ALL EVENTS'}
              {typeFilter && (
                <span
                  className="log-filter-clear"
                  onClick={(e) => { e.stopPropagation(); setTypeFilter(null); setShowTypeMenu(false) }}
                >
                  <X size={10} />
                </span>
              )}
            </button>
            {showTypeMenu && (
              <div className="log-dropdown log-dropdown-wide">
                {ALL_TYPES.map(t => (
                  <button
                    key={t}
                    className={`log-dropdown-item ${typeFilter === t ? 'selected' : ''}`}
                    onClick={() => { setTypeFilter(t === typeFilter ? null : t); setShowTypeMenu(false) }}
                  >
                    <span className={`tag ${TYPE_TAG_CLASS[t] || 'tag-muted'}`}>{t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              className="log-filter-btn log-clear-all"
              onClick={() => { setAgentFilter(null); setTypeFilter(null) }}
            >
              CLEAR ALL
            </button>
          )}

          <span className="log-count">
            {filtered.length} <span className="text-muted">/ {entries.length}</span>
          </span>
        </div>

        {/* Auto-scroll toggle */}
        <button
          className={`log-autoscroll-btn ${autoScroll ? 'on' : 'off'}`}
          onClick={() => setAutoScroll(v => !v)}
          title="Toggle auto-scroll"
        >
          <ArrowDown size={11} />
          AUTO
        </button>
      </div>

      {/* Column headers */}
      <div className="log-header-row">
        <span className="log-col-ts">TIME</span>
        <span className="log-col-agent">AGENT</span>
        <span className="log-col-type">EVENT</span>
        <span className="log-col-detail">DETAIL</span>
      </div>

      {/* Rows */}
      <div className="log-rows" style={{ maxHeight }} ref={scrollRef}>
        {filtered.length === 0 ? (
          <div className="log-empty">No events match current filters</div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={entry.id}
              className={`log-row ${i === 0 ? 'log-row-new' : ''}`}
            >
              <span className="log-col-ts text-cyan font-mono">{entry.ts}</span>
              <span className="log-col-agent text-amber font-mono">{entry.agent}</span>
              <span className="log-col-type">
                <span className={`tag ${TYPE_TAG_CLASS[entry.type] || 'tag-muted'}`}>
                  {entry.type}
                </span>
              </span>
              <span className="log-col-detail">{entry.detail}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
