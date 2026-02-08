import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Creating a thunk for creating a match
export const createMatch = createAsyncThunk(
	"match/create",
	async (matchData, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("/match/create/", matchData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Creating a thunk for fetching matches by tournament
export const fetchMatchesByTournament = createAsyncThunk(
	"match/fetchByTournament",
	async (tournamentId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(
				`/match/tournament/${tournamentId}/`
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Creating a thunk for fetching match detail by match id
export const fetchMatchDetail = createAsyncThunk(
	"match/fetchDetail",
	async (matchId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`/match/detail/${matchId}/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Creating a thunk for updating a match
export const updateMatch = createAsyncThunk(
	"match/update",
	async ({ matchId, matchData }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.put(
				`/match/update/${matchId}/`,
				matchData
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Creating a thunk for deleting a match
export const deleteMatch = createAsyncThunk(
	"match/delete",
	async (matchId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.delete(`/match/delete/${matchId}/`);
			return { matchId, data: response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Setting up the initial state for match slice
const initialState = {
	matches: [],
	currentMatch: null,
	loading: false,
	error: null,
	createLoading: false,
	createError: null,
	createSuccess: false,
	updateLoading: false,
	updateError: null,
	updateSuccess: false,
	deleteLoading: false,
	deleteError: null,
	deleteSuccess: false,
	detailLoading: false,
	detailError: null,
};

// Creating the match slice with reducers and extra reducers
const matchSlice = createSlice({
	name: "match",
	initialState,
	reducers: {
		// Clearing match-related errors
		clearMatchError: (state) => {
			state.error = null;
			state.createError = null;
			state.updateError = null;
			state.deleteError = null;
			state.detailError = null;
		},
		// Clearing match success flags
		clearMatchSuccess: (state) => {
			state.createSuccess = false;
			state.updateSuccess = false;
			state.deleteSuccess = false;
		},
		// Clearing the current match from state
		clearCurrentMatch: (state) => {
			state.currentMatch = null;
		},
		// Clearing the matches list from state
		clearMatches: (state) => {
			state.matches = [];
		},
	},
	// Handling pending, fulfilled, and rejected states for match thunks
	extraReducers: (builder) => {
		// Create match
		builder.addCase(createMatch.pending, (state) => {
			state.createLoading = true;
			state.createError = null;
			state.createSuccess = false;
		});
		builder.addCase(createMatch.fulfilled, (state, action) => {
			state.createLoading = false;
			state.createSuccess = true;
			const result = action.payload.Result || action.payload.result;
			if (result?.match) {
				state.matches.unshift(result.match);
				state.currentMatch = result.match;
			}
		});
		builder.addCase(createMatch.rejected, (state, action) => {
			state.createLoading = false;
			state.createError = action.payload;
		});

		// Fetch matches by tournament
		builder.addCase(fetchMatchesByTournament.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchMatchesByTournament.fulfilled, (state, action) => {
			state.loading = false;
			const result = action.payload.Result || action.payload.result;
			state.matches = Array.isArray(result) ? result : result?.matches || [];
		});
		builder.addCase(fetchMatchesByTournament.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});

		// Fetch match detail
		builder.addCase(fetchMatchDetail.pending, (state) => {
			state.detailLoading = true;
			state.detailError = null;
		});
		builder.addCase(fetchMatchDetail.fulfilled, (state, action) => {
			state.detailLoading = false;
			const result = action.payload.Result || action.payload.result;
			state.currentMatch = result?.match || result || null;
		});
		builder.addCase(fetchMatchDetail.rejected, (state, action) => {
			state.detailLoading = false;
			state.detailError = action.payload;
		});

		// Update match
		builder.addCase(updateMatch.pending, (state) => {
			state.updateLoading = true;
			state.updateError = null;
			state.updateSuccess = false;
		});
		builder.addCase(updateMatch.fulfilled, (state, action) => {
			state.updateLoading = false;
			state.updateSuccess = true;
			const result = action.payload.Result || action.payload.result;
			const updatedMatch = result?.match || null;
			if (updatedMatch) {
				const index = state.matches.findIndex((m) => m.id === updatedMatch.id);
				if (index !== -1) {
					state.matches[index] = updatedMatch;
				}
				state.currentMatch = updatedMatch;
			}
		});
		builder.addCase(updateMatch.rejected, (state, action) => {
			state.updateLoading = false;
			state.updateError = action.payload;
		});

		// Delete match
		builder.addCase(deleteMatch.pending, (state) => {
			state.deleteLoading = true;
			state.deleteError = null;
			state.deleteSuccess = false;
		});
		builder.addCase(deleteMatch.fulfilled, (state, action) => {
			state.deleteLoading = false;
			state.deleteSuccess = true;
			const deletedId = action.payload?.matchId;
			if (deletedId) {
				state.matches = state.matches.filter((m) => m.id !== deletedId);
			}
			if (state.currentMatch?.id === deletedId) {
				state.currentMatch = null;
			}
		});
		builder.addCase(deleteMatch.rejected, (state, action) => {
			state.deleteLoading = false;
			state.deleteError = action.payload;
		});
	},
});

export const {
	clearMatchError,
	clearMatchSuccess,
	clearCurrentMatch,
	clearMatches,
} = matchSlice.actions;

export default matchSlice.reducer;
