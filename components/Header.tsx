// components/Header.tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
  useCallback
} from 'react'
import { generateMockClients } from '../mockClients'
import {
  LogOut,
  Home,
  Users,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  Settings,
  Sun,
  Moon
} from 'lucide-react'

interface NestedItem { label: string; href: string }
interface SubmenuItem { label: string; href: string; nested?: NestedItem[] }
interface NavItemConfig { label: string; href: string; icon: ReactNode; submenu?: SubmenuItem[] }

export const Header: React.FC = () => {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light'|'dark'>('dark')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [openNested, setOpenNested] = useState<string | null>(null)

  const menuCloseTimer = useRef<NodeJS.Timeout| null>(null)
  const nestedCloseTimer = useRef<NodeJS.Timeout| null>(null)

  // Fallback pour Scoring
  const fallbackClientId = useMemo(() => generateMockClients(1)[0].id, [])
  const { id } = router.query
  const currentClientId = Array.isArray(id) ? id[0] : id || fallbackClientId

  const nestedLcbft: NestedItem[] = [
    { label: 'Accueil Compliance', href: '/compliance' },
    { label: 'Clients', href: '/clients' },
    { label: 'Scoring', href: `/client/${currentClientId}` }
  ]

  const navItems: NavItemConfig[] = [
    {
      label: 'Audit', href: '/audit', icon: <AlertTriangle className="inline-block mr-1" />, submenu: [
        { label: 'Accueil Audit', href: '/audit' },
        { label: "Plan d'audit", href: '/audit/plan' },
        { label: 'Constats', href: '/audit/constats' },
        { label: 'Recommandation', href: '/audit/recommandation' }
      ]
    },
    {
      label: 'Risks', href: '/risks', icon: <Home className="inline-block mr-1" />, submenu: [
        { label: 'Accueil Risks', href: '/risks' },
        { label: 'ERM', href: '/risks/erm' },
        { label: 'Internal Controls', href: '/controls', nested: [
            { label: 'Accueil Internal Controls', href: '/controls' },
            { label: 'Campagnes', href: '/campaigns' },
            { label: 'Controls', href: '/controls' }
          ]
        }
      ]
    },
    {
      label: 'Compliance', href: '/compliance', icon: <Shield className="inline-block mr-1" />, submenu: [
        { label: 'Accueil Compliance', href: '/compliance', nested: nestedLcbft },
        { label: 'Policies', href: '/compliance/policies' }
      ]
    },
    {
      label: 'Security', href: '/security', icon: <FileText className="inline-block mr-1" />, submenu: [
        { label: 'Accueil Security', href: '/security' },
        { label: 'Incidents', href: '/security/incidents' },
        { label: 'Settings', href: '/security/settings' }
      ]
    },
    { label: 'Actions', href: '/actions', icon: <Activity className="inline-block mr-1" /> },
    { label: 'Administration', href: '/admin', icon: <Settings className="inline-block mr-1" /> }
  ]

  useEffect(() => {
    const u = localStorage.getItem('AUTH_USER')
    if (u) setUsername(JSON.parse(u).username)
    const th = localStorage.getItem('theme') as 'light'|'dark'|null
    if (th === 'light') {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    } else {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }
  const handleLogout = () => {
    localStorage.removeItem('AUTH_USER')
    router.replace('/login')
  }

  // Handlers pour ouvrir/fermer avec délai
  const onMenuEnter = useCallback((label: string) => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
    setOpenMenu(label)
  }, [])

  const onMenuLeave = useCallback(() => {
    menuCloseTimer.current = setTimeout(() => {
      setOpenMenu(null)
      setOpenNested(null)
    }, 200)
  }, [])

  const onSubEnter = useCallback((href: string) => {
    if (nestedCloseTimer.current) clearTimeout(nestedCloseTimer.current)
    setOpenNested(href)
  }, [])

  const onSubLeave = useCallback(() => {
    nestedCloseTimer.current = setTimeout(() => {
      setOpenNested(null)
    }, 200)
  }, [])

  return (
    <header className="bg-white dark:bg-zinc-900 text-black dark:text-white px-6 py-4 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center px-3 py-1 rounded hover:text-blue-600">
          <Home className="h-6 w-6 text-blue-400" />
          <span className="ml-2 text-xl font-bold">NOVA</span>
        </Link>

        <nav className="flex gap-4 relative">
          {navItems.map(item => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => onMenuEnter(item.label)}
              onMouseLeave={onMenuLeave}
            >
              <Link
                href={item.href}
                className={`px-3 py-1 rounded ${
                  router.pathname.startsWith(item.href)
                    ? 'text-blue-400'
                    : 'hover:text-blue-600'
                }`}
              >
                {item.icon}{item.label}
              </Link>

              {item.submenu && openMenu === item.label && (
                <ul
                  className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 shadow rounded z-30"
                  onMouseEnter={() => {
                    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
                  }}
                  onMouseLeave={onMenuLeave}
                >
                  {item.submenu.map(sub => (
                    <li
                      key={sub.href}
                      className="relative"
                      onMouseEnter={() => sub.nested ? onSubEnter(sub.href) : undefined}
                      onMouseLeave={sub.nested ? onSubLeave : undefined}
                    >
                      <Link
                        href={sub.href}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {sub.label}
                      </Link>

                      {sub.nested && openNested === sub.href && (
                        <ul
                          className="absolute top-0 left-full ml-1 w-40 bg-white dark:bg-zinc-800 shadow rounded z-40"
                          onMouseEnter={() => {
                            if (nestedCloseTimer.current) clearTimeout(nestedCloseTimer.current)
                          }}
                          onMouseLeave={onSubLeave}
                        >
                          {sub.nested.map(n => (
                            <li key={n.href}>
                              <Link
                                href={n.href}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
                              >
                                {n.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700">
          {theme === 'dark'
            ? <Sun className="w-5 h-5 text-yellow-400"/>
            : <Moon className="w-5 h-5 text-indigo-600"/>
          }
        </button>
        {username && (
          <span className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white px-3 py-1 rounded">
            <Users size={16}/>{username}
          </span>
        )}
        <button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">
          <LogOut size={16}/> Déconnexion
        </button>
      </div>
    </header>
  )
}

export default Header
