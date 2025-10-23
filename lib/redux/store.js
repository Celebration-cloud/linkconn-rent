import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore(
  {
    reducer: { user: userReducer, ui: uiReducer, ai: aiReducer },
  },
  (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
);


