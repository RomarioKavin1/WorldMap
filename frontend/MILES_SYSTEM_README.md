# WorldMap Miles System 🛫✈️🏨🚌

A comprehensive points system integrated with Blockscout Merits that rewards users for travel activities.

## Overview

The WorldMap Miles system awards points for various travel activities:

- **Signup Bonus**: 25 miles
- **First Flight**: 50 miles base + distance bonus (1 mile per 200km)
- **Subsequent Flights**: 20 miles base + distance bonus (1 mile per 200km)
- **First Hotel**: 40 miles base + duration bonus (5 miles per night)
- **Subsequent Hotels**: 15 miles base + duration bonus (5 miles per night)
- **First Bus**: 30 miles base + optional distance bonus (1 mile per 500km)
- **Subsequent Buses**: 10 miles base + optional distance bonus (1 mile per 500km)

## Environment Setup

Add these variables to your `.env.local` file:

```env
# Blockscout Merits API Configuration
BLOCKSCOUT_API_KEY=your_blockscout_api_key_here
BLOCKSCOUT_BASE_URL=https://merits-staging.blockscout.com
BLOCKSCOUT_PARTNER_ID=your_partner_id_here
```

To get your API key:
1. Join the ETHGlobal Discord: https://ethglobal.com/discord
2. Go to the `#partner-blockscout` channel
3. Request your API key for the hackathon

## API Endpoints

### 1. Get User Miles Balance
```http
GET /api/miles?address=0x...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "exists": true,
    "totalBalance": "150",
    "referrals": "2",
    "registeredAt": "2024-01-15T10:30:00Z",
    "leaderboard": {
      "rank": "42",
      "usersBelow": "1234",
      "topPercent": 0.03
    }
  }
}
```

### 2. Award Signup Bonus
```http
POST /api/miles/signup-bonus
Content-Type: application/json

{
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "milesAwarded": 25,
    "description": "Signup bonus",
    "activityType": "signup",
    "distributionId": "worldmap_signup_0x..._1640995200000",
    "accountsDistributed": "1",
    "accountsCreated": "1"
  }
}
```

### 3. Award Flight Miles
```http
POST /api/miles/flight
Content-Type: application/json

{
  "userAddress": "0x...",
  "fromLocation": "New York",
  "toLocation": "London",
  "departureDate": "2024-01-15T08:00:00Z",
  "arrivalDate": "2024-01-15T20:00:00Z",
  "distance": 5585,
  "fromCoordinates": {"lat": 40.7128, "lon": -74.0060},
  "toCoordinates": {"lat": 51.5074, "lon": -0.1278}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "activityType": "flight",
    "isFirstOfType": true,
    "milesAwarded": 77,
    "baseMiles": 50,
    "bonusMiles": 27,
    "description": "First flight bonus + 27 distance bonus (5585km)",
    "distributionId": "worldmap_flight_0x..._1640995200000",
    "accountsDistributed": "1",
    "userStats": {
      "totalActivities": 1,
      "hasFlights": true,
      "hasHotels": false,
      "hasBuses": false
    }
  },
  "flightDetails": {
    "route": "New York → London",
    "distance": "5585km",
    "departureDate": "2024-01-15T08:00:00Z",
    "arrivalDate": "2024-01-15T20:00:00Z"
  }
}
```

### 4. Award Hotel Miles
```http
POST /api/miles/hotel
Content-Type: application/json

{
  "userAddress": "0x...",
  "location": "Paris",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-18",
  "nights": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "activityType": "hotel",
    "isFirstOfType": true,
    "milesAwarded": 55,
    "baseMiles": 40,
    "bonusMiles": 15,
    "description": "First hotel bonus + 15 duration bonus (3 nights)",
    "distributionId": "worldmap_hotel_0x..._1640995200000",
    "accountsDistributed": "1",
    "userStats": {
      "totalActivities": 2,
      "hasFlights": true,
      "hasHotels": true,
      "hasBuses": false
    }
  },
  "hotelDetails": {
    "location": "Paris",
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-18",
    "nights": 3,
    "stayDuration": "3 nights"
  }
}
```

