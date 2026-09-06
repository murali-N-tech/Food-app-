import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, ChefHat } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const rests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRestaurants(rests);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const categories = [
    { name: "Pizza", emoji: "🍕" },
    { name: "Burgers", emoji: "🍔" },
    { name: "Biryani", emoji: "🍛" },
    { name: "Healthy", emoji: "🥗" },
    { name: "Chinese", emoji: "🍜" },
    { name: "Desserts", emoji: "🍰" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section / Categories */}
      <section className="bg-white pt-8 pb-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">What are you craving?</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <div key={cat.name} className="flex flex-col items-center gap-3 cursor-pointer group shrink-0">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl group-hover:bg-orange-50 transition-colors shadow-sm border border-gray-100">
                  {cat.emoji}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Planner Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <ChefHat className="w-6 h-6" />
              Smart Meal Planner
            </h3>
            <p className="text-orange-100 max-w-md text-sm leading-relaxed">
              Tell us your budget, mood, and party size. We'll instantly combine the perfect meal from top-rated restaurants near you.
            </p>
          </div>
          <Link to="/planner" className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 w-full md:w-auto text-center">
            Try it now
          </Link>
        </div>
      </section>

      {/* Top Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Top Restaurants Near You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading restaurants...</div>
          ) : restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="group block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100 bg-gray-100">
                <img 
                  src={restaurant.imageUrl || restaurant.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-gray-900 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {restaurant.rating || "New"}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{restaurant.name || "Unnamed Restaurant"}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="line-clamp-1">{restaurant.cuisine ? restaurant.cuisine.join(" • ") : (restaurant.tags?.join(" • ") || "Various Cuisines")}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  {restaurant.deliveryTime || "30-45 min"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
