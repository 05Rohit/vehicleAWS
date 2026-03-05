// // ...existing code...
import axios from "axios";
import { Server_API } from "../APIPoints/AllApiPonts";
import { loaderHandler } from "../ContextApi/LoaderHandler";

// const api = axios.create({
//   baseURL: Server_API,
//   withCredentials: true, // Must be true for cookies (refresh_token)
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.request.use(
//   (config) => {
//     loaderHandler.showLoader();

//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.accessToken) {
//       config.headers.Authorization = `Bearer ${user.accessToken}`;
//     }

//     return config;
//   },
//   (error) => {
//     loaderHandler.hideLoader();
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => {
//     loaderHandler.hideLoader();
//     return response;
//   },
//   async (error) => {
//     loaderHandler.hideLoader();
//     const originalRequest = error.config;
//     const status = error?.response?.status;

//     if (status === 401 && !originalRequest._retry) {
//       // ▶️ Prevent infinite retry loop
//       originalRequest._retry = true;

//       // ▶️ If already refreshing, queue requests
//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         const response = await axios.post(
//           `${Server_API}/refresh-token`,
//           {},
//           { withCredentials: true }
//         );

//         const newAccessToken = response.data?.accessToken;

//         // Update localStorage
//         const user = JSON.parse(localStorage.getItem("user"));
//         user.accessToken = newAccessToken;
//         localStorage.setItem("user", JSON.stringify(user));

//         // Process queued requests
//         processQueue(null, newAccessToken);

//         // Retry the failed request
//         return api(originalRequest);
//       } catch (err) {
//         processQueue(err, null);

//         // Refresh token also expired → Logout
//         localStorage.removeItem("user");
//         sessionStorage.clear();
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

const api = axios.create({
  baseURL: Server_API,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    loaderHandler.showLoader();
    return config;
  },
  (error) => {
    loaderHandler.hideLoader();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    loaderHandler.hideLoader();
    return res;
  },
  async (error) => {
    loaderHandler.hideLoader();

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
       const res= await axios.post(
          `${Server_API}/refresh-token`,
          {},
          { withCredentials: true }
        );
        console.log("Refresh token response:", res);

        processQueue(null, true);

        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token error:", err);
        processQueue(err, null);
        localStorage.removeItem("persist:login");
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }

      // try {
      //   const res = await axios.post(`${Server_API}/refresh-token`, {}, { withCredentials: true });
      //   const newToken = res.data?.accessToken;

      //   const user = JSON.parse(localStorage.getItem("user"));
      //   user.accessToken = newToken;
      //   localStorage.setItem("user", JSON.stringify(user));

      //   processQueue(null, newToken);

      //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //   return api(originalRequest);
      // } catch (err) {
      //   processQueue(err, null);
      //   localStorage.removeItem("user");
      //   sessionStorage.clear();
      //   window.location.href = "/login";
      //   return Promise.reject(err);
      // } finally {
      //   isRefreshing = false;
      // }
    }

    return Promise.reject(error);
  }
);

export default api;
