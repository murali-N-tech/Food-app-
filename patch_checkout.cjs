const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const target = `  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);`;

const replacement = `  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!address || address.trim() === '') {
      alert("Please enter a delivery address or use location detection.");
      return;
    }
    if (!restaurantId) {
      alert("Invalid cart state. Missing restaurant.");
      return;
    }
    setIsProcessing(true);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('patched checkout validation');
