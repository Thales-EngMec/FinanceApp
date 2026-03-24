const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

export async function askAI(message: string, context?: any): Promise<string> {
  if (!API_KEY || API_KEY.length < 20) {
    return '⚠️ Configure VITE_ANTHROPIC_API_KEY nas variáveis de ambiente da Vercel.'
  }

  const profile = context?.profile
  const transactions = context?.transactions || []
  const investments = context?.investments || []
  const goals = context?.goals || []

  const system = `Você é o assistente financeiro pessoal do FinanceApp.
PERFIL: ${profile?.nickname || 'Usuário'} | ${profile?.investor_profile === 'conservative' ? 'Conservador' : profile?.investor_profile === 'aggressive' ? 'Arrojado' : 'Moderado'} | Renda R$ ${profile?.monthly_income || 0}
${transactions.length > 0 ? `GASTOS RECENTES: ${JSON.stringify(transactions.slice(0,5))}` : ''}
${investments.length > 0 ? `INVESTIMENTOS: ${JSON.stringify(investments.slice(0,5))}` : ''}
${goals.length > 0 ? `METAS: ${JSON.stringify(goals.slice(0,5))}` : ''}
Responda em português brasileiro. Seja objetivo, prático. Use emojis moderadamente.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('AI error:', res.status, err)
      if (res.status === 401) return '❌ Chave da API inválida. Verifique VITE_ANTHROPIC_API_KEY na Vercel.'
      if (res.status === 400) return `❌ Erro na requisição (400): ${JSON.stringify(err?.error?.message || err)}`
      if (res.status === 429) return '⏳ Limite de uso atingido. Aguarde alguns minutos.'
      return `❌ Erro ${res.status}. Tente novamente.`
    }

    const data = await res.json()
    return data.content?.[0]?.text || 'Resposta vazia.'
  } catch (err: any) {
    console.error('AI fetch error:', err)
    return `❌ Erro de conexão: ${err.message}`
  }
}

export async function analyzeProfile(profile: any, transactions: any[], investments: any[], goals: any[]): Promise<string> {
  const totalExp = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0)
  const totalInv = investments.reduce((s: number, i: any) => s + i.amount_invested, 0)
  const income = profile?.monthly_income || 0
  const savingsRate = income > 0 ? ((income - totalExp) / income * 100).toFixed(0) : 0

  return askAI(`Análise financeira completa:
Renda: R$ ${income} | Gastos: R$ ${totalExp} | Poupança: ${savingsRate}% | Investido: R$ ${totalInv}
Metas: ${goals.map((g: any) => g.title).join(', ') || 'Nenhuma'} | Perfil: ${profile?.investor_profile}
Responda com: 1)Saúde financeira(nota 0-10) 2)O que priorizar 3)Quanto guardar p/metas 4)Investimentos ideais 5)Plano 3 meses`, 
  { profile, transactions, investments, goals })
}
