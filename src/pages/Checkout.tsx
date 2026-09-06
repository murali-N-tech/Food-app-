import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MapPin, CreditCard, Wallet, Banknote, ArrowRight, Loader2, ChevronRight } from "lucide-react";

export function Checkout() {
  const { items, cartTotal, cartCount, clearCart, restaurantId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Force login before checkout
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const platformFee = 5;
  const deliveryFee = 30;
  const total = cartTotal + platformFee + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items from a restaurant to start your order.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // 1. Create order in Firebase
      const docRef = await addDoc(collection(db, "orders"), {
        customerId: user.id,
        restaurantId: restaurantId || "unknown_restaurant",
        status: "PLACED",
        total: total,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        address: "123 Main St, Eluru, AP", // Hardcoded for prototype
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. We could optionally hit our backend API here if we needed to trigger webhooks/emails
      
      clearCart();
      navigate(`/order/${docRef.id}`);
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
          <span className="cursor-pointer hover:text-gray-900" onClick={() => navigate('/')}>Home</span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900 font-bold">Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Details */}
          <div className="flex-1 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Delivery Address
              </h2>
              <div className="border border-orange-200 bg-orange-50 p-4 rounded-xl relative">
                <div className="absolute top-4 right-4 bg-orange-200 text-orange-700 text-xs font-bold px-2 py-1 rounded">HOME</div>
                <h3 className="font-bold text-gray-900">Murali Naga</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3">123 Main Street, Phase 2, Eluru, Andhra Pradesh 534001</p>
                <div className="text-sm font-medium text-gray-900">+91 98765 43210</div>
              </div>
              <button className="mt-4 text-orange-600 font-bold text-sm hover:text-orange-700">
                + Add New Address
              </button>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-900">UPI / GPay / PhonePe</span>
                  </div>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 accent-orange-600" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-900">Credit / Debit Card</span>
                  </div>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 accent-orange-600" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-orange-600" />
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2">
                      <div className="font-medium text-gray-500">{item.quantity} x</div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </div>
                    <div className="font-bold text-gray-900">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span className="font-medium text-gray-900">₹{platformFee}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>To Pay</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order (₹{total})
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
