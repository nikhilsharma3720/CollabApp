import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  email: null,
  isLoggedIn: false,
  teamId:null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.teamId=action.payload.teamId
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.email = null;
       state.teamId=null,
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
