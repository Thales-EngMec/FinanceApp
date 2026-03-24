import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, CreditCard, Calendar, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'
import { validateCPF, formatCPF, formatPhone, calcAge } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', cpf: '', phone: '', birth_date: '', password: '', confirm: '', terms: false })
  const [errors, setErrors] = useState<any>({})

  const checks = {
    len: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    num: /[0-9]/.test(form.password),
    sym: /[^A-Za-z0-9]/.test(form.password),
  }

  const set = (field: string) => (e: any) => {
    let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (field === 'cpf') v = formatCPF(v)
    if (field === 'phone') v = formatPhone(v)
    setForm(p => ({ ...p, [field]: v }))
    if (errors[field]) setErrors((p: any) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e: any = {}
    if (!form.full_name || form.full_name.trim().split(' ').length < 2) e.full_name = 'Digite seu nome completo'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!validateCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido'
    if (!form.birth_date || calcAge(form.birth_date) < 18) e.birth_date = 'Você precisa ter 18 anos ou mais'
    if (!Object.values(checks).every(Boolean)) e.password = 'Senha não atende os requisitos'
    if (form.password !== form.confirm) e.confirm = 'As senhas não coincidem'
    if (!form.terms) e.terms = 'Aceite os termos para continuar'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name }, emailRedirectTo: `${window.location.origin}/dashboard` }
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.full_name,
          nickname: form.full_name.split(' ')[0],
          email: form.email,
          cpf: form.cpf.replace(/\D/g, ''),
          phone: form.phone.replace(/\D/g, ''),
          birth_date: form.birth_date,
          onboarding_completed: false,
        })
        toast.success('Conta criada! Verifique seu e-mail.')
        navigate('/onboarding')
      }
    } catch (err: any) {
      toast.error(err.message?.includes('already') ? 'E-mail já cadastrado' : 'Erro ao criar conta')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md animate-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center">
            <TrendingUp size={18} className="text-dark" />
          </div>
          <span className="font-bold text-white text-lg">FinanceApp</span>
        </div>

        <div className="bg-dark-200 border border-dark-400 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-white mb-1">Criar conta grátis</h1>
          <p className="text-gray-400 text-sm mb-5">Preencha seus dados para começar</p>

          <form onSubmit={submit} className="space-y-3">
            <Input label="Nome completo" placeholder="Rafael Santos Oliveira" value={form.full_name} onChange={set('full_name')} icon={<User size={15} />} error={errors.full_name} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} icon={<Mail size={15} />} error={errors.email} required />

            <div className="grid grid-cols-2 gap-3">
              <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} maxLength={14} icon={<CreditCard size={15} />} error={errors.cpf} required />
              <Input label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} maxLength={15} icon={<Phone size={15} />} error={errors.phone} required />
            </div>

            <Input label="Data de nascimento" type="date" value={form.birth_date} onChange={set('birth_date')} icon={<Calendar size={15} />} error={errors.birth_date}
              max={new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().split('T')[0]} required />

            <Input label="Senha" type={show ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} icon={<Lock size={15} />} error={errors.password}
              suffix={<button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>} required />

            {form.password && (
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-dark-300 rounded-xl">
                {[['len', '8+ caracteres'], ['upper', 'Letra maiúscula'], ['num', 'Número'], ['sym', 'Símbolo']].map(([k, l]) => (
                  <div key={k} className={`flex items-center gap-1 text-xs ${(checks as any)[k] ? 'text-brand' : 'text-gray-500'}`}>
                    <span>{(checks as any)[k] ? '✓' : '○'}</span> {l}
                  </div>
                ))}
              </div>
            )}

            <Input label="Confirmar senha" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} icon={<Lock size={15} />} error={errors.confirm} required />

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={set('terms')} className="mt-0.5 accent-brand w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-gray-400 leading-relaxed">Li e aceito os <span className="text-brand">Termos de Uso</span> e a <span className="text-brand">Política de Privacidade</span>. Autorizo o tratamento dos meus dados conforme a LGPD.</span>
              </label>
              {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">Criar conta →</Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-4">
            Já tem conta? <Link to="/login" className="text-brand font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
