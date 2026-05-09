// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:5000/api";

// Decode a JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Load persisted token on startup
const storedToken = localStorage.getItem("token");
const storedUser  = storedToken ? decodeToken(storedToken) : null;

// ── Async thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Invalid credentials");
      localStorage.setItem("token", data.token);
      return { token: data.token, user: data.user || decodeToken(data.token) };
    } catch {
      return rejectWithValue("Cannot reach server. Is the backend running?");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Registration failed");
      return data; // just { message: "Account created" }
    } catch {
      return rejectWithValue("Cannot reach server. Is the backend running?");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token:   storedToken || null,
    user:    storedUser  || null,
    loading: false,
    error:   null,
    success: null,    // used by register to show "Account created"
  },
  reducers: {
    // Call this after Google OAuth sets the token in localStorage
    setTokenFromStorage(state) {
      const t = localStorage.getItem("token");
      state.token = t;
      state.user  = t ? decodeToken(t) : null;
      state.error = null;
    },
    logout(state) {
      state.token   = null;
      state.user    = null;
      state.error   = null;
      state.success = null;
      localStorage.removeItem("token");
    },
    clearAuthError(state) {
      state.error   = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.token;
        state.user    = action.payload.user;
        state.error   = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; state.success = null; })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = "Account created successfully! You can now sign in.";
        state.error   = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { setTokenFromStorage, logout, clearAuthError } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectIsLoggedIn  = (state) => !!state.auth.token;
export const selectAuthToken   = (state) => state.auth.token;
export const selectAuthUser    = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError   = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;

export default authSlice.reducer;
