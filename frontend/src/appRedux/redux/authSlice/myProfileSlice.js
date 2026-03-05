import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

/* ============================
   ASYNC THUNKS
============================ */

// Fetch profile
export const fetchUserProfileInfo = createAsyncThunk(
  "profile/fetchUserProfileInfo",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/myprofile", {
        withCredentials: true,
      });
      return res.data?.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Update profile
export const updateProfileDetails = createAsyncThunk(
  "profile/updateProfileDetails",
  async (profileData, thunkAPI) => {
    try {
      const res = await api.patch("/updateuserdetails", profileData, {
        withCredentials: true,
      });
      return res.data?.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

// Upload Driving Licence
export const uploadDrivingLicenceImage = createAsyncThunk(
  "profile/uploadDrivingLicenceImage",
  async (formData, thunkAPI) => {
    try {
      const res = await api.post("/uploadDrivingLicence", formData, {
        withCredentials: true,
      });
      return res.data?.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Upload failed"
      );
    }
  }
);

// Verify Driving Licence
export const verifyDrivingLicenceDocument = createAsyncThunk(
  "profile/verifyDrivingLicenceDocument",
  async (_, thunkAPI) => {
    try {
      const res = await api.post(
        "/verifyDrivingLicenceDocument",
        {},
        { withCredentials: true }
      );
      return res.data?.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Verification failed"
      );
    }
  }
);

/* ============================
   SLICE
============================ */

const myProfileSlice = createSlice({
  name: "myProfile",
  initialState: {
    // Fetch profile
    userProfileInfo: null,
    profileLoading: false,
    profileError: null,

    // Update profile
    updateProfileResponse: null,
    updateProfileLoading: false,
    updateProfileError: null,

    // Upload DL
    drivingLicenceUploadResponse: null,
    drivingLicenceUploadLoading: false,
    drivingLicenceUploadError: null,

    // Verify DL
    verifyDLResponse: null,
    verifyDLLoading: false,
    verifyDLError: null,
  },

  reducers: {
    // Reset helpers
    resetProfileState: (state) => {
      state.userProfileInfo = null;
      state.profileLoading = false;
      state.profileError = null;
    },

    resetUpdateProfileState: (state) => {
      state.updateProfileResponse = null;
      state.updateProfileLoading = false;
      state.updateProfileError = null;
    },

    resetDrivingLicenceUploadState: (state) => {
      state.drivingLicenceUploadResponse = null;
      state.drivingLicenceUploadLoading = false;
      state.drivingLicenceUploadError = null;
    },

    resetVerifyDLState: (state) => {
      state.verifyDLResponse = null;
      state.verifyDLLoading = false;
      state.verifyDLError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* -------- FETCH PROFILE -------- */
      .addCase(fetchUserProfileInfo.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfileInfo.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.userProfileInfo = action.payload;
      })
      .addCase(fetchUserProfileInfo.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      /* -------- UPDATE PROFILE -------- */
      .addCase(updateProfileDetails.pending, (state) => {
        state.updateProfileLoading = true;
        state.updateProfileError = null;
      })
      .addCase(updateProfileDetails.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileResponse = action.payload;
      })
      .addCase(updateProfileDetails.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = action.payload;
      })

      /* -------- UPLOAD DL -------- */
      .addCase(uploadDrivingLicenceImage.pending, (state) => {
        state.drivingLicenceUploadLoading = true;
        state.drivingLicenceUploadError = null;
      })
      .addCase(uploadDrivingLicenceImage.fulfilled, (state, action) => {
        state.drivingLicenceUploadLoading = false;
        state.drivingLicenceUploadResponse = action.payload;
      })
      .addCase(uploadDrivingLicenceImage.rejected, (state, action) => {
        state.drivingLicenceUploadLoading = false;
        state.drivingLicenceUploadError = action.payload;
      })

      /* -------- VERIFY DL -------- */
      .addCase(verifyDrivingLicenceDocument.pending, (state) => {
        state.verifyDLLoading = true;
        state.verifyDLError = null;
      })
      .addCase(verifyDrivingLicenceDocument.fulfilled, (state, action) => {
        state.verifyDLLoading = false;
        state.verifyDLResponse = action.payload;
      })
      .addCase(verifyDrivingLicenceDocument.rejected, (state, action) => {
        state.verifyDLLoading = false;
        state.verifyDLError = action.payload;
      });
  },
});

export const {
  resetProfileState,
  resetUpdateProfileState,
  resetDrivingLicenceUploadState,
  resetVerifyDLState,
} = myProfileSlice.actions;

export default myProfileSlice.reducer;
