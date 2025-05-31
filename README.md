# WorldMap - Your Verified Travel Journal on WorldChain

**WorldMap is a Worldchain mini-app that allows unique humans to create a visually stunning, on-chain, and cryptographically verified map of their travels by uploading email proofs of their flights, hotel bookings, and bus tickets.**

## Hackathon Context

This project is designed for a hackathon, focusing on showcasing:
*   Integration with Worldchain as a mini-app.
*   Leveraging World ID for unique human verification.
*   Utilizing vLayer for on-chain email content verification (zkProofs).
*   Demonstrating a practical use case for on-chain data storage and social flexing.
*   Gamification through the Blockscout Merits system.

The goal is an end-to-end working demo that highlights innovation and integration of these technologies.

## Core Idea

Users download their travel confirmation emails (flights, hotels, buses) as `.eml` files. They upload these files to the WorldMap mini-app. The app, using vLayer SDK, generates proof parameters from the email and extracts key travel details (locations, dates). This proof is verified on-chain via vLayer's `vQuery` contract, and the travel data is stored in the `WorldMap` smart contract. Users see their travels pinned on a 3D globe, earn "miles" (points), and can share their verified travel map.

## Key Features

*   **EML Upload:** Users upload `.eml` files of travel confirmations.
*   **vLayer Email Proofs:** Cryptographic verification of email authenticity and content snippets (e.g., sender, regex-matched data from the body) using zkProofs.
*   **On-Chain Travel Registry:** Verified travel items (flights, hotels, buses) are stored on a WorldChain smart contract.
*   **Interactive 3D Globe:** Visual representation of all logged travels with pins. Clicking a pin shows details.
*   **Blockscout Merits System:** Users earn "miles" (points) for adding travel, based on distance, duration of stay, etc.
*   **Unique Human Verification:** Accessible only to World ID verified users within the World App.
*   **Shareable Travel Maps:** Users can generate a public link or GIF of their travel globe to "flex."
*   **Free Alternative:** Offers a way to track and showcase travel data without subscription fees seen in some apps.

## Technology Stack

*   **Frontend:** Next.js (as a Worldchain mini-app), Three.js (for 3D globe).
*   **Backend Logic:** Next.js API Routes (for Blockscout Merits integration, potentially geocoding).
*   **Blockchain:** WorldChain.
*   **Smart Contracts:** Solidity (`WorldMap.sol`, `IVQuery.sol` interface).
*   **Verification:** vLayer SDK & on-chain `vQuery` contract.
*   **Gamification:** Blockscout Merits API.
*   **User Authentication:** World ID.
*   **Wallet Interaction:** ethers.js / viem.

## Architecture Overview

1.  **User Interaction (Frontend - Next.js Mini App):**
    *   User logs in via World ID within the World App.
    *   Uploads an `.eml` file.
    *   Client-side JavaScript uses the vLayer SDK to process the EML.

2.  **vLayer Proof Generation & Data Extraction (Client-side/vLayer SDK):**
    *   vLayer SDK generates ZK-proof parameters (`headerHash`, `publicKeyHash`, `signature`, `emailNullifier`, `message`, `hints`, `regexCommitment`).
    *   Simultaneously, client-side logic (using regex matching the `regexCommitment`) extracts structured data (locations, dates, type) from the EML.

3.  **Smart Contract Interaction (WorldChain):**
    *   User's wallet calls `addTravelItem` on the `WorldMap.sol` contract.
    *   This function first calls vLayer's `vQuery.verifyEmailBodyProof` (or `verifyEmailHeaderProof`) with the proof parameters.
    *   If the proof is valid and the `emailNullifier` hasn't been used, the extracted travel data is stored on-chain.

4.  **Gamification (Next.js API -> Blockscout):**
    *   After successful on-chain storage, the frontend calls a Next.js API route (`/api/award-merits`).
    *   This backend API route communicates with the Blockscout Merits API to award points ("miles") to the user.

5.  **Data Display (Frontend):**
    *   The app reads travel data from the `WorldMap` contract to display pins on the Three.js globe.
    *   Merit scores are displayed to the user.

## Core User/Demo Flow

1.  User signs into the WorldMap mini-app (World ID verified).
2.  User is prompted to upload an `.eml` file (sample EMLs provided for demo).
3.  App processes the EML:
    *   Generates vLayer proof parameters.
    *   Extracts travel data (e.g., From: Paris, To: NYC, Date: July 10, Type: Flight).
4.  User confirms and initiates a transaction to the `WorldMap` smart contract.
    *   Contract verifies the vLayer proof.
    *   Contract stores the travel item if valid.
5.  A new pin appears on the user's 3D globe.
6.  User receives "miles" (points via Blockscout Merit system), visible in the UI.
    *   Points awarded for signup (first time), adding a flight/hotel.
    *   Bonus points for flight distance or hotel stay duration.
7.  User can click a "Share Globe" button to get a public link/GIF of their map.
8.  (Optional for Judges) View the transaction and data on a WorldChain explorer.

## Smart Contract (`WorldMap.sol`)

*   **Purpose:** Stores verified travel items and interacts with vLayer for proof validation.
*   **Key Structs:**
    *   `TravelItem`: `{ id, itemType, fromLocation, toLocationOrCity, startDate, endDate, emailNullifier, user, blockTimestamp }`
    *   `VLayerEmailProofParams`: `{ headerHash, publicKeyHash, signature, emailNullifier, message, hints, regexCommitment }` (as input)
