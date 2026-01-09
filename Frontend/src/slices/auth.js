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

      // Backend wraps response in Result object
      const result = response.data.Result || response.data;
      
      if (result.access) {
        localStorage.setItem("access_token", result.access);
        localStorage.setItem("refresh_token", result.refresh);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/verify-otp/",
        otpData
      );
      localStorage.removeItem("registeredData");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/resend-otp/",
        emailData
      );
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
      const refresh = localStorage.getItem("refresh_token");
      await axiosInstance.post("/accounts/logout/", { refresh });
      localStorage.clear();
      return true;
    } catch (error) {
      localStorage.clear();
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/reset-password/",
        passwordData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
    otpLoading: false,
    otpError: null,
    otpSuccess: false,
    resendLoading: false,
    resendError: null,
    resendSuccess: false,
    resetLoading: false,
    resetError: null,
    resetSuccess: false,
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
    clearOtpState: (state) => {
      state.otpLoading = false;
      state.otpError = null;
      state.otpSuccess = false;
      state.resendLoading = false;
      state.resendError = null;
      state.resendSuccess = false;
      state.resetLoading = false;
      state.resetError = null;
      state.resetSuccess = false;
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

    builder.addCase(verifyOtp.pending, (state) => {
      state.otpLoading = true;
      state.otpError = null;
      state.otpSuccess = false;
    });

    builder.addCase(verifyOtp.fulfilled, (state) => {
      state.otpLoading = false;
      state.otpSuccess = true;
    });

    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.otpLoading = false;
      state.otpError = action.payload;
    });

    builder.addCase(resendOtp.pending, (state) => {
      state.resendLoading = true;
      state.resendError = null;
      state.resendSuccess = false;
    });

    builder.addCase(resendOtp.fulfilled, (state) => {
      state.resendLoading = false;
      state.resendSuccess = true;
    });

    builder.addCase(resendOtp.rejected, (state, action) => {
      state.resendLoading = false;
      state.resendError = action.payload;
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });

    builder.addCase(resetPassword.pending, (state) => {
      state.resetLoading = true;
      state.resetError = null;
      state.resetSuccess = false;
    });

    builder.addCase(resetPassword.fulfilled, (state) => {
      state.resetLoading = false;
      state.resetSuccess = true;
    });

    builder.addCase(resetPassword.rejected, (state, action) => {
      state.resetLoading = false;
      state.resetError = action.payload;
    });
  },
});

export const { clearError, clearSuccess, setUser, clearOtpState } = authSlice.actions;
export default authSlice.reducer;
