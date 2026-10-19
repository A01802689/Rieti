import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'

/**
 * View model of the no-access page: asks the API for the permissions again and closes the session
 *
 * @returns `updating` (the permissions are being asked), `stillEmpty` (the last check found nothing new), `update` to ask for the permissions again and `signOut` to close the session
 */
export function useNoAccess() {
  const { refresh, logout } = useAuth()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)
  const [stillEmpty, setStillEmpty] = useState(false)

  /** Asks for the permissions again; when there are new ones the page sends the user to the page where they start, so only the opposite needs a message */
  const update = async () => {
    setUpdating(true)
    setStillEmpty(false)
    await refresh()
    setUpdating(false)
    setStillEmpty(true)
  }

  /** Closes the session and goes to the login */
  const signOut = async () => {
    await logout()
    navigate('/login')
  }

  return { updating, stillEmpty, update, signOut }
}
