"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

export default function AddTripPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Content */}
            <div className="flex-1 p-6 mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Add New Trip</h2>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📍</div>
                    <h3 className="text-white/60 text-lg mb-2">
                        Plan your next adventure
                    </h3>
                    <p className="text-white/40 text-sm">
                        Trip planning features coming soon
                    </p>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab="add" />
        </div>
    );
} 