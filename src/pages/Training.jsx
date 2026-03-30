import { useContext, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  Plus, Play, Square, Pause, ExternalLink,
  ChevronRight, ChevronDown, X, Check,
  Zap, Cpu, Thermometer, Clock,
  BarChart2, ArrowRight,
} from 'lucide-react'
import { SystemContext } from '../context/SystemContext'
import StatusDot from '../components/ui/StatusDot'
import ProgressBar from '../components/ui/ProgressBar'
import './Training.css'

const PRIORITY_COLORS = { HIGH: 'coral', MED: 'amber', LOW: 'muted' }
const TYPE_COLORS      = { LLM: 'llm', FLUX: 'flux', 'WAN2.2': 'wan' }

export default function Training() {
  const { training } = useContext(SystemContext)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [expandedJob, setExpandedJob] = useState(null)

  const { active, queue, completed } = training

  return (
    <div className="training-page">

      {/* ── Title ── */}
      <div className="training-title-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 22 }}>Training</h1>
          <p className="section-label" style={{ marginTop: 4 }}>
            {active ? '1 job running' : 'No active job'} · {queue.length} queued · {completed.length} completed
          </p>
        </div>
        <button className="btn-primary training-new-btn" onClick={() => setWizardOpen(true)}>
          <Plus size={13} />
          NEW TRAINING JOB
        </button>
      </div>

      {/* ── Active Monitor ── */}
      {active && <ActiveMonitor job={active} />}

      {/* ── Queue ── */}
      <div className="card training-section">
        <div className="training-section-header">
          <span className="section-title" style={{ fontSize: 16 }}>Training Queue</span>
          <div className="queue-node-row">
            <span className="section-label">Node:</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>RTX 5090</span>
            <button className="btn-ghost" style={{ padding: '3px 8px', fontSize: 10 }}>CHANGE</button>
          </div>
        </div>

        <table className="training-table">
          <thead>
            <tr>
              <th>JOB NAME</th>
              <th>TYPE</th>
              <th>MODEL BASE</th>
              <th>PRIORITY</th>
              <th>SCHEDULED</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* Active job row */}
            {active && (
              <tr className="queue-row queue-row-active">
                <td>
                  <span className="font-mono queue-job-name">{active.name}</span>
                </td>
                <td><TypeBadge type={active.type} /></td>
                <td><span className="font-mono" style={{ fontSize: 11 }}>{active.baseModel}</span></td>
                <td><PriorityBadge p={active.priority} /></td>
                <td><span className="font-mono text-amber" style={{ fontSize: 11 }}>NOW</span></td>
                <td>
                  <StatusDot status="training" label="RUNNING" size="sm" />
                </td>
                <td>
                  <div className="queue-actions">
                    <button className="queue-action-btn queue-abort"><Square size={11} /> ABORT</button>
                    <button className="queue-action-btn"><Pause size={11} /> PAUSE</button>
                  </div>
                </td>
              </tr>
            )}
            {/* Queued jobs */}
            {queue.map(job => (
              <tr key={job.id} className="queue-row">
                <td><span className="font-mono queue-job-name">{job.name}</span></td>
                <td><TypeBadge type={job.type} /></td>
                <td><span className="font-mono" style={{ fontSize: 11 }}>{job.baseModel}</span></td>
                <td><PriorityBadge p={job.priority} /></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.scheduled}</span></td>
                <td>
                  <StatusDot status="idle" label="QUEUED" size="sm" />
                </td>
                <td>
                  <button className="queue-action-btn queue-cancel"><X size={11} /></button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && !active && (
              <tr>
                <td colSpan={7} className="queue-empty">No jobs queued</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Completed Jobs ── */}
      <div className="card training-section">
        <div className="training-section-header">
          <span className="section-title" style={{ fontSize: 16 }}>Completed Jobs</span>
          <span className="section-label">{completed.length} jobs</span>
        </div>

        <table className="training-table">
          <thead>
            <tr>
              <th>JOB NAME</th>
              <th>TYPE</th>
              <th>DATE</th>
              <th>DURATION</th>
              <th>FINAL LOSS</th>
              <th>SIZE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {completed.map(job => (
              <tr key={job.id} className="queue-row">
                <td><span className="font-mono queue-job-name">{job.name}</span></td>
                <td><TypeBadge type={job.type} /></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.date}</span></td>
                <td><span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.duration}</span></td>
                <td>
                  <span className="font-mono text-amber" style={{ fontSize: 12 }}>{job.loss}</span>
                </td>
                <td><span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.size}</span></td>
                <td>
                  <div className="queue-actions">
                    <button className="queue-action-btn"><BarChart2 size={11} /> METRICS</button>
                    <button className="queue-action-btn"><ArrowRight size={11} /> DEPLOY</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── New Training Job Wizard ── */}
      {wizardOpen && <TrainingWizard onClose={() => setWizardOpen(false)} />}
    </div>
  )
}

