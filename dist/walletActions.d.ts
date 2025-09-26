import { Transaction, EthereumProvider, TransactionReceipt, GasEstimate, BalanceInfo, NetworkInfo } from './types';
/**
 * Creates comprehensive wallet actions for a provider
 */
export declare const createWalletActions: (provider: EthereumProvider, config?: {
    requestTimeout?: number;
}) => {
    /**
     * Request accounts from the provider - should be the primary method
     */
    requestAccounts: () => Promise<string[]>;
    /**
     * Get the current network information
     */
    getNetwork: () => Promise<NetworkInfo>;
    /**
     * Get the current account
     */
    getAccount: () => Promise<string>;
    /**
     * Get all connected accounts
     */
    getAccounts: () => Promise<string[]>;
    /**
     * Get balance for an address
     */
    getBalance: (address?: string) => Promise<BalanceInfo>;
    /**
     * Get transaction count (nonce) for an address
     */
    getTransactionCount: (address?: string) => Promise<number>;
    /**
     * Estimate gas for a transaction
     */
    estimateGas: (transaction: Partial<Transaction>) => Promise<GasEstimate>;
    /**
     * Sign a message (personal_sign)
     */
    signMessage: (message: string) => Promise<string>;
    /**
     * Sign typed data (eth_signTypedData_v4)
     */
    signTypedData: (typedData: unknown) => Promise<string>;
    /**
     * Send a transaction
     */
    sendTransaction: (transaction: Transaction) => Promise<string>;
    /**
     * Get transaction receipt
     */
    getTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>;
    /**
     * Wait for transaction to be mined
     */
    waitForTransaction: (txHash: string) => Promise<TransactionReceipt>;
    /**
     * Switch to default network
     */
    switchToDefaultNetwork: () => Promise<void>;
    /**
     * Make custom provider requests
     * Allows for any kind of provider request with custom data
     */
    customRequest: <T = any>(method: string, params?: any[]) => Promise<T>;
    /**
     * Utility functions
     */
    utils: {
        weiToEth: (wei: string) => string;
        ethToWei: (eth: string) => string;
        formatAddress: (address: string) => string;
        isValidAddress: (address: string) => boolean;
        isValidChainId: (chainId: string) => boolean;
    };
};
