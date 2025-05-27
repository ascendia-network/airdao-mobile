import * as Updates from 'expo-updates';
import { ALL_TOKENS_DATA } from '@constants/allToken';
import { BRIDGE_DATA } from '@constants/bridgeData';
import { SWAP_SUPPORTED_TOKENS } from '@features/swap/entities';

type TConfig = typeof envs.prod & {
  env: 'prod' | 'stage' | 'testnet';
  CHAIN_ID: 16718 | 22040;
  CHAIN_ID_HEX: '0x414e' | '0x5618';
};

const envs = {
  prod: {
    WALLET_API_URL: 'https://wallet-api-api.ambrosus.io',
    EXPLORER_API_URL: 'https://explorer-api.ambrosus.io',
    EXPLORER_API_V2_URL: 'https://explorer-v2-api.ambrosus.io/v2',
    STAKING_API_URL: 'https://staking-api.ambrosus.io/pools/v2',
    EXPLORER_URL: 'https://airdao.io/explorer',
    env: 'prod',
    debug: {
      appBuildVersion: '1.0.0',
      cryptoErrors: true,
      appErrors: false
    },
    walletActions: {
      swap: true,
      send: true,
      receive: true,
      bridge: true,
      stake: true,
      kosmos: true
    },
    AIRDAO_FAQ_URL: 'https://airdao.academy/faqs',
    AIRDAO_X_TWITTER_URL: 'https://twitter.com/airdao_io',
    AIRDAO_TELEGRAM_URL: 'https://t.me/airdao',
    AIRDAO_MEDIUM_URL: 'https://blog.airdao.io/',
    NETWORK_URL: 'https://network.ambrosus.io',
    ETH_NETWORK_URL: 'https://eth.llamarpc.com',
    BSC_NETWORK_URL: 'https://bsc.llamarpc.com',
    NFT_CONTRACT_ADDRESS: '0x4Ae225f3dC55875dc64A96fdE2835A15d3bD872a',
    POOL_STORE_CONTRACT_ADDRESS: '0xfC4CFa1735e13EdC30BE9eA894F2d0bb584ab642',
    ST_AMB_ADDRESS: '0x2834C436d04ED155e736F994c1F3a0d05C4A8dE4',
    LIQUID_STAKING_ADDRESS: '0xBda7cf631Db4535A500ED16Dd98099C04e66F1d5',
    STAKING_TIERS_ADDRESS: '0xD0442B6d4cCf2fEe0B48bc1be607390F4f8EB987',
    ALL_TOKENS: ALL_TOKENS_DATA.PROD,
    MARKETPLACE_URL: 'https://bond-backend-api.ambrosus.io',
    ...BRIDGE_DATA.prod,
    SWAP_TOKENS: SWAP_SUPPORTED_TOKENS.tokens.prod,
    ROUTER_V2_ADDRESS: '0xf7237C595425b49Eaeb3Dc930644de6DCa09c3C4',
    FACTORY_ADDRESS: '0x2b6852CeDEF193ece9814Ee99BE4A4Df7F463557',
    CHAIN_ID: 16718,
    CHAIN_ID_HEX: '0x414e',
    CURRENCY_GRAPH_URL:
      'https://graph-node-api.ambrosus.io/subgraphs/name/airdao/astra-price-test-b',
    AMBRODEO_TOKENS_GRAPH_URL:
      'https://graph-node-api.ambrosus.io/subgraphs/name/airdao/ambrodeo',
    HBR_LIQUIDITY_POOL: '0xA89621016D945408a556ECcb4A10c0122aB852F2',
    HBR_TOKEN_ADDRESS: '0xd09270E917024E75086e27854740871F1C8E0E10',
    BROWSER_CONFIG:
      'https://raw.githubusercontent.com/ambrosus/browser-config/refs/heads/main/config.json'
  },
  stage: {
    WALLET_API_URL: 'https://wallet-api.ambrosus.io',
    EXPLORER_API_URL: 'https://explorer-api.ambrosus.io',
    EXPLORER_API_V2_URL: 'https://explorer-v2-api.ambrosus.io/v2',
    STAKING_API_URL: 'https://staking-api.ambrosus.io/pools/v2',
    EXPLORER_URL: 'https://testnet.airdao.io/explorer',
    env: 'stage',
    debug: {
      appBuildVersion: '1.0.0',
      cryptoErrors: true,
      appErrors: false
    },
    walletActions: {
      swap: true,
      send: true,
      receive: true,
      bridge: true,
      stake: true,
      kosmos: true
    },
    AIRDAO_FAQ_URL: 'https://airdao.academy/faqs',
    AIRDAO_X_TWITTER_URL: 'https://twitter.com/airdao_io',
    AIRDAO_TELEGRAM_URL: 'https://t.me/airdao',
    AIRDAO_MEDIUM_URL: 'https://blog.airdao.io/',
    NETWORK_URL: 'https://network.ambrosus.io',
    ETH_NETWORK_URL: 'https://eth.llamarpc.com',
    BSC_NETWORK_URL: 'https://bsc.llamarpc.com',
    NFT_CONTRACT_ADDRESS: '0x4Ae225f3dC55875dc64A96fdE2835A15d3bD872a',
    POOL_STORE_CONTRACT_ADDRESS: '0xfC4CFa1735e13EdC30BE9eA894F2d0bb584ab642',
    ST_AMB_ADDRESS: '0x2834C436d04ED155e736F994c1F3a0d05C4A8dE4',
    LIQUID_STAKING_ADDRESS: '0xBda7cf631Db4535A500ED16Dd98099C04e66F1d5',
    STAKING_TIERS_ADDRESS: '0xD0442B6d4cCf2fEe0B48bc1be607390F4f8EB987',
    ALL_TOKENS: ALL_TOKENS_DATA.PROD,
    ...BRIDGE_DATA.stage,
    SWAP_TOKENS: SWAP_SUPPORTED_TOKENS.tokens.prod,
    ROUTER_V2_ADDRESS: '0xf7237C595425b49Eaeb3Dc930644de6DCa09c3C4',
    FACTORY_ADDRESS: '0x2b6852CeDEF193ece9814Ee99BE4A4Df7F463557',
    MARKETPLACE_URL: 'https://bond-backend-api.ambrosus.io',
    CHAIN_ID: 16718,
    CHAIN_ID_HEX: '0x414e',
    CURRENCY_GRAPH_URL:
      'https://graph-node-api.ambrosus.io/subgraphs/name/airdao/astra-price-test-b',
    AMBRODEO_TOKENS_GRAPH_URL:
      'https://graph-node-api.ambrosus.io/subgraphs/name/airdao/ambrodeo',
    HBR_LIQUIDITY_POOL: '0xA89621016D945408a556ECcb4A10c0122aB852F2',
    HBR_TOKEN_ADDRESS: '0xd09270E917024E75086e27854740871F1C8E0E10',
    BROWSER_CONFIG:
      'https://raw.githubusercontent.com/ambrosus/browser-config/refs/heads/stage/config.json'
  },
  testnet: {
    WALLET_API_URL: 'https://wallet-api.ambrosus-test.io',
    EXPLORER_API_URL: 'https://explorer-api.ambrosus-test.io',
    EXPLORER_API_V2_URL: 'https://explorer-v2-api.ambrosus-test.io/v2',
    STAKING_API_URL: 'https://staking-api.ambrosus-test.io/pools/v2',
    EXPLORER_URL: 'https://testnet.airdao.io/explorer',
    env: 'testnet',
    debug: {
      appBuildVersion: '1.0.0',
      cryptoErrors: true,
      appErrors: false
    },
    walletActions: {
      swap: true,
      send: true,
      receive: true,
      bridge: true,
      stake: true,
      kosmos: true
    },
    AIRDAO_FAQ_URL: 'https://airdao.academy/faqs',
    AIRDAO_X_TWITTER_URL: 'https://twitter.com/airdao_io',
    AIRDAO_TELEGRAM_URL: 'https://t.me/airdao',
    AIRDAO_MEDIUM_URL: 'https://blog.airdao.io/',
    NETWORK_URL: 'https://network.ambrosus-test.io',
    ETH_NETWORK_URL: 'https://ethereum-sepolia-rpc.publicnode.com',
    BSC_NETWORK_URL: 'https://bsc-testnet.public.blastapi.io',
    POOL_STORE_CONTRACT_ADDRESS: '0x282e57a4581493617029B8945824C156e599e4e0',
    ST_AMB_ADDRESS: '0x5C114A3E9b6DB57A9FE5950eC1946278a2d7A22b',
    NFT_CONTRACT_ADDRESS: '0x4Ae225f3dC55875dc64A96fdE2835A15d3bD872a',
    LIQUID_STAKING_ADDRESS: '0xd33aeaC471e077781c08A073491B5c7d974c6645',
    STAKING_TIERS_ADDRESS: '0x926C2A4a3355d608540749af9017D4613A14E3e1',
    ALL_TOKENS: ALL_TOKENS_DATA.TESTNET,
    ...BRIDGE_DATA.testnet,
    SWAP_TOKENS: SWAP_SUPPORTED_TOKENS.tokens.testnet,
    ROUTER_V2_ADDRESS: '0xA3E524dFc9deA66aE32e81a5E2B4DF24F56e2CBc',
    FACTORY_ADDRESS: '0x7bf4227eDfAA6823aD577dc198DbCadECccbEb07',
    MARKETPLACE_URL: 'https://bond-backend-api.ambrosus-test.io',
    CHAIN_ID: 22040,
    CHAIN_ID_HEX: '0x5618',
    CURRENCY_GRAPH_URL:
      'https://graph-node-api.ambrosus.io/subgraphs/name/airdao/astra-price-test-b',
    AMBRODEO_TOKENS_GRAPH_URL:
      'https://graph-node-api.ambrosus-test.io/subgraphs/name/airdao/ambrodeo',
    HBR_LIQUIDITY_POOL: '0x255b5ff5026f198c83575d9a1A4561fe820ab92e',
    HBR_TOKEN_ADDRESS: '0x7B58Cbb7c4Ff2E53F8c4405606D0A7AF707ab00b',
    BROWSER_CONFIG:
      'https://raw.githubusercontent.com/ambrosus/browser-config/refs/heads/dev/config.json'
  }
};

let Config = envs.prod as TConfig;

switch (Updates.channel) {
  case 'main': {
    Config = envs.prod as TConfig;
    break;
  }
  case 'stage': {
    Config = envs.stage as TConfig;
    break;
  }
  case 'testnet': {
    Config = envs.testnet as TConfig;
    break;
  }
  default: {
    Config = envs.prod as TConfig;
    break;
  }
}

export default Config;
