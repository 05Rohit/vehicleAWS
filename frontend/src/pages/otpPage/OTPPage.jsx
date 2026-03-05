import React, { useState, useRef, useEffect } from "react";
// import { Bell, Lock, ArrowRight, Check } from "lucide-react";
import styles from "./otpPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../ContextApi/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtpAndLogin } from "../../appRedux/redux/authSlice/loginSlice";

const OTPPage = () => {
  const { handleShowToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const dispatch = useDispatch();
  const { error, loading, user } = useSelector((state) => state.login);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!userId) {
      handleShowToast("danger", "Something went wrong! Try again.");
      navigate("/login");
    }
  }, [userId]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleSubmit = async () => {
    if (otp.includes("")) {
      return handleShowToast("danger", "Please enter all OTP digits");
    }

    const result = await dispatch(
      verifyOtpAndLogin({
        email: userId,
        otp: Number(otp.join("")),
      }),
    );

    if (verifyOtpAndLogin.fulfilled.match(result)) {
      handleShowToast("success", "OTP verified & logged in successfully");
      navigate("/", { replace: true });
    } else {
      handleShowToast("danger", result.payload || "OTP verification failed");
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Enter OTP</h1>
          <p className={styles.subtitle}>
            We've sent a verification code to your email
          </p>

          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              // <input
              //   key={index}
              //   ref={(el) => (inputRefs.current[index] = el)}
              //   className={`${styles.otpInput}
              //   ${digit ? styles.otpInputFilled : ""}
              //   ${isVerifying || isSuccess ? styles.disabledInput : ""}`}
              //   maxLength={1}
              //   value={digit}
              //   onChange={(e) => handleChange(index, e.target.value)}
              //   onKeyDown={(e) => handleKeyDown(index, e)}
              //   disabled={isVerifying || isSuccess}
              // />
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`${styles.otpInput} ${
                  digit ? styles.otpInputFilled : ""
                } ${loading ? styles.disabledInput : ""}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>

          {/* <button
            onClick={handleSubmit}
            disabled={isVerifying || isSuccess}
            className={`${styles.verifyButton} 
    ${
      isSuccess
        ? styles.verifySuccess
        : isVerifying
          ? styles.verifyDisabled
          : styles.verifyActive
    }`}
          >
            {isSuccess
              ? "Verified Successfully!"
              : isVerifying
                ? "Verifying..."
                : "Verify OTP"}
          </button> */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${styles.verifyButton} ${
              loading ? styles.verifyDisabled : styles.verifyActive
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
