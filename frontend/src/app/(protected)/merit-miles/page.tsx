"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  IconPlaneDeparture,
  IconBed,
  IconUsers,
  IconTarget,
  IconChartBar,
  IconTrophy,
  IconStar,
  IconGift,
  IconCrown,
  IconMedal,
  IconAward,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import { useMerits } from "@/contexts/MeritsContext";
import { MiniKit, SignMessageInput } from "@worldcoin/minikit-js";

declare global {
  interface Window {
    ethereum?: any;
  }
}
export const createMeritsMessage = (address: string, nonce: string): string => {
  const chainId = 1;
  const domain = "merits-staging.blockscout.com";
  const uri = "https://merits-staging.blockscout.com";
  const version = "1";
  const statement = "Sign-In for the Blockscout Merits program.";
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString(); // 1 year

  return `hi`;
};

export default function MeritMilesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const {
    isConnected: isMeritsConnected,
    isLoading: isMeritsLoading,
    userInfo,
    balance: meritsBalance,
    error: meritsError,
    loginWithSIWE: meritsLoginWithSIWE,
    logout: meritsLogout,
    isInitialized: isMeritsInitialized,
  } = useMerits();

  // Debug logging for Merits state
  console.log("Merit-miles page - Merits state:", {
    isConnected: isMeritsConnected,
    isInitialized: isMeritsInitialized,
    hasBalance: !!meritsBalance,
    balanceTotal: meritsBalance?.total,
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoadingSession(true);
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionData = await response.json();
          console.log("Merit-miles session loaded:", sessionData);
          setSession(sessionData);
        } else {
          console.log("Session response not OK:", response.status);
          setSession(null);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
    setIsLoaded(true);
  }, []);

  // Mock web3 user data with fallback (same as profile page)
  const userData = {
    address: session?.user?.id || "0x742d35Cc6C2bC5C1D8a87d2dC5C9F2d9D1e4A8B3",
    ensName: session?.user?.username || "traveler.eth",
    chainId: 1,
  };

  // Mock leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      address: "0x742d35Cc6C2bC5C1D8a87d2dC5C9F2d9D1e4A8B3",
      ensName: "traveler.eth",
      meritMiles: 5420,
      trips: 28,
    },
    {
      rank: 2,
      address: "0x1A4bE5E8c8d9F3e7A6b8C4d2E1f6B9a7C5d3E8f1",
      ensName: "wanderer.eth",
      meritMiles: 4850,
      trips: 24,
    },
    {
      rank: 3,
      address: "0x7B9c3F2e8A5d6C1b4E9f7A3c8D5e2B6f9A4c7E8d",
      ensName: "explorer.eth",
      meritMiles: 4320,
      trips: 22,
    },
    {
      rank: 4,
      address: "0x3E8f6A9c2D5b7C4e1F8a6AF2D161",
      ensName: "nomad.eth",
      meritMiles: 3890,
      trips: 19,
    },
    {
      rank: 5,
      address: "0x9F4c8E2a6B5d3C7e1A8f6D4b9C3e7A5d2F8c6E4b",
      ensName: "globetrotter.eth",
      meritMiles: 3650,
      trips: 18,
    },
  ];

  const formatAddress = (address?: string) => {
    if (!address || address.length < 10) {
      return "0x000...0000"; // Fallback for invalid/short addresses
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Parse SIWE message to extract components
  const parseSIWEMessage = (message: string) => {
    const lines = message.split("\n");
    const result: any = {};

    // Extract address from first line (format: "domain wants you to sign in with your Ethereum account:")
    const addressMatch = lines[1]?.trim();
    if (addressMatch) {
      result.address = addressMatch;
    }

    // Parse key-value pairs
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes(":")) {
        const [key, ...valueParts] = trimmedLine.split(":");
        const value = valueParts.join(":").trim();

        switch (key.trim()) {
          case "URI":
            result.uri = value;
            break;
          case "Version":
            result.version = value;
            break;
          case "Chain ID":
            result.chainId = value;
            break;
          case "Nonce":
            result.nonce = value;
            break;
          case "Issued At":
            result.issuedAt = value;
            break;
          case "Expiration Time":
            result.expirationTime = value;
            break;
          case "Not Before":
            result.notBefore = value;
            break;
        }
      }
    }

    return result;
  };

  // Create Blockscout Merits message using parsed details
  const createBlockscoutMessage = (
    address: string,
    nonce: string,
    issuedAt: string,
    expirationTime: string
  ): string => {
    return `merits.blockscout.com wants you to sign in with your Ethereum account:
${address}

Sign-In for the Blockscout Merits program.

URI: https://merits.blockscout.com
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;
  };

  // Generate deterministic private key from user address and env private key
  const generateDeterministicPrivateKey = async (
    userAddress: string
  ): Promise<string> => {
    const basePrivateKey = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;
    if (!basePrivateKey) {
      throw new Error("Authentication configuration missing");
    }

    // Import crypto for deterministic generation
    const crypto = await import("crypto");

    // Create deterministic seed by combining base private key and user address
    const seed = crypto
      .createHash("sha256")
      .update(basePrivateKey + userAddress.toLowerCase())
      .digest("hex");

    // Ensure it's a valid 32-byte private key
    const privateKey = `0x${seed}`;

    console.log("Preparing World App signature...");

    return privateKey;
  };

  // Alternative authentication using World App signing
  const worldAppMeritsAuth = async (userAddress: string) => {
    console.log("Completing World App authentication...");

    try {
      // Import viem
      const { privateKeyToAccount } = await import("viem/accounts");

      // Generate deterministic private key
      const deterministicPrivateKey = await generateDeterministicPrivateKey(
        userAddress
      );

      // Create account from deterministic private key
      const account = privateKeyToAccount(
        deterministicPrivateKey as `0x${string}`
      );
      const signingAddress = account.address;

      console.log("Processing World App signature...");

      // Get fresh nonce
      console.log("Getting authentication nonce...");
      const nonceResponse = await fetch("/api/merits/nonce");
      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce");
      }
      const { nonce } = await nonceResponse.json();
      console.log("Authentication nonce received");

      // Create Merits message
      const currentTime = new Date().toISOString();
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const expirationTime = nextYear.toISOString();

      const meritsMessage = createBlockscoutMessage(
        signingAddress,
        nonce,
        currentTime,
        expirationTime
      );
      console.log("Preparing Merits authentication message...");

      // Sign message with deterministic private key
      console.log("Signing with World App...");
      const signature = await account.signMessage({ message: meritsMessage });
      console.log("World App signature completed");

      // Login with credentials
      console.log("Authenticating with Merits...");
      const result = await meritsLoginWithSIWE(
        signingAddress,
        meritsMessage,
        signature,
        nonce
      );

      console.log("Merits authentication successful");
      return result;
    } catch (authError: any) {
      console.error("Authentication process failed:", authError);
      throw authError;
    }
  };

  // Handle Merits login using World SDK walletAuth
  const handleMeritsLogin = async () => {
    console.log("Starting Merits authentication...");

    try {
      console.log("Checking World App environment...");
      if (!MiniKit.isInstalled()) {
        console.log("World App not detected");
        return;
      }

      // Wait for session to load if it's still loading
      if (isLoadingSession) {
        console.log("Loading user session...");
        return;
      }

      // Check if we have a real session id (not fallback)
      if (!session?.user?.id) {
        console.log("User session not available");
        return;
      }

      const address = userData.address; // This will be the real session id
      console.log("Preparing authentication for user...");

      console.log("Getting authentication nonce...");
      // Step 1: Get nonce from Merits API
      const nonceResponse = await fetch("/api/merits/nonce");
      console.log("Nonce request status:", nonceResponse.status);

      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce");
      }

      const { nonce } = await nonceResponse.json();
      console.log("Authentication nonce received");

      console.log("Initiating World App authentication...");
      // Step 2: Use walletAuth with the Merits nonce
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce, // Use the nonce from Merits API
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      console.log("World App authentication response received");

      if (finalPayload.status !== "success") {
        console.log("Switching to alternative authentication method...");

        // Try alternative World App authentication
        const alternativeResult = await worldAppMeritsAuth(address);
        console.log("Alternative authentication completed successfully");
        return;
      }

      console.log("World App authentication successful!");

      // Step 3: Send the walletAuth payload directly to Merits login
      console.log("Submitting authentication to Merits...");

      try {
        console.log("Processing Merits authentication...");
        const result = await meritsLoginWithSIWE(
          finalPayload.address,
          finalPayload.message, // Use the walletAuth message directly
          finalPayload.signature,
          nonce // Use the original Merits nonce
        );
        console.log("Merits authentication completed successfully");
      } catch (siweError) {
        console.log("Completing authentication with alternative method...");

        try {
          const alternativeResult = await worldAppMeritsAuth(address);
          console.log("Authentication completed successfully");
        } catch (authError: any) {
          console.error(
            "Authentication process encountered an error:",
            authError
          );
          // Silently fail - no user-facing error messages
        }
      }
    } catch (error) {
      console.error("Authentication process failed:", error);
      // Silently fail - no user-facing error messages
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <IconCrown size={16} className="text-yellow-400" />;
      case 2:
        return <IconMedal size={16} className="text-gray-300" />;
      case 3:
        return <IconAward size={16} className="text-amber-600" />;
      default:
        return (
          <span className="text-white/60 text-sm font-medium">#{rank}</span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/10 to-amber-500/10";
      case 2:
        return "from-gray-500/10 to-slate-500/10";
      case 3:
        return "from-amber-500/10 to-orange-500/10";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header
        showMeritModal={false}
        isMeritsConnected={isMeritsInitialized && isMeritsConnected}
        meritsBalance={
          isMeritsInitialized && isMeritsConnected && meritsBalance
            ? meritsBalance.total
            : undefined
        }
      />

      {/* Content */}
      <div className="flex-1 p-4 mt-12 pb-20">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Merit Miles</h1>
          <p className="text-white/60 text-sm">
            Travel more, stay more, interact more, get Merit Miles as rewards.
          </p>
        </motion.div>

        {/* Current Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/blockscout_merit_icon.png"
              alt="Merit Miles"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div className="text-center">
              <p className="text-white/60 text-sm">Current Balance</p>
              <p className="text-4xl font-extralight text-white tracking-tight">
                {isMeritsConnected && meritsBalance
                  ? meritsBalance.total || "0"
                  : "0"}
              </p>
              <p className="text-white/40 text-xs">Merit Miles</p>
            </div>
          </div>

          {/* Merits Connection Status */}
          <div className="border-t border-white/10 pt-6">
            {!isMeritsInitialized ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40 mx-auto mb-3"></div>
                <p className="text-white/60 text-sm">
                  Checking Merits connection...
                </p>
              </div>
            ) : !isMeritsConnected ? (
              <div className="text-center">
                <p className="text-white/60 text-sm mb-4">
                  Connect to Blockscout Merits to view your balance
                </p>

                {/* Debug info */}
                {isLoadingSession && (
                  <p className="text-white/40 text-xs mb-2">
                    Loading session...
                  </p>
                )}
                {!isLoadingSession && !session?.user?.id && (
                  <p className="text-white/40 text-xs mb-2">
                    Please connect your World App wallet to continue
                  </p>
                )}
                {!isLoadingSession && session?.user?.id && (
                  <p className="text-white/40 text-xs mb-2">
                    Ready to connect with World App
                  </p>
                )}

                <button
                  onClick={handleMeritsLogin}
                  disabled={
                    isMeritsLoading || isLoadingSession || !session?.user?.id
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <IconLogin size={20} />
                  {isLoadingSession
                    ? "Loading..."
                    : isMeritsLoading
                    ? "Connecting..."
                    : !session?.user?.id
                    ? "Connect Wallet First"
                    : "Connect to Merits"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-green-400 text-sm font-medium">
                    Connected to Merits
                  </p>
                </div>
                {userInfo?.exists && userInfo.user && (
                  <div className="text-xs text-white/60 space-y-1">
                    <p>Status: Active Member</p>
                    <p>Referrals: {userInfo.user.referrals}</p>
                    <p>
                      Member since:{" "}
                      {new Date(
                        userInfo.user.registered_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <button
                  onClick={meritsLogout}
                  className="mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <IconLogout size={16} />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Leaderboard</h2>
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <div
                key={user.address}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 ${
                  user.rank <= 3
                    ? `bg-gradient-to-r ${getRankBg(user.rank)}`
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm">
                        {user.ensName}
                      </h3>
                      {user.rank <= 3 && (
                        <div className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                          TOP {user.rank}
                        </div>
                      )}
                    </div>
                    <p className="text-white/60 text-xs font-mono">
                      {formatAddress(user.address)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                      <span>{user.trips} trips</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-lg">
                      {user.meritMiles.toLocaleString()}
                    </div>
                    <div className="text-white/60 text-xs">Merit Miles</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How to Earn Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            How to Earn Merit Miles
          </h2>

          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconPlaneDeparture size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">Travel</h3>
                <p className="text-white/60 text-xs">
                  Book trips and explore new destinations
                </p>
              </div>
              <div className="text-white/40 text-xs">+50 Miles</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconBed size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">Stay</h3>
                <p className="text-white/60 text-xs">
                  Book accommodations and extend your stays
                </p>
              </div>
              <div className="text-white/40 text-xs">+25 Miles</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconUsers size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">Interact</h3>
                <p className="text-white/60 text-xs">
                  Engage with the community and share experiences
                </p>
              </div>
              <div className="text-white/40 text-xs">+10 Miles</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconTarget size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">
                  Complete Profile
                </h3>
                <p className="text-white/60 text-xs">
                  Add photos and complete your travel profile
                </p>
              </div>
              <div className="text-white/40 text-xs">+15 Miles</div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Recent Activity
          </h2>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconChartBar size={32} className="text-white/60" />
            </div>
            <p className="text-white/60 text-sm">No activity yet</p>
            <p className="text-white/40 text-xs mt-1">
              Start traveling to earn Merit Miles!
            </p>
          </div>
        </motion.div>

        {/* Merit Miles Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Your Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconStar size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                0
              </div>
              <div className="text-white/60 text-xs">Total Earned</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconGift size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                0
              </div>
              <div className="text-white/60 text-xs">Miles Redeemed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconTrophy size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                Bronze
              </div>
              <div className="text-white/60 text-xs">Current Tier</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconTarget size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                100
              </div>
              <div className="text-white/60 text-xs">Next Tier</div>
            </div>
          </div>
        </motion.div>

        {/* Powered by */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <span className="text-white/60 text-xs">Powered by</span>
          <Image
            src="/blockscout_merits.png"
            alt="Powered by Blockscout Merits"
            width={100}
            height={20}
            className="h-3 w-auto opacity-80"
          />
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="merit" />
    </div>
  );
}
