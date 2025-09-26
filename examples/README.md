# Custom Request Examples

This folder contains comprehensive examples demonstrating how to use the `customRequest` method from the Universal Web3 Provider SDK.

## Quick Overview

The `customRequest` method allows you to interact directly with any blockchain provider using **any RPC method** - not just Ethereum/EIP methods but ANY compatible method your wallet provider supports.

## Basic Usage

```typescript
import { useWeb3Provider } from 'universal-web3-provider-sdk';

const { customRequest } = useWeb3Provider();

// Ethereum/EVM methods
const blockNumber = await customRequest<string>('eth_blockNumber');
const gasPrice = await customRequest<string>('eth_gasPrice');

// Non-Ethereum methods (wallet provider extensions)
const chainId = await customRequest<string>('eth_chainId');  // Works on any EVM chain
const personalSign = await customRequest<string>('personal_sign', [
  '0xmessage_hash',
  '0xaccount_address'
]);

// Custom wallet provider methods  
const walletMethod = await customRequest<any>('custom_wallet_method');
```

## All Supported Method Types

### Ethereum/EVM Standard Methods
```typescript
// Basic EVM methods
await customRequest<string>('eth_blockNumber');
await customRequest<string>('eth_chainId'); 
await customRequest<string>('eth_gasPrice');
await customRequest<string>('eth_accounts');
await customRequest<string>('eth_getBalance', [address, blockTag]);

// Personal methods
await customRequest<string>('personal_sign', [messageHash, account]);
await customRequest<string>('personal_ecRecover', [sig, messageHash]);

// Net methods
await customRequest<string>('net_version');
await customRequest<string>('net_listening');

// Web3 methods
await customRequest<string>('web3_clientVersion');
await customRequest<string>('web3_sha3', [hash]);
```

### Wallet Provider Extensions
```typescript
// Custom wallet functionality
await customRequest<any>('wallet_getPermissions');
await customRequest<any>('wallet_requestPermissions', [permissions]);

// Wallet switching
await customRequest<void>('wallet_switchEthereumChain', [{ chainId }]);
await customRequest<void>('wallet_addEthereumChain', [chainConfig]);

// Asset management
await customRequest<void>('wallet_watchAsset', assetConfig);
```

### Non-EVM Blockchain Methods
```typescript
// Binance Smart Chain extensions
await customRequest<any>('bsc_accounts');
await customRequest<any>('bsc_request');
await customRequest<string>('bsc_chainId');

// Polygon extensions  
await customRequest<any>('matic_request');
await customRequest<string>('matic_chainId');

// Custom network methods
await customRequest<any>('custom_network_method');
await customRequest<string>('arbitrum_getTransactionCount');
```

### Provider-Specific Methods
```typescript
// MetaMask specific
await customRequest<any>('metamask_getProviderState');
await customRequest<any>('metamask_logout');

// Coinbase Wallet specific
await customRequest<any>('coinbase_request');

// Trust Wallet specific  
await customRequest<any>('trust_request');

// Any wallet extension
await customRequest<any>('wallet_specific_method');
```

## Complete Example Component

Here's the complete example from the main README that you can use in your demo:

