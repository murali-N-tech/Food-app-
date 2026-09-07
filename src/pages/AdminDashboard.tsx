import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { LayoutDashboard, Users, ShoppingBag, DollarSign, Activity, PieChart } from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        setStats(prev => ({ ...prev, totalUsers: usersSnapshot.size }));
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();

    // Listen to orders for live revenue and order counts
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      let revenue = 0;
      let active = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === "DELIVERED") {
          revenue += data.total || 0;
        } else if (data.status !== "CANCELLED") {
          active++;
        }
      });
      setStats(prev => ({
        ...prev,
        totalOrders: snapshot.size,
        totalRevenue: revenue,
        activeOrders: active
      }));
      setLoading(false);
    });

    return () => unsubscribeOrders();
  }, [user, navigate]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-violet-950 text-white shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-violet-900">
          <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-sm">FF</div>
            FoodFusion
          </Link>
          <div className="mt-2 text-xs font-medium text-violet-400 uppercase tracking-wider">System Admin</div>
        </div>
        <nav className="p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 bg-violet-900 text-white px-4 py-3 rounded-xl transition-colors">
            <LayoutDashboard className="w-5 h-5 text-violet-400" />
            <span className="font-medium text-sm">Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-violet-400 hover:text-white hover:bg-violet-900 px-4 py-3 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Users & Roles</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-violet-400 hover:text-white hover:bg-violet-900 px-4 py-3 rounded-xl transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium text-sm">All Orders</span>
          </a>
          <a href="#" className="flex items-center gap-3 text-violet-400 hover:text-white hover:bg-violet-900 px-4 py-3 rounded-xl transition-colors">
            <PieChart className="w-5 h-5" />
            <span className="font-medium text-sm">Reports</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">Platform-wide statistics and management.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {loading ? <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div> : `₹${stats.totalRevenue.toLocaleString()}`}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">Platform Revenue</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.totalUsers}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">Registered Users</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.totalOrders}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">Total Orders</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-violet-600 relative z-10">
              {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.activeOrders}
            </div>
            <div className="text-sm font-bold text-violet-700 mt-1 relative z-10">Live Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}
