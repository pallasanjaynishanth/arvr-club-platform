import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import clsx from 'clsx'

interface ToastMessage {
  id: number
  text: string
  variant: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (text: string, variant?: ToastMessage['variant']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, variant: ToastMessage['variant'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, text, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in',
              t.variant === 'success' && 'bg-emerald-600 text-white',
              t.variant === 'error' && 'bg-red-600 text-white',
              t.variant === 'info' && 'bg-navy-800 text-white'
            )}
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
