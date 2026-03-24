import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Select, ProgressBar } from '@/components/ui'
import toast from 'react-hot-toast'

const GOALS = [
  { key: 'casa', emoji: '🏠', label: 'Casa própria' },
  { key: 'aposentadoria', emoji: '🌅', label: 'Aposentadoria' },
  { key: 'exterior', emoji: '🌍', label: 'Morar no exterior' },
  { key: 'viagem', emoji: '✈️', label: 'Viagens' },
  { key: 'negocio', emoji: '🚀', label: 'Negócio próprio' },
  { key: 'educacao', emoji: '🎓', label: 'Educação' },
  { key: 'carro', emoji: '🚗', label: 'Carro' },
  { key: 'reserva', emoji: '🛡️', label: 'Reserva' },
  { key: 'cripto', emoji: '₿', label: 'Criptomoedas' },
  { key: 'familia', emoji: '👨‍👩‍👧', label: 'Família' },
]

const DEFAULT_EXPENSES = [
  '🏠 Aluguel',
  '🛒 Mercado',
  '🚗 Parcela carro',
  '💡 Conta de luz',
  '💧 Conta de água',
  '🔥 Conta de gás',
  '🌐 Internet',
  '📱 Celular',
  '🏋️ Academia',
  '🍔 Fast food / Delivery',
  '🚖 Transporte / Uber',
  '💄 Estética / Cabelereiro',
  '🎬 Streaming (Netflix...)',
  '🏥 Plano de saúde',
  '📚 Educação / Cursos',
  '🐾 Pet',
  '💊 Farmácia',
  '🃏 Cartão de crédito',
  '🏦 Financiamento',
  '💰 Previdência privada',
]

