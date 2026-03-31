import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Zap, Activity, Clock } from 'lucide-react'
import API from '../services/api'

function StockCanvas({ quote }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const timeRef = useRef(0)

  useEffect(() => {
    if (!quote) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const isPositive = quote.change >= 0
    const color = isPositive ? '#22c55e' : '#ef4444'
    const intensity = Math.min(Math.abs(quote.change_percent) / 5, 1)
    const volatility = Math.abs(quote.high - quote.low) / quote.price
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (1 + intensity * 4),
      vy: (Math.random() - 0.5) * (1 + intensity * 4),
      size: Math.random() * 3 + 1,
      opacity: Math.random(),
      pulse: Math.random() * Math.PI * 2,
    }))
    const draw = () => {
      timeRef.current += 0.02
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 1; i <= 3; i++) {
        const radius = (50 + i * 40 + Math.sin(timeRef.current + i) * 10 * volatility * 20)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `${color}${Math.floor(0.08 * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      const volumeWidth = canvas.width * Math.min(quote.volume / 100000000, 1)
      ctx.fillStyle = `${color}33`
      ctx.fillRect(0, canvas.height - 6, volumeWidth, 4)
      ctx.fillStyle = color
      ctx.fillRect(0, canvas.height - 6, volumeWidth * (0.3 + 0.7 * Math.abs(Math.sin(timeRef.current))), 4)
      particlesRef.current.forEach((p) => {
        p.pulse += 0.05
        p.x += p.vx
        p.y += p.vy
        p.opacity = 0.4 + Math.sin(p.pulse) * 0.4
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      })
      particlesRef.current.forEach((p, i) => {
        particlesRef.current.slice(i + 1, i + 6).forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `${color}${Math.floor((1 - dist / 80) * 50).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(10, 10, 160, 80)
      ctx.fillStyle = '#ffffff99'
      ctx.font = '11px monospace'
      ctx.fillText(`Price:  ${quote.currency}${quote.price}`, 20, 28)
      ctx.fillText(`Change: ${quote.change_percent}%`, 20, 46)
      ctx.fillText(`High:   ${quote.currency}${quote.high}`, 20, 64)
      ctx.fillText(`Low:    ${quote.currency}${quote.low}`, 20, 82)
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [quote])

  if (!quote) return null
  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className={`text-2xl font-bold ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {quote.change >= 0 ? '▲' : '▼'} {Math.abs(quote.change_percent)}%
        </div>
      </div>
    </div>
  )
}

function NewsPanel({ symbol }) {
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true)
      try {
        const url = symbol ? `/stocks/news/${symbol}` : '/stocks/news'
        const res = await API.get(url)
        setNews(res.data)
      } catch (err) {}
      finally { setNewsLoading(false) }
    }
    fetchNews()
  }, [symbol])
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-300">{symbol ? `${symbol} News` : 'Market News'}</h3>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>
      {newsLoading ? (
        <p className="text-gray-500 text-sm">Loading news...</p>
      ) : news.length === 0 ? (
        <p className="text-gray-500 text-sm">No news available</p>
      ) : (
        <div className="space-y-4">
          {news.map((article, i) => (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
              className="block hover:bg-gray-800 p-3 rounded-xl transition">
              <p className="text-white text-sm font-medium leading-snug mb-1">{article.title}</p>
              <p className="text-gray-500 text-xs">{article.source} · {article.published}</p>
              {article.description && (
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{article.description}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function DateTimeCard() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const isWeekday = now.getDay() > 0 && now.getDay() < 6
  const hour = now.getHours()
  const indiaOpen = isWeekday && hour >= 9 && hour < 16
  const usOpen = isWeekday && ((hour >= 19 && hour <= 23) || (hour >= 0 && hour < 2))
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-blue-400" />
        <h3 className="font-bold text-gray-300">Market Clock</h3>
      </div>
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-white font-mono">
          {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
          <span className="text-gray-400 text-xs">🇮🇳 NSE/BSE</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${indiaOpen ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {indiaOpen ? '● Open' : '● Closed'}
          </span>
        </div>
        <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
          <span className="text-gray-400 text-xs">🇺🇸 NYSE/NASDAQ</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${usOpen ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {usOpen ? '● Open' : '● Closed'}
          </span>
        </div>
      </div>
    </div>
  )
}


function ChatWidget({ symbol }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about stocks or the market. I can analyze any stock you\'re viewing!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await API.post('/stocks/chat', {
        message: userMsg,
        symbol: symbol || null
      })
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process that. Try again!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col h-96">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h3 className="font-bold text-gray-300">AI Market Analyst</h3>
        {symbol && <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full">{symbol}</span>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-3 py-2 rounded-xl text-sm text-gray-400">
              Analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={symbol ? `Ask about ${symbol}...` : 'Ask about any stock...'}
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [symbol, setSymbol] = useState('')
  const [quote, setQuote] = useState(null)
  const [history, setHistory] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tdActive, setTdActive] = useState(false)

  useEffect(() => { fetchWatchlist() }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await API.get('/stocks/watchlist')
      setWatchlist(res.data)
    } catch (err) {}
  }

  const searchStock = async (sym) => {
    const s = sym || symbol
    if (!s) return
    setLoading(true)
    setError('')
    try {
      const [quoteRes, histRes] = await Promise.all([
        API.get(`/stocks/quote/${s}`),
        API.get(`/stocks/history/${s}?period=1mo`)
      ])
      setQuote(quoteRes.data)
      setHistory(histRes.data)
    } catch (err) {
      setError('Stock not found. Try AAPL, TSLA, GOOGL...')
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async (sym) => {
    try {
      await API.post(`/stocks/watchlist/${sym}`)
      fetchWatchlist()
    } catch (err) {}
  }

  const removeFromWatchlist = async (sym) => {
    try {
      await API.delete(`/stocks/watchlist/${sym}`)
      fetchWatchlist()
    } catch (err) {}
  }

  const visualizeInTD = async () => {
    try {
      await API.post(`/stocks/visualize/${quote.symbol}`)
      setTdActive(true)
      setTimeout(() => setTdActive(false), 3000)
    } catch (err) {}
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && searchStock()}
            placeholder="Search stock... (AAPL, TSLA, GOOGL, RELIANCE.NS)"
            className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button onClick={() => searchStock()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl flex items-center gap-2 transition font-medium">
            <Search size={18} />
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {quote ? (
              <>
                {/* Stock Header */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-4xl font-bold">{quote.symbol}</h2>
                      <p className="text-5xl font-bold mt-2">{quote.currency}{quote.price}</p>
                      <div className={`flex items-center gap-2 mt-2 text-lg ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {quote.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <span>{quote.change} ({quote.change_percent}%)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => addToWatchlist(quote.symbol)}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                        <Plus size={14} /> Watchlist
                      </button>
                      <button onClick={visualizeInTD}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition font-medium ${tdActive ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                        <Zap size={14} /> {tdActive ? 'Sent to TD!' : 'Visualize in TD'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Day High</p>
                      <p className="text-white font-bold text-lg">{quote.currency}{quote.high}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Day Low</p>
                      <p className="text-white font-bold text-lg">{quote.currency}{quote.low}</p>
                    </div>
                  </div>
                </div>

                {/* Canvas Visual */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-purple-400" />
                    <h3 className="font-semibold text-gray-300">Live Market Visual</h3>
                    <span className="text-xs text-gray-500">(mirrors TouchDesigner)</span>
                  </div>
                  <StockCanvas quote={quote} />
                </div>

                {/* Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-300 mb-4">30 Day Price History</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="close" stroke="#3B82F6" fill="url(#colorClose)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Stock specific news */}
                <NewsPanel symbol={quote.symbol} />
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                  <TrendingUp size={48} className="text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Search for a stock to get started</p>
                  <p className="text-gray-600 text-sm mb-6">Try these popular stocks:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'META'].map((s) => (
                      <button key={s} onClick={() => { setSymbol(s); searchStock(s) }}
                        className="bg-gray-800 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition">{s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* General market news when no stock searched */}
                <NewsPanel symbol={null} />
              </div>
            )}
          </div>

          {/* Right Column — always visible */}
          <div className="space-y-4">

            {/* Date Time Card — always visible */}
            <DateTimeCard />

            {/* Watchlist */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4">Watchlist</h3>
              {watchlist.length === 0 ? (
                <p className="text-gray-500 text-sm">No stocks added yet</p>
              ) : (
                <div className="space-y-2">
                  {watchlist.map((sym) => (
                    <div key={sym}
                      className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => { setSymbol(sym); searchStock(sym) }}>
                      <span className="font-medium">{sym}</span>
                      <Trash2 size={14} className="text-gray-500 hover:text-red-400 transition"
                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(sym) }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TouchDesigner */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-bold mb-3">TouchDesigner</h3>
              <p className="text-gray-400 text-sm mb-3">Stream live stock data as generative visuals</p>
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${tdActive ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${tdActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                {tdActive ? 'Streaming to TouchDesigner' : 'Open TouchDesigner with MarketPulse.toe'}
              </div>
            </div>

            {/* AI Chat */}
            <ChatWidget symbol={quote?.symbol || null} />

          </div>
        </div>
      </div>
    </div>
  )
}