```typescript
import React, { useState, useEffect } from 'react';
import { useWeb3Provider } from 'universal-web3-provider-sdk';

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

      // Check if syncing
      const syncing = await customRequest<any>('eth_syncing');
      console.log('Syncing status:', syncing);

      // Get client version
      const clientVersion = await customRequest<string>('web3_clientVersion');
      console.log('Provider version:', clientVersion);

    } catch (error) {
      console.error('Block information failed:', error);
    }
  };

  const interactWithContract = async () => {
    try {
      const contractAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      // Check if it's a contract
      const code = await customRequest<string>('eth_getCode', [
        contractAddress,
        'latest'
      ]);
      console.log('Contract code length:', code.length);
      console.log('Is contract:', code !== '0x');

      // Call contract method (example: ERC20 balanceOf)
      const result = await customRequest<string>('eth_call', [{
        to: contractAddress,
        data: '0x70a08231000000000000000000000000123456789012345678901234567890123456789012'
      }]);
      console.log('Contract call result:', result);

      // Get storage value
      const storage = await customRequest<string>('eth_getStorageAt', [
        contractAddress,
        '0x0', // storage slot
        'latest'
      ]);
      console.log('Storage slot 0:', storage);

    } catch (error) {
      console.error('Contract interaction failed:', error);
    }
  };

  const checkTransactionStatus = async (txHash: string) => {
    try {
      // Get transaction receipt
      const receipt = await customRequest<any>('eth_getTransactionReceipt', [txHash]);
      
      if (!receipt) {
        console.log('Transaction pending...');
        return 'pending';
      }

      const status = receipt.status === '0x1' ? 'success' : 'failed';
      console.log('Transaction status:', status);
      return status;

    } catch (error) {
      console.error('Check transaction failed:', error);
      return 'error';
    }
  };

  const advanceOperations = async () => {
    try {
      // Batch requests
      const [blockNumber, gasPrice, networkId] = await Promise.all([
        customRequest<string>('eth_blockNumber'),
        customRequest<string>('eth_gasPrice'),
        customRequest<string>('net_version')
      ]);

      console.log('Latest block:', parseInt(blockNumber, 16));
      console.log('Gas price:', utils.weiToEth(gasPrice), 'ETH');
      console.log('Network:', networkId);

      // Get specific block
      const specificBlock = await customRequest<any>('eth_getBlockByNumber', [
        blockNumber,
        true // include transactions
      ]);
      console.log('Block transaction count:', specificBlock.transactions?.length || 0);

      // Get account balance
      const accounts = await customRequest<string[]>('eth_accounts');
      if (accounts.length > 0) {
        const balance = await customRequest<string>('eth_getBalance', [
          accounts[0],
          'latest'
        ]);
        console.log('Account balance:', utils.weiToEth(balance), 'ETH');
      }

    } catch (error) {
      console.error('Advanced operations failed:', error);
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
        <button 
          onClick={getBlockInformation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Get Block Info
        </button>
        
        <button 
          onClick={interactWithContract}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Interact with Contract
        </button>
        
        <button 
          onClick={() => checkTransactionStatus('0x123...')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Transaction
        </button>
        
        <button 
          onClick={advanceOperations}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Advanced Operations
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>ANY Method Supported - Examples:</h4>
        
        <h5>✅ Ethereum Methods:</h5>
        <ul>
          <li><code>eth_blockNumber</code> - Get current block number</li>
          <li><code>eth_gasPrice</code> - Get current gas price</li>
          <li><code>eth_chainId</code> - Get chain ID</li>
          <li><code>eth_accounts</code> - Get connected accounts</li>
          <li><code>eth_getBalance</code> - Get account balance</li>
          <li><code>personal_sign</code> - Sign messages</li>
          <li><code>eth_call</code> - Read from smart contracts</li>
        </ul>
        
        <h5>✅ Wallet Methods:</h5>
        <ul>
          <li><code>wallet_switchEthereumChain</code> - Switch network</li>
          <li><code>wallet_addEthereumChain</code> - Add custom network</li>
          <li><code>wallet_watchAsset</code> - Watch token</li>
          <li><code>wallet_getPermissions</code> - Get wallet permissions</li>
        </ul>
        
        <h5>✅ Provider Extensions:</h5>
        <ul>
          <li><code>metamask_getProviderState</code> - MetaMask state</li>
          <li><code>coinbase_request</code> - Coinbase Wallet methods</li>
          <li><code>trust_request</code> - Trust Wallet methods</li>
          <li><code>custom_any_method</code> - Any custom method</li>
        </ul>
        
        <p><strong>💡 Tip:</strong> You can use <code>customRequest('any_method_here')</code> - the SDK will safely handle any method your provider supports!</p>
      </div>
    </div>
  );
}

export default CustomRequestDemo;
```

## Key Features of customRequest

### 1. **Type Safety**
```typescript
// Specify return type for better TypeScript support
const blockNumber: string = await customRequest<string>('eth_blockNumber');
const txReceipt: TransactionReceipt = await customRequest<TransactionReceipt>('eth_getTransactionReceipt', [txHash]);
```

### 2. **Parameter Support**
```typescript
// Without parameters
const blockNumber = await customRequest<string>('eth_blockNumber');

// With parameters
const block = await customRequest<any>('eth_getBlockByNumber', [
  '0x123', // block number parameter
  true     // include transactions parameter
]);
```

