import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../component/Api";

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    
    // Close profile menu when clicking outside
    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const profileRes = await Api.get("/buyerprofile");
      setCustomer(profileRes.data.buyer);

      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders);

      const menusRes = await Api.get("/getallmenu");
      setOrders(menusRes.data.orders);

      const vendorsRes = await Api.get("/restaurants");
      setVendors(vendorsRes.data.vendors);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching ", error);
      alert("Failed to load data");
      setLoading(false);
    }
  };

  const handleAddToCart = async (menuId, vendorId, quantity = 1) => {
    try {
      const res = await Api.post("/createorder", {
        menuId,
        buyerId: customer?._id,
        deliveryaddress: customer?.address || "Please update your address",
        contact: customer?.phone || "Please update your phone",
        quantity,
      });

      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders);

      alert("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  const handleCheckout = async (orderId) => {
    try {
      // Simple backend-only checkout
      await Api.post("/ordercheckout", {
        orderId: orderId
      });

      // Refresh orders
      const ordersRes = await Api.get("/getorders");
      setOrders(ordersRes.data.orders);
      
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("buyerId");
    localStorage.removeItem("buyerEmail");
    navigate("/customer/login");
  };

  const getCurrentCart = () => {
    return orders.find((order) => order.status === "pending") || null;
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.Cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.menu?.some(item => 
      item.foodname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
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
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">BellyRush</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants, food, or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
              <div className="relative">
                <button 
                  onClick={() => {
                    const cart = getCurrentCart();
                    if (cart) {
                      openOrderModal(cart);
                    } else {
                      alert("Your cart is empty!");
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-green-600 relative"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {getCurrentCart()?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCurrentCart().items.length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {customer?.profileImage ? (
                    <img
                      src={customer.profileImage}
                      alt={customer.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {customer?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-gray-700 font-medium">
                    {customer?.name || 'User'}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                      <p className="text-sm text-gray-500">{customer?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        // Show all orders in modal
                        if (orders.length > 0) {
                          setSelectedOrder(orders[0]); // Show first order
                          setIsOrderModalOpen(true);
                        } else {
                          alert("No orders found!");
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => navigate('/customer/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Order Food Online
            </h2>
            <p className="text-xl opacity-90 mb-6">
              Fast delivery from your favorite restaurants
            </p>
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-full p-1 flex">
                <input
                  type="text"
                  placeholder="Enter delivery address"
                  className="flex-1 px-4 py-3 text-gray-900 rounded-l-full focus:outline-none"
                />
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-r-full font-medium transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurants & Menu Items */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Popular Restaurants'}
            </h2>
            <p className="text-gray-600">
              {filteredVendors.length} restaurants found
            </p>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No restaurants found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredVendors.map((vendor) => (
                <div key={vendor._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Restaurant Header */}
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
                          <h3 className="text-xl font-bold text-gray-900">{vendor.restaurantName}</h3>
                          <p className="text-gray-600">{vendor.Cuisine || 'Various cuisines'}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-gray-600 text-sm ml-1">4.5 (120 reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">• 25-35 min</p>
                        <p className="text-gray-600 text-sm">Free delivery</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Menu</h4>
                    {vendor.menu?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No menu items available</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendor.menu?.map((item) => (
                          <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 truncate">{item.foodname}</h5>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-bold text-green-600">
                                    ${(item.price / 100).toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => handleAddToCart(item._id, vendor._id)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                  >
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
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeOrderModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedOrder.status === 'pending' ? 'Your Cart' : 'Order Details'}
              </h2>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
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
                    ${(((selectedOrder.totalamount || 0) + 299) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Restaurant</h4>
                <p className="text-gray-600">
                  {selectedOrder.vendor?.restaurantName || 'N/A'}
                </p>
              </div>

              {/* Delivery Address */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-gray-600">
                  {selectedOrder.deliveryaddress || 'Address not provided'}
                </p>
                <p className="text-gray-600 mt-1">
                  Contact: {selectedOrder.contact || 'Phone not provided'}
                </p>
              </div>

              {/* Status */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Status</h4>
                <p className="text-blue-700 font-medium capitalize">
                  {selectedOrder.status}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => {
                    handleCheckout(selectedOrder._id);
                    closeOrderModal();
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;