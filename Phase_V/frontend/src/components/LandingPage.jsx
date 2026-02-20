import { useState, useEffect } from 'react'

function LandingPage({ onEnterChat }) {
  const [showContent, setShowContent] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState([])

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300)
    
    // Generate floating emojis
    const emojis = ['⭐', '🌙', '🦋', '🌸', '✨', '🌈', '☁️', '🎈', '🌺', '💫', '🎀', '🍭']
    const generated = emojis.map((emoji, i) => ({
      id: i,
      emoji,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 1.2 + Math.random() * 1.5
    }))
    setFloatingEmojis(generated)
  }, [])

  return (
    <div className="landing-page">
      {/* Floating background emojis */}
      {floatingEmojis.map(item => (
        <div
          key={item.id}
          className="floating-emoji"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            fontSize: `${item.size}rem`
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Animated sky elements */}
      <div className="sky-elements">
        <div className="sun-container">
          <div className="sun">☀️</div>
        </div>
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">⛅</div>
        <div className="rainbow">🌈</div>
      </div>

      {/* Main content */}
      <div className={`landing-content ${showContent ? 'visible' : ''}`}>
        {/* Stars decoration */}
        <div className="stars-row">
          <span className="twinkle-star">⭐</span>
          <span className="twinkle-star delay-1">🌟</span>
          <span className="twinkle-star delay-2">✨</span>
          <span className="twinkle-star delay-3">⭐</span>
          <span className="twinkle-star delay-4">🌟</span>
        </div>

        {/* Moon mascot */}
        <div className="mascot">
          <span className="mascot-emoji">🌙</span>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          <span className="title-word color-1">کہانیوں</span>
          <span className="title-word color-2"> کی </span>
          <span className="title-word color-3">جادوئی</span>
          <span className="title-word color-4"> دنیا</span>
        </h1>

        {/* Subtitle */}
        <p className="landing-subtitle" dir="rtl">
          🎨 بچوں کے لیے اردو کہانیاں بنانے والا جادوگر 🧙‍♂️
        </p>

        {/* Description */}
        <div className="landing-description" dir="rtl">
          <p className="desc-line">
            <span className="desc-emoji">📖</span>
            <span className="color-text-1">یہاں آپ اپنی من پسند کہانی بنا سکتے ہیں!</span>
          </p>
          <p className="desc-line">
            <span className="desc-emoji">✏️</span>
            <span className="color-text-2">بس چند الفاظ لکھیں اور جادو دیکھیں!</span>
          </p>
          <p className="desc-line">
            <span className="desc-emoji">🤖</span>
            <span className="color-text-3">ہمارا AI آپ کے لیے مزیدار کہانی بنائے گا!</span>
          </p>
        </div>

        {/* Fun characters row */}
        <div className="characters-row">
          <span className="character bounce-1">🦁</span>
          <span className="character bounce-2">🐰</span>
          <span className="character bounce-3">🦊</span>
          <span className="character bounce-4">🐻</span>
          <span className="character bounce-5">🦜</span>
          <span className="character bounce-6">🐢</span>
        </div>

        {/* Enter button */}
        <button className="enter-btn" onClick={onEnterChat}>
          <span className="btn-emoji">🚀</span>
          <span className="btn-text" dir="rtl">کہانی بنانا شروع کریں!</span>
          <span className="btn-emoji">📚</span>
        </button>

        {/* Bottom decoration */}
        <div className="bottom-deco">
          <span>🌻</span>
          <span>🌷</span>
          <span>🌼</span>
          <span>🌻</span>
          <span>🌷</span>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
