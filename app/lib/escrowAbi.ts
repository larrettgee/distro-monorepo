/**
 * Minimal DistroEscrow ABI. On Arc, campaigns are funded with the native gas
 * token (USDC) via createJobNative — value=budget, no ERC-20 approve. Clippers
 * pull their credited payout with `claim` (permissionless; pays the recipient).
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
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "owed",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "remaining",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
