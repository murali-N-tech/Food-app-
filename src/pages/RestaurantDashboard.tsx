import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { LayoutDashboard, UtensilsCrossed, ListOrdered, Settings, TrendingUp, Clock, CheckCircle2, ChevronRight, Loader2, Store } from "lucide-react";
import { MenuManagement } from "../components/restaurant/MenuManagement";
import { RestaurantSettings } from "../components/restaurant/RestaurantSettings";

export function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState("Your Restaurant");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!user || user.role !== "RESTAURANT") {
      navigate("/");
      return;
    }
    
    // Fetch Restaurant Profile Name
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "restaurants", user.id));
        if (docSnap.exists() && docSnap.data().name) {
          setRestaurantName(docSnap.data().name);
        }
      } catch (error) {
        console.error("Failed to fetch restaurant profile", error);
      }
    };
    fetchProfile();

    // Listen to orders
    const q = query(collection(db, "orders"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort in memory for prototype
      fetchedOrders.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === "PREPARING" || o.status === "PLACED");
  const completedOrders = orders.filter(o => o.status === "DELIVERED" || o.status === "READY_FOR_PICKUP" || o.status === "OUT_FOR_DELIVERY");
  
  const todayRevenue = orders
    .filter(o => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm">FF</div>
            FoodFusion
          </Link>
          <div className="mt-2 text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Restaurant Portal
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "dashboard" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === "dashboard" ? "text-orange-500" : ""}`} />
            <span className="font-medium text-sm">Dashboard</span>
            {pendingOrders.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "menu" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <UtensilsCrossed className={`w-5 h-5 ${activeTab === "menu" ? "text-orange-500" : ""}`} />
            <span className="font-medium text-sm">Menu Management</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "settings" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === "settings" ? "text-orange-500" : ""}`} />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "dashboard" && `Welcome back, ${restaurantName}`}
            {activeTab === "menu" && "Menu Management"}
            {activeTab === "settings" && "Restaurant Settings"}
          </h1>
          <p className="text-gray-500">
            {activeTab === "dashboard" && "Here's what's happening at your restaurant today."}
            {activeTab === "menu" && "Add, edit, or remove items from your menu."}
            {activeTab === "settings" && "Update your restaurant's public profile."}
          </p>
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900">₹{todayRevenue.toLocaleString()}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Today's Sales</div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ListOrdered className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900">{orders.length}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Total Orders</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-orange-200 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-black text-orange-600 relative z-10">{pendingOrders.length}</div>
                <div className="text-sm font-bold text-orange-700 mt-1 relative z-10">Pending Orders</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900">{completedOrders.length}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Completed</div>
              </div>
            </div>

            {/* Active Orders List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Active Orders</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading orders...</div>
                ) : orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length === 0 ? (
                  <div className="p-12 text-center text-gray-500 font-medium">No active orders right now.</div>
                ) : (
                  orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").map(order => (
                    <div key={order.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-gray-900 text-lg">#{order.id}</span>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            order.status === 'PREPARING' || order.status === 'PLACED' 
                              ? 'bg-orange-100 text-orange-700' 
                              : order.status === 'READY_FOR_PICKUP' 
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3 font-medium">
                          {order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                          <span>Total: ₹{order.total}</span>
                          <span>•</span>
                          <span>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString() : 'Recent'}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex gap-3 w-full lg:w-auto">
                        {order.status === "PLACED" && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, "PREPARING")}
                            disabled={updatingId === order.id}
                            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
                          >
                            {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept & Prepare"}
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, "READY_FOR_PICKUP")}
                            disabled={updatingId === order.id}
                            className="flex-1 lg:flex-none bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
                          >
                            {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Ready"}
                          </button>
                        )}
                        <button className="p-2.5 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors hidden lg:block">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "menu" && <MenuManagement />}
        {activeTab === "settings" && <RestaurantSettings />}
      </div>
    </div>
  );
}
