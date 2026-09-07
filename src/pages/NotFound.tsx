import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-orange-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">404 - Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/"
        className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
