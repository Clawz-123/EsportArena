import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";
import profileReducer from "../slices/viewprofile";
import tournamentReducer from "../slices/tournamentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    tournament: tournamentReducer,
  },
  devTools: import.meta.env.DEV,
});