*   **Key Mappings:**
    *   `mapping(bytes32 => bool) public usedNullifiers;`: Prevents re-use of the same email proof.
    *   `mapping(address => uint256[]) public userTravelItemIds;`: Tracks items per user.
*   **Key Functions:**
    *   `constructor(address _vQueryContractAddress)`: Sets the vLayer `vQuery` contract address.
    *   `addTravelItem(address _user, ItemType _itemType, ..., VLayerEmailProofParams calldata _proofParams, bool _verifyBodyProof)`: Core function to add items after vLayer proof verification.
    *   `getUserTravelItems(address _user)`: Retrieves all travel items for a user.
*   **On-Chain Data Stored per Item:** Type, locations, dates, user address, timestamp, and the email nullifier.

## vLayer Email Proof Integration

*   The vLayer SDK is used off-chain (client-side) to process the EML.
*   It generates ZK-SNARK proof parameters based on the email's DKIM signature and content.
*   A `regexCommitment` can be included to prove that certain parts of the email body match a specific regex pattern (used for extracting data like flight details).
*   The `WorldMap` contract calls the `vQueryContract.verifyEmailBodyProof()` (or `verifyEmailHeaderProof()`) with these parameters.
*   The `emailNullifier` ensures each email's proof can only be used once on-chain, preventing duplicates.

## Blockscout Merits Integration

*   "Miles" are awarded to users for activities using the Blockscout Merits API.
*   A Next.js API route (`/api/award-merits`) handles communication with Blockscout.
*   **Points Logic (Example):**
    *   User Signup: +10 merits.
    *   Add First Flight: +20 merits.
    *   Add Subsequent Flight: +10 merits (+ bonus for distance, e.g., 1 merit per 1000km).
    *   Add Hotel Stay: +X merits (e.g., 1 merit per day of stay).
*   The `activityType` in the Merits API helps categorize awarded points.

## Backend API (Next.js)

*   **`/api/award-merits` (POST):**
    *   Receives `userAddress`, `actionType` (e.g., `ADD_FLIGHT`), and `actionData` (e.g., `{ distance: 5000 }`).
    *   Constructs a request to the Blockscout Merits API (`/api/v1/merits_batch`).
    *   Requires `BLOCKSCOUT_API_KEY`, `MERITS_API_BASE_URL`, `MERIT_TOKEN_ID` as environment variables.
*   **(Potentially) `/api/calculate-distance` (GET/POST):**
    *   If geocoding and distance calculation are too heavy for client-side or require an API key best kept secret, this route could handle it. Receives location strings, returns distance.

## Setup Instructions

1.  **Prerequisites:**
    *   Node.js (e.g., v18+) & npm/yarn.
    *   Wallet extension (e.g., MetaMask) configured for WorldChain Testnet/Mainnet.
    *   Familiarity with World ID SDK integration for mini-apps.
2.  **Clone Repository:**
    ```bash
    git clone <your-repo-url>
    cd worldmap-project
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Environment Variables:**
    Create a `.env.local` file in the root of your project with the following:
    ```env
    # Blockscout Merits
    BLOCKSCOUT_API_KEY=your_blockscout_api_key
    MERITS_API_BASE_URL=https://merits.blockscout.com # or your instance
    MERIT_TOKEN_ID=your_project_merit_token_id

    # Smart Contract Addresses (fill after deployment)
    NEXT_PUBLIC_VQUERY_CONTRACT_ADDRESS=address_of_deployed_vQuery_contract_on_worldchain
    NEXT_PUBLIC_WORLDMAP_CONTRACT_ADDRESS=address_of_your_deployed_WorldMap_contract

    # Optional: Geocoding API Key if using a backend route for it
    # GEOCODING_API_KEY=your_geocoding_api_key
    ```
5.  **Deploy Smart Contracts:**
    *   Ensure you have the `IVQuery.sol` interface file.
    *   Deploy `WorldMap.sol` to WorldChain, passing the `VQUERY_CONTRACT_ADDRESS` to its constructor.
    *   Update `NEXT_PUBLIC_WORLDMAP_CONTRACT_ADDRESS` in `.env.local` with the deployed address.

## Running the Application / Demo Steps

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open the application in a browser (or within the World App environment if testing the mini-app integration).
3.  Connect wallet and authenticate with World ID.
4.  Follow the "Core User/Demo Flow" outlined above.
    *   Use provided sample `.eml` files for smooth demoing.
    *   Show the globe updating, points being awarded, and the shareable link feature.

## Future Ideas / Potential Enhancements

*   Broader EML parsing support for more airlines/booking platforms.
*   Advanced social features: leaderboards, comparing maps with friends.
*   Direct integrations with travel platforms for "miles" redemption (long-term).
*   Support for event tickets (concerts, conferences).
*   More sophisticated globe animations and data visualizations.

## Notes for Hackathon Judges

*   **Unique Human Focus:** Leverages World ID to ensure genuine user data and prevent sybil "flexing."
*   **On-Chain Verifiability:** Travel data isn't just stored; its origin (email) is cryptographically proven via vLayer, adding a layer of trust.
*   **Novelty & Integration:** Combines several cutting-edge technologies (WorldChain, World ID, vLayer, Blockscout Merits) into a user-friendly application.
*   **User Engagement:** The 3D globe and "miles" system create an engaging experience, encouraging users to build out their verified travel history.
*   **Practical Application:** Demonstrates a tangible use case for decentralized identity and verifiable credentials in a consumer-facing app.