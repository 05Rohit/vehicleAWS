import React, { useState } from "react";
import { useToast } from "../../ContextApi/ToastContext";
import CustomStyle from "../loginPage/CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";
import { User, Mail} from "lucide-react";

import { Server_API } from "./../../APIPoints/AllApiPonts";
import api from "../../axiosInterceptors/AxiosSetup";
const ForgotPaswswordPage = () => {
  const { handleShowToast } = useToast();

  const [value, setValue] = useState({
    email: "",
  });

  const handleChange = (e, category) => {
    const { value } = e.target;
    setValue((prevState) => ({
      ...prevState,
      [category]: value,
    }));
  };

  const handleForgotPasswordSendEmail = async () => {
    try {
      if (value.email.trim() === "") {
        handleShowToast("danger", "Please provide your email");
        return;
      }

      const response = await api.post(`${Server_API}/forgotPasswordemail`, {
        email: value.email,
      });
      console.log("Forgot password email response:", response.data);
      // if(response.data.success!==true){
      //   handleShowToast("danger", response.data.message || "Failed to send forgot password email");
      //   return;
      // }
      handleShowToast("success", "Forgot password email sent successfully");
    } catch (error) {
      console.error("Error sending forgot password email:", error);
      handleShowToast("danger", "Failed to send forgot password email");
    }
  };

  return (
    <>
      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.card_header}>
          <div className={`${CustomStyle.avatar} ${CustomStyle.blue}`}>
            <User className={CustomStyle.icon_white} />
          </div>
          <h1>Welcome</h1>
          <p>Reset Your Password</p>
        </div>

        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            <label htmlFor="email">Email</label>
            <div className={FormStyles.input_wrapper}>
              <Mail className={FormStyles.icon_input} />

              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your Email"
                value={value.email}
                onChange={(e) => handleChange(e, "email")}
              />
            </div>
          </div>

          <div
            className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
          >
            <button
              className={ButtonStyle.Button_Container_content}
              onClick={handleForgotPasswordSendEmail}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPaswswordPage;
