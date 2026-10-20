import type { ReactNode } from 'react'
import { AuthContext, type AuthContextType } from '@/context/auth'

interface AuthTestProviderProps {
  /** Value the components read with useAuth */
  value: AuthContextType
  /** Components under test */
  children: ReactNode
}

/** Provides a controlled session to the components under test */
export function AuthTestProvider({ value, children }: AuthTestProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
