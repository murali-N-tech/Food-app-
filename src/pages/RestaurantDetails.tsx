import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, Info, Plus, Minus, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    if (!id) return;
    
    const fetchRestaurantData = async () => {
      try {
        const [restSnap, menuSnap] = await Promise.all([
          getDoc(doc(db, "restaurants", id)),
          getDocs(collection(db, `restaurants/${id}/menu`))
        ]);

        if (restSnap.exists()) {
          setRestaurant({ id: restSnap.id, ...restSnap.data() });
        }
        
        const menuItems = menuSnap.docs.map(doc => ({
          id: doc.id,
          restaurantId: id,
          ...doc.data()
        })).filter(item => (item as any).available !== false); // only show available items

        setMenu(menuItems);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="min-h-screen flex justify-center items-center">Restaurant not found.</div>;
  }

  // Group menu by category
  const groupedMenu = menu.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const getQuantity = (itemId: string) => {
    return items.find(i => i.id === itemId)?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Restaurant Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-100">
              <img src={restaurant.imageUrl || restaurant.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} alt={restaurant.name || "Restaurant"} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{restaurant.name || "Unnamed Restaurant"}</h1>
                <div className="bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-sm shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {restaurant.rating || "New"}
                </div>
              </div>
              
              <div className="text-gray-600 mb-4 font-medium">
                {restaurant.cuisine ? restaurant.cuisine.join(", ") : (restaurant.tags?.join(", ") || "Various Cuisines")} • {restaurant.priceRange || "₹₹"}
              </div>

              <div className="flex gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">{restaurant.deliveryTime || "30-45 min"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Info className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">More Info</span>
                </div>
              </div>
              
              {/* Search Menu */}
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  type="text"
                  placeholder="Search in menu..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(groupedMenu).map(([category, categoryItems]) => (
          <div key={category} className="mb-10 last:mb-0">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{category}</h2>
            <div className="space-y-4">
              {(categoryItems as any[]).map((item) => {
                const qty = getQuantity(item.id);
                return (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded-sm border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                          <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                      </div>
                      <div className="font-bold text-gray-800 mb-2">₹{item.price}</div>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{item.description}</p>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-center justify-center gap-3 w-28">
                      {item.imageUrl && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 mb-2">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {qty === 0 ? (
                        <button 
                          onClick={() => addToCart(item)}
                          className={`px-6 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg font-bold shadow-sm hover:bg-orange-50 transition-colors ${item.imageUrl ? 'w-full text-sm py-1.5' : ''}`}
                        >
                          ADD
                        </button>
                      ) : (
                        <div className={`flex items-center justify-between w-full bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 shadow-sm ${item.imageUrl ? 'text-sm' : ''}`}>
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="p-1 text-orange-600 hover:bg-orange-100 rounded-md transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-orange-700 text-center">{qty}</span>
                          <button onClick={() => updateQuantity(item.id, qty + 1)} className="p-1 text-orange-600 hover:bg-orange-100 rounded-md transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
