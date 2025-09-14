'use client';

import React, { useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Text, Group, Badge } from '@mantine/core';
import { YieldCurvePoint } from '@/types/financial';
import { chartTheme } from '@/utils/theme';

// Import our error handling system
import { ChartErrorBoundary, withChartErrorBoundary } from '@/components/errors/ChartErrorBoundary';
import { ChartLoadingManager, useChartLoadingState } from '@/components/loading/ChartLoadingManager';
import { useYieldCurveValidation } from '@/hooks/useChartValidation';
import { useChartErrorHandling } from '@/hooks/useChartErrorHandling';
import { validateChartData } from '@/utils/chartValidation';

interface EnhancedYieldCurveChartProps {
  data: YieldCurvePoint[];
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  title?: string;
  compareData?: YieldCurvePoint[];
  loadingState?: {
    isLoading?: boolean;
    isError?: boolean;
    error?: Error;
  };
  onDataFetch?: () => Promise<YieldCurvePoint[]>;
  enableErrorRecovery?: boolean;
}

const YieldCurveChartCore: React.FC<EnhancedYieldCurveChartProps> = ({
  data,
  height = 400,
  showLegend = true,
  interactive = true,
  title = 'Yield Curve',
  compareData,
  loadingState,
  onDataFetch,
  enableErrorRecovery = true
}) => {
  // Initialize comprehensive error handling
  const errorHandling = useChartErrorHandling({
    chartName: 'YieldCurveChart',
    enableRetry: enableErrorRecovery,
    enableCircuitBreaker: true,
    enableCaching: true,
    enablePerformanceTracking: true,
    enableValidation: true
  });

  const {
    loadingState: managedLoadingState,
    fetchDataWithRecovery,
    startRender,
    endRender,
    profileOperation
  } = errorHandling;

  // Use validation hook for comprehensive data validation
  const validation = useYieldCurveValidation(data);
  const compareValidation = compareData ? useYieldCurveValidation(compareData) : null;

  // Track render performance
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  }, [data, compareData, startRender, endRender]);

  // Transform and process data with error handling
  const { chartData, processedData } = useMemo(() => {
    const profiler = profileOperation('data-processing');

    try {
      // Use validated data from validation hook
      const validatedData = validation.data;
      const validatedCompareData = compareValidation?.data || [];

      if (validatedData.length === 0) {
        return { chartData: [], processedData: null };
      }

      // Transform data for Recharts with safe operations
      const processedData = (Array.isArray(validatedData) ? validatedData : []).map(point => ({
        maturity: point.maturity,
        maturityLabel: point.maturity < 1
          ? `${Math.round(point.maturity * 12)}M`
          : `${point.maturity}Y`,
        yield: Number(point.yield.toFixed(3)),
        curveType: point.curveType,
        // Add additional safety checks
        isValid: point.yield >= 0 && point.yield <= 20 && point.maturity > 0
      })).filter(point => point.isValid); // Filter out invalid points

      // Merge with comparison data if available
      let finalChartData = processedData;

      if (validatedCompareData.length > 0) {
        const compareProcessed = (Array.isArray(validatedCompareData) ? validatedCompareData : []).map(point => ({
          maturity: point.maturity,
          maturityLabel: point.maturity < 1
            ? `${Math.round(point.maturity * 12)}M`
            : `${point.maturity}Y`,
          compareYield: Number(point.yield.toFixed(3)),
          curveType: point.curveType,
        }));

        // Merge by maturity with safe lookup
        finalChartData = (Array.isArray(processedData) ? processedData : []).map(item => {
          const compareItem = compareProcessed.find(c =>
            Math.abs(c.maturity - item.maturity) < 0.01 // Allow small floating point differences
          );
          return {
            ...item,
            compareYield: compareItem?.compareYield,
          };
        });
      }

      const result = {
        chartData: finalChartData.sort((a, b) => a.maturity - b.maturity), // Ensure proper ordering
        processedData: {
          dataPoints: finalChartData.length,
          maturityRange: {
            min: finalChartData.length > 0 ? Math.min(...finalChartData.map(d => d?.maturity || 0)) : 0,
            max: finalChartData.length > 0 ? Math.max(...finalChartData.map(d => d?.maturity || 0)) : 0
          },
          yieldRange: {
            min: finalChartData.length > 0 ? Math.min(...finalChartData.map(d => d?.yield || 0)) : 0,
            max: finalChartData.length > 0 ? Math.max(...finalChartData.map(d => d?.yield || 0)) : 0
          }
        }
      };

      profiler.end();
      return result;

    } catch (error) {
      profiler.end();
      errorHandling.handleError(error as Error, { operation: 'data-processing' });
      return { chartData: [], processedData: null };
    }
  }, [validation.data, compareValidation?.data, profileOperation, errorHandling]);

  // Enhanced tooltip with error handling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    try {
      return (
        <Card
          shadow="md"
          p="sm"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
          }}
        >
          <Text fw={600} size="sm" mb={4}>
            Maturity: {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Group key={index} justify="space-between" gap="xs">
              <Text size="sm" c={entry.color}>
                {entry.dataKey === 'yield' ? 'Treasury Yield' :
                 entry.dataKey === 'compareYield' ? 'Corporate Yield' :
                 entry.name}:
              </Text>
              <Text size="sm" fw={500}>
                {entry.value?.toFixed ? entry.value.toFixed(2) : 'N/A'}%
              </Text>
            </Group>
          ))}
          {payload[0] && payload[1] && payload[0].value && payload[1].value && (
            <Group justify="space-between" gap="xs" mt={4} pt={4} style={{ borderTop: '1px solid #e9ecef' }}>
              <Text size="sm" c="dimmed">
                Spread:
              </Text>
              <Text size="sm" fw={500} c={payload[1].value - payload[0].value > 0 ? 'red' : 'green'}>
                {Math.abs(payload[1].value - payload[0].value).toFixed(2)}bp
              </Text>
            </Group>
          )}
        </Card>
      );
    } catch (error) {
      errorHandling.handleError(error as Error, { operation: 'tooltip-render' });
      return null;
    }
  };

  const formatYAxis = (value: number) => {
    try {
      return `${(value || 0).toFixed(2)}%`;
    } catch {
      return '0.00%';
    }
  };

  // Safe color selection
  const curveColor = useMemo(() => {
    try {
      const curveType = validation.data[0]?.curveType;
      return curveType === 'treasury' ? chartTheme.colors.primary :
             curveType === 'corporate' ? chartTheme.colors.warning :
             chartTheme.colors.stable;
    } catch {
      return chartTheme.colors.primary;
    }
  }, [validation.data]);

  // Calculate summary statistics with error handling
  const summaryStats = useMemo(() => {
    try {
      if (chartData.length === 0) {
        return {
          y2: 'N/A',
          y10: 'N/A',
          spread: 'N/A',
          shape: 'Unknown'
        };
      }

      const y2Data = chartData.find(d => Math.abs(d.maturity - 2) < 0.5);
      const y10Data = chartData.find(d => Math.abs(d.maturity - 10) < 0.5);

      const y2 = y2Data?.yield || 0;
      const y10 = y10Data?.yield || 0;
      const spread = y10 - y2;

      return {
        y2: y2Data ? y2.toFixed(2) : 'N/A',
        y10: y10Data ? y10.toFixed(2) : 'N/A',
        spread: y2Data && y10Data ? spread.toFixed(0) : 'N/A',
        shape: spread > 50 ? 'Normal' : spread > 0 ? 'Flat' : 'Inverted'
      };
    } catch (error) {
      errorHandling.handleError(error as Error, { operation: 'summary-calculation' });
      return {
        y2: 'N/A',
        y10: 'N/A',
        spread: 'N/A',
        shape: 'Error'
      };
    }
  }, [chartData, errorHandling]);

  // Handle external loading state
  const finalLoadingState = loadingState ? {
    isLoading: loadingState.isLoading || false,
    isError: loadingState.isError || false,
    isRetrying: false,
    error: loadingState.error
  } : managedLoadingState;

  // Show validation warnings in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (validation.warnings.length > 0) {
        console.warn('YieldCurveChart validation warnings:', validation.warnings);
      }
      if (validation.errors.length > 0) {
        console.error('YieldCurveChart validation errors:', validation.errors);
      }
    }
  }, [validation.warnings, validation.errors]);

  return (
    <ChartLoadingManager
      loadingState={finalLoadingState}
      chartName="Yield Curve Chart"
      height={height}
      skeletonVariant="line"
      showProgress={false}
    >
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Text fw={600} size="lg">
              {title}
            </Text>
            {!validation.isValid && (
              <Badge color="yellow" variant="light">
                Data Issues
              </Badge>
            )}
          </Group>
          {validation.data[0]?.curveType && (
            <Badge
              color={validation.data[0].curveType === 'treasury' ? 'blue' :
                     validation.data[0].curveType === 'corporate' ? 'orange' : 'gray'}
              variant="light"
            >
              {validation.data[0].curveType.charAt(0).toUpperCase() +
               validation.data[0].curveType.slice(1)}
            </Badge>
          )}
        </Group>

        {chartData.length === 0 ? (
          <div style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <Text>No valid data available</Text>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartTheme.colors.grid}
                opacity={0.5}
              />
              <XAxis
                dataKey="maturityLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.colors.text, fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.colors.text, fontSize: 12 }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              {interactive && <Tooltip content={<CustomTooltip />} />}

              <Line
                type="monotone"
                dataKey="yield"
                stroke={curveColor}
                strokeWidth={3}
                dot={{
                  fill: curveColor,
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: curveColor,
                  strokeWidth: 2,
                }}
                name="Primary Curve"
                connectNulls={false}
              />

              {compareData && (
                <Line
                  type="monotone"
                  dataKey="compareYield"
                  stroke={chartTheme.colors.warning}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{
                    fill: chartTheme.colors.warning,
                    strokeWidth: 2,
                    r: 3,
                  }}
                  name="Compare Curve"
                  connectNulls={false}
                />
              )}

              {showLegend && <Legend />}
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Enhanced Summary Statistics */}
        <Group mt="md" justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">2Y Yield</Text>
            <Text fw={600} size="sm">
              {summaryStats.y2}%
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">10Y Yield</Text>
            <Text fw={600} size="sm">
              {summaryStats.y10}%
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">2Y-10Y Spread</Text>
            <Text fw={600} size="sm">
              {summaryStats.spread}bp
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Curve Shape</Text>
            <Text fw={600} size="sm">
              {summaryStats.shape}
            </Text>
          </div>
          {processedData && (
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Data Points</Text>
              <Text fw={600} size="sm">
                {processedData.dataPoints}
              </Text>
            </div>
          )}
        </Group>

        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <Group mt="xs" justify="center">
            <Text size="xs" c="dimmed">
              Validation: {validation.isValid ? '✓' : '✗'} |
              Errors: {validation.errors.length} |
              Warnings: {validation.warnings.length}
            </Text>
          </Group>
        )}
      </Card>
    </ChartLoadingManager>
  );
};

// Export the enhanced component wrapped with error boundary
export const EnhancedYieldCurveChart = withChartErrorBoundary(YieldCurveChartCore, {
  chartName: 'YieldCurveChart',
  enableRetry: true,
  showErrorDetails: process.env.NODE_ENV === 'development'
});

export default EnhancedYieldCurveChart;