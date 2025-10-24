// lib/redux/slices/userSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current: null, // { id, name, email, role, ... }
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.current = action.payload;
      state.loading = false;
    },
    clearUser(state) {
      state.current = null;
      state.loading = false;
    },
    setUserLoading(state, action) {
      state.loading = action.payload ?? true;
    },
  },
});

export const { setUser, clearUser, setUserLoading } = userSlice.actions;
export default userSlice.reducer;
