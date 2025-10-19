import React, { useState } from "react";
import NavBarStyle from "../navBar/NavBar.module.css";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";

import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";

import CustomStyle from "../loginPage/CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";
import api from "../../axiosInterceptors/AxiosSetup";

const SignInPage = () => {
  const { handleShowToast } = useToast();

  // ✅ Receiving the function as a prop
  const [value, setValue] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    drivingLicNumber: "",
    userType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handlesignUpChanges = (e, category) => {
    let { value } = e.target;
    if (category === "phoneNumber") {
      value = value.replace(/\D/g, ""); // Only digits
      value = value.slice(0, 10); // Limit to 10 characters
    }
    setValue((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSignup = async () => {
    if (!value.name || !value.email || !value.password) {
      return handleShowToast("danger", "Please fill all required fields");
    }

    if (value.password !== value.confirmPassword) {
      return handleShowToast("danger", "Passwords do not match");
    }

    try {
      await api.post(
        `${Server_API}/createuser`,
        {
          name: value.name,
          email: value.email,
          password: value.password,
          confirmPassword: value.confirmPassword,
          phoneNumber: value.phoneNumber,
          drivingLicNumber: "",
          userType: "user",
        },
        { withCredentials: true }
      );

      setValue({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        drivingLicNumber: "",
        userType: "",
      });
      handleShowToast("success", "Account Successfully created");
    } catch (error) {
      // console.error("Error:", );
      const ErrorMsg = error?.response?.data?.error;
      handleShowToast("success", ErrorMsg || "Login failed. Try again.");
    }
  };

  return (
    <>
      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.card_header}>
          <div className={`${CustomStyle.avatar} ${CustomStyle.purple}`}>
            <User className={CustomStyle.icon_white} />
          </div>
          <h1>Create Account</h1>
          <p>Sign up for Go Gear account</p>
        </div>
        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            <label htmlFor="name">
              Name <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <User className={FormStyles.icon_input} />
              <input
                name="name"
                id="name"
                type="text"
                value={value.name}
                onChange={(e) => handlesignUpChanges(e, "name")}
              />
            </div>
          </div>

          <div className={FormStyles.form_group}>
            <label htmlFor="email">
              Email <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Mail className={FormStyles.icon_input} />
              <input
                name="email"
                id="email"
                type="text"
                value={value.email}
                onChange={(e) => handlesignUpChanges(e, "email")}
              />
            </div>
          </div>

          <div className={FormStyles.form_group}>
            <label>
              Phone Number <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Phone className={FormStyles.icon_input} />
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={value.phoneNumber}
                onChange={(e) => handlesignUpChanges(e, "phoneNumber")}
              />
            </div>
          </div>

          <div className={FormStyles.form_group}>
            <label>
              Password <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                value={value.password}
                onChange={(e) => handlesignUpChanges(e, "password")}
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
            <label>
              Confirm Password <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Lock className={FormStyles.icon_input} />
              <input
                name="confirmPassword"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={value.confirmPassword}
                onChange={(e) => handlesignUpChanges(e, "confirmPassword")}
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
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </div>
          <div className={NavBarStyle.loginpage_BoxContent}>
            <p className={CustomStyle.switch_link}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={CustomStyle.link_btn}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
