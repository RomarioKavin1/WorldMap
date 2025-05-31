interface UserActivityRecord {
  userAddress: string;
  hasFlights: boolean;
  hasHotels: boolean;
  hasBuses: boolean;
  totalActivities: number;
  createdAt: Date;
  lastActivityAt: Date;
}

export class UserActivityTracker {
  private static userRecords: Map<string, UserActivityRecord> = new Map();

  static getUserRecord(userAddress: string): UserActivityRecord {
    const normalizedAddress = userAddress.toLowerCase();

    if (!this.userRecords.has(normalizedAddress)) {
      this.userRecords.set(normalizedAddress, {
        userAddress: normalizedAddress,
        hasFlights: false,
        hasHotels: false,
        hasBuses: false,
        totalActivities: 0,
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });
    }

    return this.userRecords.get(normalizedAddress)!;
  }

  static isFirstActivity(
    userAddress: string,
    activityType: "flight" | "hotel" | "bus"
  ): boolean {
    const record = this.getUserRecord(userAddress);

    switch (activityType) {
      case "flight":
        return !record.hasFlights;
      case "hotel":
        return !record.hasHotels;
      case "bus":
        return !record.hasBuses;
      default:
        return false;
    }
  }

  static recordActivity(
    userAddress: string,
    activityType: "flight" | "hotel" | "bus"
  ): void {
    const record = this.getUserRecord(userAddress);

    switch (activityType) {
      case "flight":
        record.hasFlights = true;
        break;
      case "hotel":
        record.hasHotels = true;
        break;
      case "bus":
        record.hasBuses = true;
        break;
    }

    record.totalActivities++;
    record.lastActivityAt = new Date();

    this.userRecords.set(userAddress.toLowerCase(), record);
  }

  static getUserStats(userAddress: string): UserActivityRecord {
    return this.getUserRecord(userAddress);
  }

  static getAllUsers(): UserActivityRecord[] {
    return Array.from(this.userRecords.values());
  }

  // Method to reset user data (useful for testing)
  static resetUserData(userAddress?: string): void {
    if (userAddress) {
      this.userRecords.delete(userAddress.toLowerCase());
    } else {
      this.userRecords.clear();
    }
  }

  // Export data for persistence (you might want to save this to a database)
  static exportData(): Record<string, UserActivityRecord> {
    const data: Record<string, UserActivityRecord> = {};
    this.userRecords.forEach((record, address) => {
      data[address] = record;
    });
    return data;
  }

  // Import data from persistence
  static importData(data: Record<string, UserActivityRecord>): void {
    this.userRecords.clear();
    Object.entries(data).forEach(([address, record]) => {
      // Ensure dates are properly converted
      record.createdAt = new Date(record.createdAt);
      record.lastActivityAt = new Date(record.lastActivityAt);
      this.userRecords.set(address, record);
    });
  }
}
