import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

export const getVehicleData = createAsyncThunk(
  "vehicle/getVehicleData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/getallvehicle", {
        withCredentials: true,
      });

      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

const vehicleDataSlice = createSlice({
  name: "get_vehicle_data",
  initialState: {
    vehicleList: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetVehicleDataState: (state) => {
      state.vehicleList = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVehicleData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicleData.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleList = action.payload;
      })
      .addCase(getVehicleData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetVehicleDataState } = vehicleDataSlice.actions;
export default vehicleDataSlice.reducer;
