import { NextRequest, NextResponse } from "next/server";
import { getMeritsService } from "@/lib/blockscout-merits";

// GET /api/miles?address=0x... - Get user miles balance and leaderboard info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const meritsService = getMeritsService();

    // Get user info and leaderboard data in parallel
    const [userInfo, leaderboard] = await Promise.all([
      meritsService.getUserInfo(address),
      meritsService.getUserLeaderboard(address).catch(() => null), // Leaderboard might not exist for new users
    ]);

    return NextResponse.json({
      success: true,
      data: {
        address,
        exists: userInfo.exists,
        totalBalance: userInfo.user?.total_balance || "0",
        referrals: userInfo.user?.referrals || "0",
        registeredAt: userInfo.user?.registered_at || null,
        leaderboard: leaderboard
          ? {
              rank: leaderboard.rank,
              usersBelow: leaderboard.users_below,
              topPercent: leaderboard.top_percent,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user miles:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user miles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Legacy support (keeping for backward compatibility)
export async function POST() {
  return NextResponse.json({});
}
