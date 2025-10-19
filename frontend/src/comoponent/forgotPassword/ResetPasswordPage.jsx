import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";

import CustomStyle from "../loginPage/CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import api from "../../axiosInterceptors/AxiosSetup";

const ResetPasswordPage = ({ handlePageToggle }) => {
  const { handleShowToast } = useToast();

  const [value, setValue] = useState({
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Get token and email from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const email = params.get("email");

  const handleChange = (e, category) => {
    const { value } = e.target;
    setValue((prevState) => ({
      ...prevState,
      [category]: value,
    }));
  };

  const handleResetClick = async () => {
    try {
      if (value.password !== value.confirmPassword) {
        handleShowToast("danger", "Passwords do not match");
        return;
      }
      await api.post(`${Server_API}/resetpassword`, {
        password: value.password,
        confirmPassword: value.confirmPassword,
        token,
        email,
      });
      handleShowToast("success", "Password reset successful! Please login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      handleShowToast("danger", "Failed to reset password");
    }
  };

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <>
      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.card_header}>
          <div className={`${CustomStyle.avatar} ${CustomStyle.blue}`}>
            <User className={CustomStyle.icon_white} />
          </div>
          <h1>Welcome</h1>
          <p>Reset Your Password Using Token</p>
        </div>

        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            <label htmlFor="password">New Password</label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                type={showNewPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter New password"
                value={value.password}
                onChange={(e) => handleChange(e, "password")}
              />
              <button
                type="button"
                className={FormStyles.toggle_visibility}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div className={FormStyles.form_group}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm New password"
                value={value.confirmPassword}
                onChange={(e) => handleChange(e, "confirmPassword")}
              />
              <button
                type="button"
                className={FormStyles.toggle_visibility}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div
            className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
          >
            <button
              className={ButtonStyle.Button_Container_content}
              onClick={handleResetClick}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
