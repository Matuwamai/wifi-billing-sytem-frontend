// services/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Helper function for auth headers - accepts optional token
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

// Create guest user
export const createGuestUser = createAsyncThunk(
  "auth/createGuestUser",
  async ({ deviceName, phone = null }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "/user/guest",
        {
          deviceName,
          phone,
          macAddress: deviceName,
        },
        getAuthHeaders()
      );
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
      const res = await axios.post("/auth/login-mpesa", loginData);
      return res.data;
    } catch (error) {
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
      const res = await axios.post("/auth/login", loginData);
      return res.data;
    } catch (error) {
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
    deviceName: null,
    phone: null,
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
    // Add a direct login action for testing
    directLogin: (state, action) => {
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
      state.loginSuccess = true;
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

      // Main login
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
  directLogin,
} = authSlice.actions;

export default authSlice.reducer;
