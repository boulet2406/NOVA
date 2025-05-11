// pages/admin.tsx
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { generateMockUsers, Role, User } from '../mockUsers'
import { tr } from '@faker-js/faker'

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('user')

  useEffect(() => {
    setUsers(generateMockUsers())
  }, [])

  const handleAddUser = () => {
    if (!username || !password) {
      toast.error("Veuillez fournir un nom d’utilisateur et mot de passe")
      return
    }
    setUsers([{ id: Date.now().toString(), username, password, role }, ...users])
    toast.success('Utilisateur ajouté')
    setUsername('')
    setPassword('')
    setRole('user')
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id))
    toast.success('Utilisateur supprimé')
  }

  const handleRoleChange = (id: string, newRole: Role) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
    toast.success('Rôle mis à jour')
  }

  return (
    <>
      <Head>
        <title>Administration – MonApp</title>
      </Head>

      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <Toaster position="bottom-right" />

        <h1 className="text-2xl font-bold mb-6">Administration Utilisateurs</h1>

        <section className="mb-8 bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Ajouter un Utilisateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nom d’utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-zinc-800 px-3 py-2 rounded focus:outline-none"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-zinc-800 px-3 py-2 rounded focus:outline-none"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="bg-zinc-800 px-3 py-2 rounded focus:outline-none"
            >
              <option value="user">Utilisateur</option>
              <option value="analyst">Analyste</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <button
            onClick={handleAddUser}
            className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-500 transition"
          >
            Ajouter
          </button>
        </section>

        <section className="bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Liste des Utilisateurs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-zinc-950 rounded">
              <thead className="bg-zinc-800 text-zinc-400">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Utilisateur</th>
                  <th className="px-4 py-2">Rôle</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-zinc-700 hover:bg-zinc-800">
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                        className="bg-zinc-700 px-2 py-1 rounded transition focus:outline-none"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="analyst">Analyste</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