const PROFILES = [
  { key: 'conservative', emoji: '🛡️', label: 'Conservador', sub: 'Prefiro segurança e previsibilidade' },
  { key: 'moderate', emoji: '⚖️', label: 'Moderado', sub: 'Aceito algum risco por mais retorno' },
  { key: 'aggressive', emoji: '🚀', label: 'Arrojado', sub: 'Busco altos retornos, aceito volatilidade' },
]

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customExpense, setCustomExpense] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [data, setData] = useState({
    nickname: '',
    occupation: 'clt',
    monthly_income: '',
    goals: [] as string[],
    expenses: ['🏠 Aluguel', '🛒 Mercado'] as string[],
    investor_profile: 'moderate',
  })

  const toggleGoal = (key: string) => setData(p => ({
    ...p, goals: p.goals.includes(key) ? p.goals.filter(k => k !== key) : [...p.goals, key]
  }))

  const toggleExpense = (cat: string) => setData(p => ({
    ...p, expenses: p.expenses.includes(cat) ? p.expenses.filter(c => c !== cat) : [...p.expenses, cat]
  }))

  const addCustomExpense = () => {
    if (!customExpense.trim()) return
    const newCat = `📌 ${customExpense.trim()}`
    setData(p => ({ ...p, expenses: [...p.expenses, newCat] }))
    setCustomExpense('')
    setShowCustomInput(false)
  }

  const removeCustom = (cat: string) => {
    setData(p => ({ ...p, expenses: p.expenses.filter(c => c !== cat) }))
  }

  const finish = async () => {
    if (!user) {
      toast.error('Usuário não encontrado. Faça login novamente.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: data.nickname || user.email?.split('@')[0],
          occupation: data.occupation,
          monthly_income: parseFloat(data.monthly_income) || 0,
          goals: data.goals,
          interests: data.expenses,
          investor_profile: data.investor_profile,
          onboarding_completed: true,
        })

      if (error) {
        console.error('Supabase error:', error)
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.success('Perfil configurado! Bem-vindo 🎉')
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Catch error:', err)
      toast.error('Erro inesperado. Tente novamente.')
    }
    setLoading(false)
  }

  const btnStyle = (isActive: boolean) => ({
    padding: '12px 14px',
    borderRadius: '14px',
    border: `2px solid ${isActive ? '#00D4A1' : 'rgba(255,255,255,0.06)'}`,
    background: isActive ? 'rgba(0,212,161,0.08)' : '#1A1D23',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
    width: '100%',
  })

  const customExpenses = data.expenses.filter(e => !DEFAULT_EXPENSES.includes(e))

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center">
              <TrendingUp size={15} className="text-dark" />
            </div>
            <span className="font-bold text-white">FinanceApp</span>
          </div>
          <span className="text-sm text-gray-400">{step} / 5</span>
        </div>
        <ProgressBar value={step} max={5} />

        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6 mt-4 animate-in">

          {/* STEP 1 — Nome e ocupação */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Como podemos te chamar?</h2>
              <Input
                label="Apelido"
                placeholder="Rafael, Rafa..."
                value={data.nickname}
                onChange={(e: any) => setData(p => ({ ...p, nickname: e.target.value }))}
              />
              <Select
                label="Ocupação"
                value={data.occupation}
                onChange={(e: any) => setData(p => ({ ...p, occupation: e.target.value }))}
                options={[
                  { value: 'clt', label: 'CLT / Funcionário' },
                  { value: 'autonomo', label: 'Autônomo / Freelancer' },
                  { value: 'empresario', label: 'Empresário' },
                  { value: 'publico', label: 'Funcionário público' },
                  { value: 'aposentado', label: 'Aposentado' },
                  { value: 'estudante', label: 'Estudante' },
                ]}
              />
            </div>
          )}

          {/* STEP 2 — Renda */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Qual sua renda mensal?</h2>
              <p className="text-gray-400 text-sm">Privado e seguro — usamos para personalizar recomendações.</p>
              <Input
                label="Renda líquida mensal"
                type="number"
                placeholder="5000"
                value={data.monthly_income}
                onChange={(e: any) => setData(p => ({ ...p, monthly_income: e.target.value }))}
                icon={<span className="text-xs text-gray-400">R$</span>}
              />
            </div>
          )}

          {/* STEP 3 — Objetivos */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Quais são seus objetivos?</h2>
              <p className="text-gray-400 text-sm mb-4">Escolha quantos quiser.</p>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {GOALS.map(({ key, emoji, label }) => (
                  <button key={key} onClick={() => toggleGoal(key)} style={btnStyle(data.goals.includes(key))}>
                    <div className="text-xl mb-1">{emoji}</div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    {data.goals.includes(key) && (
                      <div className="mt-1 text-xs text-brand flex items-center gap-1">
                        <Check size={10} /> Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Gastos fixos */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Seus gastos fixos</h2>
              <p className="text-gray-400 text-sm mb-4">Selecione os que você tem.</p>

              <div className="flex flex-wrap gap-2 mb-4 max-h-64 overflow-y-auto pr-1">
                {DEFAULT_EXPENSES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleExpense(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                      data.expenses.includes(cat)
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-dark-400 bg-dark-300 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Personalizados */}
              {customExpenses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Adicionados por você:</p>
                  <div className="flex flex-wrap gap-2">
                    {customExpenses.map(cat => (
                      <div key={cat} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border-2 border-brand bg-brand/10 text-brand">
                        {cat}
                        <button onClick={() => removeCustom(cat)} className="ml-1 hover:text-red-400">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar personalizado */}
              {showCustomInput ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Nome do gasto..."
                    value={customExpense}
                    onChange={e => setCustomExpense(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomExpense()}
                    className="flex-1 bg-dark-300 border border-dark-400 text-white placeholder-gray-500 rounded-xl px-3 py-2 outline-none text-sm focus:border-brand transition-all"
                    autoFocus
                  />
                  <button onClick={addCustomExpense} className="px-3 py-2 bg-brand text-dark rounded-xl text-sm font-semibold hover:bg-brand-dark transition-all">
                    Adicionar
                  </button>
                  <button onClick={() => setShowCustomInput(false)} className="px-3 py-2 bg-dark-300 text-gray-400 rounded-xl text-sm hover:text-white transition-all">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border-2 border-dashed border-dark-400 text-gray-400 hover:border-brand hover:text-brand transition-all mt-2"
                >
                  <Plus size={12} /> Adicionar outro gasto
                </button>
              )}
            </div>
          )}

          {/* STEP 5 — Perfil */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Seu perfil de investidor</h2>
              <p className="text-gray-400 text-sm mb-4">Isso define as recomendações da IA.</p>
              <div className="space-y-2">
                {PROFILES.map(({ key, emoji, label, sub }) => (
                  <button
                    key={key}
                    onClick={() => setData(p => ({ ...p, investor_profile: key }))}
                    style={btnStyle(data.investor_profile === key)}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{label}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </div>
                    {data.investor_profile === key && <Check size={16} className="text-brand flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex gap-3 mt-6 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={() => setStep(s => s - 1)}>
                Voltar
              </Button>
            )}
            {step < 5
              ? (
                <Button
                  icon={<ChevronRight size={14} />}
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 3 && data.goals.length === 0}
                >
                  Continuar
                </Button>
              )
              : (
                <Button onClick={finish} loading={loading}>
                  Entrar no app →
                </Button>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
