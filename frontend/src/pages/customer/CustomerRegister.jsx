import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const CustomerRegister = () => {
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

  // handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData({ ...data, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "email", "password", "phone"];
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
      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      setLoading(true);
      const res = await Api.post("/createbuyer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Buyer registration", res.data);

      // Save authentication token
      if (res.data.token) localStorage.setItem("token", res.data.token);

      // Save complete buyer information to localStorage for dashboard
      if (res.data.buyer) {
        const buyerInfo = {
          _id: res.data.buyer.id,
          name: res.data.buyer.name,
          email: res.data.buyer.email,
          phone: res.data.buyer.phone,
          address: null,
          profileImage: preview,
        };

        localStorage.setItem("customer", JSON.stringify(buyerInfo));
        localStorage.setItem("buyerId", res.data.buyer.id);
        localStorage.setItem("buyerEmail", res.data.buyer.email);
      }

      alert(
        "Registration successful! Please check your email for OTP verification."
      );
      navigate("/customer/otp");
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
              Customer Register
            </h2>

            {/* Upload section */}
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
                className="w-32 h-32 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-full cursor-pointer hover:bg-green-50 hover:border-green-400 transition group overflow-hidden">
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
                placeholder="Enter your phone number with country code(+234)"
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

            {/* Register Button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg transition duration-300 font-medium flex items-center justify-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
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
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>

            {/* Login as Rider / Vendor links */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>
                Register as{" "}
                <Link
                  to="/delivery/register"
                  className="text-green-600 hover:underline font-medium">
                  Rider
                </Link>{" "}
                or{" "}
                <Link
                  to="/vendor/register"
                  className="text-green-600 hover:underline font-medium">
                  Vendor
                </Link>
                ?
              </p>
            </div>

            <p className="mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/customer/login"
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

export default CustomerRegister;
