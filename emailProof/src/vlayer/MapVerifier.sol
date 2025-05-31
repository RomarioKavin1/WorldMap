// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {MapProver} from "./MapProver.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract MapVerifier is Verifier {
    address public prover;

    // Email registration mappings
    mapping(address => string) public userEmails; // user address => email
    mapping(string => address) public emailOwners; // email => user address
    mapping(bytes32 => bool) public takenEmailHashes; // email hash => used

    // Events
    event EmailRegistered(address indexed user, string email);
    event BookingVerified(
        address indexed user,
        string email,
        MapProver.BookingType bookingType
    );

    constructor(address _prover) {
        prover = _prover;
    }

    // Register user's email (prevents duplicate emails)
    function registerEmail(string calldata email) external {
        require(bytes(email).length > 0, "Email cannot be empty");
        require(emailOwners[email] == address(0), "Email already registered");
        require(
            bytes(userEmails[msg.sender]).length == 0,
            "User already has registered email"
        );

        userEmails[msg.sender] = email;
        emailOwners[email] = msg.sender;

        emit EmailRegistered(msg.sender, email);
    }

    // Update user's email (in case they want to change it)
    function updateEmail(string calldata newEmail) external {
        require(bytes(newEmail).length > 0, "Email cannot be empty");
        require(
            emailOwners[newEmail] == address(0),
            "Email already registered by another user"
        );
        require(
            bytes(userEmails[msg.sender]).length > 0,
            "User has no registered email"
        );

        // Remove old email mapping
        string memory oldEmail = userEmails[msg.sender];
        delete emailOwners[oldEmail];

        // Set new email mapping
        userEmails[msg.sender] = newEmail;
        emailOwners[newEmail] = msg.sender;

        emit EmailRegistered(msg.sender, newEmail);
    }

    function verify(
        Proof calldata proof,
        MapProver.VerifiedBooking calldata booking
    ) public {
        // Verify the proof based on booking type
        if (booking.bookingType == MapProver.BookingType.FLIGHT) {
            require(
                isVerified(prover, MapProver.addVerifiedFlight.selector, proof),
                "Invalid flight proof"
            );
        } else if (booking.bookingType == MapProver.BookingType.HOTEL) {
            require(
                isVerified(prover, MapProver.addVerifiedHotel.selector, proof),
                "Invalid hotel proof"
            );
        } else if (booking.bookingType == MapProver.BookingType.BUS) {
            require(
                isVerified(prover, MapProver.addVerifiedBus.selector, proof),
                "Invalid bus proof"
            );
        } else {
            revert("Unsupported booking type");
        }

        _verifyBooking(booking);
        emit BookingVerified(msg.sender, booking.toEmail, booking.bookingType);
    }

    // Internal function to handle common verification logic
    function _verifyBooking(
        MapProver.VerifiedBooking calldata booking
    ) internal {
        // Prevent reuse of email proofs
        require(
            takenEmailHashes[booking.emailHash] == false,
            "Email proof already used"
        );

        // Ensure the user has registered their email
        require(
            bytes(userEmails[msg.sender]).length > 0,
            "User must register email first"
        );

        // Ensure the email in the proof matches the user's registered email
        require(
            keccak256(abi.encodePacked(userEmails[msg.sender])) ==
                keccak256(abi.encodePacked(booking.toEmail)),
            "Email proof does not match registered email"
        );

        // Mark email hash as used
        takenEmailHashes[booking.emailHash] = true;
    }

    // View functions
    function getUserEmail(address user) external view returns (string memory) {
        return userEmails[user];
    }

    function getEmailOwner(
        string calldata email
    ) external view returns (address) {
        return emailOwners[email];
    }

    function isEmailTaken(string calldata email) external view returns (bool) {
        return emailOwners[email] != address(0);
    }

    function isEmailHashUsed(bytes32 emailHash) external view returns (bool) {
        return takenEmailHashes[emailHash];
    }
}
