"use client";
import { useState } from "react";
import { ThreeGlobeHex } from "@/components/ThreeGlobeHex";
import { RecentTrips } from "@/components/RecentTrips";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("globe");

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
                animationSpeed={2}
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
          <div className="-mt-16 -ml-8">
            <Logo />
          </div>

          {/* Profile Picture */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">U</span>
          </div>
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
    </div>
  );
}
