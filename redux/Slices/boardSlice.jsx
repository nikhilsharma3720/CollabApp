import { createSlice } from "@reduxjs/toolkit";

const boardsSlice = createSlice({
  name: "boards",
  initialState: [],
  reducers: {
    setBoards: (state, action) => action.payload,
    addBoard: (state, action) => { state.push(action.payload); },
    updateBoard: (state, action) => {
      const idx = state.findIndex(b => b._id === action.payload._id);
      if (idx !== -1) state[idx] = action.payload;
    },
  },
});

export const { setBoards, addBoard, updateBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
