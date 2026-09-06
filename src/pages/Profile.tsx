import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, MapPin, CreditCard, ChevronRight, Package, Loader2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("customerId", "==", user.id),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8 sm:px-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-4xl shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900 mb-1">{user.name}</h1>
            <p className="text-gray-500 font-medium">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quick Links / Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">Personal Information</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">Saved Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">Payment Methods</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Order History */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
                <Link to="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                  Start Ordering
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Order ID</div>
                        <div className="font-bold text-gray-900">#{order.id.slice(0, 8)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-500 uppercase">Date</div>
                        <div className="font-bold text-gray-900">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2 ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <div className="text-sm text-gray-600 font-medium">
                            {order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                          </div>
                        </div>
                        <div className="text-xl font-black text-gray-900">
                          ₹{order.total}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-gray-50 gap-3">
                         <Link to={`/order/${order.id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                          Track Status
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
