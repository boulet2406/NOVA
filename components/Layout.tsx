// components/Layout.tsx

import React from 'react'
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="
        pt-20 min-h-screen
        bg-white text-black
        dark:bg-zinc-950 dark:text-white
      ">
        {children}
      </main>
    </>
  )
}
