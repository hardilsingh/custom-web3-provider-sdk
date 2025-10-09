/**
 * Storage utilities for persisting connection state
 */

const STORAGE_KEY = 'web3-provider-sdk';

interface StoredConnection {
  providerName: string;
  timestamp: number;
}

/**
 * Check if localStorage is available
 */
const isStorageAvailable = (): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Save connected provider to localStorage
 */
export const saveConnection = (providerName: string): void => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const data: StoredConnection = {
      providerName,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save connection to localStorage:', error);
  }
};

/**
 * Get saved connection from localStorage
 */
export const getSavedConnection = (): string | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredConnection = JSON.parse(stored);

    // Expire connections older than 7 days
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const age = Date.now() - data.timestamp;

    if (age > MAX_AGE) {
      clearConnection();
      return null;
    }

    return data.providerName;
  } catch (error) {
    console.warn('Failed to get saved connection from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved connection from localStorage
 */
export const clearConnection = (): void => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear connection from localStorage:', error);
  }
};

/**
 * Check if a connection is currently saved
 */
export const hasStoredConnection = (): boolean => {
  return getSavedConnection() !== null;
};
