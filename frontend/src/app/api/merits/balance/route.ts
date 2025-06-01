import { NextRequest, NextResponse } from "next/server";

const MERITS_API_BASE = "https://merits.blockscout.com";

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get("authorization");
    console.log(
      "Balance API called with auth header:",
      authHeader ? `${authHeader.substring(0, 20)}...` : "none"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid or missing Authorization header");
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    console.log("Making request to Merits balance API...");
    console.log("URL:", `${MERITS_API_BASE}/api/v1/user/balances`);

    // Forward the request to Merits API
    const response = await fetch(`${MERITS_API_BASE}/api/v1/user/balances`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("Merits balance API response status:", response.status);
    console.log(
      "Merits balance API response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Merits balance API error response:", errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
      throw new Error(`Merits API error: ${response.status} - ${errorText}`);
    }

    const balanceData = await response.json();
    console.log("Balance data fetched successfully:", balanceData);

    return NextResponse.json(balanceData);
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch user balance" },
      { status: 500 }
    );
  }
}
