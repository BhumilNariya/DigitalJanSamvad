'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, AuthState, LoginCredentials, RegisterData } from './types'
import { authApi } from './api'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First, attempt to instantaneously hydrate from localStorage
      const cachedToken = localStorage.getItem('jansamvad_token')
      const cachedUser = localStorage.getItem('jansamvad_user')
      
      if (cachedToken && cachedUser) {
        try {
          setState({
            user: JSON.parse(cachedUser),
            isAuthenticated: true,
            isLoading: false,
          })
        } catch(e) { /* ignore parse error */ }
      }

      // Then verify with backend quietly
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        localStorage.setItem('jansamvad_user', JSON.stringify(response.data))
        setState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        localStorage.removeItem('jansamvad_token')
        localStorage.removeItem('jansamvad_user')
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }
    checkAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await authApi.login(credentials)
    
    if (response.success && response.data) {
      localStorage.setItem('jansamvad_token', response.data.token)
      localStorage.setItem('jansamvad_user', JSON.stringify(response.data.user))
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }
    
    setState(prev => ({ ...prev, isLoading: false }))
    return { success: false, error: response.error }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await authApi.register(data)
    
    if (response.success && response.data) {
      localStorage.setItem('jansamvad_token', response.data.token)
      localStorage.setItem('jansamvad_user', JSON.stringify(response.data.user))
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }
    
    setState(prev => ({ ...prev, isLoading: false }))
    return { success: false, error: response.error }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    localStorage.removeItem('jansamvad_token')
    localStorage.removeItem('jansamvad_user')
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const updateUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }))
    localStorage.setItem('jansamvad_user', JSON.stringify(user))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
