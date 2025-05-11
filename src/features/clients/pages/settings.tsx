// pages/settings.tsx
import Head from 'next/head'
import Layout from '@shared/components/Layout'

export default function SettingsPage() {
  return (
    <Layout>
      <Head>
        <title>Administration – MonApp</title>
      </Head>

      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Administration</h1>
        <p className="text-zinc-400">Contenu des paramètres à venir…</p>
      </div>
    </Layout>
  )
}

