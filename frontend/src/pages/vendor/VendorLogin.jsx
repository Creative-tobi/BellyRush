import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const VendorLogin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!data.email || !data.password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await Api.post("/vendorlogin", data);
      console.log("Vendor login", res.data);

      
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.vendor?._id)
        localStorage.setItem("vendorId", res.data.vendor._id);
      if (res.data.vendor?.email)
        localStorage.setItem("vendorEmail", res.data.vendor.email);

      
      localStorage.removeItem("vendorOTP");

      alert("Login successful!");
      navigate("/vendor/dashboard"); 
    } catch (error) {
     
      let errorMessage = "An error occurred during login";

      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else {
        errorMessage = error.message || "An unknown error occurred";
      }

      alert(errorMessage);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md">
          <form
            className="bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Vendor Login
            </h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-400 text-white py-3 px-4 rounded-lg hover:bg-green-500 transition-colors font-medium shadow-md hover:shadow-lg">
              Login
            </button>

            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/vendor/register"
                className="text-green-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default VendorLogin;
