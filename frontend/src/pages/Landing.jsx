import { useNavigate } from 'react-router-dom'
import { TrendingUp, Zap, BarChart2, Cpu } from 'lucide-react'
import { useEffect, useRef } from 'react'

function HeroCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate fake stock line data
    const points = Array.from({ length: 80 }, (_, i) => ({
      x: (i / 79) * canvas.width,
      y: canvas.height / 2 + Math.sin(i * 0.3) * 40 + Math.random() * 30 - 15,
    }))

    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      timeRef.current += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      grad.addColorStop(0, 'rgba(15, 23, 42, 1)')
      grad.addColorStop(1, 'rgba(3, 7, 18, 1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animated stock line
      ctx.beginPath()
      points.forEach((p, i) => {
        const y = p.y + Math.sin(timeRef.current * 2 + i * 0.2) * 15
        if (i === 0) ctx.moveTo(p.x, y)
        else ctx.lineTo(p.x, y)
      })
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Fill under line
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fillStyle = 'rgba(59, 130, 246, 0.03)'
      ctx.fill()

      // Second line (green)
      ctx.beginPath()
      points.forEach((p, i) => {
        const y = p.y + Math.sin(timeRef.current * 1.5 + i * 0.15 + 2) * 20 - 60
        if (i === 0) ctx.moveTo(p.x, y)
        else ctx.lineTo(p.x, y)
      })
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Third line (purple)
      ctx.beginPath()
      points.forEach((p, i) => {
        const y = p.y + Math.sin(timeRef.current + i * 0.25 + 4) * 25 + 60
        if (i === 0) ctx.moveTo(p.x, y)
        else ctx.lineTo(p.x, y)
      })
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Floating particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`
        ctx.fill()
      })

      // Connecting lines between nearby particles
      particlesRef.current.forEach((p, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - dist / 100) * 0.15})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // Glowing dots on the main line
      points.forEach((p, i) => {
        if (i % 10 === 0) {
          const y = p.y + Math.sin(timeRef.current * 2 + i * 0.2) * 15
          ctx.beginPath()
          ctx.arc(p.x, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(p.x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'
          ctx.fill()
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-gray-900">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-400" size={24} />
          <span className="text-white font-bold text-xl">MarketPulse</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-white px-4 py-2 transition">
            Login
          </button>
          <button onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-medium">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero with canvas */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-transparent to-gray-950/80" />
        {/* Hero content */}
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800 text-blue-400 text-sm px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Zap size={14} />
            Live stock data → generative visuals via TouchDesigner
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            The Market,
            <span className="text-blue-400"> Visualized</span>
          </h1>
          <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
            MarketPulse transforms live stock market data into stunning generative art experiences using Python, TouchDesigner, and OSC streaming.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition">
              Start Visualizing
            </button>
            <button onClick={() => navigate('/login')}
              className="bg-gray-900/80 hover:bg-gray-800 border border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition backdrop-blur-sm">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to visualize markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-800 transition">
            <BarChart2 className="text-blue-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Live Market Data</h3>
            <p className="text-gray-400 text-sm">Real-time stock quotes, price history and market metrics for US and Indian markets including NSE and BSE.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-800 transition">
            <Zap className="text-purple-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">TouchDesigner Bridge</h3>
            <p className="text-gray-400 text-sm">OSC protocol streams market data directly into TouchDesigner for real-time generative art driven by live prices.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-800 transition">
            <Cpu className="text-green-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Full Stack Pipeline</h3>
            <p className="text-gray-400 text-sm">Skills: with FastAPI, React, SQLAlchemy and python-osc — a production-ready AI engineer's tech stack.</p>
          </div>
        </div>
      </div>

      {/* Tech stack section */}
      <div className="max-w-5xl mx-auto px-8 pb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-6 text-gray-300">Built with</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['Python', 'FastAPI', 'React', 'TouchDesigner', 'OSC', 'SQLAlchemy', 'yfinance', 'JWT Auth', 'NewsAPI', 'Tailwind CSS'].map((tech) => (
              <span key={tech} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm border-t border-gray-900">
        MarketPulse — Built by an AI Engineer who thinks in data and speaks in visuals
      </div>
    </div>
  )
}