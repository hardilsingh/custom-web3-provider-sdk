import { Web3ProviderConfig, UseWeb3ProviderReturn } from './types';
/**
 * A comprehensive hook for managing Web3 providers with enhanced error handling,
 * retry mechanisms, and comprehensive wallet functionality.
 *
 * @param config - The configuration for the provider
 * @returns An object containing providers, connection state, wallet actions, and utilities
 *
 * @example
 * ```typescript
 * const {
 *   providers,
 *   currentProvider,
 *   accounts,
 *   chainId,
 *   status,
 *   error,
 *   isConnecting,
 *   isDetecting,
 *   connect,
 *   disconnect,
 *   getPreferredProvider,
 *   refreshProviders,
 *   // Wallet actions
 *   getAccount,
 *   getBalance,
 *   signMessage,
 *   sendTransaction,
 *   // Utilities
 *   utils
 * } = useWeb3Provider({
 *   preferred: ['customwallet'],
 *   autoConnect: true,
 *   debug: true,
 *   onError: (error) => console.error('Provider error:', error)
 * });
 * ```
 */
export declare function useWeb3Provider(config?: Web3ProviderConfig): UseWeb3ProviderReturn;
