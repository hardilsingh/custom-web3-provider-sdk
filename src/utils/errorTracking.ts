/**
 * Error Tracking Utility
 * Foundation for integrating with services like Sentry, LogRocket, etc.
 */

interface ErrorTrackingConfig {
  enabled: boolean;
  dsn?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
}

interface ErrorContext {
  user?: {
    id?: string;
    address?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private config: ErrorTrackingConfig;
  private initialized = false;

  private constructor() {
    this.config = {
      enabled: false,
    };
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Initialize error tracking
   * @param config Configuration for error tracking
   *
   * @example
   * ```typescript
   * ErrorTracker.getInstance().init({
   *   enabled: true,
   *   dsn: 'https://your-sentry-dsn',
   *   environment: 'production',
   *   release: '1.0.0'
   * });
   * ```
   */
  init(config: ErrorTrackingConfig) {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && this.config.dsn) {
      // Initialize Sentry or other error tracking service
      // Example for Sentry:
      // Sentry.init({
      //   dsn: this.config.dsn,
      //   environment: this.config.environment,
      //   release: this.config.release,
      //   tracesSampleRate: this.config.sampleRate || 0.1,
      // });

      this.initialized = true;
    }
  }

  /**
   * Capture an error
   */
  captureError(_error: Error, _context?: ErrorContext) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    try {
      // Send to error tracking service
      // Example for Sentry:
      // Sentry.captureException(_error, {
      //   tags: _context?.tags,
      //   extra: _context?.extra,
      //   user: _context?.user,
      // });
    } catch (trackingError) {
      // Fail silently - don't let error tracking break the app
      console.error('Error tracking failed:', trackingError);
    }
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(
    _message: string,
    _level: 'info' | 'warning' | 'error' = 'info',
    _context?: ErrorContext
  ) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    try {
      // Send to error tracking service
      // Example for Sentry:
      // Sentry.captureMessage(_message, {
      //   level: _level,
      //   tags: _context?.tags,
      //   extra: _context?.extra,
      // });
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(_user: { id?: string; address?: string }) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    try {
      // Set user context in error tracking service
      // Example for Sentry:
      // Sentry.setUser({
      //   id: _user.id,
      //   username: _user.address,
      // });
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(_message: string, _data?: Record<string, any>) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    try {
      // Add breadcrumb to error tracking service
      // Example for Sentry:
      // Sentry.addBreadcrumb({
      //   message: _message,
      //   data: _data,
      //   timestamp: Date.now() / 1000,
      // });
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

export default ErrorTracker;
