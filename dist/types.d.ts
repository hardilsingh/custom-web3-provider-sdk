import { WalletProviderName } from './constants';
/**
 * The methods that are available on an Ethereum provider that follow EIP-1193.
 */
export type AvailableEIP1193Methods = 'eth_requestAccounts' | 'eth_chainId' | 'eth_signTypedData_v4' | 'personal_sign' | 'eth_sendTransaction' | 'eth_getBalance' | 'eth_accounts' | 'eth_estimateGas' | 'eth_gasPrice' | 'eth_getTransactionCount' | 'eth_getTransactionReceipt' | 'eth_getTransactionByHash' | 'eth_blockNumber' | 'eth_getCode' | 'eth_call' | 'eth_getStorageAt' | 'eth_getLogs' | 'wallet_switchEthereumChain' | 'wallet_addEthereumChain';
/**
 * Custom error types for better error handling
 */
export declare class Web3ProviderError extends Error {
    readonly code: string;
    readonly data?: any;
    constructor(message: string, code: string, data?: any);
}
export declare class ProviderNotFoundError extends Web3ProviderError {
    constructor(providerName: string);
}
export declare class ProviderNotConnectedError extends Web3ProviderError {
    constructor();
}
export declare class InvalidAccountError extends Web3ProviderError {
    constructor(account: string);
}
export declare class TransactionError extends Web3ProviderError {
    constructor(message: string, txHash?: string);
}
export declare class NetworkError extends Web3ProviderError {
    constructor(message: string, chainId?: string);
}
/**
 * Provider connection status
 */
export type ProviderStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
    supportsEIP1559: boolean;
    supportsPersonalSign: boolean;
    supportsTypedData: boolean;
    supportsBatchRequests: boolean;
    supportsWalletSwitch: boolean;
    version?: string;
}
/**
 * Interface for an Ethereum provider that follows EIP-1193.
 */
