import { Page } from "@/components/PageLayout";
import { AuthButton } from "../components/AuthButton";

export default function Home() {
  return (
    <Page>
      <Page.Main className="relative min-h-screen bg-black overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:60px_60px]"></div>

        {/* Spinning Globe Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Globe wireframe circles */}
            <div className="w-80 h-80 opacity-10 animate-spin-slow">
              {/* Outer circle */}
              <div className="absolute inset-0 border border-white rounded-full"></div>

              {/* Horizontal lines */}
              <div className="absolute top-1/4 left-0 w-full h-px bg-white opacity-60"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-white opacity-60"></div>

              {/* Vertical ellipses */}
              <div className="absolute inset-0 border border-white rounded-full transform scale-x-75"></div>
              <div className="absolute inset-0 border border-white rounded-full transform scale-x-50"></div>
              <div className="absolute inset-0 border border-white rounded-full transform scale-x-25"></div>

              {/* Rotated ellipses for longitude lines */}
              <div className="absolute inset-0 border border-white rounded-full transform rotate-45 scale-x-75"></div>
              <div className="absolute inset-0 border border-white rounded-full transform -rotate-45 scale-x-75"></div>
            </div>
          </div>
        </div>

        {/* Minimal floating accent */}
        <div className="absolute top-1/4 right-8 w-24 h-24 bg-gradient-to-br from-white/5 to-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-8 w-32 h-32 bg-gradient-to-br from-white/3 to-white/8 rounded-full blur-3xl"></div>

        {/* Main Content - Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
          {/* App Title */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              World Map
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-30"></div>
          </div>

          {/* Auth Button */}
          <div className="w-full max-w-sm">
            <AuthButton />
          </div>
        </div>
      </Page.Main>
    </Page>
  );
}
