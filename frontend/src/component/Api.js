import axios from "axios";


const Api = axios.create({
    // baseURL: "https://bellyrush.onrender.com/api",
  baseURL: "http://localhost:5000/api",
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
