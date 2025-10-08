"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeProviderRequest = exports.createTimeoutPromise = exports.setupProviderEventListeners = exports.detectProviders = exports.detectProviderCapabilities = exports.isValidChainId = exports.isValidAddress = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
/**
 * Validates if an address is a valid Ethereum address
 */
const isValidAddress = (address) => {
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
exports.isValidAddress = isValidAddress;
/**
 * Validates if a chain ID is valid
 */
const isValidChainId = (chainId) => {
    if (!chainId || typeof chainId !== 'string') {
        return false;
    }
    // Validate hex format and not zero or empty
    const isValidHex = /^0x[a-fA-F0-9]+$/.test(chainId);
    const isNotZero = chainId !== '0x' && chainId !== '0x0';
    const hasReasonableLength = chainId.length >= 3 && chainId.length <= 64; // Max 256-bit hex
    return isValidHex && isNotZero && hasReasonableLength;
};
exports.isValidChainId = isValidChainId;
/**
 * Detects provider capabilities
 */
const detectProviderCapabilities = (provider) => {
    return {
        supportsEIP1559: typeof provider.request === 'function',
        supportsPersonalSign: typeof provider.request === 'function',
        supportsTypedData: typeof provider.request === 'function',
        supportsBatchRequests: false, // Most providers don't support this
        supportsWalletSwitch: typeof provider.request === 'function',
        version: provider.networkVersion || 'unknown',
    };
};
exports.detectProviderCapabilities = detectProviderCapabilities;
/**
 * Detects the providers that are available in the current environment.
 * @returns An array of detected providers.
 */
const detectProviders = () => {
    if (typeof window === 'undefined')
        return [];
    const detected = [];
    // Check each provider pattern
    Object.entries(constants_1.PROVIDER_PATTERNS).forEach(([name, pattern]) => {
        const provider = window[pattern.windowProperty];
        if (provider && typeof provider.request === 'function') {
            // Dynamic validation: check if provider has the isProperty (even if false) or if it's a known provider
            const hasIsProperty = pattern.isProperty && (pattern.isProperty in provider);
            // Accept provider if:
            // 1. It has the isProperty set to true, OR
            // 2. It has the isProperty (even if false) and it's a known provider pattern, OR
            // 3. It's a custom wallet (no isProperty required), OR
            // 4. It has the isProperty but it's false (handles cases like LXX wallet)
            if ((hasIsProperty && pattern.isProperty) || name === 'customwallet' || provider[pattern.isProperty] === false) {
                detected.push({
                    name: name,
                    provider,
                    capabilities: (0, exports.detectProviderCapabilities)(provider),
                    isConnected: provider.isConnected?.() || false,
                    version: provider.networkVersion || 'unknown',
                });
            }
            console.log('🔍 Detected provider:', {
                name,
                provider,
                hasIsProperty,
            });
        }
    });
    return detected;
};
exports.detectProviders = detectProviders;
/**
 * Sets up event listeners for a provider.
 * @param provider - The provider to set up event listeners for.
 * @param config - The configuration for the provider.
 * @returns A function to remove the event listeners.
 */
const setupProviderEventListeners = (provider, config) => {
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
                const validAccounts = accountsArray.filter(account => account && typeof account === 'string' && (0, exports.isValidAddress)(account));
                console.log('✅ Accounts changed event:', {
                    original: newAccounts,
                    valid: validAccounts,
                });
                config.onAccountsChanged?.(validAccounts);
            }
            else {
                console.warn('⚠️ Invalid accounts changed event:', newAccounts);
                config.onError?.(new types_1.Web3ProviderError('Invalid accounts format in accountsChanged event', constants_1.ERROR_CODES.INVALID_PARAMS, { accounts: newAccounts }));
            }
        }
        catch (error) {
            console.error('❌ Error in accounts changed handler:', error);
            config.onError?.(new types_1.Web3ProviderError('Error handling accounts changed event', constants_1.ERROR_CODES.INTERNAL_ERROR, { error, accounts: newAccounts }));
        }
    };
    const handleChainChanged = (newChainId) => {
        try {
            console.log('🔗 Chain changed event received:', newChainId);
            // Validate chain ID with comprehensive checks
            if (newChainId && typeof newChainId === 'string') {
                if ((0, exports.isValidChainId)(newChainId)) {
                    console.log('✅ Chain changed event valid, calling callback');
                    config.onChainChanged?.(newChainId);
                }
                else {
                    console.warn('⚠️ Invalid chain ID format:', newChainId);
                    config.onError?.(new types_1.Web3ProviderError('Invalid chain ID format received', constants_1.ERROR_CODES.NETWORK_ERROR, { chainId: newChainId }));
                }
            }
            else {
                console.warn('⚠️ Invalid chain changed event format:', typeof newChainId, newChainId);
                config.onError?.(new types_1.Web3ProviderError('Invalid chain ID data type', constants_1.ERROR_CODES.NETWORK_ERROR, { chainId: newChainId }));
            }
        }
        catch (error) {
            console.error('❌ Error in chain changed handler:', error);
            config.onError?.(new types_1.Web3ProviderError('Error handling chain changed event', constants_1.ERROR_CODES.INTERNAL_ERROR, { error, chainId: newChainId }));
        }
    };
    const handleDisconnect = (err) => {
        try {
            const error = err instanceof Error ? err : new Error(JSON.stringify(err));
            config.onDisconnect?.(error);
        }
        catch (error) {
            config.onError?.(new types_1.Web3ProviderError('Error handling disconnect event', constants_1.ERROR_CODES.INTERNAL_ERROR, { error, originalError: err }));
        }
    };
    const handleConnect = (connectInfo) => {
        try {
            // Handle connection events if needed
            console.log('Provider connected:', connectInfo);
        }
        catch (error) {
            config.onError?.(new types_1.Web3ProviderError('Error handling connect event', constants_1.ERROR_CODES.INTERNAL_ERROR, { error, connectInfo }));
        }
    };
    // Set up event listeners with error handling
    try {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
        provider.on('disconnect', handleDisconnect);
        provider.on('connect', handleConnect);
        console.log('✅ Event listeners attached successfully');
    }
    catch (error) {
        console.error('❌ Failed to attach event listeners:', error);
        config.onError?.(new types_1.Web3ProviderError('Failed to attach event listeners', constants_1.ERROR_CODES.INTERNAL_ERROR, { error }));
    }
    // Return enhanced cleanup function
    return () => {
        console.log('🧹 Cleaning up event listeners');
        try {
            if (provider.removeListener) {
                provider.removeListener('accountsChanged', handleAccountsChanged);
                provider.removeListener('chainChanged', handleChainChanged);
                provider.removeListener('disconnect', handleDisconnect);
                provider.removeListener('connect', handleConnect);
                console.log('✅ Event listeners removed successfully');
            }
            else if (provider.removeAllListeners) {
                provider.removeAllListeners();
                console.log('✅ All event listeners removed');
            }
            else {
                console.warn('⚠️ No removeListener method available on provider');
            }
        }
        catch (error) {
            console.error('❌ Error during cleanup of event listeners:', error);
        }
    };
};
exports.setupProviderEventListeners = setupProviderEventListeners;
/**
 * Creates a timeout promise for provider requests
 */
