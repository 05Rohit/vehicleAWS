// ...existing code...
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../axiosInterceptors/AxiosSetup";

export const addVehicleData = createAsyncThunk(
  "vehicle/addVehicle",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("createvehicle", formData, {
        withCredentials: true,
      });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

const AddVehicleDataSlice = createSlice({
  name: "add_vehicle_info",
  initialState: {
    addVehicleResponse: null,
    error: null,
    loading: false,
  },
  reducers: {
    resetAddVehicleDataState: (state) => {
      state.addVehicleResponse = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addVehicleData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicleData.fulfilled, (state, action) => {
        state.addVehicleResponse = action.payload;
        state.loading = false;
      })
      .addCase(addVehicleData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { resetAddVehicleDataState } = AddVehicleDataSlice.actions;
export default AddVehicleDataSlice.reducer;
