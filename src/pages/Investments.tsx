import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Edit3, Zap, TrendingUp, TrendingDown, Check, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { Card, Button, Input, Select, Modal, Badge, Loading } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { askAI } from '@/services/ai'
import toast from 'react-hot-toast'

const COLORS = ['#00D4A1','#4A9EFF','#8B5CF6','#F5A623','#EF4444','#EC4899','#10B981','#F97316']

const INVESTMENT_TYPES = [
  { value: 'stock_br', label: '📈 Ação (B3)' },
  { value: 'stock_int', label: '🌍 Ação Internacional (BDR)' },
  { value: 'fii', label: '🏢 FII - Fundo Imobiliário' },
  { value: 'etf_br', label: '📊 ETF Nacional (IVVB11, BOVA11...)' },
  { value: 'etf_int', label: '🌐 ETF Internacional' },
  { value: 'fixed_cdb', label: '💰 CDB' },
  { value: 'fixed_lci', label: '🏦 LCI' },
  { value: 'fixed_lca', label: '🌾 LCA' },
  { value: 'fixed_tesouro', label: '🇧🇷 Tesouro Direto' },
  { value: 'fixed_cri', label: '🏗️ CRI' },
  { value: 'fixed_cra', label: '🌱 CRA' },
  { value: 'fixed_debenture', label: '📋 Debênture' },
  { value: 'fund_rf', label: '💼 Fundo Renda Fixa' },
  { value: 'fund_mm', label: '⚖️ Fundo Multimercado' },
  { value: 'fund_acoes', label: '📈 Fundo de Ações' },
  { value: 'fund_prev', label: '🌅 Previdência Privada (PGBL/VGBL)' },
  { value: 'crypto', label: '₿ Criptomoeda' },
  { value: 'poupanca', label: '🐷 Poupança' },
  { value: 'ouro', label: '🥇 Ouro / Commodities' },
  { value: 'other', label: '📦 Outro' },
]

const TYPE_LABELS: any = Object.fromEntries(INVESTMENT_TYPES.map(t => [t.value, t.label]))

const EMPTY_FORM = {
  symbol: '', name: '', type: 'fixed_cdb',
  amount_invested: '', current_price: '', notes: '', broker: ''
}

