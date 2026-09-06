import { useState } from "react";
import { ShoppingBag, Search, User, MapPin, ChefHat, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartSidebar } from "./CartSidebar";

export function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                FF
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">FoodFusion</span>
            </Link>

            {/* Location (Desktop) */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors px-4 py-2 rounded-full hover:bg-gray-50">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Eluru, AP</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link to="/planner" className="hidden md:flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors">
                <ChefHat className="w-4 h-4" />
                Smart Meal Planner
              </Link>
              
              <Link to="/search" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                <Search className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                {user ? (
                  <>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 pl-2 pr-3 py-1.5 rounded-full transition-colors"
                    >
                      <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-900 hidden sm:block">{user.name.split(' ')[0]}</span>
                    </button>
                    
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-50 mb-2">
                            <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          </div>
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium">
                            My Profile
                          </Link>
                          {user.role === "CUSTOMER" && (
                            <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium">
                              Order History
                            </Link>
                          )}
                          {user.role === "RESTAURANT" && (
                            <Link to="/restaurant-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium border-t border-gray-50 mt-1 pt-2">
                              Restaurant Portal
                            </Link>
                          )}
                          {user.role === "DELIVERY_PARTNER" && (
                            <Link to="/delivery-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium border-t border-gray-50 mt-1 pt-2">
                              Delivery Portal
                            </Link>
                          )}
                          {user.role === "ADMIN" && (
                            <Link to="/admin-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 font-medium border-t border-gray-50 mt-1 pt-2">
                              Admin Portal
                            </Link>
                          )}
                          <button 
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 mt-1 border-t border-gray-50 pt-3"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-2 border border-transparent hover:border-gray-200">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-bold hidden sm:block">Log In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
