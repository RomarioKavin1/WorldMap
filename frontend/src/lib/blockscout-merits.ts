interface BlockscoutMeritsConfig {
  apiKey: string;
  baseUrl: string;
  partnerId: string;
}

interface MeritsDistribution {
  address: string;
  amount: string;
}

interface DistributeRequest {
  id: string;
  description: string;
  distributions: MeritsDistribution[];
  create_missing_accounts: boolean;
  expected_total: string;
}

interface UserMeritsInfo {
  exists: boolean;
  user?: {
    address: string;
    total_balance: string;
    referrals: string;
    registered_at: string;
  };
}

interface LeaderboardInfo {
  address: string;
  total_balance: string;
  referrals: string;
  registered_at: string;
  rank: string;
  users_below: string;
  top_percent: number;
}

export class BlockscoutMeritsService {
  private config: BlockscoutMeritsConfig;

  constructor(config: BlockscoutMeritsConfig) {
    this.config = config;
  }

  async getUserInfo(address: string): Promise<UserMeritsInfo> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/auth/user/${address}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserLeaderboard(address: string): Promise<LeaderboardInfo> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/leaderboard/users/${address}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user leaderboard: ${response.statusText}`);
    }

    return response.json();
  }

  async getPartnerBalance() {
    const response = await fetch(
      `${this.config.baseUrl}/partner/api/v1/balance`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: this.config.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get partner balance: ${response.statusText}`);
    }

    return response.json();
  }

  async distributeMerits(distributionData: DistributeRequest) {
    const response = await fetch(
      `${this.config.baseUrl}/partner/api/v1/distribute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: this.config.apiKey,
        },
        body: JSON.stringify(distributionData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to distribute merits: ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async getNonce() {
    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/nonce`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get nonce: ${response.statusText}`);
    }

    return response.json();
  }

  async loginUser(nonce: string, message: string, signature: string) {
    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        nonce,
        message,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to login user: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
let meritsService: BlockscoutMeritsService | null = null;

export function getMeritsService(): BlockscoutMeritsService {
  if (!meritsService) {
    const config = {
      apiKey: process.env.BLOCKSCOUT_API_KEY || "",
      baseUrl:
        process.env.BLOCKSCOUT_BASE_URL ||
        "https://merits-staging.blockscout.com",
      partnerId: process.env.BLOCKSCOUT_PARTNER_ID || "",
    };

    if (!config.apiKey) {
      throw new Error("BLOCKSCOUT_API_KEY environment variable is required");
    }

    meritsService = new BlockscoutMeritsService(config);
  }

  return meritsService;
}
