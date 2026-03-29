import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, TrendingUp } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-blue-400" size={24} />
        <span className="text-white font-bold text-xl">MarketPulse</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Welcome, <span className="text-white font-medium">{user.username}</span></span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}