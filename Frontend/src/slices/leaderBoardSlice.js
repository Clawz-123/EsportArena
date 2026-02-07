import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Create leaderboard entry
export const createLeaderboardEntry = createAsyncThunk(
	"leaderboard/create",
	async (entryData, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(
				"/leaderboard/create/",
				entryData
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Fetch leaderboard entries by tournament (optional bracket_id & group_name)
export const fetchLeaderboardEntries = createAsyncThunk(
	"leaderboard/fetchByTournament",
	async ({ tournamentId, bracketId, groupName } = {}, { rejectWithValue }) => {
		try {
			if (!tournamentId) {
				throw new Error("tournamentId is required");
			}
			const params = new URLSearchParams();
			if (bracketId) params.append("bracket_id", bracketId);
			if (groupName) params.append("group_name", groupName);
			const query = params.toString();
			const response = await axiosInstance.get(
				`/leaderboard/tournament/${tournamentId}/${query ? `?${query}` : ""}`
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Update leaderboard entry
export const updateLeaderboardEntry = createAsyncThunk(
	"leaderboard/update",
	async ({ entryId, entryData }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.put(
				`/leaderboard/update/${entryId}/`,
				entryData
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

// Delete leaderboard entry
export const deleteLeaderboardEntry = createAsyncThunk(
	"leaderboard/delete",
	async (entryId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.delete(
				`/leaderboard/delete/${entryId}/`
			);
			return { entryId, data: response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

const initialState = {
	entries: [],
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
};

const leaderBoardSlice = createSlice({
	name: "leaderboard",
	initialState,
	reducers: {
		clearLeaderBoardError: (state) => {
			state.error = null;
			state.createError = null;
			state.updateError = null;
			state.deleteError = null;
		},
		clearLeaderBoardSuccess: (state) => {
			state.createSuccess = false;
			state.updateSuccess = false;
			state.deleteSuccess = false;
		},
		clearLeaderBoardEntries: (state) => {
			state.entries = [];
		},
	},
	extraReducers: (builder) => {
		// Create entry
		builder.addCase(createLeaderboardEntry.pending, (state) => {
			state.createLoading = true;
			state.createError = null;
			state.createSuccess = false;
		});
		builder.addCase(createLeaderboardEntry.fulfilled, (state, action) => {
			state.createLoading = false;
			state.createSuccess = true;
			const result = action.payload.Result || action.payload.result;
			if (result?.entry) {
				state.entries.unshift(result.entry);
			}
		});
		builder.addCase(createLeaderboardEntry.rejected, (state, action) => {
			state.createLoading = false;
			state.createError = action.payload;
		});

		// Fetch entries
		builder.addCase(fetchLeaderboardEntries.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchLeaderboardEntries.fulfilled, (state, action) => {
			state.loading = false;
			const result = action.payload.Result || action.payload.result;
			state.entries = result?.entries || [];
		});
		builder.addCase(fetchLeaderboardEntries.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});

		// Update entry
		builder.addCase(updateLeaderboardEntry.pending, (state) => {
			state.updateLoading = true;
			state.updateError = null;
			state.updateSuccess = false;
		});
		builder.addCase(updateLeaderboardEntry.fulfilled, (state, action) => {
			state.updateLoading = false;
			state.updateSuccess = true;
			const result = action.payload.Result || action.payload.result;
			const updatedEntry = result?.entry;
			if (updatedEntry) {
				const index = state.entries.findIndex((e) => e.id === updatedEntry.id);
				if (index !== -1) {
					state.entries[index] = updatedEntry;
				}
			}
		});
		builder.addCase(updateLeaderboardEntry.rejected, (state, action) => {
			state.updateLoading = false;
			state.updateError = action.payload;
		});

		// Delete entry
		builder.addCase(deleteLeaderboardEntry.pending, (state) => {
			state.deleteLoading = true;
			state.deleteError = null;
			state.deleteSuccess = false;
		});
		builder.addCase(deleteLeaderboardEntry.fulfilled, (state, action) => {
			state.deleteLoading = false;
			state.deleteSuccess = true;
			const deletedId = action.payload?.entryId;
			if (deletedId) {
				state.entries = state.entries.filter((entry) => entry.id !== deletedId);
			}
		});
		builder.addCase(deleteLeaderboardEntry.rejected, (state, action) => {
			state.deleteLoading = false;
			state.deleteError = action.payload;
		});
	},
});

export const {
	clearLeaderBoardError,
	clearLeaderBoardSuccess,
	clearLeaderBoardEntries,
} = leaderBoardSlice.actions;

export default leaderBoardSlice.reducer;
