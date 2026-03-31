import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react'
import API from '../services/api'

function StockCanvas({ quote }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!quote) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const isPositive = quote.change >= 0
    const color = isPositive ? '#22c55e' : '#ef4444'
    const intensity = Math.min(Math.abs(quote.change_percent) / 5, 1)

    // Initialize particles
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (1 + intensity * 3),
      vy: (Math.random() - 0.5) * (1 + intensity * 3),
      size: Math.random() * 3 + 1,
      opacity: Math.random(),
    }))

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.opacity += (Math.random() - 0.5) * 0.05
        p.opacity = Math.max(0.1, Math.min(1, p.opacity))

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      })

      // Draw connecting lines
      particlesRef.current.forEach((p, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `${color}${Math.floor((1 - dist / 80) * 60).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [quote])

  if (!quote) return null

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Live Visual — {quote.symbol}</p>
          <p className={`text-2xl font-bold ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {quote.change >= 0 ? '▲' : '▼'} {Math.abs(quote.change_percent)}%
          </p>
        </div>
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

  useEffect(() => {
    fetchWatchlist()
  }, [])

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
            placeholder="Search stock... (AAPL, TSLA, GOOGL, MSFT)"
            className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => searchStock()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Search size={18} />
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {quote && (
              <>
                {/* Stock Header */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-4xl font-bold">{quote.symbol}</h2>
                      <p className="text-5xl font-bold mt-2">${quote.price}</p>
                      <div className={`flex items-center gap-2 mt-2 text-lg ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {quote.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <span>{quote.change} ({quote.change_percent}%)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => addToWatchlist(quote.symbol)}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                      >
                        <Plus size={14} /> Watchlist
                      </button>
                      <button
                        onClick={visualizeInTD}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition font-medium ${tdActive ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        <Zap size={14} /> {tdActive ? 'Sent to TD!' : 'Visualize in TD'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Day High</p>
                      <p className="text-white font-bold text-lg">${quote.high}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Day Low</p>
                      <p className="text-white font-bold text-lg">${quote.low}</p>
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
              </>
            )}

            {!quote && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <TrendingUp size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Search for a stock to get started</p>
                <p className="text-gray-600 text-sm mt-2">Try AAPL, TSLA, GOOGL, MSFT, AMZN</p>
              </div>
            )}
          </div>

          {/* Right Column — Watchlist */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4">Watchlist</h3>
              {watchlist.length === 0 ? (
                <p className="text-gray-500 text-sm">No stocks added yet</p>
              ) : (
                <div className="space-y-2">
                  {watchlist.map((sym) => (
                    <div
                      key={sym}
                      className="flex items-center justify-between bg-gray-800 hover:bg-gray-750 px-4 py-3 rounded-xl cursor-pointer transition"
                      onClick={() => { setSymbol(sym); searchStock(sym) }}
                    >
                      <span className="font-medium">{sym}</span>
                      <Trash2
                        size={14}
                        className="text-gray-500 hover:text-red-400 transition"
                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(sym) }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-bold mb-3">TouchDesigner</h3>
              <p className="text-gray-400 text-sm mb-3">Stream live stock data as generative visuals</p>
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${tdActive ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${tdActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                {tdActive ? 'Streaming to TouchDesigner' : 'Click Visualize in TD to stream'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}