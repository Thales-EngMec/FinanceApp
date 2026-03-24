import React, { useState } from 'react'
import { Card, Badge, Button } from '@/components/ui'
import { BookOpen, Clock, ChevronRight, Check, Star, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

const COURSES = [
  {
    id: 'fundamentos',
    emoji: '🏦',
    title: 'Fundamentos do Mercado Financeiro',
    level: 'Iniciante',
    duration: '4h',
    desc: 'Base sólida para entender o mercado financeiro brasileiro e mundial.',
    modules: [
      {
        title: 'Como funciona o sistema financeiro',
        content: `O sistema financeiro é o conjunto de instituições, instrumentos e mercados que permitem a transferência de recursos entre agentes econômicos.

**Principais instituições:**
• **Banco Central (BACEN):** Regula e supervisiona o sistema financeiro, controla a inflação e define a taxa SELIC
• **CVM (Comissão de Valores Mobiliários):** Regula o mercado de capitais (ações, fundos, debêntures)
• **B3:** Bolsa de valores brasileira, onde são negociadas ações, FIIs, ETFs e outros ativos

**Taxa SELIC:** É a taxa básica de juros da economia. Quando o BACEN sobe a SELIC, crédito fica mais caro e investimentos em renda fixa rendem mais. Quando cai, estimula o consumo e investimentos em renda variável ficam mais atrativos.

**Exemplo prático:** Com SELIC a 13,75% ao ano, um CDB que paga 100% do CDI rende aproximadamente 1,08% ao mês — muito mais que a poupança.`,
      },
      {
        title: 'Perfis de investidor: Conservador, Moderado e Arrojado',
        content: `O perfil de investidor determina quais produtos são adequados para você. É uma avaliação de:
• **Tolerância ao risco:** Quanto você aguenta ver seu patrimônio cair?
• **Prazo de investimento:** Quando precisará do dinheiro?
• **Objetivo financeiro:** Aposentadoria, compra de imóvel, viagem?

**🛡️ Conservador:**
Prioriza segurança e liquidez. Aceita rentabilidades menores para ter previsibilidade.
- Carteira ideal: 80% Renda Fixa + 15% FIIs + 5% Ações
- Produtos: Tesouro Selic, CDB, LCI, LCA

**⚖️ Moderado:**
Equilibra segurança e rentabilidade. Aceita oscilações de curto prazo.
- Carteira ideal: 50% Renda Fixa + 30% Renda Variável + 20% FIIs/ETFs
- Produtos: Mix de renda fixa + ações blue chips + FIIs

**🚀 Arrojado:**
Busca máxima rentabilidade no longo prazo. Aceita quedas temporárias.
- Carteira ideal: 20% Renda Fixa + 60% Ações + 10% Cripto + 10% Internacional
- Produtos: Ações de crescimento, ETFs, cripto, BDRs`,
      },
      {
        title: 'Inflação, juros e seus investimentos',
        content: `**Inflação (IPCA):** Mede o aumento geral dos preços. Se a inflação é 5% ao ano e seu investimento rende 4%, você PERDEU poder de compra na prática.

**Rentabilidade Real = Rentabilidade Nominal - Inflação**

Exemplo: CDB a 13% ao ano com IPCA de 5% = rentabilidade real de ~7,6% ao ano.

**Como proteger seu patrimônio da inflação:**
• **Tesouro IPCA+:** Paga inflação + uma taxa fixa (ex: IPCA + 6%). Protege 100% da inflação.
• **FIIs:** Aluguéis são reajustados pela inflação periodicamente
• **Ações:** Empresas repassam inflação nos preços — proteção no longo prazo
• **CDB/LCI indexados ao IPCA:** Protegem o poder de compra

**Erro comum:** Deixar dinheiro na poupança quando a SELIC está alta. A poupança rende apenas 70% da SELIC quando a taxa está acima de 8,5% — muito abaixo de um CDB simples.`,
      },
    ],
  },
  {
    id: 'renda-fixa',
    emoji: '💰',
    title: 'Renda Fixa: Do Básico ao Avançado',
    level: 'Iniciante',
    duration: '5h',
    desc: 'Domine Tesouro Direto, CDB, LCI, LCA, CRI, CRA e Debêntures.',
    modules: [
      {
        title: 'Tesouro Direto: os 3 tipos e quando usar cada um',
        content: `O Tesouro Direto é o investimento mais seguro do Brasil — você está emprestando dinheiro para o governo federal.

**🔵 Tesouro Selic (pós-fixado):**
- Rende a taxa SELIC (hoje ~13,75% ao ano)
- Liquidez diária: resgate a qualquer momento sem perda
- Ideal para: Reserva de emergência
- Mínimo: R$ 30,00

**🟡 Tesouro Prefixado:**
- Taxa travada na compra (ex: 12% ao ano até 2027)
- Se SELIC cair, você ganha mais que o mercado
- Risco: Se precisar vender antes do vencimento, pode perder
- Ideal para: Quem acredita que juros vão cair

**🟢 Tesouro IPCA+ (híbrido):**
- Paga inflação + taxa fixa (ex: IPCA + 6,5% ao ano)
- Protege 100% do poder de compra + rentabilidade real
- Ideal para: Aposentadoria, metas de longo prazo (5+ anos)
- Melhor escolha para quem quer preservar patrimônio

**Imposto de Renda no Tesouro:**
| Prazo | Alíquota IR |
|-------|-------------|
| Até 6 meses | 22,5% |
| 6 a 12 meses | 20% |
| 12 a 24 meses | 17,5% |
| Acima de 24 meses | 15% |`,
      },
      {
        title: 'CDB, LCI e LCA: diferenças e estratégias',
        content: `**CDB (Certificado de Depósito Bancário):**
Você empresta dinheiro ao banco. Garantido pelo FGC até R$ 250.000 por CPF por instituição.

- Pós-fixado: % do CDI (ex: 110% CDI = rende mais que o Tesouro Selic)
- Prefixado: taxa travada (ex: 13% ao ano)
- IPCA+: proteção contra inflação
- Tem imposto de renda (tabela regressiva)

**Dica de ouro:** Bancos menores (Banco Inter, C6, PagBank) frequentemente oferecem 120-140% do CDI. Risco maior mas coberto pelo FGC.

**LCI (Letra de Crédito Imobiliário):**
- ISENTO de imposto de renda para pessoa física
- Prazo mínimo: 12 meses (não tem liquidez diária)
- Normalmente paga menos % do CDI que CDB
- Mas por ser isento de IR, o retorno líquido pode ser maior

**LCA (Letra de Crédito do Agronegócio):**
- Também ISENTA de IR
- Mesma lógica da LCI, mas vinculada ao agronegócio

**Como comparar CDB x LCI/LCA:**
- CDB 110% CDI por 1 ano = após IR (17,5%) fica ~91% CDI líquido
- LCI 90% CDI = 90% CDI líquido (sem IR)
- Neste caso: LCI 90% CDI ganha do CDB 110%!

**CRI e CRA (para investidores experientes):**
- Certificados de Recebíveis Imobiliários/Agronegócio
- Também isentos de IR
- Não têm garantia do FGC
- Rentabilidades mais atrativas (IPCA + 7-9%)`,
      },
      {
        title: 'Montando sua carteira de renda fixa ideal',
        content: `**Estratégia por objetivo:**

🚨 **Reserva de emergência (6x salário):**
→ 100% Tesouro Selic ou CDB com liquidez diária
→ Nunca invista em produtos sem liquidez para emergências!

🏠 **Meta de curto prazo (até 2 anos):**
→ CDB prefixado ou LCI/LCA
→ Trave a taxa antes que a SELIC caia

🌅 **Aposentadoria (10+ anos):**
→ 60% Tesouro IPCA+ longo prazo
→ 40% Outros ativos (ações, FIIs)
→ Quanto mais longo o prazo, mais o IPCA+ faz sentido

**Diversificação inteligente:**
• Não concentre tudo em um banco (limite FGC = R$ 250k/banco)
• Escalone vencimentos (Laddering): vença um investimento por ano
• Mix pós + pré + IPCA protege em qualquer cenário de juros

**Plataformas para comprar:**
• Tesouro Direto: tesouro.economia.gov.br
• CDB/LCI/LCA: XP, BTG, Nu Invest, Rico, Inter
• Compare taxas em: comparadordetaxas.com.br`,
      },
    ],
  },
  {
    id: 'acoes',
    emoji: '📈',
    title: 'Ações: Como Investir na Bolsa de Valores',
    level: 'Intermediário',
    duration: '6h',
    desc: 'Análise fundamentalista, técnica e estratégias de longo prazo.',
    modules: [
      {
        title: 'O que são ações e como a bolsa funciona',
        content: `**O que é uma ação?**
Quando você compra uma ação, torna-se SÓCIO de uma empresa. Se a empresa lucra e cresce, sua ação valoriza. Se distribui lucros, você recebe dividendos.

**Como a bolsa funciona:**
• **Pregão:** Das 10h às 17h no horário de Brasília
• **Lotes:** Ações são negociadas em lotes de 100 (ex: PETR4 em lotes de 100)
• **Fracionário:** Permite comprar 1 ação (código termina em F: PETR4F)
• **Liquidação:** D+2 — o dinheiro cai em 2 dias úteis após a venda

**Tipos de ações:**
• **ON (Ordinária):** Tem direito a voto. Código termina em 3 (PETR3)
• **PN (Preferencial):** Prioridade nos dividendos, sem voto. Termina em 4 (PETR4)
• **UNIT:** Conjunto de ON + PN. Termina em 11 (ITUB11)

**Imposto de Renda em ações:**
• Venda até R$ 20.000/mês: ISENTO para pessoa física
• Venda acima de R$ 20.000/mês: 15% de IR sobre o lucro
• Day trade: sempre 20% de IR (sem isenção)

**Custos operacionais:**
• Corretagem: muitas corretoras cobram R$ 0 (XP, Clear, Rico)
• Taxa de custódia B3: R$ 0,40/mês (cobrada pela B3)
• Emolumentos: ~0,03% sobre o valor negociado`,
      },
      {
        title: 'Análise Fundamentalista: como escolher ações',
        content: `A análise fundamentalista avalia a saúde financeira da empresa para encontrar boas ações a preço justo ou barato.

**Principais indicadores:**

**P/L (Preço/Lucro):**
Quanto o mercado paga por R$ 1 de lucro. P/L de 15 = leva 15 anos para recuperar o investimento via lucros.
- P/L baixo (< 10): pode estar barato
- P/L alto (> 25): caro ou empresa de crescimento

**P/VP (Preço/Valor Patrimonial):**
Compara preço de mercado com patrimônio líquido.
- P/VP < 1: ação abaixo do valor contábil (pode ser oportunidade)
- P/VP > 3: empresa valorizada pelo mercado

**Dividend Yield (DY):**
Dividendos pagos / Preço da ação × 100
- DY 6%+ é considerado bom
- Bancos e elétricas geralmente pagam DY alto

**ROE (Return on Equity):**
Lucro / Patrimônio Líquido. Mede eficiência da empresa.
- ROE > 15% = empresa eficiente
- Bancos: ROE > 20% é excelente

**Empresas para estudar (blue chips brasileiras):**
• VALE3: Mineração, exporta minério de ferro
• PETR4: Petróleo, forte pagadora de dividendos
• ITUB4: Banco Itaú, maior banco privado do Brasil
• WEGE3: WEG, empresa industrial com expansão global
• RENT3: Localiza, líder em aluguel de carros`,
      },
      {
        title: 'Estratégias: Buy & Hold, Dividendos e Small Caps',
        content: `**Buy & Hold (Comprar e Manter):**
Estratégia de longo prazo: compra boas empresas e mantém por 10-20 anos.

Warren Buffett: "Nosso período favorito de manutenção é para sempre."

Como funciona:
1. Identifica empresa com vantagem competitiva durável
2. Compra a preço razoável
3. Reinveste dividendos
4. Ignora as oscilações do mercado
5. Deixa os juros compostos trabalharem

Resultado histórico: WEGE3 multiplicou 100x em 15 anos!

**Carteira de Dividendos:**
Foco em empresas que distribuem lucros regularmente.

Setores que mais pagam dividendos:
- Bancos (ITUB4, BBDC4, SANB11)
- Elétricas (TAEE11, CPFE3, EGIE3)
- Telecomunicações (VIVT3)

Meta: construir uma carteira que gere renda passiva mensal

**Small Caps (empresas menores):**
Maior potencial de crescimento, maior risco.
- MÉLIUZ (CASH3): fintech em crescimento
- Empresas com market cap abaixo de R$ 2 bilhões
- Maior volatilidade = mais risco, mais potencial

**Estratégia de aportes:**
• Aporte mensal fixo (ex: R$ 500/mês)
• Independente do preço (elimina risco de timing)
• Dollar Cost Averaging: média de preço ao longo do tempo`,
      },
    ],
  },
  {
    id: 'fiis',
    emoji: '🏢',
    title: 'Fundos Imobiliários (FIIs): Renda Passiva',
    level: 'Intermediário',
    duration: '4h',
    desc: 'Invista em imóveis, receba aluguéis mensais e pague zero IR.',
    modules: [
      {
        title: 'O que são FIIs e por que investir',
        content: `**Fundo de Investimento Imobiliário (FII):**
É como um condomínio de investidores que compram imóveis juntos e dividem os aluguéis.

**Vantagens enormes:**
✅ Isenção de IR nos dividendos (para pessoa física)
✅ Acessível: a partir de R$ 10-100 (valor de uma cota)
✅ Liquidez: vende na bolsa em segundos
✅ Diversificação: um FII pode ter dezenas de imóveis
✅ Gestão profissional inclusa
✅ Distribuição mensal obrigatória de 95% dos lucros

**Como funciona na prática:**
Você compra cotas de um FII na bolsa. O fundo possui imóveis ou títulos imobiliários. Os aluguéis são divididos entre os cotistas todo mês, livre de IR.

Exemplo: KNRI11 (Kinea Rendimentos Imobiliários)
- Patrimônio: R$ 5 bilhões
- 160+ imóveis (galpões, escritórios)
- Paga ~R$ 1,00/cota/mês
- Dividend Yield: ~8% ao ano (isento de IR)

**Comparação com imóvel físico:**
| Aspecto | Imóvel Físico | FII |
|---------|---------------|-----|
| Capital mínimo | R$ 200.000+ | R$ 10 |
| Liquidez | Meses | Segundos |
| Gestão | Você mesmo | Profissional |
| Diversificação | 1 imóvel | Dezenas |
| IR no aluguel | 27,5% | 0% (PF) |`,
      },
      {
        title: 'Tipos de FIIs e como analisar',
        content: `**3 tipos principais de FIIs:**

**1. FIIs de Tijolo (imóveis físicos):**
Possuem imóveis reais: shoppings, galpões, escritórios, hospitais.

- **Shoppings:** XPML11, VISC11, HSML11 — renda de aluguel + % das vendas
- **Galpões Logísticos:** BRCO11, XPLG11 — crescimento com e-commerce
- **Lajes Corporativas:** BRCR11, HGRE11 — escritórios em grandes cidades
- **Hospitais:** HCTR11 — contratos longos, renda estável

**2. FIIs de Papel (CRI/LCI):**
Aplicam em títulos de crédito imobiliário, não em imóveis físicos.

- Rendem IPCA+ ou CDI+
- Menor risco de vacância
- Exemplos: KNCR11, MXRF11, KNHF11
- Bons quando SELIC está alta

**3. FIIs de Fundos (FOFs):**
Investem em outros FIIs — diversificação máxima.

- Gestor profissional seleciona os melhores FIIs
- Você paga dupla taxa de administração
- Exemplos: BCFF11, RBRF11

**Como analisar um FII:**

**P/VP (Preço/Valor Patrimonial):**
- P/VP < 1: ação abaixo do valor dos imóveis (oportunidade?)
- P/VP > 1,2: caro em relação ao patrimônio

**Dividend Yield (DY):**
- DY histórico dos últimos 12 meses
- DY > 8% ao ano é considerado bom
- Compare com Tesouro IPCA+ para saber se vale o risco

**Vacância:**
- % do espaço não alugado
- Vacância < 5%: excelente
- Vacância > 20%: atenção!`,
      },
    ],
  },
  {
    id: 'cripto',
    emoji: '₿',
    title: 'Criptomoedas: Guia Completo',
    level: 'Intermediário',
    duration: '5h',
    desc: 'Bitcoin, Ethereum, DeFi, gestão de risco e como não perder dinheiro.',
    modules: [
      {
        title: 'Blockchain, Bitcoin e Ethereum: entendendo a base',
        content: `**O que é Blockchain?**
É um banco de dados distribuído e imutável. Imagine um livro contábil que é copiado simultaneamente em milhares de computadores ao redor do mundo. Nenhuma entidade central controla — todos validam.

**Bitcoin (BTC) — "Ouro Digital":**
Criado em 2009 por Satoshi Nakamoto (identidade desconhecida).

Características únicas:
- Supply fixo: apenas 21 milhões de BTCs existirão
- Halving: a cada 4 anos, a emissão cai pela metade (desinflacionário)
- Descentralizado: nenhum governo ou empresa controla
- Mais de 15 anos sem ser hackeado

Por que as pessoas compram?
✅ Proteção contra inflação (supply fixo)
✅ Reserva de valor global e portátil
✅ Adoção institucional crescente (ETFs aprovados nos EUA)

**Ethereum (ETH) — "Computador Mundial":**
Vai além das transferências de valor. Permite contratos inteligentes.

- Smart Contracts: código que executa automaticamente
- DeFi (Finanças Descentralizadas): bancos sem banco
- NFTs, jogos blockchain, DAOs
- Stake: ganhe rendimentos mantendo ETH

**Risco vs Oportunidade:**
- BTC já valorizou +1.000.000% desde 2010
- Também já caiu 80-90% em ciclos de baixa
- Volatilidade extrema: não invista o que não pode perder`,
      },
      {
        title: 'Como investir com segurança em criptomoedas',
        content: `**Regra de ouro #1: Nunca invista mais do que pode perder**

Para a maioria dos investidores:
- Conservador: 0-2% da carteira em cripto
- Moderado: 2-5%
- Arrojado: 5-15%

**Estratégia Dollar Cost Averaging (DCA):**
Em vez de tentar acertar o timing do mercado:
1. Defina um valor mensal (ex: R$ 200)
2. Compre todo mês independente do preço
3. No longo prazo, media os preços automaticamente

Exemplo: R$ 200/mês em BTC por 3 anos (2021-2024) = rentabilidade positiva mesmo com os crashes

**Onde comprar com segurança no Brasil:**
- **Coinbase, Binance:** Exchanges internacionais, maior liquidez
- **Mercado Bitcoin, Foxbit:** Exchanges brasileiras, suporte em PT-BR
- **Proteção:** Use 2FA sempre, nunca compartilhe a seed phrase

**Carteiras (Wallets):**
- Custodial (exchange guarda): conveniente, risco se a exchange falir
- Non-custodial (você guarda): Metamask, Trust Wallet — você é seu próprio banco
- Cold wallet (hardware): Ledger, Trezor — máxima segurança

**Tributação no Brasil:**
- Ganhos acima de R$ 35.000/mês: 15% de IR
- Abaixo de R$ 35.000/mês: isento
- Precisa declarar mesmo se isento (patrimônio > R$ 5.000)`,
      },
    ],
  },
  {
    id: 'exterior',
    emoji: '🌍',
    title: 'Investindo no Exterior',
    level: 'Avançado',
    duration: '4h',
    desc: 'S&P 500, ETFs internacionais, BDRs, câmbio e tributação.',
    modules: [
      {
        title: 'Por que investir no exterior e como começar',
        content: `**Por que diversificar internacionalmente?**

1. **Dolarização do patrimônio:** Protege contra desvalorização do real
2. **Acesso às melhores empresas do mundo:** Apple, Microsoft, Amazon, Nvidia
3. **Diversificação geográfica:** Crise no Brasil não afeta EUA, Europa, Ásia
4. **Mercado muito maior:** A bolsa americana representa ~45% do mercado global

**S&P 500 — O índice mais importante do mundo:**
Representa as 500 maiores empresas dos EUA.

Rentabilidade histórica (em dólar):
- 10 anos: ~12% ao ano
- 20 anos: ~9% ao ano
- Corrigido pela inflação americana: ~7% ao ano real

Se você tivesse investido R$ 10.000 no S&P 500 em 2010, hoje teria ~R$ 120.000 (incluindo a valorização do dólar).

**3 formas de investir:**

**1. BDRs (Brazilian Depositary Receipts):**
Recibos de ações estrangeiras negociados na B3.
- Compra em reais pelo home broker normal
- Exemplos: AAPL34 (Apple), MSFT34 (Microsoft), AMZO34 (Amazon)
- IR: 15% sobre ganhos (sem isenção dos R$ 20k)

**2. ETFs na B3:**
- IVVB11: replica o S&P 500 em reais — a opção mais popular
- NASD11: replica o NASDAQ 100
- WRLD11: diversificação global
- SPXI11: S&P 500 com hedge cambial

**3. Conta internacional (Avenue, Nomad, IBKR):**
- Compra ações e ETFs diretamente em dólar
- Acesso a toda bolsa americana
- Melhor para quem quer construir patrimônio em dólar
- Avenue: mais simples para brasileiros iniciantes`,
      },
    ],
  },
  {
    id: 'planejamento',
    emoji: '🗺️',
    title: 'Planejamento Financeiro e Independência',
    level: 'Todos',
    duration: '3h',
    desc: 'Reserva de emergência, método 50-30-20, aposentadoria e FIRE.',
    modules: [
      {
        title: 'Os 5 pilares da saúde financeira',
        content: `**Pilar 1: Reserva de Emergência**
Antes de qualquer investimento, construa sua reserva.

Quanto ter: 6 meses de despesas fixas
Onde guardar: Tesouro Selic ou CDB com liquidez diária

Nunca invista a reserva de emergência em ações ou FIIs!

**Pilar 2: Controle de Gastos — Método 50/30/20**
• 50% da renda líquida: necessidades (aluguel, alimentação, saúde)
• 30%: desejos (lazer, viagens, restaurantes)
• 20%: poupança e investimentos

Se ganha R$ 5.000/mês:
- R$ 2.500 em necessidades
- R$ 1.500 em desejos
- R$ 1.000 em investimentos

**Pilar 3: Eliminar Dívidas Caras**
Antes de investir, pague cartão de crédito e cheque especial.

Lógica: Se o cartão cobra 15% ao mês, qualquer investimento precisa render mais de 15% ao mês para valer a pena. Nenhum investimento seguro faz isso.

**Pilar 4: Proteção (Seguros)**
- Seguro de vida: se tem dependentes
- Plano de saúde: essencial no Brasil
- Previdência privada: para benefício fiscal (PGBL para quem declara completo)

**Pilar 5: Investimento Inteligente**
Só invista após construir os 4 pilares acima. Com base sólida, qualquer investimento rende mais.`,
      },
      {
        title: 'Aposentadoria, Previdência e o Movimento FIRE',
        content: `**Previdência Privada: PGBL vs VGBL**

PGBL (Plano Gerador de Benefício Livre):
- Deduz até 12% da renda bruta no IR
- Indicado para quem faz declaração completa
- IR incide sobre total resgatado (principal + rendimento)

VGBL (Vida Gerador de Benefício Livre):
- Sem dedução fiscal
- IR incide apenas sobre os rendimentos
- Indicado para declaração simplificada

**Atenção nas taxas:**
- Taxa de administração acima de 1% ao ano é cara
- Taxa de carregamento: evite planos que cobram
- Compare com fundos de investimento tradicionais

**Quanto preciso para me aposentar?**

Regra dos 4%: você pode sacar 4% do patrimônio ao ano de forma sustentável.

Para renda de R$ 5.000/mês:
- R$ 5.000 × 12 meses = R$ 60.000/ano
- R$ 60.000 ÷ 4% = **R$ 1.500.000 necessários**

**Movimento FIRE (Financial Independence, Retire Early):**
Aposentadoria antecipada através de poupança agressiva.

Tipos:
- **Fat FIRE:** Acumula muito mais (vida confortável)
- **Lean FIRE:** Estilo de vida simples, objetivo menor
- **Barista FIRE:** Trabalho parcial + patrimônio menor

Estratégia: poupar 50-70% da renda e investir em ativos geradores de renda (FIIs, dividendos, Tesouro IPCA+).`,
      },
    ],
  },
]

export default function Education() {
  const [selected, setSelected] = useState<any>(null)
  const [selectedLesson, setSelectedLesson] = useState<number>(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  const toggleLesson = (courseId: string, lessonIdx: number) => {
    const key = `${courseId}-${lessonIdx}`
    setCompletedLessons(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  const isCourseComplete = (course: any) => {
    return course.modules.every((_: any, i: number) => completedLessons.includes(`${course.id}-${i}`))
  }

  const totalLessons = COURSES.reduce((s, c) => s + c.modules.length, 0)
  const doneLessons = completedLessons.length

  return (
    <div className="space-y-5">
      {!selected ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-white">Educação Financeira</h1>
            <p className="text-gray-400 text-sm">Conteúdo de nível CFP/CEA — do básico ao avançado</p>
          </div>

          {/* Progresso geral */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
                <Award size={24} className="text-brand" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Seu progresso</p>
                <p className="text-gray-400 text-sm">{doneLessons} de {totalLessons} aulas concluídas</p>
                <div className="w-full bg-dark-400 rounded-full h-2 mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-blue-500 transition-all"
                    style={{ width: `${totalLessons > 0 ? (doneLessons / totalLessons) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand">{totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0}%</p>
              </div>
            </div>
          </Card>

          {/* Cursos */}
          <div className="grid md:grid-cols-2 gap-4">
            {COURSES.map(course => (
              <Card key={course.id} className="p-5 cursor-pointer hover:border-brand/30 transition-all" onClick={() => { setSelected(course); setSelectedLesson(0) }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center text-2xl">
                    {course.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.level === 'Iniciante' ? 'green' : course.level === 'Intermediário' ? 'yellow' : 'red'}>
                      {course.level}
                    </Badge>
                    {isCourseComplete(course) && (
                      <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                        <Check size={12} className="text-dark" />
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{course.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{course.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {course.modules.length} aulas</span>
                  </div>
                  <div className="text-xs text-brand">
                    {course.modules.filter((_: any, i: number) => completedLessons.includes(`${course.id}-${i}`)).length}/{course.modules.length} aulas
                  </div>
                </div>
                {/* Mini progress */}
                <div className="w-full bg-dark-400 rounded-full h-1 mt-3">
                  <div className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${(course.modules.filter((_: any, i: number) => completedLessons.includes(`${course.id}-${i}`)).length / course.modules.length) * 100}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div>
          {/* Breadcrumb */}
          <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Voltar aos cursos
          </button>

          <div className="grid lg:grid-cols-4 gap-5">
            {/* Sidebar de aulas */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{selected.emoji}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{selected.title}</p>
                    <p className="text-xs text-gray-400">{selected.modules.length} aulas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selected.modules.map((mod: any, i: number) => {
                    const isDone = completedLessons.includes(`${selected.id}-${i}`)
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedLesson(i)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm',
                          selectedLesson === i ? 'bg-brand/10 border border-brand/30 text-brand' : 'hover:bg-dark-300 text-gray-400'
                        )}
                      >
                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border', isDone ? 'bg-brand border-brand text-dark' : 'border-dark-400')}>
                          {isDone ? <Check size={10} /> : i + 1}
                        </div>
                        <span className="truncate">{mod.title}</span>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Conteúdo da aula */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge variant={selected.level === 'Iniciante' ? 'green' : selected.level === 'Intermediário' ? 'yellow' : 'red'} className="mb-2">
                      {selected.level}
                    </Badge>
                    <h2 className="text-xl font-bold text-white">{selected.modules[selectedLesson].title}</h2>
                    <p className="text-gray-400 text-sm mt-1">Aula {selectedLesson + 1} de {selected.modules.length}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-brand" />
                    <span className="text-xs text-gray-400">Conteúdo certificado</span>
                  </div>
                </div>

                {/* Conteúdo formatado */}
                <div className="prose prose-invert max-w-none">
                  {selected.modules[selectedLesson].content.split('\n').map((line: string, i: number) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h3 key={i} className="text-brand font-bold text-base mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>
                    }
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                      return <p key={i} className="text-gray-300 text-sm pl-3 py-0.5 border-l-2 border-dark-400">
                        {line.replace(/^[•\-] /, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    }
                    if (line.includes('**')) {
                      return <p key={i} className="text-gray-300 text-sm my-1">
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    }
                    if (line.trim() === '') return <div key={i} className="h-2" />
                    return <p key={i} className="text-gray-300 text-sm my-1">{line}</p>
                  })}
                </div>

                {/* Navegação */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-dark-400">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedLesson(p => Math.max(0, p - 1))}
                    disabled={selectedLesson === 0}
                  >
                    ← Aula anterior
                  </Button>

                  <button
                    onClick={() => toggleLesson(selected.id, selectedLesson)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      completedLessons.includes(`${selected.id}-${selectedLesson}`)
                        ? 'bg-brand/20 text-brand border border-brand/30'
                        : 'bg-dark-300 text-gray-400 hover:text-white'
                    )}
                  >
                    <Check size={14} />
                    {completedLessons.includes(`${selected.id}-${selectedLesson}`) ? 'Concluída!' : 'Marcar como concluída'}
                  </button>

                  {selectedLesson < selected.modules.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setSelectedLesson(p => p + 1)}
                    >
                      Próxima aula →
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setSelected(null)}>
                      Voltar aos cursos ✅
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
