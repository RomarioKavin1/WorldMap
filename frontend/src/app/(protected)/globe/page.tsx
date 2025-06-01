"use client";
import { ThreeGlobeHex } from "@/components/ThreeGlobeHex";
import { RecentTrips } from "@/components/RecentTrips";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { StayData } from "@/components/RecentTrips/Stay";
import { TripData } from "@/components/RecentTrips/Trip";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconMapPin,
  IconGlobe,
  IconUsers,
  IconTrendingUp,
  IconCalendar,
  IconBed,
  IconPlaneDeparture,
} from "@tabler/icons-react";
import { useMerits } from "@/contexts/MeritsContext";

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

export default function GlobePage() {
  const [arcPaths, setArcPaths] = useState<Coordinates[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [trips, setTrips] = useState<TripData[]>([]);

  // Add useMerits hook
  const {
    isConnected: isMeritsConnected,
    isInitialized: isMeritsInitialized,
    balance: meritsBalance,
  } = useMerits();

  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

  // Fallback sample arc paths for demonstration
  const sampleArcPaths = [
    [
      { lat: 40.7128, lng: -74.006 },
      { lat: 48.8566, lng: 2.3522 },
    ],
    [
      { lat: 35.6762, lng: 139.6503 },
      { lat: -33.8688, lng: 151.2093 },
    ],
  ];

  // Updated mock trip data
  const recentTrips: TripData[] = [
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

  // Recent stays data
  const recentStays: StayData[] = [
    {
      id: "s1",
      location: "Tokyo",
      country: "Japan",
      dates: "Dec 15-20, 2024",
      duration: "5 nights",
      accommodationType: "hotel",
    },
    {
      id: "s2",
      location: "Paris",
      country: "France",
      dates: "Nov 10-17, 2024",
      duration: "1 week",
      accommodationType: "airbnb",
    },
    {
      id: "s3",
      location: "London",
      country: "UK",
      dates: "Sep 5-12, 2024",
      duration: "1 week",
      accommodationType: "hotel",
    },
  ];

  // Geocoding functions
  const geocodeCountry = async (
    country: string,
    cache: Map<string, Coordinates>
  ): Promise<Coordinates> => {
    // Check cache first
    if (cache.has(country)) {
      return cache.get(country)!;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      country
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data: GeocodeResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const coordinates: Coordinates = {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };

        // Cache the result
        cache.set(country, coordinates);
        return coordinates;
      } else {
        throw new Error(`Geocoding failed for ${country}: ${data.status}`);
      }
    } catch (error) {
      console.error(`Error geocoding ${country}:`, error);
      throw error;
    }
  };

  const convertTripDataToCoordinates = async (
    tripData: TripData[]
  ): Promise<Coordinates[][]> => {
    const cache = new Map<string, Coordinates>();
    const coordinateArrays: Coordinates[][] = [];

    for (const trip of tripData) {
      try {
        const fromCoords = await geocodeCountry(trip.fromCountry, cache);
        const toCoords = await geocodeCountry(trip.toCountry, cache);

        coordinateArrays.push([fromCoords, toCoords]);

        // Add a small delay to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to convert trip data for ID ${trip.id}:`, error);
        // Continue with other trips even if one fails
      }
    }

    return coordinateArrays;
  };

  // Load trips from localStorage
  useEffect(() => {
    const loadTrips = () => {
      const stored = localStorage.getItem("trips");
      if (stored) {
        setTrips(JSON.parse(stored));
      } else {
        setTrips([]);
      }
    };
    loadTrips();
    window.addEventListener("storage", loadTrips);
    return () => window.removeEventListener("storage", loadTrips);
  }, []);

  // Convert trip data to coordinates on component mount and when trips change
  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE") {
          setArcPaths(sampleArcPaths);
          setIsLoading(false);
          return;
        }
        const coordinates = await convertTripDataToCoordinates(trips.length ? trips : recentTrips);
        setArcPaths(coordinates.length > 0 ? coordinates : sampleArcPaths);
      } catch (err) {
        setError("Failed to load trip coordinates. Using sample data.");
        setArcPaths(sampleArcPaths);
      } finally {
        setIsLoading(false);
      }
    };
    loadCoordinates();
  }, [trips]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header
        isMeritsConnected={isMeritsInitialized && isMeritsConnected}
        meritsBalance={
          isMeritsInitialized && isMeritsConnected && meritsBalance
            ? meritsBalance.total
            : undefined
        }
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading trip routes...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Full-screen Globe Section */}
      <div className="h-screen bg-black overflow-hidden mt-24">
        <ThreeGlobeHex
          arcPaths={arcPaths}
          animationSpeed={7}
          autoRotate={true}
        />
      </div>
      {/* Pull-up Drawer */}
      <RecentTrips trips={trips.length ? trips : recentTrips} stays={recentStays} />

      {/* Bottom Navigation */}
      <BottomNav activeTab="globe" />
    </div>
  );
}
