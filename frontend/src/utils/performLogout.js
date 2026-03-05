import api from "../axiosInterceptors/AxiosSetup";
import { store, persist } from "../appRedux/store";
import { logout as logoutAction } from "../appRedux/redux/authSlice/loginSlice";

/**
 * performLogout(navigate?, showToast?)
 * - optional backend call to /logout
 * - dispatches logout action to reset login slice
 * - purges persisted storage
 * - clears local/session storage
 * - optional toast and navigation
 */
const performLogout = async (navigate, showToast) => {
  try {
    await api.post("/logout", {}, { withCredentials: true });
  } catch (err) {
    // ignore backend errors and continue clearing client state
  }

  // reset redux login slice
  store.dispatch(logoutAction());

  // purge persisted store
  try {
    await persist.purge();
  } catch (e) {
    // ignore
  }

  // clear client storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}

  if (typeof showToast === "function") showToast("success", "Logged out");
  if (typeof navigate === "function") navigate("/login");
};

export default performLogout;