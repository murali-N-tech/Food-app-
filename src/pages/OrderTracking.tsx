import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
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
    return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 h-48 animate-pulse flex flex-col gap-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="mt-auto h-2 w-full bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 h-64 animate-pulse flex flex-col gap-4">
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 h-96 animate-pulse flex flex-col gap-4">
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
              <div className="mt-auto h-12 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
);
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
      
      {/* Map Area */}
      <div className="h-64 sm:h-96 w-full bg-gray-200 relative overflow-hidden flex items-center justify-center">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={{ lat: 12.9716, lng: 77.5946 }}
              defaultZoom={14}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={true}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            >
              {/* Restaurant Marker */}
              <AdvancedMarker position={{ lat: 12.9716, lng: 77.5946 }}>
                <Pin background={"#ea4335"} glyphColor={"#fff"} borderColor={"#c5221f"} />
              </AdvancedMarker>
              
              {/* Delivery Partner Marker */}
              <AdvancedMarker position={{ lat: 12.98, lng: 77.605 }}>
                 <div className="bg-orange-500 rounded-full p-2 border-2 border-white shadow-lg text-white">
                    <Navigation className="w-5 h-5" />
                 </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10">
             <MapPin className="w-10 h-10 mb-2 text-gray-400" />
             <span className="font-bold text-sm uppercase tracking-wider mb-2 text-gray-600">Live Map Tracking Available</span>
             <p className="text-xs text-gray-500 max-w-sm">
                Add your VITE_GOOGLE_MAPS_API_KEY via settings to enable live delivery tracking.
             </p>
          </div>
        )}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <Link to="/" className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur shadow-sm p-2 rounded-full text-gray-700 hover:text-gray-900 transition-colors">
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
            
            <div className="relative ml-4 space-y-8 pb-4">
              {/* Background Line */}
              <div className="absolute top-2 bottom-6 left-[0px] w-0.5 bg-gray-100 z-0"></div>
              
              {/* Animated Progress Line */}
              <div 
                className="absolute top-2 left-[0px] w-0.5 bg-orange-500 z-0 transition-all duration-1000 ease-in-out origin-top"
                style={{ 
                  height: activeStatusIndex === 0 ? '0%' : `calc(${(activeStatusIndex / (statuses.length - 1)) * 100}% - 1rem)` 
                }}
              ></div>

              {statuses.map((s, idx) => {
                const isActive = idx === activeStatusIndex;
                const isPast = idx < activeStatusIndex;
                const Icon = s.icon;
                
                return (
                  <div key={s.key} className="relative pl-8 z-10 group">
                    <div className={`absolute -left-[11px] top-1 rounded-full p-1.5 transition-all duration-700 ease-out shadow-[0_0_0_4px_rgba(255,255,255,1)]
                      ${isActive ? 'bg-orange-500 text-white scale-110' : 
                        isPast ? 'bg-orange-500 text-white' : 
                        'bg-gray-100 text-gray-400'}`}>
                      <Icon className="w-3.5 h-3.5 relative z-10" />
                      
                      {/* Subtly pinging ring for the active state */}
                      {isActive && (
                        <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-75"></span>
                      )}
                    </div>
                    <div className="transform transition-all duration-500 hover:translate-x-1">
                      <h3 className={`font-bold transition-colors duration-300 ${isActive ? 'text-orange-600' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
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
