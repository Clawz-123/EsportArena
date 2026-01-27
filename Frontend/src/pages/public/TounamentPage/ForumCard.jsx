import React, { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

const ForumCard = () => {
  const [messages, setMessages] = useState([
    { id: 1, author: 'Player One', avatar: 'PO', message: 'Looking forward to this tournament!', timestamp: '2 hours ago' },
    { id: 2, author: 'Team Lead', avatar: 'TL', message: 'What\'s the registration deadline?', timestamp: '1 hour ago' },
    { id: 3, author: 'Admin', avatar: 'AD', message: 'Registration closes on 12/17/2025', timestamp: '30 minutes ago' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handlePostMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          author: 'You',
          avatar: 'YO',
          message: newMessage,
          timestamp: 'now',
        },
      ])
      setNewMessage('')
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Tournament Discussion
      </h3>

      {/* Messages List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-white">{msg.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{msg.author}</span>
                <span className="text-xs text-[#6B7280]">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-[#9CA3AF] mt-1">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex gap-2 border-t border-[#1F2937] pt-4">
        <input
          type="text"
          placeholder="Share your thoughts..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handlePostMessage()}
          className="flex-1 bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#2563EB]"
        />
        <button
          onClick={handlePostMessage}
          className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ForumCard
