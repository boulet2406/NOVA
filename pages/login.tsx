// pages/login.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Lock } from 'lucide-react'

/** Liste d'utilisateurs autorisés (demo) */
const USERS = [
  { username: 'Jean',               password: 'JeanB2406' },
 // { username: 'Caroline',           password: 'Caroline' },
 // { username: 'Fiona',              password: 'Fiona' },
 // { username: 'Pascal',             password: 'Pascal' },
 // { username: 'Thomas',             password: 'Thomas' },
 // { username: 'Armand',             password: 'Armand' },
]

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('AUTH_USER')) {
      router.replace('/')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Recherche de l'utilisateur dans la liste
    const found = USERS.find(u => u.username === user.trim() && u.password === pwd)
    if (found) {
      localStorage.setItem('AUTH_USER', JSON.stringify({ username: found.username }))
      router.replace('/')
    } else {
      setError('Identifiant ou mot de passe incorrect.')
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-login.jpg')" }}
    >
      <div className="w-80 p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md space-y-6">
        <h1
          className="
            text-center
            text-6xl
            font-extrabold
            bg-clip-text text-transparent
            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
          "
        >
          NOVA
        </h1>

        <p className="text-center text-xs text-gray-500 uppercase tracking-wide">
          Next-Gen Operational Viewpoint for Anomalies
        </p>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-gray-600">Utilisateur</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Identifiant"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="block text-sm text-gray-600">Mot de passe</label>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-10"
            />
            <Lock className="absolute right-3 top-9 text-gray-400" size={18} />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition"
          >
            Se connecter
          </button>

          {/* Faux bouton SSO */}
          <button
            type="button"
            onClick={() => alert('SSO non connecté (demo)')}
            className="w-full py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded transition"
          >
            Connexion SSO
          </button>
        </form>
      </div>
    </div>
  )
}
