import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase'
import Countdown from './pages/Countdown'
import Garden from './pages/Garden'
import Board from './pages/Board'
import Login from './pages/Login'

function App() {
  const [revealed, setRevealed] = useState(localStorage.getItem('app-revealed') === 'true')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  if (!revealed) {
    return <Countdown onReveal={() => setRevealed(true)} />
  }

  if (authLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#fdf6f0' }}
      >
        <span className="text-3xl animate-spin">🌸</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user !== null ? <Navigate to="/board" replace /> : <Login />}
        />
        <Route
          path="/board"
          element={user !== null ? <Board /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/garden"
          element={user !== null ? <Garden /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user !== null ? '/board' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
