type Props = {
  label: string
  error?: string
  children: React.ReactNode
}

export default function FormField({ label, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-charcoal">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
