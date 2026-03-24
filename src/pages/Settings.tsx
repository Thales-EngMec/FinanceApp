import React, { useState, useEffect } from 'react'
import { LogOut, ChevronRight, Sun, Moon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/store'
import { Card, Button, Input, Select, Badge, Tabs } from '@/components/ui'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { profile, setProfile } = useStore()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(true)
  const [form, setForm] = useState({
    full_name: '', nickname: '', monthly_income: '',
    investor_profile: 'moderate', occupation: 'clt',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        nickname: profile.nickname || '',
        monthly_income: profile.monthly_income?.toString() || '',
        investor_profile: profile.investor_profile || 'moderate',
        occupation: profile.occupation || 'clt',
      })
    }
  }, [profile])

  useEffect(() => {
    const saved = localStorage.getItem('financeapp-theme')
    if (saved === 'light') {
      setDarkMode(false)
      document.documentElement.classList.add('light-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.remove('light-mode')
      localStorage.setItem('financeapp-theme', 'dark')
    } else {
      document.documentElement.classList.add('light-mode')
      localStorage.setItem('financeapp-theme', 'light')
    }
    toast.success(newMode ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado')
  }

  const save = async () => {
    if (!user) return toast.error('Usuário não encontrado')
    setLoading(true)
    try {
      const updates = {
        full_name: form.full_name,
        nickname: form.nickname,
        monthly_income: parseFloat(form.monthly_income) || 0,
        investor_profile: form.investor_profile,
        occupation: form.occupation,
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) {
        console.error(error)
        toast.error('Erro: ' + error.message)
      } else {
        setProfile({ ...profile, ...updates })
        toast.success('Perfil atualizado! ✅')
      }
    } catch (err: any) {
      toast.error('Erro inesperado: ' + err.message)
    }
    setLoading(false)
  }

  const displayName = profile?.nickname || profile?.full_name?.split(' ')[0] || 'Usuário'

  return (
    <div className="space-y-5 max-w-xl">
      <div><h1 className="text-2xl font-bold text-white">Configurações</h1><p className="text-gray-400 text-sm">Gerencie sua conta</p></div>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center text-dark font-bold text-xl">
            {displayName.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-white">{profile?.full_name || displayName}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={profile?.investor_profile==='conservative'?'blue':profile?.investor_profile==='aggressive'?'red':'yellow'}>
                {profile?.investor_profile==='conservative'?'🛡️ Conservador':profile?.investor_profile==='aggressive'?'🚀 Arrojado':'⚖️ Moderado'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'profile', label: 'Perfil' },
        { id: 'security', label: 'Segurança' },
        { id: 'appearance', label: 'Aparência' },
      ]}/>

      {tab === 'profile' && (
        <Card className="p-6 space-y-4">
          <Input label="Nome completo" value={form.full_name} onChange={(e:any)=>setForm(p=>({...p,full_name:e.target.value}))} placeholder="Seu nome completo"/>
          <Input label="Apelido (como quer ser chamado)" value={form.nickname} onChange={(e:any)=>setForm(p=>({...p,nickname:e.target.value}))} placeholder="Ex: Thales, Rafa..."/>
          <Input label="Renda mensal líquida (R$)" type="number" value={form.monthly_income} onChange={(e:any)=>setForm(p=>({...p,monthly_income:e.target.value}))} icon={<span className="text-xs text-gray-400">R$</span>}/>
          <Select label="Ocupação" value={form.occupation} onChange={(e:any)=>setForm(p=>({...p,occupation:e.target.value}))}
            options={[{value:'clt',label:'CLT / Funcionário'},{value:'autonomo',label:'Autônomo / Freelancer'},{value:'empresario',label:'Empresário'},{value:'publico',label:'Funcionário público'},{value:'aposentado',label:'Aposentado'},{value:'estudante',label:'Estudante'}]}/>
          <Select label="Perfil de investidor" value={form.investor_profile} onChange={(e:any)=>setForm(p=>({...p,investor_profile:e.target.value}))}
            options={[{value:'conservative',label:'🛡️ Conservador'},{value:'moderate',label:'⚖️ Moderado'},{value:'aggressive',label:'🚀 Arrojado'}]}/>
          <Button onClick={save} loading={loading} className="w-full">Salvar alterações</Button>
        </Card>
      )}

      {tab === 'security' && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
            <div><p className="text-sm font-medium text-white">E-mail</p><p className="text-xs text-gray-400">{user?.email}</p></div>
            <Badge variant="green">Verificado</Badge>
          </div>
          <button onClick={() => { supabase.auth.resetPasswordForEmail(user?.email||''); toast.success('E-mail enviado!') }}
            className="w-full flex items-center justify-between p-4 bg-dark-300 hover:bg-dark-400 rounded-xl transition-colors">
            <p className="text-sm font-medium text-white">Alterar senha</p>
            <ChevronRight size={15} className="text-gray-400"/>
          </button>
          <button onClick={signOut} className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors text-left">
            <LogOut size={16} className="text-red-400"/>
            <div><p className="text-sm font-medium text-red-400">Sair da conta</p><p className="text-xs text-gray-400">Encerrar sessão atual</p></div>
          </button>
        </Card>
      )}

      {tab === 'appearance' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-white">Tema do app</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { if (!darkMode) toggleTheme() }}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${darkMode?'border-brand bg-brand/10':'border-dark-400'}`}>
              <Moon size={24} className={darkMode?'text-brand':'text-gray-400'}/>
              <span className={`text-sm font-medium ${darkMode?'text-brand':'text-gray-400'}`}>Modo Escuro</span>
              {darkMode && <span className="text-xs text-brand">✓ Ativo</span>}
            </button>
            <button onClick={() => { if (darkMode) toggleTheme() }}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${!darkMode?'border-brand bg-brand/10':'border-dark-400'}`}>
              <Sun size={24} className={!darkMode?'text-brand':'text-gray-400'}/>
              <span className={`text-sm font-medium ${!darkMode?'text-brand':'text-gray-400'}`}>Modo Claro</span>
              {!darkMode && <span className="text-xs text-brand">✓ Ativo</span>}
            </button>
          </div>
          <p className="text-xs text-gray-500">A preferência é salva automaticamente.</p>
        </Card>
      )}
    </div>
  )
}
