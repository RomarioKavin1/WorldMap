"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import Image from "next/image";

export default function MeritMilesPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative">
            {/* Header */}
            <Header showMeritModal={false} />

            {/* Content */}
            <div className="flex-1 p-6 mt-12 space-y-6">
                {/* Header Section */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image
                            src="/blockscout_merit_icon.png"
                            alt="Merit Miles"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                        <h1 className="text-3xl font-bold text-white">Merit Miles</h1>
                    </div>
                    <p className="text-white/70 text-sm">
                        Travel more, stay more, interact more, get Merit Miles as rewards.
                    </p>
                </div>

                {/* Current Balance */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl p-6 text-center">
                    <p className="text-white/60 text-sm mb-2">Current Balance</p>
                    <p className="text-4xl font-bold text-white mb-2">0</p>
                    <p className="text-white/40 text-xs">Merit Miles</p>
                </div>

                {/* How to Earn */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">How to Earn Merit Miles</h2>

                    <div className="space-y-3">
                        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-2xl">✈️</div>
                            <div>
                                <h3 className="text-white font-medium">Travel</h3>
                                <p className="text-white/60 text-sm">Book trips and explore new destinations</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-2xl">🏨</div>
                            <div>
                                <h3 className="text-white font-medium">Stay</h3>
                                <p className="text-white/60 text-sm">Book accommodations and extend your stays</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-2xl">🤝</div>
                            <div>
                                <h3 className="text-white font-medium">Interact</h3>
                                <p className="text-white/60 text-sm">Engage with the community and share experiences</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                    <div className="bg-slate-900/30 border border-white/10 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-white/60">No activity yet</p>
                        <p className="text-white/40 text-sm mt-1">Start traveling to earn Merit Miles!</p>
                    </div>
                </div>

                {/* Powered by */}
                <div className="pt-4 border-t border-white/10 flex justify-center">
                    <span className="text-white/60 text-xs mr-2">Powered by</span>
                    <Image
                        src="/blockscout_merits.png"
                        alt="Powered by Blockscout Merits"
                        width={100}
                        height={20}
                        className="h-3 w-auto"
                    />
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab="merit" />
        </div>
    );
} 