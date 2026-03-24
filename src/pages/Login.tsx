import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Preencha e-mail e senha')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (error) {
        console.error('Login error:', error)
        if (error.message.includes('Invalid login credentials')) {
          toast.error('E-mail ou senha incorretos')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        } else {
          toast.error(`Erro: ${error.message}`)
        }
      } else if (data.user) {
        // Verificar se onboarding foi feito
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (profile && !profile.onboarding_completed) {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      console.error('Catch error:', err)
      toast.error('Erro ao conectar. Verifique sua internet.')
    }
    setLoading(false)
  }

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) toast.error('Erro ao entrar com Google')
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center">
              <TrendingUp size={18} className="text-dark" />
            </div>
            <span className="font-bold text-white text-lg">FinanceApp</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-gray-400 text-sm mb-6">Entre na sua conta</p>

          <button
            onClick={google}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-dark-300 hover:bg-dark-400 border border-dark-400 rounded-xl text-white text-sm font-medium transition-all mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-400" /></div>
            <div className="relative flex justify-center text-xs text-gray-500 bg-dark px-3">ou entre com e-mail</div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e: any) => setForm(p => ({ ...p, email: e.target.value }))}
              icon={<Mail size={15} />}
              required
            />
            <Input
              label="Senha"
              type={show ? 'text' : 'password'}
              placeholder="Sua senha"
              value={form.password}
              onChange={(e: any) => setForm(p => ({ ...p, password: e.target.value }))}
              icon={<Lock size={15} />}
              suffix={
                <button type="button" onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              required
            />
            <div className="flex justify-end">
              <Link to="/forgot" className="text-brand text-xs hover:underline">Esqueci a senha</Link>
            </div>
            <Button type="submit" className="w-full" loading={loading} size="lg">Entrar</Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-4">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand font-semibold hover:underline">Criar grátis</Link>
          </p>
        </div>
      </div>

      {/* Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-dark-100 border-l border-dark-400 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,212,161,0.05) 0%, transparent 70%)' }} />
        <div className="text-center p-12 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <TrendingUp size={40} className="text-dark" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Sua vida financeira,<br />inteligente.</h2>
          <p className="text-gray-400 max-w-xs">Controle gastos, invista com sabedoria e conquiste seus sonhos com IA.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[{ label: 'Usuários', value: '10k+' }, { label: 'Investido', value: 'R$50M+' }, { label: 'Metas', value: '25k+' }].map(s => (
              <div key={s.label} className="bg-dark-200 border border-dark-400 rounded-xl p-3">
                <p className="text-xl font-bold text-brand">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