### 5. Award Bus Miles
```http
POST /api/miles/bus
Content-Type: application/json

{
  "userAddress": "0x...",
  "fromLocation": "Berlin",
  "toLocation": "Munich",
  "travelDate": "2024-01-20",
  "distance": 584,
  "fromCoordinates": {"lat": 52.5200, "lon": 13.4050},
  "toCoordinates": {"lat": 48.1351, "lon": 11.5820}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "activityType": "bus",
    "isFirstOfType": true,
    "milesAwarded": 31,
    "baseMiles": 30,
    "bonusMiles": 1,
    "description": "First bus bonus + 1 distance bonus (584km)",
    "distributionId": "worldmap_bus_0x..._1640995200000",
    "accountsDistributed": "1",
    "userStats": {
      "totalActivities": 3,
      "hasFlights": true,
      "hasHotels": true,
      "hasBuses": true
    }
  },
  "busDetails": {
    "route": "Berlin → Munich",
    "distance": "584km",
    "travelDate": "2024-01-20"
  }
}
```

### 6. Check User Activity Stats
```http
GET /api/miles/award?userAddress=0x...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "stats": {
      "userAddress": "0x...",
      "hasFlights": true,
      "hasHotels": true,
      "hasBuses": false,
      "totalActivities": 2,
      "createdAt": "2024-01-15T10:00:00Z",
      "lastActivityAt": "2024-01-15T14:30:00Z"
    },
    "nextActivityBonuses": {
      "flight": "20 base miles + distance bonus",
      "hotel": "15 base miles + 5 miles per night",
      "bus": "First bus: 30 base miles + distance bonus"
    }
  }
}
```

### 7. Admin Endpoints
```http
GET /api/miles/admin?action=stats
GET /api/miles/admin?action=balance
GET /api/miles/admin?action=users
GET /api/miles/admin?action=export
```

## Frontend Integration Examples

### Award signup bonus when user first connects wallet:
```typescript
const awardSignupBonus = async (userAddress: string) => {
  try {
    const response = await fetch('/api/miles/signup-bonus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`Awarded ${result.data.milesAwarded} miles for signup!`);
    }
  } catch (error) {
    console.error('Failed to award signup bonus:', error);
  }
};
```

### Award flight miles:
```typescript
const awardFlightMiles = async (flightData: {
  userAddress: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  arrivalDate: string;
  distance?: number;
}) => {
  try {
    const response = await fetch('/api/miles/flight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flightData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`Awarded ${result.data.milesAwarded} miles for flight!`);
      console.log(`Route: ${result.flightDetails.route}`);
    }
  } catch (error) {
    console.error('Failed to award flight miles:', error);
  }
};
```

### Get user miles balance:
```typescript
const getUserMiles = async (userAddress: string) => {
  try {
    const response = await fetch(`/api/miles?address=${userAddress}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        balance: result.data.totalBalance,
        rank: result.data.leaderboard?.rank,
        topPercent: result.data.leaderboard?.topPercent
      };
    }
  } catch (error) {
    console.error('Failed to get user miles:', error);
  }
};
```

## Distance Calculation

The system includes built-in distance calculation using the Haversine formula. You can either:

1. **Provide coordinates** - The system will calculate distance automatically
2. **Provide distance directly** - Skip coordinate-based calculation
3. **No distance** - Base miles only (no distance bonus)

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

Common error scenarios:
- Missing required fields (400)
- User already exists for signup bonus (400)
- Invalid dates for hotel stays (400)
- Blockscout API failures (500)
- Missing API key configuration (500)

## Testing

You can test the system with the staging environment:
- Base URL: `https://merits-staging.blockscout.com`
- Use test wallet addresses
- Check your partner balance in the admin endpoint

## Deployment Checklist

1. ✅ Set up Blockscout API key
2. ✅ Configure environment variables
3. ✅ Test signup bonus endpoint
4. ✅ Test flight miles endpoint
5. ✅ Test hotel miles endpoint
6. ✅ Test bus miles endpoint
7. ✅ Verify admin endpoints
8. ✅ Test with real wallet addresses
9. ✅ Monitor partner balance

## Support

For issues with:
- **API endpoints**: Check the console logs and error responses
- **Blockscout integration**: Contact Blockscout team in Discord
- **Miles calculation**: Review the `MilesCalculator` class
- **User tracking**: Check the `UserActivityTracker` service

The system is designed to be robust and handle edge cases gracefully while providing detailed feedback for debugging. 