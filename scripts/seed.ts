import { auth, db } from "../src/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const foodImages = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400", // Burger
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400", // Pizza
  "https://images.unsplash.com/photo-1481070555726-e2fe83477d4a?auto=format&fit=crop&q=80&w=400", // Meat
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400", // Pasta
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400", // Salad
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400", // Pizza 2
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400", // Spread
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=400", // Dessert
  "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", // Tacos
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=400"  // Sushi
];

const restaurantImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1466978913421-bac2e5e42729?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1574936145840-28808d77a0b6?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800",
];

const restaurants = [
  { name: "Burger Station", cuisines: ["American", "Burgers"], icon: "🍔" },
  { name: "Pizza Paradise", cuisines: ["Italian", "Pizza"], icon: "🍕" },
  { name: "Spice Route", cuisines: ["Indian", "Curry"], icon: "🍛" },
  { name: "Healthy Greens", cuisines: ["Healthy", "Salads"], icon: "🥗" },
  { name: "Wok & Roll", cuisines: ["Chinese", "Noodles"], icon: "🍜" },
  { name: "Sweet Treats", cuisines: ["Desserts", "Bakery"], icon: "🍰" },
  { name: "Taco Fiesta", cuisines: ["Mexican", "Tacos"], icon: "🌮" },
  { name: "Sushi Master", cuisines: ["Japanese", "Sushi"], icon: "🍣" },
  { name: "Grill House", cuisines: ["Steakhouse", "BBQ"], icon: "🥩" },
  { name: "Pasta Bella", cuisines: ["Italian", "Pasta"], icon: "🍝" }
];

const itemPrefixes = ["Classic", "Spicy", "Signature", "Deluxe", "Premium", "Chef's Special", "Ultimate", "Homestyle", "Crispy", "Grilled"];

async function cleanExistingData() {
  console.log("Cleaning existing demo data...");
  const snapshot = await getDocs(collection(db, "restaurants"));
  for (const docSnapshot of snapshot.docs) {
    if (docSnapshot.data().isDemo) {
      console.log(`Deleting demo restaurant ${docSnapshot.id}...`);
      const menuSnapshot = await getDocs(collection(db, `restaurants/${docSnapshot.id}/menu`));
      for (const menuDoc of menuSnapshot.docs) {
        await deleteDoc(doc(db, `restaurants/${docSnapshot.id}/menu/${menuDoc.id}`));
      }
      await deleteDoc(doc(db, "restaurants", docSnapshot.id));
    }
  }
}

async function seed() {
  try {
    let user;
    try {
      const cred = await signInWithEmailAndPassword(auth, "seed@test.com", "password123");
      user = cred.user;
    } catch (e) {
      const cred = await createUserWithEmailAndPassword(auth, "seed@test.com", "password123");
      user = cred.user;
      await setDoc(doc(db, "users", user.uid), { role: "ADMIN", email: "seed@test.com", name: "Demo Admin" });
    }
    
    console.log("Logged in as admin:", user.uid);

    await cleanExistingData();

    for (let i = 0; i < restaurants.length; i++) {
      const rest = restaurants[i];
      
      const restData = {
        name: rest.name,
        cuisine: rest.cuisines,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        priceRange: ["₹", "₹₹", "₹₹₹"][Math.floor(Math.random() * 3)],
        deliveryTime: `${Math.floor(Math.random() * 20 + 20)}-${Math.floor(Math.random() * 20 + 40)} min`,
        imageUrl: restaurantImages[i],
        address: "Demo Street, City Center",
        isDemo: true // So we can identify and clean it later
      };

      const restRef = await addDoc(collection(db, "restaurants"), restData);
      console.log(`Added restaurant: ${rest.name} (${restRef.id})`);

      for (let j = 0; j < 10; j++) {
        const itemData = {
          name: `${itemPrefixes[j]} ${rest.cuisines[1]}`,
          price: Math.floor(Math.random() * 400) + 100,
          description: `A delicious ${itemPrefixes[j].toLowerCase()} portion of our finest ${rest.cuisines[1].toLowerCase()}, prepared fresh to order.`,
          category: j < 3 ? "Starters" : (j < 7 ? "Mains" : "Specials"),
          imageUrl: foodImages[j],
          available: true
        };
        await addDoc(collection(db, `restaurants/${restRef.id}/menu`), itemData);
      }
      console.log(` -> Added 10 items to ${rest.name}`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
