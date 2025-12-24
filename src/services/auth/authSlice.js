// services/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

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
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching users...");
      const res = await axios.get("/users/list", getAuthHeaders());
      console.log("Users API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Users fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const res = await axios.get(`/users/profile/${userId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
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
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload.data || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedUser = action.payload.user || action.payload.data;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch user profile";
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
