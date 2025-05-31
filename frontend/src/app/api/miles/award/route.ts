import { NextRequest, NextResponse } from "next/server";
import { getMeritsService } from "@/lib/blockscout-merits";
import {
  MilesCalculator,
  TravelActivity,
  FlightMetadata,
  HotelMetadata,
  BusMetadata,
} from "@/lib/miles-calculator";
import { UserActivityTracker } from "@/lib/user-activity-tracker";

interface AwardRequest {
  userAddress: string;
  activityType: "flight" | "hotel" | "bus";
  activityData: FlightMetadata | HotelMetadata | BusMetadata;
}

export async function POST(request: NextRequest) {
  try {
    const body: AwardRequest = await request.json();
    const { userAddress, activityType, activityData } = body;

    // Validate required fields
    if (!userAddress || !activityType || !activityData) {
      return NextResponse.json(
        { error: "userAddress, activityType, and activityData are required" },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!["flight", "hotel", "bus"].includes(activityType)) {
      return NextResponse.json(
        { error: "activityType must be flight, hotel, or bus" },
        { status: 400 }
      );
    }

    const meritsService = getMeritsService();

    // Check if this is the user's first activity of this type
    const isFirstOfType = UserActivityTracker.isFirstActivity(
      userAddress,
      activityType
    );

    // For hotels, calculate nights if not provided
    if (activityType === "hotel") {
      const hotelData = activityData as HotelMetadata;
      if (
        !hotelData.nights &&
        hotelData.checkInDate &&
        hotelData.checkOutDate
      ) {
        hotelData.nights = MilesCalculator.calculateNights(
          hotelData.checkInDate,
          hotelData.checkOutDate
        );
      }
    }

    // Create travel activity object
    const travelActivity: TravelActivity = {
      type: activityType,
      userId: userAddress,
      userAddress: userAddress,
      isFirstOfType,
      metadata: activityData,
    };

    // Calculate miles based on activity type and rules
    const milesCalculation = MilesCalculator.calculateMiles(travelActivity);

    // Create distribution for the calculated miles
    const distributionId = `worldmap_${activityType}_${userAddress}_${Date.now()}`;
    const distributionData = {
      id: distributionId,
      description: `WorldMap ${activityType} miles for ${userAddress}: ${milesCalculation.description}`,
      distributions: [
        {
          address: userAddress,
          amount: milesCalculation.totalMiles.toString(),
        },
      ],
      create_missing_accounts: true,
      expected_total: milesCalculation.totalMiles.toString(),
    };

    // Distribute merits via Blockscout
    const distributionResult = await meritsService.distributeMerits(
      distributionData
    );

    // Record the activity to track user's first activities
    UserActivityTracker.recordActivity(userAddress, activityType);

    // Get updated user stats
    const userStats = UserActivityTracker.getUserStats(userAddress);

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        activityType,
        isFirstOfType,
        milesAwarded: milesCalculation.totalMiles,
        baseMiles: milesCalculation.baseMiles,
        bonusMiles: milesCalculation.bonusMiles,
        description: milesCalculation.description,
        distributionId,
        accountsDistributed: distributionResult.accounts_distributed,
        userStats: {
          totalActivities: userStats.totalActivities,
          hasFlights: userStats.hasFlights,
          hasHotels: userStats.hasHotels,
          hasBuses: userStats.hasBuses,
        },
      },
    });
  } catch (error) {
    console.error("Error awarding miles:", error);
    return NextResponse.json(
      {
        error: "Failed to award miles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check what types of activities a user has done
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress parameter is required" },
        { status: 400 }
      );
    }

    const userStats = UserActivityTracker.getUserStats(userAddress);

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        stats: userStats,
        nextActivityBonuses: {
          flight: !userStats.hasFlights
            ? "First flight: 50 base miles + distance bonus"
            : "20 base miles + distance bonus",
          hotel: !userStats.hasHotels
            ? "First hotel: 40 base miles + 5 miles per night"
            : "15 base miles + 5 miles per night",
          bus: !userStats.hasBuses
            ? "First bus: 30 base miles + distance bonus"
            : "10 base miles + distance bonus",
        },
      },
    });
  } catch (error) {
    console.error("Error getting user activity stats:", error);
    return NextResponse.json(
      {
        error: "Failed to get user activity stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
