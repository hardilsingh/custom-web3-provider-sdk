import {
  Transaction,
  EthereumProvider,
  TransactionReceipt,
  GasEstimate,
  BalanceInfo,
  NetworkInfo,
  Web3ProviderError,
  ProviderNotConnectedError,
  InvalidAccountError,
  TransactionError,
  NetworkError,
} from './types';
import {
  safeProviderRequest,
  isValidAddress,
  isValidChainId,
} from './providerUtils';
import { ERROR_CODES, DEFAULT_NETWORK } from './constants';

/**
 * Utility to convert wei to ether
 */
const weiToEth = (wei: string): string => {
  const weiNum = BigInt(wei);
  const ethNum = Number(weiNum) / Math.pow(10, 18);
  return ethNum.toString();
};

/**
 * Utility to convert ether to wei
 */
const ethToWei = (eth: string): string => {
  const ethNum = parseFloat(eth);
  const weiNum = BigInt(Math.floor(ethNum * Math.pow(10, 18)));
  return weiNum.toString();
};

/**
 * Utility to format address for display
 */
const formatAddress = (address: string): string => {
  if (!isValidAddress(address)) {
    throw new InvalidAccountError(address);
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Creates comprehensive wallet actions for a provider
 */
export const createWalletActions = (
  provider: EthereumProvider,
  config?: { requestTimeout?: number }
) => {
  if (!provider || typeof provider.request !== 'function') {
    throw new ProviderNotConnectedError();
  }

  // Debug logging helper for wallet actions
  const debugWalletAction = (action: string, details: any = {}) => {
    // Debug if window debug is enabled OR if we're in a debug context
    const isDebugEnabled =
      typeof window !== 'undefined' &&
      (window as any).web3DebugEnabled === true;

    if (isDebugEnabled) {
      console.log(`💼 Wallet Action: ${action}`, details);

      // Better serialization for complex objects
      try {
        const serializedDetails = JSON.stringify(
          details,
          (key, value) => {
            if (key === 'provider' || key === 'providerMethod') {
              return '[Provider Object - ' + typeof value + ']';
            }
            return value;
          },
          2
        );

        console.log(`💼 Details JSON:`, JSON.parse(serializedDetails));
      } catch (parseError) {
        console.log(`💼 Details (fallback):`, details);
      }
    }
  };

  const actions = {
    /**
     * Request accounts from the provider - should be the primary method
     */
    requestAccounts: async (): Promise<string[]> => {
      // Immediate debug test
      const isDebugEnabled =
        typeof window !== 'undefined' &&
        (window as any).web3DebugEnabled === true;
      console.log(
        '🧪 WALLET ACTION DEBUG - requestAccounts starting',
        'Debug enabled:',
        isDebugEnabled
      );

      debugWalletAction('requestAccounts started', {
        providerMethod: typeof provider.request,
        timestamp: new Date().toISOString(),
      });

      try {
        debugWalletAction(
          'Calling safeProviderRequest for eth_requestAccounts',
          {
            providerInfo: {
              type: typeof provider,
              hasRequest: typeof provider.request,
              isConnected: provider.isConnected
                ? provider.isConnected()
                : 'N/A',
              chainId: provider.chainId || 'N/A',
              selectedAddress: provider.selectedAddress || 'N/A',
              metadata: {
                isMetaMask: provider.isMetaMask || false,
                isCustomWallet: provider.isCustomWallet || false,
              },
            },
            timestamp: new Date().toISOString(),
          }
        );

        debugWalletAction('About to call eth_requestAccounts', {
          providerCheck: {
            exists: !!provider,
            hasRequest: typeof provider.request === 'function',
            isCallable: typeof provider.request === 'function',
          },
        });

        let accounts: string[];

        try {
          // First attempt: use safeProviderRequest wrapper
          debugWalletAction('Attempting direct safeProviderRequest...');
          accounts = await safeProviderRequest<string[]>(
            provider,
            'eth_requestAccounts',
            [],
            config?.requestTimeout || 30000
          );
          debugWalletAction('safeProviderRequest succeeded', { accounts });
        } catch (primaryError: any) {
          debugWalletAction(
            'safeProviderRequest failed, trying direct provider.request...',
            {
              error: primaryError.message,
              code: primaryError.code,
            }
          );

          // Fallback: direct provider.request call for MetaMask evmAsk.js issues
          try {
            debugWalletAction(
              'Attempting direct provider.request fallback...',
              {
                fallbackReason:
                  'safeProviderRequest failed, likely evmAsk.js internal error',
              }
            );

            // First try direct eth_requestAccounts as before
            let result: any;

            try {
              result = await provider.request({
                method: 'eth_requestAccounts',
                params: [],
              });
            } catch (err: any) {
              debugWalletAction('Direct eth_requestAccounts failed', {
                error: err.message,
                isSelectExtension: err.message.includes('selectExtension'),
                isEvmAsk: err.message.includes('evmAsk'),
              });

              // Check for specific MetaMask selectExtension issue
              debugWalletAction(
                'Checking error type for MetaMask selectExtension issue',
                {
                  hasSelectExtension: err.message?.includes('selectExtension'),
                  hasEvmAsk: err.message?.includes('evmAsk'),
                  stackHasEvmAsk: err.stack?.includes('evmAsk'),
                  errorType: err?.constructor?.name,
                  isTransportError:
                    err.message?.includes('send') ||
                    err.stack?.includes('#e.send'),
                  isStrictSelectExtension:
                    err.message?.includes('selectExtension') &&
                    err.message?.includes('Unexpected'),
                }
              );

              // Check for MetaMask wallet_selectEthereumProvider dialog failure
              if (
                (err.message?.includes('selectExtension') ||
                  err.message?.includes('evmAsk') ||
                  err.stack?.includes('evmAsk') ||
                  err.message?.includes('Unexpected error') ||
                  err.stack?.includes(`wallet_selectEthereumProvider`) ||
                  err.stack?.includes('selectEthereumProvider')) &&
                provider.isMetaMask
              ) {
                debugWalletAction(
                  'Detected MetaMask wallet selection dialog failure',
                  {
                    error: err.message,
                    isWalletSelection: err.stack?.includes(
                      'wallet_selectEthereumProvider'
                    ),
                    fullStackTrace: err.stack?.substring(0, 500),
                    isSelectingExtension: true,
                  }
                );

                // MetaMask wallet_selectEthereumProvider is failing during provider selection dialog
                // This happens when multiple extensions are installed and MetaMask can't choose
                throw new Web3ProviderError(
                  'MetaMask provider selection dialog failed - please retry connection',
                  ERROR_CODES.USER_REJECTED,
                  {
                    originalError: err.message,
                    walletSelectionFailure: true,
                    suggestions: [
                      'MetaMask is trying to show a wallet selection dialog',
                      'If you have multiple wallets, manually click on MetaMask first',
                      'Then retry the connection',
                      'Or refresh the page and try again',
                    ],
                  }
                );
              } else {
                throw err; // Re-throw non-wallet-selection errors
              }
            }

            debugWalletAction('Direct provider.request received result', {
              result,
            });

            if (Array.isArray(result) && result.length > 0) {
              accounts = result;
              debugWalletAction(
                'Direct provider.request succeeded - accounts found',
                {
                  accountCount: accounts.length,
                  accounts: accounts.map(
                    (acc: string) => `${acc.slice(0, 6)}...${acc.slice(-4)}`
                  ),
                }
              );
            } else {
              throw new Web3ProviderError(
                'Direct request returned no accounts',
                ERROR_CODES.UNAUTHORIZED,
                { result, method: 'eth_requestAccounts' }
              );
            }
          } catch (fallbackError: any) {
            debugWalletAction(
              'Both safeProviderRequest and direct request failed',
              {
                primaryError: {
                  message: primaryError.message,
                  code: primaryError.code,
                  stack: primaryError.stack?.substring(0, 200),
                },
                fallbackError: {
                  message: fallbackError.message,
                  code: fallbackError.code,
                  isEvmAskError:
                    fallbackError.message?.includes('evmAsk') || false,
                  stack: fallbackError.stack?.substring(0, 200),
                },
              }
            );

            // If it's the specific evmAsk.js error, we provide a helpful message
            if (
              fallbackError.message?.includes('evmAsk') ||
              primaryError.message?.includes('evmAsk') ||
              (primaryError.stack && primaryError.stack.includes('evmAsk'))
            ) {
              throw new Web3ProviderError(
                'MetaMask internal error (evmAsk.js) - please try refreshing the page or reconnecting',
                ERROR_CODES.INTERNAL_ERROR,
                {
                  originalError: primaryError,
                  suggestions: [
                    'Refresh page',
                    'Restart MetaMask',
                    'Try again',
                  ],
                }
              );
            }

            // Re-throw the original safeProviderRequest error since it's more descriptive
            throw primaryError;
          }
        }

        debugWalletAction('eth_requestAccounts response received', {
          accountsExist: Array.isArray(accounts),
          accountCount: accounts ? accounts.length : 0,
          accounts: accounts || [],
        });

        if (!Array.isArray(accounts) || accounts.length === 0) {
          debugWalletAction('No accounts returned', { accounts });
          throw new Web3ProviderError(
            'No accounts returned from provider',
            ERROR_CODES.UNAUTHORIZED,
            { method: 'eth_requestAccounts' }
          );
        }

        debugWalletAction('Accounts successfully retrieved', {
          count: accounts.length,
          accounts: accounts.map(
            (acc: string) => `${acc.slice(0, 6)}...${acc.slice(-4)}`
          ),
        });

        // Call setAddress if the method is available on the provider
        // This is required for custom wallet providers that need explicit address setting
        const firstAccount = accounts[0];
        if (firstAccount && typeof provider.setAddress === 'function') {
          // Validate address before calling setAddress for security
          if (!isValidAddress(firstAccount)) {
            debugWalletAction('Invalid address format, skipping setAddress', {
              address: firstAccount,
            });
            console.warn('⚠️ Invalid address format, skipping setAddress call');
          } else {
            try {
              debugWalletAction('Calling setAddress method', {
                address: firstAccount,
                hasSetAddress: true,
              });
              
              // Add timeout protection for setAddress (5 seconds)
              const setAddressPromise = provider.setAddress(firstAccount);
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('setAddress timeout')), 5000);
              });
              
              await Promise.race([setAddressPromise, timeoutPromise]);
              
              debugWalletAction('setAddress called successfully', {
                address: `${firstAccount.slice(0, 6)}...${firstAccount.slice(-4)}`,
              });
            } catch (setAddressError: any) {
              debugWalletAction('setAddress call failed (non-critical)', {
                error: setAddressError.message,
                address: firstAccount,
                isTimeout: setAddressError.message?.includes('timeout'),
              });
              // Don't throw - setAddress failure shouldn't block the connection
              console.warn('⚠️ setAddress method failed:', setAddressError);
            }
          }
        } else if (accounts.length > 0) {
          debugWalletAction('setAddress method not available on provider', {
            hasSetAddress: typeof provider.setAddress === 'function',
            providerType: provider.constructor?.name || 'Unknown',
          });
        }

        return accounts;
      } catch (error: any) {
        debugWalletAction(
          'safeProviderRequest failed - Detailed Error Analysis',
          {
            errorType: error?.constructor?.name || 'Unknown',
            message: error?.message || 'No message',
            code: error?.code || 'No code',
            stack: error?.stack?.substring(0, 500) || 'No stack',
            isTargetError: error instanceof Web3ProviderError,
            providerInfo: {
              hasRequest: typeof provider?.request === 'function',
              isConnected: provider?.isConnected
                ? provider.isConnected()
                : false,
              chainId: provider?.chainId || 'N/A',
            },
          }
        );

        if (error.code === 4001) {
          const rejectionError = new Web3ProviderError(
            'User rejected the request',
            ERROR_CODES.USER_REJECTED,
            { method: 'eth_requestAccounts' }
          );
          debugWalletAction('User rejection detected');
          throw rejectionError;
        }

        // Fallback direct request for evmAsk.js compatibility
        debugWalletAction('Attempting fallback direct request');
        try {
          const accounts = await provider.request({
            method: 'eth_requestAccounts',
            params: [],
          });

          debugWalletAction('Direct request successful', {
            count: accounts.length,
            accounts: accounts.map(
              (acc: string) => `${acc.slice(0, 6)}...${acc.slice(-4)}`
            ),
          });

          return Array.isArray(accounts) ? accounts : [];
        } catch (fallbackError: any) {
          debugWalletAction('Direct request also failed', {
            fallbackError: fallbackError.message,
            originalError: error.message,
          });

          throw new Web3ProviderError(
            error.message || 'Failed to request accounts',
            ERROR_CODES.JSON_RPC_ERROR,
            { method: 'eth_requestAccounts', originalError: error }
          );
        }
      }
    },

    /**
     * Get the current network information
     */
    getNetwork: async (): Promise<NetworkInfo> => {
      try {
        const chainId = await safeProviderRequest<string>(
          provider,
          'eth_chainId'
        );

        if (!isValidChainId(chainId)) {
          throw new NetworkError('Invalid chain ID received', chainId);
        }

        // For default network, return specific network info
        if (chainId === DEFAULT_NETWORK.chainId) {
          return {
            chainId,
            name: DEFAULT_NETWORK.chainName,
            blockExplorerUrl: DEFAULT_NETWORK.blockExplorerUrls[0] || '',
            nativeCurrency: DEFAULT_NETWORK.nativeCurrency,
          };
        }

        // For other networks, return basic info
        return {
          chainId,
          name: `Chain ${parseInt(chainId, 16)}`,
        };
      } catch {
        throw new NetworkError('Failed to get network information', undefined);
      }
    },

    /**
     * Get the current account
     */
    getAccount: async (): Promise<string> => {
      try {
        console.log('🔍 getAccount: Calling eth_requestAccounts...');
        const accounts = await safeProviderRequest<string[]>(
          provider,
          'eth_requestAccounts'
        );
        console.log('🔍 getAccount: eth_requestAccounts response:', accounts);

        if (!accounts || accounts.length === 0) {
          console.error('❌ getAccount: No accounts found or empty array', { accounts });
          throw new Web3ProviderError(
            'No accounts found',
            ERROR_CODES.UNAUTHORIZED
          );
        }

        const account = accounts[0];
        if (!account || !isValidAddress(account)) {
          throw new InvalidAccountError(account || '');
        }

        return account;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to get account',
          ERROR_CODES.INTERNAL_ERROR,
          { error }
        );
      }
    },

    /**
     * Get all connected accounts
     */
    getAccounts: async (): Promise<string[]> => {
      try {
        const accounts = await safeProviderRequest<string[]>(
          provider,
          'eth_requestAccounts'
        );

        if (!Array.isArray(accounts)) {
          throw new Web3ProviderError(
            'Invalid accounts response',
            ERROR_CODES.INTERNAL_ERROR
          );
        }

        return accounts.filter(account => isValidAddress(account));
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to get accounts',
          ERROR_CODES.INTERNAL_ERROR,
          { error }
        );
      }
    },

    /**
     * Get balance for an address
     */
    getBalance: async (address?: string): Promise<BalanceInfo> => {
      try {
        const targetAddress = address || (await actions.getAccount());

        if (!targetAddress || !isValidAddress(targetAddress)) {
          throw new InvalidAccountError(targetAddress || '');
        }

        const balance = await safeProviderRequest<string>(
          provider,
          'eth_getBalance',
          [targetAddress, 'latest']
        );

        return {
          address: targetAddress,
          balance,
          balanceInEth: weiToEth(balance),
        };
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to get balance',
          ERROR_CODES.INTERNAL_ERROR,
          { error, address }
        );
      }
    },

    /**
     * Get transaction count (nonce) for an address
     */
    getTransactionCount: async (address?: string): Promise<number> => {
      try {
        const targetAddress = address || (await actions.getAccount());

        if (!targetAddress || !isValidAddress(targetAddress)) {
          throw new InvalidAccountError(targetAddress || '');
        }

        const count = await safeProviderRequest<string>(
          provider,
          'eth_getTransactionCount',
          [targetAddress, 'latest']
        );
        return parseInt(count, 16);
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to get transaction count',
          ERROR_CODES.INTERNAL_ERROR,
          { error, address }
        );
      }
    },

    /**
     * Estimate gas for a transaction
     */
    estimateGas: async (
      transaction: Partial<Transaction>
    ): Promise<GasEstimate> => {
      try {
        const gasLimit = await safeProviderRequest<string>(
          provider,
          'eth_estimateGas',
          [transaction]
        );

        // Get current gas price
        const gasPrice = await safeProviderRequest<string>(
          provider,
          'eth_gasPrice'
        );

        return {
          gasLimit,
          gasPrice,
        };
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to estimate gas',
          ERROR_CODES.INTERNAL_ERROR,
          { error, transaction }
        );
      }
    },

    /**
     * Sign a message (personal_sign)
     */
    signMessage: async (message: string): Promise<string> => {
      try {
        // Enhanced input validation and sanitization
        if (!message || typeof message !== 'string') {
          throw new Web3ProviderError(
            'Invalid message - must be a non-empty string',
            ERROR_CODES.INVALID_PARAMS,
            { message }
          );
        }

        // SECURITY: Sanitize message length to prevent abuse
        const MAX_MESSAGE_LENGTH = 10000;
        if (message.length > MAX_MESSAGE_LENGTH) {
          throw new Web3ProviderError(
            `Message too long - maximum ${MAX_MESSAGE_LENGTH} characters allowed`,
            ERROR_CODES.INVALID_PARAMS,
            { messageLength: message.length, maxLength: MAX_MESSAGE_LENGTH }
          );
        }

        // Remove potential dangerous content patterns
        const sanitizedMessage = message.trim();
        if (!sanitizedMessage) {
          throw new Web3ProviderError(
            'Message cannot be empty after sanitization',
            ERROR_CODES.INVALID_PARAMS,
            { message }
          );
        }

        const from = await actions.getAccount();
        if (!from) {
          throw new Web3ProviderError(
            'No account available for signing',
            ERROR_CODES.UNAUTHORIZED
          );
        }

        const signature = await safeProviderRequest<string>(
          provider,
          'personal_sign',
          [sanitizedMessage, from]
        );

        return signature;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to sign message',
          ERROR_CODES.INTERNAL_ERROR,
          { error, message }
        );
      }
    },

    /**
     * Sign typed data (eth_signTypedData_v4)
     */
    signTypedData: async (typedData: unknown): Promise<string> => {
      try {
        if (!typedData) {
          throw new Web3ProviderError(
            'Invalid typed data',
            ERROR_CODES.INVALID_PARAMS,
            { typedData }
          );
        }

        const from = await actions.getAccount();
        if (!from) {
          throw new Web3ProviderError(
            'No account available for signing',
            ERROR_CODES.UNAUTHORIZED
          );
        }

        const signature = await safeProviderRequest<string>(
          provider,
          'eth_signTypedData_v4',
          [from, typedData]
        );

        return signature;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          'Failed to sign typed data',
          ERROR_CODES.INTERNAL_ERROR,
          { error, typedData }
        );
      }
    },

    /**
     * Send a transaction
     */
    sendTransaction: async (transaction: Transaction): Promise<string> => {
      try {
        // Enhanced transaction validation
        if (!transaction.from || !isValidAddress(transaction.from)) {
          throw new InvalidAccountError(transaction.from || '');
        }

        if (transaction.to && !isValidAddress(transaction.to)) {
          throw new InvalidAccountError(transaction.to);
        }

        // SECURITY: Validate transaction values
        if (transaction.value) {
          const value = BigInt(transaction.value);
          const MAX_WEI = BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          );
          if (value > MAX_WEI) {
            throw new Web3ProviderError(
              'Transaction value too large',
              ERROR_CODES.INVALID_PARAMS,
              { value: transaction.value }
            );
          }
        }

        // SECURITY: Validate gas values
        if (transaction.gas) {
          const gas = BigInt(transaction.gas);
          const MAX_GAS = BigInt('0xfffffffff'); // ~68 billion gas limit
          if (gas > MAX_GAS) {
            throw new Web3ProviderError(
              'Gas limit too high',
              ERROR_CODES.INVALID_PARAMS,
              { gas: transaction.gas }
            );
          }
        }

        // Get nonce if not provided
        if (!transaction.nonce) {
          const nonce = await actions.getTransactionCount(transaction.from);
          transaction.nonce = `0x${nonce.toString(16)}`;
        }

        // Estimate gas if not provided
        if (!transaction.gas) {
          const gasEstimate = await actions.estimateGas(transaction);
          if (gasEstimate.gasLimit) {
            transaction.gas = gasEstimate.gasLimit;
          }
        }

        const txHash = await safeProviderRequest<string>(
          provider,
          'eth_sendTransaction',
          [transaction]
        );

        return txHash;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new TransactionError('Failed to send transaction', undefined);
      }
    },

    /**
     * Get transaction receipt
     */
    getTransactionReceipt: async (
      txHash: string
    ): Promise<TransactionReceipt> => {
      try {
        if (!txHash || typeof txHash !== 'string') {
          throw new Web3ProviderError(
            'Invalid transaction hash',
            ERROR_CODES.INVALID_PARAMS,
            { txHash }
          );
        }

        const receipt = await safeProviderRequest<TransactionReceipt>(
          provider,
          'eth_getTransactionReceipt',
          [txHash]
        );

        if (!receipt) {
          throw new TransactionError(
            'Transaction not found or not mined yet',
            txHash
          );
        }

        return receipt;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new TransactionError('Failed to get transaction receipt', txHash);
      }
    },

    /**
     * Wait for transaction to be mined
     */
    waitForTransaction: async (txHash: string): Promise<TransactionReceipt> => {
      try {
        const receipt = await actions.getTransactionReceipt(txHash);

        // Simple implementation - in a real scenario, you might want to poll
        // or use WebSocket subscriptions for better performance
        return receipt;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new TransactionError('Failed to wait for transaction', txHash);
      }
    },

    /**
     * Switch to default network
     */
    switchToDefaultNetwork: async (): Promise<void> => {
      try {
        await safeProviderRequest(provider, 'wallet_switchEthereumChain', [
          { chainId: DEFAULT_NETWORK.chainId },
        ]);
      } catch (error: any) {
        // If the network is not added, try to add it
        if (error.code === 4902) {
          try {
            await safeProviderRequest(provider, 'wallet_addEthereumChain', [
              DEFAULT_NETWORK,
            ]);
          } catch {
            throw new NetworkError(
              'Failed to add default network',
              DEFAULT_NETWORK.chainId
            );
          }
        } else {
          throw new NetworkError(
            'Failed to switch to default network',
            DEFAULT_NETWORK.chainId
          );
        }
      }
    },

    /**
     * Make custom provider requests
     * Allows for any kind of provider request with custom data
     */
    customRequest: async <T = any>(
      method: string,
      params: any[] = []
    ): Promise<T> => {
      try {
        const result = await safeProviderRequest<T>(
          provider,
          method as any,
          params
        );
        return result;
      } catch (error) {
        if (error instanceof Web3ProviderError) {
          throw error;
        }
        throw new Web3ProviderError(
          `Custom request failed: ${method}`,
          ERROR_CODES.JSON_RPC_ERROR,
          { method, params }
        );
      }
    },

    /**
     * Utility functions
     */
    utils: {
      weiToEth,
      ethToWei,
      formatAddress,
      isValidAddress,
      isValidChainId,
    },
  };

  return actions;
};
