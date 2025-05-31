import { NextRequest, NextResponse } from "next/server";
import { getMeritsService } from "@/lib/blockscout-merits";
import { MilesCalculator } from "@/lib/miles-calculator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    const meritsService = getMeritsService();

    // Check if user already exists (to prevent duplicate signup bonuses)
    const userInfo = await meritsService.getUserInfo(userAddress);

    if (userInfo.exists) {
      return NextResponse.json(
        { error: "User already exists and has received signup bonus" },
        { status: 400 }
      );
    }

    // Calculate signup bonus
    const milesCalculation = MilesCalculator.calculateSignupBonus();

    // Create distribution for signup bonus
    const distributionId = `worldmap_signup_${userAddress}_${Date.now()}`;
    const distributionData = {
      id: distributionId,
      description: `WorldMap signup bonus for ${userAddress}`,
      distributions: [
        {
          address: userAddress,
          amount: milesCalculation.totalMiles.toString(),
        },
      ],
      create_missing_accounts: true, // Allow creating accounts for new users
      expected_total: milesCalculation.totalMiles.toString(),
    };

    // Distribute merits via Blockscout
    const distributionResult = await meritsService.distributeMerits(
      distributionData
    );

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        milesAwarded: milesCalculation.totalMiles,
        description: milesCalculation.description,
        activityType: milesCalculation.activityType,
        distributionId,
        accountsDistributed: distributionResult.accounts_distributed,
        accountsCreated: distributionResult.accounts_created,
      },
    });
  } catch (error) {
    console.error("Error awarding signup bonus:", error);
    return NextResponse.json(
      {
        error: "Failed to award signup bonus",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
