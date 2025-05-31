"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ThreeGlobeSingle } from "@/components/ThreeGlobeSingle";
import { TripData } from "@/components/RecentTrips/Trip";
import {
  IconPlaneDeparture,
  IconCar,
  IconShip,
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [fromCoords, setFromCoords] = useState<Coordinates | null>(null);
  const [toCoords, setToCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample trip data (in a real app, this would come from an API)
  const sampleTrips: TripData[] = [
    {
      id: "1",
      fromCountry: "USA",
      toCountry: "Japan",
      date: "Dec 2024",
      travelType: "flight",
    },
    {
      id: "2",
      fromCountry: "Japan",
      toCountry: "France",
      date: "Nov 2024",
      travelType: "flight",
    },
    {
      id: "3",
      fromCountry: "France",
      toCountry: "USA",
      date: "Oct 2024",
      travelType: "flight",
    },
    {
      id: "4",
      fromCountry: "USA",
      toCountry: "UK",
      date: "Sep 2024",
      travelType: "car",
    },
  ];

  // Google Maps API key
  const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

  // Fallback coordinates
  const fallbackCoords = {
    USA: { lat: 40.7128, lng: -74.006 }, // New York
    Japan: { lat: 35.6762, lng: 139.6503 }, // Tokyo
    France: { lat: 48.8566, lng: 2.3522 }, // Paris
    UK: { lat: 51.5074, lng: -0.1278 }, // London
  };

  // Get travel type icon
  const getTravelTypeIcon = (travelType: TripData["travelType"], size = 20) => {
    switch (travelType) {
      case "flight":
        return <IconPlaneDeparture size={size} />;
      case "car":
        return <IconCar size={size} />;
      case "boat":
        return <IconShip size={size} />;
      default:
        return "🌍";
    }
  };

  // Get travel type color
  const getTravelTypeColor = (travelType: TripData["travelType"]) => {
    switch (travelType) {
      case "flight":
        return "from-sky-500/30 to-blue-500/30";
      case "car":
        return "from-emerald-500/30 to-green-500/30";
      case "boat":
        return "from-cyan-500/30 to-teal-500/30";
      default:
        return "from-purple-500/30 to-pink-500/30";
    }
  };

  // Geocoding function
  const geocodeLocation = async (location: string): Promise<Coordinates> => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE") {
      // Use fallback coordinates
      return (
        fallbackCoords[location as keyof typeof fallbackCoords] || {
          lat: 0,
          lng: 0,
        }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data: GeocodeResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };
      } else {
        throw new Error(`Geocoding failed for ${location}: ${data.status}`);
      }
    } catch (error) {
      console.error(`Error geocoding ${location}:`, error);
      // Fallback to hardcoded coordinates
      return (
        fallbackCoords[location as keyof typeof fallbackCoords] || {
          lat: 0,
          lng: 0,
        }
      );
    }
  };

  // Load trip data and coordinates
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Find trip by ID
        const trip = sampleTrips.find((t) => t.id === tripId);
        if (!trip) {
          setError("Trip not found");
          return;
        }

        setTripData(trip);

        // Get coordinates for both locations
        const [fromCoordinates, toCoordinates] = await Promise.all([
          geocodeLocation(trip.fromCountry),
          geocodeLocation(trip.toCountry),
        ]);

        setFromCoords(fromCoordinates);
        setToCoords(toCoordinates);

        console.log("Trip loaded:", trip);
        console.log("From coordinates:", fromCoordinates);
        console.log("To coordinates:", toCoordinates);
      } catch (err) {
        console.error("Error loading trip data:", err);
        setError("Failed to load trip data");
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading trip details...</p>
          </div>
        </div>
        <BottomNav activeTab="trips" />
      </div>
    );
  }

  if (error || !tripData || !fromCoords || !toCoords) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-white/60 text-lg mb-2">Trip Not Found</h3>
            <p className="text-white/40 text-sm mb-4">
              {error || "The requested trip could not be loaded."}
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        <BottomNav activeTab="trips" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header />

      {/* Back Button */}
      <div className="absolute top-20 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 px-4 py-3 bg-white/5 backdrop-blur-xl rounded-xl hover:bg-white/10 transition-all duration-200"
        >
          <IconArrowLeft size={18} className="text-white/80" />
          <span className="text-sm text-white/80">Back</span>
        </button>
      </div>

      {/* Globe Section */}
      <div className="h-[60vh] bg-black overflow-hidden mt-16 relative">
        <ThreeGlobeSingle
          fromCoords={fromCoords}
          toCoords={toCoords}
          autoRotate={true}
          showAnimation={true}
        />
      </div>

      {/* Trip Details Section */}
      <div className="flex-1 bg-black p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          {/* Trip Header Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${getTravelTypeColor(
                  tripData.travelType
                )} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}
              >
                {getTravelTypeIcon(tripData.travelType, 32)}
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {tripData.fromCountry} → {tripData.toCountry}
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
                  TRIP
                </div>
                <div className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full capitalize">
                  {tripData.travelType}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Cards */}
          <div className="space-y-3">
            {/* Date Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <IconCalendar size={20} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">
                    Travel Date
                  </h3>
                  <p className="text-white/60 text-sm">{tripData.date}</p>
                </div>
              </div>
            </div>

            {/* Route Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <IconMapPin size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">Route</h3>
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <span>{tripData.fromCountry}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/40"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    <span>{tripData.toCountry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Method Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getTravelTypeColor(
                    tripData.travelType
                  )} rounded-lg flex items-center justify-center`}
                >
                  {getTravelTypeIcon(tripData.travelType, 20)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">
                    Travel Method
                  </h3>
                  <p className="text-white/60 text-sm">
                    {tripData.travelType === "flight" && "Flight"}
                    {tripData.travelType === "car" && "Road Trip"}
                    {tripData.travelType === "boat" && "Maritime Journey"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="trips" />
    </div>
  );
}
