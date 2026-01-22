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

// Thunk for fetching all public tournaments (for players)
export const fetchPublicTournaments = createAsyncThunk(
  "tournament/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/tournament/public/");
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
      console.log("Tournament API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Tournament API Error:", error.response?.data || error.message);
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

// Thunk for joining tournament
export const joinTournament = createAsyncThunk(
  "tournament/join",
  async (joinData, { rejectWithValue }) => {
    try {
      // If there's a team logo, use FormData for multipart upload
      if (joinData.teamLogo) {
        const formData = new FormData();
        formData.append("tournament_id", joinData.tournamentId);
        
        if (joinData.teamName) {
          formData.append("team_name", joinData.teamName);
        }
        
        formData.append("team_logo", joinData.teamLogo);
        
        if (joinData.teamMembers && joinData.teamMembers.length > 0) {
          joinData.teamMembers.forEach((memberId) => {
            formData.append("team_members", memberId);
          });
        }
        
        formData.append("in_game_names", JSON.stringify(joinData.inGameNames));

        const response = await axiosInstance.post(
          "/tournament/join/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } else {
        // No logo - send as JSON for better handling of nested data
        const payload = {
          tournament_id: joinData.tournamentId,
          team_name: joinData.teamName || '',
          team_members: joinData.teamMembers || [],
          in_game_names: joinData.inGameNames,
        };

        const response = await axiosInstance.post(
          "/tournament/join/",
          payload
        );
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for fetching tournament participants
export const fetchTournamentParticipants = createAsyncThunk(
  "tournament/fetchParticipants",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/tournament/participants/${tournamentId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for fetching tournament teams
export const fetchTournamentTeams = createAsyncThunk(
  "tournament/fetchTeams",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/tournament/teams/${tournamentId}/`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for fetching user's joined tournaments
export const fetchMyJoinedTournaments = createAsyncThunk(
  "tournament/fetchMyJoined",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/tournament/my-joined/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state for tournament slice
const initialState = {
  tournaments: [],
  joinedTournaments: [],
  currentTournament: null,
  participants: [],
  teams: [],
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
  joinLoading: false,
  joinError: null,
  joinSuccess: false,
  participantsLoading: false,
  participantsError: null,
  teamsLoading: false,
  teamsError: null,
  joinedLoading: false,
  joinedError: null,
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
      state.joinError = null;
      state.participantsError = null;
      state.teamsError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.joinSuccess = false;
    },
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
    },
    clearParticipants: (state) => {
      state.participants = [];
    },
    clearTeams: (state) => {
      state.teams = [];
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
      // Handle both Result and result keys
      const result = action.payload.Result || action.payload.result;
      // Add new tournament to list if result contains tournament data
      if (result?.tournament) {
        state.tournaments.unshift(result.tournament);
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
      // Handle both Result and result keys
      const result = action.payload.Result || action.payload.result;
      state.tournaments = result?.tournaments || [];
    });
    builder.addCase(fetchOrganizerTournaments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Public Tournaments
    builder.addCase(fetchPublicTournaments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPublicTournaments.fulfilled, (state, action) => {
      state.loading = false;
      const result = action.payload.Result || action.payload.result;
      state.tournaments = result?.tournaments || [];
    });
    builder.addCase(fetchPublicTournaments.rejected, (state, action) => {
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
      const result = action.payload.Result || action.payload.result;
      state.currentTournament = result?.tournament || null;
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
      const result = action.payload.Result || action.payload.result;
      const updatedTournament = result?.tournament;
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
      const result = action.payload.Result || action.payload.result;
      const updatedTournament = result?.tournament;
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

    // Join Tournament
    builder.addCase(joinTournament.pending, (state) => {
      state.joinLoading = true;
      state.joinError = null;
      state.joinSuccess = false;
    });
    builder.addCase(joinTournament.fulfilled, (state) => {
      state.joinLoading = false;
      state.joinSuccess = true;
    });
    builder.addCase(joinTournament.rejected, (state, action) => {
      state.joinLoading = false;
      state.joinError = action.payload;
    });

    // Fetch Tournament Participants
    builder.addCase(fetchTournamentParticipants.pending, (state) => {
      state.participantsLoading = true;
      state.participantsError = null;
    });
    builder.addCase(fetchTournamentParticipants.fulfilled, (state, action) => {
      state.participantsLoading = false;
      const result = action.payload.Result || action.payload.result;
      state.participants = result?.participants || [];
    });
    builder.addCase(fetchTournamentParticipants.rejected, (state, action) => {
      state.participantsLoading = false;
      state.participantsError = action.payload;
    });

    // Fetch Tournament Teams
    builder.addCase(fetchTournamentTeams.pending, (state) => {
      state.teamsLoading = true;
      state.teamsError = null;
    });
    builder.addCase(fetchTournamentTeams.fulfilled, (state, action) => {
      state.teamsLoading = false;
      const result = action.payload.Result || action.payload.result;
      state.teams = result?.teams || [];
    });
    builder.addCase(fetchTournamentTeams.rejected, (state, action) => {
      state.teamsLoading = false;
      state.teamsError = action.payload;
    });

    // Fetch My Joined Tournaments
    builder.addCase(fetchMyJoinedTournaments.pending, (state) => {
      state.joinedLoading = true;
      state.joinedError = null;
    });
    builder.addCase(fetchMyJoinedTournaments.fulfilled, (state, action) => {
      state.joinedLoading = false;
      const result = action.payload.Result || action.payload.result;
      state.joinedTournaments = result?.tournaments || [];
    });
    builder.addCase(fetchMyJoinedTournaments.rejected, (state, action) => {
      state.joinedLoading = false;
      state.joinedError = action.payload;
    });
  },
});

export const { clearError, clearSuccess, clearCurrentTournament, clearParticipants, clearTeams } =
  tournamentSlice.actions;
export default tournamentSlice.reducer;
