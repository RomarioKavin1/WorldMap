"use client";
import { AuthButton } from "@/components/AuthButton";
import { ThreeGlobeComponent } from "@/components/ThreeGlobe";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Three.js Globe Background */}
      <ThreeGlobeComponent />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 -mt-70">
        {/* Enhanced World Map Title */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-center leading-none opacity-70">
            <div className="flex items-center justify-center gap-0">
              <img src="/world.png" className="w-40 h-40" />
              <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl -ml-6">
                Map
              </span>
            </div>
          </h1>
        </div>

        {/* Enhanced Auth Button Container */}
        <div className="w-fit opacity-70 mt-20">
          <AuthButton />
        </div>
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
}
