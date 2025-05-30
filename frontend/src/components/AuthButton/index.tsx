"use client";
import { walletAuth } from "@/auth/wallet";
import { LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useState } from "react";

/**
 * This component is an example of how to authenticate a user
 * We will use Next Auth for this example, but you can use any auth provider
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    try {
      await walletAuth();
    } catch (error) {
      console.error("Wallet authentication button error", error);
      setIsPending(false);
      return;
    }

    setIsPending(false);
  }, [isInstalled, isPending]);

  if (!isInstalled) {
    return (
      <div className="w-full text-center">
        <div className="relative group">
          {/* Glass morphism card */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">W</span>
                </div>
              </div>
              <p className="text-white/90 text-sm font-medium mb-2">
                World App Required
              </p>
              <p className="text-white/60 text-xs leading-relaxed">
                Open this app in World App to continue your journey
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LiveFeedback
        label={{
          failed: "Authentication failed",
          pending: "Connecting...",
          success: "Connected",
        }}
        state={isPending ? "pending" : undefined}
      >
        <button
          onClick={onClick}
          disabled={isPending}
          className="w-full bg-white hover:bg-gray-50 text-black font-bold py-5 px-8 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl backdrop-blur-sm"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              <span className="text-lg">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/WorldLogo.png"
                  alt="World Logo"
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold mr-2">Sign In</span>
            </div>
          )}
        </button>
      </LiveFeedback>
    </div>
  );
};
