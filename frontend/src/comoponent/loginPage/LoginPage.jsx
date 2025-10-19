import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import CustomStyle from "./CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";

import { useNavigate } from "react-router-dom";
import { useToast } from "../../ContextApi/ToastContext";

const LoginPage = ({ handleLogin }) => {
  const { handleShowToast } = useToast();

  const [loginValue, setLoginValue] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigate();

  const handleChange = (e, category) => {
    const { value } = e.target;
    setLoginValue((prevState) => ({
      ...prevState,
      [category]: value,
    }));
  };

  const handleLoginClick = async () => {
    if (!loginValue.userId || !loginValue.password) {
      handleShowToast("danger", "Please fill all the fields");
      return;
    }
    const result = await handleLogin(loginValue);

    if (result.success) {
      navigation("/");
    }
  };
  const handleNavigate = () => {
    navigation("/forgotpassword");
  };

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

          <div className={CustomStyle.forgot_password}>
            <button onClick={handleNavigate}>Forgot Password ?</button>
          </div>
          <div
            className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
          >
            <button
              className={ButtonStyle.Button_Container_content}
              onClick={handleLoginClick}
            >
              Login
            </button>
          </div>

          <p className={CustomStyle.switch_link}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigation("/signup")}
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

