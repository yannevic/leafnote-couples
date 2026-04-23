import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { usePresence } from '../hooks/usePresence'
import GardenView from '../components/Garden/GardenView'

export default function Garden() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const uid = user?.uid ?? ''
  const displayName = user?.displayName ?? ''
  const { partnerPresence, partnerUid } = usePresence(uid, displayName)

  return (
    <GardenView
      uid={uid}
      partnerUid={partnerUid}
      displayName={displayName}
      partnerName={partnerPresence?.displayName ?? '...'}
      onBack={() => navigate('/board')}
    />
  )
}
