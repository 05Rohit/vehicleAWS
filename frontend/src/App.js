// import { BrowserRouter } from "react-router-dom";
// import "./App.css";
// import Layout from "./comoponent/layout/Layout";
// import { ToastProvider } from "./ContextApi/ToastContext";
// // import { SocketProvider } from "./ContextApi/NotificationContentAPI";

// import { disableReactDevTools } from "@fvilers/disable-react-devtools";
// //       setLoading(false);

// if (process.env.App_ENV === "production") {
//   disableReactDevTools();
// }

// function App() {
//   return (
//     <>
//       <ToastProvider>
//         {/* <SocketProvider userData={userData}> */}
//           <BrowserRouter>
//             <Layout />
//           </BrowserRouter>
//         {/* </SocketProvider> */}
//       </ToastProvider>
//     </>
//   );
// }

// export default App;



import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Layout from "./comoponent/layout/Layout";
import { ToastProvider } from "./ContextApi/ToastContext";
import { LoaderProvider, useLoader } from "./ContextApi/LoaderContext";
import { loaderHandler } from "./ContextApi/LoaderHandler";
import Preloader from "./preLoader/Preloader.jsx";  // your animated loader component
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { useEffect } from "react";

if (process.env.App_ENV === "production") {
  disableReactDevTools();
}

const LoaderBridge = () => {
  const { showLoader, hideLoader, isLoading } = useLoader();

  // Connect React context to loaderHandler
  useEffect(() => {
    loaderHandler.showLoader = showLoader;
    loaderHandler.hideLoader = hideLoader;
  }, [showLoader, hideLoader]);

  return (
    <>
      {isLoading && <Preloader />} {/* Loader visible when any API runs */}
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </>
  );
};

function App() {
  return (
    <ToastProvider>
      <LoaderProvider>
        <LoaderBridge />
      </LoaderProvider>
    </ToastProvider>
  );
}

export default App;
