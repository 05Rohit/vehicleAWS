import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

export const fetchDLlistdata = createAsyncThunk(
  "admin/fetchDLlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/fetchDLList", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch DL list"
      );
    }
  }
);

export const handleDLApproval = createAsyncThunk(
  "admin/handleDLApproval",
  async (userID, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        "/verifyDrivingLicenceDocument",
        { userID },
        { withCredentials: true }
      );
      return {
        userID,
        message: response?.data?.message, // ✅ backend message
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "DL approval failed"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "adminRole",
  initialState: {
    /* ==== Fetch Data List ==== */
    userDlDataList: [],
    userDlDataListLoading: false,
    userDlDataListError: null,

    /* ===== Update List ==== */
    userDlverifyResponse: null,
    userDlverifyResponseLoading: false,
    userDlverifyResponseError: null,
  },
  reducers: {
    resetfetchDLDataList: (state) => {
      state.userDlDataList = [];
      state.userDlDataListError = null;
      state.userDlDataListLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== FETCH DL LIST ===== */
      .addCase(fetchDLlistdata.pending, (state) => {
        state.userDlDataListLoading = true;
        state.userDlDataListError = null;
      })
      .addCase(fetchDLlistdata.fulfilled, (state, action) => {
        state.userDlDataList = action.payload;
        state.userDlDataListLoading = false;
      })
      .addCase(fetchDLlistdata.rejected, (state, action) => {
        state.userDlDataListLoading = false;
        state.userDlDataListError = action.payload;
      })

      /* ===== DL APPROVAL ===== */
      .addCase(handleDLApproval.pending, (state) => {
        state.userDlverifyResponseLoading = true;
        state.userDlverifyResponseError = null;
      })

      .addCase(handleDLApproval.fulfilled, (state, action) => {
        state.userDlverifyResponseLoading = false;

        const { userID, message } = action.payload;

        // ✅ Remove user from list
        state.userDlDataList = state.userDlDataList.filter(
          (user) => user._id !== userID
        );

        // ✅ Store backend message
        state.userDlverifyResponse = message;
      })

      .addCase(handleDLApproval.rejected, (state, action) => {
        state.userDlverifyResponseLoading = false;
        state.userDlverifyResponseError = action.payload;
      });
  },
});

export const { resetfetchDLDataList } = adminSlice.actions;
export default adminSlice.reducer;
