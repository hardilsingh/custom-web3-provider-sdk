# Custom Web3 Provider SDK

A **robust, production-ready JavaScript/TypeScript SDK** that provides comprehensive wallet connection utilities for blockchain applications with enhanced error handling, retry mechanisms, comprehensive wallet functionality, memory leak prevention, and advanced security features.

## ✨ Features

- 🔗 **Multi-Wallet Support**: MetaMask, Coinbase, Trust Wallet, Rabby, Brave, LXX Wallet and more
- 🛡️ **Robust Error Handling**: Comprehensive error types and retry mechanisms with enhanced security
- 🔄 **Auto-Recovery**: Automatic reconnection and provider detection with memory leak prevention
- 📱 **React Integration**: Optimized React hooks with proper cleanup and state management
- 🎯 **TypeScript First**: Full TypeScript support with strict type checking and validation
- ⚡ **Performance Optimized**: Memoized operations and efficient re-renders with memory management
- 🔒 **Security Focused**: Input validation, sanitization, and secure transaction handling
- 🌐 **EIP-1193 Compliant**: Full compliance with Ethereum provider standards
- 📊 **Comprehensive Wallet Actions**: Balance checking, transaction signing, gas estimation
- 🎛️ **Configurable**: Extensive configuration options for different use cases
- 🚀 **Custom Requests**: Flexible provider request methods for any type of data
- 🔐 **Enhanced Event Handling**: Robust account/chain change detection with validation and real-time testing
- 🧹 **Memory Management**: Proper cleanup prevents memory leaks
- 🔍 **Debug Logging**: Comprehensive logging for troubleshooting

## 📦 Installation

```bash
npm install custom-web3-provider-sdk
```

## 🎮 Live Demo

**Experience the SDK in action with our interactive demo:**

