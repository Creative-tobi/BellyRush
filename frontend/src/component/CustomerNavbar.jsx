// import React from "react";
// import { useNavigate } from "react-router-dom";

// const CustomerNavbar = ({
//   customer,
//   orders,
//   searchTerm,
//   setSearchTerm,
//   showProfileMenu,
//   setShowProfileMenu,
//   handleLogout,
//   getCurrentCart,
//   openOrderModal,
// }) => {
//   const navigate = useNavigate();

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <h1 className="text-2xl font-bold text-green-600">BellyRush</h1>
//           </div>

//           <div className="flex-1 max-w-lg mx-8">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search restaurants, food, or cuisines..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               />
//               <svg
//                 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//           </div>

//           <div className="flex items-center space-x-6">
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   const cart = getCurrentCart();
//                   if (cart) {
//                     openOrderModal(cart);
//                   } else {
//                     alert("Your cart is empty!");
//                   }
//                 }}
//                 className="p-2 text-gray-600 hover:text-green-600 relative">
//                 <svg
//                   className="h-6 w-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
//                   />
//                 </svg>
//                 {getCurrentCart()?.items?.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {getCurrentCart().items.length}
//                   </span>
//                 )}
//               </button>
//             </div>

//             <div className="relative">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowProfileMenu(!showProfileMenu);
//                 }}
//                 className="flex items-center space-x-2 focus:outline-none">
//                 {customer?.profileImage ? (
//                   <img
//                     src={customer.profileImage}
//                     alt={customer.name}
//                     className="h-8 w-8 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
//                     <span className="text-white font-medium">
//                       {customer?.name?.charAt(0) || "U"}
//                     </span>
//                   </div>
//                 )}
//                 <span className="hidden md:inline text-gray-700 font-medium">
//                   {customer?.name || "User"}
//                 </span>
//               </button>

//               {showProfileMenu && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                   <div className="px-4 py-2 border-b border-gray-200">
//                     <p className="text-sm font-medium text-gray-900">
//                       {customer?.name}
//                     </p>
//                     <p className="text-sm text-gray-500">{customer?.email}</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       if (orders.length > 0) {
//                         openOrderModal(orders[0]);
//                       } else {
//                         alert("No orders found!");
//                       }
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                     My Orders
//                   </button>
//                   <button
//                     onClick={() => navigate("/customer/profile")}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                     Profile Settings
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default CustomerNavbar;
