import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example API routes (to be expanded)
  const mockRestaurants = [
    {
      id: "1",
      name: "Biryani Paradise",
      rating: 4.5,
      priceRange: "₹₹",
      tags: ["Indian", "Biryani"],
      deliveryTime: "25-30 mins",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Pizza Palace",
      rating: 4.2,
      priceRange: "₹₹",
      tags: ["Italian", "Pizza"],
      deliveryTime: "30-40 mins",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Healthy Greens",
      rating: 4.8,
      priceRange: "₹₹₹",
      tags: ["Healthy", "Salads"],
      deliveryTime: "20-25 mins",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2000&auto=format&fit=crop",
    }
  ];

  const mockMenu = [
    { id: "m1", restaurantId: "1", name: "Chicken Dum Biryani", description: "Aromatic basmati rice cooked with tender chicken pieces and secret spices.", price: 280, category: "Recommended", isVeg: false },
    { id: "m2", restaurantId: "1", name: "Paneer Biryani", description: "Vegetarian delight made with fresh paneer cubes and fragrant rice.", price: 240, category: "Recommended", isVeg: true },
    { id: "m3", restaurantId: "1", name: "Chicken 65", description: "Spicy, deep-fried chicken bites.", price: 180, category: "Starters", isVeg: false },
    { id: "m4", restaurantId: "1", name: "Gobi Manchurian", description: "Indo-Chinese style crispy cauliflower.", price: 150, category: "Starters", isVeg: true },
    { id: "m5", restaurantId: "2", name: "Margherita Pizza", description: "Classic cheese and tomato pizza.", price: 350, category: "Pizzas", isVeg: true },
    { id: "m6", restaurantId: "2", name: "Pepperoni Pizza", description: "Loaded with pepperoni and mozzarella.", price: 450, category: "Pizzas", isVeg: false },
    { id: "m7", restaurantId: "3", name: "Quinoa Salad", description: "Healthy bowl with quinoa, avocado, and lime dressing.", price: 320, category: "Salads", isVeg: true },
  ];

  app.get("/api/restaurants", (req, res) => {
    res.json(mockRestaurants);
  });

  app.get("/api/restaurants/:id", (req, res) => {
    const restaurant = mockRestaurants.find(r => r.id === req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  });

  app.get("/api/restaurants/:id/menu", (req, res) => {
    const menu = mockMenu.filter(m => m.restaurantId === req.params.id);
    res.json(menu);
  });

  const mockOrders: any[] = [];
  const mockUsers: any[] = [];

  app.get("/api/search", (req, res) => {
    const query = req.query.q?.toString().toLowerCase() || "";
    if (!query) return res.json([]);

    const results: any[] = [];

    // Search restaurants
    mockRestaurants.forEach(r => {
      if (r.name.toLowerCase().includes(query) || r.tags.some(t => t.toLowerCase().includes(query))) {
        results.push({ ...r, type: "restaurant" });
      }
    });

    // Search menu items
    mockMenu.forEach(m => {
      if (m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)) {
        const restaurant = mockRestaurants.find(r => r.id === m.restaurantId);
        results.push({ ...m, type: "dish", restaurantName: restaurant?.name });
      }
    });

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
