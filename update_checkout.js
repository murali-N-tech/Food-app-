const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  'import { MapPin, CreditCard, Wallet, Banknote, ArrowRight, Loader2, ChevronRight, Navigation } from "lucide-react";',
  'import { MapPin, CreditCard, Wallet, Banknote, ArrowRight, Loader2, ChevronRight, Navigation, Tag, X } from "lucide-react";'
);

// 2. Add states and coupon logic inside component
const stateInsertPos = code.indexOf('const [isProcessing, setIsProcessing] = useState(false);');
const statesToAdd = `const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number, type: string} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;
    
    const code = couponCode.trim().toUpperCase();
    
    if (code === "WELCOME50") {
      const discount = Math.min(cartTotal * 0.5, 100);
      setAppliedCoupon({ code, discountAmount: discount, type: "percent" });
      setCouponSuccess(\`\${code} applied! ₹\${discount.toFixed(0)} off.\`);
    } else if (code === "FLAT100") {
      if (cartTotal < 200) {
        setCouponError("Minimum order value for FLAT100 is ₹200");
        return;
      }
      setAppliedCoupon({ code, discountAmount: 100, type: "flat" });
      setCouponSuccess(\`\${code} applied! ₹100 off.\`);
    } else if (code === "FREEDELIVERY") {
      setAppliedCoupon({ code, discountAmount: deliveryFee, type: "delivery" });
      setCouponSuccess(\`\${code} applied! Free delivery.\`);
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  `;

code = code.substring(0, stateInsertPos) + statesToAdd + code.substring(stateInsertPos);

// 3. Update total calculation and variables 
// First replace the original total calc
code = code.replace(
  'const platformFee = 5;\n  const deliveryFee = 30;\n  const total = cartTotal + platformFee + deliveryFee;',
  `const platformFee = 5;
  const deliveryFee = 30;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, cartTotal + platformFee + deliveryFee - discount);`
);

// We need to also patch handleApplyCoupon because deliveryFee is defined AFTER it in the original structure, 
// wait, the statesToAdd puts handleApplyCoupon before deliveryFee is defined! That's a ReferenceError.
// Let's refactor that.
