# Chart Error Handling System Documentation

## Overview

This comprehensive error handling system provides robust error management, data validation, and recovery mechanisms for all chart components in the tokenized fixed income platform. The system ensures stable operation, graceful degradation, and professional user experience even when data is invalid or components fail.

## Key Features

### 🛡️ Error Prevention
- **Data Validation**: Comprehensive validation for all chart data types (bonds, yield curves, portfolios, etc.)
- **Input Sanitization**: Automatic sanitization of invalid numeric values with sensible fallbacks
- **Type Safety**: TypeScript interfaces and runtime validation for data integrity

### 🔄 Error Recovery
- **Automatic Retry**: Exponential backoff retry mechanism with configurable attempts
- **Circuit Breaker**: Prevents cascade failures by temporarily stopping failing operations
- **Fallback Data**: Cached or default data when primary data sources fail
- **Progressive Degradation**: Charts degrade gracefully with partial or invalid data

### 📊 Monitoring & Logging
- **Performance Tracking**: Real-time monitoring of render times and data processing
- **Error Classification**: Intelligent categorization of errors by type and severity
- **Development Tools**: Enhanced debugging capabilities in development mode
- **Metrics Collection**: Comprehensive metrics for system health monitoring

### 🎨 User Experience
- **Loading States**: Professional skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error displays with retry options
- **Consistent UI**: Maintains design system consistency during error states
- **User Feedback**: Clear, actionable error messages and recovery suggestions

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Chart Component                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Error Boundary  │  │ Loading Manager │  │ Validation Hook │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                 Error Handling Hook                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Validation  │  │ Retry Logic │  │ Circuit     │  │ Caching │ │
│  │ System      │  │             │  │ Breaker     │  │ Layer   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Logging & Monitoring                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Structure

### Core Files

1. **Data Validation** (`utils/chartValidation.ts`)
   - `ChartDataValidator`: Main validation class
   - `ValidationUtils`: Utility functions for data validation
   - `validateChartData`: Quick validation functions
   - Custom error types: `ChartValidationError`, `ChartDataError`

2. **Error Recovery** (`utils/errorRecovery.ts`)
   - `RetryManager`: Handles retry logic with exponential backoff
   - `CircuitBreaker`: Implements circuit breaker pattern
   - `CacheManager`: Manages fallback data caching
   - `ErrorRecoverySystem`: Comprehensive recovery orchestration

3. **Logging System** (`utils/chartLogger.ts`)
   - `ChartLogger`: Enhanced logging with categorization
   - Performance monitoring and metrics collection
   - Development tools and debugging utilities

4. **React Components**
   - `ChartErrorBoundary`: Error boundary with retry capabilities
   - `ChartLoadingManager`: Loading states and skeleton components
   - `ChartSkeleton`: Professional loading skeletons

5. **React Hooks**
   - `useChartErrorHandling`: Main error handling integration
   - `useChartValidation`: Data validation hooks
   - `useChartLoadingState`: Loading state management

## Quick Start

### Basic Usage

```tsx
import { ChartErrorBoundary, ChartLoadingManager } from '@/utils/chartErrorHandling';

const MyChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <ChartErrorBoundary chartName="MyChart" enableRetry>
      <ChartLoadingManager
        loadingState={{ isLoading: loading, isError: false }}
        chartName="My Chart"
        skeletonVariant="line"
      >
        <YieldCurveChart data={data} />
      </ChartLoadingManager>
    </ChartErrorBoundary>
  );
};
```

### Advanced Usage with Validation

```tsx
import {
  useChartErrorHandling,
  useYieldCurveValidation,
  validateChartData
} from '@/utils/chartErrorHandling';

const AdvancedChart = ({ rawData }) => {
  // Initialize comprehensive error handling
  const errorHandling = useChartErrorHandling({
    chartName: 'AdvancedChart',
    enableRetry: true,
    enableValidation: true,
    enablePerformanceTracking: true
  });

  // Validate data with comprehensive checks
  const validation = useYieldCurveValidation(rawData);

  // Fetch data with automatic retry and recovery
  const fetchData = useCallback(async () => {
    return await errorHandling.fetchDataWithRecovery(
      () => api.getYieldCurveData(),
      'yield-curve-data',
      {
        validator: validateChartData.yieldCurve,
        onProgress: (progress) => console.log(`Loading: ${progress}%`)
      }
    );
  }, [errorHandling]);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  return (
    <ChartLoadingManager loadingState={errorHandling.loadingState}>
      {validation.isValid ? (
        <YieldCurveChart data={validation.data} />
      ) : (
        <ErrorDisplay errors={validation.errors} />
      )}
    </ChartLoadingManager>
  );
};
```

