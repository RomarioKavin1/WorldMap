# Vlayer Integration Setup

This project integrates vlayer for cryptographic email proof generation. Follow these steps to set up the environment:

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Worldcoin Configuration
NEXT_PUBLIC_APP_ID=your_worldcoin_app_id

# Vlayer Configuration (REQUIRED)
NEXT_PUBLIC_VLAYER_PROVER_URL=https://prover.vlayer.xyz
NEXT_PUBLIC_VLAYER_DNS_SERVICE_URL=https://dns.vlayer.xyz
NEXT_PUBLIC_VLAYER_API_TOKEN=your_vlayer_api_token_here
NEXT_PUBLIC_VLAYER_GAS_LIMIT=10000000
```

## Current Status

⚠️ **Development Note**: The vlayer integration is currently using a simplified mock approach while we resolve contract deployment issues in the browser environment. The demo functionality works but uses placeholder proofs.

## Important Notes

1. **VLAYER_API_TOKEN is required**: Get your API token from the vlayer dashboard
2. **Make sure all environment variables are prefixed with NEXT*PUBLIC*** for client-side access
3. **Restart your development server** after adding environment variables

## Known Issues

- **Contract Deployment**: Dynamic contract deployment from `prove2.ts` doesn't work in browser environments
- **Host Builder Error**: The vlayer service expects specific contract configurations that may need server-side setup
- **Worldcoin Whitelisting**: Actual contracts aren't whitelisted on Worldcoin, so real transactions would fail
- **Transaction Simulation**: Current implementation uses simulated transactions for demo purposes

## Debugging

If you see "string did not match the expected pattern" error:

1. Check browser console for detailed error logs
2. Verify all environment variables are set correctly
3. Ensure the vlayer API token is valid
4. Check that the DNS service URL is accessible

If you see "Host builder: Prover contract ... is not..." error:

1. This indicates contract deployment/configuration issues
2. The current implementation uses mock proofs as a workaround
3. Real vlayer integration may require server-side contract deployment

## How It Works (Current Implementation)

1. **File Upload**: Users upload `.eml` files containing flight confirmation emails
2. **Content Analysis**: The system checks if the email contains "makemytrip" to determine if it should pass verification (demo mode)
3. **Mock Proof Generation**: Currently generates placeholder proofs for demo purposes
4. **Transaction Simulation**:
   - For makemytrip emails: Simulates successful transaction with random hash and Worldscan explorer link
   - For other emails: Shows verification failure
5. **UI Flow**: Shows the complete verification flow including success/failure states

## Demo Mode

- Files containing "makemytrip" (case-insensitive) will simulate passing verification with a successful transaction
- Other files will simulate failing verification without attempting a transaction
- Successful simulations include random transaction hashes and links to Worldscan explorer
- This demonstrates the complete user experience including blockchain transaction confirmation

## Next Steps

1. **Server-Side Integration**: Move vlayer contract deployment to a backend service
2. **Real Proofs**: Replace mock proofs with actual vlayer-generated proofs
3. **Contract Verification**: Implement proper on-chain verification

## Contract Addresses (Placeholder)

The contracts would be deployed on Worldchain:

- EmailDomainProver: To be deployed
- EmailProofVerifier: To be deployed

## Troubleshooting

1. **Environment Variables**: Make sure `.env.local` is in the frontend directory and variables start with `NEXT_PUBLIC_`
2. **API Token**: Get a valid vlayer API token from https://vlayer.xyz
3. **Network**: Ensure you're connected to Worldchain
4. **Browser Console**: Check for detailed error messages in the browser console

## Key Features

- Zero-knowledge email verification using vlayer
- DKIM signature validation
- On-chain proof storage
- Integration with Worldcoin's identity verification
- Real-time transaction monitoring
