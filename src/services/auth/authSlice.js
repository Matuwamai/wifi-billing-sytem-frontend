import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

const API_URL = BASE_URL;

// ✅ Utility to generate a unique device identifier
const generateDeviceId = () => {
  return (
    "dev-" +
    Math.random().toString(36).substring(2, 10) +
    "-" +
    Date.now().toString(36)
  );
};

// ✅ Thunk: Create guest user (if device is new)
export const createGuestUser = createAsyncThunk(
  "user/createGuestUser",
  async (_, { rejectWithValue }) => {
    try {
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem("deviceId", deviceId);
      }

      const res = await axios.post(`${API_URL}/user/guest`, { deviceId });

      if (res.data.success) {
        return res.data; // expected: { success: true, user: {...} }
      } else {
        return rejectWithValue(res.data.message || "Failed to create guest");
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error creating guest user"
      );
    }
  }
);

// ✅ Thunk: Login user (for registered accounts)
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/user/login`, credentials);
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      } else {
        return rejectWithValue(res.data.message || "Login failed");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login error");
    }
  }
);

// ✅ Thunk: Logout user
export const logoutUser = createAsyncThunk("user/logoutUser", async () => {
  localStorage.removeItem("user");
  localStorage.removeItem("guestUser");
  localStorage.removeItem("deviceId");
  return true;
});

const initialState = {
  user:
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("guestUser")) ||
    null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("guestUser", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Guest user
      .addCase(createGuestUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuestUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem("guestUser", JSON.stringify(action.payload.user));
      })
      .addCase(createGuestUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
