import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const CustomerOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    // Validate OTP input
    if (!otp.trim()) {
      alert("Please enter the OTP");
      return;
    }

    if (!/^\d{4}$/.test(otp)) {
      alert("OTP must be a 4-digit number");
      return;
    }

    const buyerEmail = localStorage.getItem("buyerEmail");

    if (!buyerEmail) {
      alert("Email not found. Please login again.");
      navigate("/customer/login");
      return;
    }

    setLoading(true);
    try {
      // Fixed: Send email and OTP (not buyerId) to match your backend
      const res = await Api.post("/buyerotp", { email: buyerEmail, OTP: otp });
      console.log("OTP verification", res.data);

      // Clear OTP-related localStorage items after successful verification
      localStorage.removeItem("buyerOTP");

      alert("OTP verified successfully!");
      navigate("/customer/dashboard");
    } catch (error) {
      // Improved error handling
      let errorMessage = "An error occurred during OTP verification";

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
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault(); // Prevent default link behavior

    const buyerEmail = localStorage.getItem("buyerEmail");

    if (!buyerEmail) {
      alert("Email not found. Please login again.");
      navigate("/customer/login");
      return;
    }

    setResendLoading(true);
    try {
      // Fixed: Use correct endpoint for resend OTP
      const res = await Api.post("/resendbuyerotp", { email: buyerEmail });
      console.log("Resend OTP", res.data);
      alert("OTP resent successfully! Please check your email.");
    } catch (error) {
      // Improved error handling for resend
      let errorMessage = "Failed to resend OTP";

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
      console.error("Resend OTP error:", error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md">
          <form
            className="bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleOTPSubmit}>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Enter the OTP sent to your email
            </h1>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Enter OTP:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Enter 4-digit OTP"
                maxLength="4"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-500 transition duration-300 font-medium shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="mt-6 text-center text-gray-600">
              Didn't receive the OTP?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-green-600 hover:underline font-medium disabled:opacity-70 disabled:cursor-not-allowed">
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CustomerOTP;
