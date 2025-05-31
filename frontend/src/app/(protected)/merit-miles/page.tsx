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
} from "@tabler/icons-react";

export default function MeritMilesPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      address: "0x3E8f6A9c2D5b7C4e1F8a6B3c9E5d2A7f4C8b6E9a",
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
      <Header showMeritModal={false} />

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
                0
              </p>
              <p className="text-white/40 text-xs">Merit Miles</p>
            </div>
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
