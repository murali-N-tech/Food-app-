import { useState } from "react";
import { Sparkles, Utensils, IndianRupee, Users, ChefHat, ArrowRight, Loader2, Star, AlertCircle } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export function SmartMealPlanner() {
  const [budget, setBudget] = useState(300);
  const [people, setPeople] = useState(2);
  const [preference, setPreference] = useState("Any");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setRecommendation(null);
    setError(null);
    
    try {
      // 1. Fetch data from Firestore
      const restsSnap = await getDocs(collection(db, "restaurants"));
      const restaurants = restsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let dishes: any[] = [];
      for (const rest of restaurants) {
        const menuSnap = await getDocs(collection(db, `restaurants/${rest.id}/menu`));
        const restDishes = menuSnap.docs.map(doc => ({
           id: doc.id, 
           restaurantId: rest.id,
           name: (rest as any).name,
           ...(doc.data() as any)
        }));
        dishes = [...dishes, ...restDishes];
      }

      // 2. Call backend Gemini API
      const res = await fetch("/api/meal-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget,
          people,
          preference,
          restaurants,
          dishes
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate meal plan.");
      }

      const plan = await res.json();
      setRecommendation({
        ...plan,
        restaurant: plan.restaurantName || "Recommended Restaurant"
      });
    } catch (err) {
      console.error(err);
      setError("Unable to generate meal plan. Please try adjusting your budget or preferences.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!recommendation) return;
    
    clearCart();

    // Add all recommended items
    recommendation.items.forEach((item: any) => {
      // Need to add multiple times based on quantity, or modify CartContext.
      // Since CartContext addToCart currently adds 1, we will just call it quantity times.
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        addToCart({
          id: item.id,
          restaurantId: recommendation.restaurantId,
          name: item.name,
          price: item.price,
          description: item.tag || "",
          category: "",
          isVeg: true, 
        });
      }
    });

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl mb-4 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">Smart Meal Planner</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Tell us what you need. Our algorithm analyzes thousands of menu items to find the perfect meal combination for your budget and cravings.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <IndianRupee className="w-4 h-4 text-orange-500" />
                Budget per person
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="font-bold text-gray-900">₹{budget}</span>
                <input 
                  type="range" 
                  min="100" max="1000" step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-2/3 accent-orange-500"
                />
              </div>
            </div>

            {/* People */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <Users className="w-4 h-4 text-orange-500" />
                How many people?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPeople(num)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                      people === num 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <Utensils className="w-4 h-4 text-orange-500" />
                Dietary Preference
              </label>
              <div className="flex flex-wrap gap-3">
                {["Any", "High Protein", "Pure Veg", "Low Calorie", "Spicy"].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setPreference(pref)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      preference === pref 
                        ? 'bg-orange-100 text-orange-700 border-orange-200 border shadow-sm' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-10 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding the perfect meal...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                Generate My Meal
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {recommendation && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Recommended For You</h2>
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-rose-50 p-6 border-b border-orange-100 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{recommendation.restaurant}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1 font-medium"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {recommendation.rating}</span>
                    <span>•</span>
                    <span>{recommendation.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">₹{recommendation.total}</div>
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Under Budget</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-8">
                  {recommendation.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs font-medium text-gray-500 mt-1">{item.tag}</div>
                      </div>
                      <div className="font-bold text-gray-700">₹{item.price}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 mb-8">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Why we picked this</h4>
                  <ul className="space-y-2">
                    {recommendation.reasons.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="mt-0.5 text-green-500">✓</div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  Add Meal to Cart
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
