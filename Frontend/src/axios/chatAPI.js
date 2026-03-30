import axiosInstance from './axiousinstance'

export const chatAPI = {
  getMessages: (tournamentId) => {
    return axiosInstance.get(`/chat/tournaments/${tournamentId}/messages/`)
  },

  postMessage: (tournamentId, message) => {
    return axiosInstance.post(`/chat/tournaments/${tournamentId}/messages/`, { message })
  },

  getAnnouncements: (tournamentId) => {
    return axiosInstance.get(`/chat/tournaments/${tournamentId}/announcements/`)
  },

  postAnnouncement: (tournamentId, message) => {
    return axiosInstance.post(`/chat/tournaments/${tournamentId}/announcements/`, { message })
  },

  connectWebSocket: (tournamentId, token) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//localhost:8000/ws/chat/tournaments/${tournamentId}/?token=${token}`
    return new WebSocket(wsUrl)
  },
}

export const formatBackendMessage = (backendMsg, currentUserId) => {
  if (!backendMsg) return null
  const formatted = {
    id: backendMsg.id,
    author: backendMsg.sender_name || 'Unknown User',
    avatar: backendMsg.sender_profile_image || `https://ui-avatars.com/api/?name=${backendMsg.sender_name}&background=random`,
    message: backendMsg.message,
    timestamp: formatRelativeTime(backendMsg.created_at),
    isMe: backendMsg.sender_id === currentUserId,
    role: backendMsg.sender_role || 'player',
  }
  return formatted
}

export const formatBackendAnnouncement = (backendMsg) => {
  if (!backendMsg) return null
  return {
    id: backendMsg.id,
    title: backendMsg.message.split('\n')[0].substring(0, 100),
    description: backendMsg.message,
    timestamp: formatRelativeTime(backendMsg.created_at),
  }
}

export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now'

  const date = new Date(isoString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}
