// components/Header.tsx

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState, useEffect, ReactNode } from 'react'
import {
  LogOut,
  Home,
  Users,
  AlertTriangle,
  FileText,
  Sun,
  Moon
} from 'lucide-react'
import { generateMockClients } from '../mockClients'

export default function Header() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Récupère l'utilisateur
  useEffect(() => {
    const stored = localStorage.getItem('AUTH_USER')
    if (stored) setUsername(JSON.parse(stored).username)
  }, [])

  // Initialise le thème depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    // si stored==='light', on retire 'dark', sinon on l'ajoute
    if (stored === 'light') {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    } else {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    }
  }, [])

  function applyTheme(t: 'light' | 'dark') {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem('AUTH_USER')
    router.replace('/login')
  }

  // Premier client pour le lien “Scoring”
  const clients = generateMockClients()
  const firstClientId = clients[0]?.id

  function NavItem({
    href,
    icon,
    children
  }: {
    href: string
    icon?: ReactNode
    children: ReactNode
  }) {
    const active =
      router.pathname === href || router.pathname.startsWith(href + '/')
    const cls = `px-3 py-1 rounded transition ${
      active ? 'text-blue-300' : 'hover:underline'
    }`
    return active ? (
      <span className={cls}>{icon}{children}</span>
    ) : (
      <Link href={href} className={cls}>
        {icon}{children}
      </Link>
    )
  }

  return (
    <header className="
      bg-white text-black
      dark:bg-zinc-900 dark:text-white
      px-6 py-4 flex items-center justify-between shadow-md
    ">
      <div className="flex items-center gap-6">
        <Home className="h-6 w-6 text-blue-400" />
        <span className="text-xl font-bold">NOVA</span>
        <nav className="flex gap-4">
          <NavItem href="/">Accueil</NavItem>
          <NavItem href="/clients" icon={<Users size={16} className="inline-block mr-1" />}>
            Clients
          </NavItem>
          {firstClientId && (
            <NavItem
              href={`/client/${firstClientId}`}
              icon={<AlertTriangle size={16} className="inline-block mr-1" />}
            >
              Scoring
            </NavItem>
          )}
          <NavItem href="/admin" icon={<FileText size={16} className="inline-block mr-1" />}>
            Administration
          </NavItem>
          <NavItem href="/reports">Rapports</NavItem>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Toggle thème */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="
            p-1 rounded transition
            hover:bg-zinc-200 dark:hover:bg-zinc-800
          "
        >
          {theme === 'dark'
            ? <Sun  className="h-5 w-5 text-yellow-400" />
            : <Moon className="h-5 w-5 text-indigo-600" />
          }
        </button>

        {username && (
          <span className="
            bg-zinc-200 text-zinc-900
            dark:bg-zinc-800 dark:text-white
            px-3 py-1 rounded flex items-center gap-1
          ">
            <Users size={16} /> {username}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-1
            bg-red-600 hover:bg-red-500
            px-3 py-1 rounded transition
          "
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </header>
  )
}
