import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import GardenView from '../components/Garden/GardenView'

export default function Garden() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const displayName = user?.displayName ?? ''
  const nick: 'nana' | 'gueguel' = displayName.toLowerCase() === 'nana' ? 'nana' : 'gueguel'

  return <GardenView nick={nick} onBack={() => navigate('/board')} />
}
