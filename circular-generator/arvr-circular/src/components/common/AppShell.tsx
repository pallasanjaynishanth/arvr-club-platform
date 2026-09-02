import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'
import clsx from 'clsx'
import { isFirebaseConfigured } from '@/services/firebase'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/circulars/new', label: 'Create Circular' },
  { to: '/events', label: 'Saved Events' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/arvr-logo.png"
              alt=""
              className="h-9 w-9 rounded object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div>
              <p className="text-sm font-semibold leading-tight text-navy-800">
                ARVR Club Circular Generator
              </p>
              <p className="text-xs leading-tight text-slate-500">Pragati University</p>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-navy-700 text-navy-800'
                    : 'border-transparent text-slate-500 hover:text-navy-700'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <span
            className="cursor-not-allowed whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-300"
            title="Coming in Phase 2"
          >
            Reports — Coming Soon
          </span>
        </nav>
      </header>
      {!isFirebaseConfigured && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 sm:px-6">
          Firebase environment variables are missing — Save Draft and reference numbers won't
          work until .env is filled in from .env.example.
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