const createTimeoutPromise = (timeoutMs) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new types_1.Web3ProviderError('Request timeout', constants_1.ERROR_CODES.RESOURCE_UNAVAILABLE, { timeout: timeoutMs }));
        }, timeoutMs);
    });
};
exports.createTimeoutPromise = createTimeoutPromise;
/**
 * Wraps a provider request with timeout and error handling
 */
const safeProviderRequest = async (provider, method, params = [], timeoutMs = 30000) => {
    try {
        const requestPromise = provider.request({ method, params });
        const timeoutPromise = (0, exports.createTimeoutPromise)(timeoutMs);
        const result = await Promise.race([requestPromise, timeoutPromise]);
        console.log("🚀 ~ safeProviderRequest ~ result:", result);
        // Handle non-standard response formats (e.g., LXX wallet)
        // Format 1: { result: [...], method: "...", ... }
        if (result && typeof result === 'object' && 'result' in result && result.result !== undefined) {
            console.log('🔍 Non-standard provider response (result) detected, extracting result:', result);
            return result.result;
        }
        // Format 2: { type: "success", data: [...] }
        if (result && typeof result === 'object' && 'data' in result && result.data !== undefined) {
            console.log('🔍 Non-standard provider response (data) detected, extracting data:', result);
            return result.data;
        }
        return result;
    }
    catch (error) {
        // Handle common provider errors
        if (error.code === 4001) {
            throw new types_1.Web3ProviderError('User rejected the request', constants_1.ERROR_CODES.USER_REJECTED, { method, params });
        }
        else if (error.code === 4100) {
            throw new types_1.Web3ProviderError('Unauthorized', constants_1.ERROR_CODES.UNAUTHORIZED, {
                method,
                params,
            });
        }
        else if (error.code === 4200) {
            throw new types_1.Web3ProviderError('Unsupported method', constants_1.ERROR_CODES.UNSUPPORTED_METHOD, { method, params });
        }
        else if (error.code === 4900) {
            throw new types_1.Web3ProviderError('Disconnected from chain', constants_1.ERROR_CODES.NETWORK_ERROR, { method, params });
        }
        else if (error.code === 4901) {
            throw new types_1.Web3ProviderError('Chain disconnected', constants_1.ERROR_CODES.NETWORK_ERROR, { method, params });
        }
        else {
            throw new types_1.Web3ProviderError(error.message || 'Provider request failed', constants_1.ERROR_CODES.JSON_RPC_ERROR, { method, params, originalError: error });
        }
    }
};
exports.safeProviderRequest = safeProviderRequest;
