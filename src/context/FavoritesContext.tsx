import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteRestaurants: string[];
  favoriteDishes: string[];
  toggleFavoriteRestaurant: (id: string) => Promise<void>;
  toggleFavoriteDish: (id: string) => Promise<void>;
  isFavoriteRestaurant: (id: string) => boolean;
  isFavoriteDish: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<string[]>([]);
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFavoriteRestaurants([]);
      setFavoriteDishes([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFavoriteRestaurants(data.favoriteRestaurants || []);
          setFavoriteDishes(data.favoriteDishes || []);
        } else {
          // Initialize if document doesn't exist (though it should be created on login)
          await setDoc(userRef, { favoriteRestaurants: [], favoriteDishes: [] }, { merge: true });
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavoriteRestaurant = async (id: string) => {
    if (!user) return;
    const isFav = favoriteRestaurants.includes(id);
    const userRef = doc(db, 'users', user.id);

    try {
      if (isFav) {
        setFavoriteRestaurants(prev => prev.filter(restId => restId !== id));
        await updateDoc(userRef, {
          favoriteRestaurants: arrayRemove(id)
        });
      } else {
        setFavoriteRestaurants(prev => [...prev, id]);
        await updateDoc(userRef, {
          favoriteRestaurants: arrayUnion(id)
        });
      }
    } catch (error) {
      console.error("Error toggling favorite restaurant:", error);
      // Revert on error
      setFavoriteRestaurants(favoriteRestaurants);
    }
  };

  const toggleFavoriteDish = async (id: string) => {
    if (!user) return;
    const isFav = favoriteDishes.includes(id);
    const userRef = doc(db, 'users', user.id);

    try {
      if (isFav) {
        setFavoriteDishes(prev => prev.filter(dishId => dishId !== id));
        await updateDoc(userRef, {
          favoriteDishes: arrayRemove(id)
        });
      } else {
        setFavoriteDishes(prev => [...prev, id]);
        await updateDoc(userRef, {
          favoriteDishes: arrayUnion(id)
        });
      }
    } catch (error) {
      console.error("Error toggling favorite dish:", error);
      // Revert on error
      setFavoriteDishes(favoriteDishes);
    }
  };

  const isFavoriteRestaurant = (id: string) => favoriteRestaurants.includes(id);
  const isFavoriteDish = (id: string) => favoriteDishes.includes(id);

  return (
    <FavoritesContext.Provider value={{
      favoriteRestaurants,
      favoriteDishes,
      toggleFavoriteRestaurant,
      toggleFavoriteDish,
      isFavoriteRestaurant,
      isFavoriteDish
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
