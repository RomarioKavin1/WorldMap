"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

export default function TripsPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Content */}
            <div className="flex-1 p-6 mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">My Trips</h2>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-white/60 text-lg mb-2">
                        Trip history coming soon
                    </h3>
                    <p className="text-white/40 text-sm">
                        Your travel adventures will appear here
                    </p>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab="trips" />
        </div>
    );
} 