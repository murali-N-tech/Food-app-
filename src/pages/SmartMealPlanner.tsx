import { useState } from "react";
import { Sparkles, Utensils, IndianRupee, Users, ChefHat, ArrowRight, Loader2, Star } from "lucide-react";

export function SmartMealPlanner() {
  const [budget, setBudget] = useState(300);
  const [people, setPeople] = useState(2);
  const [preference, setPreference] = useState("Any");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setRecommendation(null);
    
    // Simulate AI / algorithmic processing
    setTimeout(() => {
      setIsGenerating(false);
      setRecommendation({
        restaurant: "Biryani Paradise",
        total: 287,
        time: "27 mins",
        rating: 4.5,
        items: [
          { name: "Chicken Dum Biryani (Full)", price: 220, tag: "High Protein" },
          { name: "Thumbs Up (250ml)", price: 40, tag: "Beverage" },
          { name: "Extra Raita", price: 27, tag: "Add-on" }
        ],
        reasons: [
          "Perfectly matches your budget under ₹300",
          "High protein profile",
          "Available within 2.5km",
          "Top-rated for consistency"
        ]
      });
    }, 2000);
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

                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md">
                  Add to Cart
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
