import React from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Button({ children, variant = 'primary', size = 'md', loading, icon, className, ...props }: any) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0'
  const v: any = {
    primary: 'bg-brand hover:bg-brand-dark text-dark',
    secondary: 'bg-dark-300 hover:bg-dark-400 text-white border border-dark-400',
    ghost: 'text-gray-400 hover:text-white hover:bg-dark-300',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
  }
  const s: any = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button className={cn(base, v[variant], s[size], className)} disabled={props.disabled || loading} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

export function Input({ label, error, icon, suffix, className, ...props }: any) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
        <input className={cn('w-full bg-dark-300 border text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none text-sm transition-all focus:border-brand focus:ring-2 focus:ring-brand/20', error ? 'border-red-500' : 'border-dark-400', icon && 'pl-10', suffix && 'pr-10', className)} {...props} />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{suffix}</div>}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options, className, ...props }: any) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>}
      <select className={cn('w-full bg-dark-300 border text-white rounded-xl px-4 py-3 outline-none text-sm transition-all focus:border-brand focus:ring-2 focus:ring-brand/20', error ? 'border-red-500' : 'border-dark-400', className)} {...props}>
        {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export function Card({ children, className, onClick }: any) {
  return (
    <div onClick={onClick} className={cn('bg-dark-200 border border-dark-400 rounded-2xl', onClick && 'cursor-pointer hover:border-brand/30 transition-all', className)}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'green' }: any) {
  const v: any = { green: 'bg-brand/15 text-brand', red: 'bg-red-500/15 text-red-400', yellow: 'bg-yellow-500/15 text-yellow-400', blue: 'bg-blue-500/15 text-blue-400', gray: 'bg-gray-500/15 text-gray-400', purple: 'bg-purple-500/15 text-purple-400' }
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', v[variant])}>{children}</span>
}

export function Loading({ text = 'Carregando...' }: any) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  )
}

export function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProgressBar({ value, max }: any) {
  const pct = Math.min(((value || 0) / (max || 1)) * 100, 100)
  return (
    <div className="w-full bg-dark-400 rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00D4A1, #4A9EFF)' }} />
    </div>
  )
}

export function Tabs({ tabs, active, onChange }: any) {
  return (
    <div className="flex gap-1 p-1 bg-dark-300 rounded-xl">
      {tabs.map((t: any) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all', active === t.id ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white')}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, sub, icon, positive }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        {icon && <div className="w-9 h-9 rounded-xl bg-dark-300 flex items-center justify-center text-brand">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {sub !== undefined && <p className={cn('text-xs font-semibold', positive === false ? 'text-red-400' : 'text-brand')}>{sub}</p>}
    </Card>
  )
}
