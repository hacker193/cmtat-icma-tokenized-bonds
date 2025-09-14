'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, Text, Group, Badge, SegmentedControl, Select, Grid, RingProgress } from '@mantine/core';
import { Portfolio } from '@/types/financial';
import { chartTheme } from '@/utils/theme';
import { format, subDays, subMonths, addDays } from 'date-fns';
import {
  safeNumber,
  safePercentage,
  safeCalculation,
  safePercentageChange,
  safeVolatility,
  safeSharpeRatio,
  safeFormatPercentage,
  safeFormatCurrency,
  safeFormatNumber,
  validateChartData
} from '@/utils/chartValidation';

interface PerformanceMetricsChartProps {
  portfolio: Portfolio;
  height?: number;
  interactive?: boolean;
  title?: string;
  timeframe?: '1M' | '3M' | '6M' | '1Y' | 'YTD';
  showBenchmark?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

interface PerformanceData {
  date: string;
  formattedDate: string;
  portfolioValue: number;
  cumulativeReturn: number;
  dailyReturn: number;
  benchmark: number;
  benchmarkReturn: number;
  yield: number;
  duration: number;
  volatility: number;
  sharpeRatio: number;
}

interface AttributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  portfolio,
  height = 400,
  interactive = true,
  title = 'Performance Metrics',
  timeframe = '6M',
  showBenchmark = true,
  onTimeframeChange,
}) => {
  const [viewMode, setViewMode] = useState<'return' | 'risk' | 'attribution'>('return');
  const [isClient, setIsClient] = useState(false);
  const [randomSeed, setRandomSeed] = useState<number[]>([]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);

    // Generate deterministic random seed based on portfolio data and timeframe
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 :
                 timeframe === '6M' ? 180 : timeframe === '1Y' ? 365 : 250;

    // Create a deterministic seed based on portfolio properties and timeframe
    const seedBase = portfolio.totalValue + portfolio.totalReturn + days;
    const seed: number[] = [];

    for (let i = 0; i <= days; i++) {
      // Simple pseudo-random number generator with seed
      const x = Math.sin(seedBase + i) * 10000;
      seed.push(x - Math.floor(x));
    }

    setRandomSeed(seed);
  }, [portfolio.totalValue, portfolio.totalReturn, timeframe]);

  // Deterministic random function using seed
  const getDeterministicRandom = useCallback((index: number): number => {
    if (!isClient || randomSeed.length === 0) return 0.5; // Default for server-side
    return randomSeed[index % randomSeed.length] || 0.5;
  }, [isClient, randomSeed]);

  // Generate historical performance data
  const performanceData = useMemo(() => {
    if (!isClient || randomSeed.length === 0) {
      // Return minimal server-side data to prevent hydration mismatch
      return [{
        date: '2024-01-01',
        formattedDate: 'Jan 01',
        portfolioValue: Math.round(portfolio.totalValue),
        cumulativeReturn: Number(portfolio.totalReturn.toFixed(2)),
        dailyReturn: 0,
        benchmark: Math.round(portfolio.totalValue * 0.98),
        benchmarkReturn: Number((portfolio.totalReturn - 2).toFixed(2)),
        yield: Number(portfolio.averageYield.toFixed(2)),
        duration: Number(portfolio.averageDuration.toFixed(1)),
        volatility: 8.5,
        sharpeRatio: 1.2,
      }];
    }

    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 :
                 timeframe === '6M' ? 180 : timeframe === '1Y' ? 365 : 250; // YTD

    const data: PerformanceData[] = [];

    // Safely calculate base value with validation
    const totalValue = safeNumber(portfolio.totalValue, 1000000, { min: 1 });
    const totalReturn = safePercentage(portfolio.totalReturn, 0);
    const baseValue = safeCalculation(
      () => totalValue / (1 + totalReturn / 100),
      totalValue,
      'base value calculation'
    );

    let portfolioValue = baseValue;
    let benchmarkValue = baseValue;
    let cumulativeReturn = 0;
    let benchmarkReturn = 0;

    // Safe portfolio metrics with validation
    const baseYield = safeNumber(portfolio.averageYield, 3, { min: 0, max: 20 });
    const baseDuration = safeNumber(portfolio.averageDuration, 5, { min: 0, max: 30 });

    // Get current date on client side
    const currentDate = new Date();

    for (let i = days; i >= 0; i--) {
      const date = format(subDays(currentDate, i), 'yyyy-MM-dd');
      const formattedDate = format(subDays(currentDate, i), 'MMM dd');

      // Simulate daily returns with some correlation to market using deterministic random
      const dailyVolatility = 0.008; // 0.8% daily volatility
      const benchmarkVolatility = 0.006; // Lower benchmark volatility
      const correlation = 0.7;

      // Generate correlated returns using deterministic random
      const marketShock = (getDeterministicRandom(i) - 0.5) * 2;
      const idiosyncraticShock = (getDeterministicRandom(i + 1000) - 0.5) * 2;

      const benchmarkDailyReturn = marketShock * benchmarkVolatility;
      const portfolioDailyReturn = correlation * benchmarkDailyReturn +
        Math.sqrt(1 - correlation * correlation) * idiosyncraticShock * dailyVolatility;

      portfolioValue *= (1 + portfolioDailyReturn);
      benchmarkValue *= (1 + benchmarkDailyReturn);

      cumulativeReturn = (portfolioValue - baseValue) / baseValue * 100;
      benchmarkReturn = (benchmarkValue - baseValue) / baseValue * 100;

      // Simulate other metrics using deterministic random
      const baseYield = portfolio.averageYield;
      const baseDuration = portfolio.averageDuration;

      data.push({
        date,
        formattedDate,
        portfolioValue: Number(portfolioValue.toFixed(0)),
        cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
        dailyReturn: Number((portfolioDailyReturn * 100).toFixed(3)),
        benchmark: Number(benchmarkValue.toFixed(0)),
        benchmarkReturn: Number(benchmarkReturn.toFixed(2)),
        yield: Number((baseYield + (getDeterministicRandom(i + 2000) - 0.5) * 0.2).toFixed(2)),
        duration: Number((baseDuration + (getDeterministicRandom(i + 3000) - 0.5) * 0.5).toFixed(1)),
        volatility: Number((Math.abs(portfolioDailyReturn) * 100 * Math.sqrt(252)).toFixed(2)),
        sharpeRatio: Number((cumulativeReturn / (Math.abs(portfolioDailyReturn) * 100 * Math.sqrt(252) + 0.1)).toFixed(2)),
      });
    }

    return data;
  }, [portfolio, timeframe, isClient, randomSeed, getDeterministicRandom]);

  // Calculate performance statistics
  const performanceStats = useMemo(() => {
    if (performanceData.length < 2) return null;

    // Utility function for max drawdown calculation
    const calculateMaxDrawdown = (returns: number[]): number => {
      let maxDrawdown = 0;
      let peak = returns[0];

      for (const ret of returns) {
        if (ret > peak) peak = ret;
        const drawdown = peak - ret;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }

      return maxDrawdown;
    };

    const returns = performanceData.slice(1).map(d => d.dailyReturn);
    const benchmarkReturns = performanceData.slice(1).map(d => d.benchmarkReturn);

    const totalReturn = performanceData[performanceData.length - 1].cumulativeReturn;
    const benchmarkTotalReturn = performanceData[performanceData.length - 1].benchmarkReturn;
    const excessReturn = totalReturn - benchmarkTotalReturn;

    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length) * Math.sqrt(252);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 252;
    const sharpeRatio = avgReturn / (volatility + 0.01);

    const maxDrawdown = calculateMaxDrawdown(performanceData.map(d => d.cumulativeReturn));
    const winRate = returns.filter(r => r > 0).length / returns.length * 100;

    return {
      totalReturn: totalReturn.toFixed(2),
      benchmarkReturn: benchmarkTotalReturn.toFixed(2),
      excessReturn: excessReturn.toFixed(2),
      volatility: volatility.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
      winRate: winRate.toFixed(1),
    };
  }, [performanceData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as PerformanceData;
      if (!data) return null;

      return (
        <Card
          shadow="md"
          p="sm"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            minWidth: '250px',
          }}
        >
          <Text fw={600} size="sm" mb={8}>
            {data.formattedDate}
          </Text>

          {viewMode === 'return' && (
            <>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Portfolio Return:</Text>
                <Text size="sm" fw={500} c={data.cumulativeReturn >= 0 ? 'green' : 'red'}>
                  {data.cumulativeReturn >= 0 ? '+' : ''}{data.cumulativeReturn}%
                </Text>
              </Group>
              {showBenchmark && (
                <Group justify="space-between" gap="xs" mb={4}>
                  <Text size="sm">Benchmark Return:</Text>
                  <Text size="sm" fw={500} c={data.benchmarkReturn >= 0 ? 'green' : 'red'}>
                    {data.benchmarkReturn >= 0 ? '+' : ''}{data.benchmarkReturn}%
                  </Text>
                </Group>
              )}
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Daily Return:</Text>
                <Text size="sm" fw={500} c={data.dailyReturn >= 0 ? 'green' : 'red'}>
                  {data.dailyReturn >= 0 ? '+' : ''}{data.dailyReturn}%
                </Text>
              </Group>
              <Group justify="space-between" gap="xs">
                <Text size="sm">Portfolio Value:</Text>
                <Text size="sm" fw={500}>${(data.portfolioValue / 1000000).toFixed(1)}M</Text>
              </Group>
            </>
          )}

          {viewMode === 'risk' && (
            <>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Duration:</Text>
                <Text size="sm" fw={500}>{data.duration} years</Text>
              </Group>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Volatility:</Text>
                <Text size="sm" fw={500}>{data.volatility}%</Text>
              </Group>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Sharpe Ratio:</Text>
                <Text size="sm" fw={500}>{data.sharpeRatio}</Text>
              </Group>
              <Group justify="space-between" gap="xs">
                <Text size="sm">Yield:</Text>
                <Text size="sm" fw={500}>{data.yield}%</Text>
              </Group>
            </>
          )}
        </Card>
      );
    }
    return null;
  };

  const formatReturn = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const formatValue = (value: number) => `$${(value / 1000000).toFixed(1)}M`;

  // Generate attribution data
  const attributionData = useMemo((): AttributionData[] => {
    if (!performanceData || performanceData.length === 0) return [];

    const latestData = performanceData[performanceData.length - 1];
    const totalReturn = latestData.cumulativeReturn;
    const benchmarkReturn = latestData.benchmarkReturn;
    const excessReturn = totalReturn - benchmarkReturn;

    // Simulate attribution analysis components
    const attributionColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    const components = [
      {
        name: 'Asset Allocation',
        value: excessReturn * 0.4,
        percentage: 40,
        color: attributionColors[0],
      },
      {
        name: 'Security Selection',
        value: excessReturn * 0.3,
        percentage: 30,
        color: attributionColors[1],
      },
      {
        name: 'Duration Management',
        value: excessReturn * 0.15,
        percentage: 15,
        color: attributionColors[2],
      },
      {
        name: 'Currency Effect',
        value: excessReturn * 0.1,
        percentage: 10,
        color: attributionColors[3],
      },
      {
        name: 'Residual',
        value: excessReturn * 0.05,
        percentage: 5,
        color: attributionColors[4],
      },
    ];

    return components;
  }, [performanceData]);

  const renderReturnChart = useCallback(() => {
    if (!performanceData || performanceData.length === 0) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No performance data available</Text>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={performanceData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} opacity={0.3} />

          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 10 }}
            interval="preserveStartEnd"
          />

          <YAxis
            yAxisId="return"
            orientation="left"
            tickFormatter={formatReturn}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
          />

          <YAxis
            yAxisId="value"
            orientation="right"
            tickFormatter={formatValue}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.primary, fontSize: 11 }}
          />

          {interactive && <Tooltip content={<CustomTooltip />} />}

          {/* Zero reference line */}
          <ReferenceLine
            yAxisId="return"
            y={0}
            stroke={chartTheme.colors.text}
            strokeDasharray="2 2"
            opacity={0.5}
          />

          {/* Portfolio return area */}
          <Area
            yAxisId="return"
            type="monotone"
            dataKey="cumulativeReturn"
            fill={chartTheme.colors.primary}
            fillOpacity={0.1}
            stroke="none"
            name="Portfolio Return"
          />

          {/* Portfolio return line */}
          <Line
            yAxisId="return"
            type="monotone"
            dataKey="cumulativeReturn"
            stroke={chartTheme.colors.primary}
            strokeWidth={3}
            dot={false}
            name="Portfolio Return"
          />

          {/* Benchmark line */}
          {showBenchmark && (
            <Line
              yAxisId="return"
              type="monotone"
              dataKey="benchmarkReturn"
              stroke={chartTheme.colors.warning}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Benchmark"
            />
          )}

          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }, [performanceData, height, interactive, showBenchmark]);

  const renderRiskChart = useCallback(() => {
    if (!performanceData || performanceData.length === 0) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No risk data available</Text>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={performanceData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} opacity={0.3} />

          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 10 }}
            interval="preserveStartEnd"
          />

          <YAxis
            yAxisId="duration"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
            label={{ value: 'Duration (Years)', angle: -90, position: 'insideLeft' }}
          />

          <YAxis
            yAxisId="ratio"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.profit, fontSize: 11 }}
            label={{ value: 'Sharpe Ratio', angle: 90, position: 'insideRight' }}
          />

          {interactive && <Tooltip content={<CustomTooltip />} />}

          {/* Duration bars */}
          <Bar
            yAxisId="duration"
            dataKey="duration"
            fill={chartTheme.colors.primary}
            opacity={0.6}
            name="Duration"
          />

          {/* Sharpe ratio line */}
          <Line
            yAxisId="ratio"
            type="monotone"
            dataKey="sharpeRatio"
            stroke={chartTheme.colors.profit}
            strokeWidth={2}
            dot={false}
            name="Sharpe Ratio"
          />

          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }, [performanceData, height, interactive]);

  const renderAttributionChart = useCallback(() => {
    if (!attributionData || attributionData.length === 0) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No attribution data available</Text>
        </div>
      );
    }

    const CustomAttributionTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload as AttributionData;
        return (
          <Card
            shadow="md"
            p="sm"
            style={{
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              minWidth: '200px',
            }}
          >
            <Text fw={600} size="sm" mb={8}>
              {data.name}
            </Text>
            <Group justify="space-between" gap="xs" mb={4}>
              <Text size="sm">Contribution:</Text>
              <Text size="sm" fw={500} c={data.value >= 0 ? 'green' : 'red'}>
                {data.value >= 0 ? '+' : ''}{data.value.toFixed(2)}%
              </Text>
            </Group>
            <Group justify="space-between" gap="xs">
              <Text size="sm">Weight:</Text>
              <Text size="sm" fw={500}>{data.percentage}%</Text>
            </Group>
          </Card>
        );
      }
      return null;
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
        <div style={{ width: '50%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {attributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomAttributionTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '50%', padding: '0 1rem' }}>
          <Text fw={600} size="lg" mb="md">Performance Attribution</Text>
          {attributionData.map((item, index) => (
            <Group key={index} justify="space-between" mb="sm">
              <Group>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: item.color,
                    borderRadius: 2,
                  }}
                />
                <Text size="sm">{item.name}</Text>
              </Group>
              <Text size="sm" fw={500} c={item.value >= 0 ? 'green' : 'red'}>
                {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%
              </Text>
            </Group>
          ))}
        </div>
      </div>
    );
  }, [attributionData, height]);

  const renderChart = useCallback(() => {
    try {
      switch (viewMode) {
        case 'return':
          return renderReturnChart();
        case 'risk':
          return renderRiskChart();
        case 'attribution':
          return renderAttributionChart();
        default:
          return renderReturnChart();
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="red">Error loading chart. Please try again.</Text>
        </div>
      );
    }
  }, [viewMode, renderReturnChart, renderRiskChart, renderAttributionChart, height]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg">
            {title}
          </Text>
        </Group>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">Loading performance data...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Group>
          {onTimeframeChange && (
            <Select
              value={timeframe}
              onChange={(value) => value && onTimeframeChange(value)}
              data={[
                { value: '1M', label: '1 Month' },
                { value: '3M', label: '3 Months' },
                { value: '6M', label: '6 Months' },
                { value: '1Y', label: '1 Year' },
                { value: 'YTD', label: 'YTD' },
              ]}
              size="sm"
              w={100}
            />
          )}
        </Group>
      </Group>

      <SegmentedControl
        value={viewMode}
        onChange={(value) => setViewMode(value as any)}
        data={[
          { label: 'Returns', value: 'return' },
          { label: 'Risk', value: 'risk' },
          { label: 'Attribution', value: 'attribution' },
        ]}
        mb="md"
        size="sm"
      />

      <Grid>
        <Grid.Col span={8}>
          <ChartErrorBoundary
            fallback={
              <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="red">Chart failed to render. Please refresh the page.</Text>
              </div>
            }
          >
            {renderChart()}
          </ChartErrorBoundary>
        </Grid.Col>

        {/* Performance Statistics */}
        <Grid.Col span={4}>
          {performanceStats && (
            <div style={{ padding: '1rem 0' }}>
              <Text fw={600} size="sm" mb="md">Performance Summary</Text>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <RingProgress
                  size={100}
                  thickness={8}
                  sections={[
                    {
                      value: Math.abs(parseFloat(performanceStats.totalReturn)) > 10 ? 100 :
                            Math.abs(parseFloat(performanceStats.totalReturn)) * 10,
                      color: parseFloat(performanceStats.totalReturn) >= 0 ? 'green' : 'red',
                    }
                  ]}
                  label={
                    <Text fw={700} ta="center" size="sm">
                      {performanceStats.totalReturn}%
                    </Text>
                  }
                />
                <Text size="xs" c="dimmed" mt={4}>Total Return</Text>
              </div>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Excess Return:</Text>
                <Text size="sm" fw={500} c={parseFloat(performanceStats.excessReturn) >= 0 ? 'green' : 'red'}>
                  {performanceStats.excessReturn}%
                </Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Volatility:</Text>
                <Text size="sm" fw={500}>{performanceStats.volatility}%</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Sharpe Ratio:</Text>
                <Text size="sm" fw={500}>{performanceStats.sharpeRatio}</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Max Drawdown:</Text>
                <Text size="sm" fw={500} c="red">-{performanceStats.maxDrawdown}%</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Win Rate:</Text>
                <Text size="sm" fw={500}>{performanceStats.winRate}%</Text>
              </Group>

              {showBenchmark && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">vs Benchmark:</Text>
                  <Badge
                    color={parseFloat(performanceStats.excessReturn) >= 0 ? 'green' : 'red'}
                    variant="light"
                    size="sm"
                  >
                    {parseFloat(performanceStats.excessReturn) >= 0 ? '+' : ''}
                    {performanceStats.excessReturn}%
                  </Badge>
                </Group>
              )}
            </div>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default PerformanceMetricsChart;