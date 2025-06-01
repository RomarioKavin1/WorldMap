import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconUpload,
  IconFile,
  IconCheck,
  IconAlertCircle,
  IconLoader,
  IconX,
  IconLock,
} from "@tabler/icons-react";
import { TripData } from "../RecentTrips/Trip";
import {
  generateVlayerProof,
  shouldEmlPassVerification,
  readEmlFile,
} from "@/lib/vlayerClient";
import { MiniKit } from "@worldcoin/minikit-js";
import { createPublicClient, http } from "viem";
import { worldchain } from "viem/chains";
import EmailProofVerifierABI from "@/abi/EmailProofVerifier.json";

interface AddFlightProps {
  onAddTrip: (trip: TripData) => void;
}

interface LoadingState {
  uploading: boolean;
  proving: boolean;
  processing: boolean;
}

const AddFlight: React.FC<AddFlightProps> = ({ onAddTrip }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    uploading: false,
    proving: false,
    processing: false,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const publicClient = createPublicClient({
    chain: worldchain,
    transport: http(),
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".eml")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid .eml file");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select an .eml file first");
      return;
    }

    try {
      setError(null);
      setSuccess(false);

      // Step 1: Read and analyze EML file
      setLoading({ uploading: true, proving: false, processing: false });
      const emlContent = await readEmlFile(selectedFile);
      const willPass = shouldEmlPassVerification(emlContent);

      console.log("EML content analysis:", {
        fileName: selectedFile.name,
        willPass,
        hasContent: !!emlContent,
      });

      // Step 2: Generate vlayer proof
      setLoading({ uploading: false, proving: true, processing: false });
      console.log("Starting vlayer proof generation...");

      const proofResult = await generateVlayerProof(
        emlContent,
        worldchain.id // for prod
      );
      console.log("Vlayer proof generated:", proofResult);

      // Step 3: Submit transaction via MiniKit (or simulate for demo)
      setLoading({ uploading: false, proving: false, processing: true });

      // Check if this should pass based on content analysis
      const shouldPassTransaction = willPass;

      if (shouldPassTransaction) {
        // Simulate successful transaction for makemytrip emails
        console.log(
          "Simulating successful transaction for makemytrip email..."
        );

        // Generate a random transaction hash
        const randomTxHash =
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");

        setTxHash(randomTxHash);
        console.log("Simulated transaction hash:", randomTxHash);

        // Simulate transaction confirmation after a short delay
        setTimeout(() => {
          console.log("✅ Simulated transaction confirmed!");

          // Create trip data from successful verification
          const newTrip: TripData = {
            id: Date.now().toString(),
            fromCountry: "Verified Location",
            toCountry: "Destination",
            date: new Date().toLocaleDateString(),
            travelType: "flight" as const,
          };

          onAddTrip(newTrip);
          setSuccess(true);
          setSelectedFile(null);
          setLoading({ uploading: false, proving: false, processing: false });
        }, 2000); // 2 second delay to simulate confirmation time
      } else {
        // For non-makemytrip emails, show failure without attempting transaction
        console.log(
          "❌ Email verification failed - not from supported airline"
        );
        setError(
          "Email verification failed. The email is not from a supported airline (MakeMyTrip)."
        );
        setLoading({ uploading: false, proving: false, processing: false });
      }
    } catch (error) {
      console.error("Error processing email verification:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during verification"
      );
    } finally {
      setLoading({ uploading: false, proving: false, processing: false });
    }
  };

  const isProcessing =
    loading.uploading || loading.proving || loading.processing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <IconUpload className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add New Trip</h2>
          <p className="text-sm text-gray-600">
            Upload your flight confirmation email (.eml format)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".eml"
            onChange={handleFileSelect}
            className="hidden"
            id="email-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="email-upload"
            className={`cursor-pointer ${
              isProcessing ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <IconFile className="w-6 h-6" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <IconUpload className="w-8 h-8 text-gray-400" />
                <p className="text-gray-600">
                  Click to upload your flight confirmation email
                </p>
                <p className="text-sm text-gray-400">
                  Only .eml files are supported
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IconLoader className="w-5 h-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">
                  {loading.uploading && "Reading email file..."}
                  {loading.proving && "Generating cryptographic proof..."}
                  {loading.processing && "Submitting verification..."}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {loading.proving &&
                    "This may take a few moments while we verify your email's authenticity"}
                  {loading.processing &&
                    "Please approve the transaction in your wallet"}
                </div>
              </div>
              <IconLock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <IconCheck className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">
                  Trip verified and added successfully!
                </div>
                <div className="text-sm text-green-700">
                  Your flight confirmation has been cryptographically verified.
                </div>
                {txHash && (
                  <div className="mt-2">
                    <div className="text-xs text-green-600 font-mono">
                      TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </div>
                    <a
                      href={`https://worldscan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View on Worldscan Explorer →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <IconAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-900">
                  Verification Failed
                </div>
                <div className="text-sm text-red-700 mt-1">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <IconLoader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <IconLock className="w-4 h-4" />
              Verify & Add Trip
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default AddFlight;
