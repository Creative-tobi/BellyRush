import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";
import Navbar from "../../component/Navbar";

const DeliveryDashboard = () => {
  const [delivery, setDelivery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("offline");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const profileRes = await Api.get("/delivery/profile");
      setDelivery(profileRes.data.delivery);
      setStatus(profileRes.data.delivery.status || "offline");

      // Note: Your delivery controller doesn't have a get orders endpoint
      // You might need to add this to your backend
      setOrders([]); // Placeholder

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await Api.put("/delivery/updatestatus", {
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
    if (!location.trim()) {
      alert("Please enter your current location");
      return;
    }

    try {
      await Api.put("/delivery/updatelocation", {
        currentLocation: location,
      });

      alert("Location updated successfully!");
      setLocation("");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("deliveryId");
    localStorage.removeItem("deliveryEmail");
    navigate("/delivery/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {delivery?.name}!
                </h1>
                <p className="mt-1 text-gray-600">
                  Manage your delivery operations
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex gap-4">
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

          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Orders
            </h2>
            {orders.length === 0 ? (
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
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Order #{order._id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.deliveryaddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Contact: {order.contact}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(order.totalamount / 100).toFixed(2)}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(
                            order.status
                          )}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        View Details
                      </button>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryDashboard;
