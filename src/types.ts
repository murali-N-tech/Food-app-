export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceRange: string;
  tags: string[];
  deliveryTime: string;
  image: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
