"use client";
import { useState } from "react";
import { ThreeGlobeHex } from "@/components/ThreeGlobeHex";
import { RecentTrips } from "@/components/RecentTrips";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("globe");

  const renderContent = () => {
    switch (activeTab) {
      case "globe":
        return (
          <div className="flex-1 flex flex-col">
            {/* Globe Section */}
            <div className="h-80 bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden ">
              <ThreeGlobeHex />
            </div>

            {/* Recent Trips Section */}
            <div className="flex-1 mt-6 z-10">
              <RecentTrips />
            </div>
          </div>
        );
      case "trips":
        return (
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">My Trips</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-white/60 text-lg mb-2">
                Trip history coming soon
              </h3>
            </div>
          </div>
        );
      case "add":
        return (
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Trip</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-white/60 text-lg mb-2">
                Plan your next adventure
              </h3>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-white/60 text-lg mb-2">
                Profile settings coming soon
              </h3>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20">
      {/* Header */}
      <div className="flex justify-between p-6 border-b border-white/10">
        {/* Logo */}
        <div className="-mt-16 -ml-8">
          <Logo />
        </div>

        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">U</span>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
