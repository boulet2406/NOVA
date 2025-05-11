// pages/index.tsx
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, ReactNode, useRef } from 'react'
import { generateMockClients } from '../mockClients'
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  BellRing,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip
} from 'recharts'
import Layout from '../components/Layout'

type Client = ReturnType<typeof generateMockClients>[number]

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([])
  const prevMetrics = useRef<{ aml: number; op: number }>({ aml: 0, op: 0 })
  const [metrics, setMetrics] = useState({
    total: 0,
    lowAML: 0,
    medAML: 0,
    highAML: 0,
    avgOp: 0
  })

  // Calcul initial + périodique
  useEffect(() => {
    const compute = () => {
      const data = generateMockClients()
      const total = data.length
      const lowAML  = data.filter(c => c.riskScore < 33).length
      const medAML  = data.filter(c => c.riskScore >= 33 && c.riskScore < 66).length
      const highAML = data.filter(c => c.riskScore >= 66).length
      const avgOp   = Math.round(data.reduce((s,c)=>s+c.behavioralScore,0)/total)

      // mémoriser l'ancien
      prevMetrics.current = { aml: metrics.avgOp, op: metrics.avgOp }
      setMetrics({ total, lowAML, medAML, highAML, avgOp })
      setClients(data)
    }

    compute()
    const id = setInterval(compute, 5 * 60 * 1000) // toutes les 5 minutes
    return () => clearInterval(id)
  }, [])

  const delta = (current: number, previous: number) => {
    if (previous === 0) return null
    const diff = current - previous
    const pct  = Math.round((diff/previous)*100)
    return { diff, pct }
  }

  // Données pour le camembert AML
  const dataAML = [
    { name: 'Faible', value: metrics.lowAML,  color: '#22c55e' },
    { name: 'Moyen',  value: metrics.medAML,  color: '#eab308' },
    { name: 'Élevé',  value: metrics.highAML, color: '#ef4444' }
  ]

  // Top 5 (inchangés pour alléger l’exemple)
  const topAML = [...clients].sort((a,b) => b.riskScore - a.riskScore).slice(0,5)
  const topOp  = [...clients].sort((a,b) => b.behavioralScore - a.behavioralScore).slice(0,5)

  const trendAML = delta(metrics.highAML, prevMetrics.current.aml)
  const trendOp  = delta(metrics.avgOp, prevMetrics.current.op)

  return (
    <Layout>
      <Head><title>NOVA – Dashboard LCB/FT</title></Head>
      <main className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
        {/* Hero */}
        <section className="py-16 text-center">
          <h1 className="text-6xl font-extrabold uppercase animate-pulse-slow">
            NOVA
          </h1>
          <p className="mt-4 text-xl text-zinc-300">
            Next-Gen Operational Viewpoint for Anomalies
          </p>
        </section>

        {/* KPI + Tendances */}
        <section className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users size={32} />}
            label="Total Clients"
            value={metrics.total.toLocaleString()}
            gradient="from-indigo-500 to-purple-600"
          />
          <StatCard
            icon={<ShieldAlert size={32} />}
            label="Faible AML"
            value={metrics.lowAML}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            icon={<AlertTriangle size={32} />}
            label="Moyen AML"
            value={metrics.medAML}
            gradient="from-yellow-400 to-yellow-600"
          />
          <StatCard
            icon={<TrendingUp size={32} />}
            label="Haut AML"
            value={metrics.highAML}
            gradient="from-red-400 to-red-600"
            highlight
            trend={trendAML}
          />
        </section>

        {/* Charts + Opé trend */}
        <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Répartition AML</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataAML}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name} ${(percent! * 100).toFixed(0)}%`
                    }
                  >
                    {dataAML.map((e,i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <ReTooltip
                    formatter={v => `${v}`}
                    contentStyle={{ background: '#222', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <h2 className="text-2xl font-semibold mb-4">Score Opérationnel Moy.</h2>
            <div className="text-6xl font-bold text-cyan-400 flex items-center justify-center h-full gap-2">
              {metrics.avgOp}/100
              {trendOp && (
                trendOp.pct > 0
                  ? <TrendingUp className="text-green-400" />
                  : <TrendingDown className="text-red-400" />
              )}
            </div>
            {trendOp && (
              <div className="mt-2 text-sm text-zinc-400 text-center">
                {trendOp.pct > 0 ? '+' : ''}{trendOp.pct}% vs précédent
              </div>
            )}
          </div>
        </section>

        {/* Top 5 */}
        <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
          <TopList
            title="Top 5 AML"
            icon={<AlertTriangle size={24} />}
            items={topAML.map(c => ({
              id: c.id,
              label: `${c.firstName} ${c.lastName}`,
              score: c.riskScore
            }))}
          />
          <TopList
            title="Top 5 Opérationnel"
            icon={<BellRing size={24} />}
            items={topOp.map(c => ({
              id: c.id,
              label: `${c.firstName} ${c.lastName}`,
              score: c.behavioralScore
            }))}
          />
        </section>
      </main>
    </Layout>
  )
}

// — UI Helpers — 

function StatCard({
  icon,
  label,
  value,
  gradient,
  highlight,
  trend
}: {
  icon: ReactNode
  label: string
  value: string | number
  gradient: string
  highlight?: boolean
  trend?: { diff: number; pct: number } | null
}) {
  const arrow = trend
    ? trend.pct > 0
      ? <TrendingUp className="text-green-300 inline-block ml-2" />
      : <TrendingDown className="text-red-300 inline-block ml-2" />
    : null

  return (
    <div className={`
      bg-gradient-to-r ${gradient}
      p-6 rounded-xl shadow-lg transform-gpu hover:scale-105 transition
      ${ highlight ? 'ring-4 ring-yellow-400' : '' }
    `}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm opacity-80">{label}</span>
        <span className="text-3xl font-bold flex items-center">
          {value}{arrow}
        </span>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  )
}

function TopList({
  title,
  icon,
  items
}: {
  title: string
  icon: ReactNode
  items: { id: string; label: string; score: number }[]
}) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        {icon}{title}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={it.id} className="flex justify-between hover:bg-zinc-800 p-2 rounded transition">
            <Link href={`/client/${it.id}`} className="text-blue-400 hover:underline">
              {i+1}. {it.label}
            </Link>
            <span className="font-medium">{it.score}/100</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
