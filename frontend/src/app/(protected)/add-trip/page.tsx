"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { useMerits } from "@/contexts/MeritsContext";
import AddFlight from "@/components/AddFlight";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  IconPlane,
  IconBed,
  IconCamera,
  IconMap,
  IconRoute,
  IconCalendar,
  IconClock,
  IconStar,
  IconPlus,
  IconShield,
  IconCheck,
  IconLoader,
  IconAlertCircle,
  IconSettings,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

export default function AddTripPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);

  // DEV MODE - Remove this section in production
  const [devMode, setDevMode] = useState(false);
  const [showDevToggle, setShowDevToggle] = useState(true); // Set to false to hide dev mode completely
  // END DEV MODE

  // Add useMerits hook
  const {
    isConnected: isMeritsConnected,
    isInitialized: isMeritsInitialized,
    balance: meritsBalance,
  } = useMerits();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // World ID Verification Handler
  const handleVerifyHumanity = async () => {
    setVerificationState("pending");

    try {
      const result = await MiniKit.commandsAsync.verify({
        action: "verify-humanity", // Make sure to create this action in the developer portal
        verification_level: VerificationLevel.Orb, // Using Orb for humanity verification
      });

      console.log("Verification result:", result.finalPayload);

      // Verify the proof on the server
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: "verify-humanity",
        }),
      });

      const data = await response.json();

      if (data.verifyRes?.success) {
        setVerificationState("success");
        setIsVerified(true);
      } else {
        setVerificationState("failed");
        setTimeout(() => {
          setVerificationState(undefined);
        }, 3000);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationState("failed");
      setTimeout(() => {
        setVerificationState(undefined);
      }, 3000);
    }
  };

  // Check if user can proceed (verified or dev mode enabled)
  const canProceed = isVerified || devMode;

  // Trip planning options
  const tripOptions = [
    {
      icon: IconPlane,
      title: "Flight Verification",
      description: "Verify your flights with email confirmations",
      available: true,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      icon: IconBed,
      title: "Hotel Bookings",
      description: "Add hotel and accommodation stays",
      available: false,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      icon: IconRoute,
      title: "Travel Routes",
      description: "Plan and track your travel routes",
      available: false,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
    {
      icon: IconCamera,
      title: "Photo Memories",
      description: "Upload and organize travel photos",
      available: false,
      color: "from-orange-500/20 to-yellow-500/20",
      borderColor: "border-orange-500/30",
    },
  ];

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

      {/* DEV MODE TOGGLE - Remove this entire section in production */}
      {showDevToggle && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => setDevMode(!devMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
              devMode
                ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            }`}
          >
            <IconSettings size={14} />
            <span>DEV</span>
            {devMode ? <IconEye size={14} /> : <IconEyeOff size={14} />}
          </button>
          {devMode && (
            <div className="absolute top-full right-0 mt-2 bg-orange-500/10 backdrop-blur-xl rounded-lg p-2 border border-orange-500/30">
              <p className="text-orange-400 text-xs">
                Dev mode: Verification bypassed
              </p>
            </div>
          )}
        </div>
      )}
      {/* END DEV MODE TOGGLE */}

      {/* Content */}
      <div className="flex-1 p-4 mt-12 pb-20">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Add New Trip</h1>
          <p className="text-white/60 text-sm">
            Document and verify your travel experiences
          </p>
        </motion.div>

        {/* Verification of Humanity Section */}
        {!canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconShield size={32} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Verification of Humanity
                </h2>
                <p className="text-white/60 text-base mb-8 max-w-md mx-auto leading-relaxed">
                  To ensure the integrity of our travel verification system,
                  please verify your humanity with World ID.
                </p>

                <button
                  onClick={handleVerifyHumanity}
                  disabled={verificationState === "pending"}
                  className={`w-full max-w-sm mx-auto py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    verificationState === "pending"
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {verificationState === "pending" ? (
                      <>
                        <IconLoader size={20} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : verificationState === "failed" ? (
                      <>
                        <IconAlertCircle size={20} />
                        <span>Verification Failed - Try Again</span>
                      </>
                    ) : (
                      <>
                        <IconShield size={20} />
                        <span>Verify with World ID</span>
                      </>
                    )}
                  </div>
                </button>

                {verificationState === "failed" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-500/10 backdrop-blur-xl rounded-xl"
                  >
                    <p className="text-red-400 text-sm">
                      Verification failed. Please try again or contact support
                      if the issue persists.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Success Message */}
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-green-500/10 backdrop-blur-xl rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <IconCheck size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Humanity Verified!</p>
                  <p className="text-green-400 text-sm">
                    You can now add and verify your trips
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <IconMap size={20} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-white/60">Countries</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <IconPlane size={20} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">24</div>
                  <div className="text-xs text-white/60">Flights</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <IconStar size={20} className="text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">1.2k</div>
                  <div className="text-xs text-white/60">Miles</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Flight Verification Section */}
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                  <IconPlane size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Flight Verification
                  </h2>
                  <p className="text-white/60 text-sm">
                    Upload your flight confirmation email
                  </p>
                </div>
              </div>
              <AddFlight isVerified={canProceed} />
            </div>
          </motion.div>
        )}

        {/* Trip Planning Options */}
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              More Trip Options
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {tripOptions.slice(1).map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isLoaded ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 border ${
                      option.available ? option.borderColor : "border-white/10"
                    } ${
                      option.available
                        ? "cursor-pointer hover:bg-white/10"
                        : "cursor-not-allowed opacity-50"
                    } transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon size={20} className="text-white/80" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">
                          {option.title}
                        </h4>
                        <p className="text-white/60 text-sm">
                          {option.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!option.available && (
                          <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                        <IconPlus size={16} className="text-white/40" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all duration-300 border border-white/10">
                  <IconCalendar
                    size={24}
                    className="text-white/80 mx-auto mb-2"
                  />
                  <div className="text-white/80 text-sm font-medium">
                    Plan Trip
                  </div>
                </button>
                <button className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all duration-300 border border-white/10">
                  <IconClock size={24} className="text-white/80 mx-auto mb-2" />
                  <div className="text-white/80 text-sm font-medium">
                    Recent Trips
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="add" />
    </div>
  );
}
