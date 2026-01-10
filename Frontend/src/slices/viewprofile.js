import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios/axiousinstance';
import { logoutUser } from './auth';

// Thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/accounts/profile/');
      return response.data.Result || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();

      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.phone_number) formData.append('phone_number', profileData.phone_number);
      if (profileData.profile_image && profileData.profile_image instanceof File) {
        formData.append('profile_image', profileData.profile_image);
      }
      const response = await axiosInstance.patch('/accounts/profile/', formData, {
        headers: { 'Content-Type': undefined },
      });

      const payload = response.data.Result || response.data;
      try { await dispatch(fetchUserProfile()); } catch { /* noop */ }
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
  updateError: null,
  updateSuccess: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
      state.updateError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });

    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(updateUserProfile.pending, (state) => {
      state.updating = true;
      state.updateError = null;
      state.updateSuccess = false;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.updating = false;
      state.updateSuccess = true;
      state.profile = action.payload.profile || action.payload;
    });

    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.updating = false;
      state.updateError = action.payload;
    });

    // Reset profile state on logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.profile = null;
      state.loading = false;
      state.updating = false;
      state.error = null;
      state.updateError = null;
      state.updateSuccess = false;
    });
  },
});

export const { clearProfileError, clearUpdateSuccess, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;



