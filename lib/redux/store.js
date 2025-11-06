import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";
import aiReducer from "./slices/aiSlice";
import propertiesReducer from "./slices/propertiesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    ai: aiReducer,
    properties: propertiesReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
