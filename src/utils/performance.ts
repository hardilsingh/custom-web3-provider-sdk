/**
 * Performance Monitoring Utility
 * Tracks key performance metrics for the SDK
 */

interface PerformanceMetrics {
  connectionTime: number[];
  requestLatency: Record<string, number[]>;
  errorCount: number;
  totalRequests: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private timers: Map<string, number>;

  private constructor() {
    this.metrics = {
      connectionTime: [],
      requestLatency: {},
      errorCount: 0,
      totalRequests: 0,
    };
    this.timers = new Map();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start a performance timer
   */
  startTimer(label: string) {
    if (typeof performance !== 'undefined') {
      this.timers.set(label, performance.now());
    }
  }

  /**
   * End a performance timer and record the duration
   */
  endTimer(label: string): number | null {
    if (typeof performance === 'undefined') {
      return null;
    }

    const startTime = this.timers.get(label);
    if (!startTime) {
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  /**
   * Record connection time
   */
  recordConnectionTime(duration: number) {
    this.metrics.connectionTime.push(duration);
    // Keep only last 100 measurements
    if (this.metrics.connectionTime.length > 100) {
      this.metrics.connectionTime.shift();
    }
  }

  /**
   * Record request latency
   */
  recordRequestLatency(method: string, duration: number) {
    if (!this.metrics.requestLatency[method]) {
      this.metrics.requestLatency[method] = [];
    }
    this.metrics.requestLatency[method]?.push(duration);

    // Keep only last 100 measurements per method
    if (
      this.metrics.requestLatency[method] &&
      this.metrics.requestLatency[method]!.length > 100
    ) {
      this.metrics.requestLatency[method]?.shift();
    }

    this.metrics.totalRequests++;
  }

  /**
   * Record an error
   */
  recordError() {
    this.metrics.errorCount++;
  }

  /**
   * Get average connection time
   */
  getAverageConnectionTime(): number {
    if (this.metrics.connectionTime.length === 0) {
      return 0;
    }
    const sum = this.metrics.connectionTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.connectionTime.length;
  }

  /**
   * Get average request latency for a method
   */
  getAverageRequestLatency(method: string): number {
    const latencies = this.metrics.requestLatency[method];
    if (!latencies || latencies.length === 0) {
      return 0;
    }
    const sum = latencies.reduce((a, b) => a + b, 0);
    return sum / latencies.length;
  }

  /**
   * Get error rate
   */
  getErrorRate(): number {
    if (this.metrics.totalRequests === 0) {
      return 0;
    }
    return this.metrics.errorCount / this.metrics.totalRequests;
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      averageConnectionTime: this.getAverageConnectionTime(),
      requestLatencies: Object.keys(this.metrics.requestLatency).reduce(
        (acc, method) => {
          acc[method] = this.getAverageRequestLatency(method);
          return acc;
        },
        {} as Record<string, number>
      ),
      errorRate: this.getErrorRate(),
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.errorCount,
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      connectionTime: [],
      requestLatency: {},
      errorCount: 0,
      totalRequests: 0,
    };
    this.timers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

export default PerformanceMonitor;
