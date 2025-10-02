import {useNavigate, Link} from "react-router-dom";
import React, {useState} from 'react'
import Api from "../../component/Api"
import Navbar from "../../component/Navbar";

const VendorLogin = () => {
    const [data, setData] = useState({email: "", password: ""})
    const navigate = useNavigate();

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await Api.post("/vendorlogin", data);
            console.log("Vendor login", res.data);
            if (res.data.token) localStorage.setItem("token", res.data.token);
            if (res.data.Vendor?._id) localStorage.setItem("vendorId", res.data.vendor._id);
            if (res.data.Vendor?.email) localStorage.setItem("vendorEmail", res.data.vendor.email);
            if (res.data.Vendor?.OTP) localStorage.setItem("vendorOTP", res.data.vendor.OTP);

            alert("Login successful!");
            navigate("/vendor/otp");
        } catch (error) {
            error.response &&
            alert(error.response.data.message);
        }
    }

  return (
    <>
    <Navbar />
        <section className="min-h-screen flex items-center justify-center bg-gray-100">
            <div>
                <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleLogin}> 
                    <h2 className="text-2xl font-bold mb-4 text-center">Vendor Login</h2>
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
                    <button
                        type="submit"
                        className="w-full bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
                    >   
                        Login
                    </button>
                    <p className="mt-4 text-center">
                        Don't have an account?{" "}
                        <Link to="/vendor/register" className="text-green-600 hover:underline">
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </section>



    </>
  )
}

export default VendorLogin
