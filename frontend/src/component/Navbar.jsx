import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CgProfile } from "react-icons/cg";
// import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  return (
    <div>
      <nav className="bg-white flex justify-around md:justify-between z-1 px-6 py-6 sticky top-0 shadow-md">
        <h1 className="text-xl font-montserrat font-bold">
          {" "}
          {/* <Link to="/">BellyRush</Link> */}
          <a href="/">BellyRush</a>
        </h1>
        <button
          className="bg-green-800 rounded-xl text-white py-2 px-6 flex place-items-center gap-2"
          onClick={() => navigate("/customer/login")}>
          <CgProfile /> Log in
        </button>
      </nav>
    </div>
  );
}

export default Navbar
