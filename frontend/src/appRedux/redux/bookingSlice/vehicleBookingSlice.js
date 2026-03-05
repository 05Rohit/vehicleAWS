import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

/* ===================================================
   🟢 GET BOOKING LIST
=================================================== */
export const getBookingListData = createAsyncThunk(
  "booking/getBookingListData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/getBookingdetails`, {
        withCredentials: true,
      });
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

/* ===================================================
   🟡 CREATE BOOKING
=================================================== */
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    console.log("Creating Booking with Data:", bookingData);
    try {
      const response = await api.post(`/addbooking`, bookingData, {
        withCredentials: true,
      });
      return response?.data?.message;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

/* ===================================================
   🔵 UPDATE BOOKING as Status "cancelled"
=================================================== */
export const updateBookingData = createAsyncThunk(
  "booking/updateBookingData",
  async ({ bookingId, bookingStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/updateBookingDetails`,
        { uniqueBookingId: bookingId, bookingStatus: bookingStatus },
        { withCredentials: true }
      );
      return response?.data?.message;
    } catch (error) {
      console.error("Update Booking Error:", error);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

/* ===================================================
   🔵 UPDATE BOOKING as status "completed"
=================================================== */
export const CompletedRideBookingData = createAsyncThunk(
  "booking/CompletedRideBookingData",
  async ({ bookingId, bookingStatus }, { rejectWithValue }) => {
    // console.log("Completing Booking with ID:", bookingId, "Status:", bookingStatus);
    try {
      const response = await api.patch(
        `/completeBooking`,
        { uniqueBookingId: bookingId, bookingStatus: bookingStatus },
        { withCredentials: true }
      );
      return response?.data?.message;
    } catch (error) {
      console.error("Update Booking Error:", error);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

/* ===================================================
   🧩 Combined Slice
=================================================== */
const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    // Get List
    bookingListData: [],
    bookingListLoading: false,
    bookingListError: null,

    // Create Booking
    createBookingResponse: null,
    createBookingLoading: false,
    createBookingError: null,

    // Update Booking to Cancelled
    updateBookingResponse: null,
    updateBookingLoading: false,
    updateBookingError: null,
    // Update Booking to Completed
    updateCompleteBookingResponse: null,
    updateCompleteBookingLoading: false,
    updateCompleteBookingError: null,
  },

  reducers: {
    resetBookingState: (state) => {
      state.bookingListData = [];
      state.bookingListLoading = false;
      state.bookingListError = null;
    },
    resetCreateBookingState: (state) => {
      state.createBookingResponse = null;
      state.createBookingLoading = false;
      state.createBookingError = null;
    },
    resetUpdateBookingState: (state) => {
      state.updateBookingResponse = null;
      state.updateBookingLoading = false;
      state.updateBookingError = null;
    },
    resetUpdateCompleteBookingState: (state) => {
      state.updateCompleteBookingResponse = null;
      state.updateCompleteBookingLoading = false;
      state.updateCompleteBookingError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------------------- GET BOOKINGS -------------------- */
      .addCase(getBookingListData.pending, (state) => {
        state.bookingListLoading = true;
        state.bookingListError = null;
        state.bookingListData = [];
      })
      .addCase(getBookingListData.fulfilled, (state, action) => {
        state.bookingListLoading = false;
        state.bookingListData = action.payload;
      })
      .addCase(getBookingListData.rejected, (state, action) => {
        state.bookingListLoading = false;
        state.bookingListError = action.payload;
      })

      /* -------------------- CREATE BOOKING -------------------- */
      .addCase(createBooking.pending, (state) => {
        state.createBookingLoading = true;
        state.createBookingError = null;
        state.createBookingResponse = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createBookingLoading = false;
        state.createBookingResponse = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createBookingLoading = false;
        state.createBookingError = action.payload;
      })

      /* -------------------- UPDATE BOOKING TO CANCELLED -------------------- */
      .addCase(updateBookingData.pending, (state) => {
        state.updateBookingLoading = true;
        state.updateBookingError = null;
        state.updateBookingResponse = null;
      })
      .addCase(updateBookingData.fulfilled, (state, action) => {
        state.updateBookingLoading = false;
        state.updateBookingResponse = action.payload;
      })
      .addCase(updateBookingData.rejected, (state, action) => {
        state.updateBookingLoading = false;
        state.updateBookingError = action.payload;
      })
      /* -------------------- UPDATE BOOKING TO COMPLETED -------------------- */
      .addCase(CompletedRideBookingData.pending, (state) => {
        state.updateCompleteBookingLoading = true;
        state.updateCompleteBookingError = null;
        state.updateCompleteBookingResponse = null;
      })
      .addCase(CompletedRideBookingData.fulfilled, (state, action) => {
        state.updateCompleteBookingLoading = false;
        state.updateCompleteBookingResponse = action.payload;
      })
      .addCase(CompletedRideBookingData.rejected, (state, action) => {
        state.updateCompleteBookingLoading = false;
        state.updateCompleteBookingError = action.payload;
      });
  },
});

/* EXPORT ACTIONS */
export const {
  resetBookingState,
  resetCreateBookingState,
  resetUpdateBookingState,
  resetUpdateCompleteBookingState,
} = bookingSlice.actions;

/* EXPORT REDUCER */
export default bookingSlice.reducer;
