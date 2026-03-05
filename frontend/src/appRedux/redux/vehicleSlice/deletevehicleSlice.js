import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

export const deleteVehicleData = createAsyncThunk(
  "vehicle/deleteVehicleData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/deletevehicle/${id}`, {
        withCredentials: true,
      });
      return response?.data?.message; // response message shown in toast
    } catch (error) {
      console.error("Delete Vehicle Error:", error);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

const deleteVehicleSlice = createSlice({
  name: "delete_vehicle_data",
  initialState: {
    deleteResponse: null,
    deleteVehicleLoading: false,
    deleteVehicleError: null,
  },
  reducers: {
    resetDeleteVehicleState: (state) => {
      state.deleteResponse = null;
      state.deleteVehicleLoading = false;
      state.deleteVehicleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteVehicleData.pending, (state) => {
        state.deleteVehicleLoading = true;
        state.deleteVehicleError = null;
        state.deleteResponse = null;
      })
      .addCase(deleteVehicleData.fulfilled, (state, action) => {
        state.deleteVehicleLoading = false;
        state.deleteResponse = action.payload;
      })
      .addCase(deleteVehicleData.rejected, (state, action) => {
        state.deleteVehicleLoading = false;
        state.deleteVehicleError = action.payload;
      });
  },
});
export const { resetDeleteVehicleState } = deleteVehicleSlice.actions;
export default deleteVehicleSlice.reducer;
