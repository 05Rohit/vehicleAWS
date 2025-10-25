import React from "react";
import CustomStyle from "./NotFoundPage.module.css";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className={CustomStyle.notfound_body}>
      <div className={`${CustomStyle.shape} ${CustomStyle.shape1}`}></div>
      <div className={`${CustomStyle.shape} ${CustomStyle.shape2}`}></div>
      <div className={`${CustomStyle.shape} ${CustomStyle.shape3}`}></div>
      <div className={`${CustomStyle.shape} ${CustomStyle.shape4}`}></div>

      <div className={CustomStyle.container}>
        <div className={CustomStyle.error_code}>404</div>
        <h1 className={CustomStyle.error_message}>Oops! Page Not Found</h1>
        <p className={CustomStyle.error_description}>
          The page you're looking for seems to have wandered off. Let's get you
          back on track!
        </p>
        <Link to="/" className={CustomStyle.btn_home}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
