import './ProgressBar.css'

// Segmented retro-tech progress bar
// size: 'xs' | 'sm' | 'md'
export default function ProgressBar({ value, max = 100, label, unit = '', accent = 'amber', size = 'sm' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const segments = size === 'xs' ? 16 : size === 'sm' ? 20 : 24
  const filledCount = Math.round((pct / 100) * segments)

  return (
    <div className={`progress-bar-wrap progress-${size}`}>
      {label && (
        <div className="progress-label-row">
          <span className="progress-label">{label}</span>
          <span className="progress-value font-mono">{value}{unit}</span>
        </div>
      )}
      <div className="progress-segments">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`progress-seg seg-${accent} ${i < filledCount ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
