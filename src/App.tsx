import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase'
import { getUserProfile } from './lib/couple'
import { useCouple } from './hooks/useCouple'
import Board from './pages/Board'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import TitleBar from './components/TitleBar'
import UpdateNotifier, { UpdateStatus } from './components/UpdateNotifier'
import { useBoards } from './hooks/useBoards'
import type { UserProfile } from './types/couple'

function AppInner({
  user,
  profile,
  onProfileUpdate,
}: {
  user: User
  profile: UserProfile
  onProfileUpdate: () => void
}) {
  const { extraBoards, activeBoardId, setActiveBoardId, addBoard, removeBoard } = useBoards(
    user.uid
  )
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)

  const { coupleId, partnerUid, pendingRequests } = useCouple(user.uid, profile)

  if (!profile.coupleId) {
    return <Onboarding uid={user.uid} displayName={profile.displayName} onDone={onProfileUpdate} />
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <UpdateNotifier
        onStatus={setUpdateStatus}
        onProgress={setUpdateProgress}
        onError={() => {}}
      />
      <TitleBar
        extraBoards={extraBoards}
        activeBoardId={activeBoardId}
        onSwitchBoard={setActiveBoardId}
        onAddBoard={addBoard}
        onRemoveBoard={removeBoard}
        updateStatus={updateStatus}
        updateProgress={updateProgress}
        onInstallUpdate={() => window.api.installUpdate()}
        onCheckUpdate={() => window.api.checkForUpdates()}
        coupleId={coupleId}
        memberUids={[user.uid, ...(partnerUid ? [partnerUid] : [])]}
        onCoupleDissolve={onProfileUpdate}
      />
      <div className="flex-1 overflow-hidden">
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/board" replace />} />
            <Route
              path="/board"
              element={
                <Board
                  activeBoardId={activeBoardId}
                  coupleId={coupleId}
                  partnerUid={partnerUid}
                  pendingRequests={pendingRequests}
                />
              }
            />
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  async function loadProfile(u: User) {
    let p = await getUserProfile(u.uid)
    if (!p && u.displayName) {
      p = {
        uid: u.uid,
        displayName: u.displayName,
        sex: 'female',
        createdAt: new Date().toISOString(),
      }
    }
    setProfile(p)
    setAuthLoading(false)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) {
        void loadProfile(u)
      } else {
        setProfile(null)
        setAuthLoading(false)
      }
    })
    return unsub
  }, [])

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#fdf6f0' }}>
        <TitleBar
          extraBoards={[]}
          activeBoardId="default"
          onSwitchBoard={() => {}}
          onAddBoard={() => {}}
          onRemoveBoard={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <TitleBar
          extraBoards={[]}
          activeBoardId="default"
          onSwitchBoard={() => {}}
          onAddBoard={() => {}}
          onRemoveBoard={() => {}}
        />
        <div className="flex-1 overflow-hidden">
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </HashRouter>
        </div>
      </div>
    )
  }

  if (profile === null) {
    return (
      <Onboarding
        uid={user.uid}
        displayName={user.displayName ?? ''}
        onDone={() => void loadProfile(user)}
      />
    )
  }

  return <AppInner user={user} profile={profile} onProfileUpdate={() => void loadProfile(user)} />
}

function Loader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid #e8f5e8',
          borderTop: '3px solid #4a7a4a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default App
