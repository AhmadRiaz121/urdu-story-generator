import { useState, useEffect } from 'react'
import TextGenerator from './components/TextGenerator'
import LandingPage from './components/LandingPage'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (showChat) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
    return () => document.body.classList.remove('no-scroll')
  }, [showChat])

  if (!showChat) {
    return <LandingPage onEnterChat={() => setShowChat(true)} />
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="sidebar kids-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-mascot">📚</div>
          <h2>کہانی ساز</h2>
          <p>Story Generator</p>
        </div>
        <div className="sidebar-nav">
          <button className="nav-btn active" onClick={() => {}}>
            <span>🤖</span> کہانی بنائیں
          </button>
          <button className="nav-btn" onClick={() => setShowChat(false)}>
            <span>🏠</span> ہوم پیج
          </button>
        </div>
        <div className="sidebar-footer">
          <button 
            className="theme-toggle kids-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ دن کا وقت' : '🌙 رات کا وقت'}
          </button>
          <div className="sidebar-characters">
            <span>🦁</span><span>🐰</span><span>🦊</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        <TextGenerator darkMode={darkMode} />
      </div>
    </div>
  )
}

export default App
