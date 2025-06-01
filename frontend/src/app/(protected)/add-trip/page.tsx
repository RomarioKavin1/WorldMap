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
} from "@tabler/icons-react";

export default function AddTripPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add useMerits hook
  const {
    isConnected: isMeritsConnected,
    isInitialized: isMeritsInitialized,
    balance: meritsBalance,
  } = useMerits();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

        {/* Stats Overview */}
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

        {/* Flight Verification Section */}
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
            <AddFlight />
          </div>
        </motion.div>

        {/* Trip Planning Options */}
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
                      <h4 className="text-white font-medium">{option.title}</h4>
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

        {/* Quick Actions */}
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
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="add" />
    </div>
  );
}
