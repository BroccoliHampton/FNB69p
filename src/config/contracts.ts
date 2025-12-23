export const MULTICALL_ADDRESS = '0x5D16A5EB8Ac507eF417A44b8d767104dC52EFa87' as const;
export const TOKEN_ADDRESS = '0x866F161283d9f6E242C03877474606Cb6A4660AC' as const;
export const LP_ADDRESS = '0xd0D1183bb68d4bc4E28f31738CDb33f683AC318A' as const;

export const RIG_ADDRESS = '0x9F62F04b1C856ea974d58FcEADCA56835e1A235c' as const;

export const MULTICALL_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'rig', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'getRig',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'epochId', type: 'uint256' },
          { internalType: 'uint256', name: 'initPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'epochStartTime', type: 'uint256' },
          { internalType: 'uint256', name: 'glazed', type: 'uint256' },
          { internalType: 'uint256', name: 'price', type: 'uint256' },
          { internalType: 'uint256', name: 'ups', type: 'uint256' },
          { internalType: 'uint256', name: 'nextUps', type: 'uint256' },
          { internalType: 'uint256', name: 'unitPrice', type: 'uint256' },
          { internalType: 'address', name: 'miner', type: 'address' },
          { internalType: 'string', name: 'epochUri', type: 'string' },
          { internalType: 'string', name: 'rigUri', type: 'string' },
          { internalType: 'uint256', name: 'ethBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'wethBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'donutBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'unitBalance', type: 'uint256' },
        ],
        internalType: 'struct Multicall.RigState',
        name: 'state',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'rig', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'getAuction',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'epochId', type: 'uint256' },
          { internalType: 'uint256', name: 'initPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'address', name: 'paymentToken', type: 'address' },
          { internalType: 'uint256', name: 'price', type: 'uint256' },
          { internalType: 'uint256', name: 'paymentTokenPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'wethAccumulated', type: 'uint256' },
          { internalType: 'uint256', name: 'wethBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'donutBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'paymentTokenBalance', type: 'uint256' },
        ],
        internalType: 'struct Multicall.AuctionState',
        name: 'state',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'rig', type: 'address' },
      { internalType: 'uint256', name: 'epochId', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint256', name: 'maxPrice', type: 'uint256' },
      { internalType: 'string', name: 'epochUri', type: 'string' },
    ],
    name: 'mine',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export interface RigState {
  epochId: bigint;
  initPrice: bigint;
  epochStartTime: bigint;
  glazed: bigint;
  price: bigint;
  ups: bigint;
  nextUps: bigint;
  unitPrice: bigint;
  miner: `0x${string}`;
  epochUri: string;
  rigUri: string;
  ethBalance: bigint;
  wethBalance: bigint;
  donutBalance: bigint;
  unitBalance: bigint;
}

export interface AuctionState {
  epochId: bigint;
  initPrice: bigint;
  startTime: bigint;
  paymentToken: `0x${string}`;
  price: bigint;
  paymentTokenPrice: bigint;
  wethAccumulated: bigint;
  wethBalance: bigint;
  donutBalance: bigint;
  paymentTokenBalance: bigint;
}
