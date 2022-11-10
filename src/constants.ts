export enum Role {
  USER,
  MOD,
  STAFF,
}

export enum Plan {
  FREE,
  STANDARD,
  PRO,
  PREMIUM,
  BUSINESS,
}

export enum SessionType {
  AUTH,
  FORGET_PASSWORD,
  VERIFY_ACCOUNT,
}

export const PlansDetails = [
  // Free
  {
    planName: 'Free',
    storageSpace: 5 * 1024 * 1024 * 1024, // 5GB
    limitedPartSize: 2.5 * 1024 * 1024 * 1024, // 2.5GB
    gateaway: {
      requests: 10_000, // Requets (DELETE, POST, GET, PATCH) per month
      gateawayLimitPartSize: 300 * 1024 * 1024, // 300MB
      manageAccessPremissionForUsers: false,
    },
  },
  // Standard
  {
    planName: 'Standard',
    storageSpace: 100 * 1024 * 1024 * 1024, // 100GB
    limitedPartSize: 5 * 1024 * 1024 * 1024, // 5GB
    gateaway: {
      requests: 50_000, // Requets (DELETE, POST, GET, PATCH) per month
      gateawayLimitPartSize: 2.5 * 1024 * 1024 * 1024, // 2.5GB
      manageAccessPremissionForUsers: true,
    },
  },
  // Pro
  {
    planName: 'Pro',
    storageSpace: 350 * 1024 * 1024 * 1024, // 350GB
    limitedPartSize: 25 * 1024 * 1024 * 1024, // 25GB
    gateaway: {
      requests: 100_000, // Requets (DELETE, POST, GET, PATCH) per month
      gateawayLimitPartSize: 10 * 1024 * 1024 * 1024, // 10GB
      manageAccessPremissionForUsers: true,
    },
  },
  // Premium
  {
    planName: 'Premium',
    storageSpace: 500 * 1024 * 1024 * 1024, // 500GB
    limitedPartSize: 50 * 1024 * 1024 * 1024, // 50GB
    gateaway: {
      requests: 300_000, // Requets (DELETE, POST, GET, PATCH) per month
      gateawayLimitPartSize: 23 * 1024 * 1024 * 1024, // 23GB
      manageAccessPremissionForUsers: true,
    },
  },
];
