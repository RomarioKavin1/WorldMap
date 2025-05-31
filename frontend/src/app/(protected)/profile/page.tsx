"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  IconWallet,
  IconSearch,
  IconCopy,
  IconSettings,
  IconGlobe,
  IconPlaneDeparture,
  IconBed,
  IconStar,
  IconEdit,
  IconBell,
  IconShield,
  IconLogout,
  IconCheck,
} from "@tabler/icons-react";
import { RegisterButton } from "@/components/RegisterButton";
import { Marble } from "@worldcoin/mini-apps-ui-kit-react";
import { signOut } from "@/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const router = useRouter();
  // Fetch session data on component mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoadingSession(true);
        // Use the same API route as Header component
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
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
  }, []);

  // Mock web3 user data with fallback
  const userData = {
    address:
      session?.user?.address || "0x742d35Cc6C2bC5C1D8a87d2dC5C9F2d9D1e4A8B3",
    ensName: session?.user?.username || "traveler.eth",
    chainId: 1,
  };

  // Mock stats
  const userStats = {
    totalTrips: 12,
    countriesVisited: 8,
    totalStays: 15,
    meritMiles: 1250,
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userData.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address?: string) => {
    if (!address || address.length < 10) {
      return "0x000...0000"; // Fallback for invalid/short addresses
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 p-4 mt-12 pb-20">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-white/60 text-sm">
            Manage your web3 wallet and travel preferences
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconSearch size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by wallet address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
                />
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <IconWallet size={16} className="text-white/60" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <Marble
                    src={session?.user?.profilePictureUrl}
                    className="w-20 h-20"
                  />
                </div>
                {/* <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <IconCheck size={16} className="text-green-400" />
                </div> */}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-white">
                    {isLoadingSession ? (
                      <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
                    ) : (
                      userData.ensName
                    )}
                  </h2>
                  <div
                    className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <IconCheck size={14} className="text-green-400" />
                    ) : (
                      <IconCopy size={14} className="text-white/60" />
                    )}
                  </div>
                </div>

                <p className="text-white/40 text-xs">
                  {formatAddress(userData.address)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Registration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <IconEdit size={24} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Register Your Email
                </h3>
                <p className="text-white/60 text-sm">
                  Register your email to start verifying travel bookings and
                  earn merit miles
                </p>
              </div>
              <div className="flex-shrink-0">
                <RegisterButton />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Travel Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Travel Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconPlaneDeparture size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                {userStats.totalTrips}
              </div>
              <div className="text-white/60 text-xs">Total Trips</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconGlobe size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                {userStats.countriesVisited}
              </div>
              <div className="text-white/60 text-xs">Countries</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconBed size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                {userStats.totalStays}
              </div>
              <div className="text-white/60 text-xs">Total Stays</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <IconStar size={16} className="text-white/60" />
              </div>
              <div className="text-2xl font-extralight text-white mb-1 tracking-tight">
                {userStats.meritMiles}
              </div>
              <div className="text-white/60 text-xs">Merit Miles</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconBell size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">
                  Notifications
                </h3>
                <p className="text-white/60 text-xs">
                  Manage your notification preferences
                </p>
              </div>
              <div className="text-white/40">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconShield size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">
                  Privacy & Security
                </h3>
                <p className="text-white/60 text-xs">
                  Manage your privacy settings
                </p>
              </div>
              <div className="text-white/40">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <IconSettings size={20} className="text-white/80" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">Settings</h3>
                <p className="text-white/60 text-xs">
                  App preferences and configurations
                </p>
              </div>
              <div className="text-white/40">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disconnect Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <IconLogout size={20} className="text-red-400" />
            </div>
            <div
              className="flex-1"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              <h3 className="text-red-400 font-medium text-sm">
                Disconnect Wallet
              </h3>
              <p className="text-white/60 text-xs">
                Disconnect your current wallet
              </p>
            </div>
            <div className="text-red-400/60">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </div>
  );
}
