import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Fetch bracket for a tournament
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

// Save (create/update) bracket for a tournament
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

const initialState = {
  bracket: null,
  loading: false,
  error: null,
  saveLoading: false,
  saveError: null,
};

const bracketSlice = createSlice({
  name: "bracket",
  initialState,
  reducers: {
    clearBracketError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    clearBracket: (state) => {
      state.bracket = null;
    },
  },
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
