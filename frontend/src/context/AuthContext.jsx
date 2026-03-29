import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) {
      setUser({ username })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await loginUser({ username, password })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('username', username)
    setUser({ username })
  }

  const register = async (username, email, password) => {
    await registerUser({ username, email, password })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)