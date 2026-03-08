import { createContext } from 'react'
import type { Data } from '@generated/data'

export type AuthContext = {
  user?: Data.Profile
  isLoggedIn: boolean
}

export const AuthContext = createContext<AuthContext>({
  isLoggedIn: false,
})
