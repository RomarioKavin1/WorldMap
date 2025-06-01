import { NextRequest, NextResponse } from "next/server";

const MERITS_API_BASE = "https://merits.blockscout.com";

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get("authorization");
    console.log("Daily reward check API called");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid or missing Authorization header");
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    console.log("Making request to Merits daily reward check API...");

    // Forward the request to Merits API
    const response = await fetch(`${MERITS_API_BASE}/api/v1/user/daily/check`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("Merits daily reward API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Merits daily reward API error response:", errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
      throw new Error(`Merits API error: ${response.status} - ${errorText}`);
    }

    const dailyRewardData = await response.json();
    console.log("Daily reward data fetched successfully:", dailyRewardData);

    return NextResponse.json(dailyRewardData);
  } catch (error) {
    console.error("Error fetching daily reward data:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily reward data" },
      { status: 500 }
    );
  }
}
