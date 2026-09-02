export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-navy-200 border-t-navy-600"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner size={28} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}
