'use client';

import React, { ReactNode } from 'react';
import { Card, Text, Group, Loader, Progress, Stack, Alert } from '@mantine/core';
import { IconChartLine, IconAlertCircle, IconWifi, IconWifiOff } from '@tabler/icons-react';
import ChartSkeleton from './ChartSkeleton';

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  progress?: number;
  message?: string;
  error?: Error;
  retryCount?: number;
  networkIssue?: boolean;
}

interface ChartLoadingManagerProps {
  children: ReactNode;
  loadingState: LoadingState;
  chartName?: string;
  height?: number;
  skeletonVariant?: 'line' | 'bar' | 'pie' | 'heatmap' | 'orderbook';
  showProgress?: boolean;
  customLoadingMessage?: string;
  enableOfflineMode?: boolean;
}

export const ChartLoadingManager: React.FC<ChartLoadingManagerProps> = ({
  children,
  loadingState,
  chartName = 'Chart',
  height = 400,
  skeletonVariant = 'line',
  showProgress = false,
  customLoadingMessage,
  enableOfflineMode = false
}) => {
  const {
    isLoading,
    isError,
    isRetrying,
    progress,
    message,
    error,
    retryCount,
    networkIssue
  } = loadingState;

  // Show loading state
  if (isLoading || isRetrying) {
    return (
      <LoadingComponent
        chartName={chartName}
        height={height}
        skeletonVariant={skeletonVariant}
        showProgress={showProgress}
        progress={progress}
        message={message || customLoadingMessage}
        isRetrying={isRetrying}
        retryCount={retryCount}
      />
    );
  }

  // Show error state
  if (isError) {
    return (
      <ErrorComponent
        chartName={chartName}
        height={height}
        error={error}
        networkIssue={networkIssue}
        enableOfflineMode={enableOfflineMode}
      />
    );
  }

  // Show the chart content
  return <>{children}</>;
};

interface LoadingComponentProps {
  chartName: string;
  height: number;
  skeletonVariant: 'line' | 'bar' | 'pie' | 'heatmap' | 'orderbook';
  showProgress: boolean;
  progress?: number;
  message?: string;
  isRetrying: boolean;
  retryCount?: number;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  chartName,
  height,
  skeletonVariant,
  showProgress,
  progress,
  message,
  isRetrying,
  retryCount
}) => {
  // Use skeleton for better UX during initial load
  if (!isRetrying && !showProgress) {
    return (
      <ChartSkeleton
        height={height}
        variant={skeletonVariant}
        withTitle={true}
        withLegend={false}
        withSummary={true}
      />
    );
  }

  // Show detailed loading state with progress
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder style={{ minHeight: height }}>
      <Stack align="center" justify="center" gap="md" style={{ minHeight: height - 40 }}>
        <Group gap="md">
          <Loader size="lg" />
          <Stack gap="xs">
            <Text fw={600} size="lg">
              {isRetrying ? 'Retrying...' : 'Loading'} {chartName}
            </Text>
            {isRetrying && retryCount && (
              <Text size="sm" c="dimmed">
                Attempt {retryCount}
              </Text>
            )}
          </Stack>
        </Group>

        {message && (
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            {message}
          </Text>
        )}

        {showProgress && progress !== undefined && (
          <Stack gap="xs" style={{ width: '100%', maxWidth: 300 }}>
            <Progress value={progress} size="sm" radius="xl" />
            <Text size="xs" c="dimmed" ta="center">
              {Math.round(progress)}% complete
            </Text>
          </Stack>
        )}

        {!showProgress && (
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              Fetching market data...
            </Text>
            <Group gap="xs">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#228be6',
                    animation: `pulse 1.5s infinite ${index * 0.2}s`,
                    opacity: 0.3
                  }}
                />
              ))}
            </Group>
          </Stack>
        )}
      </Stack>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </Card>
  );
};

