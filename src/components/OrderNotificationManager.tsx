import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ChefHat, Navigation, CheckCircle2, Package } from "lucide-react";
import React from "react";

export function OrderNotificationManager() {
  const { user } = useAuth();
  const previousStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) return;

    // Listen to all active orders for the current user
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const orderData = change.doc.data();
        const orderId = change.doc.id;
        const currentStatus = orderData.status;

        if (change.type === "added") {
          // Store the initial status without toasting (unless it's a brand new order they just placed, but usually we just track it)
          previousStatuses.current[orderId] = currentStatus;
        }

        if (change.type === "modified") {
          const prevStatus = previousStatuses.current[orderId];
          
          if (prevStatus && prevStatus !== currentStatus) {
            // Status changed, show toast
            showStatusToast(currentStatus, orderId);
          }
          
          // Update the ref
          previousStatuses.current[orderId] = currentStatus;
        }
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  const showStatusToast = (status: string, orderId: string) => {
    let message = "Order status updated";
    let icon = <CheckCircle2 className="w-5 h-5 text-gray-500" />;

    switch (status) {
      case "PREPARING":
        message = "Your food is being prepared! 👨‍🍳";
        icon = <ChefHat className="w-5 h-5 text-orange-500" />;
        break;
      case "READY_FOR_PICKUP":
        message = "Order is ready for pickup! 📦";
        icon = <Package className="w-5 h-5 text-orange-500" />;
        break;
      case "OUT_FOR_DELIVERY":
        message = "Your order is out for delivery! 🛵";
        icon = <Navigation className="w-5 h-5 text-blue-500" />;
        break;
      case "DELIVERED":
        message = "Your order has been delivered. Enjoy! 🎉";
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        break;
      case "PLACED":
        message = "Your order has been placed! ✅";
        icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        break;
    }

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          {icon}
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-900">{message}</span>
            <span className="text-xs text-gray-500">Order #{orderId.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
        style: {
          padding: '12px 16px',
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6'
        },
      }
    );
  };

  return null;
}
