import React, { useState } from "react";
import NavBarStyle from "../navBar/NavBar.module.css";
import CustomStyle from "../loginPage/CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";

import { useNavigate } from "react-router-dom";
import { useToast } from "../../ContextApi/ToastContext";
import { Server_API } from "./../../APIPoints/AllApiPonts";
import { Eye, EyeOff, User, Lock } from "lucide-react";

import api from "../../axiosInterceptors/AxiosSetup";
const ChnagePassword = ({ handleClose }) => {
  const { handleShowToast } = useToast();

  const [loginValue, setLoginValue] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const navigation = useNavigate();

  const handleChange = (e, category) => {
    const { value } = e.target;
    setLoginValue((prevState) => ({
      ...prevState,
      [category]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (
      !loginValue.oldPassword ||
      !loginValue.newPassword ||
      !loginValue.confirmNewPassword
    ) {
      handleShowToast("danger", "Please fill all the fields");
      return;
    }

    try {
      const res = await api.patch(
        `${Server_API}/changepassword`,
        loginValue,
        {
          withCredentials: true,
        }
      );

      if (res.data.status === "success") {
        handleShowToast("success", res.data.message);
        handleClose();
        navigation("/login");
      } else {
        handleShowToast("danger", res.data.message);
      }
    } catch (error) {
      console.error("Error during password change:", error);
      handleShowToast("danger", "An error occurred. Please try again.");
    }
  };

  const [showPassword, setShowPassword] = useState(false);
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
          <p>Update Your Password</p>
        </div>

        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            {" "}
            <label htmlFor="oldPassword">Current Password</label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />

              <input
                type={showPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter Current password"
                value={loginValue.oldPassword}
                onChange={(e) => handleChange(e, "oldPassword")}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={FormStyles.toggle_visibility}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className={FormStyles.form_group}>
            {" "}
            <label htmlFor="newPassword">New Password</label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter New password"
                value={loginValue.newPassword}
                className={NavBarStyle.loginpage_BoxContent_InputTag}
                onChange={(e) => handleChange(e, "newPassword")}
                required
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
            <label htmlFor="confirmNewPassword">Confirm Password</label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmNewPassword"
                id="confirmNewPassword"
                placeholder="Confirm New password"
                value={loginValue.confirmNewPassword}
                className={NavBarStyle.loginpage_BoxContent_InputTag}
                onChange={(e) => handleChange(e, "confirmNewPassword")}
                required
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
              onClick={() => handleChangePassword()}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChnagePassword;
