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
        <div className="border border-white/20 rounded-xl p-6 bg-white/5">
          <p className="text-white/70 text-sm mb-2">World App Required</p>
          <p className="text-white/50 text-xs">
            Open this app in World App to continue
          </p>
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
          className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </LiveFeedback>
    </div>
  );
};
