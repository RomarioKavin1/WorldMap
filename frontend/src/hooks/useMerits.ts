import { createMeritsMessage } from "@/app/(protected)/merit-miles/page";
import { useState, useEffect, useCallback } from "react";

interface MeritsUser {
  address: string;
  total_balance: string;
  referrals: string;
  registered_at: string;
}

interface MeritsUserInfo {
  exists: boolean;
  user?: MeritsUser;
}

interface MeritsAuthResponse {
  created: boolean;
  token: string;
}

export const useMerits = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<MeritsUserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("merits_token");
    if (storedToken) {
      setToken(storedToken);
      setIsConnected(true);
    }
  }, []);

  // Get user info by address
  const getUserInfo = useCallback(async (address: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/merits/user/${address}`);
      if (!response.ok) {
        throw new Error("Failed to get user info");
      }
      const data = await response.json();
      setUserInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Create message for signing (for custom nonce-based signing
  // Login to Merits with pre-created message and signature (for World SDK walletAuth)
  const loginWithSIWE = useCallback(
    async (
      address: string,
      message: string,
      signature: string,
      nonce: string
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("loginWithSIWE called with:");
        console.log("Address:", address);
        console.log("Message:", message);
        console.log("Signature:", signature);
        console.log("Nonce:", nonce);

        // Login with signature
        console.log("Calling Merits login API...");
        const loginResponse = await fetch("/api/merits/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nonce,
            message,
            signature,
          }),
        });

        console.log("Login response status:", loginResponse.status);
        if (!loginResponse.ok) {
          const errorText = await loginResponse.text();
          console.log("Login error response:", errorText);
          throw new Error("Failed to authenticate");
        }

        const authData: MeritsAuthResponse = await loginResponse.json();
        console.log("Auth data received:", authData);

        // Store token
        localStorage.setItem("merits_token", authData.token);
        setToken(authData.token);
        setIsConnected(true);

        // Get user info
        console.log("Getting user info...");
        await getUserInfo(address);
        console.log("loginWithSIWE process completed successfully");

        return authData;
      } catch (err) {
        console.error("Error in loginWithSIWE:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserInfo]
  );

  // Login to Merits (original function for custom signing)
  const login = useCallback(
    async (
      address: string,
      signMessage: (message: string) => Promise<string>
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("useMerits.login called with address:", address);

        // Step 1: Get nonce
        console.log("Step 1: Getting nonce...");
        const nonceResponse = await fetch("/api/merits/nonce");
        console.log("Nonce response status:", nonceResponse.status);
        if (!nonceResponse.ok) {
          throw new Error("Failed to get nonce");
        }
        const { nonce } = await nonceResponse.json();
        console.log("Nonce received:", nonce);

        // Step 2: Create message
        console.log("Step 2: Creating message...");
        const message = createMeritsMessage(address, nonce);
        console.log("Message created:", message);

        // Step 3: Sign message
        console.log("Step 3: Signing message...");
        const signature = await signMessage(message);
        console.log("Signature received:", signature);

        // Step 4: Login with signature
        console.log("Step 4: Logging in with signature...");
        const loginResponse = await fetch("/api/merits/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nonce,
            message,
            signature,
          }),
        });

        console.log("Login response status:", loginResponse.status);
        if (!loginResponse.ok) {
          const errorText = await loginResponse.text();
          console.log("Login error response:", errorText);
          throw new Error("Failed to authenticate");
        }

        const authData: MeritsAuthResponse = await loginResponse.json();
        console.log("Auth data received:", authData);

        // Store token
        localStorage.setItem("merits_token", authData.token);
        setToken(authData.token);
        setIsConnected(true);

        // Get user info
        console.log("Getting user info...");
        await getUserInfo(address);
        console.log("Login process completed successfully");

        return authData;
      } catch (err) {
        console.error("Error in useMerits.login:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserInfo]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("merits_token");
    setToken(null);
    setIsConnected(false);
    setUserInfo(null);
    setError(null);
  }, []);

  return {
    isConnected,
    isLoading,
    userInfo,
    token,
    error,
    login,
    loginWithSIWE,
    logout,
    getUserInfo,
  };
};
