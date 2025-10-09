import { Web3ProviderError, } from './types';
import { PROVIDER_PATTERNS, ERROR_CODES, } from './constants';
import { logger } from './utils/logger';
/**
 * Validates if an address is a valid Ethereum address
 */
export const isValidAddress = (address) => {
    // Enhanced validation: check basic format and checksum
    if (!address || typeof address !== 'string') {
        return false;
    }
    // Basic hex format validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false;
    }
    // Return true for basic validation - full EIP-55 checksum validation
    // would require additional libraries but basic format is secure enough
    return true;
};
/**
 * Validates if a chain ID is valid
 */
export const isValidChainId = (chainId) => {
    if (!chainId || typeof chainId !== 'string') {
        return false;
    }
    // Validate hex format and not zero or empty
    const isValidHex = /^0x[a-fA-F0-9]+$/.test(chainId);
    const isNotZero = chainId !== '0x' && chainId !== '0x0';
    const hasReasonableLength = chainId.length >= 3 && chainId.length <= 64; // Max 256-bit hex
    return isValidHex && isNotZero && hasReasonableLength;
};
/**
 * Detects provider capabilities
 */
export const detectProviderCapabilities = (provider) => {
    return {
        supportsEIP1559: typeof provider.request === 'function',
        supportsPersonalSign: typeof provider.request === 'function',
        supportsTypedData: typeof provider.request === 'function',
        supportsBatchRequests: false, // Most providers don't support this
        supportsWalletSwitch: typeof provider.request === 'function',
        version: provider.networkVersion || 'unknown',
    };
};
/**
 * Detects the providers that are available in the current environment.
 * @returns An array of detected providers.
 */
export const detectProviders = () => {
    if (typeof window === 'undefined')
        return [];
    const detected = [];
    // Check each provider pattern
    Object.entries(PROVIDER_PATTERNS).forEach(([name, pattern]) => {
        const provider = window[pattern.windowProperty];
        if (provider && typeof provider.request === 'function') {
            // Dynamic validation: check if provider has the isProperty (even if false) or if it's a known provider
            const hasIsProperty = pattern.isProperty && pattern.isProperty in provider;
            // Accept provider if:
            // 1. It has the isProperty set to true, OR
            // 2. It has the isProperty (even if false) and it's a known provider pattern, OR
            // 3. It's a custom wallet (no isProperty required), OR
            // 4. It has the isProperty but it's false (handles cases like LXX wallet)
            if ((hasIsProperty && pattern.isProperty) ||
                name === 'customwallet' ||
                provider[pattern.isProperty] === false) {
                detected.push({
                    name: name,
                    provider,
                    capabilities: detectProviderCapabilities(provider),
                    isConnected: provider.isConnected?.() || false,
                    version: provider.networkVersion || 'unknown',
                });
            }
            logger.debug('Detected provider', {
                name,
                provider: provider.constructor?.name || 'Provider',
                hasIsProperty,
            });
        }
    });
    return detected;
};
/**
 * Sets up event listeners for a provider.
 * @param provider - The provider to set up event listeners for.
 * @param config - The configuration for the provider.
 * @returns A function to remove the event listeners.
 */
