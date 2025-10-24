// lib/redux/slices/aiSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { aiChat, generateImage, imageToText } from "@/lib/puterClient";

// Async thunks using the puterClient wrappers
export const fetchAIResponse = createAsyncThunk(
  "ai/fetchResponse",
  async ({ messages }, thunkAPI) => {
    // messages: array of { role, content } or plain prompt string
    const prompt = messages;
    const res = await aiChat({ messages: prompt });
    return res; // expected { output, ... }
  }
);

export const fetchGeneratedImage = createAsyncThunk(
  "ai/fetchGeneratedImage",
  async ({ prompt }, thunkAPI) => {
    const image = await generateImage({ prompt });
    return image; // { url, meta? }
  }
);

export const fetchImageToText = createAsyncThunk(
  "ai/fetchImageToText",
  async ({ imageUrl }, thunkAPI) => {
    const text = await imageToText({ imageUrl });
    return text; // { captions, text }
  }
);

const initialState = {
  chat: [], // { role, content }
  lastResponse: null,
  generating: false,
  images: [], // urls
  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    addUserMessage(state, action) {
      state.chat.push({ role: "user", content: action.payload });
    },
    addAssistantMessage(state, action) {
      state.chat.push({ role: "assistant", content: action.payload });
    },
    clearChat(state) {
      state.chat = [];
      state.lastResponse = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIResponse.pending, (s) => {
        s.generating = true;
        s.error = null;
      })
      .addCase(fetchAIResponse.fulfilled, (s, action) => {
        s.generating = false;
        s.lastResponse = action.payload;
        if (action.payload?.output) {
          s.chat.push({ role: "assistant", content: action.payload.output });
        }
      })
      .addCase(fetchAIResponse.rejected, (s, action) => {
        s.generating = false;
        s.error = action.error?.message ?? "AI request failed";
      })
      .addCase(fetchGeneratedImage.fulfilled, (s, action) => {
        if (action.payload?.url) s.images.push(action.payload.url);
      })
      .addCase(fetchImageToText.fulfilled, (s, action) => {
        s.lastResponse = action.payload;
      });
  },
});

export const {
  addUserMessage,
  addAssistantMessage,
  clearChat,
  setError,
  clearError,
} = aiSlice.actions;

export default aiSlice.reducer;
