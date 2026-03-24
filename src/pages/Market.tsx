import React, { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { Card, Button, Badge, Loading } from '@/components/ui'
import { getExchangeRates, getMacroIndicators } from '@/services/market'

export default function Market() {
  const [rates, setRates] = useState<any[]>([])
  const [macro, setMacro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')

  const load = async () => {
    const [r, m] = await Promise.all([getExchangeRates(), getMacroIndicators()])
    setRates(r)
    setMacro(m)
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <Loading text="Carregando mercado..." />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mercado</h1>
          <p className="text-gray-400 text-sm">Câmbio e indicadores econômicos</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <span className="text-xs text-gray-500">Atualizado às {lastUpdate}</span>}
          <Button variant="secondary" size="sm"
            icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />}
            onClick={() => { setRefreshing(true); load() }}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Indicadores macro */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex justify-between mb-2">
            <p className="text-gray-400 text-xs">SELIC (a.a.)</p>
            <Badge variant="red">Alta</Badge>
          </div>
          <p className="text-2xl font-bold text-white">{macro?.selic?.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Taxa básica de juros</p>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between mb-2">
            <p className="text-gray-400 text-xs">CDI (a.a.)</p>
            <Badge variant="blue">Ref.</Badge>
          </div>
          <p className="text-2xl font-bold text-white">{macro?.cdi?.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Certificado interbancário</p>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between mb-2">
            <p className="text-gray-400 text-xs">IPCA (12m)</p>
            <Badge variant="yellow">Inflação</Badge>
          </div>
          <p className="text-2xl font-bold text-white">{macro?.ipca?.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Índice de preços</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 p-3 bg-dark-300 rounded-xl">
        <span className="text-xs text-gray-400">📊 Fonte: {macro?.source} · Ref: {macro?.updated}</span>
        <a href="https://www.bcb.gov.br" target="_blank" rel="noreferrer" className="text-brand text-xs flex items-center gap-1 ml-auto hover:underline">
          BCB <ExternalLink size={10} />
        </a>
      </div>

      {/* Câmbio */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Câmbio em tempo real</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs text-gray-400">AwesomeAPI</span>
          </div>
        </div>

        {rates.length === 0 ? (
          <p className="text-gray-400 text-sm">Carregando câmbio...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rates.map(r => (
              <div key={r.code} className="bg-dark-300 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-white text-sm">{r.code}/BRL</p>
                    <p className="text-xs text-gray-500">{r.name?.split('/')[0]}</p>
                  </div>
                  <Badge variant={r.pctChange >= 0 ? 'red' : 'green'}>
                    {r.pctChange >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(r.pctChange).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-white">R$ {r.bid.toFixed(r.code === 'JPY' ? 2 : 4)}</p>
                <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                  <span>↓ {r.low.toFixed(2)}</span>
                  <span>↑ {r.high.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {rates.find(r => r.code === 'USD') && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
            rates.find(r => r.code === 'USD')!.pctChange > 1 ? 'bg-red-500/10 text-red-400' :
            rates.find(r => r.code === 'USD')!.pctChange < -1 ? 'bg-brand/10 text-brand' :
            'bg-dark-300 text-gray-400'
          }`}>
            {rates.find(r => r.code === 'USD')!.pctChange > 1
              ? '⚠️ Dólar em alta hoje — considere aguardar para comprar moeda estrangeira.'
              : rates.find(r => r.code === 'USD')!.pctChange < -1
              ? '✅ Dólar em queda hoje — pode ser bom momento para comprar moeda estrangeira!'
              : '➡️ Câmbio relativamente estável hoje.'}
          </div>
        )}
      </Card>

      {/* Links úteis */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-3">Fontes de dados</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br', desc: 'SELIC, CDI, inflação' },
            { name: 'B3 — Bolsa Brasileira', url: 'https://www.b3.com.br', desc: 'Ações, FIIs, índices' },
            { name: 'Tesouro Direto', url: 'https://www.tesourodireto.com.br', desc: 'Títulos públicos' },
            { name: 'CoinGecko', url: 'https://www.coingecko.com', desc: 'Preços cripto' },
          ].map(({ name, url, desc }) => (
            <a key={name} href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-dark-300 hover:bg-dark-400 rounded-xl transition-colors">
              <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ExternalLink size={13} className="text-gray-500 ml-auto flex-shrink-0" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
