import React, { useState } from 'react'
import { Send, Megaphone, X, Bell } from 'lucide-react'

const ForumCard = ({ tournament }) => {
  const [activeTab, setActiveTab] = useState('General')
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Alex_Pro',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Pro&background=random',
      message: 'When will the bracket be released?',
      timestamp: '2 hours ago',
      isMe: false,
    },
    {
      id: 2,
      author: 'You',
      avatar: 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff',
      message: 'Brackets will be released tomorrow at 10 AM',
      timestamp: '1 hour ago',
      isMe: true,
    },
    {
      id: 3,
      author: 'Raj Patel',
      avatar: 'https://ui-avatars.com/api/?name=Raj+Patel&background=random',
      message: 'Good luck to all teams!',
      timestamp: '30 minutes ago',
      isMe: false,
    },
  ])

  const [newMessage, setNewMessage] = useState('')
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Leaderboard Updated',
      description: 'The latest rankings have been updated. Team Alpha maintains the lead with 45 points.',
      timestamp: '45 minutes ago',
    },
    {
      id: 2,
      title: 'Tournament Starting Soon',
      description: 'The tournament will begin in 24 hours. Make sure all teams are ready!',
      timestamp: '2 hours ago',
    },
  ])

  // Announcement composer state
  const [showAnnouncementComposer, setShowAnnouncementComposer] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePostMessage = () => {
    if (newMessage.trim()) {
      const timeString = 'Just now'

      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          author: 'You',
          avatar: 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff',
          message: newMessage,
          timestamp: timeString,
          isMe: true,
        },
      ])
      setNewMessage('')
    }
  }

  const handleAnnouncementFormChange = (e) => {
    const { name, value } = e.target
    setAnnouncementForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePostAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.description.trim()) {
      alert('Please fill in Title and Description')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/chat/tournaments/${tournament.id}/announcements/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      //   body: JSON.stringify({
      //     message: announcementForm.description,
      //     message_type: 'announcement',
      //   }),
      // })

      const newAnnouncement = {
        id: announcements.length + 1,
        title: announcementForm.title,
        description: announcementForm.description,
        timestamp: 'Just now',
      }

      setAnnouncements([newAnnouncement, ...announcements])
      setAnnouncementForm({
        title: '',
        description: '',
      })
      setShowAnnouncementComposer(false)
    } catch (error) {
      console.error('Error posting announcement:', error)
      alert('Failed to post announcement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('General')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'General'
              ? 'bg-[#2563EB] text-white shadow-md'
              : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151]'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('Announcements')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'Announcements'
              ? 'bg-[#2563EB] text-white shadow-md'
              : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151]'
          }`}
        >
          Announcements
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1F2937] rounded-xl h-162.5 flex flex-col relative overflow-hidden shadow-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28 custom-scrollbar space-y-6">
          {activeTab === 'General' ? (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#374151] overflow-hidden flex items-center justify-center">
                    {msg.avatar && msg.avatar.startsWith('http') ? (
                      <img src={msg.avatar} alt={msg.author} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-[#9CA3AF]">{msg.avatar}</span>
                    )}
                  </div>
                </div>

                <div className={`flex flex-col max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1.5 px-1">
                    {msg.isMe ? (
                      <>
                        <span className="text-[11px] text-[#6B7280]">{msg.timestamp}</span>
                        <span className="text-sm text-[#E5E7EB] font-medium">You</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-[#E5E7EB] font-medium">{msg.author}</span>
                        <span className="text-[11px] text-[#6B7280]">{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.isMe
                        ? 'bg-[#2563EB] text-white rounded-tr-sm'
                        : 'bg-[#1F2937] text-[#E5E7EB] rounded-tl-sm border border-[#374151]'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm transition-all hover:border-opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {announcement.title}
                        </h4>

                        <p className="text-sm text-[#D1D5DB] leading-relaxed mb-2">
                          {announcement.description}
                        </p>

                        <span className="text-xs text-[#9CA3AF]">
                          {announcement.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Megaphone className="w-12 h-12 text-[#374151] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[#9CA3AF]">No announcements yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Areas */}
        {activeTab === 'General' && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-[#111827] rounded-xl p-2 pl-4 flex items-center gap-3 border border-[#374151] shadow-2xl">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostMessage()}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none py-3"
              />
              <button
                onClick={handlePostMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-lg transition-colors ${
                  newMessage.trim()
                    ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
                    : 'bg-[#1F2937] text-[#4B5563] cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-2 px-1 font-medium">
              Press Enter to send
            </div>
          </div>
        )}

        {/* Announcement Composer Button */}
        {activeTab === 'Announcements' && (
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={() => setShowAnnouncementComposer(!showAnnouncementComposer)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Megaphone className="w-4 h-4" />
              {showAnnouncementComposer ? 'Cancel' : 'Post Announcement'}
            </button>
          </div>
        )}
      </div>

      {/* Announcement Composer Modal */}
      {showAnnouncementComposer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#0F172A] to-[#0B1220] border border-[#1F2937] rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Post Announcement</h3>
              </div>
              <button
                onClick={() => setShowAnnouncementComposer(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors p-1 hover:bg-[#1F2937] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-xs font-semibold text-[#E5E7EB] mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={announcementForm.title}
                onChange={handleAnnouncementFormChange}
                placeholder="e.g., Leaderboard Updated"
                className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-md text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold text-[#E5E7EB] mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={announcementForm.description}
                onChange={handleAnnouncementFormChange}
                placeholder="Write your announcement here..."
                rows="4"
                className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-md text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAnnouncementComposer(false)}
                className="flex-1 px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-white text-sm rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostAnnouncement}
                disabled={isSubmitting}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-md font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForumCard
