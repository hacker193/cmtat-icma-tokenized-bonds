'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chartLogger, LogLevel } from '@/utils/chartLogger';
import { errorRecoverySystem, ErrorRecoverySystem } from '@/utils/errorRecovery';
import { validateChartData, ValidationResult } from '@/utils/chartValidation';
import { useChartLoadingState, LoadingState } from '@/components/loading/ChartLoadingManager';

export interface ChartErrorHandlingConfig {
  chartName: string;
  enableRetry?: boolean;
  enableCircuitBreaker?: boolean;
  enableCaching?: boolean;
  enablePerformanceTracking?: boolean;
  enableValidation?: boolean;
  maxRetries?: number;
  cacheTimeout?: number;
  logLevel?: LogLevel;
}

export interface ChartMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  errorCount: number;
  lastError?: Error;
  validationResults?: ValidationResult<any>;
}

export const useChartErrorHandling = (config: ChartErrorHandlingConfig) => {
  const {
    chartName,
    enableRetry = true,
    enableCircuitBreaker = true,
    enableCaching = true,
    enablePerformanceTracking = true,
    enableValidation = true,
    maxRetries = 3,
    cacheTimeout = 5 * 60 * 1000,
    logLevel = LogLevel.INFO
  } = config;

  // Loading state management
  const {
    loadingState,
    setLoading,
    setError,
    setRetrying,
    clearState
  } = useChartLoadingState();

  // Metrics tracking
  const [metrics, setMetrics] = useState<ChartMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    errorCount: 0
  });

  // Refs for performance tracking
  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const recoverySystem = useRef<ErrorRecoverySystem>(errorRecoverySystem);

  // Initialize performance tracking
  const startRender = useCallback(() => {
    if (!enablePerformanceTracking) return;

    renderStartTime.current = performance.now();
    chartLogger.startPerformanceMeasure(`${chartName}-render`);
    chartLogger.debug('performance', 'Render started', undefined, chartName);
  }, [chartName, enablePerformanceTracking]);

  const endRender = useCallback(() => {
    if (!enablePerformanceTracking || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    const duration = chartLogger.endPerformanceMeasure(`${chartName}-render`, chartName);

    // Update metrics
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-100); // Keep last 100 renders
    }

    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime
    }));

    chartLogger.recordPerformanceMetrics({
      componentName: chartName,
      renderTime,
      dataProcessingTime: 0, // Would be set by data processing
      validationTime: 0, // Would be set by validation
      totalTime: renderTime,
      dataSize: 0, // Would be set by data size
      errorCount: metrics.errorCount,
      timestamp: new Date().toISOString()
    });

    renderStartTime.current = 0;
  }, [chartName, enablePerformanceTracking, metrics.errorCount]);

  // Data validation with error handling
  const validateData = useCallback(async <T>(
    data: T,
    validator: (data: T) => ValidationResult<T>
  ): Promise<ValidationResult<T>> => {
    if (!enableValidation) {
      return {
        isValid: true,
        data,
        errors: [],
        warnings: []
      };
    }

    const validationStart = performance.now();
    chartLogger.startPerformanceMeasure(`${chartName}-validation`);

    try {
      const result = validator(data);
      const validationTime = chartLogger.endPerformanceMeasure(`${chartName}-validation`, chartName);

      chartLogger.logValidationResult(
        chartName,
        'chart-data',
        result.isValid,
        result.errors,
        result.warnings,
        validationTime
      );

      setMetrics(prev => ({
        ...prev,
        validationResults: result
      }));

      return result;
    } catch (error) {
      const validationTime = performance.now() - validationStart;

      chartLogger.logChartError(chartName, error as Error, {
        operation: 'validation',
        additionalInfo: { validationTime }
      });

      throw error;
    }
  }, [chartName, enableValidation]);

  // Enhanced data fetching with error recovery
  const fetchDataWithRecovery = useCallback(async <T>(
    fetchFn: () => Promise<T>,
    cacheKey: string,
    options: {
      validator?: (data: T) => ValidationResult<T>;
      fallbackData?: T;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<T> => {
    const { validator, fallbackData, onProgress } = options;

    setLoading(true, 'Fetching data...');
    chartLogger.info('data', 'Data fetch started', { cacheKey }, chartName);

    const operationStart = performance.now();

    try {
      const result = await recoverySystem.current.executeWithRecovery(
        fetchFn,
        `${chartName}-${cacheKey}`,
        {
          onRetry: (error, attempt, delay) => {
            setRetrying(attempt, `Retrying in ${Math.round(delay / 1000)}s...`);
            chartLogger.warn('retry', `Retry attempt ${attempt} after ${delay}ms`, {
              error: error.message,
              attempt,
              delay
            }, chartName);
          },
          onFallback: (reason, data) => {
            chartLogger.info('fallback', `Using fallback: ${reason}`, { data }, chartName);
            clearState();
          },
          onError: (error, metadata) => {
            setError(error, metadata.type === 'network');
            chartLogger.logChartError(chartName, error, {
              operation: 'data-fetch',
              additionalInfo: { metadata, cacheKey }
            });

            setMetrics(prev => ({
              ...prev,
              errorCount: prev.errorCount + 1,
              lastError: error
            }));
          }
        }
      );

      // Validate data if validator provided
      let validatedResult = result;
      if (validator) {
        const validationResult = await validateData(result, validator);
        if (!validationResult.isValid && fallbackData) {
          chartLogger.warn('validation', 'Using fallback data due to validation failure', {
            errors: validationResult.errors.map(e => e.message)
          }, chartName);
          validatedResult = fallbackData;
        } else {
          validatedResult = validationResult.data;
        }
      }

      const operationTime = performance.now() - operationStart;
      chartLogger.info('data', `Data fetch completed in ${operationTime.toFixed(2)}ms`, {
        cacheKey,
        dataSize: JSON.stringify(validatedResult).length,
        operationTime
      }, chartName);

      clearState();
      return validatedResult;

    } catch (error) {
      const operationTime = performance.now() - operationStart;

      chartLogger.critical('data', 'Data fetch failed completely', error as Error, chartName);

      // Use fallback data if available
      if (fallbackData) {
        chartLogger.info('fallback', 'Using provided fallback data', undefined, chartName);
        clearState();
        return fallbackData;
      }

      throw error;
    }
  }, [chartName, clearState, setError, setLoading, setRetrying, validateData]);

  // Error boundary integration
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    chartLogger.logChartError(chartName, error, {
      operation: 'render',
      additionalInfo: errorInfo
    });

    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastError: error
    }));

    setError(error);
  }, [chartName, setError]);

  // Reset error state
  const resetError = useCallback(() => {
    clearState();
    chartLogger.info('error', 'Error state reset', undefined, chartName);
  }, [clearState, chartName]);

  // Get diagnostics
  const getDiagnostics = useCallback(() => {
    return {
      metrics,
      loadingState,
      systemDiagnostics: chartLogger.getChartDiagnostics(chartName),
      recoverySystemStatus: recoverySystem.current.getSystemStatus()
    };
  }, [metrics, loadingState, chartName]);

  // Performance profiler
  const profileOperation = useCallback((operationName: string) => {
    const startTime = performance.now();
    chartLogger.startPerformanceMeasure(`${chartName}-${operationName}`);

    return {
      end: () => {
        const duration = chartLogger.endPerformanceMeasure(`${chartName}-${operationName}`, chartName);
        return duration;
      }
    };
  }, [chartName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderStartTime.current > 0) {
        endRender(); // Finish any pending render measurement
      }
    };
  }, [endRender]);

  // Log component mount/unmount
  useEffect(() => {
    chartLogger.debug('lifecycle', `${chartName} mounted`, undefined, chartName);

    return () => {
      chartLogger.debug('lifecycle', `${chartName} unmounted`, {
        finalMetrics: metrics
      }, chartName);
    };
  }, [chartName]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    loadingState,
    metrics,

    // Core functions
    fetchDataWithRecovery,
    validateData,
    handleError,
    resetError,

    // Performance tracking
    startRender,
    endRender,
    profileOperation,

    // Diagnostics
    getDiagnostics,

    // Utilities
    logger: chartLogger,
    recoverySystem: recoverySystem.current
  };
};

// Higher-order component that wraps a chart with full error handling
export function withChartErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: Omit<ChartErrorHandlingConfig, 'chartName'> & {
    chartName?: string;
  } = {}
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const chartName = config.chartName || displayName;

  const WithChartErrorHandlingComponent: React.FC<P> = (props) => {
    const errorHandling = useChartErrorHandling({
      ...config,
      chartName
    });

    // Automatic render tracking
    useEffect(() => {
      errorHandling.startRender();
      return () => {
        errorHandling.endRender();
      };
    });

    // Error boundary for the wrapped component
    const [hasError, setHasError] = useState(false);

    const handleComponentError = useCallback((error: Error) => {
      errorHandling.handleError(error);
      setHasError(true);
    }, [errorHandling]);

    if (hasError) {
      return (
        <div>
          <p>Chart failed to render. Check console for details.</p>
          <button onClick={() => {
            setHasError(false);
            errorHandling.resetError();
          }}>
            Retry
          </button>
        </div>
      );
    }

    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      handleComponentError(error as Error);
      return null;
    }
  };

  WithChartErrorHandlingComponent.displayName = `withChartErrorHandling(${displayName})`;

  return WithChartErrorHandlingComponent;
}

export default useChartErrorHandling;