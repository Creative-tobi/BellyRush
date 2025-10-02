import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const DeliveryLogin = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  const handleDeliveryLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await Api.post("/deliverylogin", data);
      console.log("Delivery login", res.data);
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.Delivery?._id)
        localStorage.setItem("deliveryId", res.data.delivery._id);
      if (res.data.Delivery?.email)
        localStorage.setItem("deliveryEmail", res.data.delivery.email);
      if (res.data.Delivery?.OTP)
        localStorage.setItem("deliveryOTP", res.data.delivery.OTP);
      alert("Login successful!");
      navigate("/delivery/otp");
      console.log(error);
      
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  }
    return (
      <>
        <Navbar />
        <section className="min-h-screen flex items-center justify-center bg-gray-100">
          <div>
          <form
            className="bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleDeliveryLogin}>
              <h1 className="text-2xl font-bold mb-4 text-center"> Delivery Login</h1>
            <label className="block mb-1 font-medium">Email</label>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={data.email}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={handleChange}
              required
            />
            <label className="block mb-1 font-medium">Password</label>

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={data.password}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors">
              Login
            </button>
            <p className="mt-4 text-center">
              Don't have an account?{" "}
              <Link
                to="/delivery/register"
                className="text-green-600 hover:underline">
                Register here
              </Link>
            </p>
          </form>
          </div>
        </section>
      </>
    );
  };
export default DeliveryLogin;
