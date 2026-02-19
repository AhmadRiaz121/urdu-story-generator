import { useState } from 'react'
import TextGenerator from './components/TextGenerator'

function App() {
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>اردو AI</h2>
          <p>Urdu Text Generator</p>
        </div>
        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
      <div className="main-content">
        <TextGenerator darkMode={darkMode} />
      </div>
    </div>
  )
}

export default App
