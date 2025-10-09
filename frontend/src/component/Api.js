import axios from "axios";

export const BACKEND_BASE_URL = "http://localhost:5000";

const Api = axios.create({
//   baseURL: "https://ticket-ordering.onrender.com/api",
  baseURL: `${BACKEND_BASE_URL}/api`
});

Api.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export default Api;
