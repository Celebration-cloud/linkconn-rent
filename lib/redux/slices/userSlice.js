import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/Toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Signup thunk: store user data in Supabase via API route
export const signupUser = createAsyncThunk(
  "user/signupUser",
  async (formData, { rejectWithValue }) => {
    try {
      // 1️⃣ Create user in NextAuth via credentials (backend handles password hashing)
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });
      const signupData = await signupRes.json();
      console.log("Signup response data:", signupData);
      if (!signupRes.ok) throw new Error(signupData.error || "Signup failed");

      // 2️⃣ Automatically sign in the user using NextAuth
      const email = formData.get("email");
      const password = formData.get("password");
     const loginRes = await signIn("credentials", {
       redirect: false,
       email,
       password,
     });

      if (!loginRes || loginRes.error) throw new Error(loginRes?.error || "Login failed");

      return { user: signupData.user, session: loginRes };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Login thunk: authenticate using NextAuth, optionally fetch Supabase data
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // Optionally fetch user profile from Supabase
      const userRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const userData = await userRes.json();
      console.log("Fetched user data: cone", userData);
      if (!userRes.ok) throw new Error(userData.error || "Failed fetching user data");
      // Authenticate with NextAuth credentials provider
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (!res || res.error) throw new Error(res?.error || "Login failed");

      if (!userData) return;
      return { user: userData.user, session: res };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      return data.message;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.current = null;
      localStorage.removeItem("user");
    },
    setUserFromStorage: (state) => {
      const saved = localStorage.getItem("user");
      if (saved) state.current = JSON.parse(saved);
    },
    clearUser: (state) => {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        showToast({ title: "User data loaded", type: "success" });
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showToast({
          title: "Failed to load user data",
          description: action.payload,
          type: "error",
        });
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        showToast({
          title: "Signup successful",
          description: "Welcome!",
          type: "success",
        });
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showToast({
          title: "Signup failed",
          description: action.payload,
          type: "error",
        });
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        showToast({
          title: "Login successful",
          description: "You’re in.",
          type: "success",
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showToast({
          title: "Login failed",
          description: action.payload,
          type: "error",
        });
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        showToast({
          title: "Check your email",
          description: "Password reset link sent",
          type: "success",
        });
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showToast({
          title: "Reset failed",
          description: action.payload,
          type: "error",
        });
      });

  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
