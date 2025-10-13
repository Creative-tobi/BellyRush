import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const CustomerLogin = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!data.email || !data.password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await Api.post("/buyerlogin", data);
      console.log("Buyer login", res.data);

      // Save authentication token
      if (res.data.token) localStorage.setItem("token", res.data.token);

      // Save complete buyer information to localStorage for dashboard
      if (res.data.buyer) {
        const buyerInfo = {
          _id: res.data.buyer.id,
          name: res.data.buyer.name,
          email: res.data.buyer.email,
          phone: null,
          address: null,
          profileImage: null,
        };

        localStorage.setItem("customer", JSON.stringify(buyerInfo));
        localStorage.setItem("buyerId", res.data.buyer.id);
        localStorage.setItem("buyerEmail", res.data.buyer.email);
      }

      localStorage.removeItem("buyerOTP");

      alert("Login successful!");
      navigate("/customer/dashboard");
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
              Customer Login
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
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-400 text-white hover:bg-green-500"
              }`}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Login as Rider / Vendor links */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>
                Login as{" "}
                <Link
                  to="/delivery/login"
                  className="text-green-600 hover:underline font-medium">
                  Rider
                </Link>{" "}
                or{" "}
                <Link
                  to="/vendor/login"
                  className="text-green-600 hover:underline font-medium">
                  Vendor
                </Link>
                ?
              </p>
            </div>

            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/customer/register"
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

export default CustomerLogin;
