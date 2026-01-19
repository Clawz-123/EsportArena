import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Thunk for creating contact message
export const createContactMessage = createAsyncThunk(
  "contact/create",
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/contact/create/",
        contactData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state for contact message slice
const initialState = {
  loading: false,
  error: null,
  success: false,
};

const contactMessageSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create Contact Message
    builder.addCase(createContactMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createContactMessage.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createContactMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearError, clearSuccess } = contactMessageSlice.actions;
export default contactMessageSlice.reducer;