### HOC Usage

```tsx
import { withChartErrorBoundary, withLoadingState } from '@/utils/chartErrorHandling';

const MyChart = ({ data }) => {
  return <YieldCurveChart data={data} />;
};

// Wrap with error handling
export default withLoadingState(
  withChartErrorBoundary(MyChart, {
    chartName: 'MyChart',
    enableRetry: true,
    showErrorDetails: process.env.NODE_ENV === 'development'
  }),
  {
    skeletonVariant: 'line',
    height: 400
  }
);
```

## Configuration Presets

The system provides pre-configured setups for different environments:

```tsx
import { ErrorHandlingPresets, createChartErrorHandlingSystem } from '@/utils/chartErrorHandling';

// Development setup - full logging and debugging
const devSystem = createChartErrorHandlingSystem('development');

// Production setup - essential error handling only
const prodSystem = createChartErrorHandlingSystem('production');

// High-performance setup - minimal overhead
const perfSystem = createChartErrorHandlingSystem('performance');

// Maximum resilience setup
const resilientSystem = createChartErrorHandlingSystem('resilient');
```

## Validation System

### Supported Data Types

1. **Yield Curve Data** (`YieldCurvePoint[]`)
   - Validates maturity values (positive numbers)
   - Validates yield values (-10% to 20% range)
   - Checks for proper date formats
   - Validates curve type enums

2. **Bond Price Data** (`PriceHistory[]`)
   - Validates price values (positive numbers)
   - Validates volume data (non-negative)
   - Checks timestamp formats
   - Validates yield-to-maturity values

3. **Portfolio Data** (`PortfolioPosition[]`)
   - Validates position weights (sum to 100%)
   - Checks for required bond data
   - Validates numeric values (quantities, prices)
   - Analyzes diversification metrics

4. **Order Book Data** (`MarketDepth`)
   - Validates bid/ask price ordering
   - Checks quantity values
   - Validates spread calculations
   - Ensures liquidity metrics

### Custom Validation

```tsx
import { ChartDataValidator, ValidationUtils } from '@/utils/chartErrorHandling';

const validator = new ChartDataValidator();

// Custom validation function
const validateCustomData = (data: MyDataType[]) => {
  const errors = [];

  data.forEach((item, index) => {
    if (!ValidationUtils.isValidNumber(item.value)) {
      errors.push(new ChartValidationError(
        `Invalid value at index ${index}`,
        `value[${index}]`,
        item.value,
        'invalid'
      ));
    }
  });

  return {
    isValid: errors.length === 0,
    data: data.map(item => ({
      ...item,
      value: ValidationUtils.sanitizeNumber(item.value, 0)
    })),
    errors,
    warnings: []
  };
};
```

## Error Recovery Strategies

### Retry Configuration

```tsx
const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error, attempt) => {
    // Custom retry logic
    const metadata = classifyError(error);
    return metadata.retryable && attempt < 3;
  }
};
```

### Circuit Breaker Setup

```tsx
const circuitBreakerConfig = {
  failureThreshold: 5,    // Open circuit after 5 failures
  recoveryTimeout: 30000, // Try again after 30 seconds
  monitorWindow: 60000    // Monitor failures in 60-second windows
};
```

### Fallback Data

```tsx
const fallbackConfig = {
  useCachedData: true,
  useDefaultData: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  defaultDataGenerator: () => generateMockYieldCurveData()
};
```

## Performance Monitoring

### Metrics Collection

The system automatically tracks:
- **Render Performance**: Component render times and frequency
- **Data Processing**: Validation and transformation times
- **Error Rates**: Frequency and types of errors
- **Recovery Success**: Retry and fallback success rates
- **User Impact**: Loading times and error recovery times

