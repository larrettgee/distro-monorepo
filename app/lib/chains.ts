import { defineChain } from "viem";

/**
 * Arc testnet — https://testnet.arcscan.app
 *
 * Gas is paid in USDC. EVM native values are still 18-decimal at the wei level,
 * so `decimals` is 18 even though the symbol shows as USDC.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
      apiUrl: "https://testnet.arcscan.app/api",
    },
  },
  testnet: true,
});
