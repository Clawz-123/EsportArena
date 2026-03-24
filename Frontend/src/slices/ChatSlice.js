import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { chatAPI } from '../axios/chatAPI'

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(tournamentId)
      const messages = response.data.Result || []
      return messages
    } catch (error) {
      return rejectWithValue(error.response?.data?.Error_Message || 'Failed to fetch messages')
    }
  }
)

export const fetchAnnouncements = createAsyncThunk(
  'chat/fetchAnnouncements',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getAnnouncements(tournamentId)
      return response.data.Result || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.Error_Message || 'Failed to fetch announcements')
    }
  }
)

export const postMessage = createAsyncThunk(
  'chat/postMessage',
  async ({ tournamentId, message }, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const response = await chatAPI.postMessage(tournamentId, message)
      const messageData = response.data.Result

      // Ensure message has sender info - if not provided by backend, use current user
      if (state.auth?.user) {
        if (!messageData.sender_name) {
          messageData.sender_name = state.auth.user.name || state.auth.user.email
        }
        if (!messageData.sender_id) {
          messageData.sender_id = state.auth.user.id
        }
        if (!messageData.sender_profile_image) {
          messageData.sender_profile_image = state.auth.user.profile_image || ''
        }
      }
      if (!messageData.sender_role) {
        messageData.sender_role = state.tournament?.currentTournament?.organizer_id === state.auth?.user?.id ? 'organizer' : 'player'
      }

      return messageData
    } catch (error) {
      return rejectWithValue(error.response?.data?.Error_Message || 'Failed to post message')
    }
  }
)

export const postAnnouncement = createAsyncThunk(
  'chat/postAnnouncement',
  async ({ tournamentId, message }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.postAnnouncement(tournamentId, message)
      return response.data.Result
    } catch (error) {
      return rejectWithValue(error.response?.data?.Error_Message || 'Failed to post announcement')
    }
  }
)

const initialState = {
  messages: [],
  announcements: [],
  loading: false,
  error: null,
  currentUserId: null,
  websocket: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload
    },
    addMessage: (state, action) => {
      const newMsg = action.payload
      const existingIndex = state.messages.findIndex((m) => m.id === newMsg.id)
      if (existingIndex === -1) {
        state.messages.push(newMsg)
      } else {
        // Merge: fill in any missing fields from the new data
        state.messages[existingIndex] = { ...state.messages[existingIndex], ...newMsg }
      }
    },
    addAnnouncement: (state, action) => {
      const newAnnouncement = action.payload
      const exists = state.announcements.some((a) => a.id === newAnnouncement.id)
      if (!exists) {
        state.announcements.unshift(newAnnouncement)
      }
    },
    clearMessages: (state) => {
      state.messages = []
      state.announcements = []
    },
  },
  extraReducers: (builder) => {
    // Fetch Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload
        state.error = null
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Announcements
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false
        state.announcements = action.payload
        state.error = null
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Post Message
    builder
      .addCase(postMessage.fulfilled, (state, action) => {
        const existingIndex = state.messages.findIndex((m) => m.id === action.payload.id)
        if (existingIndex === -1) {
          state.messages.push(action.payload)
        } else {
          // Merge enriched data (profile image, sender info) into existing message
          state.messages[existingIndex] = { ...state.messages[existingIndex], ...action.payload }
        }
        state.error = null
      })
      .addCase(postMessage.rejected, (state, action) => {
        state.error = action.payload
      })

    // Post Announcement
    builder
      .addCase(postAnnouncement.fulfilled, (state, action) => {
        const exists = state.announcements.some((a) => a.id === action.payload.id)
        if (!exists) {
          state.announcements.unshift(action.payload)
        }
        state.error = null
      })
      .addCase(postAnnouncement.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setCurrentUserId, addMessage, addAnnouncement, clearMessages } = chatSlice.actions
export default chatSlice.reducer
