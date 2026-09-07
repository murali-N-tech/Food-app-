/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { OrderNotificationManager } from "./components/OrderNotificationManager";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Profile } from "./pages/Profile";
import { SmartMealPlanner } from "./pages/SmartMealPlanner";
import { RestaurantDetails } from "./pages/RestaurantDetails";
import { Checkout } from "./pages/Checkout";
import { OrderTracking } from "./pages/OrderTracking";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RestaurantDashboard } from "./pages/RestaurantDashboard";
import { DeliveryDashboard } from "./pages/DeliveryDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LocationProvider } from "./context/LocationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Component to conditionally render Navbar
function Layout() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register", "/restaurant-dashboard", "/delivery-dashboard", "/admin-dashboard", "/search"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Toaster />
      <OrderNotificationManager />
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/planner" element={<SmartMealPlanner />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/order/:id" element={<OrderTracking />} />
        
        {/* Protected Customer Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        
        {/* Protected Role-Based Dashboards */}
        <Route path="/restaurant-dashboard" element={
          <ProtectedRoute allowedRoles={["RESTAURANT"]}>
            <RestaurantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/delivery-dashboard" element={
          <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
            <DeliveryDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {shouldShowNavbar && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <LocationProvider>
          <CartProvider>
            <BrowserRouter>
              <Layout />
            </BrowserRouter>
          </CartProvider>
        </LocationProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
