import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, RefreshCw, Zap, TrendingUp, Target, Wallet } from 'lucide-react'
import { Card, Button, Loading } from '@/components/ui'
import { useStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { askAI, analyzeProfile } from '@/services/ai'
import { cn } from '@/lib/utils'

const QUICK = [
  'Analise meu perfil financeiro completo',
  'O que é CDB e como funciona?',
  'Como montar uma carteira diversificada?',
  'Vale a pena investir em FIIs agora?',
  'Qual o melhor momento para comprar dólar?',
  'Como funciona o Tesouro Direto?',
  'Me explique sobre criptomoedas para iniciantes',
  'Como declarar investimentos no IR?',
  'Quanto devo guardar por mês para me aposentar?',
  'O que é SELIC e como afeta meus investimentos?',
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Chat() {
  const { user } = useAuth()
  const { profile, transactions, investments, goals, setTransactions, setInvestments, setGoals } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const endRef = useRef<any>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    const [tx, inv, gl] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('investments').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
    ])
    if (tx.data) setTransactions(tx.data)
    if (inv.data) setInvestments(inv.data)
    if (gl.data) setGoals(gl.data)
    setLoadingData(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!loadingData && messages.length === 0) {
      const name = profile?.nickname || profile?.full_name?.split(' ')[0] || 'investidor'
      const profileType = profile?.investor_profile === 'conservative' ? 'conservador' :
        profile?.investor_profile === 'aggressive' ? 'arrojado' : 'moderado'
      const goalsText = (profile?.goals || []).slice(0, 3).join(', ')

      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Olá, ${name}! 👋 Sou seu assistente financeiro pessoal com IA.\n\nJá conheço seu perfil:\n📊 Investidor **${profileType}**\n💰 Renda: R$ ${(profile?.monthly_income || 0).toLocaleString('pt-BR')}\n🎯 Objetivos: ${goalsText || 'não definidos ainda'}\n\nPosso te ajudar com:\n• Análise completa do seu perfil financeiro\n• Estratégias de investimento personalizadas\n• Como alcançar suas metas mais rápido\n• Dúvidas sobre qualquer produto financeiro\n• Análise dos seus gastos e como economizar\n\nO que quer saber?`,
        timestamp: new Date(),
      }])
    }
  }, [loadingData, profile])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }
    setMessages(p => [...p, userMsg])
    setLoading(true)

    let response: string
    if (msg.toLowerCase().includes('analise') && msg.toLowerCase().includes('perfil')) {
      response = await analyzeProfile(profile, transactions, investments, goals)
    } else {
      response = await askAI(msg, { profile, transactions, investments, goals })
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    setMessages(p => [...p, aiMsg])
    setLoading(false)
  }

  const clear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversa reiniciada! Como posso te ajudar?',
      timestamp: new Date(),
    }])
  }

  if (loadingData) return <Loading text="Carregando seus dados..." />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">IA Assistente</h1>
          <p className="text-gray-400 text-sm">Seu consultor financeiro pessoal com IA</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Zap size={13} />}
            onClick={() => send('Analise meu perfil financeiro completo')}
            loading={loading}
          >
            Análise completa
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={clear}>
            Limpar
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: <TrendingUp size={14} />, label: 'Melhores investimentos', msg: 'Quais os melhores investimentos para meu perfil agora?' },
          { icon: <Target size={14} />, label: 'Como alcançar metas', msg: 'Como posso alcançar minhas metas financeiras mais rápido?' },
          { icon: <Wallet size={14} />, label: 'Reduzir gastos', msg: 'Como posso reduzir meus gastos e economizar mais?' },
        ].map(({ icon, label, msg }) => (
          <button
            key={label}
            onClick={() => send(msg)}
            className="flex items-center gap-2 p-3 bg-dark-300 hover:bg-dark-400 border border-dark-400 hover:border-brand/30 rounded-xl text-xs text-gray-300 hover:text-white transition-all text-left"
          >
            <div className="text-brand flex-shrink-0">{icon}</div>
            {label}
          </button>
        ))}
      </div>

      {/* Quick questions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            className="flex-shrink-0 px-3 py-1.5 bg-dark-300 hover:bg-dark-400 border border-dark-400 hover:border-brand/30 rounded-full text-xs text-gray-400 hover:text-white transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {messages.map(m => (
          <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
            <div className={cn(
              'w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center',
              m.role === 'assistant' ? 'bg-brand/20 text-brand' : 'bg-dark-400 text-gray-300'
            )}>
              {m.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
            </div>
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              m.role === 'user'
                ? 'bg-brand text-dark font-medium rounded-tr-sm'
                : 'bg-dark-300 text-gray-200 rounded-tl-sm'
            )}>
              {m.content.split('\n').map((l, i) => (
                <span key={i}>
                  {l.replace(/\*\*(.*?)\*\*/g, '$1')}
                  {i < m.content.split('\n').length - 1 && <br />}
                </span>
              ))}
              <p className={cn('text-xs mt-1', m.role === 'user' ? 'text-dark/60' : 'text-gray-500')}>
                {m.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand/20 text-brand flex items-center justify-center flex-shrink-0">
              <Bot size={15} />
            </div>
            <div className="bg-dark-300 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="text-xs text-gray-400 mr-2">IA pensando</span>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </Card>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Pergunte sobre investimentos, gastos, metas, câmbio..."
          disabled={loading}
          className="flex-1 bg-dark-300 border border-dark-400 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none text-sm focus:border-brand transition-all"
        />
        <Button onClick={() => send()} loading={loading} icon={<Send size={15} />} className="px-4" />
      </div>
    </div>
  )
}
