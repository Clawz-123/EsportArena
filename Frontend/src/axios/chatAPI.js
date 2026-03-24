import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

export const chatAPI = {
  getMessages: (tournamentId) => {
    return axios.get(`${API_BASE_URL}/chat/tournaments/${tournamentId}/messages/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
  },

  postMessage: (tournamentId, message) => {
    return axios.post(
      `${API_BASE_URL}/chat/tournaments/${tournamentId}/messages/`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    )
  },

  getAnnouncements: (tournamentId) => {
    return axios.get(`${API_BASE_URL}/chat/tournaments/${tournamentId}/announcements/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
  },

  postAnnouncement: (tournamentId, message) => {
    return axios.post(
      `${API_BASE_URL}/chat/tournaments/${tournamentId}/announcements/`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    )
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
