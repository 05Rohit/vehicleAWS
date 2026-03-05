import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";
export const updateGroupVehicleData = createAsyncThunk(
  "vehicle/updateVehicleData",
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/updatevehiclegroup/${id}`,
        vehicleData,
        {
          withCredentials: true,
        }
      );
      return response?.data?.message; // response message shown in toast
    } catch (error) {
      console.error("Update Group Vehicle Error:", error);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

const updateGroupVehicleSlice = createSlice({
  name: "update_vehicle_data",
  initialState: {
    updateVehicleGroupResponse: null,
    updateVehicleGroupLoading: false,
    updateVehicleGroupError: null,
  },
  reducers: {
    resetUpdateGroupVehicleState: (state) => {
      state.updateVehicleGroupResponse = null;
      state.updateVehicleGroupLoading = false;
      state.updateVehicleGroupError = null;
    },
    extraReducesrs: (builder) => {
      builder
        .addCase(updateGroupVehicleData.pending, (state) => {
          state.updateVehicleGroupLoading = true;
          state.updateVehicleGroupError = null;
          state.updateVehicleGroupResponse = null;
        })
        .addCase(updateGroupVehicleData.fulfilled, (state, action) => {
          state.updateVehicleGroupLoading = false;
          state.updateVehicleGroupResponse = action.payload;
        })
        .addCase(updateGroupVehicleData.rejected, (state, action) => {
          state.updateVehicleGroupLoading = false;
          state.updateVehicleGroupError = action.payload;
        });
    },
  },
});
export const { resetUpdateGroupVehicleState } = updateGroupVehicleSlice.actions;
export default updateGroupVehicleSlice.reducer;
