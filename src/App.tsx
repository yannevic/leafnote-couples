import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase'
import Board from './pages/Board'
import Login from './pages/Login'
import TitleBar from './components/TitleBar'
import { useBoards } from './hooks/useBoards'

function AppInner({ user }: { user: User }) {
  const { extraBoards, activeBoardId, setActiveBoardId, addBoard, removeBoard } = useBoards(
    user.uid
  )

  return (
    <div className="fixed inset-0 flex flex-col">
      <TitleBar
        extraBoards={extraBoards}
        activeBoardId={activeBoardId}
        onSwitchBoard={setActiveBoardId}
        onAddBoard={addBoard}
        onRemoveBoard={removeBoard}
      />
      <div className="flex-1 overflow-hidden">
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/board" replace />} />
            <Route path="/board" element={<Board activeBoardId={activeBoardId} />} />
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
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
          <span className="text-3xl animate-spin">🌸</span>
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

  return <AppInner user={user} />
}

export default App
