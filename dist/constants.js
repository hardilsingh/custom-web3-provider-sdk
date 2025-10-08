"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.DEFAULT_CONFIG = exports.PROVIDER_PATTERNS = exports.DEFAULT_NETWORK = void 0;
/**
 * Default network configuration - can be customized
 * Note: RPC URLs are not used by the SDK - the wallet provider handles all RPC connections
 */
exports.DEFAULT_NETWORK = {
    chainId: '0x1a1', // 417 in decimal - can be changed
    chainName: 'Custom Chain',
    nativeCurrency: {
        name: 'CURRENCY',
        symbol: 'CURRENCY',
        decimals: 18,
    },
    blockExplorerUrls: ['https://explorer.custom.chain'],
};
/**
 * Provider detection patterns
 */
exports.PROVIDER_PATTERNS = {
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
        windowProperty: 'lxx',
        isProperty: 'isLxxWallet',
    },
};
/**
 * The default configuration for the provider.
 */
exports.DEFAULT_CONFIG = {
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
exports.ERROR_CODES = {
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
};
