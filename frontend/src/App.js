

import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Layout from "./comoponent/layout/Layout";
import { ToastProvider } from "./ContextApi/ToastContext";
import { LoaderProvider, useLoader } from "./ContextApi/LoaderContext";
import Preloader from "./preLoader/Preloader.jsx";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./appRedux/redux/authSlice/loginSlice.js";

if (process.env.App_ENV === "production") {
  disableReactDevTools();
}


const LoaderBridge = () => {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const loginLoading = useSelector((state) => state.login.loading);
  const otpLoading = useSelector((state) => state.login.otpLoading);
  const checkingAuth = useSelector((state) => state.login.checkingAuth);

  const addVehicleLoading = useSelector((state) => state.addVehicle.loading);
  const getVehicleLoading = useSelector((state) => state.vehicleList.loading);
  const getBookingLoading = useSelector((state) => state.booking?.loading);

  const loading =
    loginLoading ||
    otpLoading ||
    addVehicleLoading ||
    getVehicleLoading ||
    getBookingLoading;

  // ✅ ALWAYS called
useEffect(() => {
  // Only check auth if we haven't finished checking yet
  if (checkingAuth) {
    dispatch(checkAuth());
  }
}, [dispatch, checkingAuth]);

  // ✅ ALWAYS called
  useEffect(() => {
    if (loading) showLoader();
    else hideLoader();
  }, [loading]);

  // ✅ CONDITIONAL RETURN AFTER HOOKS
  if (checkingAuth) {
    return <Preloader />;
  }

  return (
    <>
      {loading && <Preloader />}
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </>
  );
};


function App() {
  return (
    <ToastProvider>
      <LoaderProvider>
        <LoaderBridge />
      </LoaderProvider>
    </ToastProvider>
  );
}

export default App;
