import React from "react";
import FooterStyle from "./Footer.module.css";

const Footer = () => {
  return (
    <>
      <footer className={FooterStyle.footer}>
        <p>GoGear - Your trusted vehicle rental partner</p>
        <div className={FooterStyle.footerLinks}>
          <a href="/">About Us</a>
          <a href="/">Privacy Policy</a>
          <a href="/contactus">Contact</a>
          <a href="/">Support</a>
        </div>
      </footer>
    </>
  );
};

export default Footer;
