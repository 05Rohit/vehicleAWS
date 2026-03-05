import React, { useEffect, useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import CustomStyle from "./CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";

import { useNavigate } from "react-router-dom";
import { useToast } from "../../ContextApi/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  resetLoginState,
} from "../../appRedux/redux/authSlice/loginSlice";
import { sendOtpToEmail } from "./../../appRedux/redux/authSlice/loginSlice";

const LoginPage = ({ handleSendOtp }) => {
  const { handleShowToast } = useToast();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithOtp, setLoginWithOtp] = useState(false);

  const [hasTriedLogin, setHasTriedLogin] = useState(false);

  // Redux Store value for Login
  const dispatch = useDispatch();
  const {error,loading,response} = useSelector((state) => state.login);
  const token = useSelector((state) => state.login.response?.token);
  const { otpLoading } = useSelector((state) => state.login);

  useEffect(() => {
    if (hasTriedLogin && error) {
      handleShowToast("danger", error);
    }
     // eslint-disable-next-line
  }, [error, hasTriedLogin]);

  // Handle value Change
  const handleChange = (e, category) => {
    const { value } = e.target;
    setLoginValue((prevState) => ({
      ...prevState,
      [category]: value,
    }));
  };

  // Login Function
  const handleLoginClick = async () => {
    setHasTriedLogin(true);
    if (!loginValue.userId || !loginValue.password) {
      handleShowToast("danger", "Please fill all the fields");
      return;
    }
    const payload = {
      userId: loginValue.userId,
      password: loginValue.password,
    };
    dispatch(loginUser(payload));

  
  };

    useEffect(() => {
    if (response && !error) {
      navigate("/", { replace: true });
    }
     // eslint-disable-next-line
  }, [response, navigate]);

  // Handle OTP send to Email Function
  const handleOTP = async () => {
    if (!loginValue.userId) {
      handleShowToast("danger", "Please Enter Email");
      return;
    }
    try {
      await dispatch(sendOtpToEmail(loginValue.userId)).unwrap();

      navigate("/otp", { state: { userId: loginValue.userId } });
    } catch (error) {
      handleShowToast("danger", error);
    }
  };

  const handleNavigate = () => {
    navigate("/forgotpassword");
  };

  // When We get Login data then navigate to Home Page
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);
  useEffect(() => {
    dispatch(resetLoginState());
  }, [dispatch]);
  return (
    <>
      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.card_header}>
          <div className={`${CustomStyle.avatar} ${CustomStyle.blue}`}>
            <User className={CustomStyle.icon_white} />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your Go Gear account</p>
        </div>

        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            <label htmlFor="userId">
              User Name <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Mail className={FormStyles.icon_input} />
              <input
                type="text"
                name="userId"
                id="userId"
                value={loginValue.userId}
                placeholder="Enter email/phone no"
                onChange={(e) => handleChange(e, "userId")}
              />
            </div>
          </div>

          {loginWithOtp && (
            <div className={FormStyles.form_group}>
              <label>
                Password <span>*</span>
              </label>
              <div className={FormStyles.input_wrapper}>
                <Lock className={FormStyles.icon_input} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  value={loginValue.password}
                  onChange={(e) => handleChange(e, "password")}
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
          )}

          <div className={CustomStyle.forgot_password}>
            <button onClick={handleNavigate}>Forgot Password ?</button>
          </div>
          {loginWithOtp && (
            <div
              className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
            >
              <button
                className={ButtonStyle.Button_Container_content}
                onClick={handleLoginClick}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          )}

          {!loginWithOtp && (
            <div
              className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
            >
              <button
                className={ButtonStyle.Button_Container_content}
                onClick={() => setLoginWithOtp(!loginWithOtp)}
              >
                Login With Password
              </button>
            </div>
          )}

          {loginWithOtp ? (
            <div
              className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
            >
              <button
                className={ButtonStyle.Button_Container_content}
                onClick={() => setLoginWithOtp(false)}
              >
                Login With Otp
              </button>
            </div>
          ) : (
            <div
              className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
            >
              <button
                className={ButtonStyle.Button_Container_content}
                onClick={handleOTP}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          <p className={CustomStyle.switch_link}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className={CustomStyle.link_btn}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
