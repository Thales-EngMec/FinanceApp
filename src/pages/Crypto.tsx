import React, { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, Button, Badge, Loading } from '@/components/ui'
import { getCryptoData } from '@/services/market'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

export default function Crypto() {
  const [cryptos, setCryptos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, setRef] = useState(false)

  const load = async () => { const d = await getCryptoData(25); setCryptos(d); setLoading(false); setRef(false) }
  useEffect(() => { load() }, [])

  if (loading) return <Loading text="Carregando criptomoedas..." />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Criptomoedas</h1><p className="text-gray-400 text-sm">Preços em BRL em tempo real</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"/><span className="text-xs text-gray-400">CoinGecko</span></div>
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} className={ref?'animate-spin':''} />} onClick={()=>{setRef(true);load()}}>Atualizar</Button>
        </div>
      </div>
      <Card>
        <div className="grid grid-cols-5 gap-3 p-3 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-dark-400">
          <span className="col-span-2">Crypto</span><span>Preço</span><span>24h</span><span className="hidden md:block">Market Cap</span>
        </div>
        <div className="divide-y divide-dark-400">
          {cryptos.map((c,i) => (
            <div key={c.id} className="grid grid-cols-5 gap-3 p-3 items-center hover:bg-dark-300/50 transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4">{i+1}</span>
                <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" onError={(e:any)=>e.target.style.display='none'} />
                <div><p className="font-bold text-white text-sm">{c.symbol?.toUpperCase()}</p><p className="text-xs text-gray-400 hidden sm:block">{c.name}</p></div>
              </div>
              <p className="font-semibold text-white text-sm">{c.current_price>1000?formatCurrency(c.current_price):`R$ ${c.current_price?.toFixed(c.current_price<1?6:2)}`}</p>
              <div className="flex items-center gap-1">
                {c.price_change_percentage_24h>=0?<TrendingUp size={11} className="text-brand"/>:<TrendingDown size={11} className="text-red-400"/>}
                <Badge variant={c.price_change_percentage_24h>=0?'green':'red'}>{formatPercent(c.price_change_percentage_24h)}</Badge>
              </div>
              <p className="text-sm text-gray-300 hidden md:block">R$ {formatNumber(c.market_cap)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
