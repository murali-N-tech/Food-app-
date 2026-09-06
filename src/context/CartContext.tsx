import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, MenuItem } from "../types";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  restaurantId: string | null;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const clearCart = () => setItems([]);

  const addToCart = (item: MenuItem) => {
    setItems((current) => {
      // Cross-restaurant check: if adding item from different restaurant, clear cart
      // (For MVP, we just replace it. In a real app we might prompt the user)
      const isNewRestaurant = current.length > 0 && current[0].restaurantId !== item.restaurantId;
      const baseCart = isNewRestaurant ? [] : current;

      const existing = baseCart.find((i) => i.id === item.id);
      if (existing) {
        return baseCart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...baseCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((current) => current.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((current) => current.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);
  const restaurantId = items.length > 0 ? items[0].restaurantId : null;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, restaurantId }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
