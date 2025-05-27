export const PAIR = [
  {
    name: 'getReserves',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '_reserve0',
        type: 'uint112',
        internalType: 'uint112'
      },
      {
        name: '_reserve1',
        type: 'uint112',
        internalType: 'uint112'
      },
      {
        name: '_blockTimestampLast',
        type: 'uint32',
        internalType: 'uint32'
      }
    ],
    payable: false,
    constant: true,
    stateMutability: 'view'
  },
  {
    name: 'token0',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    payable: false,
    constant: true,
    stateMutability: 'view'
  },
  {
    name: 'token1',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    payable: false,
    constant: true,
    stateMutability: 'view'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'amount0In', type: 'uint256' },
      { indexed: false, name: 'amount1In', type: 'uint256' },
      { indexed: false, name: 'amount0Out', type: 'uint256' },
      { indexed: false, name: 'amount1Out', type: 'uint256' },
      { indexed: true, name: 'to', type: 'address' }
    ],
    name: 'Swap',
    type: 'event'
  }
];
