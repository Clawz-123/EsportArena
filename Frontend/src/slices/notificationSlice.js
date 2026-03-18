import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../axios/axiousinstance'
import { logoutUser } from './auth'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications/list/')
      return response.data.Result || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/notifications/read/${notificationId}/`)
      return response.data.Result || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.patch('/notifications/read-all/')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/delete/${notificationId}/`)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const sendTestNotification = createAsyncThunk(
  'notifications/sendTestNotification',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/notifications/test-send/', payload)
      return response.data.Result || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  socketConnected: false,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      const incoming = action.payload
      const exists = state.items.some((n) => n.id === incoming.id)

      if (!exists) {
        state.items.unshift(incoming)
        if (!incoming.is_read) {
          state.unreadCount += 1
        }
      }
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },
    clearNotificationState: (state) => {
      state.items = []
      state.unreadCount = 0
      state.loading = false
      state.error = null
      state.socketConnected = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.notifications || []
        state.unreadCount = action.payload.unread_count || 0
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload
        state.items = state.items.map((n) => (n.id === updated.id ? updated : n))
        state.unreadCount = state.items.filter((n) => !n.is_read).length
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, is_read: true }))
        state.unreadCount = 0
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload)
        state.unreadCount = state.items.filter((n) => !n.is_read).length
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.items = []
        state.unreadCount = 0
        state.loading = false
        state.error = null
        state.socketConnected = false
      })
  },
})

export const { addRealtimeNotification, setSocketConnected, clearNotificationState } =
  notificationSlice.actions

export default notificationSlice.reducer