### 3. **Error Handling**
```typescript
try {
  const result = await customRequest<string>('eth_blockNumber');
  console.log('Result:', result);
} catch (error: any) {
  console.error('Custom request failed:', error);
  // Handle specific error codes
  if (error.code === 'PROVIDER_NOT_FOUND') {
    console.error('Wallet not found');
  }
}
```

### 4. **Batch Requests**
```typescript
// Request multiple values simultaneously
const [blockNumber, gasPrice, networkId] = await Promise.all([
  customRequest<string>('eth_blockNumber'),
  customRequest<string>('eth_gasPrice'),
  customRequest<string>('net_version')
]);

console.log('Block:', blockNumber);
console.log('Gas:', gasPrice);
console.log('Network:', networkId);
```

## Real-World Non-Ethereum Examples

### Multi-Chain Wallet Operations
```typescript
function MultiChainExample() {
  const { customRequest } = useWeb3Provider();

  const multiChainOperations = async () => {
    try {
      // Get chain ID from any provider (works on ETH, BSC, Polygon, etc.)
      const chainId = await customRequest<string>('eth_chainId');
      console.log('Current chain ID:', chainId);

      // Switch networks on any wallet
      await customRequest('wallet_switchEthereumChain', [{
        chainId: '0x89' // Polygon
      }]);

      // Add custom networks
      await customRequest('wallet_addEthereumChain', [{
        chainId: '0x150',
        chainName: 'Custom Network',
        rpcUrls: ['https://custom-rpc.com']
      }]);

      // Watch any custom asset
      await customRequest('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: '0x...',
          symbol: 'TOKEN',
          decimals: 18
        }
      });

    } catch (error) {
      console.error('Multi-chain operation failed:', error);
    }
  };

  return (
    <button onClick={multiChainOperations}>
      Multi-Chain Operations
    </button>
  );
}
```

### Wallet Provider Extensions
```typescript
function WalletExtensionsExample() {
  const { customRequest } = useWeb3Provider();

  const walletExtensions = async () => {
    try {
      // MetaMask specific methods
      const providerState = await customRequest('metamask_getProviderState');
      console.log('MetaMask provider state:', providerState);

      // Any wallet's request methods
      const accounts = await customRequest<string[]>('eth_accounts');
      
      // Provider-specific signing methods
      const signature = await customRequest<string>('personal_sign', [
        '0x...',
        accounts[0]
      ]);

      // Custom signing for any message type
      const typedSign = await customRequest<string>('eth_signTypedData_v4', [
        accounts[0],
        { domain: { name: 'MyApp' }, types: {}, primaryType: 'Message', message: {} }
      ]);

    } catch (error) {
      console.error('Wallet extensions failed:', error);
    }
  };

  return (
    <button onClick={walletExtensions}>
      Wallet Extensions
    </button>
  );
}
```

### Custom Provider Methods
```typescript
function CustomProviderExample() {
  const { customRequest } = useWeb3Provider();

  const customProviderMethods = async () => {
    try {
      // Any method the provider supports
      const result1 = await customRequest<any>('get_network_info');
      const result2 = await customRequest<any>('get_wallet_config');
      const result3 = await customRequest<any>('provider_version');

      // Even completely custom methods
      const customResult = await customRequest<any>('my_custom_method', [
        'param1',
        { key: 'value' }
      ]);

      console.log('All results:', { result1, result2, result3, customResult });

    } catch (error) {
      console.error('Custom provider methods failed:', error);
    }
  };

  return (
    <button onClick={customProviderMethods}>
      Custom Provider Methods
    </button>
  );
}
```

