import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";
import profileReducer from "../slices/viewprofile";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
  },
  devTools: import.meta.env.DEV,
});
