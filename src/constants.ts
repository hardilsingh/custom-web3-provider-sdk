import { Web3ProviderConfig } from './types';

/**
 * Supported wallet provider names.
 * These are the available provider types that can be detected.
 */
export type WalletProviderName =
  | 'customwallet'
  | 'metamask'
  | 'coinbase'
  | 'trustwallet'
  | 'rabby'
  | 'brave'
  | 'lxxwallet';

/**
 * Default network configuration - can be customized
 */
export const DEFAULT_NETWORK = {
  chainId: '0x1a1', // 417 in decimal - can be changed
  chainName: 'Custom Chain',
  nativeCurrency: {
    name: 'CURRENCY',
    symbol: 'CURRENCY',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.custom.chain'],
  blockExplorerUrls: ['https://explorer.custom.chain'],
};

/**
 * Provider detection patterns
 */
export const PROVIDER_PATTERNS = {
  customwallet: {
    windowProperty: 'customWallet',
    isProperty: 'isCustomWallet',
  },
  metamask: {
    windowProperty: 'ethereum',
    isProperty: 'isMetaMask',
  },
  coinbase: {
    windowProperty: 'coinbaseWalletExtension',
    isProperty: 'isCoinbaseWallet',
  },
  trustwallet: {
    windowProperty: 'trustwallet',
    isProperty: 'isTrust',
  },
  rabby: {
    windowProperty: 'rabby',
    isProperty: 'isRabby',
  },
  brave: {
    windowProperty: 'brave',
    isProperty: 'isBraveWallet',
  },
  lxxwallet: {
    windowProperty: 'lxxwallet',
    isProperty: 'isLxxWallet',
  },
} as const;

/**
 * The default configuration for the provider.
 */
export const DEFAULT_CONFIG: Partial<Web3ProviderConfig> = {
  preferred: ['customwallet'], // Can be changed to any supported provider
  fallbackToAny: true,
  checkInterval: 1000,
  autoConnect: false,
  maxRetries: 3,
  requestTimeout: 30000,
  debug: false, // Controls all debug logging - set to true to see connection details
};

/**
 * Error codes for better error handling
 */
export const ERROR_CODES = {
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  PROVIDER_NOT_CONNECTED: 'PROVIDER_NOT_CONNECTED',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNSUPPORTED_METHOD: 'UNSUPPORTED_METHOD',
  INVALID_PARAMS: 'INVALID_PARAMS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  JSON_RPC_ERROR: 'JSON_RPC_ERROR',
} as const;
