/**
 * Minimal DistroEscrow ABI for the brand create flow. On Arc, campaigns are
 * funded with the native gas token (USDC) via createJobNative — value=budget,
 * no ERC-20 approve.
 */
export const distroEscrowAbi = [
  {
    type: "function",
    name: "createJobNative",
    stateMutability: "payable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "pricePerThousandViews", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
] as const;
