import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, RefreshCw, Zap, ArrowRight, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { Card, Badge, Loading, Button } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { getExchangeRates } from '@/services/market'
import { askAI } from '@/services/ai'

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, transactions, investments, goals, setTransactions, setInvestments, setGoals } = useStore()
  const [rates, setRates] = useState<any[]>([])
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    const [tx, inv, gl] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
      supabase.from('investments').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
    ])
    if (tx.data) setTransactions(tx.data)
    if (inv.data) setInvestments(inv.data)
    if (gl.data) setGoals(gl.data)
    setLoading(false)
  }, [user])

  const loadRates = useCallback(async () => {
    const r = await getExchangeRates()
    setRates(r)
  }, [])

  const loadInsight = useCallback(async () => {
    if (!profile) return
    const r = await askAI(
      `Dê um insight financeiro curto (máximo 2 frases) e motivador para ${profile.nickname || 'o usuário'} com perfil ${profile.investor_profile} e renda R$ ${profile.monthly_income}.`,
      { profile }
    )
    setInsight(r)
  }, [profile])

  useEffect(() => { load(); loadRates() }, [load, loadRates])
  useEffect(() => { if (profile?.investor_profile) loadInsight() }, [profile])

  const refresh = async () => {
    setRefreshing(true)
    await Promise.all([load(), loadRates()])
    setRefreshing(false)
  }

  const now = new Date()
  const mo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthlyExp = transactions.filter((t: any) => t.type === 'expense' && t.date?.startsWith(mo)).reduce((s: number, t: any) => s + t.amount, 0)
  const income = profile?.monthly_income || 0
  const saved = Math.max(0, income - monthlyExp) // só mostra positivo
  const totalInv = investments.reduce((s: number, i: any) => s + i.amount_invested, 0)
  const currVal = investments.reduce((s: number, i: any) => s + ((i.current_price * i.quantity) || i.amount_invested), 0)
  const ret = totalInv > 0 ? ((currVal - totalInv) / totalInv) * 100 : 0

  const chart = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const exp = transactions.filter((t: any) => t.type === 'expense' && t.date?.startsWith(m)).reduce((s: number, t: any) => s + t.amount, 0)
    return { name: d.toLocaleDateString('pt-BR', { month: 'short' }), gastos: exp, poupanca: Math.max(0, income - exp) }
  })

  const usd = rates.find(r => r.code === 'USD')

  const displayName = profile?.nickname || profile?.full_name?.split(' ')[0] || 'Usuário'

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Olá 👋</p>
          <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />} onClick={refresh}>
          Atualizar
        </Button>
      </div>

      {/* IA Insight */}
      {insight && !insight.includes('❌') && !insight.includes('⚠️') && (
        <Card className="p-4 border-brand/20">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-brand" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand mb-0.5">IA Assistente</p>
              <p className="text-sm text-gray-300">{insight}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-gray-400 text-xs mb-1">Renda mensal</p>
          <p className="text-xl font-bold text-white">{formatCurrency(income)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-400 text-xs mb-1">Gastos este mês</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(monthlyExp)}</p>
          <p className="text-xs text-gray-500 mt-1">{income > 0 ? `${((monthlyExp/income)*100).toFixed(0)}% da renda` : ''}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-gray-400 text-xs">Disponível no mês</p>
            <div className="group relative">
              <Info size={11} className="text-gray-500 cursor-help" />
              <div className="absolute bottom-5 left-0 hidden group-hover:block bg-dark-200 border border-dark-400 rounded-lg p-2 text-xs text-gray-300 w-48 z-10">
                Renda - Gastos registrados este mês. Adicione seus gastos para ver o real disponível.
              </div>
            </div>
          </div>
          <p className={`text-xl font-bold ${saved >= 0 ? 'text-brand' : 'text-red-400'}`}>
            {formatCurrency(income - monthlyExp)}
          </p>
          {monthlyExp === 0 && <p className="text-xs text-gray-500 mt-1">Adicione seus gastos</p>}
        </Card>
        <Card className="p-4">
          <p className="text-gray-400 text-xs mb-1">Portfólio</p>
          <p className="text-xl font-bold text-white">{formatCurrency(currVal)}</p>
          {ret !== 0 && <p className={`text-xs font-semibold mt-1 ${ret >= 0 ? 'text-brand' : 'text-red-400'}`}>{ret >= 0 ? '+' : ''}{ret.toFixed(1)}%</p>}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="font-semibold text-white mb-4">Gastos vs Disponível (6 meses)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4A1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1A1D23', border: '1px solid #2E3340', borderRadius: '10px' }}
                formatter={(v: any) => [formatCurrency(v), '']} />
              <Area type="monotone" dataKey="gastos" stroke="#EF4444" fill="url(#g1)" strokeWidth={2} name="Gastos" />
              <Area type="monotone" dataKey="poupanca" stroke="#00D4A1" fill="url(#g2)" strokeWidth={2} name="Disponível" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Câmbio ao vivo</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-xs text-gray-400">Ao vivo</span>
            </div>
          </div>
          {rates.length === 0 ? (
            <p className="text-gray-400 text-sm">Carregando câmbio...</p>
          ) : (
            <div className="space-y-2">
              {rates.slice(0, 5).map(r => (
                <div key={r.code} className="flex items-center justify-between p-2.5 bg-dark-300 rounded-xl">
                  <span className="font-medium text-white text-sm">{r.code}/BRL</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">R$ {r.bid.toFixed(4)}</span>
                    <Badge variant={r.pctChange >= 0 ? 'red' : 'green'}>
                      {r.pctChange >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {Math.abs(r.pctChange).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          {usd && (
            <p className={`mt-3 text-xs p-2 rounded-lg font-medium ${usd.pctChange > 1 ? 'bg-red-500/10 text-red-400' : usd.pctChange < -1 ? 'bg-brand/10 text-brand' : 'bg-dark-300 text-gray-400'}`}>
              {usd.pctChange > 1 ? '⚠️ Dólar em alta — aguarde para comprar moeda estrangeira.' : usd.pctChange < -1 ? '✅ Dólar em queda — bom momento para comprar!' : '➡️ Câmbio estável hoje.'}
            </p>
          )}
        </Card>
      </div>

      {/* Metas */}
      {goals.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Suas metas</h2>
            <Link to="/goals" className="text-brand text-xs flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 3).map((g: any) => {
              const pct = Math.min(((g.current_amount || 0) / (g.target_amount || 1)) * 100, 100)
              return (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white font-medium">{g.title}</span>
                      <span className="text-gray-400">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-dark-400 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-blue-500 transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/expenses', icon: '💸', label: 'Adicionar gasto' },
          { to: '/investments', icon: '📈', label: 'Ver carteira' },
          { to: '/goals', icon: '🎯', label: 'Minhas metas' },
          { to: '/chat', icon: '🤖', label: 'Perguntar à IA' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to}
            className="bg-dark-200 hover:bg-dark-300 border border-dark-400 hover:border-brand/30 rounded-xl p-4 flex items-center gap-3 transition-all">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium text-white">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
