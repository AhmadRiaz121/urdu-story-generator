import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = 'https://urdu-trigram-api-production.up.railway.app'

function TextGenerator({ darkMode }) {
  const [prefix, setPrefix] = useState('')
  const [maxLength, setMaxLength] = useState(200)
  const [temperature, setTemperature] = useState(0.8)
  const [messages, setMessages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState(null)
  
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const streamIntervalRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const streamText = (fullText, messageId) => {
    const words = fullText.split(' ').filter(word => word && word !== 'undefined' && word !== 'null')
    let currentIndex = 0
    
    const aiMessage = {
      id: messageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, aiMessage])
    setStreamingMessageId(messageId)
    
    streamIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        const word = words[currentIndex]
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: msg.content + (currentIndex > 0 ? ' ' : '') + word }
            : msg
        ))
        currentIndex++
      } else {
        clearInterval(streamIntervalRef.current)
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false }
            : msg
        ))
        setStreamingMessageId(null)
      }
    }, 50)
  }

  const handleGenerate = async () => {
    if (isGenerating || streamingMessageId) return
    
    setError(null)
    setIsGenerating(true)
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prefix.trim() || 'کہانی سنائیں! 📖',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await axios.post(
        `${API_BASE}/generate`,
        {
          prefix: prefix.trim(),
          max_length: parseInt(maxLength),
          temperature: parseFloat(temperature)
        },
        {
          signal: abortControllerRef.current.signal
        }
      )
      
      const generatedTextData = response.data.generated_text
      
      if (generatedTextData && typeof generatedTextData === 'string') {
        const cleanText = String(generatedTextData).replace(/undefined/g, '').replace(/null/g, '').trim()
        
        if (cleanText) {
          const aiMessageId = Date.now() + 1
          streamText(cleanText, aiMessageId)
        } else {
          setError('اوہو! خالی جواب آیا 😅')
        }
      } else {
        setError('کچھ غلط ہو گیا! دوبارہ کوشش کریں 🔄')
      }
      
      setPrefix('')
      
    } catch (err) {
      if (err.name === 'CanceledError') {
        setError('کہانی بنانا روک دیا گیا 🛑')
      } else if (err.response) {
        setError(`اوہو! ${err.response.data.detail || err.message} 😵`)
      } else if (err.request) {
        setError('سرور سے بات نہیں ہو پا رہی 📡 دوبارہ کوشش کریں!')
      } else {
        setError(`خرابی: ${err.message} 😢`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setError(null)
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
    }
    setStreamingMessageId(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="chat-container kids-chat">
      <div className="chat-header kids-header">
        <div className="header-title">
          <span className="header-mascot">🧙‍♂️</span>
          <div>
            <h1>کہانی ساز جادوگر</h1>
            <span className="header-subtitle">آپ کی کہانی بنانے کو تیار!</span>
          </div>
          <span className="status-indicator kids-status">●</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn kids-icon-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            disabled={isGenerating || streamingMessageId !== null}
          >
            ⚙️
          </button>
          {messages.length > 0 && (
            <button 
              className="icon-btn kids-icon-btn"
              onClick={handleClearChat}
              title="Clear Chat"
              disabled={isGenerating || streamingMessageId !== null}
            >
              🧹
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel kids-settings">
          <div className="setting-item">
            <label>
              <span>📏 کہانی کی لمبائی</span>
              <span className="setting-value kids-value">{maxLength}</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              className="kids-range"
            />
          </div>
          <div className="setting-item">
            <label>
              <span>🎨 تخلیقی پن</span>
              <span className="setting-value kids-value">{temperature}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="kids-range"
            />
          </div>
        </div>
      )}

      <div className="messages-container kids-messages">
        {messages.length === 0 && !error && (
          <div className="empty-chat kids-empty">
            <div className="empty-icon">📖</div>
            <h2>کہانی سنانے کا وقت! 🎉</h2>
            <p>نیچے لکھیں یا ایک مثال چنیں</p>
            <div className="example-prompts kids-prompts">
              <button onClick={() => setPrefix('ایک دن جنگل میں')} disabled={isGenerating || streamingMessageId !== null}>
                🌳 ایک دن جنگل میں
              </button>
              <button onClick={() => setPrefix('ایک چھوٹا خرگوش')} disabled={isGenerating || streamingMessageId !== null}>
                🐰 ایک چھوٹا خرگوش
              </button>
              <button onClick={() => setPrefix('بہت پہلے')} disabled={isGenerating || streamingMessageId !== null}>
                ✨ بہت پہلے
              </button>
              <button onClick={() => setPrefix('ایک بار')} disabled={isGenerating || streamingMessageId !== null}>
                📚 ایک بار
              </button>
              <button onClick={() => setPrefix('ایک شہزادی')} disabled={isGenerating || streamingMessageId !== null}>
                👸 ایک شہزادی
              </button>
              <button onClick={() => setPrefix('چالاک لومڑی')} disabled={isGenerating || streamingMessageId !== null}>
                🦊 چالاک لومڑی
              </button>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`message kids-message ${message.type}`}>
            <div className="message-avatar kids-avatar">
              {message.type === 'user' ? '👦' : '🧙‍♂️'}
            </div>
            <div className="message-content kids-msg-content">
              <div className="message-text" dir="rtl">
                {message.content}
                {message.isStreaming && <span className="streaming-cursor kids-cursor">▊</span>}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="message kids-message ai">
            <div className="message-avatar kids-avatar">🧙‍♂️</div>
            <div className="message-content kids-msg-content">
              <div className="typing-indicator kids-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-label">جادو ہو رہا ہے... ✨</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message kids-error">
            <span>😅</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container kids-input-container">
        <div className="input-wrapper kids-input-wrapper">
          <textarea
            className="chat-input kids-chat-input"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="یہاں اپنی کہانی شروع کریں... 🌟"
            dir="rtl"
            rows="1"
            disabled={isGenerating || streamingMessageId !== null}
          />
          <button
            className="send-btn kids-send-btn"
            onClick={handleGenerate}
            disabled={isGenerating || streamingMessageId !== null}
          >
            {isGenerating ? '⏳' : '🪄'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextGenerator
