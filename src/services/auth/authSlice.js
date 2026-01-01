// services/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
// Create guest user
export const createGuestUser = createAsyncThunk(
  "auth/createGuestUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/guest");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create guest user"
      );
    }
  }
);
export const login = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/user/login", loginData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to login"
      );
    }
  }
);
// Login with M-Pesa code
export const loginWithMpesaCode = createAsyncThunk(
  "auth/loginWithMpesaCode",
  async (loginData, { rejectWithValue }) => {
    try {
      console.log("📤 Sending M-Pesa login request:", loginData);
      const res = await axios.post("/auth/login-mpesa", loginData);
      console.log("✅ M-Pesa login response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ M-Pesa login error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to login with M-Pesa code"
      );
    }
  }
);

// Login with username and password
export const loginWithUsername = createAsyncThunk(
  "auth/loginWithUsername",
  async (loginData, { rejectWithValue }) => {
    try {
      console.log("📤 Sending username login request:", {
        ...loginData,
        password: "***",
      });
      const res = await axios.post("/auth/login", loginData);
      console.log("✅ Username login response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Username login error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to login with username"
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Clear local storage
      localStorage.removeItem("guestUser");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to logout");
    }
  }
);

export const clearSelectedUser = createAsyncThunk(
  "user/clearSelectedUser",
  async () => {
    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    subscription: null,
    session: null,
    loading: false,
    error: null,
    loginSuccess: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLoginSuccess: (state) => {
      state.loginSuccess = false;
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create guest user
      .addCase(createGuestUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(createGuestUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create guest user";
      })

      // Login with M-Pesa code
      .addCase(loginWithMpesaCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(loginWithMpesaCode.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription;
        state.session = action.payload.session;

        // Store user in localStorage
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginWithMpesaCode.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload || "Failed to login with M-Pesa code";
      })

      // Login with username
      .addCase(loginWithUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(loginWithUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription;
        state.session = action.payload.session;

        // Store user in localStorage
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginWithUsername.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload || "Failed to login with username";
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.subscription = null;
        state.session = null;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to logout";
      })
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription;
        state.session = action.payload.session;

        // Store user in localStorage
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload || "Failed to login";
      });
  },
});

export const {
  setUser,
  clearError,
  clearLoginSuccess,
  setSubscription,
  setSession,
} = authSlice.actions;

export default authSlice.reducer;
