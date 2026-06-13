/**
 * Central configuration. All env vars are parsed here exactly once with
 * documented defaults. No raw `process.env` access is allowed elsewhere.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  swagger: {
    enabled: boolean;
    path: string;
  };
  youtube: {
    apiKey: string;
    baseUrl: string;
    timeoutMs: number;
  };
  mongoUri: string;
  privy: {
    appId: string;
    appSecret: string;
  };
  chain: {
    rpcUrl: string;
    id: number;
    escrowAddress: string;
    usdcAddress: string;
    usdcDecimals: number;
    operatorAddress: string;
  };
  cre: {
    /** Shared secret the Chainlink CRE workflow sends to fetch the daily batch. */
    apiKey: string;
  };
  worldId: {
    appId: string;
    rpId: string;
    action: string;
    signingKey: string;
    verifyBaseUrl: string;
    environment: 'production' | 'staging';
    ttlSeconds: number;
    timeoutMs: number;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  swagger: {
    enabled: (process.env.SWAGGER_ENABLED ?? 'true') === 'true',
    path: process.env.SWAGGER_PATH ?? 'docs',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY ?? '',
    baseUrl:
      process.env.YOUTUBE_API_BASE_URL ??
      'https://www.googleapis.com/youtube/v3',
    timeoutMs: parseInt(process.env.YOUTUBE_TIMEOUT_MS ?? '10000', 10),
  },
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/distro',
  privy: {
    appId: process.env.PRIVY_APP_ID ?? '',
    appSecret: process.env.PRIVY_APP_SECRET ?? '',
  },
  chain: {
    rpcUrl: process.env.ARC_RPC_URL ?? 'https://rpc.testnet.arc.network',
    id: parseInt(process.env.CHAIN_ID ?? '5042002', 10),
    escrowAddress:
      process.env.ESCROW_ADDRESS ??
      '0x85ea0a0843169f5BcfEafD295790179964cd5320',
    usdcAddress: process.env.USDC_ADDRESS ?? '',
    // On Arc, USDC is the native gas token — native values are 18-decimal at
    // the wei level even though USDC is logically 6 decimals.
    usdcDecimals: parseInt(process.env.USDC_DECIMALS ?? '18', 10),
    operatorAddress: process.env.ESCROW_OPERATOR_ADDRESS ?? '',
  },
  cre: {
    apiKey: process.env.CRE_API_KEY ?? '',
  },
  worldId: {
    appId: process.env.WORLD_ID_APP_ID ?? '',
    rpId: process.env.WORLD_ID_RP_ID ?? '',
    action: process.env.WORLD_ID_ACTION ?? '',
    signingKey: process.env.WORLD_ID_SIGNING_KEY ?? '',
    verifyBaseUrl:
      process.env.WORLD_ID_VERIFY_BASE_URL ?? 'https://developer.world.org',
    environment:
      process.env.WORLD_ID_ENVIRONMENT === 'staging'
        ? 'staging'
        : 'production',
    ttlSeconds: parseInt(process.env.WORLD_ID_TTL_SECONDS ?? '300', 10),
    timeoutMs: parseInt(process.env.WORLD_ID_TIMEOUT_MS ?? '10000', 10),
  },
});
