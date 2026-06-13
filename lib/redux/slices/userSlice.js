import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/components/ui/Toast";

// Fetch user data via secure profile API route
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load user profile");
      }

      return data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Signup thunk: register user in Neon Auth and create Postgres metadata
export const signupUser = createAsyncThunk(
  "user/signupUser",
  async (formData, { rejectWithValue }) => {
    try {
      // 1️⃣ Register through the custom signup endpoint (which does DB operations and calls Neon Auth server)
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });
      const signupData = await signupRes.json();

      console.log("Signup response data:", signupData);
      if (!signupRes.ok) throw new Error(signupData.error || "Signup failed");

      // 2️⃣ Authenticate session client-side using Neon Auth Client
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const loginRes = await authClient.signIn.email({
          email,
          password,
        });

        if (loginRes.error) {
          if (
            loginRes.error.status === 403 ||
            loginRes.error.code === "EMAIL_NOT_VERIFIED" ||
            loginRes.error.message?.toLowerCase().includes("verify") ||
            loginRes.error.message?.toLowerCase().includes("verification")
          ) {
            return { user: signupData.user, needsVerification: true, email };
          }
          throw new Error(
            loginRes.error.message || "Failed auto-login after signup",
          );
        }

        return { user: signupData.user, session: loginRes.data };
      } catch (loginErr) {
        if (
          loginErr.status === 403 ||
          loginErr.message?.toLowerCase().includes("verify") ||
          loginErr.message?.toLowerCase().includes("verification")
        ) {
          return { user: signupData.user, needsVerification: true, email };
        }
        throw loginErr;
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Login thunk: authenticate with Neon Auth and verify profile role
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // 1️⃣ Call our backend endpoint to verify credentials and check role
      const userRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const userData = await userRes.json();

      console.log("Fetched user data:", userData);
      if (!userRes.ok) {
        throw new Error(userData.error || "Login verification failed");
      }

      // 2️⃣ Authenticate session client-side using Neon Auth Client
      try {
        const loginRes = await authClient.signIn.email({
          email,
          password,
        });

        if (loginRes.error) {
          // Check if the error is due to unverified email
          if (
            loginRes.error.status === 403 ||
            loginRes.error.code === "EMAIL_NOT_VERIFIED" ||
            loginRes.error.message?.toLowerCase().includes("verify") ||
            loginRes.error.message?.toLowerCase().includes("verification")
          ) {
            return { needsVerification: true, email };
          }

          throw new Error(
            loginRes.error.message || "Session initialization failed",
          );
        }

        return { user: userData.user, session: loginRes.data };
      } catch (loginErr) {
        // Catch thrown errors that indicate unverified email
        if (
          loginErr.status === 403 ||
          loginErr.message?.toLowerCase().includes("verify") ||
          loginErr.message?.toLowerCase().includes("verification")
        ) {
          return { needsVerification: true, email };
        }

        throw loginErr;
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      // Direct reset email trigger using Neon Auth standard trigger
      const res = await authClient.forgetPassword({
        email,
        redirectTo: "/auth/reset-password",
      });

      if (res.error) {
        throw new Error(
          res.error.message || "Failed to trigger password reset",
        );
      }

      return "Check your email for reset instructions.";
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  current: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.current = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.current = null;
      localStorage.removeItem("user");
    },
    setUserFromStorage(state) {
      const saved = localStorage.getItem("user");

      if (saved) state.current = JSON.parse(saved);
    },
    clearUser(state) {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
    setUserLoading(state, action) {
      state.loading = action.payload ?? true;
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
        if (action.payload?.needsVerification) {
          state.current = null;
        } else {
          state.current = action.payload;
        }
        showToast({
          title: "Signup successful",
          description: action.payload?.needsVerification
            ? "Please verify your email address."
            : "Welcome!",
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
        if (action.payload?.needsVerification) {
          state.current = null;
          showToast({
            title: "Email not verified",
            description: "Please verify your email address before logging in.",
            type: "warning",
          });
        } else {
          state.current = action.payload;
          showToast({
            title: "Login successful",
            description: "You're in.",
            type: "success",
          });
        }
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

export const {
  setUser,
  logout,
  setUserFromStorage,
  clearUser,
  setUserLoading,
} = userSlice.actions;

export default userSlice.reducer;