### Error Handling for Any Method
```typescript
function UniversalMethodExample() {
  const { customRequest } = useWeb3Provider();

  const safeCustomRequest = async (method: string, params: any[] = []) => {
    try {
      // This works with ANY method - Ethereum, custom providers, etc.
      const result = await customRequest<any>(method, params);
      console.log(`${method} result:`, result);
      return result;
    } catch (error: any) {
      // Handle errors for any method
      if (error.code === 'METHOD_NOT_FOUND') {
        console.log(`${method} not supported by this provider`);
      } else if (error.code === 'UNSUPPORTED_METHOD') {
        console.log(`${method} method not available`);
      } else {
        console.error(`${method} failed:`, error.message);
      }
      return null;
    }
  };

  // Test various methods
  const testAllMethods = async () => {
    await safeCustomRequest('eth_chainId');
    await safeCustomRequest('wallet_switchEthereumChain', [{ chainId: '0x1' }]);
    await safeCustomRequest('custom_provider_method');
    await safeCustomRequest('this_method_doesnt_exist');
  };

  return (
    <button onClick={testAllMethods}>
      Test All Methods (including non-existent ones)
    </button>
  );
}
```

## Validating Supported Methods

```typescript
function MethodValidationExample() {
  const { customRequest } = useWeb3Provider();

  const checkMethodSupport = async (method: string) => {
    try {
      await customRequest(method, []); // Test with empty params
      return true;
    } catch (error: any) {
      // If method doesn't exist, provider will throw an error
      console.log(`${method} not supported`);
      return false;
    }
  };

  const validateWalletCapabilities = async () => {
    const methods = [
      'eth_chainId',
      'eth_accounts', 
      'personal_sign',
      'wallet_switchEthereumChain',
      'metamask_getProviderState', // MetaMask specific
      'custom_wallet_feature'  // Custom methods
    ];

    for (const method of methods) {
      const supported = await checkMethodSupport(method);
      console.log(`${method}: ${supported ? '✅' : '❌'}`);
    }
  };

  return (
    <button onClick={validateWalletCapabilities}>
      Check Supported Methods
    </button>
  );
}
```

## Common Use Cases

### Block Operations
```typescript
// Get current block number
const blockNumber = await customRequest<string>('eth_blockNumber');

// Get specific block
const block = await customRequest<any>('eth_getBlockByNumber', [
  blockNumber,
  true // include transactions
]);
```

### Gas Operations
```typescript
// Get gas price
const gasPrice = await customRequest<string>('eth_gasPrice');

// Estimate gas for a transaction
const gasEstimate = await customRequest<string>('eth_estimateGas', [{
  from: '0x123...',
  to: '0x456...',
  value: '0x1000000000000000000' // 1 ETH in wei
}]);
```

### Account Operations
```typescript
// Get account balance
const balance = await customRequest<string>('eth_getBalance', [
  '0x123...',
  'latest'
]);

// Get account transaction count (nonce)
const nonce = await customRequest<string>('eth_getTransactionCount', [
  '0x123...',
  'latest'
]);
```

### Contract Operations
```typescript
// Check if address is a contract
const code = await customRequest<string>('eth_getCode', [
  '0x123...',
  'latest'
]);
const isContract = code !== '0x';

// Read from contract
const result = await customRequest<string>('eth_call', [{
  to: '0x123...',
  data: '0x70a08231...' // encoded function call
}]);
```

### Transaction Operations
```typescript
// Get transaction by hash
const tx = await customRequest<any>('eth_getTransactionByHash', [
  '0x123...'
]);

// Get transaction receipt
const receipt = await customRequest<any>('eth_getTransactionReceipt', [
  '0x123...'
]);

// Check transaction status
const status = receipt?.status === '0x1' ? 'success' : 'failed';
```

### Network Operations
```typescript
// Get network version
const networkId = await customRequest<string>('net_version');

// Get chain ID
const chainId = await customRequest<string>('eth_chainId');

// Check sync status
const syncing = await customRequest<any>('eth_syncing');
```

## Installation Required

To use this example, make sure you have the SDK installed:

```bash
npm install universal-web3-provider-sdk
```

## Quick Start

1. Copy the example component code above
2. Import `useWeb3Provider` from the SDK
3. Use the `customRequest` method for any blockchain operation
4. Handle errors appropriately
5. Style the interface as needed for your demo

## Benefits

- **Flexible**: Access any blockchain method not covered by the SDK
- **Type Safe**: Full TypeScript support with generics
- **Error Handling**: Built-in retry mechanisms and error handling
- **Provider Agnostic**: Works with all EIP-1193 compliant providers
- **Performance**: Efficient parallel request handling
- **Debugging**: Debug mode shows all custom requests

This approach gives you complete control over blockchain interactions while maintaining the SDK's robust error handling and retry mechanisms.
