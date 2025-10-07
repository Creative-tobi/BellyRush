// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { CgProfile } from "react-icons/cg";

// const AdminNavbar = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("adminId");
//     localStorage.removeItem("adminEmail");
//     navigate("/admin/login");
//   };

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Link to="/admin/dashboard" className="text-2xl font-bold text-green-600">
//               BellyRush Admin
//             </Link>
//           </div>

//           {/* Navigation Links */}
//           <nav className="hidden md:flex space-x-8">
//             <Link
//               to="/admin/dashboard"
//               className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               Dashboard
//             </Link>
//             <Link
//               to="/admin/vendors"
//               className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               Vendors
//             </Link>
//             <Link
//               to="/admin/buyers"
//               className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               Buyers
//             </Link>
//             <Link
//               to="/admin/deliveries"
//               className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               Delivery
//             </Link>
//             <Link
//               to="/admin/orders"
//               className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               Orders
//             </Link>
//           </nav>

//           {/* Profile and Logout */}
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center text-gray-700">
//               <CgProfile className="h-5 w-5 mr-2" />
//               <span className="text-sm font-medium">Admin</span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AdminNavbar;
