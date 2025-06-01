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

interface AddFlightProps {
  onFlightAdded?: () => void;
  isVerified?: boolean;
}

interface LoadingState {
  uploading: boolean;
  processing: boolean;
}

const AddFlight: React.FC<AddFlightProps> = ({
  onFlightAdded,
  isVerified = false,
}) => {
  const [emlFile, setEmlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    uploading: false,
    processing: false,
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isVerified) return;

    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".eml")) {
      setEmlFile(file);
      setError(null);
    } else {
      setError("Please select a valid .eml file");
    }
  };

  const addVerifiedFlight = async () => {
    if (!emlFile || !isVerified) {
      setError("Please select an EML file first");
      return;
    }

    try {
      setError(null);
      setResult(null);
      setLoading({ uploading: true, processing: false });

      // Create FormData to send the file
      const formData = new FormData();
      formData.append("emlFile", emlFile);

      setLoading({ uploading: false, processing: true });

      // Call server-side API endpoint
      const response = await fetch("/api/verify-flight", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Flight verification failed");
      }

      setResult(
        `Flight verification successful! Transaction hash: ${data.transactionHash}`
      );
      onFlightAdded?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading({ uploading: false, processing: false });
    }
  };

  const isLoading = loading.uploading || loading.processing;

  const getLoadingMessage = () => {
    if (loading.uploading) return "Uploading file...";
    if (loading.processing) return "Processing and verifying flight...";
    return "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Show verification required message if not verified
  if (!isVerified) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconLock size={28} className="text-orange-400" />
          </div>
          <h3 className="text-white font-medium mb-2">Verification Required</h3>
          <p className="text-white/60 text-sm">
            Please complete humanity verification above to upload flight
            confirmations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="file"
            accept=".eml"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="flight-upload"
          />
          <label
            htmlFor="flight-upload"
            className={`block border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              isLoading
                ? "border-white/20 bg-white/5 cursor-not-allowed opacity-50"
                : "border-white/30 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 cursor-pointer"
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <IconUpload size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Upload Flight Email</p>
                <p className="text-white/60 text-sm">
                  Drag & drop your .eml file or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <IconFile size={14} />
                <span>Only .eml files supported</span>
              </div>
            </div>
          </label>
        </div>

        {/* Selected File Display */}
        {emlFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <IconFile size={18} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {emlFile.name}
                </p>
                <p className="text-white/60 text-sm">
                  {formatFileSize(emlFile.size)}
                </p>
              </div>
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <IconCheck size={14} className="text-green-400" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={addVerifiedFlight}
        disabled={!emlFile || isLoading}
        className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
          !emlFile || isLoading
            ? "bg-white/10 text-white/40 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-white border border-blue-500/30 hover:border-blue-500/50"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <IconLoader size={18} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <IconUpload size={18} />
              <span>Verify Flight</span>
            </>
          )}
        </div>
      </button>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
              <IconLoader size={18} className="text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-white font-medium">
                Processing Flight Verification
              </p>
              <p className="text-blue-400 text-sm">{getLoadingMessage()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"
              style={{ width: loading.uploading ? "30%" : "70%" }}
            />
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 backdrop-blur-xl rounded-xl p-4 border border-red-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconAlertCircle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1">Verification Failed</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <IconX size={14} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 backdrop-blur-xl rounded-xl p-4 border border-green-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconCheck size={18} className="text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1">
                Flight Verified Successfully!
              </p>
              <p className="text-green-400 text-sm">{result}</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <IconX size={14} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <p className="text-white/60 text-sm font-medium mb-2">
          💡 Tips for best results:
        </p>
        <ul className="text-white/40 text-xs space-y-1">
          <li>• Use the original email file from your airline</li>
          <li>• Ensure the file contains complete booking information</li>
          <li>• File size should be under 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default AddFlight;
