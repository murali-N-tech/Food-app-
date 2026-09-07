const fs = require('fs');
let code = fs.readFileSync('src/context/CartContext.tsx', 'utf8');

code = code.replace(
  'import { createContext, useContext, useState, ReactNode } from "react";',
  'import { createContext, useContext, useState, useEffect, ReactNode } from "react";'
);

code = code.replace(
  'const [items, setItems] = useState<CartItem[]>([]);',
  `const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);`
);

fs.writeFileSync('src/context/CartContext.tsx', code);
console.log('patched cart');
