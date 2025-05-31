export interface TravelActivity {
  type: "flight" | "hotel" | "bus";
  userId: string;
  userAddress: string;
  isFirstOfType: boolean;
  metadata: FlightMetadata | HotelMetadata | BusMetadata;
}

export interface FlightMetadata {
  fromLocation: string;
  toLocation: string;
  distance?: number; // in km
  departureDate: string;
  arrivalDate: string;
}

export interface HotelMetadata {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
}

export interface BusMetadata {
  fromLocation: string;
  toLocation: string;
  distance?: number; // in km
  travelDate: string;
}

export interface MilesCalculationResult {
  baseMiles: number;
  bonusMiles: number;
  totalMiles: number;
  description: string;
  activityType: string;
}

export class MilesCalculator {
  // Base miles for different activities
  private static readonly MILES_CONFIG = {
    signup: { base: 25, description: "Signup bonus" },
    flight: {
      first: { base: 50, description: "First flight bonus" },
      subsequent: { base: 20, description: "Flight logged" },
      distanceBonus: { rate: 1, per: 200, unit: "km" }, // 1 mile per 200km
    },
    hotel: {
      first: { base: 40, description: "First hotel bonus" },
      subsequent: { base: 15, description: "Hotel stay logged" },
      durationBonus: { rate: 5, per: 1, unit: "night" }, // 5 miles per night
    },
    bus: {
      first: { base: 30, description: "First bus bonus" },
      subsequent: { base: 10, description: "Bus trip logged" },
      distanceBonus: { rate: 1, per: 500, unit: "km" }, // 1 mile per 500km (optional)
    },
  };

  static calculateSignupBonus(): MilesCalculationResult {
    const config = this.MILES_CONFIG.signup;
    return {
      baseMiles: config.base,
      bonusMiles: 0,
      totalMiles: config.base,
      description: config.description,
      activityType: "signup",
    };
  }

  static calculateFlightMiles(
    activity: TravelActivity
  ): MilesCalculationResult {
    if (activity.type !== "flight") {
      throw new Error("Invalid activity type for flight calculation");
    }

    const metadata = activity.metadata as FlightMetadata;
    const config = this.MILES_CONFIG.flight;

    // Base miles
    const baseMiles = activity.isFirstOfType
      ? config.first.base
      : config.subsequent.base;
    const baseDescription = activity.isFirstOfType
      ? config.first.description
      : config.subsequent.description;

    // Distance bonus
    let bonusMiles = 0;
    let bonusDescription = "";

    if (metadata.distance && metadata.distance > 0) {
      bonusMiles =
        Math.floor(metadata.distance / config.distanceBonus.per) *
        config.distanceBonus.rate;
      bonusDescription = ` + ${bonusMiles} distance bonus (${metadata.distance}km)`;
    }

    return {
      baseMiles,
      bonusMiles,
      totalMiles: baseMiles + bonusMiles,
      description: `${baseDescription}${bonusDescription}`,
      activityType: activity.isFirstOfType ? "first_flight" : "flight",
    };
  }

  static calculateHotelMiles(activity: TravelActivity): MilesCalculationResult {
    if (activity.type !== "hotel") {
      throw new Error("Invalid activity type for hotel calculation");
    }

    const metadata = activity.metadata as HotelMetadata;
    const config = this.MILES_CONFIG.hotel;

    // Base miles
    const baseMiles = activity.isFirstOfType
      ? config.first.base
      : config.subsequent.base;
    const baseDescription = activity.isFirstOfType
      ? config.first.description
      : config.subsequent.description;

    // Duration bonus
    const bonusMiles = metadata.nights * config.durationBonus.rate;
    const bonusDescription = ` + ${bonusMiles} duration bonus (${metadata.nights} nights)`;

    return {
      baseMiles,
      bonusMiles,
      totalMiles: baseMiles + bonusMiles,
      description: `${baseDescription}${bonusDescription}`,
      activityType: activity.isFirstOfType ? "first_hotel" : "hotel",
    };
  }

  static calculateBusMiles(activity: TravelActivity): MilesCalculationResult {
    if (activity.type !== "bus") {
      throw new Error("Invalid activity type for bus calculation");
    }

    const metadata = activity.metadata as BusMetadata;
    const config = this.MILES_CONFIG.bus;

    // Base miles
    const baseMiles = activity.isFirstOfType
      ? config.first.base
      : config.subsequent.base;
    const baseDescription = activity.isFirstOfType
      ? config.first.description
      : config.subsequent.description;

    // Distance bonus (optional)
    let bonusMiles = 0;
    let bonusDescription = "";

    if (metadata.distance && metadata.distance > 0) {
      bonusMiles =
        Math.floor(metadata.distance / config.distanceBonus.per) *
        config.distanceBonus.rate;
      bonusDescription = ` + ${bonusMiles} distance bonus (${metadata.distance}km)`;
    }

    return {
      baseMiles,
      bonusMiles,
      totalMiles: baseMiles + bonusMiles,
      description: `${baseDescription}${bonusDescription}`,
      activityType: activity.isFirstOfType ? "first_bus" : "bus",
    };
  }

  static calculateMiles(activity: TravelActivity): MilesCalculationResult {
    switch (activity.type) {
      case "flight":
        return this.calculateFlightMiles(activity);
      case "hotel":
        return this.calculateHotelMiles(activity);
      case "bus":
        return this.calculateBusMiles(activity);
      default:
        throw new Error(`Unknown activity type: ${activity.type}`);
    }
  }

  // Utility method to calculate distance between two locations (basic implementation)
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate nights between two dates
  static calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
