'use client';

import MapProverSpec from '@/abi/MapProver.json';
import MapVerifierSpec from '@/abi/MapVerifier.json';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { mapVerifierAddress } from '@/lib/const';
import { X, Mail, User, CheckCircle, XCircle } from 'lucide-react';

/**
 * Enhanced Registration component with modal interface and proper email validation
 * Uses the same Button and LiveFeedback pattern as other components in the app
 */
export const Transaction = () => {
    const [buttonState, setButtonState] = useState<
        'pending' | 'success' | 'failed' | undefined
    >(undefined);
    const [email, setEmail] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<string>('');
    const [isValidatingEmail, setIsValidatingEmail] = useState<boolean>(false);

    // This triggers the useWaitForTransactionReceipt hook when updated
    const [transactionId, setTransactionId] = useState<string>('');

    // Feel free to use your own RPC provider for better performance
    const client = createPublicClient({
        chain: worldchain,
        transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
    });

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError,
        error,
    } = useWaitForTransactionReceipt({
        client: client,
        appConfig: {
            app_id: process.env.NEXT_PUBLIC_APP_ID as `app_${string}`,
        },
        transactionId: transactionId,
    });

    useEffect(() => {
        if (transactionId && !isConfirming) {
            if (isConfirmed) {
                console.log('Transaction confirmed!');
                setButtonState('success');
                setTimeout(() => {
                    setButtonState(undefined);
                    setIsModalOpen(false);
                    setEmail('');
                    setEmailError('');
                }, 3000);
            } else if (isError) {
                console.error('Transaction failed:', error);
                setButtonState('failed');
                setTimeout(() => {
                    setButtonState(undefined);
                }, 3000);
            }
        }
    }, [isConfirmed, isConfirming, isError, error, transactionId]);

    // Email validation function
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email input change with real-time validation
    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError('');

        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        }
    };

    // Check if email is already registered
    const checkEmailAvailability = async (email: string): Promise<boolean> => {
        setIsValidatingEmail(true);
        try {
            // Check if email is already taken on the contract
            const isEmailTaken = await client.readContract({
                address: mapVerifierAddress,
                abi: MapVerifierSpec.abi,
                functionName: 'isEmailTaken',
                args: [email],
            }) as boolean;

            if (isEmailTaken) {
                setEmailError('This email is already registered');
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error checking email availability:', err);
            setEmailError('Unable to verify email availability');
            return false;
        } finally {
            setIsValidatingEmail(false);
        }
    };

    // Handle registration transaction
    const onClickRegister = async () => {
        // Validate email format
        if (!email || !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Check email availability
        const isAvailable = await checkEmailAvailability(email);
        if (!isAvailable) {
            return;
        }

        setTransactionId('');
        setButtonState('pending');

        try {
            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: mapVerifierAddress,
                        abi: MapVerifierSpec.abi as any,
                        functionName: 'registerEmail',
                        args: [email],
                    },
                ],
            });

            if (finalPayload.status === 'success') {
                console.log(
                    'Registration submitted, waiting for confirmation:',
                    finalPayload.transaction_id,
                );
                setTransactionId(finalPayload.transaction_id);
            } else {
                console.error('Registration submission failed:', finalPayload);
                setButtonState('failed');
                setTimeout(() => {
                    setButtonState(undefined);
                }, 3000);
            }
        } catch (err) {
            console.error('Error sending registration transaction:', err);
            setButtonState('failed');
            setTimeout(() => {
                setButtonState(undefined);
            }, 3000);
        }
    };

    // Close modal and reset state
    const closeModal = () => {
        if (buttonState !== 'pending') {
            setIsModalOpen(false);
            setEmail('');
            setEmailError('');
            setButtonState(undefined);
        }
    };

    // Open registration modal
    const openModal = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Main Registration Button */}
            <div className="grid w-full gap-4">
                <p className="text-lg font-semibold">Registration</p>
                <Button
                    onClick={openModal}
                    size="lg"
                    variant="primary"
                    className="w-full"
                >
                    Register Your Email
                </Button>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Register Email</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={buttonState === 'pending'}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-6">
                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Register your email address to start verifying your travel bookings.
                                This email will be used to match your booking confirmations.
                            </p>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        disabled={buttonState === 'pending' || isValidatingEmail}
                                        placeholder="your@email.com"
                                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${emailError
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {/* Validation Indicator */}
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {isValidatingEmail && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        )}
                                        {email && !emailError && !isValidatingEmail && validateEmail(email) && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {emailError && (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                                {/* Error Message */}
                                {emailError && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            {/* Registration Button with Feedback */}
                            <LiveFeedback
                                label={{
                                    failed: 'Registration failed',
                                    pending: 'Processing registration...',
                                    success: 'Email registered successfully!',
                                }}
                                state={buttonState}
                                className="w-full"
                            >
                                <Button
                                    onClick={onClickRegister}
                                    disabled={
                                        buttonState === 'pending' ||
                                        !email ||
                                        !!emailError ||
                                        !validateEmail(email) ||
                                        isValidatingEmail
                                    }
                                    size="lg"
                                    variant="primary"
                                    className="w-full"
                                >
                                    {buttonState === 'pending' ? 'Registering...' : 'Register Email'}
                                </Button>
                            </LiveFeedback>

                            {/* Additional Info */}
                            <div className="text-xs text-gray-500 text-center space-y-1">
                                <p>• Each wallet can only register one email address</p>
                                <p>• Email addresses cannot be shared between wallets</p>
                                <p>• You can update your email later if needed</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
