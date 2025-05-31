// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Strings} from "@openzeppelin-contracts-5.0.1/utils/Strings.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";

contract MapProver is Prover {
    using RegexLib for string;
    using Strings for string;
    using EmailProofLib for UnverifiedEmail;

    // Booking types
    enum BookingType {
        FLIGHT,
        HOTEL,
        BUS,
        OTHER
    }

    // Standardized booking data structure
    struct VerifiedBooking {
        bytes32 emailHash;
        string fromDomain;
        string toEmail;
        string bookingId;
        string fromLocation;
        string toLocation;
        string startDate;
        string endDate;
        string customerName;
        string price;
        string provider;
        string additionalInfo1; // seat/room/PNR
        string additionalInfo2; // time/booking date
        BookingType bookingType;
        uint256 timestamp;
    }

    // Events for subgraph indexing
    event BookingVerified(
        bytes32 indexed emailHash,
        address indexed user,
        BookingType indexed bookingType,
        string fromDomain,
        string bookingId,
        string fromLocation,
        string toLocation,
        string startDate,
        string endDate,
        string customerName,
        string price,
        string provider,
        uint256 timestamp
    );

    // Legacy events (keeping for backward compatibility)
    event FlightVerified(
        bytes32 indexed emailHash,
        address indexed user,
        string fromDomain,
        string bookingId,
        string departureLocation,
        string arrivalLocation,
        string travelDate,
        string bookingDate,
        uint256 timestamp
    );

    event HotelVerified(
        bytes32 indexed emailHash,
        address indexed user,
        string fromDomain,
        string bookingId,
        string hotelName,
        string guestName,
        string checkinDate,
        string checkoutDate,
        string location,
        string totalPrice,
        string bookingDate,
        uint256 timestamp
    );

    event BusVerified(
        bytes32 indexed emailHash,
        address indexed user,
        string fromDomain,
        string ticketNumber,
        string pnrNumber,
        string departureCity,
        string arrivalCity,
        string travelDate,
        string passengerName,
        string seatNumber,
        string price,
        string busOperator,
        string departureTime,
        uint256 timestamp
    );

    function stringToAddress(string memory str) public pure returns (address) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length == 42, "Invalid address length");
        bytes memory addrBytes = new bytes(20);

        for (uint256 i = 0; i < 20; i++) {
            addrBytes[i] = bytes1(
                hexCharToByte(strBytes[2 + i * 2]) *
                    16 +
                    hexCharToByte(strBytes[3 + i * 2])
            );
        }

        return address(uint160(bytes20(addrBytes)));
    }

    function hexCharToByte(bytes1 char) internal pure returns (uint8) {
        uint8 byteValue = uint8(char);
        if (
            byteValue >= uint8(bytes1("0")) && byteValue <= uint8(bytes1("9"))
        ) {
            return byteValue - uint8(bytes1("0"));
        } else if (
            byteValue >= uint8(bytes1("a")) && byteValue <= uint8(bytes1("f"))
        ) {
            return 10 + byteValue - uint8(bytes1("a"));
        } else if (
            byteValue >= uint8(bytes1("A")) && byteValue <= uint8(bytes1("F"))
        ) {
            return 10 + byteValue - uint8(bytes1("A"));
        }
        revert("Invalid hex character");
    }

    function addVerifiedFlight(
        UnverifiedEmail calldata unverifiedEmail
    ) public view returns (Proof memory, VerifiedBooking memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // Extract booking ID from subject
        string[] memory subjectCapture = email.subject.capture(
            "^E-Ticket for Your Flight Booking ID : ([A-Z0-9]+)$"
        );
        require(subjectCapture.length > 0, "no booking ID in subject");
        string memory bookingId = subjectCapture[1];

        // Extract from domain
        string[] memory fromCaptures = email.from.capture(
            "^[\\w.-]+@([a-zA-Z\\d.-]+\\.[a-zA-Z]{2,})$"
        );
        require(fromCaptures.length == 2, "invalid email domain");
        require(bytes(fromCaptures[1]).length > 0, "invalid email domain");

        // Extract flight route from email body
        string[] memory routeCaptures = email.body.capture(
            "([A-Za-z\\s]+) - ([A-Za-z\\s\\(\\)]+)"
        );
        require(routeCaptures.length >= 3, "invalid flight route");
        string memory departureLocation = routeCaptures[1]; // Chennai
        string memory arrivalLocation = routeCaptures[2]; // taipei (taoyuan)

        // Extract travel date from email body
        string[] memory travelDateCaptures = email.body.capture(
            "Round trip.*?([A-Za-z]{3}, [0-9]{2} [A-Za-z]+)"
        );
        require(travelDateCaptures.length >= 2, "invalid travel date");
        string memory travelDate = travelDateCaptures[1]; // Tue, 01 April

        // Extract booking date from email body
        string[] memory bookingDateCaptures = email.body.capture(
            "Booked on ([0-9]{2} [A-Za-z]+, [0-9]{4})"
        );
        require(bookingDateCaptures.length >= 2, "invalid booking date");
        string memory bookingDate = bookingDateCaptures[1]; // 02 March, 2025

        bytes32 emailHash = sha256(abi.encodePacked(email.from));

        // Create standardized booking data
        VerifiedBooking memory booking = VerifiedBooking({
            emailHash: emailHash,
            fromDomain: fromCaptures[1],
            toEmail: email.to,
            bookingId: bookingId,
            fromLocation: departureLocation,
            toLocation: arrivalLocation,
            startDate: travelDate,
            endDate: travelDate, // Same day for flights
            customerName: "", // Not available in flight emails
            price: "", // Not available in this flight email format
            provider: "", // Airline not captured in this format
            additionalInfo1: "", // No seat info in this format
            additionalInfo2: bookingDate,
            bookingType: BookingType.FLIGHT,
            timestamp: block.timestamp
        });

        // Emit standardized event
        emit BookingVerified(
            emailHash,
            msg.sender,
            BookingType.FLIGHT,
            fromCaptures[1],
            bookingId,
            departureLocation,
            arrivalLocation,
            travelDate,
            travelDate,
            "",
            "",
            "",
            block.timestamp
        );

        // Emit legacy event for backward compatibility
        emit FlightVerified(
            emailHash,
            msg.sender,
            fromCaptures[1],
            bookingId,
            departureLocation,
            arrivalLocation,
            travelDate,
            bookingDate,
            block.timestamp
        );

        return (proof(), booking);
    }

    function addVerifiedHotel(
        UnverifiedEmail calldata unverifiedEmail
    ) public view returns (Proof memory, VerifiedBooking memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // Extract booking ID from subject
        string[] memory subjectCapture = email.subject.capture(
            "^Booking confirmation with Agoda - Booking ID: ([0-9]+)$"
        );
        require(subjectCapture.length > 0, "no booking ID in subject");
        string memory bookingId = subjectCapture[1];

        // Extract from domain
        string[] memory fromCaptures = email.from.capture(
            "^[\\w.-]+@([a-zA-Z\\d.-]+\\.[a-zA-Z]{2,})$"
        );
        require(fromCaptures.length == 2, "invalid email domain");
        require(bytes(fromCaptures[1]).length > 0, "invalid email domain");

        // Extract hotel name from email body
        string[] memory hotelNameCaptures = email.body.capture(
            'id=3D"lblHotelNameData">([^<]+)</strong>'
        );
        require(hotelNameCaptures.length >= 2, "invalid hotel name");
        string memory hotelName = hotelNameCaptures[1];

        // Extract guest name from email body
        string[] memory guestNameCaptures = email.body.capture(
            'id=3D"booking-leadguest">\\s*([^<]+)'
        );
        require(guestNameCaptures.length >= 2, "invalid guest name");
        string memory guestName = guestNameCaptures[1];

        // Extract check-in date from email body
        string[] memory checkinCaptures = email.body.capture(
            'id=3D"checkin-date">\\s*([A-Za-z]+, [A-Za-z]+ [0-9]{1,2}, [0-9]{4})'
        );
        require(checkinCaptures.length >= 2, "invalid check-in date");
        string memory checkinDate = checkinCaptures[1];

        // Extract check-out date from email body
        string[] memory checkoutCaptures = email.body.capture(
            'id=3D"checkout-date">\\s*([A-Za-z]+, [A-Za-z]+ [0-9]{1,2}, [0-9]{4})'
        );
        require(checkoutCaptures.length >= 2, "invalid check-out date");
        string memory checkoutDate = checkoutCaptures[1];

        // Extract location from email body
        string[] memory locationCaptures = email.body.capture(
            "gapore, ([^,]+), ([0-9]+)"
        );
        require(locationCaptures.length >= 3, "invalid location");
        string memory location = locationCaptures[1]; // Singapore

        // Extract total price from email body
        string[] memory priceCaptures = email.body.capture(
            'id=3D"total-price-value">\\s*SGD ([0-9]+\\.[0-9]{2})'
        );
        require(priceCaptures.length >= 2, "invalid total price");
        string memory totalPrice = priceCaptures[1];

        // Extract booking date from email body (from Date header)
        string[] memory bookingDateCaptures = email.body.capture(
            "Date: [A-Za-z]+, ([0-9]{1,2} [A-Za-z]+ [0-9]{4})"
        );
        require(bookingDateCaptures.length >= 2, "invalid booking date");
        string memory bookingDate = bookingDateCaptures[1];

        bytes32 emailHash = sha256(abi.encodePacked(email.from));

        // Create standardized booking data
        VerifiedBooking memory booking = VerifiedBooking({
            emailHash: emailHash,
            fromDomain: fromCaptures[1],
            toEmail: email.to,
            bookingId: bookingId,
            fromLocation: location,
            toLocation: location, // Same location for hotels
            startDate: checkinDate,
            endDate: checkoutDate,
            customerName: guestName,
            price: totalPrice,
            provider: hotelName,
            additionalInfo1: "", // Room details not captured
            additionalInfo2: bookingDate,
            bookingType: BookingType.HOTEL,
            timestamp: block.timestamp
        });

        // Emit standardized event
        emit BookingVerified(
            emailHash,
            msg.sender,
            BookingType.HOTEL,
            fromCaptures[1],
            bookingId,
            location,
            location,
            checkinDate,
            checkoutDate,
            guestName,
            totalPrice,
            hotelName,
            block.timestamp
        );

        // Emit legacy event for backward compatibility
        emit HotelVerified(
            emailHash,
            msg.sender,
            fromCaptures[1],
            bookingId,
            hotelName,
            guestName,
            checkinDate,
            checkoutDate,
            location,
            totalPrice,
            bookingDate,
            block.timestamp
        );

        return (proof(), booking);
    }

    function addVerifiedBus(
        UnverifiedEmail calldata unverifiedEmail
    ) public view returns (Proof memory, VerifiedBooking memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // Extract ticket number from subject
        string[] memory subjectCapture = email.subject.capture(
            "^redBus Ticket - ([A-Z0-9]+)$"
        );
        require(subjectCapture.length > 0, "no ticket number in subject");
        string memory ticketNumber = subjectCapture[1];

        // Extract from domain
        string[] memory fromCaptures = email.from.capture(
            "^[\\w.-]+@([a-zA-Z\\d.-]+\\.[a-zA-Z]{2,})$"
        );
        require(fromCaptures.length == 2, "invalid email domain");
        require(bytes(fromCaptures[1]).length > 0, "invalid email domain");

        // Extract PNR number from email body
        string[] memory pnrCaptures = email.body.capture(
            "PNR&nbsp;No:&nbsp;<b>([0-9]+)</b>"
        );
        require(pnrCaptures.length >= 2, "invalid PNR number");
        string memory pnrNumber = pnrCaptures[1];

        // Extract journey route from email body
        string[] memory routeCaptures = email.body.capture(
            "([A-Za-z]+)-([A-Za-z]+) on [A-Za-z]+, [A-Za-z]+ [0-9]{1,2}, [0-9]{4}"
        );
        require(routeCaptures.length >= 3, "invalid journey route");
        string memory departureCity = routeCaptures[1]; // Chennai
        string memory arrivalCity = routeCaptures[2]; // Bangalore

        // Extract travel date from email body
        string[] memory travelDateCaptures = email.body.capture(
            "([0-9]{2}/[0-9]{2}/[0-9]{4}), ([0-9]{2}:[0-9]{2} [A-Z]{2})"
        );
        require(travelDateCaptures.length >= 3, "invalid travel date");
        string memory travelDate = travelDateCaptures[1]; // 16/12/2024
        string memory departureTime = travelDateCaptures[2]; // 05:00 AM

        // Extract passenger name from email body
        string[] memory passengerCaptures = email.body.capture(
            "class=3D'liketext'> ([A-Za-z ]+)"
        );
        require(passengerCaptures.length >= 2, "invalid passenger name");
        string memory passengerName = passengerCaptures[1];

        // Extract seat number from email body
        string[] memory seatCaptures = email.body.capture(
            'color: #d5585d;">\\s*([0-9]+)</p>'
        );
        require(seatCaptures.length >= 2, "invalid seat number");
        string memory seatNumber = seatCaptures[1];

        // Extract price from email body
        string[] memory priceCaptures = email.body.capture(
            "Rs\\. ([0-9]+\\.[0-9]+)"
        );
        require(priceCaptures.length >= 2, "invalid price");
        string memory price = priceCaptures[1];

        // Extract bus operator from email body
        string[] memory operatorCaptures = email.body.capture(
            'color: #47475d;font-family: roboto[^>]+">\\s*([A-Za-z]+) </div>'
        );
        require(operatorCaptures.length >= 2, "invalid bus operator");
        string memory busOperator = operatorCaptures[1];

        bytes32 emailHash = sha256(abi.encodePacked(email.from));

        // Create standardized booking data
        VerifiedBooking memory booking = VerifiedBooking({
            emailHash: emailHash,
            fromDomain: fromCaptures[1],
            toEmail: email.to,
            bookingId: ticketNumber,
            fromLocation: departureCity,
            toLocation: arrivalCity,
            startDate: travelDate,
            endDate: travelDate, // Same day for bus travel
            customerName: passengerName,
            price: price,
            provider: busOperator,
            additionalInfo1: seatNumber,
            additionalInfo2: pnrNumber,
            bookingType: BookingType.BUS,
            timestamp: block.timestamp
        });

        // Emit standardized event
        emit BookingVerified(
            emailHash,
            msg.sender,
            BookingType.BUS,
            fromCaptures[1],
            ticketNumber,
            departureCity,
            arrivalCity,
            travelDate,
            travelDate,
            passengerName,
            price,
            busOperator,
            block.timestamp
        );

        // Emit legacy event for backward compatibility
        emit BusVerified(
            emailHash,
            msg.sender,
            fromCaptures[1],
            ticketNumber,
            pnrNumber,
            departureCity,
            arrivalCity,
            travelDate,
            passengerName,
            seatNumber,
            price,
            busOperator,
            departureTime,
            block.timestamp
        );

        return (proof(), booking);
    }
}
