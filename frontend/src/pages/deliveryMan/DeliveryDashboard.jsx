import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";
import { motion, AnimatePresence } from "framer-motion";

const DeliveryDashboard = () => {
  const [delivery, setDelivery] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("offline");
  const [location, setLocation] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);


  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "",
    licensePlate: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchAssignedOrders();

    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await Api.get("/deliveryprofile");
      setDelivery(profileRes.data.delivery);
      setStatus(profileRes.data.delivery.status || "offline");
      setProfileData({
        name: profileRes.data.delivery.name || "",
        email: profileRes.data.delivery.email || "",
        phone: profileRes.data.delivery.phone || "",
        vehicleType: profileRes.data.delivery.vehicleType || "",
        licensePlate: profileRes.data.delivery.licensePlate || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const fetchAssignedOrders = async () => {
    try {
      const res = await Api.get("/getassignorder");
      setAssignedOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch assigned orders:", error);
      alert("Failed to load assigned orders");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await Api.put("/delivery/status", {
        status: newStatus,
        email: delivery.email,
      });
      setStatus(newStatus);
      setDelivery((prev) => ({ ...prev, status: newStatus }));
      alert(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const updateLocation = async () => {
    if (!location || !location.trim()) {
      alert("Please enter your current location");
      return;
    }

    try {
      await Api.put("/updatelocation", {
        currentLocation: location.trim(),
      });

      setDelivery((prev) => ({
        ...prev,
        currentLocation: {
          formattedAddress: location.trim(),
        },
      }));
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update location";
      alert(message);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    try {
      await Api.post("/deliveryorder", { orderId });
      alert("Order marked as delivered!");
      fetchAssignedOrders();
    } catch (error) {
      console.error("Deliver order error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to deliver order";
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("deliveryId");
    localStorage.removeItem("deliveryEmail");
    navigate("/delivery/login");
  };

  // ✅ Profile Modal Handlers (mirroring customer)
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

      const res = await Api.put("/deliveryprofile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDelivery(res.data.delivery);
      setProfileData({
        name: res.data.delivery.name,
        email: res.data.delivery.email,
        phone: res.data.delivery.phone,
        vehicleType: res.data.delivery.vehicleType,
        licensePlate: res.data.delivery.licensePlate,
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

  const getStatusColor = (status) => {
    const statusMap = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      offline: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      pending: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">BellyRush</h1>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders, customers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

            <div className="flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center space-x-2 focus:outline-none">
                  {delivery?.profileImage ? (
                    <img
                      src={delivery.profileImage}
                      alt={delivery.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {delivery?.name?.charAt(0) || "D"}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {delivery?.name || "Delivery"}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {delivery?.name}
                      </p>
                      <p className="text-sm text-gray-500">{delivery?.email}</p>
                    </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${delivery?.earnings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Current Status
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      status
                    )}`}>
                    {status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {delivery?.rating || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Update Your Status
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => updateStatus("available")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                status === "available"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}>
              Available
            </button>
            <button
              onClick={() => updateStatus("busy")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                status === "busy"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}>
              Busy
            </button>
            <button
              onClick={() => updateStatus("offline")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                status === "offline"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              Offline
            </button>
          </div>
        </div>

        {/* Location Update */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Update Your Location
          </h2>
          <div className="flex justify-between gap-4 flex-wrap">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your current address or location"
              className="flex-1 border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={updateLocation}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Update Location
            </button>
          </div>
          {delivery?.currentLocation?.formattedAddress && (
            <p className="mt-2 text-sm text-gray-600">
              Current location: {delivery.currentLocation.formattedAddress}
            </p>
          )}
        </div>

        {/* Assigned Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Assigned Orders
          </h2>
          {assignedOrders.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="mt-2 text-gray-600">
                No orders assigned to you yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Set your status to "Available" to receive order notifications
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order._id.substring(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>From:</strong> {order.vendor?.restaurantName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>To:</strong> {order.deliveryaddress}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Contact:</strong> {order.contact}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(order.totalamount / 100).toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(
                          order.status
                        )}`}>
                        {order.status === "pending"
                          ? "Picked Up"
                          : order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {["assigned", "pending"].includes(order.status) && (
                      <button
                        onClick={() => handleDeliverOrder(order._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Mark as Delivered
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ✅ PROFILE SETTINGS MODAL — IDENTICAL TO CUSTOMER DASHBOARD */}
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
                    readOnly
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
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={profileData.vehicleType}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={profileData.licensePlate}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
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
                      ) : delivery?.profileImage ? (
                        <img
                          src={delivery.profileImage}
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

export default DeliveryDashboard;
