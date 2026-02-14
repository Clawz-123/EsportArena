import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../axios/axiousinstance'

// Submit a match result (player)
export const createResult = createAsyncThunk(
	'result/create',
	async (resultData, { rejectWithValue }) => {
		try {
			const formData = new FormData()

			if (resultData.tournament) formData.append('tournament', resultData.tournament)
			if (resultData.match) formData.append('match', resultData.match)
			if (resultData.group_name) formData.append('group_name', resultData.group_name)
			if (resultData.total_kills !== undefined) {
				formData.append('total_kills', resultData.total_kills)
			}
			if (resultData.proof_image && resultData.proof_image instanceof File) {
				formData.append('proof_image', resultData.proof_image)
			}

			const response = await axiosInstance.post('/result/create/', formData, {
				headers: { 'Content-Type': undefined },
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message)
		}
	}
)

// Fetch results for a match (organizer sees all, player sees own)
export const fetchResultsByMatch = createAsyncThunk(
	'result/fetchByMatch',
	async (matchId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`/result/match/${matchId}/`)
			return response.data
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message)
		}
	}
)

// Update result status (organizer only)
export const updateResultStatus = createAsyncThunk(
	'result/updateStatus',
	async ({ resultId, status, organizer_note }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.put(`/result/update/${resultId}/`, {
				status,
				organizer_note,
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message)
		}
	}
)

const initialState = {
	results: [],
	loading: false,
	error: null,
	createLoading: false,
	createError: null,
	createSuccess: false,
	updateLoading: false,
	updateError: null,
	updateSuccess: false,
}

const resultSlice = createSlice({
	name: 'result',
	initialState,
	reducers: {
		clearResultError: (state) => {
			state.error = null
			state.createError = null
			state.updateError = null
		},
		clearResultSuccess: (state) => {
			state.createSuccess = false
			state.updateSuccess = false
		},
		clearResults: (state) => {
			state.results = []
		},
	},
	extraReducers: (builder) => {
		builder
			// Create result
			.addCase(createResult.pending, (state) => {
				state.createLoading = true
				state.createError = null
				state.createSuccess = false
			})
			.addCase(createResult.fulfilled, (state, action) => {
				state.createLoading = false
				state.createSuccess = true
				const result = action.payload.Result || action.payload.result
				if (result?.result) {
					state.results.unshift(result.result)
				}
			})
			.addCase(createResult.rejected, (state, action) => {
				state.createLoading = false
				state.createError = action.payload
			})

			// Fetch results by match
			.addCase(fetchResultsByMatch.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchResultsByMatch.fulfilled, (state, action) => {
				state.loading = false
				const result = action.payload.Result || action.payload.result
				state.results = result?.results || []
			})
			.addCase(fetchResultsByMatch.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload
			})

			// Update result status
			.addCase(updateResultStatus.pending, (state) => {
				state.updateLoading = true
				state.updateError = null
				state.updateSuccess = false
			})
			.addCase(updateResultStatus.fulfilled, (state, action) => {
				state.updateLoading = false
				state.updateSuccess = true
				const result = action.payload.Result || action.payload.result
				const updated = result?.result
				if (updated) {
					const index = state.results.findIndex((item) => item.id === updated.id)
					if (index !== -1) {
						state.results[index] = updated
					}
				}
			})
			.addCase(updateResultStatus.rejected, (state, action) => {
				state.updateLoading = false
				state.updateError = action.payload
			})
	},
})

export const { clearResultError, clearResultSuccess, clearResults } = resultSlice.actions
export default resultSlice.reducer
