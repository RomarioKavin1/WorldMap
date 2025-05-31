import { useState, useCallback } from "react";

interface MilesBalance {
  address: string;
  exists: boolean;
  totalBalance: string;
  referrals: string;
  registeredAt: string | null;
  leaderboard: {
    rank: string;
    usersBelow: string;
    topPercent: number;
  } | null;
}

interface FlightData {
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  arrivalDate: string;
  distance?: number;
  fromCoordinates?: { lat: number; lon: number };
  toCoordinates?: { lat: number; lon: number };
}

interface HotelData {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  nights?: number;
}

interface BusData {
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  distance?: number;
  fromCoordinates?: { lat: number; lon: number };
  toCoordinates?: { lat: number; lon: number };
}

interface MilesAwardResult {
  success: boolean;
  data?: {
    userAddress: string;
    activityType: string;
    isFirstOfType: boolean;
    milesAwarded: number;
    baseMiles: number;
    bonusMiles: number;
    description: string;
    distributionId: string;
    accountsDistributed: string;
    userStats: {
      totalActivities: number;
      hasFlights: boolean;
      hasHotels: boolean;
      hasBuses: boolean;
    };
  };
  error?: string;
}

export const useMiles = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(
    async <T>(url: string, options?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Miles API error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get user miles balance and leaderboard info
  const getUserMiles = useCallback(
    async (userAddress: string): Promise<MilesBalance | null> => {
      const result = await handleRequest<{
        success: boolean;
        data: MilesBalance;
      }>(`/api/miles?address=${encodeURIComponent(userAddress)}`);
      return result?.data || null;
    },
    [handleRequest]
  );

  // Award signup bonus
  const awardSignupBonus = useCallback(
    async (userAddress: string): Promise<MilesAwardResult | null> => {
      return await handleRequest<MilesAwardResult>("/api/miles/signup-bonus", {
        method: "POST",
        body: JSON.stringify({ userAddress }),
      });
    },
    [handleRequest]
  );

  // Award flight miles
  const awardFlightMiles = useCallback(
    async (
      userAddress: string,
      flightData: FlightData
    ): Promise<MilesAwardResult | null> => {
      return await handleRequest<MilesAwardResult>("/api/miles/flight", {
        method: "POST",
        body: JSON.stringify({ userAddress, ...flightData }),
      });
    },
    [handleRequest]
  );

  // Award hotel miles
  const awardHotelMiles = useCallback(
    async (
      userAddress: string,
      hotelData: HotelData
    ): Promise<MilesAwardResult | null> => {
      return await handleRequest<MilesAwardResult>("/api/miles/hotel", {
        method: "POST",
        body: JSON.stringify({ userAddress, ...hotelData }),
      });
    },
    [handleRequest]
  );

  // Award bus miles
  const awardBusMiles = useCallback(
    async (
      userAddress: string,
      busData: BusData
    ): Promise<MilesAwardResult | null> => {
      return await handleRequest<MilesAwardResult>("/api/miles/bus", {
        method: "POST",
        body: JSON.stringify({ userAddress, ...busData }),
      });
    },
    [handleRequest]
  );

  // Get user activity stats
  const getUserStats = useCallback(
    async (userAddress: string) => {
      const result = await handleRequest<{ success: boolean; data: any }>(
        `/api/miles/award?userAddress=${encodeURIComponent(userAddress)}`
      );
      return result?.data || null;
    },
    [handleRequest]
  );

  // Get admin stats (for admin dashboard)
  const getAdminStats = useCallback(async () => {
    const result = await handleRequest<{ success: boolean; data: any }>(
      "/api/miles/admin?action=stats"
    );
    return result?.data || null;
  }, [handleRequest]);

  return {
    loading,
    error,
    getUserMiles,
    awardSignupBonus,
    awardFlightMiles,
    awardHotelMiles,
    awardBusMiles,
    getUserStats,
    getAdminStats,
  };
};