export interface EthereumProvider {
    isMetaMask?: boolean;
    isTrust?: boolean;
    isCustomWallet?: boolean;
    isCoinbaseWallet?: boolean;
    isRabby?: boolean;
    isBraveWallet?: boolean;
    isLxxWallet?: boolean;
    request: (args: {
        method: AvailableEIP1193Methods;
        params?: any[];
    }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    removeAllListeners?: (event?: string) => void;
    isConnected?: () => boolean;
    selectedAddress?: string;
    chainId?: string;
    networkVersion?: string;
    setAddress?: (address: string) => Promise<void> | void;
    [key: string]: any;
}
/**
 * A wallet provider that has been identified and labeled with a known name.
 */
export interface DetectedWalletProvider {
    name: WalletProviderName;
    provider: EthereumProvider;
    capabilities?: ProviderCapabilities;
    isConnected?: boolean;
    version?: string;
}
/**
 * Configuration options for initializing the Web3ProviderManager.
 */
export interface Web3ProviderConfig {
    /**
     * List of wallet provider names to prioritize when selecting a provider.
     * Defaults to ["gala"].
     */
    preferred?: WalletProviderName[];
    /**
     * Whether to fallback to any available provider if no preferred ones are found.
     * Defaults to true.
     */
    fallbackToAny?: boolean;
    /**
     * Callback when accounts are changed.
     */
    onAccountsChanged?: (accounts: string[]) => void;
    /**
     * Callback when the chain changes.
     */
    onChainChanged?: (chainId: string) => void;
    /**
     * Callback when the provider disconnects.
     */
    onDisconnect?: (error: any) => void;
    /**
     * Callback when the list of available providers changes.
     */
    onProvidersChanged?: (providers: DetectedWalletProvider[]) => void;
    /**
     * Time interval (in ms) to check for new providers. Defaults to 1000ms.
     * Set to 0 to disable periodic checking.
     */
    checkInterval?: number;
    /**
     * Whether to automatically connect to the preferred provider on initialization.
     * Defaults to false.
     */
    autoConnect?: boolean;
    /**
     * Maximum number of retry attempts for failed operations.
     * Defaults to 3.
     */
    maxRetries?: number;
    /**
     * Timeout for provider requests in milliseconds.
     * Defaults to 30000 (30 seconds).
     */
    requestTimeout?: number;
    /**
     * Whether to enable debug logging.
     * Defaults to false.
     */
    debug?: boolean;
    /**
     * Custom error handler for provider errors.
     */
    onError?: (error: Web3ProviderError) => void;
}
/**
 * Legacy Transaction Parameters (pre-EIP-1559)
 */
export interface LegacyTransaction {
    to?: string;
    from: string;
    gas?: string;
    gasPrice: string;
    value?: string;
    data?: string;
    nonce?: string;
    chainId?: string;
}
/**
 * EIP-1559 Transaction Parameters
 * Represents the latest Ethereum transaction format introduced in EIP-1559
 */
export interface EIP1559Transaction {
    /**
     * The recipient's address (optional for contract creation)
     * @pattern ^0x[0-9a-fA-F]{40}$
     * @example "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
     */
    to?: string;
    /**
     * The sender's address
     * @pattern ^0x[0-9a-fA-F]{40}$
     * @example "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
     */
    from: string;
    /**
     * The maximum amount of gas the transaction is allowed to use
     * @pattern ^0x([1-9a-f]+[0-9a-f]*|0)$
     * @example "0x5208" (21000 gas)
     */
    gas?: string;
    /**
     * The amount to transfer in wei
     * @pattern ^0x([1-9a-f]+[0-9a-f]*|0)$
     * @example "0x16345785d8a0000" (100 ether in wei)
     */
    value?: string;
    /**
     * The data payload (used for contract calls/creation)
     * @pattern ^0x[0-9a-f]*$
     * @example "0xa9059cbb000000000000000000000000..."
     */
    data?: string;
    /**
     * Maximum fee per gas (includes base + priority fee) in wei
     * @pattern ^0x([1-9a-f]+[0-9a-f]*|0)$
     * @example "0x2540be400" (100 gwei)
     */
    maxFeePerGas: string;
    /**
     * Maximum priority fee per gas (tip to miner) in wei
     * @pattern ^0x([1-9a-f]+[0-9a-f]*|0)$
     * @example "0x3b9aca00" (1 gwei)
     */
    maxPriorityFeePerGas: string;
    /**
     * Chain ID (EIP-155)
     * @example "0x1" for Ethereum Mainnet
     */
    chainId?: string;
    /**
     * Transaction nonce
     */
    nonce?: string;
}
/**
 * Union type for all transaction types
 */
export type Transaction = LegacyTransaction | EIP1559Transaction;
/**
 * Transaction receipt information
 */
export interface TransactionReceipt {
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: string;
    from: string;
    to: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    contractAddress?: string;
    logs: TransactionLog[];
    logsBloom: string;
    status: string;
    effectiveGasPrice?: string;
}
/**
 * Transaction log entry
 */
export interface TransactionLog {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: boolean;
}
/**
 * Gas estimation result
 */
export interface GasEstimate {
    gasLimit: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
}
/**
 * Balance information
 */
export interface BalanceInfo {
    address: string;
    balance: string;
    balanceInEth: string;
}
/**
 * Network information
 */
export interface NetworkInfo {
    chainId: string;
    name: string;
    rpcUrl?: string;
    blockExplorerUrl?: string;
    nativeCurrency?: {
        name: string;
        symbol: string;
        decimals: number;
    };
}
/**
 * Utility functions interface
 */
export interface Web3Utils {
    isValidAddress: (address: string) => boolean;
    isValidChainId: (chainId: string) => boolean;
    formatAddress: (address: string) => string;
    weiToEth: (wei: string) => string;
    ethToWei: (eth: string) => string;
}
/**
 * Wallet actions interface for transaction and signing functions
 */
export interface Web3WalletActions {
    getAccount: () => Promise<string>;
    getAccounts: () => Promise<string[]>;
    getBalance: (address?: string) => Promise<BalanceInfo>;
    getTransactionCount: (address?: string) => Promise<number>;
    estimateGas: (transaction: Partial<Transaction>) => Promise<GasEstimate>;
    signMessage: (message: string) => Promise<string>;
    signTypedData: (typedData: unknown) => Promise<string>;
    sendTransaction: (transaction: Transaction) => Promise<string>;
    getTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>;
    waitForTransaction: (txHash: string) => Promise<TransactionReceipt>;
    switchToDefaultNetwork: () => Promise<void>;
    customRequest: <T = any>(method: string, params?: any[]) => Promise<T>;
}
/**
 * The return type for the useWeb3Provider hook
 */
export interface UseWeb3ProviderReturn {
    providers: DetectedWalletProvider[];
    currentProvider: DetectedWalletProvider | null;
    accounts: string[];
    chainId: string | null;
    status: ProviderStatus;
    error: Web3ProviderError | null;
    isConnecting: boolean;
    isDetecting: boolean;
    connect: (name: WalletProviderName) => Promise<{
        accounts: string[];
        chainId: string;
        provider: DetectedWalletProvider;
        cleanup: () => void;
    }>;
    disconnect: () => void;
    getPreferredProvider: () => DetectedWalletProvider | undefined;
    getProviderByName: (name: WalletProviderName) => EthereumProvider | undefined;
    refreshProviders: () => DetectedWalletProvider[];
    clearError: () => void;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    handleModalProviderSelect: (providerName: string) => void;
    retryCount: number;
    isRetrying: boolean;
    getNetwork?: () => Promise<NetworkInfo>;
    getAccount?: () => Promise<string>;
    getAccounts?: () => Promise<string[]>;
    getBalance?: (address?: string) => Promise<BalanceInfo>;
    getTransactionCount?: (address?: string) => Promise<number>;
    estimateGas?: (transaction: Partial<Transaction>) => Promise<GasEstimate>;
    signMessage?: (message: string) => Promise<string>;
    signTypedData?: (typedData: unknown) => Promise<string>;
    sendTransaction?: (transaction: Transaction) => Promise<string>;
    getTransactionReceipt?: (txHash: string) => Promise<TransactionReceipt>;
    waitForTransaction?: (txHash: string) => Promise<TransactionReceipt>;
    switchToDefaultNetwork?: () => Promise<void>;
    customRequest?: <T = any>(method: string, params?: any[]) => Promise<T>;
    utils: Web3Utils;
}
/**
 * Global window object with Ethereum provider.
 */
declare global {
    interface Window {
        ethereum?: EthereumProvider;
        customWallet?: EthereumProvider;
        coinbaseWalletExtension?: EthereumProvider;
        rabby?: EthereumProvider;
        brave?: EthereumProvider;
        trustwallet?: EthereumProvider;
        lxx?: EthereumProvider;
        lxxwallet?: {
            Provider?: EthereumProvider;
            [key: string]: any;
        };
    }
}
