import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth";
import profileReducer from "../slices/viewprofile";
import tournamentReducer from "../slices/tournamentSlice";
import tournamentHistoryReducer from "../slices/tournamentHistorySlice";
import contactReducer from "../slices/contactMessage";
import  bracketReducer  from "../slices/BracketSlice";
import matchReducer from "../slices/MatchSlice";
import leaderBoardReducer from "../slices/leaderBoardSlice";
import resultReducer from "../slices/resultSlice";
import walletSlice from "../slices/walletSlice";
import adminReducer from "../slices/adminSlice";
import notificationReducer from "../slices/notificationSlice";
import chatReducer from "../slices/ChatSlice";

export const store = configureStore({
  // Adding reducers for different created slices
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    tournament: tournamentReducer,
    tournamentHistory: tournamentHistoryReducer,
    contact: contactReducer,
    bracket: bracketReducer,
    match: matchReducer,
    leaderboard: leaderBoardReducer,
    result: resultReducer,
    wallet: walletSlice,
    admin: adminReducer,
    notifications: notificationReducer,
    chat: chatReducer,
  },
  // Enabling Redux DevTools only in development mode
  devTools: import.meta.env.DEV,
});
