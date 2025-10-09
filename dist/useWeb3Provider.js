"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWeb3Provider = useWeb3Provider;
const react_1 = require("react");
const types_1 = require("./types");
const constants_1 = require("./constants");
const providerUtils_1 = require("./providerUtils");
const walletActions_1 = require("./walletActions");
const logger_1 = require("./utils/logger");
const performance_1 = require("./utils/performance");
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
 *   onError: (error) => logger.error('Provider error:', error)
 * });
 * ```
 */
function useWeb3Provider(config = {}) {
    // State management
    const [providers, setProviders] = (0, react_1.useState)([]);
    const [currentProvider, setCurrentProvider] = (0, react_1.useState)(null);
    const [accounts, setAccounts] = (0, react_1.useState)([]);
    const [chainId, setChainId] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)('disconnected');
    const [error, setError] = (0, react_1.useState)(null);
    const [isConnecting, setIsConnecting] = (0, react_1.useState)(false);
    const [isDetecting, setIsDetecting] = (0, react_1.useState)(false);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    // Refs for cleanup and retry management
    const cleanupRef = (0, react_1.useRef)(null);
    const retryCountRef = (0, react_1.useRef)(0);
    const intervalRef = (0, react_1.useRef)(null);
    // Merge with default config
    const mergedConfig = (0, react_1.useMemo)(() => {
        const configValues = {
            ...constants_1.DEFAULT_CONFIG,
            ...config,
            checkInterval: config.checkInterval ?? constants_1.DEFAULT_CONFIG.checkInterval ?? 0,
            maxRetries: config.maxRetries ?? constants_1.DEFAULT_CONFIG.maxRetries ?? 3,
            requestTimeout: config.requestTimeout ?? constants_1.DEFAULT_CONFIG.requestTimeout ?? 30000,
            debug: config.debug ?? constants_1.DEFAULT_CONFIG.debug ?? false,
        };
        // Immediately enable debug for wallet actions if requested
        if (configValues.debug) {
            window.web3DebugEnabled = true;
        }
        return configValues;
    }, [config]);
    // Enhanced debug logging utility
    const logger = (0, react_1.useMemo)(() => (0, logger_1.getLogger)(mergedConfig.debug), [mergedConfig.debug]);
    const debugLog = (0, react_1.useCallback)((message, data) => {
        logger.debug(message, data);
    }, [logger]);
    // Detailed connection logging
    const debugConnection = (0, react_1.useCallback)((stage, details = {}) => {
        logger.group(`Connection: ${stage}`, {
            'Current Status': status,
            'Provider Name': details.name || 'None',
            'Provider Type': details.providerType || 'Unknown',
            Event: stage,
            ...details,
        });
    }, [logger, status]);
    // Error handling utility
    const handleError = (0, react_1.useCallback)((error, context) => {
        const web3Error = error instanceof types_1.Web3ProviderError
            ? error
            : new types_1.Web3ProviderError(error.message || 'Unknown error occurred', constants_1.ERROR_CODES.INTERNAL_ERROR, { originalError: error, context });
        setError(web3Error);
        setStatus('error');
        mergedConfig.onError?.(web3Error);
        debugLog('Error occurred', { error: web3Error, context });
    }, [mergedConfig, debugLog]);
    // Enhanced provider detection with callback support
    const detectProvidersCallback = (0, react_1.useCallback)(() => {
        setIsDetecting(true);
        setError(null);
        try {
            const detected = (0, providerUtils_1.detectProviders)();
            debugLog('Providers detected', {
                count: detected.length,
                providers: detected.map(p => p.name),
            });
            setProviders(prev => {
                // Check if providers have actually changed
                const hasChanged = prev.length !== detected.length ||
                    !prev.every((p, i) => p.name === detected[i]?.name) ||
                    !prev.every((p, i) => p.isConnected === detected[i]?.isConnected);
                if (hasChanged) {
                    mergedConfig.onProvidersChanged?.(detected);
                    return detected;
                }
                return prev;
            });
            return detected;
        }
        catch (error) {
            handleError(error, 'detectProviders');
            return [];
        }
        finally {
            setIsDetecting(false);
        }
    }, [mergedConfig, debugLog, handleError]);
    // Retry mechanism for failed operations
    const retryOperation = (0, react_1.useCallback)(async (operation, context, maxRetries = mergedConfig.maxRetries) => {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                retryCountRef.current = attempt;
                debugLog(`Attempting ${context}`, {
                    attempt: attempt + 1,
                    maxRetries: maxRetries + 1,
                });
                const result = await operation();
                retryCountRef.current = 0; // Reset on success
                return result;
            }
            catch (error) {
                lastError = error;
                debugLog(`Failed attempt ${attempt + 1} for ${context}`, {
                    error,
                    attempt,
                    maxRetries,
                });
                if (attempt === maxRetries) {
                    break;
                }
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }, [mergedConfig.maxRetries, debugLog]);
    // Effect for initial detection and ongoing monitoring
    (0, react_1.useEffect)(() => {
        debugLog('Setting up provider monitoring', {
            checkInterval: mergedConfig.checkInterval,
        });
        // Initial detection
        detectProvidersCallback();
        // Set up interval to check for new providers if interval > 0
        if (mergedConfig.checkInterval > 0) {
            intervalRef.current = setInterval(detectProvidersCallback, mergedConfig.checkInterval);
        }
        // Modern way to listen for provider injection (EIP-1193)
        const handleEthereumEvent = () => {
            debugLog('Provider injection event detected, refreshing providers');
            detectProvidersCallback();
            // Re-setup event listeners if window.ethereum becomes available
            if (window.ethereum?.on &&
                !globalEventCleanup.some(cleanup => cleanup.toString().includes('handleGlobalAccountsChanged'))) {
                debugLog('Re-setting up global event listeners after provider injection');
                setupEventListeners();
            }
        };
        // Handle global account changes from window.ethereum
        const handleGlobalAccountsChanged = (newAccounts) => {
            debugLog('Global accounts changed event fired', {
                accounts: newAccounts,
                currentProvider: currentProvider?.name,
            });
            // SECURITY: Validate accounts before updating state
            const validAccounts = Array.isArray(newAccounts)
                ? newAccounts.filter(account => account && typeof account === 'string')
                : [];
            setAccounts(validAccounts);
            mergedConfig.onAccountsChanged?.(validAccounts);
            // Reset provider state if no valid accounts
            if (validAccounts.length === 0) {
                debugLog('No accounts available, resetting provider state');
                setCurrentProvider(null);
                setChainId(null);
                setStatus('disconnected');
            }
            else {
                // If we have accounts but no current provider, try to detect and connect
                if (!currentProvider && window.ethereum) {
                    debugLog('Accounts available but no provider connected, attempting to detect provider');
                    detectProvidersCallback();
                }
            }
        };
        // Handle global chain changes from window.ethereum
        const handleGlobalChainChanged = (newChainId) => {
            debugLog('Global chain changed event fired', {
                chainId: newChainId,
                currentProvider: currentProvider?.name,
            });
            // SECURITY: Validate chain ID before updating state
            if (newChainId && typeof newChainId === 'string') {
                setChainId(newChainId);
                mergedConfig.onChainChanged?.(newChainId);
                debugLog('Global chain change applied successfully');
            }
            else {
                debugLog('Invalid chain ID received, ignoring change');
            }
        };
        // Set up event listeners for different providers with cleanup tracking
        let globalEventCleanup = [];
        const setupEventListeners = () => {
            // Clean up existing listeners first to prevent duplicates
            globalEventCleanup.forEach(cleanup => {
                try {
                    cleanup();
                }
                catch (error) {
                    debugLog('Error during cleanup:', error);
                }
            });
            globalEventCleanup = [];
            // Set up event listeners for all provider objects on window (comprehensive approach)
            const allProviderNames = [
                'ethereum',
                'lxx',
                'customWallet',
                'coinbaseWalletExtension',
                'rabby',
                'brave',
                'trustwallet',
            ];
            allProviderNames.forEach(providerName => {
                const provider = window[providerName];
                if (provider?.on && typeof provider.request === 'function') {
                    const removeChain = () => provider?.removeListener?.('chainChanged', handleGlobalChainChanged);
                    const removeAccounts = () => provider?.removeListener?.('accountsChanged', handleGlobalAccountsChanged);
                    provider.on('chainChanged', handleGlobalChainChanged);
                    provider.on('accountsChanged', handleGlobalAccountsChanged);
                    globalEventCleanup.push(removeChain, removeAccounts);
                    // Special handling for ethereum provider - also add connect event
                    if (providerName === 'ethereum') {
                        const removeConnect = () => provider?.removeListener?.('connect', handleEthereumEvent);
                        provider.on('connect', handleEthereumEvent);
                        globalEventCleanup.push(removeConnect);
                    }
                    debugLog(`Event listeners attached to window.${providerName}`);
                }
            });
            // Window provider listeners
            const removeEthereumInitialized = () => {
                window.removeEventListener('ethereum#initialized', handleEthereumEvent);
            };
            window.addEventListener('ethereum#initialized', handleEthereumEvent);
            globalEventCleanup.push(removeEthereumInitialized);
            debugLog('Window event listeners attached');
        };
        setupEventListeners();
        // Auto-connect if enabled
        if (mergedConfig.autoConnect) {
            const autoConnect = async () => {
                try {
                    const preferredProvider = getPreferredProvider();
                    if (preferredProvider) {
                        debugLog('Auto-connecting to preferred provider', {
                            name: preferredProvider.name,
                        });
                        await connect(preferredProvider.name);
                    }
                }
                catch (error) {
                    debugLog('Auto-connect failed', { error });
                }
            };
            // Delay auto-connect to allow providers to initialize
            setTimeout(autoConnect, 1000);
        }
        // Cleanup
        return () => {
            debugLog('Cleaning up provider monitoring');
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
            // CRITICAL: Enhanced cleanup to prevent memory leaks
            try {
                // Clean up all global event listeners
                globalEventCleanup.forEach(cleanup => {
                    try {
                        cleanup();
                    }
                    catch (cleanupError) {
                        debugLog('Error during cleanup', { error: cleanupError });
                    }
                });
                globalEventCleanup = [];
                // Additional cleanup for providers
                if (window.ethereum?.removeListener) {
                    window.ethereum.removeListener('connect', handleEthereumEvent);
                    window.ethereum.removeListener('chainChanged', handleEthereumEvent);
                    window.ethereum.removeListener('accountsChanged', handleEthereumEvent);
                }
            }
            catch (cleanupError) {
                debugLog('Error during global event cleanup', { error: cleanupError });
            }
        };
    }, [
        detectProvidersCallback,
        mergedConfig.checkInterval,
        mergedConfig.autoConnect,
        debugLog,
    ]);
    // Connect to a specific provider with enhanced error handling and retry logic
    const connect = (0, react_1.useCallback)(async (name) => {
        setIsConnecting(true);
        setError(null);
        setStatus('connecting');
        try {
            // Start performance timer
            performance_1.performanceMonitor.startTimer(`connection-${name}`);
            debugConnection('Starting connection', { name });
            debugLog('Connection starting for provider', {
                providerName: name,
                timestamp: new Date().toISOString(),
            });
            const result = await retryOperation(async () => {
                debugConnection('Refreshing providers', { name });
                // Refresh providers right before connecting in case something changed
                const latestProviders = detectProvidersCallback();
                debugLog('Detected providers', {
                    total: latestProviders.length,
                    providers: latestProviders.map(p => ({
                        name: p.name,
                        connected: p.isConnected,
                        version: p.version,
                    })),
                });
                const providerInfo = latestProviders.find(p => p.name === name);
                const provider = providerInfo?.provider;
                if (!provider) {
                    debugConnection('Provider not found', {
                        name,
                        available: latestProviders.map(p => p.name),
                    });
                    throw new types_1.ProviderNotFoundError(name);
                }
                debugConnection('Provider validation successful', {
                    name,
                    hasRequest: typeof provider.request === 'function',
                    connectionStatus: provider.isConnected?.(),
                    providerType: provider.constructor?.name || 'Unknown',
                });
                if (typeof provider.request !== 'function') {
                    throw new types_1.Web3ProviderError(`Provider "${name}" does not support EIP-1193 requests`, constants_1.ERROR_CODES.UNSUPPORTED_METHOD, { providerName: name });
                }
                // Clean up previous listeners
                if (cleanupRef.current) {
                    cleanupRef.current();
                }
                // Setup event listeners with enhanced error handling
                const cleanupListeners = (0, providerUtils_1.setupProviderEventListeners)(provider, {
                    onAccountsChanged: newAccounts => {
                        debugLog('Accounts changed event fired', {
                            accounts: newAccounts,
                        });
                        // SECURITY: Validate accounts before updating state
                        const validAccounts = Array.isArray(newAccounts)
                            ? newAccounts.filter(account => account && typeof account === 'string')
                            : [];
                        setAccounts(validAccounts);
                        mergedConfig.onAccountsChanged?.(validAccounts);
                        // Reset provider state if no valid accounts
                        if (validAccounts.length === 0) {
                            debugLog('No accounts available, resetting provider state');
                            setCurrentProvider(null);
                            setChainId(null);
                            setStatus('disconnected');
                        }
                    },
                    onChainChanged: newChainId => {
                        debugLog('Chain changed event fired', { chainId: newChainId });
                        // SECURITY: Validate chain ID before updating state
                        if (newChainId && typeof newChainId === 'string') {
                            setChainId(newChainId);
                            mergedConfig.onChainChanged?.(newChainId);
                            debugLog('Chain change applied successfully');
                        }
                        else {
                            debugLog('Invalid chain ID received, ignoring change');
                        }
                    },
                    onDisconnect: err => {
                        debugLog('Provider disconnected', { error: err });
                        const error = err instanceof Error ? err : new Error(JSON.stringify(err));
                        const web3Error = error instanceof types_1.Web3ProviderError
                            ? error
                            : new types_1.Web3ProviderError(error.message || 'Provider disconnected', constants_1.ERROR_CODES.NETWORK_ERROR, { originalError: error });
                        setError(web3Error);
                        setStatus('disconnected');
                        setCurrentProvider(null);
                        setAccounts([]);
                        setChainId(null);
                        mergedConfig.onDisconnect?.(err);
                    },
                    onError: error => {
                        handleError(error, 'provider event');
                    },
                });
                // Store cleanup function
                cleanupRef.current = cleanupListeners;
                debugConnection('Requesting accounts', { name });
                // Create wallet actions to request accounts in the proper location
                const walletActions = (0, walletActions_1.createWalletActions)(provider, mergedConfig);
                debugLog('Requesting accounts through wallet actions');
                // Request accounts through wallet actions (proper separation of concerns)
                const accounts = await walletActions.requestAccounts();
                debugLog('Accounts successfully obtained', {
                    count: accounts.length,
                    accounts: accounts.map(acc => `${acc.slice(0, 6)}...${acc.slice(-4)}`),
                    timestamp: new Date().toISOString(),
                });
                // Get chain ID
                let chainId;
                try {
                    // Try direct request first to avoid wrapper issues
                    chainId = await provider.request({
                        method: 'eth_chainId',
                        params: [],
                    });
                }
                catch (error) {
                    // If direct request fails, try with safeProviderRequest as fallback
                    try {
                        debugLog('Direct eth_chainId request failed, trying safeProviderRequest fallback');
                        chainId = await (0, providerUtils_1.safeProviderRequest)(provider, 'eth_chainId', [], mergedConfig.requestTimeout);
                    }
                    catch (fallbackError) {
                        throw new types_1.Web3ProviderError(error.message || 'Failed to get chain ID', constants_1.ERROR_CODES.JSON_RPC_ERROR, {
                            method: 'eth_chainId',
                            originalError: error,
                            fallbackError: fallbackError.message,
                        });
                    }
                }
                debugLog('Successfully connected to provider', {
                    name,
                    accounts: accounts.length,
                    chainId,
                });
                return { accounts, chainId, providerInfo, cleanup: cleanupListeners };
            }, `connect to ${name}`);
            // Update state on successful connection
            setCurrentProvider(result.providerInfo || null);
            setAccounts(result.accounts);
            setChainId(result.chainId);
            setStatus('connected');
            setError(null);
            // Record connection time
            const connectionDuration = performance_1.performanceMonitor.endTimer(`connection-${name}`);
            if (connectionDuration !== null) {
                performance_1.performanceMonitor.recordConnectionTime(connectionDuration);
                debugLog('Connection completed', {
                    duration: `${connectionDuration.toFixed(2)}ms`,
                });
            }
            return {
                accounts: result.accounts,
                chainId: result.chainId,
                provider: result.providerInfo,
                cleanup: result.cleanup,
            };
        }
        catch (err) {
            handleError(err, `connect to ${name}`);
            setStatus('error');
            throw err;
        }
        finally {
            setIsConnecting(false);
        }
    }, [
        detectProvidersCallback,
        mergedConfig,
        retryOperation,
        debugLog,
        handleError,
    ]);
    // Disconnect from current provider with proper cleanup
    const disconnect = (0, react_1.useCallback)(() => {
        if (!currentProvider) {
            debugLog('No provider to disconnect');
            return;
        }
        debugLog('Disconnecting from provider', { name: currentProvider.name });
        try {
            // Clean up event listeners
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
            // Reset state
            setCurrentProvider(null);
            setAccounts([]);
            setChainId(null);
            setStatus('disconnected');
            setError(null);
            debugLog('Successfully disconnected from provider');
        }
        catch (error) {
            handleError(error, 'disconnect');
        }
    }, [currentProvider, debugLog, handleError]);
    // Get preferred provider with enhanced logic
    const getPreferredProvider = (0, react_1.useCallback)(() => {
        debugLog('Getting preferred provider', {
            preferred: mergedConfig.preferred,
            available: providers.map(p => p.name),
        });
        for (const preferredName of mergedConfig.preferred || []) {
            const match = providers.find(p => p.name === preferredName);
            if (match) {
                debugLog('Found preferred provider', { name: match.name });
                return match;
            }
        }
        if (mergedConfig.fallbackToAny && providers.length > 0) {
            debugLog('Using fallback provider', { name: providers[0]?.name });
            return providers[0];
        }
        debugLog('No preferred provider found');
        return undefined;
    }, [providers, mergedConfig, debugLog]);
    // Get provider by name
    const getProviderByName = (0, react_1.useCallback)((name) => {
        const provider = providers.find(p => p.name === name);
        debugLog('Getting provider by name', { name, found: !!provider });
        return provider?.provider;
    }, [providers, debugLog]);
    // Clear error function
    const clearError = (0, react_1.useCallback)(() => {
        setError(null);
        if (status === 'error') {
            setStatus('disconnected');
        }
    }, [status]);
    // Modal functions
    const openModal = (0, react_1.useCallback)(() => {
        setIsModalOpen(true);
    }, []);
    const closeModal = (0, react_1.useCallback)(() => {
        setIsModalOpen(false);
    }, []);
    const handleModalProviderSelect = (0, react_1.useCallback)(async (providerName) => {
        try {
            await connect(providerName);
            closeModal();
        }
        catch (err) {
            // Error is already handled in connect function
            logger.warn('Modal provider selection failed', err);
        }
    }, [connect, closeModal]);
    // Utility functions for address formatting and validation
    const weiToEth = (0, react_1.useCallback)((wei) => {
        try {
            const weiNum = BigInt(wei);
            const ethNum = Number(weiNum) / Math.pow(10, 18);
            return ethNum.toString();
        }
        catch {
            return '0';
        }
    }, []);
    const ethToWei = (0, react_1.useCallback)((eth) => {
        try {
            const ethNum = parseFloat(eth);
            const weiNum = BigInt(Math.floor(ethNum * Math.pow(10, 18)));
            return weiNum.toString();
        }
        catch {
            return '0';
        }
    }, []);
    const formatAddress = (0, react_1.useCallback)((address) => {
        if (!(0, providerUtils_1.isValidAddress)(address)) {
            return address; // Return as-is if invalid
        }
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, []);
    // Utils for common validation functions
    const utils = (0, react_1.useMemo)(() => ({
        isValidAddress: providerUtils_1.isValidAddress,
        isValidChainId: providerUtils_1.isValidChainId,
        formatAddress,
        weiToEth,
        ethToWei,
    }), [providerUtils_1.isValidAddress, providerUtils_1.isValidChainId, formatAddress, weiToEth, ethToWei]);
    // Wallet actions with enhanced error handling
    const walletActions = (0, react_1.useMemo)(() => {
        if (!currentProvider?.provider) {
            return null;
        }
        try {
            const actions = (0, walletActions_1.createWalletActions)(currentProvider.provider, mergedConfig);
            // Wrap all async actions with error handling
            const wrappedActions = {};
            Object.keys(actions).forEach(key => {
                const action = actions[key];
                if (typeof action === 'function') {
                    wrappedActions[key] = async (...args) => {
                        try {
                            return await action(...args);
                        }
                        catch (error) {
                            handleError(error, `wallet action: ${key}`);
                            throw error;
                        }
                    };
                }
                else {
                    wrappedActions[key] = action;
                }
            });
            return wrappedActions;
        }
        catch (error) {
            handleError(error, 'createWalletActions');
            return null;
        }
    }, [currentProvider, handleError]);
    // Return comprehensive hook interface
    return {
        // Provider state
        providers,
        currentProvider,
        accounts,
        chainId,
        status,
        error,
        isConnecting,
        isDetecting,
        // Connection management
        connect,
        disconnect,
        getPreferredProvider,
        getProviderByName,
        refreshProviders: detectProvidersCallback,
        clearError,
        // Modal functionality
        isModalOpen,
        openModal,
        closeModal,
        handleModalProviderSelect,
        // Utility functions
        retryCount: retryCountRef.current,
        isRetrying: retryCountRef.current > 0,
        // Wallet actions
        ...(walletActions || {}),
        // Utility functions are always available
        utils,
    };
}
