import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Creating a thunk for fetching bracket data for a specific tournament
export const fetchTournamentBracket = createAsyncThunk(
  "bracket/fetchBracket",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/tournamentbaracket/bracket/${tournamentId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Creating a thunk for saving (create/update) bracket data for a tournament
export const saveTournamentBracket = createAsyncThunk(
  "bracket/saveBracket",
  async ({ tournamentId, bracket_data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/tournamentbaracket/bracket/${tournamentId}/`,
        { bracket_data }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Setting up the initial state for the bracket slice
const initialState = {
  bracket: null,
  loading: false,
  error: null,
  saveLoading: false,
  saveError: null,
};

// Creating the bracket slice with reducers and extra reducers for bracket actions
const bracketSlice = createSlice({
  name: "bracket",
  initialState,
  reducers: {
    // Clearing bracket-related errors
    clearBracketError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    // Clearing bracket data from state
    clearBracket: (state) => {
      state.bracket = null;
    },
  },
  // Handling pending, fulfilled, and rejected states for bracket thunks
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournamentBracket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentBracket.fulfilled, (state, action) => {
        state.loading = false;
        state.bracket = action.payload;
      })
      .addCase(fetchTournamentBracket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveTournamentBracket.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(saveTournamentBracket.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.bracket = action.payload;
      })
      .addCase(saveTournamentBracket.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      });
  },
});

export const { clearBracketError, clearBracket } = bracketSlice.actions;
export default bracketSlice.reducer;
