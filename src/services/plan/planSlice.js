import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchPlans = createAsyncThunk("plan/fetchPlans", async () => {
  const res = await axios.get("/plans", getAuthHeaders());
  return res.data.data;
});
export const createPlan = createAsyncThunk(
  "plan/createPlan",
  async (planData) => {
    const res = await axios.post("/plans", planData, getAuthHeaders());
    return res.data.data;
  }
);
export const updatePlan = createAsyncThunk(
  "plan/updatePlan",
  async ({ id, planData }) => {
    const res = await axios.put(`/plans/${id}`, planData, getAuthHeaders());
    return res.data.data;
  }
);
export const deletePlan = createAsyncThunk("plan/deletePlan", async (id) => {
  const res = await axios.delete(`/plans/${id}`, getAuthHeaders());
  return res.data.message;
});

const planSlice = createSlice({
  name: "plan",
  initialState: {
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default planSlice.reducer;
