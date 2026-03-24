export function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export function formatPercent(value: number) {
  const v = value || 0
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export function formatNumber(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return value?.toFixed(2) || '0'
}

export function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function validateCPF(cpf: string) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  const calc = (s: string, l: number) => {
    const sum = s.split('').reduce((a, n, i) => a + +n * (l - i), 0)
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(c.slice(0, 9), 10) === +c[9] && calc(c.slice(0, 10), 11) === +c[10]
}

export function calcAge(date: string) {
  const today = new Date()
  const birth = new Date(date)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}
