import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

export const updateVehicleData = createAsyncThunk(
  "vehicle/updateVehicleData",
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/updatevehicle/${id}`, vehicleData, {
        withCredentials: true,
      });

      return response?.data?.message; // response message shown in toast
    } catch (updateVehicleError) {
      return rejectWithValue(updateVehicleError?.response?.data?.message);
    }
  }
);

const updateVehicleSlice = createSlice({
  name: "update_vehicle_data",
  initialState: {
    updateVehicleResponse: null,
    updateVehicleLoading: false,
    updateVehicleError: null,
  },
  reducers: {
    resetUpdateVehicleState: (state) => {
      state.updateVehicleResponse = null;
      state.updateVehicleLoading = false;
      state.updateVehicleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateVehicleData.pending, (state) => {
        state.updateVehicleLoading = true;
        state.updateVehicleError = null;
        state.updateVehicleResponse = null;
      })
      .addCase(updateVehicleData.fulfilled, (state, action) => {
        state.updateVehicleLoading = false;
        state.updateVehicleResponse = action.payload;
      })
      .addCase(updateVehicleData.rejected, (state, action) => {
        state.updateVehicleLoading = false;
        state.updateVehicleError = action.payload;
      });
  },
});

export const { resetUpdateVehicleState } = updateVehicleSlice.actions;
export default updateVehicleSlice.reducer;
