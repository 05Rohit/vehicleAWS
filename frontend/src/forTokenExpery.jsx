import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; 

const AutoLogout = ({ onLogout }) => {
  const navigate = useNavigate();

  const autoLogout = () => {
    alert("Session has expired. You have been logged out.");
    Cookies.remove("jwttoken"); 
    onLogout(); 
    navigate("/"); 
  };

  useEffect(() => {
    const token = Cookies.get("jwttoken"); // ✅ Check for cookie

    if (token) {
      const logoutTimer = setTimeout(autoLogout, 60 * 60 * 1000);
      return () => clearTimeout(logoutTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, onLogout]);

  return null; 
};

export default AutoLogout;
