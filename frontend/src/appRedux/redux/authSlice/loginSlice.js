import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", userData, {
        withCredentials: true,
      });
      console.log("Login Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ================= CHECK AUTH ================= */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/checkAuth", {
        withCredentials: true,
      });
      return response.data?.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || null);
    }
  },
);

/* ================= SEND OTP ================= */
export const sendOtpToEmail = createAsyncThunk(
  "auth/send_otp_Email",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/sendOtp",
        { email: data },
        { withCredentials: true },
      );
      return response?.data?.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ================= LOGOUT ================= */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      dispatch(clearUser());
      dispatch(resetLoginState());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

/* ================= VERIFY OTP & LOGIN ================= */
export const verifyOtpAndLogin = createAsyncThunk(
  "auth/verifyOtpAndLogin",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/verifyOtp",
        {
          email,
          otp,
        },
        { withCredentials: true },
      );

      // backend should return user data same as /login
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

const loginSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    response: null,

    loading: false, // login loader
    otpLoading: false, // OTP loader
    logoutLoading: false, // logout loader

    checkingAuth: true, // 🔥 important for refresh
    error: null,

    otpResponse: null,
    otpError: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.response = null;
      state.error = null;
    },
    resetLoginState: (state) => {
      state.response = null;
      state.error = null;
      state.otpResponse = null;
      state.otpError = null;
      state.loading = false;
      state.otpLoading = false;
      state.logoutLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.user =
          action.payload?.data?.user ||
          action.payload?.user ||
          action.payload ||
          null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== CHECK AUTH ===== */
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkingAuth = false;
        state.user = null;
      })

      /* ===== SEND OTP ===== */
      .addCase(sendOtpToEmail.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendOtpToEmail.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpResponse = action.payload;
      })
      .addCase(sendOtpToEmail.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })

      /* ===== LOGOUT ===== */
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.response = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.error = action.payload;
      })

      /* ===== VERIFY OTP LOGIN ===== */
      .addCase(verifyOtpAndLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAndLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;

        state.user =
          action.payload?.data?.user ||
          action.payload?.user ||
          action.payload ||
          null;
      })
      .addCase(verifyOtpAndLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLoginState, setUser, clearUser } = loginSlice.actions;
export default loginSlice.reducer;
