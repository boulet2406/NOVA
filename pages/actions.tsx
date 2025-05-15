// pages/action.tsx
import React, { useState, useMemo } from 'react'
import Header from '../components/Header'
import { Search, Filter, Calendar, User, CheckCircle, XCircle, Clock, Edit3, MessageCircle } from 'lucide-react'

interface ActionPlan {
  id: string
  title: string
  owner: string
  createdAt: string
  dueDate: string
  updatedAt: string
  priority: 'Urgent' | 'Haute' | 'Moyenne' | 'Basse'
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
  progress: number  // 0–100
  comments: number
}

const mockActionPlans: ActionPlan[] = [
  {
    id: 'AP-001',
    title: 'Audit des comptes clients',
    owner: 'Alice Dupont',
    createdAt: '2025-01-10',
    dueDate: '2025-06-15',
    updatedAt: '2025-03-20',
    priority: 'Haute',
    status: 'In Progress',
    progress: 45,
    comments: 3
  },
  {
    id: 'AP-002',
    title: 'Mise à jour procédure KYC',
    owner: 'Bob Martin',
    createdAt: '2024-11-05',
    dueDate: '2025-05-30',
    updatedAt: '2025-04-10',
    priority: 'Moyenne',
    status: 'Completed',
    progress: 100,
    comments: 8
  },
  {
    id: 'AP-003',
    title: 'Revue des contrôles IT',
    owner: 'Claire Bernard',
    createdAt: '2025-02-01',
    dueDate: '2025-07-01',
    updatedAt: '2025-02-15',
    priority: 'Basse',
    status: 'Not Started',
    progress: 0,
    comments: 0
  },
  {
    id: 'AP-004',
    title: 'Formation équipe conformité',
    owner: 'David Leclerc',
    createdAt: '2025-01-20',
    dueDate: '2025-06-01',
    updatedAt: '2025-03-01',
    priority: 'Urgent',
    status: 'Blocked',
    progress: 20,
    comments: 5
  },
  {
    id: 'AP-005',
    title: 'Test plan de continuité',
    owner: 'Elodie Fabre',
    createdAt: '2025-03-10',
    dueDate: '2025-08-10',
    updatedAt: '2025-04-25',
    priority: 'Haute',
    status: 'In Progress',
    progress: 60,
    comments: 2
  },
]

const statuses = ['All', 'Not Started', 'In Progress', 'Completed', 'Blocked'] as const

const ActionPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<typeof statuses[number]>('All')

  const filtered = useMemo(() => {
    return mockActionPlans.filter(plan => {
      const text = `${plan.id} ${plan.title} ${plan.owner}`.toLowerCase()
      const matchText = text.includes(search.toLowerCase())
      const matchStatus = filterStatus === 'All' || plan.status === filterStatus
      return matchText && matchStatus
    })
  }, [search, filterStatus])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Suivi des plans d'action</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-4 py-2 w-full sm:w-48 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-zinc-700">
              <tr>
                {[
                  'ID',
                  'Titre',
                  'Responsable',
                  'Créé le',
                  'Échéance',
                  'Dernière MAJ',
                  'Priorité',
                  'Statut',
                  'Avancement',
                  'Commentaires'
                ].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {filtered.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                  <td className="px-4 py-3 text-sm font-mono">{plan.id}</td>
                  <td className="px-4 py-3 text-sm">{plan.title}</td>
                  <td className="px-4 py-3 text-sm flex items-center gap-2">
                    <User size={16} /> {plan.owner}
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center gap-2">
                    <Clock size={16} /> {plan.createdAt}
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center gap-2">
                    <Calendar size={16} /> {plan.dueDate}
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center gap-2">
                    <Edit3 size={16} /> {plan.updatedAt}
                  </td>
                  <td className="px-4 py-3 text-sm">{plan.priority}</td>
                  <td className="px-4 py-3 text-sm">
                    {plan.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} /> {plan.status}
                      </span>
                    ) : plan.status === 'Blocked' ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle size={16} /> {plan.status}
                      </span>
                    ) : (
                      <span className="text-yellow-500">{plan.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          plan.progress === 100
                            ? 'bg-green-500'
                            : plan.progress >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.progress}%</p>
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center gap-1">
                    <MessageCircle size={16} /> {plan.comments}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Aucune action trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default ActionPage