interface ErrorComponentProps {
  chartName: string;
  height: number;
  error?: Error;
  networkIssue?: boolean;
  enableOfflineMode: boolean;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  chartName,
  height,
  error,
  networkIssue,
  enableOfflineMode
}) => {
  const getErrorMessage = () => {
    if (networkIssue) {
      return enableOfflineMode
        ? 'Network connection lost. Showing cached data if available.'
        : 'Unable to connect to data source. Please check your internet connection.';
    }

    if (error?.message) {
      return `Failed to load ${chartName.toLowerCase()}: ${error.message}`;
    }

    return `Unable to load ${chartName.toLowerCase()}. Please try refreshing the page.`;
  };

  const getIcon = () => {
    if (networkIssue) {
      return enableOfflineMode ? <IconWifiOff size={24} /> : <IconWifi size={24} />;
    }
    return <IconAlertCircle size={24} />;
  };

  const getColor = () => {
    if (networkIssue && enableOfflineMode) return 'yellow';
    if (networkIssue) return 'orange';
    return 'red';
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder style={{ minHeight: height }}>
      <Stack align="center" justify="center" gap="md" style={{ minHeight: height - 40 }}>
        <Alert
          icon={getIcon()}
          color={getColor()}
          title="Data Loading Issue"
          style={{ maxWidth: 400 }}
        >
          {getErrorMessage()}
        </Alert>

        {networkIssue && !enableOfflineMode && (
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            Data will automatically refresh when connection is restored.
          </Text>
        )}
      </Stack>
    </Card>
  );
};

// Hook for managing chart loading states
export const useChartLoadingState = (initialState?: Partial<LoadingState>) => {
  const [loadingState, setLoadingState] = React.useState<LoadingState>({
    isLoading: false,
    isError: false,
    isRetrying: false,
    progress: undefined,
    message: undefined,
    error: undefined,
    retryCount: 0,
    networkIssue: false,
    ...initialState
  });

  const setLoading = React.useCallback((loading: boolean, message?: string, progress?: number) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: loading,
      isError: false,
      message,
      progress,
      error: undefined
    }));
  }, []);

  const setError = React.useCallback((error: Error, networkIssue: boolean = false) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      isError: true,
      isRetrying: false,
      error,
      networkIssue,
      progress: undefined
    }));
  }, []);

  const setRetrying = React.useCallback((retryCount: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      isError: false,
      isRetrying: true,
      retryCount,
      message,
      progress: undefined
    }));
  }, []);

  const clearState = React.useCallback(() => {
    setLoadingState({
      isLoading: false,
      isError: false,
      isRetrying: false,
      progress: undefined,
      message: undefined,
      error: undefined,
      retryCount: 0,
      networkIssue: false
    });
  }, []);

  const updateProgress = React.useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      message: message || prev.message
    }));
  }, []);

  return {
    loadingState,
    setLoading,
    setError,
    setRetrying,
    clearState,
    updateProgress
  };
};

// Higher-order component for adding loading states to charts
export function withLoadingState<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    chartName?: string;
    skeletonVariant?: 'line' | 'bar' | 'pie' | 'heatmap' | 'orderbook';
    height?: number;
  } = {}
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithLoadingStateComponent: React.FC<P & { loadingState?: LoadingState }> = ({
    loadingState,
    ...props
  }) => {
    const defaultLoadingState: LoadingState = {
      isLoading: false,
      isError: false,
      isRetrying: false
    };

    return (
      <ChartLoadingManager
        loadingState={loadingState || defaultLoadingState}
        chartName={options.chartName || displayName}
        skeletonVariant={options.skeletonVariant}
        height={options.height}
      >
        <WrappedComponent {...(props as P)} />
      </ChartLoadingManager>
    );
  };

  WithLoadingStateComponent.displayName = `withLoadingState(${displayName})`;

  return WithLoadingStateComponent;
}

export default ChartLoadingManager;