import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { MapPin, ChefHat, CheckCircle2, Navigation, Phone, MessageSquare, ChevronLeft, Package } from "lucide-react";

export function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Listen to real-time updates for this order
    const unsubscribe = onSnapshot(doc(db, "orders", id), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() });
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching order:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Order not found.</div>;
  }

  // Simplified status flow for UI representation
  const statuses = [
    { key: "PLACED", label: "Order Placed", desc: "We have received your order", icon: CheckCircle2 },
    { key: "PREPARING", label: "Preparing", desc: "Your food is being prepared", icon: ChefHat },
    { key: "READY_FOR_PICKUP", label: "Ready for Pickup", desc: "Waiting for delivery partner", icon: Package },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Delivery partner is on the way", icon: Navigation },
    { key: "DELIVERED", label: "Delivered", desc: "Enjoy your meal!", icon: MapPin },
  ];

  // In this mock, we just hardcode PREPARING as active if the backend returns PREPARING.
  // Real app would calculate index based on order.status
  const activeStatusIndex = statuses.findIndex(s => s.key === order.status) !== -1 
    ? statuses.findIndex(s => s.key === order.status) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Map Area Placeholder */}
      <div className="h-64 w-full bg-gray-200 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="z-10 flex flex-col items-center text-gray-500">
          <MapPin className="w-10 h-10 mb-2 text-gray-400" />
          <span className="font-bold text-sm uppercase tracking-wider">Live Map Tracking Available</span>
        </div>
        <Link to="/" className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-sm p-2 rounded-full text-gray-700 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Delivery</div>
              <div className="text-2xl font-black">{order.estimatedDelivery}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</div>
              <div className="text-sm font-medium">#{order.id}</div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Track Order</h2>
            
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
              {statuses.map((s, idx) => {
                const isActive = idx === activeStatusIndex;
                const isPast = idx < activeStatusIndex;
                const Icon = s.icon;
                
                return (
                  <div key={s.key} className="relative pl-8">
                    <div className={`absolute -left-[11px] top-1 rounded-full p-1 
                      ${isActive ? 'bg-orange-100 text-orange-600 ring-4 ring-white' : 
                        isPast ? 'bg-green-100 text-green-600 ring-4 ring-white' : 
                        'bg-gray-100 text-gray-400 ring-4 ring-white'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isActive ? 'text-orange-600' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                      </h3>
                      <p className={`text-sm ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Rahul Kumar</div>
                <div className="text-xs text-gray-500 font-medium">Your Delivery Partner</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white rounded-full text-orange-600 shadow-sm border border-gray-200 hover:bg-orange-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-3 bg-white rounded-full text-orange-600 shadow-sm border border-gray-200 hover:bg-orange-50 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
