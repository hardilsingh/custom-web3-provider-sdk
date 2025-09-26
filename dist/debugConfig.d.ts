/**
 * Debug Configuration for Web3 Provider SDK
 *
 * This file allows you to enable comprehensive debug logging
 * for connection flows and wallet actions. Set DEBUG_ENABLED to true
 * to see detailed logs in the console.
 */
export declare const DEBUG_CONFIG: {
    DEBUG_ENABLED: boolean;
    LOG_PREFIX: {
        CONNECTION: string;
        WALLET_ACTION: string;
        PROVIDER: string;
        ERROR: string;
    };
    LOG_LEVELS: {
        CONNECTION: boolean;
        WALLET_ACTIONS: boolean;
        PROVIDER_DETECTION: boolean;
        ERROR_DETAILS: boolean;
    };
};
export declare const applyDebugConfig: (config: Partial<typeof DEBUG_CONFIG>) => void;
