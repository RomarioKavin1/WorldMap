"use client";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import Image from "next/image";

interface HeaderProps {
    showMeritModal?: boolean; // For pages like merit-miles where modal isn't needed
}

export const Header = ({ showMeritModal = true }: HeaderProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-30 flex justify-between p-6">
                {/* Left Logo/Profile */}
                <div className="w-8 h-8 border-2 border-white rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                </div>

                {/* Center Logo */}
                <div className=" -mt-6">
                    <Logo size={"lg"} />
                </div>

                {/* Merit Miles Badge */}
                <div
                    className={`flex items-center gap-1 bg-slate-900/70 rounded-xl px-3 py-2 h-fit ${showMeritModal ? 'cursor-pointer hover:bg-slate-800/70 transition-colors active:scale-95' : ''
                        }`}
                    onClick={showMeritModal ? () => setIsModalOpen(true) : undefined}
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
            </div>

            {/* Merit Miles Modal */}
            {showMeritModal && isModalOpen && (
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
                                onClick={() => setIsModalOpen(false)}
                                className=" bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium mt-6 hover:from-blue-600 hover:to-purple-600 transition-all active:scale-95 border border-white/20 w-fit px-4 py-3"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}; 