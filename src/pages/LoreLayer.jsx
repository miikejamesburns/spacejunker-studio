import { useContext, useState } from 'react'
import {
  Database, GitBranch, Search, RefreshCw, Download,
  Settings, ExternalLink, Plus, Play, AlertTriangle,
  CheckCircle, ChevronDown, X, Zap,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import ProgressBar from '../components/ui/ProgressBar'
import './LoreLayer.css'

// ── Per-collection config metadata ──
const COLLECTION_CONFIG = {
  darkmatter_episodic: {
    embeddingModel: 'nomic-embed-text-v1.5',
    distance: 'Cosine',
    hnswM: 16,
    hnswEf: 100,
    quantization: 'Scalar int8',
    payloadIndexes: [
      { field: 'entity_type', type: 'keyword' },
      { field: 'season',      type: 'integer' },
      { field: 'episode',     type: 'integer' },
      { field: 'characters',  type: 'keyword[]' },
      { field: 'location',    type: 'keyword' },
      { field: 'canon_tier',  type: 'integer' },
    ],
  },
  default: {
    embeddingModel: 'nomic-embed-text-v1.5',
    distance: 'Cosine',
    hnswM: 16,
    hnswEf: 100,
    quantization: 'Scalar int8',
    payloadIndexes: [
      { field: 'entity_type', type: 'keyword' },
      { field: 'series',      type: 'keyword' },
      { field: 'canon_tier',  type: 'integer' },
    ],
  },
}

// ── Cypher presets ──
const CYPHER_PRESETS = [
  `MATCH (c:Character)-[:BELONGS_TO]->(f:Faction)\nWHERE f.name = 'Iron Conclave'\nRETURN c.name, c.status`,
  `MATCH (c:Character {name: 'Kael Theron'})-[r]-(n)\nRETURN type(r), n.name, n.status\nLIMIT 20`,
  `MATCH (e:Event)-[:OCCURRED_AT]->(l:Location)\nWHERE l.name CONTAINS 'Vault'\nRETURN e.title, e.episode ORDER BY e.episode`,
  `MATCH (c:Character)\nWHERE c.status = 'DEAD'\nRETURN c.name, c.died_in_episode ORDER BY c.died_in_episode`,
]

// ── Mock query results ──
const MOCK_RESULTS = {
  kael: [
    { source: 'Qdrant [RAG]', score: 0.923, content: '"Kael swore his oath to the Iron Conclave at the age of nineteen, on the steps of the Vault antechamber..."', ref: 'S01E01', type: 'rag' },
    { source: 'Neo4j [Graph]', score: null,  content: 'BELONGS_TO (since Episode 1), role: FIELD_COMMANDER', ref: null, type: 'graph' },
    { source: 'Qdrant [RAG]', score: 0.871, content: '"The Conclave branded him a traitor after the Vault-7 incident. The mark is burned, not given."', ref: 'S01E06', type: 'rag' },
    { source: 'Qdrant [RAG]', score: 0.834, content: '"Kael does not use contractions. It is a habit from his years as an enforcer — precision in language, precision in action."', ref: 'S02E01', type: 'rag' },
  ],
  vault: [
    { source: 'Qdrant [RAG]', score: 0.947, content: '"Vault-7 is not a location. It is a designation — the seventh level of the old network, where the prohibited research was buried."', ref: 'S01E03', type: 'rag' },
    { source: 'Neo4j [Graph]', score: null,  content: 'Location node: VAULT_7 — CONTAINS [12 objects], OCCURRED_AT [7 events]', ref: null, type: 'graph' },
    { source: 'Qdrant [RAG]', score: 0.891, content: '"The access protocol for Vault-7 requires a Director-level clearance and a biometric key from the original architects."', ref: 'S01E05', type: 'rag' },
  ],
  default: [
    { source: 'Qdrant [RAG]', score: 0.876, content: '"The Iron Conclave was founded in the aftermath of the Fracture Wars, ostensibly as a peacekeeping body..."', ref: 'LORE-FOUNDATION', type: 'rag' },
    { source: 'Neo4j [Graph]', score: null,  content: 'Faction node: IRON_CONCLAVE — ACTIVE, founded: Cycle 2201, members: 342', ref: null, type: 'graph' },
    { source: 'Qdrant [RAG]', score: 0.821, content: '"The Conclave operates through three divisions: Enforcement, Research, and the hidden Vault Directorate."', ref: 'S01E02', type: 'rag' },
  ],
}

export default function LoreLayer() {
  const { qdrantCollections, qdrantStats, neo4jStats, activityLog } = useContext(SystemContext)

  const [selectedCollection, setSelectedCollection] = useState(qdrantCollections[0]?.name)
  const [cypherQuery, setCypherQuery] = useState(CYPHER_PRESETS[0])
  const [cypherPresetIdx, setCypherPresetIdx] = useState(0)
  const [queryType, setQueryType]     = useState('hybrid')
  const [queryInput, setQueryInput]   = useState('What is the relationship between Kael Theron and the Iron Conclave?')
  const [seasonFilter, setSeasonFilter] = useState('ALL')
  const [canonFilter, setCanonFilter]   = useState('ALL')
  const [charTag, setCharTag]           = useState('Kael Theron')
  const [charInput, setCharInput]       = useState('')
  const [queryResults, setQueryResults] = useState(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [latency, setLatency]           = useState(null)

  const collConfig = COLLECTION_CONFIG[selectedCollection] ?? COLLECTION_CONFIG.default

  // Constraint events from activity log
  const constraintEvents = activityLog
    .filter(e => e.type === 'CONSTRAINT_FAIL' || e.type === 'CONSTRAINT_PASS')
    .slice(0, 8)

  function runQuery() {
    setQueryLoading(true)
    setQueryResults(null)
    const delay = 400 + Math.random() * 600
    setTimeout(() => {
      const input = queryInput.toLowerCase()
      const results = input.includes('kael') ? MOCK_RESULTS.kael
        : input.includes('vault') ? MOCK_RESULTS.vault
        : MOCK_RESULTS.default

      const filtered = queryType === 'rag'   ? results.filter(r => r.type === 'rag')
        : queryType === 'graph' ? results.filter(r => r.type === 'graph')
        : results

      setQueryResults(filtered)
      setLatency({
        qdrant: Math.floor(8 + Math.random() * 20),
        neo4j:  Math.floor(2 + Math.random() * 8),
        total:  Math.floor(delay),
      })
      setQueryLoading(false)
    }, delay)
  }

  return (
    <div className="lore-layer">

      {/* ── Title ── */}
      <div className="lore-title-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>Lore Layer</h1>
          <p className="section-label" style={{ marginTop: 4 }}>
            Memory infrastructure · {qdrantStats.totalVectors.toLocaleString()} vectors · {neo4jStats.nodes.toLocaleString()} graph nodes
          </p>
        </div>
      </div>

      {/* ── Two-column split ── */}
      <div className="lore-columns">

        {/* ── LEFT: Qdrant ── */}
        <div className="lore-col">
          <div className="card lore-panel">
            {/* Panel header */}
            <div className="lore-panel-header">
              <div className="lore-panel-title-group">
                <Database size={16} color="var(--cyan)" strokeWidth={1.5} />
                <span className="section-title" style={{ fontSize: 15 }}>Qdrant Vector Database</span>
              </div>
              <div className="lore-panel-conn">
                <StatusDot status="active" size="sm" />
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {qdrantStats.host}
                </span>
              </div>
            </div>

            {/* Stat row */}
            <div className="lore-stat-row">
              <QdrantStat label="TOTAL VECTORS" value={qdrantStats.totalVectors.toLocaleString()} accent="cyan" />
              <QdrantStat label="COLLECTIONS"   value={qdrantStats.totalCollections} accent="cyan" />
              <QdrantStat label="RAM"            value={qdrantStats.ramUsage} accent="amber" />
              <QdrantStat label="DISK"           value={qdrantStats.diskUsage} accent="amber" />
            </div>

            {/* Actions */}
            <div className="lore-actions-row">
              <button className="lore-action-btn"><Search size={11} /> TEST QUERY</button>
              <button className="lore-action-btn"><RefreshCw size={11} /> REINDEX</button>
              <button className="lore-action-btn"><Download size={11} /> EXPORT</button>
              <button className="lore-action-btn"><Settings size={11} /> SETTINGS</button>
            </div>

            <div className="lore-divider" />

            {/* Collections table */}
            <div className="lore-subsection-label">
              Collections
              <button className="lore-add-btn"><Plus size={11} /> NEW</button>
            </div>

            <div className="qdrant-coll-table-wrap">
              <table className="qdrant-coll-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>VECTORS</th>
                    <th>DIM</th>
                    <th>STATUS</th>
                    <th>SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  {qdrantCollections.map(coll => (
                    <tr
                      key={coll.name}
                      className={`coll-row ${selectedCollection === coll.name ? 'coll-row-selected' : ''}`}
                      onClick={() => setSelectedCollection(coll.name)}
                    >
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: selectedCollection === coll.name ? 'var(--cyan)' : 'var(--text-primary)' }}>
                          {coll.name}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-cyan" style={{ fontSize: 11 }}>
                          {coll.vectors.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coll.dim}</span>
                      </td>
                      <td>
                        <StatusDot
                          status={coll.status === 'active' ? 'active' : coll.status === 'indexing' ? 'training' : 'idle'}
                          size="sm"
                        />
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coll.size}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lore-divider" />

            {/* Selected collection config */}
            {selectedCollection && (
              <>
                <div className="lore-subsection-label">
                  Collection Config
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--cyan)' }}>
                    {selectedCollection}
                  </span>
                </div>

                <div className="coll-config-grid">
                  <CollConfigRow k="Embedding Model"  v={collConfig.embeddingModel} />
                  <CollConfigRow k="Distance Metric"  v={collConfig.distance} />
                  <CollConfigRow k="HNSW m"            v={collConfig.hnswM} />
                  <CollConfigRow k="HNSW ef_construct" v={collConfig.hnswEf} />
                  <CollConfigRow k="Quantization"      v={collConfig.quantization} />
                </div>

                <div className="lore-subsection-label" style={{ marginTop: 10 }}>Payload Indexes</div>
                <div className="payload-indexes">
                  {collConfig.payloadIndexes.map(idx => (
                    <div key={idx.field} className="payload-index-row">
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{idx.field}</span>
                      <span className="tag tag-cyan" style={{ fontSize: 9 }}>{idx.type}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Neo4j ── */}
        <div className="lore-col">
          <div className="card lore-panel">
            {/* Panel header */}
            <div className="lore-panel-header">
              <div className="lore-panel-title-group">
                <GitBranch size={16} color="var(--amber)" strokeWidth={1.5} />
                <span className="section-title" style={{ fontSize: 15 }}>Neo4j Knowledge Graph</span>
              </div>
              <div className="lore-panel-conn">
                <StatusDot status="active" size="sm" />
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {neo4jStats.host}
                </span>
              </div>
            </div>

            {/* Graph stats */}
            <div className="lore-subsection-label">Graph Statistics</div>
            <div className="neo4j-stats-grid">
              <div className="neo4j-stats-col">
                <div className="neo4j-stat-header">
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nodes</span>
                  <span className="font-mono text-amber" style={{ fontSize: 18 }}>{neo4jStats.nodes.toLocaleString()}</span>
                </div>
                {Object.entries(neo4jStats.breakdown).map(([label, count]) => (
                  <div key={label} className="neo4j-breakdown-row">
                    <span className="neo4j-breakdown-label">{label}</span>
                    <div className="neo4j-breakdown-bar-wrap">
                      <ProgressBar
                        value={count}
                        max={neo4jStats.nodes}
                        accent="amber"
                        size="xs"
                      />
                    </div>
                    <span className="font-mono neo4j-breakdown-count">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="neo4j-stats-sep" />

              <div className="neo4j-stats-col">
                <div className="neo4j-stat-header">
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Relationships</span>
                  <span className="font-mono text-cyan" style={{ fontSize: 18 }}>{neo4jStats.relationships.toLocaleString()}</span>
                </div>
                {Object.entries(neo4jStats.relBreakdown).map(([label, count]) => (
                  <div key={label} className="neo4j-breakdown-row">
                    <span className="neo4j-breakdown-label neo4j-rel-label">{label}</span>
                    <div className="neo4j-breakdown-bar-wrap">
                      <ProgressBar
                        value={count}
                        max={neo4jStats.relationships}
                        accent="cyan"
                        size="xs"
                      />
                    </div>
                    <span className="font-mono neo4j-breakdown-count">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lore-divider" />

            {/* Recent constraints */}
            <div className="lore-subsection-label">Recent Constraints</div>
            <div className="constraints-feed">
              {constraintEvents.length === 0 ? (
                <span className="lore-empty">No constraint events yet</span>
              ) : (
                constraintEvents.map(e => (
                  <div key={e.id} className={`constraint-row ${e.type === 'CONSTRAINT_FAIL' ? 'constraint-fail' : 'constraint-pass'}`}>
                    <span className="font-mono constraint-ts">{e.ts}</span>
                    {e.type === 'CONSTRAINT_FAIL'
                      ? <AlertTriangle size={11} color="var(--coral)" />
                      : <CheckCircle size={11} color="var(--green)" />
                    }
                    <span className={`font-mono constraint-status ${e.type === 'CONSTRAINT_FAIL' ? 'text-coral' : 'text-green'}`}>
                      {e.type === 'CONSTRAINT_FAIL' ? 'FAIL' : 'PASS'}
                    </span>
                    <span className="constraint-detail">{e.detail}</span>
                  </div>
                ))
              )}
            </div>

            <div className="lore-divider" />

            {/* Cypher quick query */}
            <div className="lore-subsection-label">
              Cypher Quick Query
              <div className="cypher-presets">
                {CYPHER_PRESETS.map((_, i) => (
                  <button
                    key={i}
                    className={`cypher-preset-btn ${cypherPresetIdx === i ? 'active' : ''}`}
                    onClick={() => { setCypherPresetIdx(i); setCypherQuery(CYPHER_PRESETS[i]) }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="cypher-editor-wrap">
              <textarea
                className="cypher-editor"
                value={cypherQuery}
                onChange={e => setCypherQuery(e.target.value)}
                rows={4}
                spellCheck={false}
              />
            </div>

            <div className="cypher-actions">
              <button className="btn-primary cypher-run-btn">
                <Play size={13} /> RUN QUERY
              </button>
              <button className="btn-ghost cypher-browser-btn">
                <ExternalLink size={13} /> OPEN BROWSER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Query Tester ── */}
      <div className="card lore-query-tester">
        <div className="query-tester-header">
          <div className="lore-panel-title-group">
            <Zap size={16} color="var(--amber)" strokeWidth={1.5} />
            <span className="section-title" style={{ fontSize: 15 }}>Lore Layer Query Tester</span>
          </div>
        </div>

        {/* Query type selector */}
        <div className="query-type-row">
          <span className="section-label" style={{ minWidth: 90 }}>QUERY TYPE</span>
          {[
            { id: 'rag',    label: 'Semantic / RAG' },
            { id: 'graph',  label: 'Graph / Neo4j' },
            { id: 'hybrid', label: 'Hybrid' },
          ].map(t => (
            <label key={t.id} className={`query-type-option ${queryType === t.id ? 'active' : ''}`}>
              <input type="radio" name="querytype" value={t.id} checked={queryType === t.id}
                onChange={() => setQueryType(t.id)} />
              <span className="query-type-dot" />
              {t.label}
            </label>
          ))}
        </div>

        {/* Query input */}
        <div className="query-input-wrap">
          <textarea
            className="query-input"
            rows={2}
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="Ask about the lore..."
            spellCheck={false}
          />
        </div>

        {/* Filters */}
        <div className="query-filters-row">
          <span className="section-label" style={{ minWidth: 56 }}>FILTERS</span>

          <div className="query-filter-group">
            <span className="query-filter-label">Season:</span>
            <select className="query-filter-select" value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)}>
              {['ALL', 'S01', 'S02'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="query-filter-group">
            <span className="query-filter-label">Characters:</span>
            {charTag && (
              <div className="query-char-tag">
                <span className="font-mono" style={{ fontSize: 10 }}>{charTag}</span>
                <button onClick={() => setCharTag('')}><X size={9} /></button>
              </div>
            )}
            {!charTag && (
              <input
                className="query-char-input"
                placeholder="Add character..."
                value={charInput}
                onChange={e => setCharInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && charInput) { setCharTag(charInput); setCharInput('') } }}
              />
            )}
          </div>

          <div className="query-filter-group">
            <span className="query-filter-label">Canon Tier:</span>
            <select className="query-filter-select" value={canonFilter} onChange={e => setCanonFilter(e.target.value)}>
              {['ALL', '1', '2', '3'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button
            className="btn-primary query-run-btn"
            onClick={runQuery}
            disabled={queryLoading}
          >
            {queryLoading
              ? <><span className="query-spinner" /> QUERYING…</>
              : <><Play size={13} /> RUN QUERY</>
            }
          </button>
        </div>

        {/* Results */}
        {queryResults && (
          <div className="query-results">
            <div className="lore-divider" style={{ margin: '12px 0 10px' }} />

            <div className="query-results-header">
              <span className="section-label">Results</span>
              {latency && (
                <div className="query-latency">
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>LATENCY</span>
                  <span className="font-mono latency-val text-cyan">Qdrant: {latency.qdrant}ms</span>
                  <span className="font-mono latency-sep">·</span>
                  <span className="font-mono latency-val text-amber">Neo4j: {latency.neo4j}ms</span>
                  <span className="font-mono latency-sep">·</span>
                  <span className="font-mono latency-val">Total: {latency.qdrant + latency.neo4j}ms</span>
                </div>
              )}
            </div>

            <div className="results-table-wrap">
              <div className="results-header-row">
                <span>SOURCE</span>
                <span>SCORE</span>
                <span>CONTENT</span>
                <span>REF</span>
              </div>
              {queryResults.map((r, i) => (
                <div key={i} className={`result-row result-${r.type}`}>
                  <span className="font-mono result-source">
                    {r.type === 'rag'
                      ? <span className="text-cyan">{r.source}</span>
                      : <span className="text-amber">{r.source}</span>
                    }
                  </span>
                  <span className="font-mono result-score">
                    {r.score != null
                      ? <span className={r.score > 0.9 ? 'text-green' : r.score > 0.8 ? 'text-amber' : ''}>{r.score.toFixed(3)}</span>
                      : <span className="text-muted">—</span>
                    }
                  </span>
                  <span className="result-content">{r.content}</span>
                  <span className="font-mono result-ref">
                    {r.ref ? <span className="tag tag-muted" style={{ fontSize: 9 }}>{r.ref}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

// ── Helpers ──
function QdrantStat({ label, value, accent }) {
  return (
    <div className="qdrant-stat">
      <span className="section-label" style={{ fontSize: 9 }}>{label}</span>
      <span className={`font-mono qdrant-stat-val text-${accent}`}>{value}</span>
    </div>
  )
}

function CollConfigRow({ k, v }) {
  return (
    <div className="coll-config-row">
      <span className="font-mono coll-config-key">{k}</span>
      <span className="font-mono coll-config-val">{v}</span>
    </div>
  )
}
