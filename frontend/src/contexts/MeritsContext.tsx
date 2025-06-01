"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

// Types
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

interface MeritsBalance {
  total: string;
  staked: string;
  unstaked: string;
  total_staking_rewards: string;
  total_referral_rewards: string;
  pending_referral_rewards: string;
}

interface MeritsDailyReward {
  available: boolean;
  daily_reward: string;
  streak_reward: string;
  pending_referral_rewards: string;
  total_reward: string;
  date: string;
  reset_at: string;
  streak: string;
}

interface MeritsAuthResponse {
  created: boolean;
  token: string;
}

interface TokenPayload {
  address: string;
  exp: number;
  iat: number;
}

// State interface
interface MeritsState {
  isConnected: boolean;
  isLoading: boolean;
  userInfo: MeritsUserInfo | null;
  balance: MeritsBalance | null;
  dailyReward: MeritsDailyReward | null;
  token: string | null;
  error: string | null;
  isInitialized: boolean;
}

// Action types
type MeritsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "SET_USER_INFO"; payload: MeritsUserInfo | null }
  | { type: "SET_BALANCE"; payload: MeritsBalance | null }
  | { type: "SET_DAILY_REWARD"; payload: MeritsDailyReward | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "CLEAR_AUTH" };

// Initial state
const initialState: MeritsState = {
  isConnected: false,
  isLoading: false,
  userInfo: null,
  balance: null,
  dailyReward: null,
  token: null,
  error: null,
  isInitialized: false,
};

// Reducer
function meritsReducer(state: MeritsState, action: MeritsAction): MeritsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_USER_INFO":
      return { ...state, userInfo: action.payload };
    case "SET_BALANCE":
      return { ...state, balance: action.payload };
    case "SET_DAILY_REWARD":
      return { ...state, dailyReward: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    case "CLEAR_AUTH":
      return {
        ...state,
        isConnected: false,
        token: null,
        userInfo: null,
        balance: null,
        dailyReward: null,
        error: null,
      };
    default:
      return state;
  }
}

// Context interface
interface MeritsContextType extends MeritsState {
  login: (
    address: string,
    signMessage: (message: string) => Promise<string>
  ) => Promise<MeritsAuthResponse>;
  loginWithSIWE: (
    address: string,
    message: string,
    signature: string,
    nonce: string
  ) => Promise<MeritsAuthResponse>;
  logout: () => void;
  getUserInfo: (
    address: string,
    clearAuthOnFailure?: boolean
  ) => Promise<MeritsUserInfo>;
  getUserBalance: () => Promise<MeritsBalance | null>;
  getDailyReward: () => Promise<MeritsDailyReward | null>;
  getAddressFromToken: () => string | null;
}

// Create context
const MeritsContext = createContext<MeritsContextType | undefined>(undefined);

// Helper functions
const decodeJWT = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

const getAddressFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.address || null;
};

