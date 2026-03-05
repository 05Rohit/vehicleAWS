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
import AdminVehicleManagement from "./../../pages/vehicleManagementPage/AdminVehicleManagement";
// import AutoLogout from "../../forTokenExpery";

import { useToast } from "../../ContextApi/ToastContext";
import ForgotPaswswordPage from "./../forgotPassword/ForgotPaswswordPage";
import LoginPage from "./../loginPage/LoginPage";
import SignInPage from "./../signUpPage/SignInPage";
import ChnagePassword from "./../forgotPassword/ChnagePassword";
import ResetPasswordPage from "./../forgotPassword/ResetPasswordPage";
import NotFoundPage from "../../errorPage/NotFoundPage";
import { useSelector } from "react-redux";
import MyProfile from "../navBar/MyProfile";
import AdminDashboard from "../../pages/adminDashboard/AdminDashBoard";
import AdminActionPage from "../../pages/alertPages/AdminActionPage";
import AuditLogsList from "../../pages/adminDashboard/reportComponent/AuditLogsList";

const Layout = () => {
  // const userType = data?.userType;
  const [loading, setLoading] = useState(false);

  // Connect socket only when data._id exists

  // Get User Data
  const { user } = useSelector((state) => state.login);

  return (
    <>
      {/* AutoLogout will now properly clear user data on session expiry */}
      <div className={LayoutStyle.LayoutMain_Container}>
        <div className={LayoutStyle.LayoutMain_Content}>
          <SocketProvider userData={user}>
            <>
              <div className={LayoutStyle.NavBar_Container}>
                <NavBar loading={loading} />
              </div>

              <div className={LayoutStyle.Pages_Container}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/otp" element={<OTPPage />} />
                  <Route path="/profile" element={<MyProfile />} />
                  <Route
                    path="/addvehicle"
                    element={
                      // user.userType === "admin" ? (
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
                  <Route path="/booking" element={<VehicleBookingDetails />} />
                  <Route
                    path="/bookinglist"
                    element={user ? <BookingList /> : <HomePage />}
                  />
                  <Route path="/contactus" element={<ContactUsForm />} />

                  <Route
                    path="/vehicleManagement"
                    element={
                      // user.userType === "admin" ? (
                      <AdminVehicleManagement />
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
                    element={
                      <LoginPage
                      // handleSendOtp={handleSendOtp}
                      />
                    }
                  />
                  <Route path="/signup" element={<SignInPage />} />
                  <Route path="/changepassword" element={<ChnagePassword />} />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route
                    path="/admin_dashboard"
                    element={<AdminDashboard />}
                  />
                  <Route
                    path="/audit_logs"
                    element={<AuditLogsList />}
                  />
                  
                  {/* ==== It inclde may pages like DLverifyPage.jsx , VehicleHandoverPage.jsx and it comes under adminDashboard.jsx */ }
                  <Route
                    path="/action"
                    element={<AdminActionPage />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
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
