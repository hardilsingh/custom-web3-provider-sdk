# Debug Logging Usage

## Quick Start - Enable Debug in Hook

```javascript
import { useWeb3Provider } from 'custom-web3-provider-sdk';

const MyComponent = () => {
  const {
    connect,
    disconnect,
    accounts,
    // ... other hook methods
  } = useWeb3Provider({
    debug: true,  // ← Enable detailed logging
    preferred: ['metamask']
  });

  return <div>...</div>;
};
```

## Advanced Debug Configuration

```javascript
import { 
  useWeb3Provider, 
  applyDebugConfig, 
  DEBUG_CONFIG 
} from 'custom-web3-provider-sdk';

// Enable debug globally
applyDebugConfig({
  DEBUG_ENABLED: true,
  LOG_LEVELS: {
    CONNECTION: true,
    WALLET_ACTIONS: true,
    PROVIDER_DETECTION: true,
    ERROR_DETAILS: true
  }
});

// Now all SDK operations will have detailed debug logging
```

## What You'll See in Console

With `debug: true` enabled, you'll see logs like:

```
🔌 Connection: Starting connection
🚀 Gala Provider SDK - 14:32:15 Connection starting for provider:
📡 Detected providers: {
  total: 2,
  providers: [
    { name: "metamask", connected: false, version: "unknown" }
  ]
}
🔌 Connection: Provider validation successful
💼 Wallet Action: requestAccounts started
💼 Wallet Action: Calling safeProviderRequest for eth_requestAccounts
✅ Accounts successfully obtained: {
  count: 1,
  accounts: ["0x1234...5678"]
}
```

## Disable Debug

```javascript
// Method 1: In hook config
useWeb3Provider({
  debug: false  // ← Disable logging
});

// Method 2: Update global config
applyDebugConfig({
  DEBUG_ENABLED: false
});
```

This gives you complete visibility into the connection flow and makes debugging the evmAsk.js issues much easier!
