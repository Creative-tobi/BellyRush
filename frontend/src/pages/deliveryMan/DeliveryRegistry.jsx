import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const DeliveryRegistry = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    currentLocation: "",
    profileImage: null,
  });

  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData({ ...data, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  setLoading(true);

  const handleDeliveryRegister = async (e) => {
    e.preventDefault();

    // Validate required fields (matching your backend requirements)
    const requiredFields = [
      "name",
      "email",
      "password",
      "phone",
      "currentLocation",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("address", data.address);
      formData.append("currentLocation", data.currentLocation);

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const res = await Api.post("/deliveryregister", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Delivery registration", res.data);

      // Fixed: accessing 'delivery' property (not 'Delivery') and corrected typos
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.delivery?._id)
        localStorage.setItem("deliveryId", res.data.delivery._id);
      if (res.data.delivery?.email)
        localStorage.setItem("deliveryEmail", res.data.delivery.email);
      // Note: OTP is handled via email, no need to store in localStorage

      alert(
        "Registration successful! Please check your email for OTP verification."
      );
      navigate("/delivery/otp");
    } catch (error) {
      // Improved error handling - check both 'message' and 'error' properties
      let errorMessage = "An error occurred during registration";

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
      console.error("Registration error:", error);
    }
    finally {
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
            onSubmit={handleDeliveryRegister}
            encType="multipart/form-data">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Delivery Registration
            </h1>

            {/* Upload Profile Image */}
            <div className="mb-6 text-center">
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="profileImage"
                className="w-32 h-32 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-full cursor-pointer hover:bg-green-50 transition group overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 group-hover:text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16V4a2 2 0 012-2h6a2 2 0 012 2v12m-4-4l4 4m0 0l4-4m-4 4V4"
                      />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition">
                      Upload Photo
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={data.name}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={data.email}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={data.phone}
                placeholder="Enter your phone number with country code(+234)"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={data.address}
                placeholder="Enter your address"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
              />
            </div>

            {/* Current Location */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Current Location *
              </label>
              <input
                type="text"
                name="currentLocation"
                value={data.currentLocation}
                placeholder="Enter your current location (e.g., street address, city)"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={data.password}
                placeholder="Enter a strong password (min 6 characters)"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-500 transition duration-300 font-medium">
              Register as Delivery Rider
            </button>

            <p className="mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/delivery/login"
                className="text-green-400 hover:underline font-medium">
                Login
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default DeliveryRegistry;
