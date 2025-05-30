"use client";
import { AuthButton } from "@/components/AuthButton";
import { ThreeGlobeComponent } from "@/components/ThreeGlobe";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Three.js Globe Background */}
      <div className="absolute inset-0 -mt-80">
        <ThreeGlobeComponent />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4">
        <h1 className="text-6xl md:text-7xl font-bold text-white text-center">
          World Map
        </h1>

        <AuthButton />
      </div>
    </div>
  );
}
