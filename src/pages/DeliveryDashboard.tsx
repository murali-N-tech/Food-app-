import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { MapPin, Navigation, Package, IndianRupee, Clock, CheckCircle2, ChevronRight, Loader2, Power } from "lucide-react";

export function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to orders that are assignable or assigned
    const assignableStatuses = ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
    const q = query(
      collection(db, "orders")
      // In a real app we would filter by location/driver ID here
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((o: any) => assignableStatuses.includes(o.status));
        
      // Sort in memory
      fetchedOrders.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching delivery orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update trip status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // For the delivery driver, relevant states are:
  // - READY_FOR_PICKUP (Needs to be picked up)
  // - OUT_FOR_DELIVERY (Currently delivering)
  // - DELIVERED (Done)
  const activeTrips = orders.filter(o => o.status === "READY_FOR_PICKUP" || o.status === "OUT_FOR_DELIVERY");
  const completedTrips = orders.filter(o => o.status === "DELIVERED");
  
  const todayEarnings = completedTrips.length * 45; // Mock fixed earning per trip

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">FF</div>
            FoodFusion
          </Link>
          <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Delivery Partner</div>
        </div>
        <nav className="p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl transition-colors">
            <Navigation className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-sm">Active Trips</span>
            {activeTrips.length > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeTrips.length}</span>
            )}
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors">
            <IndianRupee className="w-5 h-5" />
            <span className="font-medium text-sm">Earnings</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors">
            <Package className="w-5 h-5" />
            <span className="font-medium text-sm">History</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-white border-b border-gray-100 p-4 sm:px-8 flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" alt="Driver Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Rahul Kumar</div>
              <div className="text-xs text-gray-500 font-medium">Hero Level • 4.8 ⭐</div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-sm ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? "You're Online" : "Go Online"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* Quick Earnings */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm font-bold text-gray-500 mb-1">Today's Earnings</div>
              <div className="text-2xl font-black text-gray-900">₹{todayEarnings}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-sm font-bold text-gray-500 mb-1">Trips Completed</div>
              <div className="text-2xl font-black text-gray-900">{completedTrips.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden hidden lg:block">
               <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
               <div className="text-sm font-bold text-blue-700 mb-1 relative z-10">Active Deliveries</div>
               <div className="text-2xl font-black text-blue-600 relative z-10">{activeTrips.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hidden lg:block">
              <div className="text-sm font-bold text-gray-500 mb-1">Online Time</div>
              <div className="text-2xl font-black text-gray-900">3h 45m</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Deliveries</h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white p-8 text-center text-gray-500 rounded-2xl border border-gray-100">Loading trips...</div>
            ) : !isOnline ? (
              <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100 flex flex-col items-center">
                <Power className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-bold text-gray-900">You are currently offline</p>
                <p className="text-sm mt-1">Go online to start receiving delivery requests.</p>
              </div>
            ) : activeTrips.length === 0 ? (
              <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100 flex flex-col items-center shadow-sm">
                <Navigation className="w-12 h-12 text-blue-200 mb-3" />
                <p className="font-bold text-gray-900">No active trips</p>
                <p className="text-sm mt-1">Waiting for new orders near your location...</p>
              </div>
            ) : (
              activeTrips.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'READY_FOR_PICKUP' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  
                  <div className="p-5 flex flex-col md:flex-row gap-6">
                    {/* Route Info */}
                    <div className="flex-1 pl-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-black text-gray-900 text-lg">#{order.id}</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          order.status === 'READY_FOR_PICKUP' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status === 'READY_FOR_PICKUP' ? 'PICKUP REQUIRED' : 'ON THE WAY'}
                        </span>
                      </div>
                      
                      <div className="relative border-l-2 border-dashed border-gray-200 ml-3 space-y-6 pb-2">
                        {/* Restaurant Location */}
                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-1 rounded-full p-1 bg-white border-2 border-gray-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">Biryani Paradise</h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">2.4 km away • Ground Floor, SR Nagar</p>
                        </div>
                        
                        {/* Customer Location */}
                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-1 rounded-full p-1 bg-white border-2 border-blue-500">
                            <MapPin className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">Customer Location</h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{order.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Block */}
                    <div className="shrink-0 flex flex-col justify-end w-full md:w-48 bg-gray-50 p-4 md:bg-transparent md:p-0 rounded-xl md:rounded-none">
                       {order.status === "READY_FOR_PICKUP" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                          disabled={updatingId === order.id}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
                        >
                          {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>Confirm Pickup <ChevronRight className="w-4 h-4" /></>
                          )}
                        </button>
                      )}
                      {order.status === "OUT_FOR_DELIVERY" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                          disabled={updatingId === order.id}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md"
                        >
                          {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>Mark Delivered <CheckCircle2 className="w-4 h-4" /></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
