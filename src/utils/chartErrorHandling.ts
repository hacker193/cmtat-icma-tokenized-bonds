/**
 * Comprehensive Chart Error Handling System
 *
 * This module provides a complete error handling solution for chart components including:
 * - Data validation and sanitization
 * - Error boundaries and graceful fallbacks
 * - Loading states and skeleton components
 * - Automatic retry mechanisms with exponential backoff
 * - Circuit breaker patterns
 * - Performance monitoring and logging
 * - Development tools and debugging utilities
 */

// Core validation utilities
export {
  ValidationUtils,
  ChartValidationError,
  ChartDataError,
  ChartDataValidator,
  chartDataValidator,
  validateChartData,
  type ValidationResult,
  type ChartDataValidation
} from './chartValidation';

// Error recovery and retry systems
export {
  RetryManager,
  CircuitBreaker,
  CacheManager,
  ErrorRecoverySystem,
  errorRecoverySystem,
  createErrorRecoverySystem,
  withErrorRecovery,
  classifyError,
  ErrorType,
  ErrorSeverity,
  CircuitBreakerState,
  type ErrorMetadata,
  type RetryConfig,
  type CircuitBreakerConfig,
  type FallbackConfig,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  DEFAULT_FALLBACK_CONFIG
} from './errorRecovery';

// Enhanced logging and monitoring
export {
  chartLogger,
  devTools,
  LogLevel,
  type LogEntry,
  type PerformanceMetrics,
  type ChartDiagnostics
} from './chartLogger';

// Re-export React components
export {
  ChartErrorBoundary,
  ChartErrorFallback,
  withChartErrorBoundary
} from '../components/errors/ChartErrorBoundary';

export {
  ChartLoadingManager,
  useChartLoadingState,
  withLoadingState,
  type LoadingState
} from '../components/loading/ChartLoadingManager';

export {
  ChartSkeleton
} from '../components/loading/ChartSkeleton';

// Re-export hooks
export {
  useYieldCurveValidation,
  useBondPriceValidation,
  usePortfolioValidation,
  useOrderBookValidation,
  useChartValidation,
  useMultipleValidation
} from '../hooks/useChartValidation';

export {
  useChartErrorHandling,
  withChartErrorHandling,
  type ChartErrorHandlingConfig,
  type ChartMetrics
} from '../hooks/useChartErrorHandling';

// Utility functions for quick setup
export const setupChartErrorHandling = (config: {
  enableGlobalErrorHandling?: boolean;
  enablePerformanceTracking?: boolean;
  enableDevelopmentTools?: boolean;
  logLevel?: LogLevel;
} = {}) => {
  const {
    enableGlobalErrorHandling = true,
    enablePerformanceTracking = true,
    enableDevelopmentTools = process.env.NODE_ENV === 'development',
    logLevel = LogLevel.INFO
  } = config;

  // Setup global error handling
  if (enableGlobalErrorHandling && typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      chartLogger.critical('global', 'Unhandled error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      chartLogger.critical('global', 'Unhandled promise rejection', event.reason);
    });
  }

  // Attach development tools
  if (enableDevelopmentTools && devTools) {
    devTools.attachToWindow();
  }

  chartLogger.info('system', 'Chart error handling system initialized', {
    enableGlobalErrorHandling,
    enablePerformanceTracking,
    enableDevelopmentTools,
    logLevel
  });

  return {
    logger: chartLogger,
    recoverySystem: errorRecoverySystem,
    devTools
  };
};

// Quick start configurations for different use cases
export const ErrorHandlingPresets = {
  // For development - full logging and debugging
  development: {
    enableRetry: true,
    enableCircuitBreaker: true,
    enableCaching: true,
    enablePerformanceTracking: true,
    enableValidation: true,
    showErrorDetails: true,
    logLevel: LogLevel.DEBUG,
    maxRetries: 3
  },

  // For production - essential error handling only
  production: {
    enableRetry: true,
    enableCircuitBreaker: true,
    enableCaching: true,
    enablePerformanceTracking: false,
    enableValidation: true,
    showErrorDetails: false,
    logLevel: LogLevel.ERROR,
    maxRetries: 2
  },

  // For high-performance scenarios - minimal overhead
  performance: {
    enableRetry: false,
    enableCircuitBreaker: false,
    enableCaching: true,
    enablePerformanceTracking: false,
    enableValidation: false,
    showErrorDetails: false,
    logLevel: LogLevel.CRITICAL,
    maxRetries: 1
  },

  // For critical systems - maximum resilience
  resilient: {
    enableRetry: true,
    enableCircuitBreaker: true,
    enableCaching: true,
    enablePerformanceTracking: true,
    enableValidation: true,
    showErrorDetails: false,
    logLevel: LogLevel.WARN,
    maxRetries: 5
  }
};

// Factory function for creating configured error handling systems
export const createChartErrorHandlingSystem = (preset: keyof typeof ErrorHandlingPresets) => {
  const config = ErrorHandlingPresets[preset];

  const retryConfig: Partial<RetryConfig> = {
    maxAttempts: config.maxRetries,
    baseDelay: 1000,
    maxDelay: preset === 'performance' ? 5000 : 10000,
    backoffMultiplier: 2,
    jitter: true
  };

  const circuitBreakerConfig: Partial<CircuitBreakerConfig> = config.enableCircuitBreaker ? {
    failureThreshold: preset === 'resilient' ? 3 : 5,
    recoveryTimeout: preset === 'performance' ? 15000 : 30000,
    monitorWindow: 60000
  } : {};

  const fallbackConfig: Partial<FallbackConfig> = {
    useCachedData: config.enableCaching,
    useDefaultData: false,
    cacheTimeout: preset === 'performance' ? 2 * 60 * 1000 : 5 * 60 * 1000
  };

  return createErrorRecoverySystem(retryConfig, circuitBreakerConfig, fallbackConfig);
};

// Example usage patterns
export const UsageExamples = {
  // Basic error boundary usage
  basicErrorBoundary: `
    import { ChartErrorBoundary } from '@/utils/chartErrorHandling';

    <ChartErrorBoundary chartName="YieldCurve" enableRetry>
      <YieldCurveChart data={data} />
    </ChartErrorBoundary>
  `,

  // Full error handling with validation
  fullErrorHandling: `
    import { useChartErrorHandling, validateChartData } from '@/utils/chartErrorHandling';

    const MyChart = ({ data }) => {
      const errorHandling = useChartErrorHandling({
        chartName: 'MyChart',
        enableRetry: true,
        enableValidation: true
      });

      const validatedData = useMemo(() => {
        const result = validateChartData.yieldCurve(data);
        return result.data;
      }, [data]);

      return (
        <ChartLoadingManager loadingState={errorHandling.loadingState}>
          <MyChartComponent data={validatedData} />
        </ChartLoadingManager>
      );
    };
  `,

  // HOC usage
  hocUsage: `
    import { withChartErrorBoundary, withLoadingState } from '@/utils/chartErrorHandling';

    const MyChart = ({ data }) => <div>Chart content</div>;

    export default withLoadingState(
      withChartErrorBoundary(MyChart, {
        chartName: 'MyChart',
        enableRetry: true
      }),
      { skeletonVariant: 'line' }
    );
  `
};

export default {
  setupChartErrorHandling,
  ErrorHandlingPresets,
  createChartErrorHandlingSystem,
  UsageExamples
};