// Provider component
export function MeritsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(meritsReducer, initialState);

  console.log("🎯 MeritsProvider current state:", {
    isConnected: state.isConnected,
    isInitialized: state.isInitialized,
    hasToken: !!state.token,
  });

  // Clear authentication state
  const clearAuthState = useCallback(() => {
    console.log("🚨 CLEARING MERITS AUTH STATE - Stack trace:");
    console.trace();
    dispatch({ type: "CLEAR_AUTH" });
  }, []);

  // Get user balance using authenticated endpoint
  const getUserBalance =
    useCallback(async (): Promise<MeritsBalance | null> => {
      if (!state.token) {
        console.log("No token available for balance fetch");
        return null;
      }

      try {
        dispatch({ type: "SET_ERROR", payload: null });
        console.log("Fetching user balance with token...");

        const response = await fetch("/api/merits/balance", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log(
              "Token invalid during balance fetch - balance unavailable"
            );
            throw new Error("Balance fetch unauthorized");
          }
          throw new Error("Failed to fetch balance");
        }

        const balanceData: MeritsBalance = await response.json();
        console.log("Balance data received:", balanceData);
        dispatch({ type: "SET_BALANCE", payload: balanceData });
        return balanceData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching balance:", errorMessage);
        throw err;
      }
    }, [state.token]);

  // Get daily reward status using authenticated endpoint
  const getDailyReward =
    useCallback(async (): Promise<MeritsDailyReward | null> => {
      if (!state.token) {
        console.log("No token available for daily reward fetch");
        return null;
      }

      try {
        dispatch({ type: "SET_ERROR", payload: null });
        console.log("Fetching daily reward status with token...");

        const response = await fetch("/api/merits/daily-reward", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log(
              "Token invalid during daily reward fetch - daily reward unavailable"
            );
            throw new Error("Daily reward fetch unauthorized");
          }
          throw new Error("Failed to fetch daily reward");
        }

        const dailyRewardData: MeritsDailyReward = await response.json();
        console.log("Daily reward data received:", dailyRewardData);
        dispatch({ type: "SET_DAILY_REWARD", payload: dailyRewardData });
        return dailyRewardData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching daily reward:", errorMessage);
        throw err;
      }
    }, [state.token]);

  // Get user info by address with token validation
  const getUserInfo = useCallback(
    async (
      address: string,
      clearAuthOnFailure: boolean = true
    ): Promise<MeritsUserInfo> => {
      try {
        dispatch({ type: "SET_ERROR", payload: null });

        // Include token in request if available
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (state.token) {
          headers["Authorization"] = `Bearer ${state.token}`;
        }

        const response = await fetch(`/api/merits/user/${address}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Only clear auth state if explicitly requested
            if (clearAuthOnFailure) {
              console.log("Token is invalid, clearing auth state");
              clearAuthState();
            } else {
              console.log(
                "Token validation failed but not clearing auth state"
              );
            }
            throw new Error("Authentication expired");
          }
          throw new Error("Failed to get user info");
        }

        const data = await response.json();
        dispatch({ type: "SET_USER_INFO", payload: data });
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw err;
      }
    },
    [state.token, clearAuthState]
  );

  // Login with SIWE (for World SDK walletAuth)
  const loginWithSIWE = useCallback(
    async (
      address: string,
      message: string,
      signature: string,
      nonce: string
    ): Promise<MeritsAuthResponse> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        console.log("loginWithSIWE called with address:", address);

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
        console.log("Auth data received, token length:", authData.token.length);

        // Validate token before storing
        if (!authData.token || isTokenExpired(authData.token)) {
          throw new Error("Received invalid or expired token");
        }

        // Store token and update state
        dispatch({ type: "SET_TOKEN", payload: authData.token });
        dispatch({ type: "SET_CONNECTED", payload: true });

        // Get user info
        console.log("Getting user info...");
        await getUserInfo(address);
        console.log("loginWithSIWE process completed successfully");

        // Fetch balance (don't fail auth if balance fetch fails)
        console.log("Fetching user balance...");
        try {
          await getUserBalance();
        } catch (balanceError) {
          console.warn(
            "Balance fetch failed but auth succeeded:",
            balanceError
          );
        }

        return authData;
      } catch (err) {
        console.error("Error in loginWithSIWE:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        clearAuthState();
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [getUserInfo, clearAuthState, getUserBalance]
  );

  // Login (original function for custom signing)
  const login = useCallback(
    async (
      address: string,
      signMessage: (message: string) => Promise<string>
    ): Promise<MeritsAuthResponse> => {
      // Import the createMeritsMessage function
      const { createMeritsMessage } = await import(
        "@/app/(protected)/merit-miles/page"
      );

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

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
        console.log("Auth data received, token length:", authData.token.length);

        // Validate token before storing
        if (!authData.token || isTokenExpired(authData.token)) {
          throw new Error("Received invalid or expired token");
        }

        // Store token and update state
        dispatch({ type: "SET_TOKEN", payload: authData.token });
        dispatch({ type: "SET_CONNECTED", payload: true });

        // Get user info
        console.log("Getting user info...");
        await getUserInfo(address);
        console.log("Login process completed successfully");

        // Fetch balance (don't fail auth if balance fetch fails)
        console.log("Fetching user balance...");
        try {
          await getUserBalance();
        } catch (balanceError) {
          console.warn(
            "Balance fetch failed but auth succeeded:",
            balanceError
          );
        }

        return authData;
      } catch (err) {
        console.error("Error in useMerits.login:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        clearAuthState();
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [getUserInfo, clearAuthState, getUserBalance]
  );

  // Logout
  const logout = useCallback(() => {
    console.log("Logging out of Merits...");
    clearAuthState();
  }, [clearAuthState]);

  // Get address from current token
  const getAddressFromCurrentToken = useCallback((): string | null => {
    if (!state.token) return null;
    return getAddressFromToken(state.token);
  }, [state.token]);

  // Auto-logout when token expires
  useEffect(() => {
    if (!state.token || !state.isConnected) return;

    const payload = decodeJWT(state.token);
    if (!payload) return;

    const timeUntilExpiry = payload.exp * 1000 - Date.now();

    if (timeUntilExpiry > 0) {
      const timeoutId = setTimeout(() => {
        console.log("Merits token expired, logging out...");
        logout();
      }, timeUntilExpiry);

      return () => clearTimeout(timeoutId);
    }
  }, [state.token, state.isConnected, logout]);

  // Initialize the provider
  useEffect(() => {
    console.log("🔄 MeritsProvider initializing...");
    dispatch({ type: "SET_INITIALIZED", payload: true });
  }, []);

  // Fetch data when token becomes available
  useEffect(() => {
    if (state.token && state.isConnected && state.isInitialized) {
      console.log(
        "Token available, fetching user data, balance and daily reward..."
      );

      // Get address from token for user info fetch
      const address = getAddressFromToken(state.token);
      if (address) {
        // Fetch user info (don't clear auth on failure)
        getUserInfo(address, false).catch((error) => {
          console.error("Failed to fetch user info on token restore:", error);
        });
      }

      // Fetch balance
      getUserBalance().catch((error) => {
        console.error("Failed to fetch balance on token restore:", error);
      });

      // Fetch daily reward status
      getDailyReward().catch((error) => {
        console.error("Failed to fetch daily reward on token restore:", error);
      });
    }
  }, [
    state.token,
    state.isConnected,
    state.isInitialized,
    getUserInfo,
    getUserBalance,
    getDailyReward,
  ]);

  const value: MeritsContextType = {
    ...state,
    login,
    loginWithSIWE,
    logout,
    getUserInfo,
    getUserBalance,
    getDailyReward,
    getAddressFromToken: getAddressFromCurrentToken,
  };

  return (
    <MeritsContext.Provider value={value}>{children}</MeritsContext.Provider>
  );
}

// Hook to use the MeritsContext
export function useMerits(): MeritsContextType {
  const context = useContext(MeritsContext);
  if (context === undefined) {
    throw new Error("useMerits must be used within a MeritsProvider");
  }
  return context;
}
