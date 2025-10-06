import { Web3ProviderConfig } from './types';
/**
 * Supported wallet provider names.
 * These are the available provider types that can be detected.
 */
export type WalletProviderName = 'customwallet' | 'metamask' | 'coinbase' | 'trustwallet' | 'rabby' | 'brave' | 'lxxwallet';
/**
 * Default network configuration - can be customized
 */
export declare const DEFAULT_NETWORK: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
};
/**
 * Provider detection patterns
 */
export declare const PROVIDER_PATTERNS: {
    readonly customwallet: {
        readonly windowProperty: "customWallet";
        readonly isProperty: "isCustomWallet";
    };
    readonly metamask: {
        readonly windowProperty: "ethereum";
        readonly isProperty: "isMetaMask";
    };
    readonly coinbase: {
        readonly windowProperty: "coinbaseWalletExtension";
        readonly isProperty: "isCoinbaseWallet";
    };
    readonly trustwallet: {
        readonly windowProperty: "trustwallet";
        readonly isProperty: "isTrust";
    };
    readonly rabby: {
        readonly windowProperty: "rabby";
        readonly isProperty: "isRabby";
    };
    readonly brave: {
        readonly windowProperty: "brave";
        readonly isProperty: "isBraveWallet";
    };
    readonly lxxwallet: {
        readonly windowProperty: "lxxwallet";
        readonly isProperty: "isLxxWallet";
    };
};
/**
 * The default configuration for the provider.
 */
export declare const DEFAULT_CONFIG: Partial<Web3ProviderConfig>;
/**
 * Error codes for better error handling
 */
export declare const ERROR_CODES: {
    readonly PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND";
    readonly PROVIDER_NOT_CONNECTED: "PROVIDER_NOT_CONNECTED";
    readonly INVALID_ACCOUNT: "INVALID_ACCOUNT";
    readonly TRANSACTION_ERROR: "TRANSACTION_ERROR";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly USER_REJECTED: "USER_REJECTED";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly UNSUPPORTED_METHOD: "UNSUPPORTED_METHOD";
    readonly INVALID_PARAMS: "INVALID_PARAMS";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly RESOURCE_UNAVAILABLE: "RESOURCE_UNAVAILABLE";
    readonly TRANSACTION_REJECTED: "TRANSACTION_REJECTED";
    readonly METHOD_NOT_SUPPORTED: "METHOD_NOT_SUPPORTED";
    readonly LIMIT_EXCEEDED: "LIMIT_EXCEEDED";
    readonly JSON_RPC_ERROR: "JSON_RPC_ERROR";
};
