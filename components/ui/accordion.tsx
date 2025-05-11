// components/ui/accordion.tsx
import React from 'react'
import { Disclosure } from '@headlessui/react'

export function Accordion({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="space-y-2">{children}</div>
}

export function AccordionItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return <Disclosure as="div">{children}</Disclosure>
}

export function AccordionTrigger({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Disclosure.Button className="w-full text-left bg-gray-700 px-4 py-2 rounded text-white hover:bg-gray-600">
      {children}
    </Disclosure.Button>
  )
}

export function AccordionContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Disclosure.Panel className="px-4 py-2 bg-gray-800 text-gray-200 rounded-b">
      {children}
    </Disclosure.Panel>
  )
}
