import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wallet, TrendingUp, Target, BookOpen, Bitcoin, MessageSquare, BarChart2, Settings, LogOut, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: Wallet, label: 'Gastos' },
  { path: '/investments', icon: TrendingUp, label: 'Investimentos' },
  { path: '/goals', icon: Target, label: 'Metas & Sonhos' },
  { path: '/market', icon: BarChart2, label: 'Mercado' },
  { path: '/crypto', icon: Bitcoin, label: 'Criptomoedas' },
  { path: '/education', icon: BookOpen, label: 'Educação' },
  { path: '/chat', icon: MessageSquare, label: 'IA Assistente' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const { profile } = useStore()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const displayName = profile?.nickname || profile?.full_name?.split(' ')[0] || 'Usuário'
  const initials = displayName.slice(0, 2).toUpperCase()
  const current = NAV.find(n => location.pathname.startsWith(n.path))?.label || 'FinanceApp'

  const NavItems = () => (
    <nav className="flex-1 py-4 space-y-0.5">
      {NAV.map(({ path, icon: Icon, label }) => (
        <NavLink key={path} to={path} onClick={() => setOpen(false)}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all',
            isActive ? 'bg-brand/10 text-brand border border-brand/20' : 'text-gray-400 hover:text-white hover:bg-dark-300'
          )}>
          <Icon size={18} />{label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-dark-100 border-r border-dark-400 flex-shrink-0">
        <div className="p-5 border-b border-dark-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center">
              <TrendingUp size={16} className="text-dark" />
            </div>
            <span className="font-bold text-white">FinanceApp</span>
          </div>
        </div>
        <NavItems />
        <div className="p-4 border-t border-dark-400 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center text-dark font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email || ''}</p>
          </div>
          <button onClick={signOut} className="text-gray-400 hover:text-red-400 transition-colors" title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full bg-dark-100 border-r border-dark-400 flex flex-col z-50">
            <div className="p-4 border-b border-dark-400 flex items-center justify-between">
              <span className="font-bold text-white">FinanceApp</span>
              <button onClick={() => setOpen(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <NavItems />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-dark-100 border-b border-dark-400 flex items-center justify-between px-5 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><Menu size={22} /></button>
          <p className="hidden lg:block font-semibold text-white text-sm">{current}</p>
          <div className="flex items-center gap-2 ml-auto">
            <button className="w-8 h-8 rounded-xl bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center text-dark font-bold text-xs">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-6xl mx-auto animate-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
