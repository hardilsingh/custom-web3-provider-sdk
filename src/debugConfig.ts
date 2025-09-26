/**
 * Debug Configuration for Web3 Provider SDK
 *
 * This file allows you to enable comprehensive debug logging
 * for connection flows and wallet actions. Set DEBUG_ENABLED to true
 * to see detailed logs in the console.
 */

export const DEBUG_CONFIG = {
  // Set to true to enable detailed debug logging
  DEBUG_ENABLED: false,

  // Optional: Custom debug prefixes
  LOG_PREFIX: {
    CONNECTION: '🔌',
    WALLET_ACTION: '💼',
    PROVIDER: '🚀',
    ERROR: '❌',
  },

  // Optional: Log levels
  LOG_LEVELS: {
    CONNECTION: true,
    WALLET_ACTIONS: true,
    PROVIDER_DETECTION: true,
    ERROR_DETAILS: true,
  },
};

// Helper to apply debug settings
export const applyDebugConfig = (config: Partial<typeof DEBUG_CONFIG>) => {
  Object.assign(DEBUG_CONFIG, config);

  // Set global debug flag for wallet actions
  if (typeof window !== 'undefined') {
    (window as any).web3DebugEnabled = DEBUG_CONFIG.DEBUG_ENABLED;
  }
};

// Example usage:
// applyDebugConfig({ DEBUG_ENABLED: true });
