// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorldMap {
    event TravelItemAdded(
        address indexed user,
        uint256 itemId,
        ItemType itemType,
        string fromLocation,
        string toLocationOrCity,
        uint256 eventDate // Simplified to a single date for simplicity
    );

    enum ItemType {
        Flight,
        Hotel,
        Bus,
        Other
    }

    struct TravelItem {
        uint256 id; // Unique ID for the item
        address user; // Address of the user who added it
        ItemType itemType; // Type of travel item
        string fromLocation; // e.g., Departure city or empty for hotel
        string toLocationOrCity; // e.g., Arrival city or Hotel city
        uint256 eventDate; // e.g., Flight date, Hotel check-in date (Unix timestamp)
        uint256 blockTimestamp; // When it was added
    }

    TravelItem[] public allTravelItems;
    mapping(address => uint256[]) public userTravelItemIds; // Maps user address to an array of their item IDs (indices)
    uint256 private _nextItemId; // Counter for item IDs

    /**
     * @notice Adds a new travel item for the calling user.
     * @param _itemType The type of travel item.
     * @param _fromLocation The starting location (can be empty).
     * @param _toLocationOrCity The destination or city of the item.
     * @param _eventDate The primary date associated with the item (e.g., flight date, check-in date).
     */
    function addTravelItem(
        ItemType _itemType,
        string memory _fromLocation,
        string memory _toLocationOrCity,
        uint256 _eventDate
    ) public {
        uint256 itemId = _nextItemId++;
        address user = msg.sender; // Item is attributed to the transaction sender

        TravelItem memory newItem = TravelItem({
            id: itemId,
            user: user,
            itemType: _itemType,
            fromLocation: _fromLocation,
            toLocationOrCity: _toLocationOrCity,
            eventDate: _eventDate,
            blockTimestamp: block.timestamp
        });

        allTravelItems.push(newItem);
        userTravelItemIds[user].push(itemId); // Store the index which is the ID

        emit TravelItemAdded(
            user,
            itemId,
            _itemType,
            _fromLocation,
            _toLocationOrCity,
            _eventDate
        );
    }

    /**
     * @notice Retrieves all travel items for a specific user.
     * @param _user The address of the user.
     * @return An array of TravelItem structs.
     */
    function getUserTravelItems(
        address _user
    ) public view returns (TravelItem[] memory) {
        uint256[] memory itemIdsForUser = userTravelItemIds[_user];
        TravelItem[] memory items = new TravelItem[](itemIdsForUser.length);

        for (uint256 i = 0; i < itemIdsForUser.length; i++) {
            items[i] = allTravelItems[itemIdsForUser[i]];
        }
        return items;
    }

    /**
     * @notice Retrieves a specific travel item by its global ID.
     * @param _itemId The ID (index) of the travel item.
     * @return The TravelItem struct.
     */
    function getTravelItemById(
        uint256 _itemId
    ) public view returns (TravelItem memory) {
        require(
            _itemId < allTravelItems.length,
            "WorldMapSimple: Invalid item ID"
        );
        return allTravelItems[_itemId];
    }

    /**
     * @notice Gets the count of travel items for a specific user.
     * @param _user The address of the user.
     * @return The number of items.
     */
    function getUserTravelItemCount(
        address _user
    ) public view returns (uint256) {
        return userTravelItemIds[_user].length;
    }

    /**
     * @notice Gets the total count of all travel items stored in the contract.
     * @return The total number of items.
     */
    function getTotalTravelItemsCount() public view returns (uint256) {
        return allTravelItems.length;
    }
}
