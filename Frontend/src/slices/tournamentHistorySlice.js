import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../axios/axiousinstance"

const getSuccessFlag = (payload) => {
  if (!payload || typeof payload !== "object") return false
  if (typeof payload.Is_Success === "boolean") return payload.Is_Success
  if (typeof payload.is_success === "boolean") return payload.is_success
  return false
}

const getResultPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null
  return payload.Result ?? payload.result ?? null
}

const getErrorMessage = (payload, fallback) => {
  if (!payload || typeof payload !== "object") return fallback
  return payload.Error_Message || payload.error_message || fallback
}

// Fetch player tournament history
export const fetchPlayerTournamentHistory = createAsyncThunk(
  "tournamentHistory/fetchPlayerHistory",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.gameType) params.append("game_type", filters.gameType)
      if (filters.month) params.append("month", filters.month)
      if (filters.year) params.append("year", filters.year)

      const response = await axiosInstance.get(
        `/tournament/player-history/?${params.toString()}`
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Fetch organizer tournament history
export const fetchOrganizerTournamentHistory = createAsyncThunk(
  "tournamentHistory/fetchOrganizerHistory",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.gameType) params.append("game_type", filters.gameType)
      if (filters.month) params.append("month", filters.month)
      if (filters.year) params.append("year", filters.year)

      const response = await axiosInstance.get(
        `/tournament/organizer-history/?${params.toString()}`
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  // Player history
  playerHistory: {
    data: [],
    count: 0,
    completed: 0,
    ongoing: 0,
    registered: 0,
    loading: false,
    error: null,
  },

  // Organizer history
  organizerHistory: {
    data: [],
    count: 0,
    completed: 0,
    ongoing: 0,
    registered: 0,
    totalRevenue: 0,
    totalParticipants: 0,
    loading: false,
    error: null,
  },

  // Filters
  filters: {
    status: "all",
    gameType: null,
    month: null,
    year: new Date().getFullYear(),
  },
}

const tournamentHistorySlice = createSlice({
  name: "tournamentHistory",
  initialState,

  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        gameType: null,
        month: null,
        year: new Date().getFullYear(),
      }
    },
    clearPlayerHistory: (state) => {
      state.playerHistory = initialState.playerHistory
    },
    clearOrganizerHistory: (state) => {
      state.organizerHistory = initialState.organizerHistory
    },
  },

  extraReducers: (builder) => {
    // Player history
    builder
      .addCase(fetchPlayerTournamentHistory.pending, (state) => {
        state.playerHistory.loading = true
        state.playerHistory.error = null
      })
      .addCase(fetchPlayerTournamentHistory.fulfilled, (state, action) => {
        state.playerHistory.loading = false
        const isSuccess = getSuccessFlag(action.payload)
        const result = getResultPayload(action.payload)

        if (isSuccess && result) {
          state.playerHistory.data = result.tournaments || []
          state.playerHistory.count = result.count || 0
          state.playerHistory.completed = result.completed || 0
          state.playerHistory.ongoing = result.ongoing || 0
          state.playerHistory.registered = result.registered || 0
        } else {
          state.playerHistory.error = getErrorMessage(action.payload, "Failed to fetch player history")
        }
      })
      .addCase(fetchPlayerTournamentHistory.rejected, (state, action) => {
        state.playerHistory.loading = false
        state.playerHistory.error = getErrorMessage(action.payload, "Failed to fetch player history")
      })

    // Organizer history
    builder
      .addCase(fetchOrganizerTournamentHistory.pending, (state) => {
        state.organizerHistory.loading = true
        state.organizerHistory.error = null
      })
      .addCase(fetchOrganizerTournamentHistory.fulfilled, (state, action) => {
        state.organizerHistory.loading = false
        const isSuccess = getSuccessFlag(action.payload)
        const result = getResultPayload(action.payload)

        if (isSuccess && result) {
          state.organizerHistory.data = result.tournaments || []
          state.organizerHistory.count = result.count || 0
          state.organizerHistory.completed = result.completed || 0
          state.organizerHistory.ongoing = result.ongoing || 0
          state.organizerHistory.registered = result.registered || 0
          state.organizerHistory.totalRevenue = result.total_revenue || 0
          state.organizerHistory.totalParticipants = result.total_participants || 0
        } else {
          state.organizerHistory.error = getErrorMessage(action.payload, "Failed to fetch organizer history")
        }
      })
      .addCase(fetchOrganizerTournamentHistory.rejected, (state, action) => {
        state.organizerHistory.loading = false
        state.organizerHistory.error = getErrorMessage(action.payload, "Failed to fetch organizer history")
      })
  },
})

export const {
  setFilters,
  clearFilters,
  clearPlayerHistory,
  clearOrganizerHistory,
} = tournamentHistorySlice.actions

export default tournamentHistorySlice.reducer
