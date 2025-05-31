import { NextRequest, NextResponse } from "next/server";
import { HotelMetadata } from "@/lib/miles-calculator";

interface HotelAwardRequest {
  userAddress: string;
  location: string;
  checkInDate: string;
  checkOutDate: string;
  nights?: number; // Optional, will be calculated from dates if not provided
}

export async function POST(request: NextRequest) {
  try {
    const body: HotelAwardRequest = await request.json();
    const { userAddress, location, checkInDate, checkOutDate, nights } = body;

    // Validate required fields
    if (!userAddress || !location || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        {
          error:
            "userAddress, location, checkInDate, and checkOutDate are required",
        },
        { status: 400 }
      );
    }

    // Calculate nights if not provided
    let finalNights = nights;
    if (!finalNights) {
      const { MilesCalculator } = await import("@/lib/miles-calculator");
      finalNights = MilesCalculator.calculateNights(checkInDate, checkOutDate);
    }

    // Validate nights
    if (finalNights <= 0) {
      return NextResponse.json(
        {
          error:
            "Invalid stay duration: check-out date must be after check-in date",
        },
        { status: 400 }
      );
    }

    // Create hotel metadata
    const hotelData: HotelMetadata = {
      location,
      checkInDate,
      checkOutDate,
      nights: finalNights,
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
          activityType: "hotel",
          activityData: hotelData,
        }),
      }
    );

    const awardResult = await awardResponse.json();

    if (!awardResponse.ok) {
      return NextResponse.json(awardResult, { status: awardResponse.status });
    }

    // Add hotel-specific information to the response
    return NextResponse.json({
      ...awardResult,
      hotelDetails: {
        location,
        checkInDate,
        checkOutDate,
        nights: finalNights,
        stayDuration: `${finalNights} night${finalNights > 1 ? "s" : ""}`,
      },
    });
  } catch (error) {
    console.error("Error awarding hotel miles:", error);
    return NextResponse.json(
      {
        error: "Failed to award hotel miles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
