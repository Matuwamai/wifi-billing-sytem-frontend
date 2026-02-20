// redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Helper function for auth headers
const getAuthHeaders = (token = null) => {
  const authToken = token || localStorage.getItem("token");
  return authToken
    ? {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    : {};
};

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Register a new user with phone + password
 * POST /api/auth/register
 */
export const register = createAsyncThunk(
  "auth/register",
  async (
    { phone, password, username, macAddress, deviceName },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post("/auth/register", {
        phone,
        password,
        username,
        macAddress,
        deviceName,
      });

      // Save token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to register",
      );
    }
  },
);

/**
 * Create guest user (for voucher redemption)
 * POST /api/auth/guest
 */
export const createGuestUser = createAsyncThunk(
  "auth/createGuestUser",
  async ({ deviceName, phone = null }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/guest", {
        deviceName,
        phone,
      });

      // Save token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create guest user",
      );
    }
  },
);

/**
 * Login with username + password (RADIUS credentials)
 * POST /api/auth/login
 */
export const login = createAsyncThunk(
  "auth/admin-login",
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/admin-login", {
        phone,
        password,
      });

      // Save token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid phone or password",
      );
    }
  },
);

/**
 * Login with username + password (RADIUS credentials)
 * POST /api/auth/login
 */
export const loginWithUsername = createAsyncThunk(
  "auth/loginWithUsername",
  async (
    { username, password, macAddress, deviceName },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post("/auth/login", {
        username,
        password,
        macAddress,
        deviceName,
      });

      // Save token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid username or password",
      );
    }
  },
);

/**
 * Login with M-Pesa receipt code
 * POST /api/auth/login-mpesa
 */
export const loginWithMpesaCode = createAsyncThunk(
  "auth/loginWithMpesaCode",
  async (
    { mpesaCode, macAddress, deviceName, ipAddress },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post("/auth/login-mpesa", {
        mpesaCode,
        macAddress,
        deviceName,
        ipAddress,
      });

      // Save token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid M-Pesa code",
      );
    }
  },
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/auth/me", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

/**
 * Logout - clear local storage and state
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("guestUser");
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to logout");
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Current logged-in user
    subscription: null, // Active subscription (from login response)
    radiusCredentials: null, // ✨ NEW: { username, password } for WiFi login
    loading: false,
    error: null,
    loginSuccess: false,
    isAuthenticated: false, // ✨ NEW: Boolean flag
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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
    // ✨ NEW: Store RADIUS credentials after payment/voucher
    setRadiusCredentials: (state, action) => {
      state.radiusCredentials = action.payload;
    },
    // Direct login for testing/manual auth
    directLogin: (state, action) => {
      state.user = action.payload.user;
      state.subscription = action.payload.subscription || null;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.loginSuccess = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ──
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload;
      })

      // ── Create guest user ──
      .addCase(createGuestUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(createGuestUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Login with username ──
      .addCase(loginWithUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(loginWithUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription || null;
        state.isAuthenticated = true;
      })
      .addCase(loginWithUsername.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload;
      })

      // ── Login with M-Pesa code ──
      .addCase(loginWithMpesaCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(loginWithMpesaCode.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription || null;
        state.radiusCredentials = action.payload.radiusCredentials || null; // ✨ NEW
        state.isAuthenticated = true;
      })
      .addCase(loginWithMpesaCode.rejected, (state, action) => {
        state.loading = false;
        state.loginSuccess = false;
        state.error = action.payload;
      })

      // ── Get me ──
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription || null;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // ── Logout ──
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.subscription = null;
        state.radiusCredentials = null;
        state.error = null;
        state.loginSuccess = false;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUser,
  clearError,
  clearLoginSuccess,
  setSubscription,
  setRadiusCredentials,
  directLogin,
} = authSlice.actions;

export default authSlice.reducer;
