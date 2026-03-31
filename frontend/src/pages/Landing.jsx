import { useNavigate } from 'react-router-dom'
import { TrendingUp, Zap, BarChart2, Cpu } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-900">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-400" size={24} />
          <span className="text-white font-bold text-xl">MarketPulse</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-white px-4 py-2 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-400 text-sm px-4 py-2 rounded-full mb-8">
          <Zap size={14} />
          Live stock data → generative visuals via TouchDesigner
        </div>
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          The Market,
          <span className="text-blue-400"> Visualized</span>
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          MarketPulse transforms live stock market data into stunning generative art experiences using Python, TouchDesigner, and OSC streaming.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition"
          >
            Start Visualizing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <BarChart2 className="text-blue-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Live Market Data</h3>
            <p className="text-gray-400 text-sm">Real-time stock quotes, price history and market metrics for US and Indian markets.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <Zap className="text-purple-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">TouchDesigner Bridge</h3>
            <p className="text-gray-400 text-sm">OSC protocol streams market data directly into TouchDesigner for real-time generative visuals.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <Cpu className="text-green-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">AI-Powered Pipeline</h3>
            <p className="text-gray-400 text-sm">Built with FastAPI, React, SQLAlchemy and python-osc — a full production-ready stack.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm border-t border-gray-900">
        Built with Python, FastAPI, React, TouchDesigner & OSC
      </div>
    </div>
  )
}