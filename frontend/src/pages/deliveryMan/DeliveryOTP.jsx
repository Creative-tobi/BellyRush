import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const DeliveryOTP = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      const deliveryId = localStorage.getItem("deliveryId");
      const res = await Api.post("/deliveryotp", { deliveryId, otp });
      console.log("OTP verification", res.data);
      alert("OTP verified successfully!");
      navigate("/delivery/dashboard");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };

  const handleResendOTP = async () => {
    try {
      const deliveryEmail = localStorage.getItem("deliveryEmail");
      const res = await Api.post("/resenddeliveryotp", {
        email: deliveryEmail,
      });
      console.log("Resend OTP", res.data);
      alert("OTP resent successfully! Please check your email.");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };
  return (
    <div>
      <Navbar /> 
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleOTPSubmit}
          className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Enter the OTP sent to your mail
          </h1>
          <label>
            Enter OTP:
            <input
              type="text"
              value={otp}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition duration-300">
            Verify OTP
          </button>
          <p className="mt-4 text-center">
            Didn't receive the OTP?{" "}
            <Link
              to=""
              className="text-green-600 hover:underline"
              onClick={handleResendOTP}>
              Resend OTP
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default DeliveryOTP;