### Development Tools

In development mode, additional tools are available:

```tsx
// Access logger from browser console
window.chartLogger.getLogs({ level: LogLevel.ERROR });

// Generate debug report
window.chartLogger.generateDebugReport('YieldCurveChart');

// Profile chart performance
const profiler = window.chartLogger.profileChart('MyChart');
// ... perform operations
profiler.end();
```

## Error States and User Experience

### Loading States

- **Skeleton Loading**: Professional skeleton components matching chart layout
- **Progress Indicators**: Progress bars for long-running operations
- **Retry Indicators**: Visual feedback during retry attempts
- **Network Status**: Offline/online status indicators

### Error Display

- **Graceful Degradation**: Charts show partial data when possible
- **Clear Messaging**: User-friendly error messages with suggested actions
- **Recovery Options**: Retry buttons and manual refresh options
- **Fallback Content**: Alternative content when charts completely fail

## Best Practices

### Implementation Guidelines

1. **Always Use Error Boundaries**: Wrap charts in error boundaries
2. **Validate Data Early**: Validate data at the component boundary
3. **Provide Fallbacks**: Always have fallback data or states
4. **Monitor Performance**: Track metrics in production
5. **Test Error Scenarios**: Regularly test with invalid data

### Performance Considerations

1. **Lazy Loading**: Use skeleton loaders for better perceived performance
2. **Debounce Validation**: Avoid excessive validation calls
3. **Cache Results**: Cache validation and processing results
4. **Optimize Retries**: Use appropriate backoff strategies

### Security Considerations

1. **Input Sanitization**: Always sanitize user inputs
2. **Error Information**: Don't expose sensitive data in error messages
3. **Logging Limits**: Implement log rotation and size limits
4. **Rate Limiting**: Prevent excessive retry attempts

## Integration Examples

### Existing Chart Enhancement

To enhance an existing chart component:

```tsx
// Before
const YieldCurveChart = ({ data }) => {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        {/* chart content */}
      </LineChart>
    </ResponsiveContainer>
  );
};

// After
const EnhancedYieldCurveChart = ({ data, onDataFetch }) => {
  const errorHandling = useChartErrorHandling({
    chartName: 'YieldCurveChart',
    enableRetry: true,
    enableValidation: true
  });

  const validation = useYieldCurveValidation(data);

  return (
    <ChartLoadingManager loadingState={errorHandling.loadingState}>
      <ChartErrorBoundary chartName="Yield Curve" enableRetry>
        <ResponsiveContainer>
          <LineChart data={validation.data}>
            {/* chart content */}
          </LineChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </ChartLoadingManager>
  );
};
```

## Troubleshooting

### Common Issues

1. **Validation Errors**: Check data format and required fields
2. **Render Failures**: Verify component props and data structure
3. **Network Issues**: Ensure proper retry configuration
4. **Performance Issues**: Check for excessive re-renders or validations

### Debug Tools

```tsx
// Enable debug logging
import { setupChartErrorHandling } from '@/utils/chartErrorHandling';

setupChartErrorHandling({
  enableGlobalErrorHandling: true,
  enableDevelopmentTools: true,
  logLevel: LogLevel.DEBUG
});

// Access diagnostics
const diagnostics = errorHandling.getDiagnostics();
console.log('Chart Diagnostics:', diagnostics);
```

## Migration Guide

### From Basic Error Handling

1. Replace try-catch blocks with error boundaries
2. Add data validation hooks
3. Implement loading states
4. Configure retry mechanisms

### From Custom Solutions

1. Map existing error types to system classifications
2. Migrate custom retry logic to RetryManager
3. Replace custom loading states with ChartLoadingManager
4. Integrate existing metrics with ChartLogger

## Contributing

When adding new chart components or modifying existing ones:

1. Use the error handling hooks and components
2. Add appropriate data validation
3. Include loading states and error boundaries
4. Test with invalid data scenarios
5. Update documentation for new error types

## Support

For issues or questions about the error handling system:

1. Check the browser console for detailed error logs
2. Use the development tools for debugging
3. Review validation results and metrics
4. Check the system status and diagnostics