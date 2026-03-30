import { useContext, useState } from 'react'
import {
  Server, Database, GitBranch, Cpu, Box, Webhook,
  Lock, Download, RefreshCw, Plus, Trash2, Check,
  AlertCircle, Eye, EyeOff, ExternalLink, ChevronRight,
  Save, RotateCcw, FileJson, BookOpen, HardDrive,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import './Settings.css'

// ── Mock settings state (local to this page) ─────────────
const LITELLM_MODELS = [
  { id: 1, alias: 'qwen2.5-14b-vllm',    endpoint: 'http://192.168.1.42:8000/v1', model: 'Qwen/Qwen2.5-14B-Instruct', status: 'connected', latency: '142ms' },
  { id: 2, alias: 'qwen2.5-7b-ollama',   endpoint: 'http://192.168.1.55:11434',   model: 'qwen2.5:7b',                 status: 'connected', latency: '88ms'  },
  { id: 3, alias: 'qwen2.5-72b-vllm',    endpoint: 'http://192.168.1.42:8000/v1', model: 'Qwen/Qwen2.5-72B-Q4',       status: 'idle',      latency: '—'     },
  { id: 4, alias: 'mlx-m1-8b',           endpoint: 'http://192.168.1.71:8080/v1', model: 'mlx-community/Qwen2.5-7B',  status: 'connected', latency: '204ms' },
  { id: 5, alias: 'claude-3-5-sonnet',   endpoint: 'https://api.anthropic.com',   model: 'claude-3-5-sonnet-20241022', status: 'connected', latency: '310ms' },
]

const N8N_WEBHOOKS = [
  { id: 1, name: 'Trigger LoRA Retrain',     url: 'http://192.168.1.10:5678/webhook/retrain-lora',    method: 'POST', status: 'active' },
  { id: 2, name: 'Lore Ingestion Pipeline',  url: 'http://192.168.1.10:5678/webhook/ingest-lore',     method: 'POST', status: 'active' },
  { id: 3, name: 'Refresh Vector Index',     url: 'http://192.168.1.10:5678/webhook/refresh-vectors', method: 'POST', status: 'active' },
  { id: 4, name: 'Rebuild Knowledge Graph',  url: 'http://192.168.1.10:5678/webhook/rebuild-graph',   method: 'POST', status: 'active' },
  { id: 5, name: 'Generation Complete Hook', url: 'http://192.168.1.10:5678/webhook/gen-complete',    method: 'POST', status: 'inactive' },
]

const ENV_VARS = [
  { key: 'ANTHROPIC_API_KEY',        value: 'sk-ant-api03-••••••••••••••••', set: true,  required: true  },
  { key: 'LITELLM_MASTER_KEY',       value: 'sk-••••••••••••••••',           set: true,  required: true  },
  { key: 'QDRANT_HOST',              value: '192.168.1.10',                  set: true,  required: true  },
  { key: 'QDRANT_PORT',              value: '6333',                          set: true,  required: true  },
  { key: 'NEO4J_URI',                value: 'bolt://192.168.1.10:7687',      set: true,  required: true  },
  { key: 'NEO4J_USERNAME',           value: 'neo4j',                         set: true,  required: true  },
  { key: 'NEO4J_PASSWORD',           value: '••••••••',                      set: true,  required: true  },
  { key: 'COMFYUI_HOST',             value: '192.168.1.42:8188',             set: true,  required: false },
  { key: 'N8N_HOST',                 value: '192.168.1.10:5678',             set: true,  required: false },
  { key: 'VLLM_HOST',                value: '192.168.1.42:8000',             set: true,  required: false },
  { key: 'ADAPTER_DIR',              value: '/mnt/adapters',                 set: true,  required: false },
  { key: 'TRAINING_DATA_DIR',        value: '/mnt/training',                 set: true,  required: false },
  { key: 'UNSLOTH_STUDIO_HOST',      value: '192.168.1.42:7860',             set: true,  required: false },
  { key: 'OPENAI_API_KEY',           value: '—',                             set: false, required: false },
  { key: 'HUGGINGFACE_HUB_TOKEN',    value: '—',                             set: false, required: false },
]

// ── Section wrapper ───────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <Icon size={16} className="icon-amber" />
        <h2 className="settings-section-title">{title}</h2>
      </div>
      <div className="settings-section-body">
        {children}
      </div>
    </section>
  )
}

