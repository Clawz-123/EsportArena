import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";
import profileReducer from "../slices/viewprofile";
import tournamentReducer from "../slices/tournamentSlice";
import contactReducer from "../slices/contactMessage";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    tournament: tournamentReducer,
    contact: contactReducer,
  },
  devTools: import.meta.env.DEV,
});
