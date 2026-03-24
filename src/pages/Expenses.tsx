import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Zap, Edit3, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { Card, Button, Input, Select, Modal, Loading, Tabs, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { askAI } from '@/services/ai'
import toast from 'react-hot-toast'

const CATEGORIES = [
  '🏠 Aluguel','🛒 Mercado','🚗 Parcela carro','💡 Conta de luz','💧 Conta de água',
  '🔥 Conta de gás','🌐 Internet','📱 Celular','🏋️ Academia','🍔 Fast food/Delivery',
  '🚖 Transporte/Uber','💄 Estética/Cabelereiro','🎬 Streaming','🏥 Plano de saúde',
  '📚 Educação/Cursos','🐾 Pet','💊 Farmácia','🃏 Cartão de crédito',
  '🏦 Financiamento/Empréstimo','💰 Previdência privada','🎁 Presentes','✈️ Viagens',
  '🍽️ Restaurantes','🛍️ Compras/Vestuário','💻 Tecnologia','🏡 Casa/Manutenção',
  '⚽ Esportes/Lazer','📦 Outros',
]

const EMPTY = { amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], type: 'expense', is_fixed: false, fixed_amount_varies: false }

export default function Expenses() {
  const { user } = useAuth()
  const { profile, transactions, setTransactions } = useStore()
  const [recurring, setRecurring] = useState<any[]>([])
  const [tab, setTab] = useState('rapido')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [month, setMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })
  const [form, setForm] = useState<any>(EMPTY)
  const [quickAmt, setQuickAmt] = useState<any>({})

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [tx, rec] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('recurring_expenses').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
    ])
    if (tx.data) setTransactions(tx.data)
    if (rec.data) setRecurring(rec.data)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  // Registrar gasto rápido de fixo
  const registerFixed = async (rec: any, customAmt?: string) => {
    const amount = customAmt || rec.amount.toString()
    if (!amount || parseFloat(amount) <= 0) return toast.error('Digite o valor')
    const { error } = await supabase.from('transactions').insert({
      user_id: user!.id, amount: parseFloat(amount), category: rec.description,
      description: `${rec.description} - ${month}`, date: new Date().toISOString().split('T')[0],
      type: 'expense', is_recurring: true,
    })
    if (!error) { toast.success(`${rec.description} registrado!`); setQuickAmt((p:any)=>({...p,[rec.id]:''})); load() }
    else toast.error('Erro: ' + error.message)
  }

  const addTransaction = async () => {
    if (!user) return toast.error('Usuário não encontrado')
    if (!form.amount) return toast.error('Digite o valor')
    if (!form.category) return toast.error('Selecione a categoria')

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id, amount: parseFloat(form.amount), category: form.category,
      description: form.description, date: form.date, type: form.type, is_recurring: form.is_fixed,
    })

    if (!error) {
      // Se for fixo, adicionar também em recorrentes
      if (form.is_fixed) {
        await supabase.from('recurring_expenses').upsert({
          user_id: user.id, description: form.category,
          amount: form.fixed_amount_varies ? 0 : parseFloat(form.amount),
          category: form.category, due_day: new Date(form.date).getDate(), is_active: true,
        }, { onConflict: 'user_id,description' })
      }
      toast.success('Lançamento salvo! ✅')
      setModal(false)
      setForm(EMPTY)
      load()
    } else {
      toast.error('Erro: ' + error.message)
    }
  }

  const delTx = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) { load(); toast.success('Removido') }
    else toast.error('Erro ao remover')
  }

  const delRec = async (id: string) => {
    await supabase.from('recurring_expenses').update({ is_active: false }).eq('id', id)
    load(); toast.success('Gasto fixo removido')
  }

  const analyze = async () => {
    setLoadingAI(true)
    const cats = monthlyTx.filter(t => t.type === 'expense').reduce((a:any,t:any)=>{ a[t.category]=(a[t.category]||0)+t.amount; return a },{})
    const r = await askAI(`Analise meus gastos: Renda R$${profile?.monthly_income} | Total gastos R$${totalExp} | Categorias: ${JSON.stringify(cats)}. Dê 3 insights práticos com emojis.`, { profile })
    setAiAnalysis(r)
    setLoadingAI(false)
  }

  const monthlyTx = transactions.filter((t:any) => t.date?.startsWith(month))
  const totalExp = monthlyTx.filter((t:any) => t.type==='expense').reduce((s:number,t:any)=>s+t.amount,0)
  const totalInc = monthlyTx.filter((t:any) => t.type==='income').reduce((s:number,t:any)=>s+t.amount,0)
  const balance = (totalInc || profile?.monthly_income || 0) - totalExp

  const byCategory = monthlyTx.filter((t:any)=>t.type==='expense').reduce((a:any,t:any)=>{a[t.category]=(a[t.category]||0)+t.amount;return a},{})
  const chartData = Object.entries(byCategory).sort(([,a],[,b])=>(b as number)-(a as number)).slice(0,8).map(([name,value])=>({name:name.split(' ').slice(1).join(' ').slice(0,10),value}))

  // Verificar quais fixos já foram lançados esse mês
  const fixedLaunched = new Set(monthlyTx.filter((t:any)=>t.is_recurring).map((t:any)=>t.category))

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Controle de Gastos</h1><p className="text-gray-400 text-sm">Acompanhe receitas e despesas</p></div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Zap size={13}/>} onClick={analyze} loading={loadingAI}>Análise IA</Button>
          <Button size="sm" icon={<Plus size={13}/>} onClick={() => { setForm(EMPTY); setModal(true) }}>Lançamento</Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Gastos do mês</p><p className="text-xl font-bold text-red-400">{formatCurrency(totalExp)}</p></Card>
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Receita</p><p className="text-xl font-bold text-brand">{formatCurrency(totalInc||profile?.monthly_income||0)}</p></Card>
        <Card className="p-4"><p className="text-gray-400 text-xs mb-1">Saldo</p><p className={`text-xl font-bold ${balance>=0?'text-brand':'text-red-400'}`}>{formatCurrency(balance)}</p></Card>
      </div>

      {/* Filtro mês */}
      <div className="flex items-center gap-3">
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="bg-dark-300 border border-dark-400 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand" />
      </div>

      {aiAnalysis && <Card className="p-4 border-brand/20"><p className="text-xs font-semibold text-brand mb-1">💡 Análise da IA</p><p className="text-sm text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p></Card>}

      {chartData.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-white mb-4">Gastos por categoria</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{fill:'#6B7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'#9CA3AF',fontSize:10}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip contentStyle={{background:'#1A1D23',border:'1px solid #2E3340',borderRadius:'10px'}} formatter={(v:any)=>[formatCurrency(v),'']}/>
              <Bar dataKey="value" radius={[0,6,6,0]}>{chartData.map((_,i)=><Cell key={i} fill={i===0?'#EF4444':'#4A9EFF'}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'rapido', label: '⚡ Lançar Fixos' },
        { id: 'historico', label: '📋 Histórico' },
      ]}/>

      {/* ABA: LANÇAR FIXOS — lança os gastos fixos do mês rapidamente */}
      {tab === 'rapido' && (
        <div className="space-y-3">
          {recurring.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-400 mb-3">Nenhum gasto fixo cadastrado ainda.</p>
              <p className="text-gray-500 text-sm mb-4">Adicione um lançamento marcando como "fixo" para aparecer aqui todo mês.</p>
              <Button size="sm" onClick={() => setModal(true)} icon={<Plus size={13}/>}>Adicionar primeiro gasto</Button>
            </Card>
          ) : (
            <>
              <p className="text-gray-400 text-sm">Seus gastos fixos mensais — lance o valor de {new Date(month+'-01').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}:</p>
              {recurring.map((rec:any) => {
                const isLaunched = fixedLaunched.has(rec.description)
                return (
                  <Card key={rec.id} className={`p-4 ${isLaunched?'opacity-60':''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${isLaunched?'bg-brand/20':'bg-dark-300'}`}>
                        {isLaunched ? '✅' : rec.description?.split(' ')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{rec.description}</p>
                        <p className="text-xs text-gray-400">{rec.amount > 0 ? `Valor fixo: ${formatCurrency(rec.amount)}` : 'Valor variável'} · dia {rec.due_day}</p>
                      </div>
                      {isLaunched ? (
                        <Badge variant="green">Lançado ✓</Badge>
                      ) : rec.amount > 0 ? (
                        <Button size="sm" onClick={() => registerFixed(rec)}>
                          Lançar {formatCurrency(rec.amount)}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="R$ valor"
                            value={quickAmt[rec.id]||''}
                            onChange={e=>setQuickAmt((p:any)=>({...p,[rec.id]:e.target.value}))}
                            className="w-24 bg-dark-300 border border-dark-400 text-white rounded-xl px-2 py-1.5 text-sm outline-none focus:border-brand"
                          />
                          <Button size="sm" onClick={()=>registerFixed(rec,quickAmt[rec.id])}>Lançar</Button>
                        </div>
                      )}
                      <button onClick={()=>delRec(rec.id)} className="text-gray-500 hover:text-red-400 ml-1"><Trash2 size={13}/></button>
                    </div>
                  </Card>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ABA: HISTÓRICO */}
      {tab === 'historico' && (
        <Card>
          {monthlyTx.length === 0 ? (
            <div className="p-8 text-center"><p className="text-gray-400 mb-3">Nenhum lançamento neste mês</p><Button size="sm" onClick={()=>setModal(true)} icon={<Plus size={13}/>}>Adicionar</Button></div>
          ) : (
            <div className="divide-y divide-dark-400">
              {monthlyTx.map((tx:any)=>(
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-dark-300/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-dark-300 flex items-center justify-center text-base flex-shrink-0">{tx.category?.split(' ')[0]||'💰'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{tx.description||tx.category}</p>
                      {tx.is_recurring && <Badge variant="blue">Fixo</Badge>}
                    </div>
                    <p className="text-xs text-gray-400">{new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className={`font-semibold text-sm flex-shrink-0 ${tx.type==='income'?'text-brand':'text-red-400'}`}>{tx.type==='income'?'+':'-'}{formatCurrency(tx.amount)}</p>
                  <button onClick={()=>delTx(tx.id)} className="text-gray-500 hover:text-red-400 ml-1"><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal adicionar lançamento */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Novo lançamento">
        <div className="space-y-4">
          <Tabs active={form.type} onChange={t=>setForm((p:any)=>({...p,type:t}))} tabs={[{id:'expense',label:'💸 Gasto'},{id:'income',label:'💰 Receita'}]}/>

          <Input label="Valor (R$)" type="number" placeholder="0,00" value={form.amount}
            onChange={(e:any)=>setForm((p:any)=>({...p,amount:e.target.value}))}
            icon={<span className="text-xs text-gray-400">R$</span>}/>

          <Select label="Categoria" value={form.category}
            onChange={(e:any)=>setForm((p:any)=>({...p,category:e.target.value}))}
            options={[{value:'',label:'Selecione...'}, ...CATEGORIES.map(c=>({value:c,label:c}))]}/>

          <Input label="Descrição (opcional)" placeholder="Detalhes do gasto..." value={form.description}
            onChange={(e:any)=>setForm((p:any)=>({...p,description:e.target.value}))}/>

          <Input label="Data" type="date" value={form.date}
            onChange={(e:any)=>setForm((p:any)=>({...p,date:e.target.value}))}/>

          {/* Gasto fixo ou esporádico */}
          {form.type === 'expense' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                <input type="checkbox" id="is_fixed" checked={form.is_fixed}
                  onChange={e=>setForm((p:any)=>({...p,is_fixed:e.target.checked}))}
                  className="w-4 h-4 accent-brand cursor-pointer"/>
                <div>
                  <label htmlFor="is_fixed" className="text-sm font-medium text-white cursor-pointer">Este é um gasto fixo mensal</label>
                  <p className="text-xs text-gray-400">Aparecerá automaticamente todo mês para lançar</p>
                </div>
              </div>

              {form.is_fixed && (
                <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl ml-4">
                  <input type="checkbox" id="varies" checked={form.fixed_amount_varies}
                    onChange={e=>setForm((p:any)=>({...p,fixed_amount_varies:e.target.checked}))}
                    className="w-4 h-4 accent-brand cursor-pointer"/>
                  <div>
                    <label htmlFor="varies" className="text-sm font-medium text-white cursor-pointer">O valor varia todo mês</label>
                    <p className="text-xs text-gray-400">Ex: conta de luz, água, telefone</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button className="w-full" onClick={addTransaction}>Salvar lançamento</Button>
        </div>
      </Modal>
    </div>
  )
}
