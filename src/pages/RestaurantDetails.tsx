import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, Info, Plus, Minus, Search, ArrowLeft, Flame, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { FavoriteButton } from "../components/FavoriteButton";
import { useAuth } from "../context/AuthContext";
import { addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";

function estimateNutrition(item: any) {
  const hash = (item.name || "").split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  
  // Base calories (more expensive often means bigger portion)
  const calories = Math.floor(150 + ((item.price || 100) * 0.8) + (hash % 350));
  
  // Macros
  const protein = item.isVeg ? Math.floor(5 + (hash % 20)) : Math.floor(15 + (hash % 30));
  const carbs = Math.floor(10 + (hash % 60));
  const fat = Math.floor(5 + (hash % 25));

  return { calories, protein, carbs, fat };
}

export function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [dietaryPreference, setDietaryPreference] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasCompletedOrder, setHasCompletedOrder] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { items, addToCart, updateQuantity } = useCart();

  const submitReview = async () => {
    if (!user || !newReviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, `restaurants/${id}/reviews`), {
        userId: user.id,
        userName: user.name,
        rating: newRating,
        text: newReviewText,
        createdAt: serverTimestamp()
      });
      setNewReviewText("");
      setNewRating(5);
      
      // refresh reviews
      const reviewsSnap = await getDocs(query(collection(db, `restaurants/${id}/reviews`), orderBy("createdAt", "desc")));
      setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };


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
  }, [id, user]);

  if (loading) {
    return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Skeleton Header */}
      <div className="h-64 md:h-80 lg:h-96 w-full bg-gray-200 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* Skeleton Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="h-4 w-24 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <div className="h-8 w-3/4 md:w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-5 w-full md:w-2/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="flex flex-wrap gap-4">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-full md:w-72 space-y-4">
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Menu layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
             <div className="h-8 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
             <div className="h-8 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
             <div className="h-8 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
          </div>
          <div className="lg:col-span-3 space-y-8">
             <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 h-40">
                    <div className="flex-1 space-y-2">
                       <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                       <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                       <div className="h-16 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
                    </div>
                    <div className="w-28 h-28 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
);
  }

  if (!restaurant) {
    return <div className="min-h-screen flex justify-center items-center">Restaurant not found.</div>;
  }

  // Group menu by category
  const filteredMenu = menu.filter(item => {
    // Dietary filtering
    if (dietaryPreference === "vegetarian" && item.isVeg !== true) return false;
    if (dietaryPreference === "vegan" && item.isVegan !== true) return false;
    if (dietaryPreference === "gluten-free" && item.isGlutenFree !== true) return false;

    // Search query filtering
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
    return 0; // recommended
  });

  const groupedMenu = filteredMenu.reduce((acc, item) => {
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
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-100">
              <img src={restaurant.imageUrl || restaurant.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} alt={restaurant.name || "Restaurant"} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{restaurant.name || "Unnamed Restaurant"}</h1>
                  <FavoriteButton id={restaurant.id} type="restaurant" className="bg-gray-100 hover:bg-gray-200 shadow-none border border-gray-200" />
                </div>
                <div className="bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-sm shadow-sm shrink-0">
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in menu..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium text-gray-700 appearance-none cursor-pointer sm:w-48"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.5rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.5em 1.5em`
                    }}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <button 
                    onClick={() => setDietaryPreference(dietaryPreference === "vegetarian" ? "all" : "vegetarian")}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors flex items-center gap-1.5 ${dietaryPreference === 'vegetarian' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${dietaryPreference === 'vegetarian' ? 'border-green-600' : 'border-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dietaryPreference === 'vegetarian' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                    </div>
                    Veg
                  </button>
                  <button 
                    onClick={() => setDietaryPreference(dietaryPreference === "vegan" ? "all" : "vegan")}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors ${dietaryPreference === 'vegan' ? 'bg-green-600 text-white border border-green-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Vegan
                  </button>
                  <button 
                    onClick={() => setDietaryPreference(dietaryPreference === "gluten-free" ? "all" : "gluten-free")}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors ${dietaryPreference === 'gluten-free' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Gluten-Free
                  </button>
                </div>
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
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`w-4 h-4 rounded-sm border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center shrink-0`}>
                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </div>
                          <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                        </div>
                        <FavoriteButton id={item.id} type="dish" className="sm:hidden -mt-1 -mr-1" iconClassName="w-4 h-4" />
                      </div>
                      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        ₹{item.price}
                        <FavoriteButton id={item.id} type="dish" className="hidden sm:block" iconClassName="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-xl mb-3">{item.description}</p>
                      
                      {/* Nutritional Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                          <Flame className="w-3.5 h-3.5" />
                          {estimateNutrition(item).calories} kcal
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 border-l border-gray-200 pl-2">
                          <span title="Protein">P: {estimateNutrition(item).protein}g</span>
                          <span title="Carbs">C: {estimateNutrition(item).carbs}g</span>
                          <span title="Fats">F: {estimateNutrition(item).fat}g</span>
                        </div>
                      </div>
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
                          className={`flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg font-bold shadow-sm hover:bg-orange-50 transition-colors ${item.imageUrl ? 'w-full text-xs sm:text-sm py-1.5' : ''}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Quick Add
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
