import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../axios/axiousinstance'

// Fetch admin dashboard stats
export const fetchAdminDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/accounts/admin/dashboard-stats/')
      return response.data.Result
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAdminError } = adminSlice.actions
export default adminSlice.reducer
