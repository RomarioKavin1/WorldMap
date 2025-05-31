import { NextResponse } from "next/server";

const MERITS_API_BASE = "https://merits.blockscout.com";

export async function GET() {
  try {
    const response = await fetch(`${MERITS_API_BASE}/api/v1/auth/nonce`);

    if (!response.ok) {
      throw new Error(`Failed to get nonce: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting nonce:", error);
    return NextResponse.json({ error: "Failed to get nonce" }, { status: 500 });
  }
}
