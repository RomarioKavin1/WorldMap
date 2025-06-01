import { NextRequest, NextResponse } from "next/server";

// Generate deterministic private key from user address and env private key
const generateDeterministicPrivateKey = async (
  worldAddress: string
): Promise<string> => {
  const basePrivateKey = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;
  if (!basePrivateKey) {
    throw new Error("TEST_PRIVATE_KEY environment variable not configured");
  }

  // Import crypto for deterministic generation
  const crypto = await import("crypto");

  // Create deterministic seed by combining base private key and user address
  const seed = crypto
    .createHash("sha256")
    .update(basePrivateKey + worldAddress.toLowerCase())
    .digest("hex");

  // Ensure it's a valid 32-byte private key
  const privateKey = `0x${seed}`;

  return privateKey;
};

// Get address from deterministic private key
const getAddressFromPrivateKey = async (
  privateKey: string
): Promise<string> => {
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return account.address;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { worldAddress, amount } = body;

    console.log("🎯 Distribution request received:", { worldAddress, amount });

    if (!worldAddress) {
      return NextResponse.json(
        { error: "worldAddress is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Validate worldAddress format
    if (!worldAddress.startsWith("0x") || worldAddress.length !== 42) {
      return NextResponse.json(
        { error: "Invalid World address format" },
        { status: 400 }
      );
    }

    console.log("🎯 Distributing merits for World address:", worldAddress);

    // Generate deterministic private key for this World address
    const deterministicPrivateKey = await generateDeterministicPrivateKey(
      worldAddress
    );
    console.log("🔑 Generated deterministic private key successfully");

    // Get the deterministic address
    const deterministicAddress = await getAddressFromPrivateKey(
      deterministicPrivateKey
    );
    console.log("📍 Deterministic address:", deterministicAddress);

    // Validate deterministic address was generated correctly
    if (!deterministicAddress || !deterministicAddress.startsWith("0x")) {
      return NextResponse.json(
        { error: "Failed to generate valid deterministic address" },
        { status: 500 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.MERITS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MERITS_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("🚀 Calling Merits distribution API...");

    // Use the correct staging endpoint from the documentation
    const distributionUrl =
      "https://merits-staging.blockscout.com/partner/api/v1/distribute";
    console.log("📡 Distribution URL:", distributionUrl);

    // Create the request body according to the official API documentation
    const requestBody = {
      id: `worldmap_distribution_${Date.now()}`, // Unique ID for this distribution
      description: `Merit distribution for World ID: ${worldAddress} via Worldmap application`,
      distributions: [
        {
          address: deterministicAddress,
          amount: amount.toString(),
        },
      ],
      create_missing_accounts: true, // Allow distribution to non-registered accounts
      expected_total: amount.toString(), // Must equal sum of all amounts
    };
    console.log("📦 Request body:", requestBody);

    // Distribute merits to the deterministic address
    const distributionResponse = await fetch(distributionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(
      "📥 Distribution response status:",
      distributionResponse.status
    );

    if (!distributionResponse.ok) {
      const errorText = await distributionResponse.text();
      console.error("❌ Merits distribution failed:", errorText);

      // Return more detailed error information
      return NextResponse.json(
        {
          error: "Failed to distribute merits",
          details: errorText,
          statusCode: distributionResponse.status,
          url: distributionUrl,
          requestBody: requestBody,
        },
        { status: distributionResponse.status }
      );
    }

    const distributionResult = await distributionResponse.json();
    console.log("✅ Merits distributed successfully:", distributionResult);

    return NextResponse.json({
      success: true,
      worldAddress,
      deterministicAddress,
      amount,
      distributionResult,
      message: `Successfully distributed ${amount} merits to deterministic address`,
    });
  } catch (error) {
    console.error("💥 Error in merits distribution:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
