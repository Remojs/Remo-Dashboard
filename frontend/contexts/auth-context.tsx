'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, getToken, setToken, removeToken, type User } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Re-hydrate user from stored token on mount
  useEffect(() => {
    const storedToken = getToken()
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    setTokenState(storedToken)
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        removeToken()
        setTokenState(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    const { user: u, token: t } = res.data
    setToken(t)
    setTokenState(t)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setTokenState(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
