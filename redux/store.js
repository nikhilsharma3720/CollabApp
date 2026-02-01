import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from './Slices/boardSlice';
import userReducer from './Slices/userSlice'
import teamBoardResucer from './Slices/teamBoardSlice'
export const store = configureStore({
  reducer: { boards: boardsReducer,user:userReducer,teamBoard:teamBoardResucer },
});
