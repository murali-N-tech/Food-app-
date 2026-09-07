import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, ChefHat, MapPin, Navigation, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useLocationContext } from "../context/LocationContext";
import { FavoriteButton } from "../components/FavoriteButton";

export function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { address, isLocating, detectLocation } = useLocationContext();

  // Calculate a dynamic ETA based on location and simulated historical kitchen speed
  const calculateDynamicETA = (restaurantId: string, baseTimeStr: string, currentAddress: string) => {
    // If not located yet, just return the base time from the DB
    if (!currentAddress || currentAddress === "Detecting location..." || currentAddress === "Location access denied") {
      return baseTimeStr || "30-45 min";
    }

    // Pseudo-random modifier based on user address (simulating driving distance)
    const addressHash = currentAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const distanceModifier = (addressHash % 20) - 5; // -5 to +15 mins

    // Pseudo-random modifier based on restaurant ID (simulating historical kitchen processing speed)
    const restHash = restaurantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const kitchenSpeedModifier = (restHash % 10) - 3; // -3 to +7 mins

    // Extract base time (e.g., "30-45 min" -> 30, 45)
    let baseMin = 30;
    let baseMax = 45;
    
    if (baseTimeStr) {
      const match = baseTimeStr.match(/(\d+)-(\d+)/);
      if (match) {
        baseMin = parseInt(match[1]);
        baseMax = parseInt(match[2]);
      } else {
        const singleMatch = baseTimeStr.match(/(\d+)/);
        if (singleMatch) {
           baseMin = parseInt(singleMatch[1]);
           baseMax = baseMin + 15;
        }
      }
    }

    const finalMin = Math.max(10, baseMin + distanceModifier + kitchenSpeedModifier);
    const finalMax = Math.max(finalMin + 10, baseMax + distanceModifier + kitchenSpeedModifier);

    return `${finalMin}-${finalMax} min`;
  };

  const coverImages = [
    {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
      title: "Discover Premium Dining",
      subtitle: "The best culinary experiences in your city."
    },
    {
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200",
      title: "Fresh & Authentic",
      subtitle: "From farm to table, crafted with passion."
    },
    {
      url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200",
      title: "Craving Pizza?",
      subtitle: "Hot, cheesy, and delivered in minutes."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % coverImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  // Extract unique cuisines from our data
  const dynamicCategories = Array.from(
    new Set(restaurants.flatMap(r => r.cuisine || r.tags || []))
  )
    .filter(Boolean)
    .slice(0, 10); // Limit to top 10

  const getEmojiForCuisine = (cuisine: string) => {
    const emojiMap: Record<string, string> = {
      Pizza: "🍕",
      Burgers: "🍔",
      American: "🍔",
      Biryani: "🍛",
      Indian: "🍛",
      Curry: "🍛",
      Healthy: "🥗",
      Salads: "🥗",
      Chinese: "🍜",
      Noodles: "🍜",
      Desserts: "🍰",
      Bakery: "🍰",
      Mexican: "🌮",
      Tacos: "🌮",
      Japanese: "🍣",
      Sushi: "🍣",
      Steakhouse: "🥩",
      BBQ: "🥩",
      Italian: "🍝",
      Pasta: "🍝",
    };
    return emojiMap[cuisine] || "🍽️";
  };

  const categories = dynamicCategories.length > 0
    ? dynamicCategories.map(name => ({ name, emoji: getEmojiForCuisine(name as string) }))
    : [
        { name: "Pizza", emoji: "🍕" },
        { name: "Burgers", emoji: "🍔" },
        { name: "Biryani", emoji: "🍛" },
        { name: "Healthy", emoji: "🥗" },
        { name: "Chinese", emoji: "🍜" },
        { name: "Desserts", emoji: "🍰" },
      ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero Carousel */}
      <div className="relative w-full h-[60vh] min-h-[400px] bg-gray-900 overflow-hidden">
        {coverImages.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg transform transition-transform duration-700 translate-y-0">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-2xl font-medium drop-shadow-md">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
          {coverImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'}`}
            />
          ))}
        </div>
      </div>

      {/* Location Bar */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8 shadow-sm relative z-30 -mt-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Delivering To</p>
              <p className="text-sm font-bold text-gray-900 truncate">{address}</p>
            </div>
          </div>
          <button 
            onClick={detectLocation}
            disabled={isLocating}
            className="shrink-0 flex items-center justify-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm transition-colors gap-2"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span className="hidden sm:inline">Locate Me</span>
          </button>
        </div>
      </div>

      {/* Hero Section / Categories */}
      <section className="bg-white pt-12 pb-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">What are you craving?</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <Link to={`/search?q=${cat.name}`} key={cat.name} className="flex flex-col items-center gap-3 cursor-pointer group shrink-0">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl group-hover:bg-orange-50 transition-colors shadow-sm border border-gray-100">
                  {cat.emoji}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{cat.name}</span>
              </Link>
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
            <>{[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="group block">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100 bg-gray-200 animate-pulse"></div>
                <div className="flex justify-between items-start mb-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}</>
          ) : restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="group block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100 bg-gray-100">
                <img 
                  src={restaurant.imageUrl || restaurant.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <FavoriteButton 
                  id={restaurant.id} 
                  type="restaurant" 
                  className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" 
                />

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
                  <span className="text-gray-900">{calculateDynamicETA(restaurant.id, restaurant.deliveryTime, address)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
