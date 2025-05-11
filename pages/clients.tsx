import React, { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { generateMockClients } from '../mockClients'
import { Users, Download } from 'lucide-react'

type Client = ReturnType<typeof generateMockClients>[0]

export default function ClientsPage() {
  const clients = useMemo(() => generateMockClients(), [])
  const [sortKey, setSortKey] = useState<'riskScore' | 'behavioralScore' | null>(null)
  const [search, setSearch] = useState({ nom: '', prenom: '', code: '' })

  const filtered = useMemo(
    () =>
      clients.filter(c =>
        c.lastName.toLowerCase().includes(search.nom.toLowerCase()) &&
        c.firstName.toLowerCase().includes(search.prenom.toLowerCase()) &&
        c.id.toLowerCase().includes(search.code.toLowerCase())
      ),
    [clients, search]
  )

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => b[sortKey] - a[sortKey])
  }, [filtered, sortKey])

  const exportCsv = () => {
    const rows = sorted.map(c => {
      const lastDate = c.scoreHistory[0]?.date || ''
      return [
        c.id,
        `"${c.firstName}"`,
        `"${c.lastName}"`,
        c.riskScore,
        c.behavioralScore,
        lastDate
      ].join(',')
    })
    const header = 'ID,Prénom,Nom,AML Score,Opérationnel Score,Dernière mise à jour'
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'clients.csv'
    a.click()
  }

  return (
    <>
      <Head>
        <title>Liste des Clients – MonApp</title>
      </Head>
      <div className="min-h-screen bg-zinc-950 text-white p-10 space-y-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Users size={32} /> Liste des Clients
        </h1>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom"
            className="w-full rounded px-3 py-2 bg-zinc-800 text-white"
            onChange={e => setSearch(s => ({ ...s, nom: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Prénom"
            className="w-full rounded px-3 py-2 bg-zinc-800 text-white"
            onChange={e => setSearch(s => ({ ...s, prenom: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Code client"
            className="w-full rounded px-3 py-2 bg-zinc-800 text-white"
            onChange={e => setSearch(s => ({ ...s, code: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setSortKey('riskScore')}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition"
          >
            Trier AML
          </button>
          <button
            onClick={() => setSortKey('behavioralScore')}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition"
          >
            Trier Opérationnel
          </button>
          <button
            onClick={() => setSortKey(null)}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded transition ml-auto"
          >
            Réinitialiser
          </button>
          <button
            onClick={exportCsv}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white flex items-center gap-2 transition"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto rounded-lg shadow-inner">
          <table className="min-w-full text-sm bg-zinc-900">
            <thead className="bg-zinc-800 text-zinc-400">
              <tr>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">AML Score</th>
                <th className="px-4 py-2 text-left">Opérationnel Score</th>
                <th className="px-4 py-2 text-left">Dernière mise à jour</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => {
                const lastDate = c.scoreHistory[0]?.date || '—'
                return (
                  <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-800 transition">
                    <td className="px-4 py-2 text-blue-400">
                      <Link href={`/client/${c.id}`} className="hover:underline">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{c.id}</td>
                    <td className="px-4 py-2">{c.riskScore}/100</td>
                    <td className="px-4 py-2">{c.behavioralScore}/100</td>
                    <td className="px-4 py-2 text-zinc-300">{lastDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
