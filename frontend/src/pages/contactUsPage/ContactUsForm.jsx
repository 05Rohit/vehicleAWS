import React, { useState } from "react";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import ButtonStyle from "../../Css/button.module.css";
import CustomStyle from "../../comoponent/loginPage/CustomLogin.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import {  User, Mail, Send} from "lucide-react";
import api from "../../axiosInterceptors/AxiosSetup";

const ContactUsForm = () => {
  const { handleShowToast } = useToast();

  const [values, setvalues] = useState({
    email: "",
    name: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setvalues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${Server_API}/ContactUs`, values, {
        withCredentials: true,
      });
      handleShowToast("success", "Query sent successfully");
      setvalues({
        email: "",
        name: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      handleShowToast("danger", "Failed to send query");
    }
  };

  return (
    <>


      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.card_header}>
          <div className={`${CustomStyle.avatar} ${CustomStyle.blue}`}>
            <User className={CustomStyle.icon_white} />
          </div>
          <h1>Contact Us</h1>
          <p style={{ width: "90%", margin: "auto", paddingTop: "0.5rem" }}>
            We would love to hear from you! Please fill out the form below and
            we will get back to you as soon as possible.
          </p>
        </div>

        <div className={FormStyles.form}>
          <div className={FormStyles.form_group}>
            <label htmlFor="email">
              Your Email <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Mail className={FormStyles.icon_input} />
              <input
                id="email"
                type="email"
                placeholder="Your Email"
                name="email"
                required
                value={values.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={FormStyles.form_group}>
            <label htmlFor="name">
              Your Name <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <User className={FormStyles.icon_input} />
              <input
                id="name"
                type="text"
                placeholder="Your name"
                name="name"
                required
                value={values.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={FormStyles.form_group}>
            <label htmlFor="message">
              Message <span>*</span>
            </label>
            <div className={FormStyles.input_wrapper}>
              <Send className={FormStyles.icon_input} />
              <input
                id="message"
                placeholder="Your Message"
                name="message"
                required
                value={values.message}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div
            className={`${ButtonStyle.Button_Container} ${CustomStyle.button} `}
          >
            <button
              className={ButtonStyle.Button_Container_content}
              onClick={handleSubmitForm}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsForm;
