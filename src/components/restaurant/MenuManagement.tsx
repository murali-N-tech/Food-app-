import React, { useState, useEffect, useRef } from "react";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Loader2, Plus, Trash2, Edit2, Image as ImageIcon, Upload } from "lucide-react";

export function MenuManagement() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "Main Course",
    isVeg: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG with 0.7 quality to keep payload small for Firestore
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setNewItem(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `restaurants/${user.id}/menu`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, `restaurants/${user.id}/menu`), {
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        imageUrl: newItem.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
        category: newItem.category,
        isVeg: newItem.isVeg,
        available: true,
        createdAt: new Date()
      });
      setIsAdding(false);
      setNewItem({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "Main Course",
        isVeg: true
      });
    } catch (error) {
      console.error("Error adding menu item", error);
      alert("Failed to add menu item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, `restaurants/${user.id}/menu`, id));
    } catch (error) {
      console.error("Error deleting item", error);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `restaurants/${user.id}/menu`, id), {
        available: !currentStatus
      });
    } catch (error) {
      console.error("Error updating availability", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading menu...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-gray-100 bg-orange-50/30">
          <h3 className="text-lg font-bold text-gray-900 mb-4">New Menu Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Item Name</label>
                <input 
                  required
                  type="text" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  placeholder="e.g. Butter Chicken"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Price (₹)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  placeholder="e.g. 299"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
              <textarea 
                required
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium resize-none"
                placeholder="Delicious tender chicken in rich tomato gravy..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Category</label>
                <select 
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Breads">Breads</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Dietary Type</label>
                <select 
                  value={newItem.isVeg ? "true" : "false"}
                  onChange={(e) => setNewItem({...newItem, isVeg: e.target.value === "true"})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option value="true">Vegetarian</option>
                  <option value="false">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Item Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  newItem.imageUrl ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
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
                  <div className="py-4 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Processing image...</span>
                  </div>
                ) : newItem.imageUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={newItem.imageUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-gray-900">Image uploaded successfully</p>
                      <p className="text-xs text-gray-500">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center text-gray-500">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Click to upload an image</span>
                    <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                disabled={isSaving || isUploading}
                className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Item"}
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {menuItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No menu items yet</h3>
            <p className="text-gray-500">Start building your menu to attract customers.</p>
          </div>
        ) : (
          menuItems.map(item => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-gray-50 transition-colors">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover border border-gray-100 shadow-sm"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-2">{item.description}</p>
                <div className="font-black text-gray-900">₹{item.price}</div>
              </div>
              
              <div className="flex sm:flex-col gap-3 shrink-0">
                <button 
                  onClick={() => toggleAvailability(item.id, item.available)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${
                    item.available 
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {item.available ? 'Available' : 'Out of Stock'}
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 rounded-lg font-bold text-sm text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
