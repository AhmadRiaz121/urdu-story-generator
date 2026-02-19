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
    // Cleanup on unmount
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
    
    // Add initial empty AI message
    const aiMessage = {
      id: messageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, aiMessage])
    setStreamingMessageId(messageId)
    
    // Stream words one by one
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
        // Streaming complete
        clearInterval(streamIntervalRef.current)
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false }
            : msg
        ))
        setStreamingMessageId(null)
      }
    }, 50) // 50ms between words for smooth ChatGPT-like effect
  }

  const handleGenerate = async () => {
    if (isGenerating || streamingMessageId) return
    
    setError(null)
    setIsGenerating(true)
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prefix.trim() || 'متن بنائیں',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Create abort controller for cancellation
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
      
      // Clean and validate the received text
      const generatedTextData = response.data.generated_text
      
      if (generatedTextData && typeof generatedTextData === 'string') {
        const cleanText = String(generatedTextData).replace(/undefined/g, '').replace(/null/g, '').trim()
        
        if (cleanText) {
          // Stream the AI message word by word
          const aiMessageId = Date.now() + 1
          streamText(cleanText, aiMessageId)
        } else {
          setError('خرابی: خالی جواب موصول ہوا')
        }
      } else {
        setError('خرابی: سرور سے غلط جواب موصول ہوا')
      }
      
      // Clear input after successful generation
      setPrefix('')
      
    } catch (err) {
      if (err.name === 'CanceledError') {
        setError('تخلیق منسوخ کر دی گئی')
      } else if (err.response) {
        setError(`خرابی: ${err.response.data.detail || err.message}`)
      } else if (err.request) {
        setError('سرور سے رابطہ نہیں ہو سکا۔ براہ کرم یقینی بنائیں کہ API چل رہا ہے۔')
      } else {
        setError(`خرابی: ${err.message}`)
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
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-title">
          <h1>Urdu Text Generator</h1>
          <span className="status-indicator">●</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            disabled={isGenerating || streamingMessageId !== null}
          >
            ⚙️
          </button>
          {messages.length > 0 && (
            <button 
              className="icon-btn"
              onClick={handleClearChat}
              title="Clear Chat"
              disabled={isGenerating || streamingMessageId !== null}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>
              <span>Maximum Length</span>
              <span className="setting-value">{maxLength}</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>
              <span>Temperature</span>
              <span className="setting-value">{temperature}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && !error && (
          <div className="empty-chat">
            <div className="empty-icon">🌙</div>
            <h2>اردو متن جنریٹر</h2>
            <p>AI-powered Urdu text generation using Trigram Model</p>
            <div className="example-prompts">
              <button onClick={() => setPrefix('ایک دن')} disabled={isGenerating || streamingMessageId !== null}>ایک دن</button>
              <button onClick={() => setPrefix('بہت پہلے')} disabled={isGenerating || streamingMessageId !== null}>بہت پہلے</button>
              <button onClick={() => setPrefix('ایک بار')} disabled={isGenerating || streamingMessageId !== null}>ایک بار</button>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text" dir="rtl">
                {message.content}
                {message.isStreaming && <span className="streaming-cursor">▊</span>}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اردو میں لکھیں یا خالی چھوڑیں... (Enter to send)"
            dir="rtl"
            rows="1"
            disabled={isGenerating || streamingMessageId !== null}
          />
          <button
            className="send-btn"
            onClick={handleGenerate}
            disabled={isGenerating || streamingMessageId !== null}
          >
            {isGenerating ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextGenerator
