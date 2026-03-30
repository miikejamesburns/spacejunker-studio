import './MetricCard.css'

export default function MetricCard({ label, value, delta, accent = 'amber' }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className={`metric-value font-mono text-${accent}`}>{value}</span>
      {delta && <span className="metric-delta">{delta}</span>}
    </div>
  )
}
