'use client';

import React, { Component, ReactNode } from 'react';
import { Card, Text, Button, Group, Alert } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  onRetry?: () => void;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    console.error('Chart Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // You could also log the error to an error reporting service
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: ChartErrorBoundaryProps, prevState: ChartErrorBoundaryState) {
    // If we had an error and children changed, try to recover
    if (prevState.hasError && this.props.children !== prevProps.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  private logErrorToService = (error: Error, errorInfo: any) => {
    // Here you would typically send the error to a logging service
    // For now, we'll just log it to the console
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, you might send this to services like Sentry, LogRocket, etc.
    console.warn('Error Report:', errorReport);
  };

  private handleRetry = () => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });

      if (onRetry) {
        onRetry();
      }
    }
  };

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state;

    if (!error) return null;

    return (
      <details style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
          <Text size="sm" c="dimmed">Technical Details</Text>
        </summary>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          <Text size="xs" c="red" fw={600}>Error:</Text>
          <Text size="xs" c="dark">{error.message}</Text>
          {error.stack && (
            <>
              <Text size="xs" c="red" fw={600} mt="sm">Stack Trace:</Text>
              <Text size="xs" c="dark">{error.stack}</Text>
            </>
          )}
          {errorInfo?.componentStack && (
            <>
              <Text size="xs" c="red" fw={600} mt="sm">Component Stack:</Text>
              <Text size="xs" c="dark">{errorInfo.componentStack}</Text>
            </>
          )}
        </div>
      </details>
    );
  };

  render() {
    const { children, fallback, title = 'Chart Error' } = this.props;
    const { hasError, error, retryCount } = this.state;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Alert
            icon={<IconAlertTriangle size="1rem" />}
            title={title}
            color="red"
            variant="light"
          >
            <Text size="sm" mb="md">
              {error?.message?.includes('NaN') || error?.message?.includes('non-finite')
                ? 'This chart encountered invalid data values. Please check your data source.'
                : error?.message || 'An unexpected error occurred while rendering this chart.'}
            </Text>

            <Group>
              {retryCount < this.maxRetries && (
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  leftSection={<IconRefresh size="0.875rem" />}
                  onClick={this.handleRetry}
                >
                  Retry ({this.maxRetries - retryCount} attempts left)
                </Button>
              )}

              <Button
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Group>

            {process.env.NODE_ENV === 'development' && this.renderErrorDetails()}
          </Alert>
        </Card>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export const withChartErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ChartErrorBoundaryProps>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ChartErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ChartErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withChartErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithErrorBoundaryComponent;
};

// Hook for handling chart errors in functional components
export const useChartErrorHandler = () => {
  const handleChartError = (error: Error, chartName: string) => {
    console.error(`Chart Error in ${chartName}:`, error);

    // You can extend this to send errors to monitoring services
    if (process.env.NODE_ENV === 'production') {
      // Send to error monitoring service
      // Example: Sentry.captureException(error, { tags: { component: chartName } });
    }
  };

  const safeRender = <T,>(
    renderFn: () => T,
    fallback: T,
    chartName: string
  ): T => {
    try {
      return renderFn();
    } catch (error) {
      handleChartError(error as Error, chartName);
      return fallback;
    }
  };

  return {
    handleChartError,
    safeRender,
  };
};

export default ChartErrorBoundary;