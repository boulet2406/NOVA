// components/ui/card.tsx
import React from 'react'

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-700 mb-2 text-lg font-semibold text-white">
      {children}
    </div>
  )
}

export function CardContent({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="text-gray-200">{children}</div>
}
