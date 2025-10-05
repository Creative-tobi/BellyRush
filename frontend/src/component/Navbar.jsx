import React from "react";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
              BellyRush
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/customer/login")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2">
              <CgProfile /> Log in
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
