import { DetectedWalletProvider, EthereumProvider, Web3ProviderConfig, ProviderCapabilities, AvailableEIP1193Methods } from './types';
/**
 * Validates if an address is a valid Ethereum address
 */
export declare const isValidAddress: (address: string) => boolean;
/**
 * Validates if a chain ID is valid
 */
export declare const isValidChainId: (chainId: string) => boolean;
/**
 * Detects provider capabilities
 */
export declare const detectProviderCapabilities: (provider: EthereumProvider) => ProviderCapabilities;
/**
 * Detects the providers that are available in the current environment.
 * @returns An array of detected providers.
 */
export declare const detectProviders: () => DetectedWalletProvider[];
/**
 * Sets up event listeners for a provider.
 * @param provider - The provider to set up event listeners for.
 * @param config - The configuration for the provider.
 * @returns A function to remove the event listeners.
 */
export declare const setupProviderEventListeners: (provider: EthereumProvider, config: Pick<Web3ProviderConfig, "onAccountsChanged" | "onChainChanged" | "onDisconnect" | "onError">) => () => void;
/**
 * Creates a timeout promise for provider requests
 */
export declare const createTimeoutPromise: (timeoutMs: number) => Promise<never>;
/**
 * Wraps a provider request with timeout and error handling
 */
export declare const safeProviderRequest: <T = any>(provider: EthereumProvider, method: AvailableEIP1193Methods, params?: any[], timeoutMs?: number) => Promise<T>;
