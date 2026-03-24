export async function getExchangeRates() {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,CAD-BRL,AUD-BRL,JPY-BRL,CHF-BRL,ARS-BRL')
    if (!res.ok) return []
    const data = await res.json()
    return Object.values(data).map((item: any) => ({
      code: item.code,
      name: item.name,
      bid: parseFloat(item.bid) || 0,
      ask: parseFloat(item.ask) || 0,
      high: parseFloat(item.high) || 0,
      low: parseFloat(item.low) || 0,
      pctChange: parseFloat(item.pctChange) || 0,
    }))
  } catch { return [] }
}

export async function getCryptoData(limit = 20) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`)
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function getMacroIndicators() {
  // Dados fixos confiáveis (atualize manualmente quando mudar)
  // SELIC: 14,75% aa (decisão de março/2025)
  // CDI: 14,65% aa
  // IPCA: 5,48% (acumulado 12 meses - fev/2025)
  return {
    selic: 14.75,
    cdi: 14.65,
    ipca: 5.48,
    source: 'Banco Central do Brasil',
    updated: '2025-03-20'
  }
}

export async function getSelicFromBCB() {
  // Tenta buscar a SELIC em tempo real do Banco Central
  try {
    const res = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json')
    if (!res.ok) return 14.75
    const data = await res.json()
    // A série 11 retorna a taxa diária, multiplica por 252 para anualizar
    const dailyRate = parseFloat(data[0]?.valor || 0)
    return parseFloat((dailyRate * 252).toFixed(2))
  } catch {
    return 14.75 // fallback
  }
}
