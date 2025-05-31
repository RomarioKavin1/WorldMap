"use client";
import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";

export default function TestMeritsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createMeritsMessage = (address: string, nonce: string): string => {
    const currentTime = new Date().toISOString();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expirationTime = nextYear.toISOString();

    return `merits.blockscout.com wants you to sign in with your Ethereum account:
${address}

Sign-In for the Blockscout Merits program.

URI: https://merits.blockscout.com
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${currentTime}
Expiration Time: ${expirationTime}`;
  };

  const testMeritsAuth = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check if private key is available
      let privateKey = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error(
          "NEXT_PUBLIC_TEST_PRIVATE_KEY not found in environment"
        );
      }

      // Ensure private key is properly formatted
      if (!privateKey.startsWith("0x")) {
        privateKey = `0x${privateKey}`;
      }

      // Validate private key length (should be 66 characters: 0x + 64 hex chars)
      if (privateKey.length !== 66) {
        throw new Error(
          `Invalid private key length: ${privateKey.length}. Expected 66 characters (0x + 64 hex chars)`
        );
      }

      // Validate hex format
      if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
        throw new Error(
          "Invalid private key format. Must be hex string with 0x prefix"
        );
      }

      console.log("Creating account from private key...");
      console.log(
        "Private key format:",
        `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}`
      );

      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const address = account.address;

      console.log("Test address:", address);

      // Step 1: Get nonce
      console.log("Getting nonce...");
      const nonceResponse = await fetch("/api/merits/nonce");
      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }
      const { nonce } = await nonceResponse.json();
      console.log("Nonce:", nonce);

      // Step 2: Create message
      console.log("Creating message...");
      const message = createMeritsMessage(address, nonce);
      console.log("Message:", message);

      // Step 3: Sign message
      console.log("Signing message...");
      const signature = await account.signMessage({ message });
      console.log("Signature:", signature);

      // Step 4: Login
      console.log("Logging in...");
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
      const loginData = await loginResponse.json();
      console.log("Login response:", loginData);

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
      }

      setResult({
        success: true,
        address,
        nonce,
        message,
        signature,
        authData: loginData,
      });
    } catch (err) {
      console.error("Test error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Merits Authentication</h1>

        <div className="mb-8">
          <button
            onClick={testMeritsAuth}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Testing..." : "Test Merits Auth with Viem"}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">Success!</h3>
              <p className="text-green-300 text-sm">
                Merits authentication completed successfully
              </p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Address:</h3>
              <p className="text-gray-300 text-sm font-mono">
                {result.address}
              </p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Nonce:</h3>
              <p className="text-gray-300 text-sm font-mono">{result.nonce}</p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Message:</h3>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {result.message}
              </pre>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Signature:</h3>
              <p className="text-gray-300 text-sm font-mono break-all">
                {result.signature}
              </p>
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Auth Response:</h3>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(result.authData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">
            Setup Instructions:
          </h3>
          <p className="text-yellow-300 text-sm mb-2">
            Add this to your <code>.env.local</code> file:
          </p>
          <pre className="text-yellow-300 text-sm bg-black p-2 rounded">
            NEXT_PUBLIC_TEST_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
          </pre>
          <div className="text-yellow-300 text-xs mt-2 space-y-1">
            <p>• Private key must be 64 hex characters (32 bytes)</p>
            <p>
              • Can include or omit the "0x" prefix (will be added
              automatically)
            </p>
            <p>• Example: 0x + 64 hex characters = 66 total characters</p>
            <p className="text-red-300 font-semibold">
              ⚠️ Use a test private key only! Never use real funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
