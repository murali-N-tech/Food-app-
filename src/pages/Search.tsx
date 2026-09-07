import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter, Star, Clock, Flame, ChevronLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [dietaryPreference, setDietaryPreference] = useState("all");
  const navigate = useNavigate();

  // Load all data once for instant client-side search
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [allDishes, setAllDishes] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const restsSnap = await getDocs(collection(db, "restaurants"));
        const rests = restsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        let dishes: any[] = [];
        // Fetch menus efficiently
        for (const rest of rests) {
          const menuSnap = await getDocs(collection(db, `restaurants/${rest.id}/menu`));
          const restDishes = menuSnap.docs.map(doc => ({
             id: doc.id, 
             restaurantId: rest.id,
             restaurantName: rest.name,
             ...(doc.data() as any)
          }));
          dishes = [...dishes, ...restDishes];
        }

        setAllRestaurants(rests);
        setAllDishes(dishes);
      } catch (err) {
        console.error("Error loading search data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchAllData();
  }, []);

  // Efficient client-side search algorithm
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase().trim();
    const results: any[] = [];

    if (activeFilter === "all" || activeFilter === "restaurants") {
      const matchedRestaurants = allRestaurants.filter(r => 
        r.name?.toLowerCase().includes(q) || 
        r.cuisine?.some((c: string) => c.toLowerCase().includes(q)) ||
        r.tags?.some((t: string) => t.toLowerCase().includes(q))
      ).map(r => ({ ...r, type: "restaurant", image: r.imageUrl || r.image }));
      
      results.push(...matchedRestaurants);
    }
    
    if (activeFilter === "all" || activeFilter === "dishes") {
      let matchedDishes = allDishes.filter(d => 
        d.name?.toLowerCase().includes(q) || 
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      );
      
      // Apply dietary filters to dishes
      if (dietaryPreference !== "all") {
        matchedDishes = matchedDishes.filter(d => {
          if (dietaryPreference === "vegetarian") return d.isVeg === true;
          if (dietaryPreference === "vegan") return d.isVegan === true; // Assuming isVegan might be added
          if (dietaryPreference === "gluten-free") return d.isGlutenFree === true; // Assuming isGlutenFree might be added
          return true;
        });
      }

      matchedDishes = matchedDishes.map(d => ({ ...d, type: "dish", image: d.imageUrl || d.image }));
      
      results.push(...matchedDishes);
    }

    if (sortBy === "price-asc") {
      results.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      results.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name-asc") {
      results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "name-desc") {
      results.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    return results;
  }, [query, activeFilter, sortBy, dietaryPreference, allRestaurants, allDishes]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors hidden sm:block">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-orange-500" />
              </div>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for restaurants or dishes..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 shadow-inner"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors ${activeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter("restaurants")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors ${activeFilter === 'restaurants' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Restaurants
            </button>
            <button 
              onClick={() => setActiveFilter("dishes")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 transition-colors ${activeFilter === 'dishes' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Dishes
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2 self-center shrink-0"></div>
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
            <div className="w-px h-6 bg-gray-200 mx-2 self-center shrink-0"></div>
            <div className="relative shrink-0 flex items-center">
              <Filter className="w-3.5 h-3.5 absolute left-3 pointer-events-none text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-8 py-1.5 rounded-full text-sm font-bold bg-white border border-gray-200 text-gray-700 appearance-none cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        
        {!query ? (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Chicken Biryani", "Pizza", "Burgers", "Paradise", "Healthy Bowls", "Desserts"].map(term => (
                <button 
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : isLoadingData ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-2xl animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500 text-sm">We couldn't find anything matching "{query}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map(item => (
              item.type === "restaurant" ? (
                <Link key={`rest-${item.id}`} to={`/restaurant/${item.id}`} className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex gap-4 items-center">
                    <img src={item.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{item.name}</h3>
                      <div className="text-sm text-gray-500 mb-1">{item.cuisine?.join(", ") || item.tags?.join(", ")}</div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-current" /> {item.rating}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> {item.deliveryTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link key={`dish-${item.id}`} to={`/restaurant/${item.restaurantId}`} className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex gap-4 items-center">
                    <img src={item.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400"} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors flex items-center gap-2">
                          {item.isVeg !== undefined && (
                            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                            </div>
                          )}
                          {item.name}
                        </h3>
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                      <div className="text-xs font-bold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-md">
                        From {item.restaurantName}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