export default function Investments() {
  const { user } = useAuth()
  const { profile, investments, setInvestments } = useStore()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiRec, setAiRec] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase.from('investments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) console.error(error)
    else if (data) setInvestments(data)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal(true) }
  const openEdit = (inv: any) => {
    setForm({
      symbol: inv.symbol || '',
      name: inv.name || '',
      type: inv.type || 'fixed_cdb',
      amount_invested: inv.amount_invested?.toString() || '',
      current_price: inv.current_price?.toString() || '',
      notes: inv.notes || '',
      broker: inv.broker || '',
    })
    setEditItem(inv)
    setModal(true)
  }

  const save = async () => {
    if (!user) return toast.error('Usuário não encontrado')
    if (!form.amount_invested) return toast.error('Digite o valor investido')
    if (!form.name && !form.symbol) return toast.error('Digite o nome ou símbolo do ativo')

    const payload = {
      user_id: user.id,
      symbol: form.symbol.toUpperCase() || form.name.toUpperCase().slice(0,6),
      name: form.name || form.symbol,
      type: form.type,
      amount_invested: parseFloat(form.amount_invested) || 0,
      quantity: 1,
      purchase_price: parseFloat(form.amount_invested) || 0,
      current_price: parseFloat(form.current_price) || parseFloat(form.amount_invested) || 0,
      broker: form.broker,
      notes: form.notes,
    }

    if (editItem) {
      const { error } = await supabase.from('investments').update(payload).eq('id', editItem.id)
      if (!error) { toast.success('Investimento atualizado! ✅'); setModal(false); load() }
      else toast.error('Erro: ' + error.message)
    } else {
      const { error } = await supabase.from('investments').insert(payload)
      if (!error) { toast.success('Investimento adicionado! ✅'); setModal(false); load() }
      else toast.error('Erro: ' + error.message)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Remover este investimento?')) return
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (!error) { load(); toast.success('Removido') }
    else toast.error('Erro ao remover')
  }

  const getRec = async () => {
    setLoadingAI(true)
    const r = await askAI(`Perfil ${profile?.investor_profile}, renda R$ ${profile?.monthly_income}. Carteira: ${investments.map((i:any)=>TYPE_LABELS[i.type]+'('+formatCurrency(i.amount_invested)+')').join(', ')||'vazia'}. Recomende alocação ideal com % por classe e produtos específicos.`, { profile })
    setAiRec(r)
    setLoadingAI(false)
  }

  const total = investments.reduce((s:number,i:any) => s + (i.amount_invested||0), 0)
  const currVal = investments.reduce((s:number,i:any) => s + ((i.current_price||i.amount_invested)||0), 0)
  const ret = total > 0 ? ((currVal - total) / total) * 100 : 0

  const alloc = investments.reduce((a:any, i:any) => {
    const label = TYPE_LABELS[i.type]?.split(' ').slice(1).join(' ') || i.type
    a[label] = (a[label]||0) + (i.amount_invested||0)
    return a
  }, {})
  const allocData = Object.entries(alloc).map(([name, value]) => ({ name, value }))

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Carteira de Investimentos</h1>
          <p className="text-gray-400 text-sm">Gerencie todos seus ativos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Zap size={13}/>} onClick={getRec} loading={loadingAI}>Análise IA</Button>
          <Button size="sm" icon={<Plus size={13}/>} onClick={openAdd}>Adicionar</Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Total investido</p><p className="text-xl font-bold text-white">{formatCurrency(total)}</p></Card>
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Valor atual estimado</p><p className="text-xl font-bold text-white">{formatCurrency(currVal)}</p></Card>
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Retorno</p><p className={`text-xl font-bold ${ret>=0?'text-brand':'text-red-400'}`}>{formatPercent(ret)}</p></Card>
      </div>

      {aiRec && (
        <Card className="p-4 border-brand/20">
          <p className="text-xs font-semibold text-brand mb-2">💡 Análise e Recomendações da IA</p>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiRec}</p>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Lista */}
        <div className="lg:col-span-2">
          <Card>
            {investments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-4xl mb-3">📈</p>
                <p className="text-gray-400 mb-4">Nenhum investimento cadastrado</p>
                <Button size="sm" onClick={openAdd} icon={<Plus size={13}/>}>Adicionar primeiro</Button>
              </div>
            ) : (
              <div className="divide-y divide-dark-400">
                <div className="grid grid-cols-12 gap-2 p-4 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  <span className="col-span-4">Ativo</span>
                  <span className="col-span-3">Tipo</span>
                  <span className="col-span-2">Investido</span>
                  <span className="col-span-2">Atual</span>
                  <span className="col-span-1"></span>
                </div>
                {investments.map((inv: any) => {
                  const r = inv.amount_invested > 0 ? (((inv.current_price||inv.amount_invested) - inv.amount_invested) / inv.amount_invested) * 100 : 0
                  return (
                    <div key={inv.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-dark-300/50 transition-colors">
                      <div className="col-span-4">
                        <p className="font-bold text-white text-sm">{inv.symbol}</p>
                        <p className="text-xs text-gray-400 truncate">{inv.name}</p>
                        {inv.broker && <p className="text-xs text-gray-500">{inv.broker}</p>}
                        {inv.notes && <p className="text-xs text-gray-500 italic truncate">{inv.notes}</p>}
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs bg-dark-300 text-gray-300 px-2 py-1 rounded-lg">
                          {TYPE_LABELS[inv.type]?.split(' ')[0]} {TYPE_LABELS[inv.type]?.split(' ').slice(1,3).join(' ')}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-white font-medium">{formatCurrency(inv.amount_invested)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-white">{formatCurrency(inv.current_price||inv.amount_invested)}</p>
                        {r !== 0 && (
                          <p className={`text-xs font-semibold flex items-center gap-0.5 ${r>=0?'text-brand':'text-red-400'}`}>
                            {r>=0?<TrendingUp size={9}/>:<TrendingDown size={9}/>}{formatPercent(r)}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1 flex gap-1">
                        <button onClick={() => openEdit(inv)} className="text-gray-400 hover:text-brand transition-colors p-1"><Edit3 size={13}/></button>
                        <button onClick={() => del(inv.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Alocação */}
        {allocData.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4">Alocação</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={allocData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {allocData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:'#1A1D23', border:'1px solid #2E3340', borderRadius:'10px' }} formatter={(v:any)=>[formatCurrency(v),'']}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {allocData.map(({ name, value }:any, i) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i%COLORS.length] }}/>
                    <span className="text-gray-400 truncate max-w-[110px]">{name}</span>
                  </div>
                  <span className="text-white font-medium">{((value/total)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modal add/edit */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Editar investimento' : 'Novo investimento'}>
        <div className="space-y-4">
          <Select label="Tipo de investimento" value={form.type}
            onChange={(e:any) => setForm(p=>({...p,type:e.target.value}))}
            options={INVESTMENT_TYPES} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Símbolo (opcional)" placeholder="PETR4, BTC, KNRI11..." value={form.symbol}
              onChange={(e:any) => setForm(p=>({...p,symbol:e.target.value}))} />
            <Input label="Nome do ativo" placeholder="Petrobras, Bitcoin..." value={form.name}
              onChange={(e:any) => setForm(p=>({...p,name:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor investido (R$)" type="number" placeholder="1000" value={form.amount_invested}
              onChange={(e:any) => setForm(p=>({...p,amount_invested:e.target.value}))}
              icon={<span className="text-xs text-gray-400">R$</span>} />
            <Input label="Valor atual (R$)" type="number" placeholder="Igual ao investido" value={form.current_price}
              onChange={(e:any) => setForm(p=>({...p,current_price:e.target.value}))}
              icon={<span className="text-xs text-gray-400">R$</span>} />
          </div>
          <Input label="Corretora / Banco (opcional)" placeholder="XP, BTG, Nubank..." value={form.broker}
            onChange={(e:any) => setForm(p=>({...p,broker:e.target.value}))} />
          <Input label="Observações (opcional)" placeholder="Vencimento, taxa, estratégia..." value={form.notes}
            onChange={(e:any) => setForm(p=>({...p,notes:e.target.value}))} />
          {editItem && (
            <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl text-xs text-gray-400">
              💡 Para atualizar o valor atual do ativo, altere o campo "Valor atual". Isso recalcula o retorno automaticamente.
            </div>
          )}
          <Button className="w-full" onClick={save}>
            {editItem ? 'Salvar alterações' : 'Adicionar investimento'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
