/**
 * Production-ready logging utility
 * Conditionally logs based on environment and debug settings
 * Can be extended to integrate with error tracking services like Sentry
 */

class Logger {
  private static instance: Logger;
  private debugEnabled: boolean;
  private errorCallback?: (error: Error, context?: any) => void;

  private constructor(debug: boolean = false) {
    this.debugEnabled = debug && this.isNotProduction();
  }

  private isNotProduction(): boolean {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV !== 'production';
    }
    return true; // Default to debug mode if environment is unknown
  }

  static getInstance(debug?: boolean): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(debug);
    }
    if (debug !== undefined) {
      Logger.instance.setDebug(debug);
    }
    return Logger.instance;
  }

  /**
   * Set debug mode
   */
  setDebug(enabled: boolean) {
    this.debugEnabled = enabled && this.isNotProduction();
  }

  /**
   * Set error callback for external error tracking (e.g., Sentry)
   */
  setErrorCallback(callback: (error: Error, context?: any) => void) {
    this.errorCallback = callback;
  }

  /**
   * Get short timestamp for console output
   */
  private getShortTimestamp(): string {
    const now = new Date();
    return now.toISOString().split('T')[1]?.split('.')[0] || '';
  }

  /**
   * Debug level logging - only in debug mode
   */
  debug(message: string, data?: any) {
    if (this.debugEnabled) {
      const timestamp = this.getShortTimestamp();
      console.log(
        `[🚀 Web3 Provider SDK - ${timestamp}] ${message}`,
        data !== undefined ? data : ''
      );
    }
  }

  /**
   * Info level logging - only in debug mode
   */
  info(message: string, data?: any) {
    if (this.debugEnabled) {
      const timestamp = this.getShortTimestamp();
      console.info(
        `[ℹ️  Web3 Provider SDK - ${timestamp}] ${message}`,
        data !== undefined ? data : ''
      );
    }
  }

  /**
   * Warning level logging - only in debug mode
   */
  warn(message: string, data?: any) {
    if (this.debugEnabled) {
      const timestamp = this.getShortTimestamp();
      console.warn(
        `[⚠️  Web3 Provider SDK - ${timestamp}] ${message}`,
        data !== undefined ? data : ''
      );
    }
  }

  /**
   * Error level logging - always logs to console.error
   * Can be sent to error tracking service
   */
  error(message: string, error?: any, context?: any) {
    const timestamp = this.getShortTimestamp();

    // Always log errors in development
    if (this.debugEnabled || this.isNotProduction()) {
      console.error(
        `[❌ Web3 Provider SDK - ${timestamp}] ${message}`,
        error || '',
        context || ''
      );
    }

    // Send to error tracking service if callback is set
    if (this.errorCallback && error instanceof Error) {
      try {
        this.errorCallback(error, { message, context });
      } catch (callbackError) {
        // Fail silently - don't let error tracking break the app
      }
    }
  }

  /**
   * Log a grouped set of related information
   */
  group(title: string, data: Record<string, any>) {
    if (this.debugEnabled) {
      console.group(`🔌 ${title}`);
      console.table(data);
      console.groupEnd();
    }
  }

  /**
   * Performance timing helper
   */
  time(label: string) {
    if (this.debugEnabled) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.debugEnabled) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance getter
export const getLogger = (debug?: boolean): Logger => {
  return Logger.getInstance(debug);
};

// Export default instance
export const logger = Logger.getInstance();

export default Logger;
