/**
 * Vendored subset of the DistroEscrow ABI (read functions + JobCreated event,
 * plus write signatures used for typing). Source of truth:
 * contracts/out/DistroEscrow.sol/DistroEscrow.json. Vendored here to avoid
 * importing across package boundaries (tsconfig rootDir). `as const` preserves
 * literal types for viem inference.
 */
export const DISTRO_ESCROW_ABI = [
  {
    type: 'function',
    name: 'createJob',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'pricePerThousandViews', type: 'uint256' },
      { name: 'budget', type: 'uint256' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordViews',
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'recipients', type: 'address[]' },
      { name: 'views', type: 'uint256[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getJob',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'brand', type: 'address' },
          { name: 'operator', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'pricePerThousandViews', type: 'uint256' },
          { name: 'budget', type: 'uint256' },
          { name: 'allocated', type: 'uint256' },
          { name: 'closed', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'remaining',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owed',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'recordedViews',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextJobId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'JobCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'brand', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'pricePerThousandViews', type: 'uint256', indexed: false },
      { name: 'budget', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const;
