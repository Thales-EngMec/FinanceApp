import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Check, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { Card, Button, Input, Select, Modal, Badge, Loading, ProgressBar } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { askAI } from '@/services/ai'
import toast from 'react-hot-toast'

const EMOJIS = ['🏠','🚗','✈️','🎓','🌅','🚀','🌍','🛡️','₿','💎','🏖️','🎯','💰','🏆','❤️','🏥','👶','🐾']

export default function Goals() {
  const { user } = useAuth()
  const { profile, goals, setGoals } = useStore()
  const [modal, setModal] = useState(false)
  const [depModal, setDepModal] = useState<any>(null)
  const [depAmt, setDepAmt] = useState('')
  const [loading, setLoading] = useState(true)
  const [tips, setTips] = useState<any>({})
  const [loadingTip, setLoadingTip] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
    emoji: '🎯',
  })

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Goals load error:', error)
    } else if (data) {
      setGoals(data)
    }
    setLoading(false)
  }, [user, setGoals])

  useEffect(() => { load() }, [load])

  const add = async () => {
    if (!user) { toast.error('Usuário não encontrado'); return }
    if (!form.title) { toast.error('Digite um título para a meta'); return }
    if (!form.target_amount) { toast.error('Digite o valor da meta'); return }

    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount) || 0,
        deadline: form.deadline || null,
        emoji: form.emoji,
        is_completed: false,
      })

      if (error) {
        console.error('Goal insert error:', error)
        toast.error(`Erro ao criar meta: ${error.message}`)
      } else {
        toast.success('Meta criada! 🎯')
        setModal(false)
        setForm({ title: '', description: '', target_amount: '', current_amount: '0', deadline: '', emoji: '🎯' })
        load()
      }
    } catch (err: any) {
      console.error('Catch:', err)
      toast.error('Erro inesperado. Tente novamente.')
    }
  }

  const deposit = async () => {
    if (!depModal || !depAmt) return
    const newAmt = (depModal.current_amount || 0) + parseFloat(depAmt)
    const done = newAmt >= depModal.target_amount
    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmt, is_completed: done })
      .eq('id', depModal.id)

    if (!error) {
      if (done) toast.success('🎉 Parabéns! Meta alcançada!')
      else toast.success('Depósito registrado!')
      setDepModal(null)
      setDepAmt('')
      load()
    } else {
      toast.error('Erro ao registrar depósito')
    }
  }

  const del = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) { load(); toast.success('Meta removida') }
    else toast.error('Erro ao remover')
  }

  const getTip = async (g: any) => {
    if (tips[g.id]) return
    setLoadingTip(g.id)
    const remaining = g.target_amount - (g.current_amount || 0)
    const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 864e5) : 365
    const monthlyNeeded = (remaining / (daysLeft / 30)).toFixed(0)
    const r = await askAI(
      `Minha meta é "${g.title}". Preciso juntar R$ ${remaining.toFixed(0)} em ${daysLeft} dias (R$ ${monthlyNeeded}/mês). Renda: R$ ${profile?.monthly_income || 0}. Dê 3 dicas práticas e motivadoras. Seja breve e use emojis.`,
      { profile }
    )
    setTips((p: any) => ({ ...p, [g.id]: r }))
    setLoadingTip(null)
  }

  if (loading) return <Loading />

  const active = goals.filter((g: any) => !g.is_completed)
  const done = goals.filter((g: any) => g.is_completed)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas & Sonhos</h1>
          <p className="text-gray-400 text-sm">Conquiste seus objetivos financeiros</p>
        </div>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setModal(true)}>
          Nova meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-xl font-bold text-white mb-2">Nenhuma meta ainda</h2>
          <p className="text-gray-400 text-sm mb-5">Defina seus sonhos e a IA vai te ajudar a alcançá-los.</p>
          <Button onClick={() => setModal(true)} icon={<Plus size={13} />}>
            Criar primeira meta
          </Button>
        </Card>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="font-semibold text-white mb-3">Em andamento ({active.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {active.map((g: any) => {
                  const pct = Math.min(((g.current_amount || 0) / (g.target_amount || 1)) * 100, 100)
                  const days = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 864e5) : null
                  return (
                    <Card key={g.id} className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-dark-300 flex items-center justify-center text-2xl">
                            {g.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{g.title}</h3>
                            {g.description && <p className="text-xs text-gray-400">{g.description}</p>}
                          </div>
                        </div>
                        <button onClick={() => del(g.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-white font-semibold">{pct.toFixed(0)}%</span>
                        </div>
                        <ProgressBar value={g.current_amount || 0} max={g.target_amount || 1} />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{formatCurrency(g.current_amount || 0)}</span>
                          <span>{formatCurrency(g.target_amount)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Faltam</p>
                          <p className="text-sm font-bold text-white">
                            {formatCurrency(g.target_amount - (g.current_amount || 0))}
                          </p>
                        </div>
                        {days !== null && (
                          <Badge variant={days < 90 ? 'red' : days < 365 ? 'yellow' : 'green'}>
                            {days} dias
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDepModal(g)}>
                          + Depositar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Zap size={13} />}
                          onClick={() => getTip(g)}
                          loading={loadingTip === g.id}
                        >
                          Dica IA
                        </Button>
                      </div>

                      {tips[g.id] && (
                        <div className="mt-3 p-3 bg-brand/5 border border-brand/20 rounded-xl">
                          <p className="text-xs font-semibold text-brand mb-1">💡 Dica da IA</p>
                          <p className="text-xs text-gray-300">{tips[g.id]}</p>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Check size={16} className="text-brand" /> Conquistadas ({done.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {done.map((g: any) => (
                  <Card key={g.id} className="p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{g.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-white">{g.title}</p>
                        <p className="text-xs text-brand">✅ Conquistada!</p>
                      </div>
                      <p className="font-bold text-brand">{formatCurrency(g.target_amount)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal criar meta */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nova meta">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(p => ({ ...p, emoji: e }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    form.emoji === e ? 'bg-brand/20 border-2 border-brand' : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Título da meta"
            placeholder="Casa própria, Viagem para Europa..."
            value={form.title}
            onChange={(e: any) => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Descrição (opcional)"
            placeholder="Detalhes sobre sua meta..."
            value={form.description}
            onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Valor da meta (R$)"
              type="number"
              placeholder="50000"
              value={form.target_amount}
              onChange={(e: any) => setForm(p => ({ ...p, target_amount: e.target.value }))}
            />
            <Input
              label="Já tenho (R$)"
              type="number"
              placeholder="0"
              value={form.current_amount}
              onChange={(e: any) => setForm(p => ({ ...p, current_amount: e.target.value }))}
            />
          </div>
          <Input
            label="Prazo (opcional)"
            type="date"
            value={form.deadline}
            onChange={(e: any) => setForm(p => ({ ...p, deadline: e.target.value }))}
          />
          <Button className="w-full" onClick={add}>Criar meta 🎯</Button>
        </div>
      </Modal>

      {/* Modal depositar */}
      <Modal open={!!depModal} onClose={() => { setDepModal(null); setDepAmt('') }} title={`Depositar: ${depModal?.title}`}>
        <div className="space-y-4">
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Guardado</span>
              <span className="text-white font-bold">{formatCurrency(depModal?.current_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Meta total</span>
              <span className="text-white font-bold">{formatCurrency(depModal?.target_amount || 0)}</span>
            </div>
          </div>
          <Input
            label="Valor do depósito (R$)"
            type="number"
            placeholder="500"
            value={depAmt}
            onChange={(e: any) => setDepAmt(e.target.value)}
            icon={<span className="text-xs text-gray-400">R$</span>}
          />
          <Button className="w-full" onClick={deposit}>Registrar depósito</Button>
        </div>
      </Modal>
    </div>
  )
}
