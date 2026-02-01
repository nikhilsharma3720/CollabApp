// store/boardSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentTeam: null, // will store {_id, name, members}
  boards: [],        // all boards of this team
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    // Save team info and boards after joining or creating a team
    setTeamAndBoards: (state, action) => {
      state.currentTeam = action.payload.team;   // team object: {_id, name, members}
      state.boards = action.payload.boards;      // array of board objects
    },

    // Clear all board and team data (e.g., on logout)
    clearBoardData: (state) => {
      state.currentTeam = null;
      state.boards = [];
    },

    // Optional: add a new board to the current list
    addBoard: (state, action) => {
      state.boards.push(action.payload); // payload is a single board object
    },

    // Optional: remove a board from the current list
    removeBoard: (state, action) => {
      const boardId = action.payload; // payload is the board _id
      state.boards = state.boards.filter((b) => b._id !== boardId);
    },
  },
});

export const { setTeamAndBoards, clearBoardData, addBoard, removeBoard } = boardSlice.actions;
export default boardSlice.reducer;
