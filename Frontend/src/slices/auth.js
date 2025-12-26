import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Making registration API call with:", userData);

      const response = await axiosInstance.post(
        "/accounts/register/",
        userData
      );

      console.log("Registration API response:", response.data);

      localStorage.setItem(
        "registeredData",
        JSON.stringify({
          email: userData.email,
          name: userData.name,
          userType: userData.is_organizer ? "organizer" : "player",
        })
      );

      return response.data;
    } catch (error) {
      console.error(
        "Registration API error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/login/",
        credentials
      );

      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/accounts/logout/");
      localStorage.clear();
      return true;
    } catch (error) {
      localStorage.clear();
      return rejectWithValue(error.message);
    }
  }
);

const getInitialState = () => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
    success: false,
    registerLoading: false,
    registerError: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.registerError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.registerLoading = true;
      state.registerError = null;
    });

    builder.addCase(registerUser.fulfilled, (state) => {
      state.registerLoading = false;
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerLoading = false;
      state.registerError = action.payload;
    });

    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.access;
      state.isAuthenticated = true;
      state.success = true;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, clearSuccess, setUser } = authSlice.actions;
export default authSlice.reducer;
