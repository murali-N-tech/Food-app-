import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, MapPin, CreditCard, ChevronRight, Package, Loader2, LogOut, RefreshCw, Heart, Star, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, documentId } from "firebase/firestore";
import { FavoriteButton } from "../components/FavoriteButton";

export function Profile() {
  const { user, logout } = useAuth();
  const { favoriteRestaurants } = useFavorites();
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [favRests, setFavRests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "favorites">("orders");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Orders
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

        // Fetch Favorite Restaurants
        if (favoriteRestaurants.length > 0) {
          // Chunk the array if it's over 10 items due to 'in' query limits
          const chunks = [];
          for (let i = 0; i < favoriteRestaurants.length; i += 10) {
            chunks.push(favoriteRestaurants.slice(i, i + 10));
          }
          
          let allRests: any[] = [];
          for (const chunk of chunks) {
            const rQuery = query(collection(db, "restaurants"), where(documentId(), "in", chunk));
            const rSnap = await getDocs(rQuery);
            allRests = [...allRests, ...rSnap.docs.map(d => ({ id: d.id, ...d.data() }))];
          }
          setFavRests(allRests);
        } else {
          setFavRests([]);
        }

      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, favoriteRestaurants]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleReorder = (order: any) => {
    clearCart();
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          addToCart({
            id: item.id,
            restaurantId: order.restaurantId,
            name: item.name,
            price: item.price,
            description: "",
            category: "",
            isVeg: true,
          });
        }
      });
    }
    
    navigate("/checkout");
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
                  <UserIcon className="w-5 h-5 text-gray-400" />
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

          {/* Order History & Favorites */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "orders" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
              >
                Recent Orders
              </button>
              <button 
                onClick={() => setActiveTab("favorites")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "favorites" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
              >
                Saved Favorites
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                         <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                         <div className="space-y-2">
                           <div className="h-5 w-32 bg-gray-200 rounded"></div>
                           <div className="h-4 w-24 bg-gray-200 rounded"></div>
                         </div>
                      </div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : activeTab === "orders" ? (
              orders.length === 0 ? (
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
                           <button 
                             onClick={() => handleReorder(order)}
                             className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
                           >
                             <RefreshCw className="w-4 h-4" /> Reorder
                           </button>
                           <Link to={`/order/${order.id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors flex items-center">
                            Track Status
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Favorites Tab
              favRests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-500 mb-6">Save your favorite restaurants to find them here quickly.</p>
                  <Link to="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                    Explore Restaurants
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favRests.map((restaurant) => (
                    <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                        <img 
                          src={restaurant.imageUrl || restaurant.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <FavoriteButton 
                          id={restaurant.id} 
                          type="restaurant" 
                          className="absolute top-3 right-3 opacity-100 shadow-sm" 
                        />
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-gray-900 shadow-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {restaurant.rating || "New"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors truncate">{restaurant.name || "Unnamed Restaurant"}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="line-clamp-1 truncate">{restaurant.cuisine ? restaurant.cuisine.join(" • ") : (restaurant.tags?.join(" • ") || "Various Cuisines")}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
