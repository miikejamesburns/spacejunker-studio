import { useContext } from 'react'
import { SystemContext } from '../../context/SystemContext'
import './TopBar.css'

export default function TopBar() {
  const { systemStatus } = useContext(SystemContext)

  const items = [
    {
      dot: 'green',
      label: 'CLUSTER',
      value: `${systemStatus.clusterOnline}/${systemStatus.clusterTotal} NODES ONLINE`,
    },
    {
      dot: 'cyan',
      label: 'QDRANT',
      value: `${systemStatus.qdrantVectors.toLocaleString()} VECTORS`,
    },
    {
      dot: 'cyan',
      label: 'NEO4J',
      value: `${systemStatus.neo4jNodes.toLocaleString()} NODES`,
    },
    {
      dot: 'amber',
      label: 'ACTIVE SERIES',
      value: String(systemStatus.activeSeries),
    },
    {
      dot: 'amber',
      label: 'ADAPTERS LOADED',
      value: String(systemStatus.adaptersLoaded),
    },
    {
      dot: systemStatus.trainingStatus === 'IDLE' ? 'muted' : 'amber',
      label: 'TRAINING',
      value: systemStatus.trainingStatus,
      pulse: systemStatus.trainingStatus !== 'IDLE',
    },
    {
      dot: systemStatus.generationQueue > 0 ? 'amber' : 'muted',
      label: 'QUEUE',
      value: `${systemStatus.generationQueue} JOBS`,
    },
  ]

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {items.map((item, i) => (
          <div key={i} className="topbar-item">
            <span className={`topbar-dot dot-${item.dot}${item.pulse ? ' dot-pulse' : ''}`} />
            <span className="topbar-label">{item.label}:</span>
            <span className="topbar-value">{item.value}</span>
            {i < items.length - 1 && <span className="topbar-sep" />}
          </div>
        ))}
      </div>
    </header>
  )
}
