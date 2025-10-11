import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const AdminRegister = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["name", "email", "password", "phone"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const res = await Api.post("/adminregister", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Admin registration", res.data);

      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.admin?._id)
        localStorage.setItem("adminId", res.data.admin._id);
      if (res.data.admin?.email)
        localStorage.setItem("adminEmail", res.data.admin.email);

      alert(
        "Registration successful! Please check your email for OTP verification."
      );
      navigate("/admin/otp");
    } catch (error) {
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
            onSubmit={handleRegister}
            encType="multipart/form-data">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Admin Register
            </h2>

            {/* Profile Image Upload */}
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
                      Upload Photo
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

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your full name"
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
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email address"
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
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your phone number"
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
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter a strong password (min 6 characters)"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-500 transition duration-300 font-medium">
              Register as Admin
            </button>

            <p className="mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/admin/login"
                className="text-green-400 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default AdminRegister;
