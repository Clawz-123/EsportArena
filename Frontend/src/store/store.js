import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";
import profileReducer from "../slices/viewprofile";
import tournamentReducer from "../slices/tournamentSlice";
import contactReducer from "../slices/contactMessage";
import  bracketReducer  from "../slices/BracketSlice";
import matchReducer from "../slices/MatchSlice";
import leaderBoardReducer from "../slices/leaderBoardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    tournament: tournamentReducer,
    contact: contactReducer,
    bracket: bracketReducer,
    match: matchReducer,
    leaderboard: leaderBoardReducer,
  },
  devTools: import.meta.env.DEV,
});
