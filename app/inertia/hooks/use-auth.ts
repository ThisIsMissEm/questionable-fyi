import { useContext } from 'react'
import { AuthContext } from '~/components/context/authContext'

export function useAuth() {
  return useContext(AuthContext)
}
