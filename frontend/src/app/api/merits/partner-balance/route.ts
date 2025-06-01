import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.MERITS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MERITS_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("🔍 Fetching partner balance information...");

    // Fetch partner balance from Blockscout Merits API
    const balanceResponse = await fetch(
      "https://merits-staging.blockscout.com/partner/api/v1/balance",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!balanceResponse.ok) {
      const errorText = await balanceResponse.text();
      console.error("Partner balance fetch failed:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch partner balance",
          details: errorText,
          status: balanceResponse.status,
        },
        { status: balanceResponse.status }
      );
    }

    const balanceData = await balanceResponse.json();
    console.log("✅ Partner balance fetched successfully:", balanceData);

    return NextResponse.json({
      success: true,
      data: balanceData,
      message: "Partner balance information retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching partner balance:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
