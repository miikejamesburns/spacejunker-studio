import { createContext, useState, useEffect, useRef } from 'react'
import {
  nodes as initialNodes,
  services as initialServices,
  qdrantCollections,
  qdrantStats,
  neo4jStats,
  adapters,
  agents,
  universe,
  series,
  loreEntities,
  seriesEpisodes,
  seriesConsistencyLog,
  trainingJobs,
  generationState,
  activityLog as initialLog,
  systemStatus as initialStatus,
} from '../data/mockData'

export const SystemContext = createContext(null)

// Log entry templates for auto-generation
const LOG_TEMPLATES = [
  (step) => ({ agent: 'Unsloth',      type: 'CHECKPOINT',    detail: `darkmatter_s02_update — step ${step} · loss ${(0.74 + Math.random() * 0.05).toFixed(3)}` }),
  ()     => ({ agent: 'Scene Writer', type: 'RAG_QUERY',     detail: `Retrieved ${3 + Math.floor(Math.random() * 9)} chunks · avg ${10 + Math.floor(Math.random() * 20)}ms` }),
  ()     => ({ agent: 'Qdrant',       type: 'VECTOR_INSERT', detail: `+${10 + Math.floor(Math.random() * 40)} vectors committed → darkmatter_s02` }),
  ()     => ({ agent: 'Neo4j',        type: 'CONSTRAINT_PASS', detail: 'Relationship validation passed — 0 violations' }),
  ()     => ({ agent: 'ComfyUI',      type: 'GEN_COMPLETE',  detail: `Scene ${10 + Math.floor(Math.random() * 3)} visual · 6 frames generated` }),
  ()     => ({ agent: 'Story Editor', type: 'RAG_QUERY',     detail: `Consistency check complete · ${Math.floor(Math.random() * 5)} chunks retrieved` }),
]

function pad(n) { return String(n).padStart(2, '0') }
function nowTS() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function SystemProvider({ children }) {
  const [nodes, setNodes] = useState(initialNodes)
  const [systemStatus, setSystemStatus] = useState(initialStatus)
  const [activityLog, setActivityLog] = useState(initialLog)
  const [training, setTraining] = useState(trainingJobs)
  const [generation, setGeneration] = useState(generationState)
  const logIdRef = useRef(initialLog.length + 1)
  const stepRef = useRef(trainingJobs.active.currentStep)

  // Simulated live: VRAM fluctuation every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        const delta = (Math.random() - 0.5) * 2
        const newUsed = Math.max(0.5, Math.min(node.vramTotal * 0.95, node.vramUsed + delta))
        const tempDelta = (Math.random() - 0.5) * 1.5
        const newTemp = Math.max(40, Math.min(85, node.gpuTemp + tempDelta))
        return { ...node, vramUsed: +newUsed.toFixed(1), gpuTemp: Math.round(newTemp) }
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Simulated live: new log entry every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      stepRef.current += Math.floor(Math.random() * 8) + 3
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
      const entry = template(stepRef.current)
      const newEntry = { id: logIdRef.current++, ts: nowTS(), ...entry }
      setActivityLog(prev => [newEntry, ...prev.slice(0, 49)])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Simulated live: training progress every 10s
  useEffect(() => {
    if (!training.active) return
    const interval = setInterval(() => {
      setTraining(prev => {
        if (!prev.active) return prev
        const step = Math.min(prev.active.totalSteps, prev.active.currentStep + Math.floor(Math.random() * 8) + 4)
        const trainLoss = Math.max(0.68, prev.active.currentTrainLoss - (Math.random() * 0.004) + (Math.random() * 0.001))
        const evalLoss = Math.max(0.74, prev.active.currentEvalLoss - (Math.random() * 0.003) + (Math.random() * 0.001))
        const newHistory = [
          ...prev.active.lossHistory,
          { step, train: +trainLoss.toFixed(4), eval: +evalLoss.toFixed(4) },
        ].slice(-200)
        return {
          ...prev,
          active: {
            ...prev.active,
            currentStep: step,
            currentTrainLoss: +trainLoss.toFixed(3),
            currentEvalLoss: +evalLoss.toFixed(3),
            lossHistory: newHistory,
            elapsedSec: (prev.active.elapsedSec + 10) % 60,
            elapsedMin: prev.active.elapsedMin + (prev.active.elapsedSec + 10 >= 60 ? 1 : 0),
          },
        }
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Simulated live: generation token count every 3s
  useEffect(() => {
    if (!generation.active) return
    const interval = setInterval(() => {
      setGeneration(prev => {
        if (!prev.active) return prev
        const added = Math.floor(Math.random() * 80) + 40
        const newTokens = Math.min(prev.active.tokensEstimated, prev.active.tokensGenerated + added)
        return {
          ...prev,
          active: {
            ...prev.active,
            tokensGenerated: newTokens,
          },
        }
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const value = {
    nodes,
    services: initialServices,
    qdrantCollections,
    qdrantStats,
    neo4jStats,
    adapters,
    agents,
    universe,
    series,
    loreEntities,
    seriesEpisodes,
    seriesConsistencyLog,
    training,
    generation,
    activityLog,
    systemStatus,
  }

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  )
}
