import { useState, useEffect, useRef } from 'react'
import { getSocket } from '../../socket/socket'

export default function ChatPanel({ roomId, userId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    const socket = getSocket()
    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    socket.on('chat:typing', () => {
      setTyping(true)
      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setTyping(false), 1500)
    })
    return () => {
      socket.off('chat:message')
      socket.off('chat:typing')
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    getSocket().emit('chat:message', { roomId, text })
    setText('')
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    getSocket().emit('chat:typing', { roomId })
  }

  const isMe = (msg) => msg.senderId === userId

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-2">
            <span className="material-symbols-outlined text-outline text-[36px]">chat</span>
            <p className="text-xs text-on-surface-variant">No messages yet</p>
            <p className="text-xs text-outline">Chat is visible to everyone in the session</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] leading-snug
              ${isMe(msg)
                ? 'bg-primary text-on-primary rounded-br-sm'
                : 'bg-surface-container-high text-on-surface border border-outline-variant rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-surface-container-high border border-outline-variant px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant p-3 flex gap-2 shrink-0">
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          className="flex-1 bg-surface-container-high text-on-surface text-sm px-3 py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary px-3 py-2 rounded-xl text-sm transition-colors disabled:opacity-40 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>
    </div>
  )
}
