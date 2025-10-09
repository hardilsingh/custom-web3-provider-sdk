import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DetectedWalletProvider,
  Web3ProviderConfig,
  ProviderStatus,
  Web3ProviderError,
  ProviderNotFoundError,
  UseWeb3ProviderReturn,
  Web3Utils,
} from './types';
import { WalletProviderName, DEFAULT_CONFIG, ERROR_CODES } from './constants';
import {
  detectProviders,
  setupProviderEventListeners,
  safeProviderRequest,
  isValidAddress,
  isValidChainId,
} from './providerUtils';
import { createWalletActions } from './walletActions';
import { getLogger } from './utils/logger';
import { performanceMonitor } from './utils/performance';

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
export function useWeb3Provider(
  config: Web3ProviderConfig = {}
): UseWeb3ProviderReturn {
  // State management
  const [providers, setProviders] = useState<DetectedWalletProvider[]>([]);
  const [currentProvider, setCurrentProvider] =
    useState<DetectedWalletProvider | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [status, setStatus] = useState<ProviderStatus>('disconnected');
  const [error, setError] = useState<Web3ProviderError | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for cleanup and retry management
  const cleanupRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Merge with default config
  const mergedConfig = useMemo(() => {
    const configValues = {
      ...DEFAULT_CONFIG,
      ...config,
      checkInterval: config.checkInterval ?? DEFAULT_CONFIG.checkInterval ?? 0,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries ?? 3,
      requestTimeout:
        config.requestTimeout ?? DEFAULT_CONFIG.requestTimeout ?? 30000,
      debug: config.debug ?? DEFAULT_CONFIG.debug ?? false,
    };

    // Immediately enable debug for wallet actions if requested
    if (configValues.debug) {
      (window as any).web3DebugEnabled = true;
    }

    return configValues;
  }, [config]);

  // Enhanced debug logging utility
  const logger = useMemo(
    () => getLogger(mergedConfig.debug),
    [mergedConfig.debug]
  );

  const debugLog = useCallback(
    (message: string, data?: any) => {
      logger.debug(message, data);
    },
    [logger]
  );

  // Detailed connection logging
  const debugConnection = useCallback(
    (stage: string, details: any = {}) => {
      logger.group(`Connection: ${stage}`, {
        'Current Status': status,
        'Provider Name': details.name || 'None',
        'Provider Type': details.providerType || 'Unknown',
        Event: stage,
        ...details,
      });
    },
    [logger, status]
  );

  // Error handling utility
  const handleError = useCallback(
    (error: any, context?: string) => {
      const web3Error =
        error instanceof Web3ProviderError
          ? error
          : new Web3ProviderError(
              error.message || 'Unknown error occurred',
              ERROR_CODES.INTERNAL_ERROR,
              { originalError: error, context }
            );

      setError(web3Error);
      setStatus('error');
      mergedConfig.onError?.(web3Error);

      debugLog('Error occurred', { error: web3Error, context });
    },
    [mergedConfig, debugLog]
  );

  // Enhanced provider detection with callback support
  const detectProvidersCallback = useCallback(() => {
    setIsDetecting(true);
    setError(null);

    try {
      const detected = detectProviders();
      debugLog('Providers detected', {
        count: detected.length,
        providers: detected.map(p => p.name),
      });

      setProviders(prev => {
        // Check if providers have actually changed
        const hasChanged =
          prev.length !== detected.length ||
          !prev.every((p, i) => p.name === detected[i]?.name) ||
          !prev.every((p, i) => p.isConnected === detected[i]?.isConnected);

        if (hasChanged) {
          mergedConfig.onProvidersChanged?.(detected);
          return detected;
        }
        return prev;
      });

      return detected;
    } catch (error) {
      handleError(error, 'detectProviders');
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [mergedConfig, debugLog, handleError]);

  // Retry mechanism for failed operations
  const retryOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context: string,
      maxRetries: number = mergedConfig.maxRetries!
    ): Promise<T> => {
      let lastError: any;

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
        } catch (error) {
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
    },
    [mergedConfig.maxRetries, debugLog]
  );

  // Effect for initial detection and ongoing monitoring
  useEffect(() => {
    debugLog('Setting up provider monitoring', {
      checkInterval: mergedConfig.checkInterval,
    });

    // Initial detection
    detectProvidersCallback();

    // Set up interval to check for new providers if interval > 0
    if (mergedConfig.checkInterval > 0) {
      intervalRef.current = setInterval(
        detectProvidersCallback,
        mergedConfig.checkInterval
      );
    }

    // Modern way to listen for provider injection (EIP-1193)
    const handleEthereumEvent = () => {
      debugLog('Provider injection event detected, refreshing providers');
      detectProvidersCallback();

      // Re-setup event listeners if window.ethereum becomes available
      if (
        window.ethereum?.on &&
        !globalEventCleanup.some(cleanup =>
          cleanup.toString().includes('handleGlobalAccountsChanged')
        )
      ) {
        debugLog(
          'Re-setting up global event listeners after provider injection'
        );
        setupEventListeners();
      }
    };

    // Handle global account changes from window.ethereum
    const handleGlobalAccountsChanged = (newAccounts: string[]) => {
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
      } else {
        // If we have accounts but no current provider, try to detect and connect
        if (!currentProvider && window.ethereum) {
          debugLog(
            'Accounts available but no provider connected, attempting to detect provider'
          );
          detectProvidersCallback();
        }
      }
    };

    // Handle global chain changes from window.ethereum
    const handleGlobalChainChanged = (newChainId: string) => {
      debugLog('Global chain changed event fired', {
        chainId: newChainId,
        currentProvider: currentProvider?.name,
      });

      // SECURITY: Validate chain ID before updating state
      if (newChainId && typeof newChainId === 'string') {
        setChainId(newChainId);
        mergedConfig.onChainChanged?.(newChainId);
        debugLog('Global chain change applied successfully');
      } else {
        debugLog('Invalid chain ID received, ignoring change');
      }
    };

    // Set up event listeners for different providers with cleanup tracking
    let globalEventCleanup: (() => void)[] = [];

    const setupEventListeners = () => {
      // Clean up existing listeners first to prevent duplicates
      globalEventCleanup.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
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
        const provider = (window as any)[providerName];
        if (provider?.on && typeof provider.request === 'function') {
          const removeChain = () =>
            provider?.removeListener?.(
              'chainChanged',
              handleGlobalChainChanged
            );
          const removeAccounts = () =>
            provider?.removeListener?.(
              'accountsChanged',
              handleGlobalAccountsChanged
            );

          provider.on('chainChanged', handleGlobalChainChanged);
          provider.on('accountsChanged', handleGlobalAccountsChanged);

          globalEventCleanup.push(removeChain, removeAccounts);

          // Special handling for ethereum provider - also add connect event
          if (providerName === 'ethereum') {
            const removeConnect = () =>
              provider?.removeListener?.('connect', handleEthereumEvent);
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
        } catch (error) {
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
          } catch (cleanupError) {
            debugLog('Error during cleanup', { error: cleanupError });
          }
        });
        globalEventCleanup = [];

        // Additional cleanup for providers
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('connect', handleEthereumEvent);
          window.ethereum.removeListener('chainChanged', handleEthereumEvent);
          window.ethereum.removeListener(
            'accountsChanged',
            handleEthereumEvent
          );
        }
      } catch (cleanupError) {
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
  const connect = useCallback(
    async (name: WalletProviderName) => {
      setIsConnecting(true);
      setError(null);
      setStatus('connecting');

      try {
        // Start performance timer
        performanceMonitor.startTimer(`connection-${name}`);

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
            throw new ProviderNotFoundError(name);
          }

          debugConnection('Provider validation successful', {
            name,
            hasRequest: typeof provider.request === 'function',
            connectionStatus: provider.isConnected?.(),
            providerType: provider.constructor?.name || 'Unknown',
          });

          if (typeof provider.request !== 'function') {
            throw new Web3ProviderError(
              `Provider "${name}" does not support EIP-1193 requests`,
              ERROR_CODES.UNSUPPORTED_METHOD,
              { providerName: name }
            );
          }

          // Clean up previous listeners
          if (cleanupRef.current) {
            cleanupRef.current();
          }

          // Setup event listeners with enhanced error handling
          const cleanupListeners = setupProviderEventListeners(provider, {
            onAccountsChanged: newAccounts => {
              debugLog('Accounts changed event fired', {
                accounts: newAccounts,
              });

              // SECURITY: Validate accounts before updating state
              const validAccounts = Array.isArray(newAccounts)
                ? newAccounts.filter(
                    account => account && typeof account === 'string'
                  )
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
              } else {
                debugLog('Invalid chain ID received, ignoring change');
              }
            },
            onDisconnect: err => {
              debugLog('Provider disconnected', { error: err });
              const error =
                err instanceof Error ? err : new Error(JSON.stringify(err));
              const web3Error =
                error instanceof Web3ProviderError
                  ? error
                  : new Web3ProviderError(
                      error.message || 'Provider disconnected',
                      ERROR_CODES.NETWORK_ERROR,
                      { originalError: error }
                    );
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
          const walletActions = createWalletActions(provider, mergedConfig);

          debugLog('Requesting accounts through wallet actions');
          // Request accounts through wallet actions (proper separation of concerns)
          const accounts = await walletActions.requestAccounts();

          debugLog('Accounts successfully obtained', {
            count: accounts.length,
            accounts: accounts.map(
              acc => `${acc.slice(0, 6)}...${acc.slice(-4)}`
            ),
            timestamp: new Date().toISOString(),
          });

          // Get chain ID
          let chainId: string;
          try {
            // Try direct request first to avoid wrapper issues
            chainId = await provider.request({
              method: 'eth_chainId',
              params: [],
            });
          } catch (error: any) {
            // If direct request fails, try with safeProviderRequest as fallback
            try {
              debugLog(
                'Direct eth_chainId request failed, trying safeProviderRequest fallback'
              );
              chainId = await safeProviderRequest<string>(
                provider,
                'eth_chainId',
                [],
                mergedConfig.requestTimeout!
              );
            } catch (fallbackError: any) {
              throw new Web3ProviderError(
                error.message || 'Failed to get chain ID',
                ERROR_CODES.JSON_RPC_ERROR,
                {
                  method: 'eth_chainId',
                  originalError: error,
                  fallbackError: fallbackError.message,
                }
              );
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
        const connectionDuration = performanceMonitor.endTimer(
          `connection-${name}`
        );
        if (connectionDuration !== null) {
          performanceMonitor.recordConnectionTime(connectionDuration);
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
      } catch (err) {
        handleError(err, `connect to ${name}`);
        setStatus('error');
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [
      detectProvidersCallback,
      mergedConfig,
      retryOperation,
      debugLog,
      handleError,
    ]
  );

  // Disconnect from current provider with proper cleanup
  const disconnect = useCallback(() => {
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
    } catch (error) {
      handleError(error, 'disconnect');
    }
  }, [currentProvider, debugLog, handleError]);

  // Get preferred provider with enhanced logic
  const getPreferredProvider = useCallback(() => {
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
  const getProviderByName = useCallback(
    (name: WalletProviderName) => {
      const provider = providers.find(p => p.name === name);
      debugLog('Getting provider by name', { name, found: !!provider });
      return provider?.provider;
    },
    [providers, debugLog]
  );

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('disconnected');
    }
  }, [status]);

  // Modal functions
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalProviderSelect = useCallback(
    async (providerName: string) => {
      try {
        await connect(providerName as any);
        closeModal();
      } catch (err) {
        // Error is already handled in connect function
        logger.warn('Modal provider selection failed', err);
      }
    },
    [connect, closeModal]
  );

  // Utility functions for address formatting and validation
  const weiToEth = useCallback((wei: string): string => {
    try {
      const weiNum = BigInt(wei);
      const ethNum = Number(weiNum) / Math.pow(10, 18);
      return ethNum.toString();
    } catch {
      return '0';
    }
  }, []);

  const ethToWei = useCallback((eth: string): string => {
    try {
      const ethNum = parseFloat(eth);
      const weiNum = BigInt(Math.floor(ethNum * Math.pow(10, 18)));
      return weiNum.toString();
    } catch {
      return '0';
    }
  }, []);

  const formatAddress = useCallback((address: string): string => {
    if (!isValidAddress(address)) {
      return address; // Return as-is if invalid
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Utils for common validation functions
  const utils: Web3Utils = useMemo(
    () => ({
      isValidAddress,
      isValidChainId,
      formatAddress,
      weiToEth,
      ethToWei,
    }),
    [isValidAddress, isValidChainId, formatAddress, weiToEth, ethToWei]
  );

  // Wallet actions with enhanced error handling
  const walletActions = useMemo(() => {
    if (!currentProvider?.provider) {
      return null;
    }

    try {
      const actions = createWalletActions(
        currentProvider.provider,
        mergedConfig
      );

      // Wrap all async actions with error handling
      const wrappedActions: any = {};
      Object.keys(actions).forEach(key => {
        const action = (actions as any)[key];
        if (typeof action === 'function') {
          wrappedActions[key] = async (...args: any[]) => {
            try {
              return await action(...args);
            } catch (error) {
              handleError(error, `wallet action: ${key}`);
              throw error;
            }
          };
        } else {
          wrappedActions[key] = action;
        }
      });

      return wrappedActions;
    } catch (error) {
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
