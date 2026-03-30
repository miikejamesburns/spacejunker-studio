import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <TopBar />
      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}
