import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import cicken from "/src/media/cicken.jpg";
import delivery from "/src/media/delivey.jpg";
import vendor from "/src/media/vendor.jpg";
import user from "/src/media/buyer.jpg";

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isAddressDirty, setIsAddressDirty] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Profile Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await Api.get("/buyerprofile");
      setCustomer(profileRes.data.buyer);
      setProfileData({
        name: profileRes.data.buyer.name || "",
        email: profileRes.data.buyer.email || "",
        phone: profileRes.data.buyer.phone || "",
        address: profileRes.data.buyer.address || "",
      });

      const vendorsRes = await Api.get("/restaurants");
      setVendors(vendorsRes.data.vendors || []);

      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/customer/login");
      } else {
        alert("Failed to load dashboard data. Please try again.");
      }
      setLoading(false);
    }
  };

  const fetchVendorMenu = useCallback(
    async (vendorId) => {
      try {
        const menuRes = await Api.get(`/getallmenu/${vendorId}`);
        const vendorWithMenu = vendors.find((v) => v._id === vendorId);
        if (vendorWithMenu) {
          setSelectedVendor({
            ...vendorWithMenu,
            menu: menuRes.data.menu || [],
          });
        } else {
          alert("Vendor not found. Please refresh the page.");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        alert("Failed to load menu. Please try again.");
      }
    },
    [vendors]
  );

  const handleAddress = async (newAddress) => {
    if (!newAddress?.trim()) {
      alert("Address cannot be empty.");
      return;
    }
    setIsSavingAddress(true);
    try {
      await Api.put("/updateaddress", { address: newAddress });
      setCustomer((prev) => ({ ...prev, address: newAddress }));
      setIsAddressDirty(false);
      alert("Address updated successfully.");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleAddToCart = async (menuId, vendorId, quantity = 1) => {
    try {
      if (!customer || !customer._id) {
        alert("Please login first");
        return;
      }

      const currentCart = getCurrentCart();
      const isItemInCart = currentCart?.items?.some(
        (item) => item.menuId === menuId
      );

      const deliveryaddress =
        customer.address || "Please update your delivery address in profile";
      const contact =
        customer.phone || "Please update your phone number in profile";

      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(contact.replace(/[^+\d]/g, ""))) {
        alert("Please update your phone number in profile with a valid format");
        return;
      }

      const payload = {
        menuId,
        buyerId: customer._id,
        deliveryaddress,
        contact,
        quantity,
      };

      await Api.post("/createorder", payload);
      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders || []);

      if (isItemInCart) {
        alert("Item already in cart! Quantity increased.");
      } else {
        alert("Item added to cart successfully!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/customer/login");
      } else if (error.response?.status === 400) {
        alert(
          "Validation Error: " + (error.response.data.message || "Invalid data")
        );
      } else if (error.response?.status === 404) {
        alert("Menu item or buyer not found.");
      } else {
        alert("Failed to add item to cart. Please try again later.");
      }
    }
  };

  //Handle Stripe Checkout Redirect
  const handleCheckout = async (orderId) => {
    try {
      const currentCart = orders.find((order) => order._id === orderId);
      if (!currentCart?.deliveryaddress?.trim()) {
        alert("Please update your delivery address in the cart.");
        return;
      }

      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(currentCart.contact.replace(/[^+\d]/g, ""))) {
        alert("Please update your phone number with a valid format.");
        return;
      }

      // Call backend to create Stripe Checkout Session
      const response = await Api.post(`/create-checkout-session/${orderId}`);
      if (response.data?.url) {
        window.location.href = response.data.url; 
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error.response?.data?.error ||
          "Failed to start checkout. Please try again."
      );
    }
  };

  const handleUpdateQuantity = async (orderId, menuId, newQuantity) => {
    if (newQuantity <= 0) return;
    try {
      const payload = { orderId, menuId, quantity: newQuantity };
      await Api.put("/updateitemquantity", payload);
      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders || []);
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = ordersRes.data.orders.find(
          (o) => o._id === orderId
        );
        setSelectedOrder(updatedOrder || null);
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    const initialAddress = order.deliveryaddress || customer?.address || "";
    setAddressInput(initialAddress);
    setIsAddressDirty(false);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  //Open Order History Modal
  const openHistoryModal = () => {
    setIsHistoryModalOpen(true);
    setShowProfileMenu(false);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/customer/login");
  };

  //Profile Modal Handlers
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setShowProfileMenu(false);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (profileData[key]) formData.append(key, profileData[key]);
      });
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const res = await Api.put("/updatebuyer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCustomer(res.data.buyer);
      setProfileData({
        name: res.data.buyer.name,
        email: res.data.buyer.email,
        phone: res.data.buyer.phone,
        address: res.data.buyer.address,
      });
      alert("Profile updated successfully!");
      closeProfileModal();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getCurrentCart = () => {
    return orders.find((order) => order.status === "pending") || null;
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.Cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.menu?.some(
        (item) =>
          item.foodname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">BellyRush</h1>
            </div>
            <div className=" sm:flex-1 sm:max-w-lg sm:mx-4 md:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants, food, or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="relative">
                <button
                  onClick={() => {
                    const cart = getCurrentCart();
                    if (cart) openOrderModal(cart);
                    else alert("Your cart is empty!");
                  }}
                  className="p-2 text-gray-600 hover:text-green-600 relative">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {getCurrentCart()?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCurrentCart().items.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center space-x-2 focus:outline-none">
                  {customer?.profileImage ? (
                    <img
                      src={customer.profileImage}
                      alt={customer.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {customer?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {customer?.name || "User"}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {customer?.name}
                      </p>
                      <p className="text-sm text-gray-500">{customer?.email}</p>
                    </div>
                    {/*Order History */}
                    <button
                      onClick={openHistoryModal}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Order History
                    </button>
                    <button
                      onClick={openProfileModal}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <motion.section
          className=""
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}>
          <div className="flex flex-col md:flex-row justify-center items-center bg-white py-8 px-4 gap-6">
            <div className="text-center md:text-left max-w-2xl">
              <motion.i
                className="bg-black/70 text-white border-2 border-green-200 rounded-xl text-center px-4 py-2 inline-block mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false }}>
                Easy way to order your food 🚴‍♂️
              </motion.i>
              <motion.h1
                className="text-2xl md:text-4xl font-bold py-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false }}>
                Order Healthy and Fresh Food Anytime, Anywhere.
              </motion.h1>
              <motion.p
                className="text-base md:text-lg text-gray-700"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false }}>
                When hunger strikes, BellyRush delivers. Fast, fresh, and
                belly-satisfying.
              </motion.p>
            </div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}>
              <motion.img
                src={cicken}
                alt="Delicious food"
                className="w-40 h-40 md:w-64 md:h-64"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, 360],
                  transition: { duration: 0.5 },
                }}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Vendor Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm
                ? `Search Results for "${searchTerm}"`
                : "Popular Restaurants"}
            </h2>
            <p className="text-gray-600">
              {filteredVendors.length} restaurants found
            </p>
          </div>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No restaurants found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}>
              {filteredVendors.map((vendor) => (
                <motion.div
                  key={vendor._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  onClick={() => fetchVendorMenu(vendor._id)}>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {vendor.profileImage ? (
                          <img
                            src={vendor.profileImage}
                            alt={vendor.restaurantName}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              {vendor.restaurantName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {vendor.restaurantName}
                          </h3>
                          <p className="text-gray-600">
                            {vendor.Cuisine || "Various cuisines"}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400">
                              <FaStar />
                            </span>
                            <span className="text-gray-600 text-sm ml-1">
                              4.5 (120 reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">• 25-35 min</p>
                        <p className="text-gray-600 text-sm">Free delivery</p>
                      </div>
                    </div>
                  </div>
                  {selectedVendor?._id === vendor._id && (
                    <div className="p-6 bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Menu
                      </h4>
                      {selectedVendor.menu?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No menu items available
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {selectedVendor.menu.map((item) => (
                            <div
                              key={item._id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {item.profileImage ? (
                                    <img
                                      src={item.profileImage}
                                      alt={item.foodname}
                                      className="h-12 w-12 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                      <span className="text-gray-500 text-xs">
                                        No image
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 truncate">
                                    {item.foodname}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-green-600">
                                      ${(item.price / 100).toFixed(2)}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(item._id, vendor._id);
                                      }}
                                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* CTA Section */}
        <motion.section
          className="text-center px-4 sm:px-6 lg:px-8 py-16 bg-green-100"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}>
          <motion.p
            className="font-semibold text-green-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}>
            Trust us?
          </motion.p>
          <motion.h1 className="text-3xl md:text-4xl font-bold my-2">
            Let's Do it Together
          </motion.h1>
          <motion.div
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 p-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}>
            {[
              {
                img: delivery,
                title: "Become a Rider",
                text: "Enjoy flexibility, freedom and competitive earnings by delivering through BellyRush.",
                handler: () => navigate("/delivery/register"),
                btnText: "Register as a Rider",
              },
              {
                img: vendor,
                title: "Become a Partner",
                text: "Grow with BellyRush! Our technology and user base can help you boost sales and unlock new opportunities!",
                handler: () => navigate("/vendor/register"),
                btnText: "Register as a Partner",
              },
              {
                img: user,
                title: "Become a User",
                text: "Ready for an exciting new challenge? If you’re ambitious, humble, and love working with others, then we want to hear from you!",
                handler: () => navigate("/customer/register"),
                btnText: "Register as a User",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center max-w-xs"
                whileHover={{ y: -10 }}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <motion.img
                    src={item.img}
                    alt={`option ${index + 1}`}
                    className="py-4 px-4 bg-green-200 w-20 h-20 sm:w-24 sm:h-24 md:w-60 md:h-60 object-cover"
                    style={{ borderRadius: "50% 50% 20% 50%" }}
                  />
                </motion.div>
                <motion.h2 className="text-xl font-bold mt-3">
                  {item.title}
                </motion.h2>
                <motion.p className="text-gray-700 text-sm md:text-base py-2 px-2">
                  {item.text}
                </motion.p>
                <motion.button
                  className="bg-green-950 font-bold p-3 rounded-full text-green-50 w-full max-w-[200px] mt-2"
                  whileHover={{ scale: 1.05, backgroundColor: "#166534" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.handler}>
                  {item.btnText}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="bg-black text-white text-center p-4"
          initial={{ opacity: 1, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}>
          &copy; {new Date().getFullYear()} BellyRush. All rights reserved.
        </motion.footer>
      </main>

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOrderModal}>
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedOrder.status === "pending"
                    ? "Your Cart"
                    : "Order Details"}
                </h2>
                <button
                  onClick={closeOrderModal}
                  className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center mt-1">
                          {selectedOrder.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    selectedOrder._id,
                                    item.menuId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                                -
                              </button>
                              <span className="mx-3 text-sm text-gray-600">
                                Qty: {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    selectedOrder._id,
                                    item.menuId,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                                +
                              </button>
                            </>
                          )}
                          {selectedOrder.status !== "pending" && (
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ${((selectedOrder.totalamount || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium text-gray-900">$2.99</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4">
                    <span>Total:</span>
                    <span>
                      $
                      {(((selectedOrder.totalamount || 0) + 299) / 100).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Restaurant</h4>
                  <p className="text-gray-600">
                    {selectedOrder.vendor?.restaurantName || "N/A"}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Delivery Address
                  </h4>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setIsAddressDirty(
                        e.target.value !==
                          (selectedOrder.deliveryaddress ||
                            customer?.address ||
                            "")
                      );
                    }}
                    className="border border-gray-300 p-2 rounded-md w-full min-h-[44px]"
                  />
                  <button
                    onClick={() => handleAddress(addressInput)}
                    disabled={!isAddressDirty || isSavingAddress}
                    className={`mt-2 px-4 py-2 rounded-lg font-medium min-h-[44px] w-full ${
                      !isAddressDirty || isSavingAddress
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}>
                    {isSavingAddress ? "Saving..." : "Save Address"}
                  </button>
                  <p className="text-gray-600 mt-1">
                    Contact: {selectedOrder.contact || "Phone not provided"}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Status</h4>
                  <p className="text-blue-700 font-medium capitalize">
                    {selectedOrder.status}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeOrderModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium min-h-[44px]">
                  Close
                </button>
                {selectedOrder.status === "pending" && (
                  <button
                    onClick={() => handleCheckout(selectedOrder._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium min-h-[44px]">
                    Checkout
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeHistoryModal}>
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Order History
                </h2>
                <button
                  onClick={closeHistoryModal}
                  className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No orders found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter((order) => order.status !== "pending") // exclude current cart
                      .map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Order #{order._id.slice(-6)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="font-bold text-green-600">
                              ${((order.totalamount || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.name}
                              </span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{order.items.length - 2} more
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeHistoryModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfileModal}>
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-4 sm:p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="profileImageUpload"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImageUpload"
                      className="cursor-pointer flex flex-col items-center">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile Preview"
                          className="w-24 h-24 object-cover rounded-lg mx-auto"
                        />
                      ) : customer?.profileImage ? (
                        <img
                          src={customer.profileImage}
                          alt="Current Profile"
                          className="w-24 h-24 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="mt-2 text-sm text-gray-600">
                            Click to upload image
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeProfileModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;
