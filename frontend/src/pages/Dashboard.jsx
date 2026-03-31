import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import API from '../services/api'

export default function Dashboard() {
  const [symbol, setSymbol] = useState('')
  const [quote, setQuote] = useState(null)
  const [history, setHistory] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await API.get('/stocks/watchlist')
      setWatchlist(res.data)
    } catch (err) {}
  }

  const searchStock = async () => {
    if (!symbol) return
    setLoading(true)
    setError('')
    try {
      const [quoteRes, histRes] = await Promise.all([
        API.get(`/stocks/quote/${symbol}`),
        API.get(`/stocks/history/${symbol}?period=1mo`)
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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Search Bar */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && searchStock()}
          placeholder="Search stock... (AAPL, TSLA, GOOGL)"
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={searchStock}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          <Search size={18} />
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Quote Card */}
      {quote && (
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">{quote.symbol}</h2>
              <p className="text-4xl font-bold mt-1">${quote.price}</p>
              <div className={`flex items-center gap-1 mt-1 ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {quote.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{quote.change} ({quote.change_percent}%)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">High: <span className="text-white">${quote.high}</span></p>
              <p className="text-gray-400 text-sm">Low: <span className="text-white">${quote.low}</span></p>
              <button
                onClick={() => addToWatchlist(quote.symbol)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
              >
                <Plus size={14} /> Add to Watchlist
              </button>
              <button
              onClick={async () => {
                await API.post(`/stocks/visualize/${quote.symbol}`)
                alert(`Now visualizing ${quote.symbol} in TouchDesigner!`)
              }}
              className="mt-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Zap size={14} /> Visualize in TD
            </button>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="close" stroke="#3B82F6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Your Watchlist</h3>
          <div className="flex flex-wrap gap-3">
            {watchlist.map((sym) => (
              <div key={sym} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                <span className="font-medium cursor-pointer hover:text-blue-400" onClick={() => { setSymbol(sym); searchStock() }}>{sym}</span>
                <Trash2 size={14} className="text-gray-400 hover:text-red-400 cursor-pointer" onClick={() => removeFromWatchlist(sym)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}