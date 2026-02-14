import React, { useState, useEffect, useMemo } from 'react'
import { MessageSquare, Send, Megaphone } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchMatchesByTournament } from '../../../slices/MatchSlice'

const ForumCard = ({ tournament }) => {
  const dispatch = useAppDispatch()
  const { matches, loading: matchesLoading } = useAppSelector((state) => state.match || {})
  const [activeTab, setActiveTab] = useState('General')
  const [messages, setMessages] = useState([
    
    {
      id: 1,
      author: 'Alex_Pro',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Pro&background=random',
      message: 'Anyone looking for a substitute player? Our fifth member can\'t make it tonight.',
      timestamp: '1 hour ago',
      isMe: false,
    },
    {
      id: 2,
      author: 'GamerGirl_99',
      avatar: 'https://ui-avatars.com/api/?name=Gamer+Girl&background=random',
      message: 'What\'s the format for the semifinals? Single elimination or best of 3?',
      timestamp: '45 minutes ago',
      isMe: false,
    },
    {
      id: 3,
      author: 'You',
      avatar: 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff',
      message: 'Thanks for the game everyone. Looking forward to the next round. Good luck to all teams!',
      timestamp: '30 minutes ago',
      isMe: true,
    },
    {
      id: 4,
      author: 'ShadowStrike',
      avatar: 'https://ui-avatars.com/api/?name=Shadow+Strike&background=random',
      message: 'When will the bracket be updated? Still waiting for our next opponent.',
      timestamp: '15 minutes ago',
      isMe: false,
    },
  ])

  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (tournament?.id) {
      dispatch(fetchMatchesByTournament(tournament.id))
    }
  }, [dispatch, tournament?.id])

  const formatTimestamp = (value) => {
    if (!value) return 'TBD'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'TBD'
    return date.toLocaleString()
  }

  const matchAnnouncements = useMemo(() => {
    return (matches || [])
      .filter((match) => match.announcement || match.room_id || match.room_pass)
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
      .map((match) => ({
        id: match.id,
        role: 'Organizer',
        timestamp: formatTimestamp(match.announcement_sent_at || match.date_time),
        message: {
          group: match.group,
          matchNumber: match.match_number,
          dateTime: formatTimestamp(match.date_time),
          map: match.map || 'TBD',
          mode: match.mode || 'TBD',
          roomId: match.room_id || 'TBD',
          roomPass: match.room_pass || 'TBD',
          announcement: match.announcement || '',
        },
      }))
  }, [matches])

  const handlePostMessage = () => {
    if (newMessage.trim()) {
      // Creating a timestamp for displaying new messages
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

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Separate Pills */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('General')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'General'
            ? 'bg-[#2563EB] text-white shadow-md'
            : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#374151]'
            }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('Announcements')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'Announcements'
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
            messages.map((msg) => {
              // Admin/System Message Style
              if (msg.role === 'admin') {
                return (
                  <div key={msg.id} className="bg-[#1F2937] border-l-4 border-[#2563EB] rounded-r-lg p-5 mb-8 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                        Admin
                      </span>
                      <span className="text-xs text-[#6B7280]">{msg.timestamp}</span>
                    </div>
                    <p className="text-[#E5E7EB] text-sm leading-relaxed font-medium">
                      {msg.message}
                    </p>
                  </div>
                )
              }

              // Standard Messages
              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                >
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
                      className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isMe
                          ? 'bg-[#2563EB] text-white rounded-tr-sm'
                          : 'bg-[#1F2937] text-[#E5E7EB] rounded-tl-sm border border-[#374151]'
                        }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="space-y-5">
              {matchesLoading ? (
                <div className="text-sm text-[#9CA3AF]">Loading announcements...</div>
              ) : matchAnnouncements.length > 0 ? (
                matchAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-[#2B3A6A] bg-[#0B1220] p-5 ]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-4 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest text-[#93C5FD] border border-[#2B3A6A]">
                        Announcement
                      </span>
                      <span className="text-xs text-[#6B7280]">{announcement.timestamp}</span>
                    </div>

                    <div className="mt-4 text-white">
                      <p className="text-lg font-semibold">
                        Group {announcement.message.group} • Match {announcement.message.matchNumber}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        {announcement.message.dateTime} • {announcement.message.mode} • {announcement.message.map}
                      </p>
                    </div>

                    {announcement.message.announcement && (
                      <p className="mt-4 text-sm text-[#E5E7EB] leading-relaxed">
                        {announcement.message.announcement}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg  px-3 py-2">
                        <p className="text-[11px] uppercase text-[#6B7280]">Room ID</p>
                        <p className="text-white font-medium">{announcement.message.roomId}</p>
                      </div>
                      <div className="rounded-lg  px-3 py-2">
                        <p className="text-[11px] uppercase text-[#6B7280]">Room Pass</p>
                        <p className="text-white font-medium">{announcement.message.roomPass}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#9CA3AF]">No announcements yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeTab === 'General' && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-[#111827] rounded-xl p-2 pl-4 flex items-center gap-3 border border-[#374151] shadow-2xl">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePostMessage()}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none py-3"
              />
              <button
                onClick={handlePostMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-lg transition-colors ${newMessage.trim()
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
      </div>
    </div>
  )
}

export default ForumCard
