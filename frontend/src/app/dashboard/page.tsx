"use client";
import { useState } from "react";
import Image from "next/image";
import { ThreeGlobeHex } from "@/components/ThreeGlobeHex";
import { RecentTrips } from "@/components/RecentTrips";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("globe");
  const [showMeritModal, setShowMeritModal] = useState(false);

  // Sample arc paths for demonstration
  const sampleArcPaths = [
    [
      { lat: 40.7128, lng: -74.006 }, // New York
      { lat: 51.5074, lng: -0.1278 }, // London
      { lat: 48.8566, lng: 2.3522 }, // Paris
    ],
    [
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 1.3521, lng: 103.8198 }, // Singapore
      { lat: -33.8688, lng: 151.2093 }, // Sydney
    ],
    [
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
      { lat: 25.2048, lng: 55.2708 }, // Dubai
      { lat: 19.076, lng: 72.8777 }, // Mumbai
    ],
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "globe":
        return (
          <div className="flex-1 relative">
            {/* Full-screen Globe Section */}
            <div className="h-screen bg-black overflow-hidden mt-24">
              <ThreeGlobeHex
                arcPaths={sampleArcPaths}
                animationSpeed={7}
                autoRotate={true}
              />
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
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header - Only show on globe tab */}
      {activeTab === "globe" && (
        <div className="absolute top-0 left-0 right-0 z-30 flex justify-between p-6">
          {/* Logo */}
          <div className="w-8 h-8 border-2 border-white rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          </div>

          <div className=" -mt-6">
            <Logo size={"lg"} />
          </div>
          <div
            className="flex items-center gap-1 bg-slate-900/70 rounded-xl px-3 py-2 h-fit cursor-pointer hover:bg-slate-800/70 transition-colors active:scale-95"
            onClick={() => setShowMeritModal(true)}
          >
            <span className="text-white text-sm font-semibold">0</span>
            <Image
              src="/blockscout_merit_icon.png"
              alt="Merit Miles"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </div>
          {/* Profile Picture */}

        </div>
      )}

      {/* Other tabs with normal header */}
      {activeTab !== "globe" && (
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
      )}

      {/* Dynamic Content */}
      <div className={activeTab === "globe" ? "" : "pb-20"}>
        {renderContent()}
      </div>

      {/* Pull-up Drawer - Only show on globe tab */}
      {activeTab === "globe" && <RecentTrips />}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Merit Miles Modal */}
      {showMeritModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className=" bg-black/50  rounded-2xl p-6 max-w-sm w-full border border-white/20 shadow-2xl">
            <div className="text-center space-y-4">
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Image
                  src="/blockscout_merit_icon.png"
                  alt="Merit Miles"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <h2 className="text-xl font-bold text-white">Merit Miles</h2>
              </div>

              {/* Description */}
              <p className="text-white/80 text-sm leading-relaxed">
                Travel more, stay more, interact more, get Merit Miles as rewards.
              </p>

              {/* Powered by */}
              <div className="pt-4 border-t border-white/10 flex justify-center">
                <span className="text-white/60 text-xs">Powered by</span>
                <Image
                  src="/blockscout_merits.png"
                  alt="Powered by Blockscout Merits"
                  width={100}
                  height={20}
                  className="h-3 w-auto ml-2"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowMeritModal(false)}
                className=" bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium mt-6 hover:from-blue-600 hover:to-purple-600 transition-all active:scale-95 border border-white/20 w-fit px-4 py-3"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
