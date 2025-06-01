import fs from "fs";
import { createVlayerClient, preverifyEmail, ContractSpec } from "@vlayer/sdk";
import proverSpec from "./specs/EmailDomainProver.sol/EmailDomainProver.json";
import verifierSpec from "./specs/EmailProofVerifier.sol/EmailDomainVerifier.json";
import {
  createContext,
  deployVlayerContracts,
  getConfig,
} from "@vlayer/sdk/config";
import { Abi } from "viem";

const mimeEmail = fs.readFileSync("../testdata/verify_vlayer.eml").toString();

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
    "No account found make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables"
  );
}

const { prover, verifier } = await deployVlayerContracts({
  proverSpec: proverSpec as ContractSpec,
  verifierSpec: verifierSpec as ContractSpec,
  proverArgs: [],
  verifierArgs: [],
});

if (!dnsServiceUrl) {
  throw new Error("DNS service URL is not set");
}

console.log("Proving...");
const vlayer = createVlayerClient({
  url: proverUrl,
  token: config.token,
});
const hash = await vlayer.prove({
  address: prover,
  proverAbi: proverSpec.abi as Abi,
  functionName: "main",
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
const result = await vlayer.waitForProvingResult({ hash });

console.log("Verifying...");

// Workaround for viem estimating gas with `latest` block causing future block assumptions to fail on slower chains like mainnet/sepolia
const gas = await ethClient.estimateContractGas({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "verify",
  args: result as unknown[],
  account: john,
  blockTag: "pending",
});

const verificationHash = await ethClient.writeContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "verify",
  args: result as unknown[],
  account: john,
  gas,
});

const receipt = await ethClient.waitForTransactionReceipt({
  hash: verificationHash,
  confirmations,
  retryCount: 60,
  retryDelay: 1000,
});

console.log(`Verification result: ${receipt.status}`);
