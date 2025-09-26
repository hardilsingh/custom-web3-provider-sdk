/**
 * Custom error types for better error handling
 */
export class Web3ProviderError extends Error {
    constructor(message, code, data) {
        super(message);
        this.name = 'Web3ProviderError';
        this.code = code;
        this.data = data;
    }
}
export class ProviderNotFoundError extends Web3ProviderError {
    constructor(providerName) {
        super(`Provider "${providerName}" not found`, 'PROVIDER_NOT_FOUND', {
            providerName,
        });
        this.name = 'ProviderNotFoundError';
    }
}
export class ProviderNotConnectedError extends Web3ProviderError {
    constructor() {
        super('No provider is currently connected', 'PROVIDER_NOT_CONNECTED');
        this.name = 'ProviderNotConnectedError';
    }
}
export class InvalidAccountError extends Web3ProviderError {
    constructor(account) {
        super(`Invalid account address: ${account}`, 'INVALID_ACCOUNT', {
            account,
        });
        this.name = 'InvalidAccountError';
    }
}
export class TransactionError extends Web3ProviderError {
    constructor(message, txHash) {
        super(message, 'TRANSACTION_ERROR', { txHash });
        this.name = 'TransactionError';
    }
}
export class NetworkError extends Web3ProviderError {
    constructor(message, chainId) {
        super(message, 'NETWORK_ERROR', { chainId });
        this.name = 'NetworkError';
    }
}
