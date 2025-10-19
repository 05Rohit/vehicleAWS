import axios from "axios";
import { Server_API } from "../APIPoints/AllApiPonts";
import { loaderHandler } from "../ContextApi/LoaderHandler";

const api = axios.create({
  baseURL: Server_API,
  withCredentials: true,
});

// Attach interceptors
api.interceptors.request.use(
  (config) => {
    loaderHandler.showLoader();
    return config;
  },
  (error) => {
    loaderHandler.hideLoader();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    loaderHandler.hideLoader();
    return response;
  },
  (error) => {
    loaderHandler.hideLoader();
    return Promise.reject(error);
  }
);

export default api;