**[🚀 View Live Demo → https://custom-sdk-demo.netlify.app](https://custom-sdk-demo.netlify.app)**

The live demo showcases:
- ✅ Multi-wallet connection (MetaMask, Coinbase, Trust Wallet, LXX Wallet, etc.)
- ✅ Real-time account and chain updates with event testing
- ✅ Secure transaction signing
- ✅ Message signing with validation
- ✅ Custom Web3 requests
- ✅ Error handling and recovery
- ✅ Account change event testing and validation
- ✅ Professional UI with all features

## 🚀 Quick Start

### Basic React Hook Usage

```typescript
import React from 'react';
import { useWeb3Provider } from 'custom-web3-provider-sdk';

function Web3App() {
  const {
    providers,
    currentProvider,
    accounts,
    chainId,
    status,
    error,
    isConnecting,
    connect,
    disconnect,
    // Wallet Actions
    getAccount,
    getBalance,
    signMessage,
    sendTransaction,
    // Utilities
    utils
  } = useWeb3Provider({
    preferred: ['metamask', 'coinbase', 'trustwallet', 'lxxwallet'],
    autoConnect: false,
    debug: true,
    onAccountsChanged: (accounts) => {
      console.log('Accounts changed:', accounts);
    },
    onChainChanged: (chainId) => {
      console.log('Chain changed to:', chainId);
    },
    onError: (error) => {
      console.error('Provider error:', error);
    }
  });

  const handleConnect = async () => {
    try {
      await connect('metamask');
      console.log('Connected successfully!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleSignMessage = async () => {
    try {
      const message = `Hello from Web3 SDK! ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      console.log('Message signed:', signature);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  const handleSendTransaction = async () => {
    try {
      const txHash = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: utils.ethToWei('0.001'),
        maxFeePerGas: '0x2540be400',
        maxPriorityFeePerGas: '0x3b9aca00',
      });
      console.log('Transaction hash:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (status === 'connected') {
    return (
      <div>
        <h2>Connected to {currentProvider?.name}</h2>
        <p>Account: {utils.formatAddress(accounts[0])}</p>
        <p>Chain ID: {chainId}</p>
        <button onClick={handleSignMessage}>Sign Message</button>
        <button onClick={handleSendTransaction}>Send Transaction</button>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Connect Your Wallet</h2>
      {providers.map((provider) => (
        <button key={provider.name} onClick={() => connect(provider.name)}>
          Connect {provider.name}
        </button>
      ))}
    </div>
  );
}

export default Web3App;
```

## 🔧 Advanced Configuration

```typescript
const {
  providers,
  currentProvider,
  accounts,
  chainId,
  status,
  error,
  isConnecting,
  connect,
  disconnect,
  getAccount,
  getAccounts,
  getBalance,
  getUserTransactionCount,
  estimateGas,
  signMessage,
  signTypedData,
  sendTransaction,
  getTransactionReceipt,
  waitForTransaction,
  switchToDefaultNetwork,
  customRequest,
  utils,
  clearError,
  refreshProviders
} = useWeb3Provider({
  // Provider preferences
  preferred: ['metamask', 'coinbase', 'trustwallet'],
  fallbackToAny: true,
  
  // Auto-connection
  autoConnect: true,
  
  // Monitoring
  checkInterval: 2000,
  
  // Error handling
  maxRetries: 3,
  requestTimeout: 30000,
  
  // Event callbacks
  onAccountsChanged: (accounts) => {
    console.log('Accounts changed:', accounts);
  },
  onChainChanged: (chainId) => {
    console.log('Chain changed:', chainId);
  },
  onDisconnect: (error) => {
    console.log('Provider disconnected:', error);
  },
  onError: (error) => {
    console.error('Provider error:', error);
  },
  onProvidersChanged: (providers) => {
    console.log('Available providers:', providers);
  },
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development'
});
```

## 📚 Complete API Reference

### useWeb3Provider Hook

The main hook that provides all wallet functionality.

#### Parameters

```typescript
interface Web3ProviderConfig {
  // Provider preferences
  preferred?: WalletProviderName[];           // Preferred providers in order
  fallbackToAny?: boolean;                    // Fallback to any available provider
  
  // Connection settings
  autoConnect?: boolean;                      // Auto-connect on initialization
  checkInterval?: number;                     // Provider detection interval (ms)
  
  // Error handling
  maxRetries?: number;                        // Max retry attempts for failed operations
  requestTimeout?: number;                    // Request timeout (ms)
  debug?: boolean;                            // Enable debug logging
  
  // Event callbacks
  onError?: (error: Web3ProviderError) => void;
  onAccountsChanged?: (accounts: string[]) => void;
  onChainChanged?: (chainId: string) => void;
  onDisconnect?: (error: any) => void;
  onProvidersChanged?: (providers: DetectedWalletProvider[]) => void;
}
```

#### Return Value

```typescript
interface UseWeb3ProviderReturn {
  // Provider state
  providers: DetectedWalletProvider[];
  currentProvider: DetectedWalletProvider | null;
  accounts: string[];
  chainId: string | null;
  status: ProviderStatus;
  error: Web3ProviderError | null;
  isConnecting: boolean;
  isDetecting: boolean;
  
  // Connection management
  connect: (name: WalletProviderName) => Promise<ConnectionResult>;
  disconnect: () => void;
  getPreferredProvider: () => DetectedWalletProvider | undefined;
  getProviderByName: (name: WalletProviderName) => EthereumProvider | undefined;
  refreshProviders: () => DetectedWalletProvider[];
  clearError: () => void;
  
  // Wallet actions (when connected)
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
  
  // Utilities
  utils: {
    weiToEth: (wei: string) => string;
    ethToWei: (eth: string) => string;
    formatAddress: (address: string) => string;
    isValidAddress: (address: string) => boolean;
    isValidChainId: (chainId: string) => boolean;
  };
}
```

### Provider Status Types

```typescript
type ProviderStatus = 
  | 'detecting'      // Scanning for providers
  | 'connected'      // Successfully connected
  | 'disconnected'   // Not connected
  | 'error';         // Error state
```

### Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
// Custom error types
class Web3ProviderError extends Error {
  constructor(message: string, code: string, data?: any) {
    super(message);
    this.name = 'Web3ProviderError';
    this.code = code;
    this.data = data;
  }
  code: string;
  data?: any;
}

class ProviderNotFoundError extends Web3ProviderError {}
class ProviderNotConnectedError extends Web3ProviderError {}
class InvalidAccountError extends Web3ProviderError {}
class TransactionError extends Web3ProviderError {}
class NetworkError extends Web3ProviderError {}

// Error codes
const ERROR_CODES = {
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  PROVIDER_NOT_CONNECTED: 'PROVIDER_NOT_CONNECTED',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNSUPPORTED_METHOD: 'UNSUPPORTED_METHOD',
  INVALID_PARAMS: 'INVALID_PARAMS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  JSON_RPC_ERROR: 'JSON_RPC_ERROR',
};
```

### Transaction Types

```typescript
// EIP-1559 Transaction (recommended)
interface EIP1559Transaction {
  to?: string;
  from: string;
  gas?: string;
  value?: string;
  data?: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  chainId?: string;
  nonce?: string;
}

// Legacy Transaction (deprecated)
interface LegacyTransaction {
  to?: string;
  from: string;
  gas?: string;
  gasPrice: string;
  value?: string;
  data?: string;
  nonce?: string;
  chainId?: string;
}

type Transaction = LegacyTransaction | EIP1559Transaction;

// Transaction Receipt
interface TransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  status: string;
  logs: TransactionLog[];
}
```

## 🎯 Advanced Examples

### Complete dApp Integration

```typescript
import React, { useEffect, useState } from 'react';
import { useWeb3Provider } from 'custom-web3-provider-sdk';

function CompleteDApp() {
  const {
    providers,
    currentProvider,
    accounts,
    chainId,
    status,
    error,
    connect,
    disconnect,
    getBalance,
    sendTransaction,
    signMessage,
    signTypedData,
    switchToDefaultNetwork,
    customRequest,
    utils
  } = useWeb3Provider({
    preferred: ['metamask', 'coinbase', 'trustwallet', 'lxxwallet'],
    autoConnect: true,
    debug: true,
    onAccountsChanged: (accounts) => {
      console.log('Accounts changed:', accounts);
    },
    onChainChanged: (chainId) => {
      console.log('Chain changed to:', chainId);
    }
  });

  const [balance, setBalance] = useState<string>('0');

  // Auto-refresh balance when connected
  useEffect(() => {
    const refreshBalance = async () => {
      if (status === 'connected' && accounts[0]) {
        try {
          const balanceInfo = await getBalance(accounts[0]);
          setBalance(balanceInfo.balanceInEth);
        } catch (error) {
          console.error('Failed to get balance:', error);
        }
      }
    };

    refreshBalance();
    const interval = setInterval(refreshBalance, 10000);
    return () => clearInterval(interval);
  }, [status, accounts]);

  const handleConnectWallet = async (providerName: string) => {
    try {
      await connect(providerName);
    } catch (error: any) {
      if (error.code === 'PROVIDER_NOT_FOUND') {
        alert(`${providerName} wallet is not installed. Please install it first.`);
      } else {
        alert(`Failed to connect: ${error.message}`);
      }
    }
  };

  const handleSendTransaction = async () => {
    if (!accounts[0]) return;

    try {
      const txHash = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: utils.ethToWei('0.001'), // Send 0.001 ETH
        maxFeePerGas: '0x2540be400',
        maxPriorityFeePerGas: '0x3b9aca00',
      });

      alert(`Transaction sent: ${txHash}`);
      
      // Refresh balance after transaction
      setTimeout(async () => {
        try {
          const balanceInfo = await getBalance(accounts[0]);
          setBalance(balanceInfo.balanceInEth);
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      }, 2000);
    } catch (error: any) {
      if (error.code === 'USER_REJECTED') {
        alert('Transaction cancelled by user');
      } else {
        alert(`Transaction failed: ${error.message}`);
      }
    }
  };

  const handleSignMessage = async () => {
    try {
      const message = `Hello from my dApp signed at ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      console.log('Message signature:', signature);
      alert(`Signed message: ${signature.slice(0, 20)}...`);
    } catch (error: any) {
      alert(`Message signing failed: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Complete dApp Example</h1>
      
      {/* Connection Status */}
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Connection Status</h3>
        <p><strong>Status:</strong> {status}</p>
        {currentProvider && <p><strong>Provider:</strong> {currentProvider.name}</p>}
        {accounts[0] && <p><strong>Account:</strong> {accounts[0]}</p>}
        {chainId && <p><strong>Chain ID:</strong> {chainId}</p>}
        {balance !== '0' && <p><strong>Balance:</strong> {balance} ETH</p>}
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Connection Section */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>🔗 Wallet Connection</h3>
          {status === 'connected' ? (
            <button onClick={disconnect} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
              Disconnect Wallet
            </button>
          ) : (
            <div>
              <p>Choose a wallet to connect:</p>
              {providers.map(provider => (
                <button
                  key={provider.name}
                  onClick={() => handleConnectWallet(provider.name)}
                  style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Connect {provider.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Section */}
        {status === 'connected' && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>💰 Transactions</h3>
            <button onClick={handleSendTransaction} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
              Send Test Transaction
            </button>
          </div>
        )}

        {/* Signing Section */}
        {status === 'connected' && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>✍️ Message Signing</h3>
            <button onClick={handleSignMessage} style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}>
              Sign Test Message
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px', color: '#d32f2f' }}>
          <h4>❌ Error</h4>
          <p>{error.message}</p>
          <p><strong>Code:</strong> {error.code}</p>
        </div>
      )}
    </div>
  );
}

export default CompleteDApp;
```

## 🔧 Custom Provider Requests (Any Method Supported)

```typescript
import React, { useState, useEffect } from 'react';
import { useWeb3Provider } from 'custom-web3-provider-sdk';

function CustomRequestDemo() {
  const { customRequest, status, utils } = useWeb3Provider();
  const [blockNumber, setBlockNumber] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('0');

  // Auto-refresh blockchain data
  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (status === 'connected') {
        try {
          const [block, gas] = await Promise.all([
            customRequest<string>('eth_blockNumber'),
            customRequest<string>('eth_gasPrice')
          ]);
          setBlockNumber(block);
          setGasPrice(gas);
        } catch (error) {
          console.error('Failed to fetch blockchain data:', error);
        }
      }
    };

    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 10000);
    return () => clearInterval(interval);
  }, [status, customRequest]);

  const getBlockInformation = async () => {
    try {
      // Get current block
      const blockNumber = await customRequest<string>('eth_blockNumber');
      console.log('Current block:', parseInt(blockNumber, 16));

      // Get block details
      const block = await customRequest<any>('eth_getBlockByNumber', [
        blockNumber, true // with transactions
      ]);
      console.log('Block details:', block);

      // Get gas price
      const gasPrice = await customRequest<string>('eth_gasPrice');
      const gasInEth = utils.weiToEth(gasPrice);
      console.log('Gas price (ETH):', gasInEth);
      console.log('Gas price (Wei):', gasPrice);

      // Get network version
      const networkId = await customRequest<string>('net_version');
      console.log('Network version:', networkId);

      // Get chain ID
      const chainId = await customRequest<string>('eth_chainId');
      console.log('Chain ID:', chainId);

    } catch (error) {
      console.error('Block information failed:', error);
    }
  };

  const getContractData = async () => {
    try {
      const contractAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      // Check if it's a contract
      const code = await customRequest<string>('eth_getCode', [
        contractAddress,
        'latest'
      ]);
      console.log('Contract code length:', code.length);
      console.log('Is contract:', code !== '0x');

      // Call contract method
      const result = await customRequest<string>('eth_call', [{
        to: contractAddress,
        data: '0x70a08231000000000000000000000000123456789012345678901234567890123456789012'
      }]);
      console.log('Contract call result:', result);
    } catch (error) {
      console.error('Contract interaction failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Custom Request Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Blockchain Data</h3>
        <p>Current Block: {parseInt(blockNumber, 16)}</p>
        <p>Gas Price: {utils.weiToEth(gasPrice)} ETH</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={getBlockInformation} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Get Block Info
        </button>
        <button onClick={getContractData} style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
          Interact with Contract
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Common Custom Request Methods:</h4>
        <ul>
          <li><code>eth_blockNumber</code> - Get current block number</li>
          <li><code>eth_gasPrice</code> - Get current gas price</li>
          <li><code>eth_getBalance</code> - Get account balance</li>
          <li><code>eth_getCode</code> - Check if address is a contract</li>
          <li><code>eth_call</code> - Read from smart contracts</li>
          <li><code>eth_estimateGas</code> - Estimate transaction gas</li>
          <li><code>eth_getTransactionReceipt</code> - Get transaction status</li>
          <li><code>net_version</code> - Get network ID</li>
        </ul>
      </div>
    </div>
  );
}

export default CustomRequestDemo;
```

## 🔄 Account Events Testing

The SDK now includes comprehensive account change event testing functionality to ensure reliable wallet integration:

### Real-time Event Monitoring

```typescript
import { useWeb3Provider } from 'custom-web3-provider-sdk';

function AccountEventsDemo() {
  const {
    accounts,
    chainId,
    status,
    currentProvider,
    connect,
    disconnect
  } = useWeb3Provider({
    preferred: ['metamask', 'coinbase', 'trustwallet', 'lxxwallet'],
    debug: true,
    
    // Enhanced event handlers with validation
    onAccountsChanged: (newAccounts) => {
      console.log('🔑 Accounts changed:', newAccounts);
      if (newAccounts.length === 0) {
        console.log('⚠️ Wallet disconnected');
      } else {
        console.log(`📋 Current accounts: ${newAccounts.join(', ')}`);
      }
    },
    
    onChainChanged: (newChainId) => {
      console.log('🔗 Chain changed to:', newChainId);
    },
    
    onDisconnect: (error) => {
      console.error('💔 Provider disconnected:', error);
    },
    
    onError: (error) => {
      console.error('❌ Provider error:', error);
    }
  });

  return (
    <div>
      <h2>Account Events Testing</h2>
      <div>
        <h3>Current State</h3>
        <p>Status: {status}</p>
        <p>Provider: {currentProvider?.name || 'None'}</p>
        <p>Chain ID: {chainId || 'None'}</p>
        <p>Accounts: {accounts.length > 0 ? `${accounts.length} account(s)` : 'None'}</p>
        {accounts.length > 0 && (
          <div>
            <h4>Account Addresses:</h4>
            {accounts.map((account, index) => (
              <div key={index} style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {account}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>How to Test</h3>
        <ol>
          <li>Connect to a wallet (MetaMask, Coinbase, Trust Wallet, LXX Wallet, etc.)</li>
          <li>In your wallet extension, switch to a different account</li>
          <li>Try switching to a different network (Ethereum, Polygon, etc.)</li>
          <li>Disconnect and reconnect your wallet</li>
          <li>Watch the console for real-time event logs</li>
        </ol>
        
        <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px', marginTop: '10px' }}>
          <strong>Expected behavior:</strong> When you change accounts or networks in your wallet, 
          you should see events logged in the console and the UI should update automatically.
        </div>
      </div>
    </div>
  );
}
```

### Event Testing Features

- ✅ **Real-time Account Changes**: Detects when users switch accounts in their wallet
- ✅ **Network Switching**: Monitors chain changes across different networks
- ✅ **Connection State**: Tracks wallet connection and disconnection events
- ✅ **Error Handling**: Comprehensive error logging and recovery
- ✅ **Validation**: Input validation for all event data
- ✅ **Debug Logging**: Detailed console output for troubleshooting

### Supported Wallet Providers

The SDK now supports the following wallet providers:

- **MetaMask** (`window.ethereum`)
- **Coinbase Wallet** (`window.coinbaseWalletExtension`)
- **Trust Wallet** (`window.trustwallet`)
- **Rabby Wallet** (`window.rabby`)
- **Brave Wallet** (`window.brave`)
- **LXX Wallet** (`window.lxxwallet`) - *New!*
- **Custom Wallet** (`window.customWallet`)

## 🛡️ Enhanced Security Features

### Input Validation & Sanitization

```typescript
import { useWeb3Provider } from 'custom-web3-provider-sdk';

function SecurityDemo() {
  const { signMessage, sendTransaction, utils } = useWeb3Provider({
    debug: true,
    onError: (error) => {
      console.error('Security error:', error.code, error.message);
    }
  });

  const secureSignMessage = async () => {
    try {
      const message = 'My secure message';
      // Auto-validation applied - length limit, content sanitization, type validation
      const signature = await signMessage(message);
      console.log('✅ Secure signature:', signature);
    } catch (error) {
      if (error.code === 'INVALID_PARAMS') {
        console.error('❌ Message validation failed:', error.message);
      }
    }
  };

  const secureTransaction = async () => {
    try {
      const transaction = {
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: utils.ethToWei('1.5'),
        maxFeePerGas: '0x2540be400',
        maxPriorityFeePerGas: '0x3b9aca00',
      };

      // Security features applied:
      // - Value bounds checking
      // - Gas limit validation 
      // - Address format validation
      // - Nonce management
      const txHash = await sendTransaction(transaction);
      console.log('✅ Secure transaction sent:', txHash);
    } catch (error) {
      console.error('❌ Transaction security check failed:', error);
    }
  };

  return (
    <div>
      <button onClick={secureSignMessage}>🛡️ Secure Sign</button>
      <button onClick={secureTransaction}>🔒 Secure Transaction</button>
    </div>
  );
}
```

### Enhanced Event Handling

```typescript
function EventHandlingDemo() {
  const { 
    accounts, 
    chainId, 
    status,
    connect,
    utils 
  } = useWeb3Provider({
    onAccountsChanged: (newAccounts) => {
      // Validates each account address
      console.log('🔑 Accounts changed:', newAccounts);
      console.log('- Valid accounts:', newAccounts.filter(utils.isValidAddress));
      
      if (newAccounts.length === 0) {
        console.log('⚠️ Wallet disconnected');
      }
    },
    
    onChainChanged: (newChainId) => {
      // Validates chain ID format
      console.log('🔗 Chain changed to:', newChainId);
      console.log('- Valid format:', utils.isValidChainId(newChainId));
    },
    
    onDisconnect: (error) => {
      console.log('💔 Provider disconnected:', error);
    },
    
    onError: (error) => {
      console.error('❌ System error:', {
        code: error.code,
        message: error.message,
        data: error.data
      });
    }
  });

  return <div>Enhanced event handling active</div>;
}
```

## 🔧 Development Tools

### Building and Development

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Lint code
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format

# Build for production
npm run build

# Clean build files
npm run clean

# Run all checks (lint + type + format)
npm run check-all
```

## 🦺 Testing

```bash
# Run test suite
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Publishing Guide

We've prepared the package for publishing:

```bash
# Build the project
npm run build

# Pack to verify contents
npm pack --dry-run

# Publish to npm (requires npm login first)
npm publish
```

### Publishing Checklist

Before publishing:

- ✅ Package name is `custom-web3-provider-sdk`
- ✅ All "gala" references removed and replaced with "web3" 
- ✅ Package description updated for general-purpose use
- ✅ All files included in package.json "files" field
- ✅ TypeScript types exported properly
- ✅ Build outputs compatible (ESM/CJS)
- ✅ README is comprehensive and professional
- ✅ Demo includes all major functionality
- ✅ Error messages are production-ready

## 🔧 Configuration Files

### TypeScript Configuration

The project includes multiple TypeScript configurations:
- `tsconfig.json` - Base configuration
- `tsconfig.cjs.json` - CommonJS build
- `tsconfig.esm.json` - ESM build

### ESLint Configuration

- Uses `eslint.config.js` (flat config)
- TypeScript support
- Prettier integration
- React hooks rules
- Browser environment globals

### Prettier Configuration

- Single quotes
- Semicolons required
- 2-space indentation
- 80 character line width
- Trailing commas

## 🆕 Recent Updates & Fixes

### v1.0.6 - Account Events & LXX Wallet Support

**🔧 Fixed Account Change Events**
- ✅ **Fixed MetaMask account change events**: Account changes now fire properly across all wallet providers
- ✅ **Enhanced global event handling**: Improved event listener setup for better reliability
- ✅ **Real-time event testing**: Added comprehensive testing functionality in the demo
- ✅ **Robust event validation**: Enhanced input validation for all wallet events

**🆕 New Wallet Provider Support**
- ✅ **LXX Wallet integration**: Added support for `window.lxxwallet` provider
- ✅ **Enhanced provider detection**: Improved detection patterns for all supported wallets
- ✅ **Better error handling**: More robust error handling for provider-specific issues

**🔍 Enhanced Debugging**
- ✅ **Comprehensive logging**: Added detailed debug logging for event handling
- ✅ **Event testing UI**: Interactive testing interface in the demo application
- ✅ **Real-time monitoring**: Live event log with color-coded messages

### Breaking Changes
- None in this version - fully backward compatible

## 🎯 Migration Guide

For anyone migrating from earlier versions:

1. **Hook name**: `useGalaProvider` → `useWeb3Provider`
2. **Network switching**: `switchToGalaNetwork` → `switchToDefaultNetwork`
3. **Error types**: All error classes renamed to `Web3*` instead of `Gala*`
4. **General purpose**: Module no longer tied to specific blockchain network

## 📞 Support

For support:
1. Check this README for documentation
2. Look at the example implementations
3. Open an issue on the GitHub repository
4. Contact the development team

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (if applicable)
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with 💜 for the complete Web3 ecosystem**

Perfect for any blockchain project requiring:
- ✅ Multi-wallet connection (including LXX Wallet)
- ✅ Transaction handling  
- ✅ Secure message signing
- ✅ Network switching
- ✅ Real-time account change detection
- ✅ Cross-platform compatibility
- ✅ Production-ready error handling
- ✅ Comprehensive TypeScript support
- ✅ Event testing and validation