"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkError = exports.TransactionError = exports.InvalidAccountError = exports.ProviderNotConnectedError = exports.ProviderNotFoundError = exports.Web3ProviderError = void 0;
/**
 * Custom error types for better error handling
 */
class Web3ProviderError extends Error {
    constructor(message, code, data) {
        super(message);
        this.name = 'Web3ProviderError';
        this.code = code;
        this.data = data;
    }
}
exports.Web3ProviderError = Web3ProviderError;
class ProviderNotFoundError extends Web3ProviderError {
    constructor(providerName) {
        super(`Provider "${providerName}" not found`, 'PROVIDER_NOT_FOUND', {
            providerName,
        });
        this.name = 'ProviderNotFoundError';
    }
}
exports.ProviderNotFoundError = ProviderNotFoundError;
class ProviderNotConnectedError extends Web3ProviderError {
    constructor() {
        super('No provider is currently connected', 'PROVIDER_NOT_CONNECTED');
        this.name = 'ProviderNotConnectedError';
    }
}
exports.ProviderNotConnectedError = ProviderNotConnectedError;
class InvalidAccountError extends Web3ProviderError {
    constructor(account) {
        super(`Invalid account address: ${account}`, 'INVALID_ACCOUNT', {
            account,
        });
        this.name = 'InvalidAccountError';
    }
}
exports.InvalidAccountError = InvalidAccountError;
class TransactionError extends Web3ProviderError {
    constructor(message, txHash) {
        super(message, 'TRANSACTION_ERROR', { txHash });
        this.name = 'TransactionError';
    }
}
exports.TransactionError = TransactionError;
class NetworkError extends Web3ProviderError {
    constructor(message, chainId) {
        super(message, 'NETWORK_ERROR', { chainId });
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
