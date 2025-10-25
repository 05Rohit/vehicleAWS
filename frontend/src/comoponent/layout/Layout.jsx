import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import axios from "axios";

import { SocketProvider } from "../../ContextApi/NotificationContentAPI";
import NavBar from "../navBar/NavBar";
import AddVehicleDetails from "../../pages/addVehicle/AddVehicleDetails";
import OTPPage from "../../pages/otpPage/OTPPage";
import HomePage from "../../pages/homePage/HomePage";
import VehicleBookingDetails from "../../pages/VehicleBookingPage/VehicleBookingDetails";
import AllVehicleListpage from "../../pages/AllvehiclePage/AllVehicleListpage";
import BookingList from "../../pages/bookingList/BookingList";
import ContactUsForm from "../../pages/contactUsPage/ContactUsForm";
import Footer from "../../pages/footer/Footer";
import LayoutStyle from "./layout.module.css";
import { Server_API } from "./../../APIPoints/AllApiPonts";
import AdminVehicleManagement from "./../../pages/vehicleManagementPage/AdminVehicleManagement";
import AutoLogout from "../../forTokenExpery";

import { useToast } from "../../ContextApi/ToastContext";
import ForgotPaswswordPage from "./../forgotPassword/ForgotPaswswordPage";
import LoginPage from "./../loginPage/LoginPage";
import SignInPage from "./../signUpPage/SignInPage";
import ChnagePassword from "./../forgotPassword/ChnagePassword";
import ResetPasswordPage from "./../forgotPassword/ResetPasswordPage";
import NotFoundPage from "../../errorPage/NotFoundPage";

const Layout = () => {
  const { handleShowToast } = useToast();

  const [data, setData] = useState(null);

  // const userType = data?.userType;

  const [loading, setLoading] = useState(false);

  // Connect socket only when data._id exists

  const handleLogin = async (loginValue) => {
    setLoading(true); // Start loading state

    try {
      const response = await axios.post(
        `${Server_API}/login`,
        {
          userId: loginValue.userId,
          password: loginValue.password,
        },
        { withCredentials: true }
      );

      if (response.data?.user) {
        setData(response.data.user); // Or response.data.data.user if that's your structure
      }

      handleShowToast("success", "Login successful");

      return {
        success: true,
        message: "Login successful",
      };
    } catch (error) {
      const ErrorMsg = error?.response?.data?.message;
      handleShowToast("danger", ErrorMsg || "Login failed. Try again.");

      return {
        success: false,
        message: error?.response?.data?.message || "Login failed. Try again.",
      };
    } finally {
      setLoading(false); // Ensure loading is reset
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(
        `${Server_API}/logout`,
        {},
        { withCredentials: true }
      );

      handleShowToast("success", "Lougged out successfully");
      if (data.message === "Logged out successfully") {
        // setUserDetails(null);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const HandleCheckauth = async () => {
    try {
      const response = await axios.post(
        `${Server_API}/checkAuth`,
        {},
        { withCredentials: true }
      );

      if (response.data?.data.user) {
        setData(response.data.data.user);
      }
      setLoading(false);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error(
          "User is not authenticated:",
          error.response?.data?.error || "No session found."
        );
      }
      setData(null);
    }
  };

  useEffect(() => {
    HandleCheckauth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* AutoLogout will now properly clear user data on session expiry */}
      {data && <AutoLogout onLogout={logout} />}
      <div className={LayoutStyle.LayoutMain_Container}>
        <div className={LayoutStyle.LayoutMain_Content}>
          <SocketProvider userData={data}>
            <>
              <div className={LayoutStyle.NavBar_Container}>
                <NavBar loading={loading} userDetails={data} logout={logout} />
              </div>

              <div className={LayoutStyle.Pages_Container}>
                <Routes>
                  <Route path="/" element={<HomePage userData={data} />} />
                  <Route path="/otp" element={<OTPPage userData={data} />} />
                  <Route
                    path="/addvehicle"
                    element={
                      // userType === "admin" ? (
                      <AddVehicleDetails />
                      // ) : (
                      //   <HomePage userData={data} />
                      // )
                    }
                  />
                  <Route
                    path="/filterVehicle"
                    element={<AllVehicleListpage />}
                  />
                  <Route
                    path="/booking"
                    element={<VehicleBookingDetails userData={data} />}
                  />
                  <Route
                    path="/bookinglist"
                    element={
                      data ? (
                        <BookingList userData={data} />
                      ) : (
                        <HomePage userData={data} />
                      )
                    }
                  />
                  <Route
                    path="/contactus"
                    element={<ContactUsForm userData={data} />}
                  />

                  <Route
                    path="/vehicleManagement"
                    element={
                      // userType === "admin" ? (
                      <AdminVehicleManagement userData={data} />
                      // ) : (
                      //   <HomePage userData={data} />
                      // )
                    }
                  />

                  <Route
                    path="/forgotpassword"
                    element={<ForgotPaswswordPage />}
                  />
                  <Route
                    path="/login"
                    element={<LoginPage handleLogin={handleLogin} />}
                  />
                  <Route path="/signup" element={<SignInPage />} />
                  <Route path="/changepassword" element={<ChnagePassword />} />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="*" element={<NotFoundPage userData={data} />} />
                </Routes>
              </div>
            </>
          </SocketProvider>

          <div className={LayoutStyle.footer_Container}>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
