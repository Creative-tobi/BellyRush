import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";

const DeliveryDashboard = () => {
  const [delivery, setDelivery] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]); // ✅ Renamed for clarity
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("offline");
  const [location, setLocation] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      await Api.put("/delivery/location", {
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

  // Mark order as delivered
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

  const getStatusColor = (status) => {
    const statusMap = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      offline: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      "picked-up": "bg-purple-100 text-purple-800", // ✅ Added for picked-up
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
                      onClick={() => navigate("/delivery/profile")}
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

        {/* ✅ Assigned Orders Section */}
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
                        {order.status === "picked-up"
                          ? "Picked Up"
                          : order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {/* Only show "Deliver" button for deliverable orders */}
                    {["assigned", "picked-up"].includes(order.status) && (
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
    </div>
  );
};

export default DeliveryDashboard;
