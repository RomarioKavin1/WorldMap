import { NextRequest, NextResponse } from "next/server";

const MERITS_API_BASE = "https://merits.blockscout.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Merits login API called with body:", body);

    const { nonce, message, signature } = body;

    if (!nonce || !message || !signature) {
      console.log("Missing required fields:", {
        nonce: !!nonce,
        message: !!message,
        signature: !!signature,
      });
      return NextResponse.json(
        { error: "Missing required fields: nonce, message, signature" },
        { status: 400 }
      );
    }

    console.log("Making request to Merits API...");
    console.log("URL:", `${MERITS_API_BASE}/api/v1/auth/login`);
    console.log("Payload:", {
      nonce,
      message: message,
      signature: signature,
    });

    const response = await fetch(`${MERITS_API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nonce,
        message,
        signature,
      }),
    });

    console.log("Merits API response status:", response.status);
    console.log(
      "Merits API response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Merits API error response:", errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Merits API success response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error during Merits login:", error);

    // Return more specific error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to authenticate with Merits",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
