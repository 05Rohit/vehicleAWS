import React, { useState, useRef, useEffect } from "react";
import otpPageStyles from "./otpPage.module.css";
const OTPPage = () => {
  const OTP_digit_length = 5;
  const OTP_digits = new Array(OTP_digit_length).fill("");

  const [inputArray, setInputArray] = useState(OTP_digits);
  const handleOnChange = (e, index) => {
    const { value } = e.target;
    if (!isNaN(value)) {
      const newValue = value.slice(-1).trim();
      setInputArray((prev) => {
        const newArray = [...prev];
        newArray[index] = newValue;
        return newArray;
      });
      newValue && refArray.current[index + 1]?.focus();
    }
  };

  const refArray = useRef([]);

  useEffect(() => {
    refArray.current[0]?.focus();
  }, []);

  const handleOnKeyDown = (e, index) => {
    if (!e.target.value && e.key === "Backspace") {
      setInputArray((prev) => {
        const newArray = [...prev];
        newArray[index] = "";

        refArray.current[index - 1]?.focus();
        return newArray;
      });
    }
  };

  return (
    <>
      <div className={otpPageStyles.main_container}>
        <h1 className={otpPageStyles.otp_header}>Enter OTP</h1>

        <div className={otpPageStyles.otp_container}>
          {inputArray.map((digit, index) => {
            return (
              <input
                ref={(digit) => (refArray.current[index] = digit)}
                type="text"
                className={otpPageStyles.otp_input_box}
                key={index}
                value={inputArray[index]}
                onChange={(e) => {
                  handleOnChange(e, index);
                }}
                onKeyDown={(e) => {
                  handleOnKeyDown(e, index);
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default OTPPage;
