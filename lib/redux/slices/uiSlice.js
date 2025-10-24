// lib/redux/slices/uiSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "dark",
  isSidebarOpen: false,
  toast: null, // { type, message }
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar(state) {
      state.isSidebarOpen = true;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  showToast,
  clearToast,
} = uiSlice.actions;
export default uiSlice.reducer;
