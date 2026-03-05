import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { store, persist } from "./appRedux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persist}>
      <App />
    </PersistGate>
  </Provider>
);
