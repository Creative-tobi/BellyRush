import { useState } from 'react'
import './App.css'
import videopreview from '/src/media/video_preview.mp4'
import Homepage from './Homepage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorOTP from './pages/vendor/VendorOTP';
import VendorDashboard from './pages/vendor/VendorDashboard';
import DeliveryRegistry from './pages/deliveryMan/DeliveryRegistry';
// import DeliveryLogin from "./pages/deliveryMan/DeliveryLogin";
import DeliveryOTP from './pages/deliveryMan/DeliveryOTP';
import DeliveryDashboard from './pages/deliveryMan/DeliveryDashboard';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerOTP from './pages/customer/CustomerOTP';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PaymentSuccess from './pages/customer/PaymentSuccess';
import AdminRegister from './pages/admin/AdminRegister';
import AdminOTP from './pages/admin/AdminOTP';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Navbar from './component/Navbar';
import DeliveryLogin from './pages/deliveryMan/DeliveryLogin';

function App() {

  return (
    <>
      {/* <Navbar/> */}
      <BrowserRouter>
        <Routes>
          {/* vendor account create */}
          <Route path="/" element={<Homepage />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/otp" element={<VendorOTP />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/menu/create" element={<VendorDashboard/>}/>

          {/* Delivery man account create */}
          <Route path="/delivery/register" element={<DeliveryRegistry />} />
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/otp" element={<DeliveryOTP />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          {/* Customer account create */}
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/otp" element={<CustomerOTP />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/success" element={<PaymentSuccess />} />

          {/* Admin account create */}
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/otp" element={<AdminOTP />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
