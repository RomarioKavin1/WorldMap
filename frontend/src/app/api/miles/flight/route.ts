import { NextRequest, NextResponse } from "next/server";
import { FlightMetadata } from "@/lib/miles-calculator";

interface FlightAwardRequest {
  userAddress: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  arrivalDate: string;
  distance?: number; // Optional, will be calculated if coordinates provided
  fromCoordinates?: { lat: number; lon: number };
  toCoordinates?: { lat: number; lon: number };
}

export async function POST(request: NextRequest) {
  try {
    const body: FlightAwardRequest = await request.json();
    const {
      userAddress,
      fromLocation,
      toLocation,
      departureDate,
      arrivalDate,
      distance,
      fromCoordinates,
      toCoordinates,
    } = body;

    // Validate required fields
    if (
      !userAddress ||
      !fromLocation ||
      !toLocation ||
      !departureDate ||
      !arrivalDate
    ) {
      return NextResponse.json(
        {
          error:
            "userAddress, fromLocation, toLocation, departureDate, and arrivalDate are required",
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

    // Create flight metadata
    const flightData: FlightMetadata = {
      fromLocation,
      toLocation,
      departureDate,
      arrivalDate,
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
          activityType: "flight",
          activityData: flightData,
        }),
      }
    );

    const awardResult = await awardResponse.json();

    if (!awardResponse.ok) {
      return NextResponse.json(awardResult, { status: awardResponse.status });
    }

    // Add flight-specific information to the response
    return NextResponse.json({
      ...awardResult,
      flightDetails: {
        route: `${fromLocation} → ${toLocation}`,
        distance: finalDistance
          ? `${finalDistance}km`
          : "Distance not calculated",
        departureDate,
        arrivalDate,
      },
    });
  } catch (error) {
    console.error("Error awarding flight miles:", error);
    return NextResponse.json(
      {
        error: "Failed to award flight miles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
