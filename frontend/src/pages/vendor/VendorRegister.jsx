import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const VendorRegister = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: null,
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
      // use FormData because we are sending file
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("profileImage", data.profileImage);

      const res = await Api.post("/registervendor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Vendor registration", res.data);
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.Vendor?._id)
        localStorage.setItem("vendorId", res.data.vendor._id);
      if (res.data.Vendor?.email)
        localStorage.setItem("vendorEmail", res.data.vendor.email);
      if (res.data.Vendor?.OTP)
        localStorage.setItem("vendorOTP", res.data.vendor.OTP);

      alert("Registration successful! Please verify your email.");
      navigate("/vendor/login");
    } catch (error) {
      error.response && alert(error.response.data.message);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <div>
          <form
            className="bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleRegister}
            encType="multipart/form-data">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Vendor Register
            </h2>

            {/* Upload section */}
            <div className="mb-4 text-center">
              {/* hidden input */}
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* clickable upload area */}
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
                      Upload Image
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition duration-300">
              Register
            </button>

            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
                className="text-green-400 hover:underline">
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
