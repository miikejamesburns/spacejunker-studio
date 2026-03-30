import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemProvider } from './context/SystemContext'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import Cluster from './pages/Cluster'
import LoreLayer from './pages/LoreLayer'
import Agents from './pages/Agents'
import LoreLibrary from './pages/LoreLibrary'
import AdapterVault from './pages/AdapterVault'
import Training from './pages/Training'
import Generation from './pages/Generation'
import SeriesRegistry from './pages/SeriesRegistry'
import Settings from './pages/Settings'
import Tutorial from './pages/Tutorial'

export default function App() {
  return (
    <BrowserRouter>
      <SystemProvider>
        <Layout>
          <Routes>
            <Route path="/"              element={<Overview />} />
            <Route path="/cluster"       element={<Cluster />} />
            <Route path="/lore-layer"    element={<LoreLayer />} />
            <Route path="/agents"        element={<Agents />} />
            <Route path="/lore-library"  element={<LoreLibrary />} />
            <Route path="/adapter-vault" element={<AdapterVault />} />
            <Route path="/training"      element={<Training />} />
            <Route path="/generation"    element={<Generation />} />
            <Route path="/series"        element={<SeriesRegistry />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/tutorial"      element={<Tutorial />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SystemProvider>
    </BrowserRouter>
  )
}
