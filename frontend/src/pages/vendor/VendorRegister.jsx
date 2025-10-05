import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const VendorRegister = () => {
  const [data, setData] = useState({
    restaurantName: "", // Changed from "name" to match backend
    email: "",
    password: "",
    profileImage: null,
    phone: "",
    address: "",
    description: "",
    hours: "",
    deliveryarea: "",
    Cuisine: "",
  });

  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData({ ...data, profileImage: file });
      setPreview(URL.createObjectURL(file)); // preview URL
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      const requiredFields = [
        "restaurantName",
        "email",
        "password",
        "phone",
        "address",
      ];
      const missingFields = requiredFields.filter((field) => !data[field]);

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // use FormData because we are sending file
      const formData = new FormData();
      formData.append("restaurantName", data.restaurantName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("address", data.address);

      // Optional fields
      if (data.description) formData.append("description", data.description);
      if (data.hours) formData.append("hours", data.hours);
      if (data.deliveryarea) formData.append("deliveryarea", data.deliveryarea);
      if (data.Cuisine) formData.append("Cuisine", data.Cuisine);

      // Profile image (only if selected)
      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const res = await Api.post("/registervendor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Vendor registration", res.data);

      // Fixed: accessing 'vendor' property (not 'Vendor')
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.vendor?._id)
        localStorage.setItem("vendorId", res.data.vendor._id);
      if (res.data.vendor?.email)
        localStorage.setItem("vendorEmail", res.data.vendor.email);
      if (res.data.vendor?.OTP)
        localStorage.setItem("vendorOTP", res.data.vendor.OTP);

      alert(
        "Registration successful! Please check your email for OTP verification."
      );
      navigate("/vendor/otp");
    } catch (error) {
      // Improved error handling
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
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl">
          <form
            className="bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleRegister}
            encType="multipart/form-data">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Vendor Register
            </h2>

            {/* Upload section */}
            <div className="mb-6 text-center">
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
                      Upload Logo
                    </span>
                  </>
                )}
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Restaurant Name */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurantName"
                value={data.restaurantName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your restaurant name"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email *</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={data.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Address *</label>
              <input
                type="text"
                name="address"
                value={data.address}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your restaurant address"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Password *</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter a strong password (min 6 characters)"
                minLength="6"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Tell us about your restaurant"
                rows="3"
              />
            </div>

            {/* Hours */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Business Hours</label>
              <input
                type="text"
                name="hours"
                value={data.hours}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g., Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-10PM"
              />
            </div>

            {/* Cuisine */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Cuisine Type</label>
              <input
                type="text"
                name="Cuisine"
                value={data.Cuisine}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g., Italian, Mexican, Chinese"
              />
            </div>

            {/* Delivery Area */}
            <div className="mb-6">
              <label className="block mb-1 font-medium">Delivery Area</label>
              <input
                type="text"
                name="deliveryarea"
                value={data.deliveryarea}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Areas you deliver to"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-500 transition duration-300 font-medium">
              Register as Vendor
            </button>

            <p className="mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
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

export default VendorRegister;
