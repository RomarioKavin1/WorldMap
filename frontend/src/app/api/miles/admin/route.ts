import { NextRequest, NextResponse } from "next/server";
import { getMeritsService } from "@/lib/blockscout-merits";
import { UserActivityTracker } from "@/lib/user-activity-tracker";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    const meritsService = getMeritsService();

    switch (action) {
      case "stats":
        // Get overall system statistics
        const allUsers = UserActivityTracker.getAllUsers();
        const partnerBalance = await meritsService.getPartnerBalance();

        const stats = {
          totalUsers: allUsers.length,
          usersWithFlights: allUsers.filter((user) => user.hasFlights).length,
          usersWithHotels: allUsers.filter((user) => user.hasHotels).length,
          usersWithBuses: allUsers.filter((user) => user.hasBuses).length,
          totalActivities: allUsers.reduce(
            (sum, user) => sum + user.totalActivities,
            0
          ),
          partnerInfo: {
            name: partnerBalance.name,
            balance: partnerBalance.balance,
            totalDistributed: partnerBalance.total_distributed,
            rate: partnerBalance.rate,
            validUntil: partnerBalance.valid_until,
          },
        };

        return NextResponse.json({
          success: true,
          data: stats,
        });

      case "balance":
        // Get partner balance only
        const balance = await meritsService.getPartnerBalance();
        return NextResponse.json({
          success: true,
          data: balance,
        });

      case "users":
        // Get all user activity data
        const users = UserActivityTracker.getAllUsers();
        return NextResponse.json({
          success: true,
          data: users,
        });

      case "export":
        // Export user data for backup
        const exportData = UserActivityTracker.exportData();
        return NextResponse.json({
          success: true,
          data: exportData,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: stats, balance, users, or export" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch admin data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "import":
        // Import user data from backup
        if (!data) {
          return NextResponse.json(
            { error: "Data is required for import" },
            { status: 400 }
          );
        }

        UserActivityTracker.importData(data);
        return NextResponse.json({
          success: true,
          message: "User data imported successfully",
        });

      case "reset":
        // Reset user data (use with caution!)
        const { userAddress } = body;
        UserActivityTracker.resetUserData(userAddress);

        return NextResponse.json({
          success: true,
          message: userAddress
            ? `Reset data for user ${userAddress}`
            : "Reset all user data",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: import or reset" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin POST endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to execute admin action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
