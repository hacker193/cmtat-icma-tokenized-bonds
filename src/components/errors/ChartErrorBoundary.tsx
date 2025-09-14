'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, Text, Button, Group, Stack, Alert, Badge, Code } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconBug, IconChartLine } from '@tabler/icons-react';
import { ChartValidationError, ChartDataError } from '@/utils/chartValidation';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  enableErrorReporting?: boolean;
  chartName?: string;
  showErrorDetails?: boolean;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ChartErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: ChartErrorBoundary.prototype.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error if enabled
    if (this.props.enableErrorReporting) {
      this.reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private generateErrorId(): string {
    return `chart-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      chartName: this.props.chartName || 'Unknown Chart',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chart Error Boundary caught an error:', errorLog);
    }

    // Store error in session storage for debugging
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('chartErrors') || '[]');
      existingErrors.push(errorLog);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      sessionStorage.setItem('chartErrors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Could not store error in session storage:', e);
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // This would integrate with your error reporting service (e.g., Sentry, Bugsnag)
      // For now, we'll just log it
      const errorReport = {
        errorId: this.state.errorId,
        chartName: this.props.chartName,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount
      };

      // In a real implementation, you would send this to your error reporting service
      console.log('Error reported:', errorReport);
    } catch (e) {
      console.warn('Could not report error:', e);
    }
  }

  private getErrorType(): 'validation' | 'data' | 'render' | 'unknown' {
    if (!this.state.error) return 'unknown';

    if (this.state.error instanceof ChartValidationError) return 'validation';
    if (this.state.error instanceof ChartDataError) return 'data';
    if (this.state.error.message.includes('render') ||
        this.state.error.message.includes('React')) return 'render';

    return 'unknown';
  }

  private getErrorSeverity(): 'low' | 'medium' | 'high' {
    const errorType = this.getErrorType();

    switch (errorType) {
      case 'validation':
      case 'data':
        return 'medium';
      case 'render':
        return 'high';
      default:
        return 'low';
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({
      isRecovering: true,
      retryCount: this.state.retryCount + 1
    });

    // Add a delay before retrying to prevent rapid retry loops
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderErrorDetails() {
    if (!this.props.showErrorDetails || !this.state.error) return null;

    return (
      <Stack gap="sm">
        <Text size="sm" fw={600}>Error Details:</Text>
        <Code block>{this.state.error.message}</Code>

        {this.state.error instanceof ChartValidationError && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">Field: {this.state.error.field}</Text>
            <Text size="xs" c="dimmed">Type: {this.state.error.errorType}</Text>
            <Text size="xs" c="dimmed">Value: {JSON.stringify(this.state.error.value)}</Text>
          </Stack>
        )}

        {this.state.error instanceof ChartDataError && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">Data Type: {this.state.error.dataType}</Text>
            <Text size="xs" c="dimmed">
              Validation Errors: {this.state.error.errors.length}
            </Text>
          </Stack>
        )}

        <Text size="xs" c="dimmed">
          Error ID: {this.state.errorId}
        </Text>
      </Stack>
    );
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType();
      const severity = this.getErrorSeverity();
      const canRetry = this.props.enableRetry && this.state.retryCount < this.maxRetries;

      return (
        <Card
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          style={{ minHeight: '300px' }}
        >
          <Stack align="center" justify="center" gap="md" style={{ minHeight: '200px' }}>
            <Group>
              <IconAlertTriangle
                size={48}
                color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'gray'}
              />
              <Stack gap="xs">
                <Text fw={600} size="lg">
                  Chart Error
                </Text>
                <Group gap="xs">
                  <Badge
                    color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'gray'}
                    variant="light"
                  >
                    {severity.toUpperCase()}
                  </Badge>
                  <Badge color="blue" variant="outline">
                    {errorType.toUpperCase()}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Text ta="center" c="dimmed" size="sm" maw={400}>
              {this.state.error instanceof ChartValidationError
                ? `Data validation failed: ${this.state.error.message}`
                : this.state.error instanceof ChartDataError
                ? `Data processing error in ${this.state.error.dataType}: ${this.state.error.message}`
                : 'An unexpected error occurred while rendering the chart. This might be due to invalid data or a temporary issue.'}
            </Text>

            <Group>
              {canRetry && (
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="filled"
                  loading={this.state.isRecovering}
                  onClick={this.handleRetry}
                  size="sm"
                >
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}

              <Button
                leftSection={<IconChartLine size={16} />}
                variant="light"
                onClick={this.handleReload}
                size="sm"
              >
                Reload Page
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  leftSection={<IconBug size={16} />}
                  variant="subtle"
                  onClick={() => console.log('Error state:', this.state)}
                  size="sm"
                >
                  Debug Info
                </Button>
              )}
            </Group>

            {this.state.retryCount >= this.maxRetries && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="red"
                title="Maximum Retries Exceeded"
                maw={400}
              >
                The chart has failed to load after {this.maxRetries} attempts.
                Please refresh the page or contact support if the issue persists.
              </Alert>
            )}

            {this.renderErrorDetails()}
          </Stack>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component for easier usage
interface ChartErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  chartName?: string;
}

export const ChartErrorFallback: React.FC<ChartErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  chartName
}) => {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack align="center" gap="md">
        <IconAlertTriangle size={32} color="orange" />

        <Stack align="center" gap="xs">
          <Text fw={600} size="lg">
            {chartName ? `${chartName} Error` : 'Chart Error'}
          </Text>
          <Text ta="center" c="dimmed" size="sm">
            {error.message}
          </Text>
        </Stack>

        {resetErrorBoundary && (
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={resetErrorBoundary}
            variant="light"
            size="sm"
          >
            Try Again
          </Button>
        )}
      </Stack>
    </Card>
  );
};

// Higher-order component for wrapping charts with error boundaries
export function withChartErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    chartName?: string;
    enableRetry?: boolean;
    showErrorDetails?: boolean;
  } = {}
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithChartErrorBoundaryComponent: React.FC<P> = (props) => {
    return (
      <ChartErrorBoundary
        chartName={options.chartName || displayName}
        enableRetry={options.enableRetry !== false}
        showErrorDetails={options.showErrorDetails || process.env.NODE_ENV === 'development'}
      >
        <WrappedComponent {...props} />
      </ChartErrorBoundary>
    );
  };

  WithChartErrorBoundaryComponent.displayName = `withChartErrorBoundary(${displayName})`;

  return WithChartErrorBoundaryComponent;
}

export default ChartErrorBoundary;