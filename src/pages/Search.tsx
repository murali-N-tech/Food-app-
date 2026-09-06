import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Star, Clock, Flame, ChevronLeft } from "lucide-react";

export function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a dedicated search endpoint with Elasticsearch
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [query]);

  // Client-side filtering for prototype
  const filteredResults = results.filter(item => {
    if (activeFilter === "all") return true;
    if (activeFilter === "restaurants") return item.type === "restaurant";
    if (activeFilter === "dishes") return item.type === "dish";
    return true;
  });

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
            <button className="px-4 py-1.5 rounded-full text-sm font-bold shrink-0 bg-white border border-gray-200 text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
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
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500 text-sm">We couldn't find anything matching "{query}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map(item => (
              item.type === "restaurant" ? (
                <Link key={item.id} to={`/restaurant/${item.id}`} className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{item.name}</h3>
                      <div className="text-sm text-gray-500 mb-1">{item.tags?.join(", ")}</div>
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
                <Link key={item.id} to={`/restaurant/${item.restaurantId}`} className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </div>
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
