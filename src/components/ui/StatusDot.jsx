import './StatusDot.css'

// status: 'active' | 'training' | 'idle' | 'offline' | 'retrieving' | 'error'
// size: 'sm' | 'md' (default)
export default function StatusDot({ status = 'idle', label, size = 'md' }) {
  return (
    <span className={`status-dot-wrap status-dot-${size}`}>
      <span className={`status-dot dot-${status}`} />
      {label && <span className="status-dot-label">{label}</span>}
    </span>
  )
}
