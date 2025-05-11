// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

const publicPaths = ['/', '/login', '/favicon.ico']

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const path = router.pathname
    const isPublic = publicPaths.includes(path)
      || path.startsWith('/_next/')
      || path.startsWith('/api/')
    const isLogged = !!localStorage.getItem('AUTH_USER')

    if (!isPublic && !isLogged) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready && !publicPaths.includes(router.pathname)) {
    return null
  }

  const isPublic = publicPaths.includes(router.pathname)

  return isPublic
    ? <Component {...pageProps} />
    : <Layout><Component {...pageProps} /></Layout>
}
