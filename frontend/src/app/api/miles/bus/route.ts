import { NextRequest, NextResponse } from "next/server";
import { BusMetadata } from "@/lib/miles-calculator";

interface BusAwardRequest {
  userAddress: string;
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  distance?: number; // Optional, will be calculated if coordinates provided
  fromCoordinates?: { lat: number; lon: number };
  toCoordinates?: { lat: number; lon: number };
}

export async function POST(request: NextRequest) {
  try {
    const body: BusAwardRequest = await request.json();
    const {
      userAddress,
      fromLocation,
      toLocation,
      travelDate,
      distance,
      fromCoordinates,
      toCoordinates,
    } = body;

    // Validate required fields
    if (!userAddress || !fromLocation || !toLocation || !travelDate) {
      return NextResponse.json(
        {
          error:
            "userAddress, fromLocation, toLocation, and travelDate are required",
        },
        { status: 400 }
      );
    }

    // Calculate distance if coordinates are provided and distance is not
    let finalDistance = distance;
    if (!finalDistance && fromCoordinates && toCoordinates) {
      const { MilesCalculator } = await import("@/lib/miles-calculator");
      finalDistance = MilesCalculator.calculateDistance(
        fromCoordinates.lat,
        fromCoordinates.lon,
        toCoordinates.lat,
        toCoordinates.lon
      );
    }

    // Create bus metadata
    const busData: BusMetadata = {
      fromLocation,
      toLocation,
      travelDate,
      distance: finalDistance,
    };

    // Forward to the general award endpoint
    const awardResponse = await fetch(
      `${request.nextUrl.origin}/api/miles/award`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
          activityType: "bus",
          activityData: busData,
        }),
      }
    );

    const awardResult = await awardResponse.json();

    if (!awardResponse.ok) {
      return NextResponse.json(awardResult, { status: awardResponse.status });
    }

    // Add bus-specific information to the response
    return NextResponse.json({
      ...awardResult,
      busDetails: {
        route: `${fromLocation} → ${toLocation}`,
        distance: finalDistance
          ? `${finalDistance}km`
          : "Distance not calculated",
        travelDate,
      },
    });
  } catch (error) {
    console.error("Error awarding bus miles:", error);
    return NextResponse.json(
      {
        error: "Failed to award bus miles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
