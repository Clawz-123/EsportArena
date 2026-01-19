import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Thunk for creating tournament
export const createTournament = createAsyncThunk(
  "tournament/create",
  async (tournamentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/tournament/create/",
        tournamentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for fetching organizer's tournaments
export const fetchOrganizerTournaments = createAsyncThunk(
  "tournament/fetchOrganizer",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/tournament/list/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for fetching tournament detail by ID
export const fetchTournamentDetail = createAsyncThunk(
  "tournament/fetchDetail",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/tournament/detail/${tournamentId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for updating tournament
export const updateTournament = createAsyncThunk(
  "tournament/update",
  async ({ tournamentId, tournamentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/tournament/update/${tournamentId}/`,
        tournamentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for partially updating tournament
export const patchTournament = createAsyncThunk(
  "tournament/patch",
  async ({ tournamentId, tournamentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/tournament/update/${tournamentId}/`,
        tournamentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for deleting tournament
export const deleteTournament = createAsyncThunk(
  "tournament/delete",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/tournament/delete/${tournamentId}/`
      );
      return { tournamentId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state for tournament slice
const initialState = {
  tournaments: [],
  currentTournament: null,
  loading: false,
  error: null,
  success: false,
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

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.detailError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
    },
  },
  extraReducers: (builder) => {
    // Create Tournament
    builder.addCase(createTournament.pending, (state) => {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    });
    builder.addCase(createTournament.fulfilled, (state, action) => {
      state.createLoading = false;
      state.createSuccess = true;
      // Add new tournament to list if result contains tournament data
      if (action.payload.result?.tournament) {
        state.tournaments.unshift(action.payload.result.tournament);
      }
    });
    builder.addCase(createTournament.rejected, (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    });

    // Fetch Organizer Tournaments
    builder.addCase(fetchOrganizerTournaments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizerTournaments.fulfilled, (state, action) => {
      state.loading = false;
      state.tournaments = action.payload.result?.tournaments || [];
    });
    builder.addCase(fetchOrganizerTournaments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Tournament Detail
    builder.addCase(fetchTournamentDetail.pending, (state) => {
      state.detailLoading = true;
      state.detailError = null;
    });
    builder.addCase(fetchTournamentDetail.fulfilled, (state, action) => {
      state.detailLoading = false;
      state.currentTournament = action.payload.result?.tournament || null;
    });
    builder.addCase(fetchTournamentDetail.rejected, (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
    });

    // Update Tournament (PUT)
    builder.addCase(updateTournament.pending, (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateTournament.fulfilled, (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      // Update tournament in list
      const updatedTournament = action.payload.result?.tournament;
      if (updatedTournament) {
        const index = state.tournaments.findIndex(
          (t) => t.id === updatedTournament.id
        );
        if (index !== -1) {
          state.tournaments[index] = updatedTournament;
        }
        state.currentTournament = updatedTournament;
      }
    });
    builder.addCase(updateTournament.rejected, (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    });

    // Patch Tournament (PATCH)
    builder.addCase(patchTournament.pending, (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    });
    builder.addCase(patchTournament.fulfilled, (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      // Update tournament in list
      const updatedTournament = action.payload.result?.tournament;
      if (updatedTournament) {
        const index = state.tournaments.findIndex(
          (t) => t.id === updatedTournament.id
        );
        if (index !== -1) {
          state.tournaments[index] = updatedTournament;
        }
        state.currentTournament = updatedTournament;
      }
    });
    builder.addCase(patchTournament.rejected, (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    });

    // Delete Tournament
    builder.addCase(deleteTournament.pending, (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
      state.deleteSuccess = false;
    });
    builder.addCase(deleteTournament.fulfilled, (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = true;
      // Remove tournament from list
      state.tournaments = state.tournaments.filter(
        (t) => t.id !== action.payload.tournamentId
      );
      if (state.currentTournament?.id === action.payload.tournamentId) {
        state.currentTournament = null;
      }
    });
    builder.addCase(deleteTournament.rejected, (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    });
  },
});

export const { clearError, clearSuccess, clearCurrentTournament } =
  tournamentSlice.actions;
export default tournamentSlice.reducer;
