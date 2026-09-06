import React, { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Loader2, Store, MapPin, Clock, Camera, Upload } from "lucide-react";

export function RestaurantSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    imageUrl: "",
    cuisine: "",
    deliveryTime: "30-45 min",
    address: "",
    rating: 0
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // slightly larger for cover images
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setSettings(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "restaurants", user.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            name: data.name || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            cuisine: Array.isArray(data.cuisine) ? data.cuisine.join(", ") : (data.cuisine || ""),
            deliveryTime: data.deliveryTime || "30-45 min",
            address: data.address || "",
            rating: data.rating || 0
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, "restaurants", user.id);
      await setDoc(docRef, {
        name: settings.name,
        description: settings.description,
        imageUrl: settings.imageUrl || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
        cuisine: settings.cuisine.split(",").map(s => s.trim()).filter(Boolean),
        deliveryTime: settings.deliveryTime,
        address: settings.address,
        rating: settings.rating // Preserve rating
      }, { merge: true });
      
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">Restaurant Profile Settings</h2>
        <p className="text-gray-500 text-sm mt-1">This information is displayed to customers on the app.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Restaurant Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Store className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                required
                type="text" 
                value={settings.name}
                onChange={(e) => setSettings({...settings, name: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium transition-colors"
                placeholder="e.g. Biryani Paradise"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea 
                required
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium transition-colors resize-none"
                placeholder="Tell customers about your restaurant..."
              />
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Cover Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              settings.imageUrl ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            {isUploading ? (
              <div className="py-8 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                <span className="text-sm text-gray-500 font-medium">Processing cover image...</span>
              </div>
            ) : settings.imageUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src={settings.imageUrl} alt="Preview" className="w-32 h-24 rounded-xl object-cover shadow-sm border border-orange-100" />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-bold text-gray-900">Cover image uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">Click anywhere in this box to change the image</p>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-gray-500">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-medium">Click to upload your restaurant's cover photo</span>
                <span className="text-xs mt-1">JPG, PNG (Recommended: 800x600)</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Cuisines (comma separated)</label>
            <input 
              required
              type="text" 
              value={settings.cuisine}
              onChange={(e) => setSettings({...settings, cuisine: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium transition-colors"
              placeholder="e.g. North Indian, Biryani, Mughlai"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Estimated Delivery Time</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                required
                type="text" 
                value={settings.deliveryTime}
                onChange={(e) => setSettings({...settings, deliveryTime: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium transition-colors"
                placeholder="e.g. 30-45 min"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Full Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              required
              type="text" 
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium transition-colors"
              placeholder="123 Food Street, Culinary District"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit"
            disabled={saving || isUploading}
            className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
