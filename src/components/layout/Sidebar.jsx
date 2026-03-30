import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Database,
  Bot,
  BookOpen,
  Layers,
  Zap,
  Film,
  Tv2,
  Settings,
  Circle,
  GraduationCap,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/',              label: 'Overview',       icon: LayoutDashboard },
  { path: '/cluster',       label: 'Cluster',        icon: Server },
  { path: '/lore-layer',    label: 'Lore Layer',     icon: Database },
  { path: '/agents',        label: 'Agents',         icon: Bot },
  { path: '/lore-library',  label: 'Lore Library',   icon: BookOpen },
  { path: '/adapter-vault', label: 'Adapter Vault',  icon: Layers },
  { path: '/training',      label: 'Training',       icon: Zap },
  { path: '/generation',    label: 'Generation',     icon: Film },
  { path: '/series',        label: 'Series Registry', icon: Tv2 },
  { path: '/settings',      label: 'Settings',       icon: Settings },
  { path: '/tutorial',      label: 'Tutorial',       icon: GraduationCap },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Wordmark */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">⬡</span>
        <span className="sidebar-brand-text">SpaceJunker</span>
      </div>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <span className="sidebar-item-label">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom system status */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <div className="sidebar-status">
          <span className="sidebar-item-icon">
            <Circle size={8} fill="#4caf7d" color="#4caf7d" className="status-dot-live" />
          </span>
          <span className="sidebar-item-label sidebar-status-label">System Status</span>
        </div>
      </div>
    </aside>
  )
}
