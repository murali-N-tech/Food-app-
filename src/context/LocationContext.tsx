import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  address: string;
  isLocating: boolean;
  locationError: string;
  detectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("Detecting location...");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setAddress("Location tracking not supported");
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            setAddress(parts.slice(0, 3).join(', '));
          } else {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setAddress("Unable to determine address");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setAddress("Location access denied");
        setLocationError("Failed to detect location. Please allow permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  return (
    <LocationContext.Provider value={{ address, isLocating, locationError, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