// ── Active Job Monitor ─────────────────────────────────────────────────────
function ActiveMonitor({ job }) {
  const progress = Math.round((job.currentStep / job.totalSteps) * 100)
  const epochPct  = Math.round((job.currentStep / (job.totalSteps / job.epochs)) % 1 * 100) || Math.round((job.currentStep % (job.totalSteps / job.epochs)) / (job.totalSteps / job.epochs) * 100)

  // Only show last 100 data points for performance
  const chartData = job.lossHistory.slice(-100)

  return (
    <div className="card active-monitor">
      {/* Header */}
      <div className="monitor-header">
        <div className="monitor-title-group">
          <StatusDot status="training" size="sm" />
          <span className="section-title" style={{ fontSize: 16 }}>Active Job:</span>
          <span className="font-mono monitor-job-name">{job.name}</span>
        </div>
        <div className="monitor-header-actions">
          <button className="queue-action-btn monitor-abort-btn">
            <Square size={12} /> ABORT
          </button>
          <button className="queue-action-btn">
            <Pause size={12} /> PAUSE
          </button>
          <button className="queue-action-btn">
            <ExternalLink size={12} /> OPEN UNSLOTH STUDIO
          </button>
        </div>
      </div>

      {/* Two-column layout: stats + chart */}
      <div className="monitor-body">

        {/* Left: metadata + metrics */}
        <div className="monitor-left">
          {/* Config grid */}
          <div className="monitor-config-grid">
            <MonitorStat label="BASE MODEL"    value={job.baseModel}   />
            <MonitorStat label="NODE"          value={job.node}        highlight />
            <MonitorStat label="ADAPTER"       value={job.adapter}     highlight />
            <MonitorStat label="RANK"          value={`r=${job.rank}`} highlight />
            <MonitorStat label="DATASET"       value={`${job.datasetSize.toLocaleString()} pairs`} />
            <MonitorStat label="EPOCHS"        value={`${job.currentEpoch} / ${job.epochs}`} />
          </div>

          <div className="monitor-divider" />

          {/* System stats */}
          <div className="monitor-sys-row">
            <div className="monitor-sys-stat">
              <Cpu size={12} color="var(--text-muted)" strokeWidth={1.5} />
              <span className="section-label" style={{ fontSize: 9 }}>VRAM</span>
              <span className="font-mono" style={{ fontSize: 12, color: job.vramUsed / job.vramTotal > 0.85 ? 'var(--coral)' : 'var(--text-primary)' }}>
                {job.vramUsed} / {job.vramTotal} GB
              </span>
            </div>
            <div className="monitor-sys-stat">
              <Thermometer size={12} color="var(--text-muted)" strokeWidth={1.5} />
              <span className="section-label" style={{ fontSize: 9 }}>GPU TEMP</span>
              <span className="font-mono" style={{ fontSize: 12, color: job.gpuTemp > 80 ? 'var(--coral)' : job.gpuTemp > 70 ? 'var(--amber)' : 'var(--text-primary)' }}>
                {job.gpuTemp}°C
              </span>
            </div>
            <div className="monitor-sys-stat">
              <Clock size={12} color="var(--text-muted)" strokeWidth={1.5} />
              <span className="section-label" style={{ fontSize: 9 }}>ELAPSED</span>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                {job.elapsedMin}m {String(job.elapsedSec).padStart(2,'0')}s
              </span>
            </div>
            <div className="monitor-sys-stat">
              <Zap size={12} color="var(--text-muted)" strokeWidth={1.5} />
              <span className="section-label" style={{ fontSize: 9 }}>ETA</span>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                ~{job.etaMin} min
              </span>
            </div>
          </div>

          <div className="monitor-divider" />

          {/* Progress */}
          <div className="monitor-progress-section">
            <div className="monitor-progress-header">
              <span className="section-label">Overall Progress</span>
              <span className="font-mono text-amber" style={{ fontSize: 12 }}>{progress}%</span>
            </div>
            <ProgressBar value={job.currentStep} max={job.totalSteps} accent="amber" size="sm" />

            <div className="monitor-step-info">
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Step {job.currentStep.toLocaleString()} / {job.totalSteps.toLocaleString()}
              </span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Epoch {job.currentEpoch} / {job.epochs}
              </span>
            </div>
          </div>

          <div className="monitor-divider" />

          {/* Live metrics table */}
          <div className="monitor-metrics">
            <div className="metrics-header">
              <span className="section-label">Live Metrics</span>
              <span className="section-label" style={{ fontSize: 9, color: 'var(--text-muted)' }}>updates every 10s</span>
            </div>
            <div className="metrics-row metrics-header-row">
              <span>STEP</span>
              <span>TRAIN LOSS</span>
              <span>EVAL LOSS</span>
              <span>LR</span>
              <span>TOK/S</span>
            </div>
            {[
              { step: job.currentStep,     tl: job.currentTrainLoss,         el: job.currentEvalLoss,         lr: job.currentLR.toExponential(2),         tps: job.tokensPerSec },
              { step: job.currentStep - 3, tl: +(job.currentTrainLoss + 0.008).toFixed(3), el: +(job.currentEvalLoss + 0.007).toFixed(3), lr: (job.currentLR * 1.06).toExponential(2), tps: 3901 },
              { step: job.currentStep - 8, tl: +(job.currentTrainLoss + 0.021).toFixed(3), el: +(job.currentEvalLoss + 0.014).toFixed(3), lr: (job.currentLR * 1.11).toExponential(2), tps: 3812 },
            ].map((row, i) => (
              <div key={i} className={`metrics-row ${i === 0 ? 'metrics-row-current' : ''}`}>
                <span className="font-mono">{row.step}</span>
                <span className={`font-mono ${i === 0 ? 'text-amber' : ''}`}>{row.tl}</span>
                <span className={`font-mono ${i === 0 ? 'text-cyan' : ''}`}>{row.el}</span>
                <span className="font-mono" style={{ fontSize: 10 }}>{row.lr}</span>
                <span className="font-mono">{row.tps.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Loss curve */}
        <div className="monitor-chart-section">
          <div className="chart-header">
            <span className="section-label">Loss Curve</span>
            <div className="chart-legend">
              <span className="chart-legend-item">
                <span className="chart-legend-line" style={{ background: 'var(--amber)' }} />
                TRAIN
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-line" style={{ background: 'var(--cyan)', borderTop: '1px dashed var(--cyan)', height: 0 }} />
                EVAL
              </span>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="step"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={v => v}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 11,
                  }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                  labelFormatter={v => `Step ${v}`}
                  formatter={(val, name) => [val.toFixed(4), name === 'train' ? 'Train Loss' : 'Eval Loss']}
                />
                <Line
                  type="monotone"
                  dataKey="train"
                  stroke="var(--amber)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--amber)', strokeWidth: 0 }}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(200,146,42,0.4))' }}
                />
                <Line
                  type="monotone"
                  dataKey="eval"
                  stroke="var(--cyan)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--cyan)', strokeWidth: 0 }}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(0,212,200,0.3))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current values below chart */}
          <div className="chart-current-row">
            <div className="chart-current-stat">
              <span className="section-label">TRAIN LOSS</span>
              <span className="font-mono text-amber" style={{ fontSize: 18 }}>
                {job.currentTrainLoss}
              </span>
            </div>
            <div className="chart-current-sep" />
            <div className="chart-current-stat">
              <span className="section-label">EVAL LOSS</span>
              <span className="font-mono text-cyan" style={{ fontSize: 18 }}>
                {job.currentEvalLoss}
              </span>
            </div>
            <div className="chart-current-sep" />
            <div className="chart-current-stat">
              <span className="section-label">TOKENS/SEC</span>
              <span className="font-mono" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
                {job.tokensPerSec.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
function MonitorStat({ label, value, highlight }) {
  return (
    <div className="monitor-stat">
      <span className="monitor-stat-label">{label}</span>
      <span className={`monitor-stat-val font-mono ${highlight ? 'text-amber' : ''}`}>{value}</span>
    </div>
  )
}

function TypeBadge({ type }) {
  const cls = { LLM: 'tag-amber', FLUX: 'tag-cyan', 'WAN2.2': 'tag-coral' }[type] || 'tag-muted'
  return <span className={`tag ${cls}`} style={{ fontSize: 10 }}>{type}</span>
}

function PriorityBadge({ p }) {
  const cls = { HIGH: 'tag-coral', MED: 'tag-amber', LOW: 'tag-muted' }[p] || 'tag-muted'
  return <span className={`tag ${cls}`} style={{ fontSize: 10 }}>{p}</span>
}

// ── Training Wizard ───────────────────────────────────────────────────────
const ADAPTER_TYPES = [
  { id: 'llm-sft',    label: 'LLM LoRA',     sub: 'Narrative Voice / Knowledge',        icon: '◉' },
  { id: 'flux-char',  label: 'FLUX LoRA',     sub: 'Character Identity',                 icon: '◈' },
  { id: 'flux-style', label: 'FLUX LoRA',     sub: 'Visual Style / Universe',            icon: '⊞' },
  { id: 'wan-video',  label: 'WAN 2.2 LoRA',  sub: 'Video Motion Style',                 icon: '⊛' },
]

const LLM_DEFAULTS = {
  jobName: '',
  baseModel: 'Qwen2.5-14B-Instruct',
  tier: 'T2 — Series',
  series: 'Dark Matter',
  rank: 32,
  alpha: 32,
  dropout: 0.05,
  lr: '2e-4',
  epochs: 3,
  maxSeqLen: 4096,
  method: 'qlora',
  dataSource: 'auto',
  generalMix: 10,
}

const FLUX_DEFAULTS = {
  jobName: '',
  model: 'FLUX.1-dev',
  tool: 'kohya-ss',
  triggerWord: '',
  rank: 16,
  steps: 1500,
  lr: '4e-4',
  imageCount: 0,
  captionMode: 'manual',
  augmentation: true,
}

function TrainingWizard({ onClose }) {
  const [step, setStep]           = useState(1)
  const [adapterType, setAdapterType] = useState(null)
  const [llmConfig, setLlmConfig] = useState(LLM_DEFAULTS)
  const [fluxConfig, setFluxConfig] = useState(FLUX_DEFAULTS)

  const isLLM  = adapterType === 'llm-sft'
  const isFLUX = adapterType === 'flux-char' || adapterType === 'flux-style'
  const isWAN  = adapterType === 'wan-video'

  const config = isLLM ? llmConfig : fluxConfig

  function estimateTime() {
    if (isLLM)  return `~${Math.round(llmConfig.epochs * 15 + llmConfig.rank)} min`
    if (isFLUX) return `~${Math.round(fluxConfig.steps / 35)} min`
    return '~90 min'
  }

  function estimateVRAM() {
    if (isLLM) {
      const base = 7.2
      const lora = llmConfig.rank >= 32 ? 0.3 : 0.15
      const method = llmConfig.method === 'qlora' ? 0 : 4
      return `${(base + lora + method + 2).toFixed(1)} GB`
    }
    return '18.4 GB'
  }

  return (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-modal" onClick={e => e.stopPropagation()}>

        {/* Wizard header */}
        <div className="wizard-header">
          <span className="section-title" style={{ fontSize: 18 }}>New Training Job</span>
          <button className="detail-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Step indicator */}
        <div className="wizard-steps">
          {['Adapter Type', 'Configuration', 'Review & Launch'].map((label, i) => (
            <div key={i} className={`wizard-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <span className="wizard-step-num">
                {step > i + 1 ? <Check size={11} /> : i + 1}
              </span>
              <span className="wizard-step-label">{label}</span>
              {i < 2 && <ChevronRight size={12} color="var(--text-muted)" />}
            </div>
          ))}
        </div>

        <div className="wizard-body">

          {/* ── Step 1: Type ── */}
          {step === 1 && (
            <div className="wizard-step-content">
              <p className="wizard-step-title">What are you training?</p>
              <div className="wizard-type-grid">
                {ADAPTER_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`wizard-type-card ${adapterType === t.id ? 'selected' : ''}`}
                    onClick={() => setAdapterType(t.id)}
                  >
                    <span className="wizard-type-icon">{t.icon}</span>
                    <span className="wizard-type-label font-mono">{t.label}</span>
                    <span className="wizard-type-sub">{t.sub}</span>
                    {adapterType === t.id && (
                      <span className="wizard-type-check"><Check size={12} /></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Config ── */}
          {step === 2 && isLLM && (
            <div className="wizard-config">
              <div className="wizard-config-grid">
                <WizardField label="JOB NAME" type="text"
                  value={llmConfig.jobName}
                  onChange={v => setLlmConfig(p => ({ ...p, jobName: v }))}
                  placeholder="e.g. darkmatter_s02_update"
                />
                <WizardSelect label="BASE MODEL"
                  value={llmConfig.baseModel}
                  options={['Qwen2.5-14B-Instruct', 'Qwen2.5-7B-Instruct', 'Qwen2.5-32B-Instruct']}
                  onChange={v => setLlmConfig(p => ({ ...p, baseModel: v }))}
                />
                <WizardSelect label="TIER"
                  value={llmConfig.tier}
                  options={['T1 — Universe', 'T2 — Series', 'T3 — Character']}
                  onChange={v => setLlmConfig(p => ({ ...p, tier: v }))}
                />
                <WizardSelect label="SERIES"
                  value={llmConfig.series}
                  options={['Dark Matter', 'The Conclave Wars', 'Fragments']}
                  onChange={v => setLlmConfig(p => ({ ...p, series: v }))}
                />
              </div>

              <div className="wizard-divider" />

              <div className="wizard-config-grid">
                <div className="wizard-field">
                  <span className="wizard-field-label">RANK</span>
                  <div className="wizard-rank-pills">
                    {[8, 16, 32, 64].map(r => (
                      <button
                        key={r}
                        className={`rank-pill ${llmConfig.rank === r ? 'active' : ''}`}
                        onClick={() => setLlmConfig(p => ({ ...p, rank: r, alpha: r }))}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <WizardField label="ALPHA" type="text" value={llmConfig.alpha}
                  onChange={v => setLlmConfig(p => ({ ...p, alpha: Number(v) }))} />
                <WizardField label="DROPOUT" type="text" value={llmConfig.dropout}
                  onChange={v => setLlmConfig(p => ({ ...p, dropout: Number(v) }))} />
                <WizardField label="LEARNING RATE" type="text" value={llmConfig.lr}
                  onChange={v => setLlmConfig(p => ({ ...p, lr: v }))} />
                <WizardField label="EPOCHS" type="number" value={llmConfig.epochs}
                  onChange={v => setLlmConfig(p => ({ ...p, epochs: Number(v) }))} />
                <WizardField label="MAX SEQ LENGTH" type="number" value={llmConfig.maxSeqLen}
                  onChange={v => setLlmConfig(p => ({ ...p, maxSeqLen: Number(v) }))} />
              </div>

              <div className="wizard-divider" />

              <div className="wizard-field">
                <span className="wizard-field-label">TRAINING METHOD</span>
                <div className="wizard-radio-row">
                  {['qlora', 'full-sft'].map(m => (
                    <label key={m} className={`wizard-radio ${llmConfig.method === m ? 'active' : ''}`}>
                      <input type="radio" name="method" value={m} checked={llmConfig.method === m}
                        onChange={() => setLlmConfig(p => ({ ...p, method: m }))} />
                      {m === 'qlora' ? 'QLoRA' : 'Full SFT'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="wizard-divider" />

              <div className="wizard-field">
                <span className="wizard-field-label">TRAINING DATA</span>
                <div className="wizard-radio-col">
                  {[
                    { v: 'auto',   label: 'Use auto-generated from Lore Library', sub: '1,402 pairs ready' },
                    { v: 'upload', label: 'Upload custom JSONL file', sub: '' },
                    { v: 'mix',    label: 'Mix both (recommended)', sub: '' },
                  ].map(opt => (
                    <label key={opt.v} className={`wizard-radio-card ${llmConfig.dataSource === opt.v ? 'active' : ''}`}>
                      <input type="radio" name="datasource" value={opt.v} checked={llmConfig.dataSource === opt.v}
                        onChange={() => setLlmConfig(p => ({ ...p, dataSource: opt.v }))} />
                      <span className="wizard-radio-main">{opt.label}</span>
                      {opt.sub && <span className="wizard-radio-sub">{opt.sub}</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && isFLUX && (
            <div className="wizard-config">
              <div className="wizard-config-grid">
                <WizardField label="JOB NAME" type="text"
                  value={fluxConfig.jobName}
                  onChange={v => setFluxConfig(p => ({ ...p, jobName: v }))}
                  placeholder="e.g. kael_theron_v2"
                />
                <WizardSelect label="MODEL"
                  value={fluxConfig.model}
                  options={['FLUX.1-dev', 'FLUX.1-schnell']}
                  onChange={v => setFluxConfig(p => ({ ...p, model: v }))}
                />
                <WizardSelect label="TRAINING TOOL"
                  value={fluxConfig.tool}
                  options={['kohya-ss', 'AI-Toolkit', 'SimpleTuner']}
                  onChange={v => setFluxConfig(p => ({ ...p, tool: v }))}
                />
                <WizardField label="TRIGGER WORD" type="text"
                  value={fluxConfig.triggerWord}
                  onChange={v => setFluxConfig(p => ({ ...p, triggerWord: v.toUpperCase() }))}
                  placeholder="e.g. KAEL_THERON"
                />
                <WizardField label="STEPS" type="number" value={fluxConfig.steps}
                  onChange={v => setFluxConfig(p => ({ ...p, steps: Number(v) }))} />
                <WizardField label="LEARNING RATE" type="text" value={fluxConfig.lr}
                  onChange={v => setFluxConfig(p => ({ ...p, lr: v }))} />
              </div>

              <div className="wizard-divider" />

              <div className="wizard-field">
                <span className="wizard-field-label">TRAINING IMAGES</span>
                <div className="flux-drop-zone">
                  <span className="flux-drop-label">DROP 15–20 CURATED IMAGES HERE</span>
                  <span className="flux-drop-sub">
                    Uploaded: {fluxConfig.imageCount} images
                    {fluxConfig.imageCount < 15 && <span className="text-coral"> (need minimum 15)</span>}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && isWAN && (
            <div className="wizard-config">
              <p className="wizard-step-title" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                WAN 2.2 video LoRA training configuration — similar to FLUX but with video clips as input.
              </p>
              <WizardField label="JOB NAME" type="text" value="" onChange={() => {}} placeholder="e.g. darkmatter_motion_v1" />
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="wizard-review">
              <p className="wizard-step-title">Review your training configuration</p>

              <div className="card review-card">
                <div className="review-header">
                  <TypeBadge type={isLLM ? 'LLM' : isFLUX ? 'FLUX' : 'WAN2.2'} />
                  <span className="font-mono review-name">
                    {isLLM ? (llmConfig.jobName || 'unnamed_job') : (fluxConfig.jobName || 'unnamed_job')}
                  </span>
                </div>
                <div className="review-grid">
                  {isLLM && <>
                    <ReviewKV k="BASE MODEL"  v={llmConfig.baseModel} />
                    <ReviewKV k="RANK"        v={`r=${llmConfig.rank}`} accent />
                    <ReviewKV k="EPOCHS"      v={llmConfig.epochs} />
                    <ReviewKV k="LR"          v={llmConfig.lr} />
                    <ReviewKV k="METHOD"      v={llmConfig.method.toUpperCase()} />
                    <ReviewKV k="DATA SOURCE" v={llmConfig.dataSource === 'auto' ? 'Auto-generated (1,402 pairs)' : llmConfig.dataSource} />
                  </>}
                  {isFLUX && <>
                    <ReviewKV k="MODEL"   v={fluxConfig.model} />
                    <ReviewKV k="TOOL"    v={fluxConfig.tool} />
                    <ReviewKV k="STEPS"   v={fluxConfig.steps} />
                    <ReviewKV k="TRIGGER" v={fluxConfig.triggerWord || '—'} accent />
                  </>}
                  <ReviewKV k="EST. TIME"  v={estimateTime()} />
                  <ReviewKV k="EST. VRAM"  v={estimateVRAM()} accent />
                  <ReviewKV k="TARGET NODE" v="RTX 5090 (32 GB)" accent />
                </div>
              </div>

              <div className="wizard-launch-btn-row">
                <button className="btn-primary wizard-launch-btn">
                  <Play size={14} />
                  LAUNCH TRAINING
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard footer */}
        <div className="wizard-footer">
          <button className="btn-ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
            {step === 1 ? 'CANCEL' : '← BACK'}
          </button>
          <button
            className="btn-primary"
            onClick={() => step < 3 ? setStep(s => s + 1) : null}
            disabled={step === 1 && !adapterType}
          >
            {step < 3 ? 'NEXT →' : 'LAUNCH'}
          </button>
        </div>
      </div>
    </div>
  )
}

function WizardField({ label, type, value, onChange, placeholder }) {
  return (
    <div className="wizard-field">
      <span className="wizard-field-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="wizard-input"
      />
    </div>
  )
}

function WizardSelect({ label, value, options, onChange }) {
  return (
    <div className="wizard-field">
      <span className="wizard-field-label">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="wizard-select">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function ReviewKV({ k, v, accent }) {
  return (
    <div className="review-kv">
      <span className="detail-k">{k}</span>
      <span className={`font-mono review-val ${accent ? 'text-amber' : ''}`}>{String(v)}</span>
    </div>
  )
}
