/**
 * Environment Configuration
 * Centralized environment variable access and configuration
 */

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: string;
  debug: boolean;
}

/**
 * Get environment configuration
 * Safe access to environment variables with defaults
 */
export const getEnvironment = (): EnvironmentConfig => {
  let nodeEnv = 'development';

  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    nodeEnv = process.env.NODE_ENV;
  }

  return {
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    nodeEnv,
    debug: nodeEnv !== 'production',
  };
};

/**
 * Check if running in browser
 */
export const isBrowser = (): boolean => {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
};

/**
 * Check if running in Node.js
 */
export const isNode = (): boolean => {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
};

/**
 * Get safe environment value
 */
export const getEnvValue = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// Export environment instance
export const ENV = getEnvironment();

export default ENV;
