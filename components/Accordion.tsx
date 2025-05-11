// components/Accordion.tsx
import { useState, ReactNode } from 'react';
type AccordionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};
export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center p-4 cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-sm font-semibold text-zinc-400">{title}</span>
        <svg
          className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-zinc-700">
          {children}
        </div>
      )}
    </div>
  );
}
