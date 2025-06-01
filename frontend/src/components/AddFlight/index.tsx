import React, { useState } from "react";

interface AddFlightProps {
  onFlightAdded?: () => void;
}

interface LoadingState {
  uploading: boolean;
  processing: boolean;
}

const AddFlight: React.FC<AddFlightProps> = ({ onFlightAdded }) => {
  const [emlFile, setEmlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    uploading: false,
    processing: false,
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".eml")) {
      setEmlFile(file);
      setError(null);
    } else {
      setError("Please select a valid .eml file");
    }
  };

  const addVerifiedFlight = async () => {
    if (!emlFile) {
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

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Add Verified Flight
      </h2>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Flight Email (.eml file)
          </label>
          <input
            type="file"
            accept=".eml"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {emlFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {emlFile.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={addVerifiedFlight}
          disabled={!emlFile || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Processing..." : "Add Verified Flight"}
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-md">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">{getLoadingMessage()}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFlight;
