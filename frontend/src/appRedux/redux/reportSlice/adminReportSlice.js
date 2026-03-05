
import {
  createAsyncThunk,
  createSlice,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

/* ===================== THUNKS ===================== */

// 1️⃣ Booking Data
export const fetchReportBookingData = createAsyncThunk(
  "report/fetchReportBookingData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/allbookingdata", {
        withCredentials: true,
      });
      return res?.data?.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 2️⃣ Vehicle List
export const fetchAllVehicleListData = createAsyncThunk(
  "report/fetchAllVehicleListData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/allvehicledata", {
        withCredentials: true,
      });
      return res?.data?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 3️⃣ User List
export const fetchAllUserListData = createAsyncThunk(
  "report/fetchAllUserListData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/alluserdata", {
        withCredentials: true,
      });
      return res?.data?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 4️⃣ Not Available Vehicles
export const fetchNotAvailableVehicleData = createAsyncThunk(
  "report/fetchNotAvailableVehicleData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/allNotAvailableVehicle", {
        withCredentials: true,
      });

      return res?.data?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 5️⃣ Available Vehicles
export const fetchAvailableVehicleData = createAsyncThunk(
  "report/fetchAvailableVehicleData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/allAvailableVehicle", {
        withCredentials: true,
      });

      return res?.data?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 6️⃣ Vehicle Type Count
export const fetchVehicleTypeCount = createAsyncThunk(
  "report/fetchVehicleTypeCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/getVehicleType", {
        withCredentials: true,
      });
      return res?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 7️⃣ Booking Metrics
export const fetchAdminBookingMetrics = createAsyncThunk(
  "report/fetchAdminBookingMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/report/bookingMartix", {
        withCredentials: true,
      });
      return res?.data?.data;
    } catch (error) {
            console.log(error)

      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

/* ===================== SLICE ===================== */

const adminReportSlice = createSlice({
  name: "adminReport",
  initialState: {
    bookingList: [],
    vehicleList: [],
    userList: [],
    availableVehicles: [],
    notAvailableVehicles: [],
    vehicleTypeCount: {},
    bookingMetrics: {},

    loading: false,
    error: null,
  },
  reducers: {
    resetAdminReportState: (state) => {
      state.bookingList = [];
      state.vehicleList = [];
      state.userList = [];
      state.availableVehicles = [];
      state.notAvailableVehicles = [];
      state.vehicleTypeCount = {};
      state.bookingMetrics = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== PENDING (EXPLICIT) ===== */
      .addCase(fetchReportBookingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicleListData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserListData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableVehicleData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotAvailableVehicleData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypeCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookingMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* ===== FULFILLED ===== */
      .addCase(fetchReportBookingData.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingList = action.payload;
      })
      .addCase(fetchAllVehicleListData.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleList = action.payload;
      })
      .addCase(fetchAllUserListData.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = action.payload;
      })
      .addCase(fetchAvailableVehicleData.fulfilled, (state, action) => {
        state.loading = false;
        state.availableVehicles = action.payload;
      })
      .addCase(fetchNotAvailableVehicleData.fulfilled, (state, action) => {
        state.loading = false;
        state.notAvailableVehicles = action.payload;
      })
      .addCase(fetchVehicleTypeCount.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleTypeCount = action.payload;
      })
      .addCase(fetchAdminBookingMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingMetrics = action.payload;
      })

      /* ===== MATCHERS (ALWAYS LAST) ===== */
      .addMatcher(isRejectedWithValue, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminReportState } = adminReportSlice.actions;
export default adminReportSlice.reducer;
