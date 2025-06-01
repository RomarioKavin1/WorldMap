"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { useMerits } from "@/contexts/MeritsContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconCoins,
  IconSend,
  IconUser,
  IconCheck,
  IconX,
  IconLoader,
  IconWallet,
  IconArrowRight,
  IconRefresh,
  IconTrendingUp,
  IconCalendar,
  IconShield,
} from "@tabler/icons-react";

interface DistributionResult {
  success: boolean;
  worldAddress: string;
  deterministicAddress: string;
  amount: number;
  distributionResult?: any;
  message: string;
  error?: string;
  details?: string;
}

interface PartnerBalance {
  name: string;
  api_key: string;
  valid_since: string;
  valid_until: string;
  rate: string;
  balance: string;
  total_distributed: string;
  updated_at: string;
}

interface PartnerBalanceResponse {
  success: boolean;
  data?: PartnerBalance;
  message: string;
  error?: string;
  details?: string;
}

export default function TestMeritsDistributionPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [worldAddress, setWorldAddress] = useState("");
  const [amount, setAmount] = useState("100");
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionResult, setDistributionResult] =
    useState<DistributionResult | null>(null);
  const [deterministicAddress, setDeterministicAddress] = useState<
    string | null
  >(null);
  const [partnerBalance, setPartnerBalance] = useState<PartnerBalance | null>(
    null
  );
  const [isLoadingPartnerBalance, setIsLoadingPartnerBalance] = useState(false);
  const [partnerBalanceError, setPartnerBalanceError] = useState<string | null>(
    null
  );

  // Add useMerits hook
  const {
    isConnected: isMeritsConnected,
    isInitialized: isMeritsInitialized,
    balance: meritsBalance,
  } = useMerits();

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoadingSession(true);
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
          // Auto-fill with current user's address
          if (sessionData?.user?.id) {
            setWorldAddress(sessionData.user.id);
          }
        } else {
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
    // Load partner balance on component mount
    loadPartnerBalance();
  }, []);

  // Calculate deterministic address when world address changes
  useEffect(() => {
    if (worldAddress) {
      calculateDeterministicAddress(worldAddress);
    } else {
      setDeterministicAddress(null);
    }
  }, [worldAddress]);

  const calculateDeterministicAddress = async (address: string) => {
    try {
      console.log("🔢 Calculating deterministic address for:", address);

      // Validate input address
      if (!address || !address.startsWith("0x") || address.length !== 42) {
        console.error("Invalid address format:", address);
        setDeterministicAddress(null);
        return;
      }

      // Generate deterministic private key
      const basePrivateKey = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;
      if (!basePrivateKey) {
        console.error("Base private key not available in environment");
        setDeterministicAddress(null);
        return;
      }

      console.log(
        "🔑 Base private key available, generating deterministic key..."
      );

      const crypto = await import("crypto");
      const seed = crypto
        .createHash("sha256")
        .update(basePrivateKey + address.toLowerCase())
        .digest("hex");

      const privateKey = `0x${seed}`;
      console.log("🎯 Generated deterministic private key");

      // Get address from private key
      const { privateKeyToAccount } = await import("viem/accounts");
      const account = privateKeyToAccount(privateKey as `0x${string}`);

      console.log("📍 Calculated deterministic address:", account.address);
      setDeterministicAddress(account.address);
    } catch (error) {
      console.error("Error calculating deterministic address:", error);
      setDeterministicAddress(null);
    }
  };

  const formatAddress = (address?: string) => {
    if (!address || address.length < 10) {
      return "Invalid Address";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Function to load partner balance
  const loadPartnerBalance = async () => {
    setIsLoadingPartnerBalance(true);
    setPartnerBalanceError(null);

    try {
      const response = await fetch("/api/merits/partner-balance");
      const result: PartnerBalanceResponse = await response.json();

      if (result.success && result.data) {
        setPartnerBalance(result.data);
        console.log("✅ Partner balance loaded:", result.data);
      } else {
        setPartnerBalanceError(
          result.error || "Failed to load partner balance"
        );
        console.error("❌ Failed to load partner balance:", result);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setPartnerBalanceError(errorMessage);
      console.error("Error loading partner balance:", error);
    } finally {
      setIsLoadingPartnerBalance(false);
    }
  };

  const handleDistribute = async () => {
    if (!worldAddress || !amount) {
      console.error("Missing worldAddress or amount:", {
        worldAddress,
        amount,
      });
      return;
    }

    // Validate address format
    if (!worldAddress.startsWith("0x") || worldAddress.length !== 42) {
      setDistributionResult({
        success: false,
        worldAddress,
        deterministicAddress: "",
        amount: parseInt(amount),
        message: "Invalid World address format",
        error: "Address must be a valid Ethereum address (0x...)",
      });
      return;
    }

    // Validate amount
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setDistributionResult({
        success: false,
        worldAddress,
        deterministicAddress: deterministicAddress || "",
        amount: amountNum,
        message: "Invalid amount",
        error: "Amount must be a positive number",
      });
      return;
    }

    setIsDistributing(true);
    setDistributionResult(null);

    try {
      console.log("🚀 Starting distribution:", {
        worldAddress,
        amount: amountNum,
      });

      const response = await fetch("/api/merits/distribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          worldAddress,
          amount: amountNum,
        }),
      });

      const result = await response.json();
      console.log("📥 Distribution API response:", result);

      setDistributionResult(result);

      if (result.success) {
        console.log("✅ Merits distributed successfully:", result);
        // Refresh partner balance after successful distribution
        setTimeout(() => {
          loadPartnerBalance();
        }, 1000); // Small delay to ensure the distribution is processed
      } else {
        console.error("❌ Distribution failed:", result);
      }
    } catch (error) {
      console.error("Error distributing merits:", error);
      setDistributionResult({
        success: false,
        worldAddress,
        deterministicAddress: deterministicAddress || "",
        amount: parseInt(amount),
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Test Merits Distribution
          </h1>
          <p className="text-white/60 text-sm">
            Distribute merits to deterministic addresses based on World IDs
          </p>
        </motion.div>

        {/* Partner Balance Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Partner Balance
              </h2>
              <button
                onClick={loadPartnerBalance}
                disabled={isLoadingPartnerBalance}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors disabled:opacity-50"
              >
                <IconRefresh
                  size={16}
                  className={isLoadingPartnerBalance ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {isLoadingPartnerBalance ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <IconLoader
                    size={24}
                    className="animate-spin text-white/60 mx-auto mb-2"
                  />
                  <p className="text-white/60 text-sm">
                    Loading partner balance...
                  </p>
                </div>
              </div>
            ) : partnerBalanceError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <IconX size={20} className="text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-medium">
                      Failed to Load Balance
                    </h3>
                    <p className="text-red-400/80 text-sm">
                      {partnerBalanceError}
                    </p>
                  </div>
                </div>
              </div>
            ) : partnerBalance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Balance */}
                <div className="bg-green-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <IconCoins size={20} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-green-400 font-medium">
                        Available Balance
                      </h3>
                      <p className="text-white/60 text-sm">
                        Merits ready to distribute
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {parseFloat(partnerBalance.balance).toLocaleString()} Merits
                  </p>
                </div>

                {/* Total Distributed */}
                <div className="bg-blue-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <IconTrendingUp size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-blue-400 font-medium">
                        Total Distributed
                      </h3>
                      <p className="text-white/60 text-sm">
                        Merits distributed to users
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {parseFloat(
                      partnerBalance.total_distributed
                    ).toLocaleString()}{" "}
                    Merits
                  </p>
                </div>

                {/* Partner Information */}
                <div className="bg-purple-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <IconShield size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-purple-400 font-medium">
                        Partner Info
                      </h3>
                      <p className="text-white/60 text-sm">
                        API access details
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Name:</span>
                      <span className="text-white/80">
                        {partnerBalance.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Rate:</span>
                      <span className="text-white/80">
                        {partnerBalance.rate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="bg-orange-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <IconCalendar size={20} className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-orange-400 font-medium">
                        Validity Period
                      </h3>
                      <p className="text-white/60 text-sm">
                        API key access period
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Valid Since:</span>
                      <span className="text-white/80">
                        {new Date(
                          partnerBalance.valid_since
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Valid Until:</span>
                      <span className="text-white/80">
                        {new Date(
                          partnerBalance.valid_until
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Last Updated:</span>
                      <span className="text-white/80">
                        {new Date(partnerBalance.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">
                  No partner balance information available
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Distribution Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 space-y-6">
            {/* World Address Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                World Address
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <IconUser size={20} className="text-blue-400" />
                </div>
                <input
                  type="text"
                  value={worldAddress}
                  onChange={(e) => setWorldAddress(e.target.value)}
                  placeholder="0x742d35Cc6C2bC5C1D8a87d2dC5C9F2d9D1e4A8B3"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              {session?.user?.id && (
                <p className="text-white/50 text-xs mt-2">
                  Current user: {formatAddress(session.user.id)}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Amount (Merits)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <IconCoins size={20} className="text-green-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
            </div>

            {/* Deterministic Address Preview */}
            {deterministicAddress && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <IconWallet size={16} className="text-purple-400" />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium">
                    Deterministic Address
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs font-mono">
                    {deterministicAddress}
                  </span>
                  <IconArrowRight size={14} className="text-white/40" />
                  <span className="text-white/80 text-xs">
                    Merits will be sent here
                  </span>
                </div>
              </div>
            )}

            {/* Distribute Button */}
            <button
              onClick={handleDistribute}
              disabled={!worldAddress || !amount || isDistributing}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isDistributing ? (
                <>
                  <IconLoader size={20} className="animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  <IconSend size={20} />
                  Distribute Merits
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Distribution Result */}
        {distributionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div
              className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
                distributionResult.success
                  ? "border-green-500/30"
                  : "border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    distributionResult.success
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {distributionResult.success ? (
                    <IconCheck size={20} className="text-green-400" />
                  ) : (
                    <IconX size={20} className="text-red-400" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-medium ${
                      distributionResult.success
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {distributionResult.success
                      ? "Distribution Successful"
                      : "Distribution Failed"}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {distributionResult.message}
                  </p>
                </div>
              </div>

              {/* Result Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">World Address:</span>
                  <span className="text-white/80 font-mono">
                    {formatAddress(distributionResult.worldAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Deterministic Address:</span>
                  <span className="text-white/80 font-mono">
                    {formatAddress(distributionResult.deterministicAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Amount:</span>
                  <span className="text-white/80">
                    {distributionResult.amount} Merits
                  </span>
                </div>

                {!distributionResult.success && distributionResult.error && (
                  <div className="mt-3 p-3 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 text-xs">
                      Error: {distributionResult.error}
                    </p>
                    {distributionResult.details && (
                      <p className="text-red-400/80 text-xs mt-1">
                        Details: {distributionResult.details}
                      </p>
                    )}
                  </div>
                )}

                {distributionResult.success &&
                  distributionResult.distributionResult && (
                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
                      <p className="text-green-400 text-xs">
                        Distribution Result:
                      </p>
                      <pre className="text-green-400/80 text-xs mt-1 overflow-auto">
                        {JSON.stringify(
                          distributionResult.distributionResult,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              How It Works
            </h2>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">1</span>
                </div>
                <p>
                  Enter a World ID address - this can be any verified World ID
                  address
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">2</span>
                </div>
                <p>
                  The system generates a deterministic private key using:
                  SHA256(basePrivateKey + worldAddress.toLowerCase())
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">3</span>
                </div>
                <p>The deterministic address is derived from the private key</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">4</span>
                </div>
                <p>
                  Merits are distributed to the deterministic address via the
                  Blockscout Merits API
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="merit" />
    </div>
  );
}
