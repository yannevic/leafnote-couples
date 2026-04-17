import { useState } from 'react'
import Countdown from './pages/Countdown'

function App() {
  const [revealed, setRevealed] = useState(localStorage.getItem('app-revealed') === 'true')

  if (!revealed) {
    return <Countdown onReveal={() => setRevealed(true)} />
  }

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#F5ECD7' }}>
      <div className="text-center">
        <p className="text-4xl">🌸</p>
        <h1 className="text-2xl font-bold mt-4" style={{ color: '#2C1810' }}>
          leafnote
        </h1>
        <p className="mt-2" style={{ color: '#4A7A4A' }}>
          em breve...
        </p>
      </div>
    </div>
  )
}

export default App
