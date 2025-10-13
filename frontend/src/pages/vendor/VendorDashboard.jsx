import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    foodname: "",
    description: "",
    category: "",
    price: "",
    ingredients: "",
    profileImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [profileData, setProfileData] = useState({
    restaurantName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    hours: "",
    Cuisine: "",
    deliveryarea: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchAvailableDeliveries();
    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const vendorRes = await Api.get("/vendorprofile");
      setVendor(vendorRes.data.vendor);
      setProfileData({
        restaurantName: vendorRes.data.vendor.restaurantName || "",
        email: vendorRes.data.vendor.email || "",
        phone: vendorRes.data.vendor.phone || "",
        address: vendorRes.data.vendor.address || "",
        description: vendorRes.data.vendor.description || "",
        hours: vendorRes.data.vendor.hours || "",
        Cuisine: vendorRes.data.vendor.Cuisine || "",
        deliveryarea: vendorRes.data.vendor.deliveryarea || "",
      });
      const ordersRes = await Api.get("/vendororders");
      setOrders(ordersRes.data.orders);
      const menuRes = await Api.get("/vendormenu");
      setMenuItems(menuRes.data.menu);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard ", error);
      alert("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const fetchAvailableDeliveries = async () => {
    try {
      const res = await Api.get("/availabledeliveries");
      setAvailableDeliveries(res.data.deliveries || []);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
    }
  };

  const handleUpdateMenu = async (itemId, updatedData) => {
    try {
      await Api.put(`/updatemenu/${itemId}`, updatedData);
      fetchDashboardData();
      alert("Menu item updated successfully!");
    } catch (error) {
      error("Error updating menu item:", error);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await Api.put(`/updatestatus/${orderId}`, { status: newStatus });
      const ordersRes = await Api.get("/vendororders");
      setOrders(ordersRes.data.orders);
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(
        "Failed to update order status: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  //Direct assignment from rider card
  const handleAssignFromRiderCard = async (deliveryId, orderId) => {
    if (!deliveryId || !orderId) return;
    try {
      setAssigningOrderId(orderId);
      await Api.post("/assignorder", {
        orderId,
        deliveryId,
      });
      const ordersRes = await Api.get("/vendororders");
      setOrders(ordersRes.data.orders);
      alert("Order assigned successfully!");
    } catch (error) {
      console.error("Assign order error:", error);
      const message =
        error.response?.data?.message ||
        "Failed to assign order to delivery rider";
      alert(message);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleAssignOrder = async (orderId) => {
    if (!selectedDeliveryId) {
      alert("Please select a delivery rider");
      return;
    }
    try {
      setAssigningOrderId(orderId);
      await Api.post("/assignorder", {
        orderId,
        deliveryId: selectedDeliveryId,
      });
      const ordersRes = await Api.get("/vendororders");
      setOrders(ordersRes.data.orders);
      alert("Order assigned successfully!");
      setSelectedDeliveryId("");
    } catch (error) {
      console.error("Assign order error:", error);
      const message =
        error.response?.data?.message ||
        "Failed to assign order to delivery rider";
      alert(message);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vendorId");
    localStorage.removeItem("vendorEmail");
    navigate("/vendor/login");
  };

  const handleDeleteOrder = async (orderId) =>{
    try {
      await Api.delete(`/deleteorder/${orderId}`);
      const ordersRes = await Api.get("/vendororders");
      setOrders(ordersRes.data.orders);
      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Error deleting order:", error);  
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      inprogress: "bg-orange-100 text-orange-800",
      ready: "bg-purple-100 text-purple-800",
      assigned: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-600",
      delivered: "bg-green-100 text-green-600", 
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const calculateTotalEarnings = () => {
    return orders
      .filter(
        (order) => order.status === "completed" || order.status === "delivered"
      )
      .reduce((total, order) => total + ((order.totalamount || 0) - (order.deliveryShare || 0)), 0);
  };

  const calculatePendingOrders = () => {
    return orders.filter((order) =>
      ["pending", "paid", "inprogress", "assigned"].includes(order.status)
    ).length;
  };

  // Menu Modal Handlers
  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingItemId(null);
    setFormData({
      foodname: "",
      description: "",
      category: "",
      price: "",
      ingredients: "",
      profileImage: null,
    });
    setPreview(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingItemId(null);
    setPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodname || !formData.price || !formData.category) {
      alert("Food name, price, and category are required");
      return;
    }
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return;
    }
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("foodname", formData.foodname);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", parseFloat(formData.price) * 100);
      formDataToSend.append("ingredients", formData.ingredients);
      if (!isEditing) {
        formDataToSend.append("vendor", vendor?._id);
      }
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }
      if (isEditing) {
        await Api.put(`/updatemenu/${editingItemId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Menu item updated successfully!");
      } else {
        await Api.post("/createmenu", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Menu item created successfully!");
      }
      closeModal();
      fetchDashboardData();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile Modal Handlers
  const openProfileModal = () => {
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
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
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (profileData[key]) formData.append(key, profileData[key]);
      });
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      await Api.put("/updatevendor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Profile updated successfully!");
      closeProfileModal();
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeProfileModal();
      }
    };
    if (isModalOpen || profileModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, profileModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                  placeholder="Search orders, menu items..."
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
                  {vendor?.profileImage ? (
                    <img
                      src={vendor.profileImage}
                      alt={vendor.restaurantName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {vendor?.restaurantName?.charAt(0) || "V"}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {vendor?.restaurantName || "Vendor"}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {vendor?.restaurantName}
                      </p>
                      <p className="text-sm text-gray-500">{vendor?.email}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  ${((calculateTotalEarnings() || 0) / 100).toFixed(2)}
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
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculatePendingOrders()}
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Orders
            </button>
            <button
              onClick={() => setActiveTab("riders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "riders"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Delivery Riders
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "menu"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "earnings"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Earnings Details
            </button>
          </nav>
        </div>
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order._id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.buyer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.items?.map((item) => item.name).join(", ") ||
                            "No items"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${((order.totalamount || 0) / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.delivery?.name || "Not assigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.status !== "completed" &&
                            order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <div className="flex flex-wrap gap-1">
                                {order.status === "pending" && (
                                  <>
                                    {/* <button
                                      onClick={() =>
                                        handleAssignOrder(order._id)
                                        
                                      }
                                      className="text-green-600 hover:text-green-900 text-xs">
                                      Assign to Rider
                                    </button> */}
                                    <button
                                      onClick={() =>
                                        handleOrderStatusUpdate(
                                          order._id,
                                          "cancelled"
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900 text-xs ml-2">
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {order.status === "paid" && (
                                  <button
                                    onClick={() =>
                                      handleOrderStatusUpdate(
                                        order._id,
                                        "completed"
                                      )
                                    }
                                    className="text-purple-600 hover:text-purple-900 text-xs">
                                    Mark as Completed
                                  </button>
                                )}
                              </div>
                            )}
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}  className="text-red-600 hover:text-red-900 text-xs">
                                  Delete order
                                </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Riders Tab */}
        {activeTab === "riders" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Available Delivery Riders
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign **pending** orders to available riders
              </p>
            </div>
            {availableDeliveries.length === 0 ? (
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-gray-600">No available riders found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Riders will appear here when they set their status to
                  "available"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {availableDeliveries.map((delivery) => (
                  <div
                    key={delivery._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {delivery.profileImage ? (
                        <img
                          src={delivery.profileImage}
                          alt={delivery.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {delivery.name?.charAt(0) || "D"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {delivery.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-gray-600 text-sm ml-1">
                            {delivery.rating || 0} ({delivery.reviews || 0}{" "}
                            reviews)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Earnings: ${delivery.earnings || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Order
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        defaultValue=""
                        onChange={(e) => {
                          const orderId = e.target.value;
                          if (orderId) {
                            //Pass both IDs directly
                            handleAssignFromRiderCard(delivery._id, orderId);
                          }
                        }}>
                        <option value="">Select a paid order</option>
                        {/*Filter by "pending" */}
                        {orders
                          .filter((order) => order.status === "paid")
                          .map((order) => (
                            <option key={order._id} value={order._id}>
                              Order #{order._id.substring(0, 6)} - $
                              {(order.totalamount / 100).toFixed(2)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Menu Items</h2>
              <button
                onClick={openModal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {menuItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    No menu items found. Add your first item!
                  </p>
                </div>
              ) : (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.foodname}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          ${((item.price || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingItemId(item._id);
                            setFormData({
                              foodname: item.foodname,
                              description: item.description,
                              category: item.category,
                              price: (item.price / 100).toString(),
                              ingredients: item.ingredients,
                              profileImage: null,
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this menu item?"
                              )
                            ) {
                              try {
                                await Api.delete(`/deletemenu/${item._id}`);
                                fetchDashboardData();
                              } catch (error) {
                                console.error(
                                  "Error deleting menu item:",
                                  error
                                );
                                alert("Failed to delete menu item");
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Earnings Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                View all completed orders and earnings
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.filter((order) =>
                    ["completed", "delivered"].includes(order.status)
                  ).length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500">
                        No completed orders yet
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter((order) =>
                        ["completed", "delivered"].includes(order.status)
                      )
                      .map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.buyer?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.items
                              ?.map((item) => `${item.name} (${item.quantity})`)
                              .join(", ") || "No items"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            +${((order.totalamount || 0) / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total Earnings:
                </span>
                <span className="text-xl font-bold text-green-600">
                  ${((calculateTotalEarnings() || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button
                onClick={closeModal}
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
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  name="foodname"
                  value={formData.foodname}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Enter food name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., Main Course, Dessert, Drinks"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Describe your food item"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="List main ingredients"
                  rows="2"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                    className="cursor-pointer flex flex-col items-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
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
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Saving...
                    </>
                  ) : (
                    "Save Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
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
            <form onSubmit={handleProfileSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={profileData.restaurantName}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={profileData.description}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="text"
                  name="hours"
                  value={profileData.hours}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., 9AM-10PM"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine
                </label>
                <input
                  type="text"
                  name="Cuisine"
                  value={profileData.Cuisine}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Area
                </label>
                <input
                  type="text"
                  name="deliveryarea"
                  value={profileData.deliveryarea}
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
                    ) : vendor?.profileImage ? (
                      <img
                        src={vendor.profileImage}
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
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
