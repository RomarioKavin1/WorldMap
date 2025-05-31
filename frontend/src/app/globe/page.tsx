"use client";
import { ThreeGlobeHex } from "@/components/ThreeGlobeHex";
import { RecentTrips } from "@/components/RecentTrips";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

export default function GlobePage() {
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

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Full-screen Globe Section */}
            <div className="h-screen bg-black overflow-hidden mt-24">
                <ThreeGlobeHex
                    arcPaths={sampleArcPaths}
                    animationSpeed={7}
                    autoRotate={true}
                />
            </div>

            {/* Pull-up Drawer */}
            <RecentTrips />

            {/* Bottom Navigation */}
            <BottomNav activeTab="globe" />
        </div>
    );
} 