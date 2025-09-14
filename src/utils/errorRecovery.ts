/**
 * Error recovery systems with retry mechanisms for chart data loading
 * Provides automatic retry, circuit breaker, and fallback mechanisms
 */

import { ChartValidationError, ChartDataError } from './chartValidation';

// Error types for classification
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  DATA = 'data',
  RENDER = 'render',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorMetadata {
  type: ErrorType;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  retryable: boolean;
  requiresUserAction: boolean;
  suggestedAction?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error, attempt: number) => boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitorWindow: number;
}

export interface FallbackConfig {
  useCachedData: boolean;
  useDefaultData: boolean;
  cacheTimeout: number;
  defaultDataGenerator?: () => any;
}

// Default configurations
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error: Error, attempt: number) => {
    const metadata = classifyError(error);
    return metadata.retryable && attempt < 3;
  }
};

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30000,
  monitorWindow: 60000
};

export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  useCachedData: true,
  useDefaultData: false,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  defaultDataGenerator: undefined
};

// Error classification function
export function classifyError(error: Error): ErrorMetadata {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && message.includes('failed to fetch')
  ) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: true,
      requiresUserAction: false,
      suggestedAction: 'Check your internet connection'
    };
  }

  // Validation errors
  if (error instanceof ChartValidationError) {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: false,
      requiresUserAction: false,
      suggestedAction: 'Data will be sanitized automatically'
    };
  }

  // Data errors
  if (error instanceof ChartDataError) {
    return {
      type: ErrorType.DATA,
      severity: ErrorSeverity.HIGH,
      isRecoverable: true,
      retryable: true,
      requiresUserAction: false,
      suggestedAction: 'Retrying with fallback data source'
    };
  }

  // Timeout errors
  if (
    message.includes('timeout') ||
    error.name === 'TimeoutError' ||
    message.includes('aborted')
  ) {
    return {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: true,
      requiresUserAction: false,
      suggestedAction: 'Request will be retried'
    };
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('too many requests')
  ) {
    return {
      type: ErrorType.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      isRecoverable: true,
      retryable: true,
      requiresUserAction: false,
      suggestedAction: 'Will retry after delay'
    };
  }

  // Authentication errors
  if (
    message.includes('auth') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      isRecoverable: false,
      retryable: false,
      requiresUserAction: true,
      suggestedAction: 'Please check your credentials'
    };
  }

  // Render errors
  if (
    stack.includes('react') ||
    stack.includes('render') ||
    message.includes('component') ||
    error.name === 'ChunkLoadError'
  ) {
    return {
      type: ErrorType.RENDER,
      severity: ErrorSeverity.HIGH,
      isRecoverable: true,
      retryable: true,
      requiresUserAction: false,
      suggestedAction: 'Component will be re-rendered'
    };
  }

  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    isRecoverable: true,
    retryable: true,
    requiresUserAction: false,
    suggestedAction: 'Will attempt automatic recovery'
  };
}

// Retry mechanism with exponential backoff
export class RetryManager {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onRetry?: (error: Error, attempt: number, delay: number) => void
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry
        if (
          attempt >= this.config.maxAttempts ||
          !this.shouldRetry(lastError, attempt)
        ) {
          throw lastError;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt);

        // Notify about retry
        if (onRetry) {
          onRetry(lastError, attempt, delay);
        }

        // Wait before retry
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    if (this.config.retryCondition) {
      return this.config.retryCondition(error, attempt);
    }

    const metadata = classifyError(error);
    return metadata.retryable;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return delay;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Circuit breaker pattern implementation
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number[] = [];
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = CircuitBreakerState.HALF_OPEN;
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.state = CircuitBreakerState.CLOSED;
        this.failures = [];
      }

      return result;
    } catch (error) {
      this.recordFailure();

      if (this.shouldOpenCircuit()) {
        this.state = CircuitBreakerState.OPEN;
        this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
      }

      throw error;
    }
  }

  private recordFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;

    // Remove old failures outside the monitor window
    this.failures = this.failures.filter(
      timestamp => now - timestamp <= this.config.monitorWindow
    );

    this.failures.push(now);
  }

  private shouldOpenCircuit(): boolean {
    return this.failures.length >= this.config.failureThreshold;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    const now = Date.now();
    const recentFailures = this.failures.filter(
      timestamp => now - timestamp <= this.config.monitorWindow
    );

    return {
      state: this.state,
      failures: recentFailures.length,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = [];
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }
}

// Cache manager for fallback data
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Comprehensive error recovery system
export class ErrorRecoverySystem {
  private retryManager: RetryManager;
  private circuitBreaker: CircuitBreaker;
  private cacheManager: CacheManager;
  private config: FallbackConfig;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitBreakerConfig: Partial<CircuitBreakerConfig> = {},
    fallbackConfig: Partial<FallbackConfig> = {}
  ) {
    this.retryManager = new RetryManager(retryConfig);
    this.circuitBreaker = new CircuitBreaker(circuitBreakerConfig);
    this.cacheManager = new CacheManager();
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...fallbackConfig };
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    cacheKey: string,
    options: {
      onRetry?: (error: Error, attempt: number, delay: number) => void;
      onFallback?: (reason: string, fallbackData: T) => void;
      onError?: (error: Error, metadata: ErrorMetadata) => void;
    } = {}
  ): Promise<T> {
    const { onRetry, onFallback, onError } = options;

    try {
      // Try with circuit breaker and retry
      return await this.circuitBreaker.execute(async () => {
        return await this.retryManager.executeWithRetry(async () => {
          const result = await operation();

          // Cache successful result
          if (this.config.useCachedData) {
            this.cacheManager.set(cacheKey, result, this.config.cacheTimeout);
          }

          return result;
        }, onRetry);
      });
    } catch (error) {
      const metadata = classifyError(error as Error);

      if (onError) {
        onError(error as Error, metadata);
      }

      // Try fallback strategies
      const fallbackResult = await this.tryFallbacks(cacheKey, metadata);

      if (fallbackResult) {
        if (onFallback) {
          onFallback('Using fallback data', fallbackResult);
        }
        return fallbackResult;
      }

      // If no fallback available, throw the original error
      throw error;
    }
  }

  private async tryFallbacks<T>(cacheKey: string, metadata: ErrorMetadata): Promise<T | null> {
    // Try cached data first
    if (this.config.useCachedData) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Try default data generator
    if (this.config.useDefaultData && this.config.defaultDataGenerator) {
      try {
        return this.config.defaultDataGenerator();
      } catch (error) {
        console.warn('Default data generator failed:', error);
      }
    }

    return null;
  }

  // Public methods for managing the system
  clearCache(): void {
    this.cacheManager.clear();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  getSystemStatus() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      cacheSize: this.cacheManager['cache'].size
    };
  }

  cleanup(): void {
    this.cacheManager.cleanup();
  }
}

// Singleton instance for global use
export const errorRecoverySystem = new ErrorRecoverySystem();

// Utility functions
export const createErrorRecoverySystem = (
  retryConfig?: Partial<RetryConfig>,
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
  fallbackConfig?: Partial<FallbackConfig>
) => {
  return new ErrorRecoverySystem(retryConfig, circuitBreakerConfig, fallbackConfig);
};

export const withErrorRecovery = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: string,
  recoverySystem: ErrorRecoverySystem = errorRecoverySystem
) => {
  return (async (...args: Parameters<T>) => {
    return await recoverySystem.executeWithRecovery(
      () => fn(...args),
      cacheKey
    );
  }) as T;
};

export default ErrorRecoverySystem;