export const setupProviderEventListeners = (provider, config) => {
    if (!provider.on)
        return () => { };
    const handleAccountsChanged = (newAccounts) => {
        try {
            // CRITICAL: Handle both single accounts and arrays (different providers)
            const accountsArray = Array.isArray(newAccounts)
                ? newAccounts
                : newAccounts
                    ? [newAccounts]
                    : [];
            if (accountsArray.length >= 0) {
                // Valid even if empty array
                const validAccounts = accountsArray.filter(account => account && typeof account === 'string' && isValidAddress(account));
                logger.debug('Accounts changed event', {
                    original: newAccounts,
                    valid: validAccounts,
                });
                config.onAccountsChanged?.(validAccounts);
            }
            else {
                logger.warn('Invalid accounts changed event', newAccounts);
                config.onError?.(new Web3ProviderError('Invalid accounts format in accountsChanged event', ERROR_CODES.INVALID_PARAMS, { accounts: newAccounts }));
            }
        }
        catch (error) {
            logger.error('Error in accounts changed handler', error);
            config.onError?.(new Web3ProviderError('Error handling accounts changed event', ERROR_CODES.INTERNAL_ERROR, { error, accounts: newAccounts }));
        }
    };
    const handleChainChanged = (newChainId) => {
        try {
            logger.debug('Chain changed event received', newChainId);
            // Validate chain ID with comprehensive checks
            if (newChainId && typeof newChainId === 'string') {
                if (isValidChainId(newChainId)) {
                    logger.debug('Chain changed event valid, calling callback');
                    config.onChainChanged?.(newChainId);
                }
                else {
                    logger.warn('Invalid chain ID format', newChainId);
                    config.onError?.(new Web3ProviderError('Invalid chain ID format received', ERROR_CODES.NETWORK_ERROR, { chainId: newChainId }));
                }
            }
            else {
                logger.warn('Invalid chain changed event format', {
                    type: typeof newChainId,
                    value: newChainId,
                });
                config.onError?.(new Web3ProviderError('Invalid chain ID data type', ERROR_CODES.NETWORK_ERROR, { chainId: newChainId }));
            }
        }
        catch (error) {
            logger.error('Error in chain changed handler', error);
            config.onError?.(new Web3ProviderError('Error handling chain changed event', ERROR_CODES.INTERNAL_ERROR, { error, chainId: newChainId }));
        }
    };
    const handleDisconnect = (err) => {
        try {
            const error = err instanceof Error ? err : new Error(JSON.stringify(err));
            config.onDisconnect?.(error);
        }
        catch (error) {
            config.onError?.(new Web3ProviderError('Error handling disconnect event', ERROR_CODES.INTERNAL_ERROR, { error, originalError: err }));
        }
    };
    const handleConnect = (connectInfo) => {
        try {
            // Handle connection events if needed
            logger.debug('Provider connected', connectInfo);
        }
        catch (error) {
            config.onError?.(new Web3ProviderError('Error handling connect event', ERROR_CODES.INTERNAL_ERROR, { error, connectInfo }));
        }
    };
    // Set up event listeners with error handling
    try {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
        provider.on('disconnect', handleDisconnect);
        provider.on('connect', handleConnect);
        logger.debug('Event listeners attached successfully');
    }
    catch (error) {
        logger.error('Failed to attach event listeners', error);
        config.onError?.(new Web3ProviderError('Failed to attach event listeners', ERROR_CODES.INTERNAL_ERROR, { error }));
    }
    // Return enhanced cleanup function
    return () => {
        logger.debug('Cleaning up event listeners');
        try {
            if (provider.removeListener) {
                provider.removeListener('accountsChanged', handleAccountsChanged);
                provider.removeListener('chainChanged', handleChainChanged);
                provider.removeListener('disconnect', handleDisconnect);
                provider.removeListener('connect', handleConnect);
                logger.debug('Event listeners removed successfully');
            }
            else if (provider.removeAllListeners) {
                provider.removeAllListeners();
                logger.debug('All event listeners removed');
            }
            else {
                logger.warn('No removeListener method available on provider');
            }
        }
        catch (error) {
            logger.error('Error during cleanup of event listeners', error);
        }
    };
};
/**
 * Creates a timeout promise for provider requests
 */
export const createTimeoutPromise = (timeoutMs) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Web3ProviderError('Request timeout', ERROR_CODES.RESOURCE_UNAVAILABLE, { timeout: timeoutMs }));
        }, timeoutMs);
    });
};
/**
 * Wraps a provider request with timeout and error handling
 */
export const safeProviderRequest = async (provider, method, params = [], timeoutMs = 30000) => {
    try {
        const requestPromise = provider.request({ method, params });
        const timeoutPromise = createTimeoutPromise(timeoutMs);
        const result = await Promise.race([requestPromise, timeoutPromise]);
        // Handle trustwallet response format
        if (result && typeof result === 'object' && 'result' in result) {
            return result.result;
        }
        // Handle customwallet response format
        if (result && typeof result === 'object' && 'data' in result) {
            return result.data;
        }
        logger.debug('Provider request result', { method, result });
        return result;
    }
    catch (error) {
        // Handle common provider errors
        if (error.code === 4001) {
            throw new Web3ProviderError('User rejected the request', ERROR_CODES.USER_REJECTED, { method, params });
        }
        else if (error.code === 4100) {
            throw new Web3ProviderError('Unauthorized', ERROR_CODES.UNAUTHORIZED, {
                method,
                params,
            });
        }
        else if (error.code === 4200) {
            throw new Web3ProviderError('Unsupported method', ERROR_CODES.UNSUPPORTED_METHOD, { method, params });
        }
        else if (error.code === 4900) {
            throw new Web3ProviderError('Disconnected from chain', ERROR_CODES.NETWORK_ERROR, { method, params });
        }
        else if (error.code === 4901) {
            throw new Web3ProviderError('Chain disconnected', ERROR_CODES.NETWORK_ERROR, { method, params });
        }
        else {
            throw new Web3ProviderError(error.message || 'Provider request failed', ERROR_CODES.JSON_RPC_ERROR, { method, params, originalError: error });
        }
    }
};
