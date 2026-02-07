import React, { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

const ForumCard = () => {
  const [newMessage, setNewMessage] = useState('')

  // Mock forum messages
  const messages = [
    { id: 1, user: 'Alex Kumar', message: 'When will the bracket be released?', time: '2 hours ago' },
    { id: 2, user: 'Tournament Admin', message: 'Brackets will be released tomorrow at 10 AM', time: '1 hour ago' },
    { id: 3, user: 'Raj Patel', message: 'Good luck to all teams!', time: '30 minutes ago' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Tournament Forum</h2>
        <p className="text-[#9CA3AF] text-sm mb-4">
          Discussion and announcements
        </p>

        {/* Messages */}
        <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] p-6 mb-4 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="border-b border-[#2D3748] last:border-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-semibold">
                  {msg.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{msg.user}</span>
                    <span className="text-xs text-[#6B7280]">{msg.time}</span>
                  </div>
                  <p className="text-sm text-[#9CA3AF]">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post Message */}
        <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Post a message or announcement..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#0F172A] border border-[#2D3748] rounded-md text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
            />
            <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForumCard
