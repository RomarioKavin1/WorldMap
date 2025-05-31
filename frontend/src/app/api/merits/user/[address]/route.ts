import { NextRequest, NextResponse } from "next/server";

const MERITS_API_BASE = "https://merits.blockscout.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${MERITS_API_BASE}/api/v1/auth/user/${address}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ exists: false });
      }
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting user info:", error);
    return NextResponse.json(
      { error: "Failed to get user information" },
      { status: 500 }
    );
  }
}
