import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  id: string;
  type: "restaurant" | "dish";
  className?: string;
  iconClassName?: string;
}

export function FavoriteButton({ id, type, className = "", iconClassName = "w-5 h-5" }: FavoriteButtonProps) {
  const { isFavoriteRestaurant, isFavoriteDish, toggleFavoriteRestaurant, toggleFavoriteDish } = useFavorites();
  const { user } = useAuth();

  const isFav = type === "restaurant" ? isFavoriteRestaurant(id) : isFavoriteDish(id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save favorites.");
      return;
    }

    if (type === "restaurant") {
      await toggleFavoriteRestaurant(id);
      toast.success(isFav ? "Removed from favorites" : "Added to favorites", {
        icon: isFav ? "💔" : "❤️",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } else {
      await toggleFavoriteDish(id);
      toast.success(isFav ? "Removed from favorites" : "Added to favorites", {
        icon: isFav ? "💔" : "❤️",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all ${
        isFav
          ? "bg-rose-100 text-rose-500 hover:bg-rose-200"
          : "bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-gray-100"
      } ${className}`}
      aria-label="Toggle Favorite"
    >
      <Heart className={`${iconClassName} ${isFav ? "fill-rose-500" : ""}`} />
    </button>
  );
}
