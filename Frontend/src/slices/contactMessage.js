import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

// Creating a thunk for sending a contact message to the backend
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

// Setting up the initial state for contact message slice
const initialState = {
  loading: false,
  error: null,
  success: false,
};

// Creating the contact message slice with reducers and extra reducers
const contactMessageSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // Clearing contact message errors
    clearError: (state) => {
      state.error = null;
    },
    // Clearing contact message success state
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  // Handling pending, fulfilled, and rejected states for contact message thunk
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
