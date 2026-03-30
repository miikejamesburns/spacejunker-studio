import { useContext, useState } from 'react'
import {
  BookOpen, Plus, Download, Edit3, Play,
  ChevronLeft, CheckCircle, AlertCircle, Circle,
  Database, GitBranch, Users, Film, Cpu,
  Clock, BarChart2, Shield, Layers, Activity,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import './SeriesRegistry.css'

// ── Universe Header ─────────────────────────────────────
function UniverseHeader({ universe, adapters }) {
  const uniLora = adapters.find(a => a.name === universe.universeLora)

  return (
    <div className="universe-header">
      <div className="universe-head-top">
        <div className="universe-title-group">
          <BookOpen size={20} className="icon-amber" />
          <h1 className="universe-name">{universe.name.toUpperCase()}</h1>
        </div>
        <div className="universe-actions">
          <button className="btn-ghost uni-action-btn"><Edit3 size={12} /> EDIT UNIVERSE</button>
          <button className="btn-ghost uni-action-btn"><Plus size={12} /> ADD SERIES</button>
          <button className="btn-ghost uni-action-btn"><Download size={12} /> EXPORT BIBLE</button>
        </div>
      </div>

      <div className="universe-stats-grid">
        <div className="uni-stat">
          <span className="uni-stat-k">CREATED</span>
          <span className="uni-stat-v">{universe.created}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k">SERIES</span>
          <span className="uni-stat-v">
            <span className="uni-stat-green">{universe.seriesCount.active} active</span>
            <span className="uni-stat-dim"> · {universe.seriesCount.planned} planned</span>
          </span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k">CHARACTERS</span>
          <span className="uni-stat-v">{universe.characters.toLocaleString()}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k">LOCATIONS</span>
          <span className="uni-stat-v">{universe.locations.toLocaleString()}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k">FACTIONS</span>
          <span className="uni-stat-v">{universe.factions}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k">EVENTS</span>
          <span className="uni-stat-v">{universe.events.toLocaleString()}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k"><Database size={10} /> VECTORS</span>
          <span className="uni-stat-v uni-cyan">{universe.totalVectors.toLocaleString()}</span>
        </div>
        <div className="uni-stat">
          <span className="uni-stat-k"><GitBranch size={10} /> NEO4J NODES</span>
          <span className="uni-stat-v uni-cyan">{universe.neo4jNodes.toLocaleString()}</span>
        </div>
        {uniLora && (
          <div className="uni-stat">
            <span className="uni-stat-k">UNIVERSE LoRA</span>
            <span className="uni-stat-v">
              <span className="uni-lora-tag">
                {uniLora.name} (r={uniLora.rank})
              </span>
              <span className="uni-lora-status">● MERGED</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Consistency score badge ─────────────────────────────
function ConsistencyBadge({ score }) {
  if (score == null) return <span className="consistency-badge badge-dim">—</span>
  const cls = score >= 90 ? 'badge-green' : score >= 80 ? 'badge-amber' : 'badge-coral'
  const icon = score >= 90 ? '✓' : score >= 80 ? '~' : '✗'
  return <span className={`consistency-badge ${cls}`}>{icon} {score}% pass rate</span>
}

// ── Series Card ─────────────────────────────────────────
function SeriesCard({ s, adapters, onOpen }) {
  const llmAdapter   = adapters.find(a => a.name === s.llmLora)
  const styleAdapter = adapters.find(a => a.name === s.styleLora)
  const isPlanned    = s.status === 'planned'

  return (
    <div className={`series-card ${isPlanned ? 'series-planned' : ''}`}>
      <div className="series-card-head">
        <div className="series-num-row">
          <span className="series-number">SERIES {String(s.number).padStart(2, '0')}</span>
          <StatusDot status={isPlanned ? 'idle' : 'active'} size="sm" label={s.status.toUpperCase()} />
        </div>
        <h3 className="series-title">{s.title.toUpperCase()}</h3>
      </div>

      <div className="series-card-divider" />

      <div className="series-card-meta">
        <div className="sc-meta-row">
          <span className="sc-meta-k">EPISODES</span>
          <span className="sc-meta-v">{s.episodesGenerated > 0 ? `${s.episodesGenerated} generated` : '—'}</span>
        </div>
        <div className="sc-meta-row">
          <span className="sc-meta-k">CHARACTERS</span>
          <span className="sc-meta-v">{s.characters > 0 ? `${s.characters} in series` : '—'}</span>
        </div>
        <div className="sc-meta-row">
          <span className="sc-meta-k">LLM LoRA</span>
          <span className="sc-meta-v">
            {llmAdapter
              ? <span className="sc-lora-tag">{s.llmLora} (r={llmAdapter.rank})</span>
              : <span className="sc-meta-dim">—</span>}
          </span>
        </div>
        <div className="sc-meta-row">
          <span className="sc-meta-k">STYLE LoRA</span>
          <span className="sc-meta-v">
            {styleAdapter
              ? <span className="sc-lora-tag">{s.styleLora}</span>
              : <span className="sc-meta-dim">—</span>}
          </span>
        </div>
      </div>

      <div className="series-card-divider" />

      <div className="series-card-footer">
        <div className="sc-meta-row">
          <span className="sc-meta-k">LAST GENERATED</span>
          <span className="sc-meta-v sc-cyan">{s.lastGenerated || '—'}</span>
        </div>
        <div className="sc-meta-row">
          <span className="sc-meta-k">CONSISTENCY</span>
          <ConsistencyBadge score={s.consistencyScore} />
        </div>
      </div>

      <div className="series-card-actions">
        <button
          className={`btn-ghost sc-btn ${isPlanned ? 'sc-btn-start' : ''}`}
          onClick={() => !isPlanned && onOpen(s.id)}
        >
          {isPlanned ? <><Plus size={12} /> START</> : <><Film size={12} /> OPEN</>}
        </button>
        {!isPlanned && (
          <button className="btn-primary sc-btn">
            <Play size={12} /> GENERATE EPISODE
          </button>
        )}
      </div>
    </div>
  )
}

// ── Series Grid ─────────────────────────────────────────
function SeriesGrid({ series, adapters, onOpen }) {
  return (
    <div className="series-grid">
      {series.map(s => (
        <SeriesCard key={s.id} s={s} adapters={adapters} onOpen={onOpen} />
      ))}
    </div>
  )
}

// ── Detail: Overview tab ────────────────────────────────
function OverviewTab({ s, entities, adapters }) {
  const keyChars = entities.filter(e =>
    e.type === 'character' && e.series?.includes(s.id) && e.subtype === 'main-cast'
  )
  const llmAdapter = adapters.find(a => a.name === s.llmLora)

  return (
    <div className="detail-tab-content">
      <div className="overview-grid">
        <div className="overview-left">
          <div className="overview-block">
            <div className="overview-block-label">SYNOPSIS</div>
            <p className="overview-synopsis">{s.synopsis}</p>
          </div>

          <div className="overview-block">
            <div className="overview-block-label">TONE GUIDE</div>
            <p className="overview-tone">{s.tone}</p>
          </div>

          <div className="overview-block">
            <div className="overview-block-label">UNIVERSE CONNECTION</div>
            <div className="overview-connection-row">
              <span className="ov-conn-k">Universe LoRA</span>
              <span className="ov-conn-v">universe_voice (r=64) ● MERGED</span>
            </div>
            <div className="overview-connection-row">
              <span className="ov-conn-k">Series LoRA</span>
              <span className="ov-conn-v">
                {s.llmLora ? `${s.llmLora} (r=${llmAdapter?.rank || '—'})` : '—'}
              </span>
            </div>
            <div className="overview-connection-row">
              <span className="ov-conn-k">Collections</span>
              <span className="ov-conn-v ov-cyan">darkmatter_episodic · darkmatter_lore</span>
            </div>
          </div>
        </div>

        <div className="overview-right">
          <div className="overview-block">
            <div className="overview-block-label">KEY CHARACTERS</div>
            {keyChars.length > 0 ? (
              <div className="overview-chars">
                {keyChars.map(c => (
                  <div key={c.id} className="overview-char-row">
                    <div className="ov-char-name">{c.name}</div>
                    <div className="ov-char-role">{c.factionRole || c.faction || ''}</div>
                    <div className="ov-char-status">
                      <span className={`ov-char-status-dot ${c.status === 'ALIVE' ? 'dot-green' : 'dot-coral'}`} />
                      <span className="ov-char-status-text">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="overview-empty">No characters assigned yet</p>
            )}
          </div>

          <div className="overview-block">
            <div className="overview-block-label">SERIES STATS</div>
            <div className="overview-stats">
              <div className="ov-stat">
                <span className="ov-stat-v">{s.episodesGenerated}</span>
                <span className="ov-stat-k">Episodes</span>
              </div>
              <div className="ov-stat">
                <span className="ov-stat-v">{s.characters}</span>
                <span className="ov-stat-k">Characters</span>
              </div>
              <div className="ov-stat">
                <span className="ov-stat-v ov-score">{s.consistencyScore != null ? `${s.consistencyScore}%` : '—'}</span>
                <span className="ov-stat-k">Consistency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Detail: Episodes tab ────────────────────────────────
function EpisodesTab({ episodes }) {
  return (
    <div className="detail-tab-content">
      <div className="episodes-grid">
        {episodes.map(ep => {
          const isComplete   = ep.status === 'complete'
          const isGenerating = ep.status === 'generating'
          const isPlanned    = ep.status === 'planned'

          return (
            <div key={ep.id} className={`ep-card ep-${ep.status}`}>
              <div className="ep-card-head">
                <span className="ep-num">{ep.ep}</span>
                <span className={`ep-status-badge epbadge-${ep.status}`}>
                  {isGenerating ? <><span className="ep-gen-dot" /> GENERATING</> : ep.status.toUpperCase()}
                </span>
              </div>

              <div className="ep-title">{ep.title}</div>

              {isComplete && (
                <>
                  <div className="ep-stats">
                    <span className="ep-stat">{ep.scenes} scenes</span>
                    <span className="ep-stat-sep">·</span>
                    <span className="ep-stat">{(ep.tokens / 1000).toFixed(0)}K tok</span>
                    {ep.score != null && (
                      <>
                        <span className="ep-stat-sep">·</span>
                        <span className={`ep-score ${ep.score >= 90 ? 'score-green' : ep.score >= 80 ? 'score-amber' : 'score-coral'}`}>
                          {ep.score}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="ep-date">{ep.genDate}</div>
                  {ep.preview && (
                    <p className="ep-preview">{ep.preview}</p>
                  )}
                  <div className="ep-actions">
                    <button className="btn-ghost ep-action-btn"><BookOpen size={11} /> PREVIEW</button>
                    <button className="btn-ghost ep-action-btn"><Download size={11} /> EXPORT</button>
                  </div>
                </>
              )}

              {isGenerating && (
                <div className="ep-generating-info">
                  <span className="ep-gen-label">Pipeline active · Scene Writer in progress</span>
                  <div className="ep-gen-bar-wrap">
                    <div className="ep-gen-bar" />
                  </div>
                </div>
              )}

              {isPlanned && (
                <div className="ep-planned-info">
                  <button className="btn-primary ep-gen-btn"><Play size={11} /> GENERATE</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Detail: Characters tab ──────────────────────────────
function CharactersTab({ s, entities }) {
  const chars = entities.filter(e => e.type === 'character' && e.series?.includes(s.id))

  const subtypeOrder = { 'main-cast': 0, supporting: 1, deceased: 2 }
  const sorted = [...chars].sort((a, b) =>
    (subtypeOrder[a.subtype] ?? 9) - (subtypeOrder[b.subtype] ?? 9)
  )

  return (
    <div className="detail-tab-content">
      {sorted.length === 0 ? (
        <div className="tab-empty">No characters assigned to this series yet.</div>
      ) : (
        <div className="chars-table-wrap">
          <table className="base-table chars-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>TYPE</th>
                <th>TIER</th>
                <th>STATUS</th>
                <th>FACTION</th>
                <th>FIRST</th>
                <th>INDEXED</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.id}>
                  <td className="char-name-cell">{c.name}</td>
                  <td>
                    <span className={`char-type-badge ctype-${c.subtype}`}>
                      {c.subtype === 'main-cast' ? 'MAIN' : c.subtype === 'deceased' ? 'DECEASED' : 'SUPPORTING'}
                    </span>
                  </td>
                  <td className="font-mono text-muted">T{c.canonTier}</td>
                  <td>
                    <span className={`char-status ${c.status === 'ALIVE' ? 'cstatus-alive' : 'cstatus-dead'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-muted">{c.faction || '—'}</td>
                  <td className="font-mono text-muted">{c.firstAppears || '—'}</td>
                  <td>
                    <span className="chars-embed-dots">
                      <span className={`embed-dot-sm ${c.embeddedIn?.qdrant ? 'edot-cyan' : 'edot-dim'}`} />
                      <span className={`embed-dot-sm ${c.embeddedIn?.neo4j  ? 'edot-amber' : 'edot-dim'}`} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Detail: Adapters tab ────────────────────────────────
function AdaptersTab({ s, adapters }) {
  const linked = adapters.filter(a =>
    a.name === s.llmLora    ||
    a.name === s.styleLora  ||
    (a.name && (a.name.includes('s01') || a.name.includes('s02')) && a.name.includes(s.id.split('-')[0]))
  )

  // Also include the universe lora
  const universe = adapters.find(a => a.name === 'universe_voice')
  const all = universe ? [universe, ...linked.filter(a => a.name !== 'universe_voice')] : linked

  return (
    <div className="detail-tab-content">
      <div className="adapters-list">
        {all.map(a => (
          <div key={a.id} className="adapter-row">
            <div className="adapter-row-left">
              <div className="adapter-name-row">
                <span className={`adapter-type-badge atype-${a.type.toLowerCase()}`}>{a.type}</span>
                <span className="adapter-name">{a.name}</span>
                {a.name === s.llmLora    && <span className="adapter-role-tag">LLM</span>}
                {a.name === s.styleLora  && <span className="adapter-role-tag role-style">STYLE</span>}
                {a.name === 'universe_voice' && <span className="adapter-role-tag role-uni">UNIVERSE</span>}
              </div>
              <div className="adapter-meta-row">
                <span className="adapter-meta">{a.modelBase}</span>
                <span className="adapter-meta-sep">·</span>
                <span className="adapter-meta">r={a.rank}</span>
                <span className="adapter-meta-sep">·</span>
                <span className="adapter-meta">{a.size}</span>
              </div>
            </div>
            <div className="adapter-row-right">
              <div className="adapter-status-col">
                <span className={`adapter-status-dot ${a.status === 'active' ? 'adot-green' : a.status === 'training' ? 'adot-amber' : 'adot-dim'}`} />
                <span className="adapter-status-label">{a.status.toUpperCase()}</span>
              </div>
              <span className="adapter-date font-mono">{a.lastTrained || '—'}</span>
              <span className={`adapter-loss font-mono ${a.trainLoss < 0.75 ? 'loss-green' : a.trainLoss < 0.9 ? 'loss-amber' : 'loss-coral'}`}>
                {a.trainLoss != null ? `${a.trainLoss}` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Detail: Consistency Log tab ─────────────────────────
function ConsistencyLogTab({ log, s }) {
  const passCount = log.filter(e => e.type === 'PASS').length
  const failCount = log.filter(e => e.type === 'FAIL').length
  const passRate  = log.length > 0 ? Math.round((passCount / log.length) * 100) : 0

  return (
    <div className="detail-tab-content">
      {/* Summary row */}
      <div className="clog-summary">
        <div className="clog-stat">
          <span className="clog-stat-v">{log.length}</span>
          <span className="clog-stat-k">Total Checks</span>
        </div>
        <div className="clog-stat">
          <span className="clog-stat-v clog-green">{passCount}</span>
          <span className="clog-stat-k">Passed</span>
        </div>
        <div className="clog-stat">
          <span className="clog-stat-v clog-coral">{failCount}</span>
          <span className="clog-stat-k">Failed</span>
        </div>
        <div className="clog-stat">
          <span className={`clog-stat-v ${passRate >= 90 ? 'clog-green' : passRate >= 80 ? 'clog-amber' : 'clog-coral'}`}>
            {passRate}%
          </span>
          <span className="clog-stat-k">Pass Rate</span>
        </div>
      </div>

      {/* Log table */}
      <div className="clog-table-wrap">
        <table className="base-table clog-table">
          <thead>
            <tr>
              <th>TIME</th>
              <th>EPISODE</th>
              <th>RESULT</th>
              <th>ENTITY</th>
              <th>CATEGORY</th>
              <th>DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, i) => (
              <tr key={i} className={entry.type === 'FAIL' ? 'clog-fail-row' : ''}>
                <td className="font-mono text-muted">{entry.ts}</td>
                <td className="font-mono">{entry.ep}</td>
                <td>
                  {entry.type === 'PASS'
                    ? <span className="clog-pass"><CheckCircle size={11} /> PASS</span>
                    : <span className="clog-fail"><AlertCircle size={11} /> FAIL</span>}
                </td>
                <td>{entry.entity}</td>
                <td>
                  <span className={`clog-cat ccat-${entry.category}`}>
                    {entry.category.toUpperCase()}
                  </span>
                </td>
                <td className="clog-detail">{entry.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Series Detail View ──────────────────────────────────
function SeriesDetailView({ s, adapters, entities, episodes, consistencyLog, onBack }) {
  const TABS = [
    { id: 'overview',     label: 'OVERVIEW',         Icon: BookOpen   },
    { id: 'episodes',     label: 'EPISODES',          Icon: Film       },
    { id: 'characters',   label: 'CHARACTERS',        Icon: Users      },
    { id: 'adapters',     label: 'ADAPTERS',          Icon: Cpu        },
    { id: 'consistency',  label: 'CONSISTENCY LOG',   Icon: Activity   },
  ]
  const [activeTab, setActiveTab] = useState('overview')

  const passCount = consistencyLog.filter(e => e.type === 'PASS').length
  const passRate  = consistencyLog.length > 0 ? Math.round((passCount / consistencyLog.length) * 100) : null

  return (
    <div className="series-detail">
      {/* Detail header */}
      <div className="detail-header">
        <div className="detail-header-top">
          <button className="detail-back-btn" onClick={onBack}>
            <ChevronLeft size={14} /> BACK TO REGISTRY
          </button>
          <div className="detail-header-actions">
            <button className="btn-ghost detail-action-btn"><Edit3 size={12} /> EDIT SERIES</button>
            <button className="btn-primary detail-action-btn"><Play size={12} /> GENERATE EPISODE</button>
          </div>
        </div>

        <div className="detail-title-bar">
          <div className="detail-series-num">SERIES {String(s.number).padStart(2, '0')}</div>
          <h2 className="detail-series-title">{s.title.toUpperCase()}</h2>
          <StatusDot status={s.status === 'active' ? 'active' : 'idle'} size="sm" label={s.status.toUpperCase()} />
        </div>

        <div className="detail-stats-row">
          <span className="detail-stat">
            <span className="detail-stat-k">EPISODES</span>
            <span className="detail-stat-v">{s.episodesGenerated}</span>
          </span>
          <span className="detail-stat-sep">·</span>
          <span className="detail-stat">
            <span className="detail-stat-k">CHARACTERS</span>
            <span className="detail-stat-v">{s.characters}</span>
          </span>
          <span className="detail-stat-sep">·</span>
          <span className="detail-stat">
            <span className="detail-stat-k">LLM LoRA</span>
            <span className="detail-stat-v detail-amber">{s.llmLora || '—'}</span>
          </span>
          <span className="detail-stat-sep">·</span>
          <span className="detail-stat">
            <span className="detail-stat-k">LAST GENERATED</span>
            <span className="detail-stat-v detail-cyan">{s.lastGenerated || '—'}</span>
          </span>
          <span className="detail-stat-sep">·</span>
          <span className="detail-stat">
            <span className="detail-stat-k">CONSISTENCY</span>
            <ConsistencyBadge score={passRate ?? s.consistencyScore} />
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`detail-tab ${activeTab === tab.id ? 'detail-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.Icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="detail-tab-body">
        {activeTab === 'overview'    && <OverviewTab     s={s} entities={entities} adapters={adapters} />}
        {activeTab === 'episodes'    && <EpisodesTab     episodes={episodes} />}
        {activeTab === 'characters'  && <CharactersTab   s={s} entities={entities} />}
        {activeTab === 'adapters'    && <AdaptersTab     s={s} adapters={adapters} />}
        {activeTab === 'consistency' && <ConsistencyLogTab log={consistencyLog} s={s} />}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────
export default function SeriesRegistry() {
  const { universe, series, adapters, loreEntities, seriesEpisodes, seriesConsistencyLog } = useContext(SystemContext)
  const [selectedId, setSelectedId] = useState(null)

  const selectedSeries = series.find(s => s.id === selectedId) || null
  const episodes       = selectedId ? (seriesEpisodes[selectedId] || []) : []
  const consistencyLog = selectedId ? (seriesConsistencyLog[selectedId] || []) : []

  return (
    <div className="series-page">
      <UniverseHeader universe={universe} adapters={adapters} />

      {selectedSeries ? (
        <SeriesDetailView
          s={selectedSeries}
          adapters={adapters}
          entities={loreEntities || []}
          episodes={episodes}
          consistencyLog={consistencyLog}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <SeriesGrid series={series} adapters={adapters} onOpen={setSelectedId} />
      )}
    </div>
  )
}
