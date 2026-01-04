import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});
