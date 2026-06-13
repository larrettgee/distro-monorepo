import { http } from "wagmi";
import { createConfig } from "@privy-io/wagmi";
import { arcTestnet } from "./chains";

/**
 * wagmi config wired through Privy. Privy syncs the user's active wallet
 * (embedded or external) into wagmi, so the rest of the app keeps using
 * standard wagmi hooks (useAccount, useSwitchChain, …).
 */
export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
