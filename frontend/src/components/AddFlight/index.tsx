import React, { useState } from "react";
import { ContractSpec, createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import proverSpec from "@/abi/MapProver.json";
import verifierSpec from "@/abi/MapVerifier.json";
import {
    createContext,
    deployVlayerContracts,
    getConfig,
} from "@vlayer/sdk/config";

interface AddFlightProps {
    onFlightAdded?: () => void;
}

interface LoadingState {
    deploying: boolean;
    proving: boolean;
    verifying: boolean;
}

const AddFlight: React.FC<AddFlightProps> = ({ onFlightAdded }) => {
    const [emlFile, setEmlFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<LoadingState>({
        deploying: false,
        proving: false,
        verifying: false,
    });
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.eml')) {
            setEmlFile(file);
            setError(null);
        } else {
            setError('Please select a valid .eml file');
        }
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const addVerifiedFlight = async () => {
        if (!emlFile) {
            setError('Please select an EML file first');
            return;
        }

        try {
            setError(null);
            setResult(null);

            // Read the uploaded EML file
            const mimeEmail = await readFileAsText(emlFile);

            const config = getConfig();
            const {
                chain,
                ethClient,
                account: john,
                proverUrl,
                dnsServiceUrl,
                confirmations,
            } = createContext(config);

            if (!john) {
                throw new Error(
                    "No account found. Make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables"
                );
            }

            if (!dnsServiceUrl) {
                throw new Error("DNS service URL is not set");
            }

            // Deploy contracts
            setLoading(prev => ({ ...prev, deploying: true }));
            const { prover, verifier } = await deployVlayerContracts({
                proverSpec: proverSpec as ContractSpec,
                verifierSpec: verifierSpec as ContractSpec,
                proverArgs: [],
                verifierArgs: [],
            });
            setLoading(prev => ({ ...prev, deploying: false }));

            // Prove
            setLoading(prev => ({ ...prev, proving: true }));
            const vlayer = createVlayerClient({
                url: proverUrl,
                token: config.token,
            });

            const hash = await vlayer.prove({
                address: prover,
                proverAbi: proverSpec.abi as any,
                functionName: "addVerifiedFlight",
                chainId: chain.id,
                gasLimit: config.gasLimit,
                args: [
                    await preverifyEmail({
                        mimeEmail,
                        dnsResolverUrl: dnsServiceUrl,
                        token: config.token,
                    }),
                ],
            });

            const proofResult = await vlayer.waitForProvingResult({ hash });
            setLoading(prev => ({ ...prev, proving: false }));

            // Verify
            setLoading(prev => ({ ...prev, verifying: true }));

            // Estimate gas with pending block to avoid future block assumptions
            const gas = await ethClient.estimateContractGas({
                address: verifier,
                abi: verifierSpec.abi as any,
                functionName: "verify",
                args: proofResult as any,
                account: john,
                blockTag: "pending",
            });

            const verificationHash = await ethClient.writeContract({
                address: verifier,
                abi: verifierSpec.abi as any,
                functionName: "verify",
                args: proofResult as any,
                account: john,
                gas,
            });

            const receipt = await ethClient.waitForTransactionReceipt({
                hash: verificationHash,
                confirmations,
                retryCount: 60,
                retryDelay: 1000,
            });

            setLoading(prev => ({ ...prev, verifying: false }));

            if (receipt.status === 'success') {
                setResult(`Flight verification successful! Transaction hash: ${verificationHash}`);
                onFlightAdded?.();
            } else {
                throw new Error('Verification failed');
            }

        } catch (err) {
            setLoading({
                deploying: false,
                proving: false,
                verifying: false,
            });
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const isLoading = loading.deploying || loading.proving || loading.verifying;

    const getLoadingMessage = () => {
        if (loading.deploying) return 'Deploying contracts...';
        if (loading.proving) return 'Proving flight verification...';
        if (loading.verifying) return 'Verifying on blockchain...';
        return '';
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Verified Flight</h2>

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
                    {isLoading ? 'Processing...' : 'Add Verified Flight'}
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
