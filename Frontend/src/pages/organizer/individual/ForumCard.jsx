import React, { useState, useEffect, useRef } from 'react'
import { Send, Megaphone, X, Bell, Loader } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchMessages, fetchAnnouncements, postAnnouncement, addMessage, setCurrentUserId } from '../../../slices/ChatSlice'
import { chatAPI, formatBackendMessage, formatBackendAnnouncement } from '../../../axios/chatAPI'
import ChatInput from '../../../components/common/ChatInput'

const ForumCard = ({ tournament }) => {
  const dispatch = useAppDispatch()
  const { messages, announcements, loading } = useAppSelector((state) => state.chat)
  const { user } = useAppSelector((state) => state.auth || {})

  const [activeTab, setActiveTab] = useState('General')

  // Announcement composer state
  const [showAnnouncementComposer, setShowAnnouncementComposer] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize current user ID
  useEffect(() => {
    if (user?.id) {
      dispatch(setCurrentUserId(user.id))
    }
  }, [user, dispatch])

  // Fetch messages and announcements
  useEffect(() => {
    if (tournament?.id) {
      dispatch(fetchMessages(tournament.id))
      dispatch(fetchAnnouncements(tournament.id))
    }
  }, [dispatch, tournament?.id])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!tournament?.id || !user?.id) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const websocket = chatAPI.connectWebSocket(tournament.id, token)

      websocket.onopen = () => {
        console.log('WebSocket connected')
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.event === 'chat_message') {
            dispatch(addMessage(data.data))
          } else if (data.event === 'connected') {
            console.log('Connected to tournament chat')
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
      }

      return () => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.close()
        }
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [tournament?.id, user?.id, dispatch])

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
      const fullMessage = `${announcementForm.title}\n${announcementForm.description}`
      await dispatch(postAnnouncement({ tournamentId: tournament.id, message: fullMessage }))
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

  // Format messages for display
  const formattedMessages = messages.map((msg) => formatBackendMessage(msg, user?.id)).filter(Boolean)
  const formattedAnnouncements = announcements.map((ann) => formatBackendAnnouncement(ann)).filter(Boolean)

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

      <div className="bg-[#0B1220] border border-[#1F2937] rounded-xl h-162.5 flex flex-col overflow-hidden shadow-sm">
        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">
          {activeTab === 'General' ? (
            loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 text-[#2563EB] animate-spin" />
              </div>
            ) : formattedMessages.length > 0 ? (
              <>
                {formattedMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#374151] overflow-hidden flex items-center justify-center">
                        <img src={msg.avatar} alt={msg.author} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className={`flex flex-col max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1.5 px-1">
                        {msg.isMe ? (
                          <>
                            <span className="text-[11px] text-[#6B7280]">{msg.timestamp}</span>
                            <span className="text-sm text-[#E5E7EB] font-medium">You</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${msg.role === 'organizer' ? 'bg-orange-500/30 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {msg.role === 'organizer' ? 'Organizer' : 'Player'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-[#E5E7EB] font-medium">{msg.author}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${msg.role === 'organizer' ? 'bg-orange-500/30 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {msg.role === 'organizer' ? 'Organizer' : 'Player'}
                            </span>
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
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-[#374151] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-[#9CA3AF]">No messages yet</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 text-[#2563EB] animate-spin" />
                </div>
              ) : formattedAnnouncements.length > 0 ? (
                formattedAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm transition-all hover:border-opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
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

        {/* Input Areas - fixed at bottom inside flex column */}
        {activeTab === 'General' && (
          <div className="shrink-0 px-6 pb-5 pt-3 border-t border-[#1F2937] bg-[#0B1220]">
            <ChatInput
              endpoint={`/chat/tournaments/${tournament?.id}/messages/`}
              onMessageSent={(msg) => dispatch(addMessage(msg))}
              placeholder="Type a message..."
            />
          </div>
        )}

        {/* Announcement Composer Button */}
        {activeTab === 'Announcements' && (
          <div className="shrink-0 px-6 pb-5 pt-3 border-t border-[#1F2937] bg-[#0B1220]">
            <button
              onClick={() => setShowAnnouncementComposer(!showAnnouncementComposer)}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
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
          <div className="bg-linear-to-b from-[#0F172A] to-[#0B1220] border border-[#1F2937] rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
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