// ── LiteLLM Model Registry ────────────────────────────────
function LiteLLMSection() {
  const [models, setModels] = useState(LITELLM_MODELS)
  const [testing, setTesting] = useState(null)
  const [tested, setTested] = useState({})

  function handleTest(id) {
    setTesting(id)
    setTimeout(() => {
      setTesting(null)
      setTested(prev => ({ ...prev, [id]: true }))
      setTimeout(() => setTested(prev => { const n = { ...prev }; delete n[id]; return n }), 3000)
    }, 1200)
  }

  function handleRemove(id) {
    setModels(prev => prev.filter(m => m.id !== id))
  }

  return (
    <Section icon={Server} title="LITELLM MODEL REGISTRY">
      <div className="settings-row-label">
        <span className="settings-label">Proxy Endpoint</span>
        <div className="settings-input-row">
          <input className="settings-input settings-input-wide" defaultValue="http://192.168.1.10:4000" readOnly />
          <button className="btn-ghost settings-btn-sm"><RefreshCw size={12} /> TEST CONNECTION</button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>ALIAS</th>
            <th>MODEL</th>
            <th>ENDPOINT</th>
            <th>STATUS</th>
            <th>LATENCY</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {models.map(m => (
            <tr key={m.id}>
              <td className="settings-td-alias">{m.alias}</td>
              <td className="settings-td-model">{m.model}</td>
              <td className="settings-td-endpoint">{m.endpoint}</td>
              <td>
                <span className={`model-status model-status-${m.status}`}>
                  <span className="model-status-dot" />
                  {m.status}
                </span>
              </td>
              <td className="settings-td-latency">{m.latency}</td>
              <td>
                <div className="settings-row-actions">
                  <button
                    className={`btn-ghost settings-btn-xs ${testing === m.id ? 'btn-testing' : ''}`}
                    onClick={() => handleTest(m.id)}
                    disabled={testing === m.id}
                  >
                    {testing === m.id ? <RefreshCw size={10} className="spin" /> : tested[m.id] ? <Check size={10} /> : <RefreshCw size={10} />}
                    {testing === m.id ? 'TESTING…' : tested[m.id] ? 'OK' : 'TEST'}
                  </button>
                  <button className="btn-ghost settings-btn-xs btn-danger" onClick={() => handleRemove(m.id)}>
                    <Trash2 size={10} /> REMOVE
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-ghost settings-add-btn">
        <Plus size={12} /> ADD MODEL
      </button>
    </Section>
  )
}

// ── Qdrant Configuration ──────────────────────────────────
function QdrantSection() {
  const { qdrantStats } = useContext(SystemContext)
  const [tested, setTested] = useState(false)

  function handleTest() {
    setTested(false)
    setTimeout(() => setTested(true), 900)
  }

  return (
    <Section icon={Database} title="QDRANT CONFIGURATION">
      <div className="settings-2col">
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">HOST</label>
            <input className="settings-input" defaultValue={qdrantStats.host} />
          </div>
          <div className="settings-field">
            <label className="settings-label">API KEY (optional)</label>
            <input className="settings-input" type="password" defaultValue="" placeholder="not set" />
          </div>
        </div>

        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">DEFAULT EMBEDDING MODEL</label>
            <select className="settings-select">
              <option>nomic-embed-text-v1.5</option>
              <option>bge-m3</option>
              <option>mxbai-embed-large</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">DEFAULT DISTANCE METRIC</label>
            <select className="settings-select">
              <option>Cosine</option>
              <option>Dot</option>
              <option>Euclidean</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-subsection-title">HNSW DEFAULTS</div>
      <div className="settings-hnsw-grid">
        {[
          { label: 'M (max connections)', key: 'm', val: 16 },
          { label: 'EF CONSTRUCT',        key: 'ef', val: 100 },
          { label: 'FULL SCAN THRESHOLD', key: 'fst', val: 10000 },
          { label: 'MAX INDEXING THREADS', key: 'mit', val: 4 },
        ].map(f => (
          <div className="settings-field" key={f.key}>
            <label className="settings-label">{f.label}</label>
            <input className="settings-input" type="number" defaultValue={f.val} />
          </div>
        ))}
      </div>

      <div className="settings-action-row">
        <button className="btn-ghost settings-btn-sm" onClick={handleTest}>
          {tested ? <Check size={12} /> : <RefreshCw size={12} />}
          {tested ? 'CONNECTION OK' : 'TEST CONNECTION'}
        </button>
        <button className="btn-ghost settings-btn-sm">
          <ExternalLink size={12} /> OPEN DASHBOARD
        </button>
        <button className="btn-primary settings-btn-sm">
          <Save size={12} /> SAVE
        </button>
      </div>
    </Section>
  )
}

// ── Neo4j Configuration ───────────────────────────────────
function Neo4jSection() {
  const { neo4jStats } = useContext(SystemContext)
  const [queryResult, setQueryResult] = useState(null)
  const [querying, setQuerying] = useState(false)

  function runTestQuery() {
    setQuerying(true)
    setQueryResult(null)
    setTimeout(() => {
      setQuerying(false)
      setQueryResult({ rows: 3, time: '4ms', sample: 'Kael Theron · Iron Conclave · FIELD_COMMANDER' })
    }, 1100)
  }

  return (
    <Section icon={GitBranch} title="NEO4J CONFIGURATION">
      <div className="settings-2col">
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">CONNECTION URI</label>
            <input className="settings-input" defaultValue={`bolt://${neo4jStats.host.split(':')[0]}:7687`} />
          </div>
          <div className="settings-field">
            <label className="settings-label">HTTP BROWSER HOST</label>
            <input className="settings-input" defaultValue={neo4jStats.host} readOnly />
          </div>
        </div>
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">USERNAME</label>
            <input className="settings-input" defaultValue="neo4j" />
          </div>
          <div className="settings-field">
            <label className="settings-label">PASSWORD</label>
            <input className="settings-input" type="password" defaultValue="neo4j_password" />
          </div>
        </div>
      </div>

      <div className="settings-subsection-title">CONSTRAINT TEMPLATES</div>
      <div className="settings-field">
        <label className="settings-label">CHARACTER STATUS CONSTRAINT</label>
        <textarea className="settings-textarea" readOnly rows={2}
          defaultValue={`MATCH (c:Character) WHERE c.status = 'DEAD' AND c.livedUntil IS NOT NULL RETURN c.name, c.livedUntil`} />
      </div>
      <div className="settings-field">
        <label className="settings-label">CONTINUITY CHECK QUERY</label>
        <textarea className="settings-textarea" readOnly rows={2}
          defaultValue={`MATCH (e:Event)-[:OCCURRED_IN]->(ep:Episode) WHERE ep.number > e.firstMentioned RETURN e.name, ep.number`} />
      </div>

      <div className="settings-subsection-title">QUICK TEST QUERY</div>
      <div className="settings-field">
        <textarea className="settings-textarea" rows={3}
          defaultValue={`MATCH (c:Character)-[:BELONGS_TO]->(f:Faction)\nWHERE f.name = 'Iron Conclave'\nRETURN c.name, c.status, c.role`} />
      </div>
      <div className="settings-action-row">
        <button className="btn-ghost settings-btn-sm" onClick={runTestQuery}>
          {querying ? <RefreshCw size={12} className="spin" /> : <RefreshCw size={12} />}
          {querying ? 'RUNNING…' : 'RUN QUERY'}
        </button>
        <button className="btn-ghost settings-btn-sm">
          <ExternalLink size={12} /> OPEN BROWSER
        </button>
        <button className="btn-primary settings-btn-sm"><Save size={12} /> SAVE</button>
      </div>
      {queryResult && (
        <div className="settings-query-result">
          <span className="qr-ok"><Check size={12} /> {queryResult.rows} rows · {queryResult.time}</span>
          <span className="qr-sample">{queryResult.sample}</span>
        </div>
      )}
    </Section>
  )
}

// ── Unsloth / Training ─────────────────────────────────────
function UnslothSection() {
  return (
    <Section icon={Cpu} title="UNSLOTH / TRAINING">
      <div className="settings-2col">
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">STUDIO HOST</label>
            <input className="settings-input" defaultValue="192.168.1.42:7860" />
          </div>
          <div className="settings-field">
            <label className="settings-label">TRAINING DATA DIR</label>
            <input className="settings-input" defaultValue="/mnt/training/datasets" />
          </div>
          <div className="settings-field">
            <label className="settings-label">OUTPUT ADAPTER DIR</label>
            <input className="settings-input" defaultValue="/mnt/adapters" />
          </div>
        </div>
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">HUGGINGFACE CACHE DIR</label>
            <input className="settings-input" defaultValue="/mnt/hf_cache" />
          </div>
          <div className="settings-field">
            <label className="settings-label">DEFAULT BASE MODEL</label>
            <select className="settings-select">
              <option>Qwen/Qwen2.5-14B-Instruct</option>
              <option>Qwen/Qwen2.5-7B-Instruct</option>
              <option>Qwen/Qwen2.5-32B-Instruct</option>
              <option>meta-llama/Llama-3.3-70B</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-subsection-title">DEFAULT HYPERPARAMETERS</div>
      <div className="settings-hyperparam-grid">
        {[
          { label: 'LEARNING RATE',   val: '2e-4' },
          { label: 'EPOCHS',          val: '3' },
          { label: 'BATCH SIZE',      val: '2' },
          { label: 'GRAD ACCUM',      val: '4' },
          { label: 'WARMUP RATIO',    val: '0.03' },
          { label: 'MAX SEQ LEN',     val: '4096' },
          { label: 'DEFAULT RANK',    val: '32' },
          { label: 'DEFAULT ALPHA',   val: '32' },
          { label: 'DROPOUT',         val: '0.05' },
          { label: 'WEIGHT DECAY',    val: '0.01' },
          { label: 'GENERAL MIX %',   val: '10' },
          { label: 'EVAL STEPS',      val: '50' },
        ].map(f => (
          <div className="settings-field" key={f.label}>
            <label className="settings-label">{f.label}</label>
            <input className="settings-input" defaultValue={f.val} />
          </div>
        ))}
      </div>

      <div className="settings-action-row">
        <button className="btn-ghost settings-btn-sm"><RotateCcw size={12} /> RESET TO DEFAULTS</button>
        <button className="btn-ghost settings-btn-sm"><ExternalLink size={12} /> OPEN UNSLOTH STUDIO</button>
        <button className="btn-primary settings-btn-sm"><Save size={12} /> SAVE</button>
      </div>
    </Section>
  )
}

// ── ComfyUI ────────────────────────────────────────────────
function ComfyUISection() {
  return (
    <Section icon={Box} title="COMFYUI">
      <div className="settings-2col">
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">API ENDPOINT</label>
            <input className="settings-input" defaultValue="http://192.168.1.42:8188" />
          </div>
          <div className="settings-field">
            <label className="settings-label">OUTPUT DIRECTORY</label>
            <input className="settings-input" defaultValue="/mnt/comfyui/output" />
          </div>
          <div className="settings-field">
            <label className="settings-label">MODELS DIRECTORY</label>
            <input className="settings-input" defaultValue="/mnt/comfyui/models" />
          </div>
        </div>
        <div className="settings-field-group">
          <div className="settings-field">
            <label className="settings-label">LORA DIRECTORY</label>
            <input className="settings-input" defaultValue="/mnt/comfyui/models/loras" />
          </div>
          <div className="settings-field">
            <label className="settings-label">DEFAULT STEPS</label>
            <input className="settings-input" type="number" defaultValue="28" />
          </div>
          <div className="settings-field">
            <label className="settings-label">DEFAULT CFG SCALE</label>
            <input className="settings-input" type="number" step="0.5" defaultValue="3.5" />
          </div>
        </div>
      </div>

      <div className="settings-subsection-title">WORKFLOW JSON PATHS</div>
      <div className="settings-field-group">
        {[
          { label: 'CHARACTER IDENTITY WORKFLOW', val: '/workflows/character_identity.json' },
          { label: 'SCENE ILLUSTRATION WORKFLOW',  val: '/workflows/scene_illustration.json' },
          { label: 'STYLE CONSISTENCY WORKFLOW',   val: '/workflows/style_consistency.json' },
          { label: 'VIDEO FRAME WORKFLOW',         val: '/workflows/video_frames.json' },
        ].map(f => (
          <div className="settings-field" key={f.label}>
            <label className="settings-label">{f.label}</label>
            <input className="settings-input settings-input-wide" defaultValue={f.val} />
          </div>
        ))}
      </div>

      <div className="settings-action-row">
        <button className="btn-ghost settings-btn-sm"><RefreshCw size={12} /> TEST CONNECTION</button>
        <button className="btn-ghost settings-btn-sm"><ExternalLink size={12} /> OPEN COMFYUI</button>
        <button className="btn-primary settings-btn-sm"><Save size={12} /> SAVE</button>
      </div>
    </Section>
  )
}

// ── n8n Webhooks ───────────────────────────────────────────
function N8nSection() {
  const [webhooks, setWebhooks] = useState(N8N_WEBHOOKS)
  const [testing, setTesting] = useState(null)
  const [testResults, setTestResults] = useState({})

  function handleTest(id) {
    setTesting(id)
    setTimeout(() => {
      setTesting(null)
      setTestResults(prev => ({ ...prev, [id]: 'ok' }))
      setTimeout(() => setTestResults(prev => { const n = { ...prev }; delete n[id]; return n }), 3000)
    }, 1000)
  }

  function toggleStatus(id) {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w))
  }

  return (
    <Section icon={Webhook} title="N8N WEBHOOKS">
      <div className="settings-row-label">
        <span className="settings-label">N8N HOST</span>
        <div className="settings-input-row">
          <input className="settings-input settings-input-wide" defaultValue="http://192.168.1.10:5678" />
          <button className="btn-ghost settings-btn-sm"><ExternalLink size={12} /> OPEN N8N</button>
        </div>
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>URL</th>
            <th>METHOD</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map(w => (
            <tr key={w.id} className={w.status === 'inactive' ? 'row-inactive' : ''}>
              <td className="settings-td-alias">{w.name}</td>
              <td className="settings-td-endpoint">{w.url}</td>
              <td><span className="method-tag">{w.method}</span></td>
              <td>
                <button
                  className={`webhook-status-btn ${w.status === 'active' ? 'ws-active' : 'ws-inactive'}`}
                  onClick={() => toggleStatus(w.id)}
                >
                  {w.status}
                </button>
              </td>
              <td>
                <div className="settings-row-actions">
                  <button
                    className={`btn-ghost settings-btn-xs`}
                    onClick={() => handleTest(w.id)}
                    disabled={testing === w.id || w.status === 'inactive'}
                  >
                    {testing === w.id ? <RefreshCw size={10} className="spin" /> : testResults[w.id] === 'ok' ? <Check size={10} /> : <RefreshCw size={10} />}
                    {testing === w.id ? 'TESTING…' : testResults[w.id] === 'ok' ? 'OK' : 'TEST'}
                  </button>
                  <button className="btn-ghost settings-btn-xs btn-danger" onClick={() => setWebhooks(prev => prev.filter(ww => ww.id !== w.id))}>
                    <Trash2 size={10} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-ghost settings-add-btn"><Plus size={12} /> ADD WEBHOOK</button>
    </Section>
  )
}

// ── Environment Variables ─────────────────────────────────
function EnvVarsSection() {
  const [revealed, setRevealed] = useState({})

  function toggleReveal(key) {
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const setVars   = ENV_VARS.filter(v => v.set)
  const unsetVars = ENV_VARS.filter(v => !v.set)

  return (
    <Section icon={Lock} title="ENVIRONMENT VARIABLES">
      <div className="env-legend">
        <span className="env-legend-item"><span className="env-dot env-dot-set" /> SET</span>
        <span className="env-legend-item"><span className="env-dot env-dot-unset" /> NOT SET</span>
        <span className="env-legend-item"><span className="env-dot env-dot-required" /> REQUIRED</span>
      </div>
      <table className="settings-table env-table">
        <thead>
          <tr>
            <th>VARIABLE</th>
            <th>VALUE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {setVars.map(v => (
            <tr key={v.key}>
              <td className="env-key">
                {v.required && <span className="env-required-marker">*</span>}
                {v.key}
              </td>
              <td className="env-value">
                <div className="env-value-row">
                  <span className="env-val-text">
                    {revealed[v.key] ? v.value : v.value.replace(/[^•\-]/g, '•').substring(0, 24)}
                  </span>
                  <button className="env-reveal-btn" onClick={() => toggleReveal(v.key)}>
                    {revealed[v.key] ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </div>
              </td>
              <td><span className="env-status env-status-set"><Check size={10} /> SET</span></td>
            </tr>
          ))}
          {unsetVars.map(v => (
            <tr key={v.key} className="env-row-unset">
              <td className="env-key">{v.key}</td>
              <td className="env-value env-val-missing">not configured</td>
              <td><span className="env-status env-status-unset"><AlertCircle size={10} /> NOT SET</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="env-note">
        Environment variables are read-only in this view. Edit <code>.env</code> on the hub node to change values.
      </p>
    </Section>
  )
}

// ── Export / Backup ────────────────────────────────────────
function ExportSection() {
  const [exported, setExported] = useState({})

  function handleExport(key) {
    setExported(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setExported(prev => { const n = { ...prev }; delete n[key]; return n }), 2500)
  }

  const exports = [
    { key: 'config',    icon: FileJson,  label: 'PROJECT CONFIG',      desc: 'All service endpoints, adapter manifest, pipeline config', fmt: 'JSON' },
    { key: 'bibles',    icon: BookOpen,  label: 'SERIES BIBLES',       desc: 'All active series bibles as formatted Markdown files',     fmt: 'ZIP/MD' },
    { key: 'adapters',  icon: HardDrive, label: 'ADAPTER MANIFEST',    desc: 'Metadata for all registered LoRA adapters',                fmt: 'JSON' },
    { key: 'lore',      icon: Database,  label: 'LORE ENTITY DUMP',    desc: 'All Lore Library entities with relationships',             fmt: 'JSON' },
    { key: 'full',      icon: HardDrive, label: 'FULL SYSTEM BACKUP',  desc: 'Complete backup: config + manifests + entity data',        fmt: 'ZIP' },
  ]

  return (
    <Section icon={Download} title="EXPORT / BACKUP">
      <div className="export-grid">
        {exports.map(ex => (
          <div className="export-card" key={ex.key}>
            <div className="export-card-left">
              <ex.icon size={18} className="icon-amber" />
              <div className="export-card-text">
                <div className="export-card-label">{ex.label}</div>
                <div className="export-card-desc">{ex.desc}</div>
              </div>
            </div>
            <div className="export-card-right">
              <span className="export-fmt">{ex.fmt}</span>
              <button
                className={`btn-ghost settings-btn-sm ${exported[ex.key] ? 'btn-exported' : ''}`}
                onClick={() => handleExport(ex.key)}
              >
                {exported[ex.key] ? <Check size={12} /> : <Download size={12} />}
                {exported[ex.key] ? 'EXPORTED' : 'EXPORT'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-subsection-title" style={{ marginTop: 20 }}>BACKUP SCHEDULE</div>
      <div className="settings-2col">
        <div className="settings-field">
          <label className="settings-label">AUTO BACKUP</label>
          <select className="settings-select">
            <option>Daily at 03:00</option>
            <option>Weekly (Sunday)</option>
            <option>Manual only</option>
          </select>
        </div>
        <div className="settings-field">
          <label className="settings-label">BACKUP DESTINATION</label>
          <input className="settings-input" defaultValue="/mnt/backups/spacejunker-studio" />
        </div>
      </div>
      <div className="settings-action-row" style={{ marginTop: 12 }}>
        <span className="settings-last-backup">Last backup: <span className="settings-last-backup-ts">2026-03-29 03:00:14</span></span>
        <button className="btn-primary settings-btn-sm"><HardDrive size={12} /> RUN BACKUP NOW</button>
      </div>
    </Section>
  )
}

// ── Main Settings Page ─────────────────────────────────────
export default function Settings() {
  const SECTIONS = [
    { id: 'litellm',  label: 'LITELLM',    icon: Server },
    { id: 'qdrant',   label: 'QDRANT',     icon: Database },
    { id: 'neo4j',    label: 'NEO4J',      icon: GitBranch },
    { id: 'unsloth',  label: 'UNSLOTH',    icon: Cpu },
    { id: 'comfyui',  label: 'COMFYUI',    icon: Box },
    { id: 'n8n',      label: 'N8N',        icon: Webhook },
    { id: 'env',      label: 'ENV VARS',   icon: Lock },
    { id: 'export',   label: 'EXPORT',     icon: Download },
  ]

  const [activeSection, setActiveSection] = useState('litellm')

  function renderSection() {
    switch (activeSection) {
      case 'litellm': return <LiteLLMSection />
      case 'qdrant':  return <QdrantSection />
      case 'neo4j':   return <Neo4jSection />
      case 'unsloth': return <UnslothSection />
      case 'comfyui': return <ComfyUISection />
      case 'n8n':     return <N8nSection />
      case 'env':     return <EnvVarsSection />
      case 'export':  return <ExportSection />
      default:        return null
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">CONFIGURATION</div>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`settings-nav-item ${activeSection === s.id ? 'settings-nav-active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <s.icon size={14} />
            <span>{s.label}</span>
            <ChevronRight size={12} className="settings-nav-arrow" />
          </button>
        ))}
      </div>
      <div className="settings-content">
        {renderSection()}
      </div>
    </div>
  )
}
