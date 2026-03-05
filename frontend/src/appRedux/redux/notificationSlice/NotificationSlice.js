import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../axiosInterceptors/AxiosSetup";

// ---------------- Fetch Notifications ----------------
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notification", {
        withCredentials: true,
      });
      return response.data; // { data, count }
    } catch (error) {
              console.log(error);

      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// ---------------- Mark ONE as Read ----------------
export const markNotificationRead = createAsyncThunk(
  "notifications/markOneRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.post(
        "/readNotifications",
        { notificationId, isRead: true },
        { withCredentials: true }
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

// ---------------- Mark ALL as Read ----------------
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.post(
        "/readAllNotifications",
        { isRead: true },
        { withCredentials: true }
      );
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  }
);

const initialState = {
  notificationsList: [],
  unreadCount: 0,
  loading: false,
  error: null,

  markReadSuccess: false,
};

const NotificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotificationsState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
    resetMarkReadSuccess: (state) => {
      state.markReadSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsList = action.payload.data;
        state.unreadCount = action.payload.count;
        state.loading = false;
      })

      // Mark ONE
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notificationsList.find(
          (n) => n._id === action.payload
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
        state.markReadSuccess = true;
      })

      // Mark ALL
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notificationsList.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
        state.markReadSuccess = true;
      })

      // Common rejected handler
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetNotificationsState, clearError, resetMarkReadSuccess } =
  NotificationSlice.actions;

export default NotificationSlice.reducer;
