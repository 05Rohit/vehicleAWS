

import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

/* ===== Reducers (UNCHANGED NAMES) ===== */
import LoginReducer from "./redux/authSlice/loginSlice";
import VehicleDataReducer from "./redux/vehicleSlice/getvehicleSlice";
import PostVehicleDataReducer from "./redux/vehicleSlice/addVehicleSlice";
import UpdateVehicleDataReducer from "./redux/vehicleSlice/updateVehicleSlice";
import DeleteVehicleDataReducer from "./redux/vehicleSlice/deletevehicleSlice";
import GroupVehicleDataReducer from "./redux/vehicleSlice/groupVehicleUpdateSlice";
import BookingDataReducer from "./redux/bookingSlice/vehicleBookingSlice";
import NotificationReducer from "./redux/notificationSlice/NotificationSlice.js";
import myProfileReducer from "./redux/authSlice/myProfileSlice";
import AdminReportReducer from "./redux/reportSlice/adminReportSlice.js";
import AdminReducer from "./redux/adminSlice/AdminRoleSlice.js";
/* ===== Persist ONLY login reducer ===== */
const loginPersistConfig = {
  key: "login",
  storage,
  blacklist: ["loading", "otpLoading", "logoutLoading", "error", "otpError"],
};

const persistedLoginReducer = persistReducer(loginPersistConfig, LoginReducer);

/* ===== Store (NO CHANGE IN KEYS) ===== */
export const store = configureStore({
  reducer: {
    login: persistedLoginReducer, 
    userProfile: myProfileReducer,
    vehicleList: VehicleDataReducer,
    addVehicle: PostVehicleDataReducer,
    updateVehicle: UpdateVehicleDataReducer,
    deleteVehicle: DeleteVehicleDataReducer,
    updateGroupVehicle: GroupVehicleDataReducer,
    bookingData: BookingDataReducer,
    notificationData: NotificationReducer,
    adminReportData:AdminReportReducer,
    adminData:AdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/* ===== Persistor ===== */
export const persist = persistStore(store);
