'use client';

import React, { useMemo, useState } from 'react';
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

  // Generate and validate historical performance data
  const performanceData = useMemo(() => {
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

    // Deterministic random for consistent results
    const getDeterministicRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = days; i >= 0; i--) {
      let date: string;
      let formattedDate: string;

      try {
        date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        formattedDate = format(subDays(new Date(), i), 'MMM dd');
      } catch (error) {
        console.warn('Date formatting error:', error);
        date = new Date().toISOString().split('T')[0];
        formattedDate = 'Invalid Date';
      }

      // Simulate daily returns with safe calculations
      const dailyVolatility = 0.008; // 0.8% daily volatility
      const benchmarkVolatility = 0.006; // Lower benchmark volatility
      const correlation = 0.7;

      // Generate correlated returns with bounds checking
      const marketShock = Math.max(-2, Math.min(2, (getDeterministicRandom(i) - 0.5) * 2));
      const idiosyncraticShock = Math.max(-2, Math.min(2, (getDeterministicRandom(i + 1000) - 0.5) * 2));

      const benchmarkDailyReturn = safeNumber(marketShock * benchmarkVolatility, 0);
      const portfolioDailyReturn = safeCalculation(
        () => correlation * benchmarkDailyReturn +
              Math.sqrt(Math.max(0, 1 - correlation * correlation)) * idiosyncraticShock * dailyVolatility,
        0,
        'portfolio daily return'
      );

      portfolioValue = safeCalculation(
        () => portfolioValue * (1 + portfolioDailyReturn),
        portfolioValue,
        'portfolio value update'
      );

      benchmarkValue = safeCalculation(
        () => benchmarkValue * (1 + benchmarkDailyReturn),
        benchmarkValue,
        'benchmark value update'
      );

      cumulativeReturn = safePercentageChange(portfolioValue, baseValue, 0);
      benchmarkReturn = safePercentageChange(benchmarkValue, baseValue, 0);

      // Calculate volatility and Sharpe ratio safely
      const annualizedVolatility = safeCalculation(
        () => Math.abs(portfolioDailyReturn) * 100 * Math.sqrt(252),
        10,
        'annualized volatility'
      );

      const sharpeRatio = safeCalculation(
        () => cumulativeReturn / (annualizedVolatility + 0.1),
        0,
        'Sharpe ratio'
      );

      data.push({
        date,
        formattedDate,
        portfolioValue: safeNumber(portfolioValue, baseValue),
        cumulativeReturn: safePercentage(cumulativeReturn, 0),
        dailyReturn: safePercentage(portfolioDailyReturn * 100, 0),
        benchmark: safeNumber(benchmarkValue, baseValue),
        benchmarkReturn: safePercentage(benchmarkReturn, 0),
        yield: safeNumber(baseYield + (getDeterministicRandom(i + 2000) - 0.5) * 0.2, baseYield, { min: 0, max: 20 }),
        duration: safeNumber(baseDuration + (getDeterministicRandom(i + 3000) - 0.5) * 0.5, baseDuration, { min: 0, max: 30 }),
        volatility: safeNumber(annualizedVolatility, 10, { min: 0, max: 100 }),
        sharpeRatio: safeNumber(sharpeRatio, 0, { min: -5, max: 5 }),
      });
    }

    return validateChartData(data, ['date', 'portfolioValue', 'cumulativeReturn']);
  }, [portfolio, timeframe]);

  // Calculate performance statistics with comprehensive validation
  const performanceStats = useMemo(() => {
    if (performanceData.length < 2) return null;

    // Safe max drawdown calculation
    const calculateMaxDrawdown = (returns: number[]): number => {
      if (returns.length === 0) return 0;

      const validReturns = returns.filter(r => isFinite(r));
      if (validReturns.length === 0) return 0;

      let maxDrawdown = 0;
      let peak = validReturns[0];

      for (const ret of validReturns) {
        if (ret > peak) peak = ret;
        const drawdown = Math.max(0, peak - ret);
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }

      return safeNumber(maxDrawdown, 0, { min: 0, max: 100 });
    };

    const returns = performanceData
      .slice(1)
      .map(d => safeNumber(d.dailyReturn, 0))
      .filter(r => isFinite(r));

    const benchmarkReturns = performanceData
      .slice(1)
      .map(d => safeNumber(d.benchmarkReturn, 0))
      .filter(r => isFinite(r));

    if (returns.length === 0) {
      console.warn('PerformanceMetricsChart: No valid return data for statistics');
      return null;
    }

    const totalReturn = safePercentage(
      performanceData[performanceData.length - 1]?.cumulativeReturn,
      0
    );
    const benchmarkTotalReturn = safePercentage(
      performanceData[performanceData.length - 1]?.benchmarkReturn,
      0
    );
    const excessReturn = safeCalculation(
      () => totalReturn - benchmarkTotalReturn,
      0,
      'excess return'
    );

    const volatility = safeVolatility(returns, 10, true);
    const avgReturn = safeCalculation(
      () => (returns.reduce((sum, r) => sum + r, 0) / returns.length) * 252,
      0,
      'average return'
    );
    const sharpeRatio = safeCalculation(
      () => avgReturn / (volatility + 0.01),
      0,
      'Sharpe ratio calculation'
    );

    const maxDrawdown = calculateMaxDrawdown(
      performanceData.map(d => safeNumber(d.cumulativeReturn, 0))
    );
    const winRate = safeCalculation(
      () => (returns.filter(r => r > 0).length / returns.length) * 100,
      50,
      'win rate calculation'
    );

    return {
      totalReturn: safeFormatNumber(totalReturn, 2),
      benchmarkReturn: safeFormatNumber(benchmarkTotalReturn, 2),
      excessReturn: safeFormatNumber(excessReturn, 2),
      volatility: safeFormatNumber(volatility, 2),
      sharpeRatio: safeFormatNumber(sharpeRatio, 2),
      maxDrawdown: safeFormatNumber(maxDrawdown, 2),
      winRate: safeFormatNumber(winRate, 1),
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
                <Text size="sm" fw={500} c={safeNumber(data.cumulativeReturn, 0) >= 0 ? 'green' : 'red'}>
                  {safeFormatPercentage(data.cumulativeReturn, 2, 'N/A')}
                </Text>
              </Group>
              {showBenchmark && (
                <Group justify="space-between" gap="xs" mb={4}>
                  <Text size="sm">Benchmark Return:</Text>
                  <Text size="sm" fw={500} c={safeNumber(data.benchmarkReturn, 0) >= 0 ? 'green' : 'red'}>
                    {safeFormatPercentage(data.benchmarkReturn, 2, 'N/A')}
                  </Text>
                </Group>
              )}
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Daily Return:</Text>
                <Text size="sm" fw={500} c={safeNumber(data.dailyReturn, 0) >= 0 ? 'green' : 'red'}>
                  {safeFormatPercentage(data.dailyReturn, 3, 'N/A')}
                </Text>
              </Group>
              <Group justify="space-between" gap="xs">
                <Text size="sm">Portfolio Value:</Text>
                <Text size="sm" fw={500}>{safeFormatCurrency(data.portfolioValue / 1000000, '$', 1, 'N/A')}M</Text>
              </Group>
            </>
          )}

          {viewMode === 'risk' && (
            <>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Duration:</Text>
                <Text size="sm" fw={500}>{safeFormatNumber(data.duration, 1, 'N/A')} years</Text>
              </Group>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Volatility:</Text>
                <Text size="sm" fw={500}>{safeFormatPercentage(data.volatility, 2, 'N/A')}</Text>
              </Group>
              <Group justify="space-between" gap="xs" mb={4}>
                <Text size="sm">Sharpe Ratio:</Text>
                <Text size="sm" fw={500}>{safeFormatNumber(data.sharpeRatio, 2, 'N/A')}</Text>
              </Group>
              <Group justify="space-between" gap="xs">
                <Text size="sm">Yield:</Text>
                <Text size="sm" fw={500}>{safeFormatPercentage(data.yield, 2, 'N/A')}</Text>
              </Group>
            </>
          )}
        </Card>
      );
    }
    return null;
  };

  const formatReturn = (value: number) => safeFormatPercentage(value, 1, 'N/A');
  const formatValue = (value: number) => safeFormatCurrency(value / 1000000, '$', 1, 'N/A') + 'M';

  const renderChart = () => {
    if (performanceData.length === 0) {
      return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No valid performance data available</Text>
        </div>
      );
    }

    if (viewMode === 'return') {
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
    }

    if (viewMode === 'risk') {
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
    }

    // Attribution view - simplified for this implementation
    return renderChart();
  };

  if (performanceData.length === 0) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No valid performance data available</Text>
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
          {renderChart()}
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
                      value: Math.min(100, Math.max(0, Math.abs(safeNumber(performanceStats.totalReturn, 0)) * 10)),
                      color: safeNumber(performanceStats.totalReturn, 0) >= 0 ? 'green' : 'red',
                    }
                  ]}
                  label={
                    <Text fw={700} ta="center" size="sm">
                      {safeFormatPercentage(performanceStats.totalReturn, 1, 'N/A')}
                    </Text>
                  }
                />
                <Text size="xs" c="dimmed" mt={4}>Total Return</Text>
              </div>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Excess Return:</Text>
                <Text size="sm" fw={500} c={safeNumber(performanceStats.excessReturn, 0) >= 0 ? 'green' : 'red'}>
                  {safeFormatPercentage(performanceStats.excessReturn, 2, 'N/A')}
                </Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Volatility:</Text>
                <Text size="sm" fw={500}>{safeFormatPercentage(performanceStats.volatility, 2, 'N/A')}</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Sharpe Ratio:</Text>
                <Text size="sm" fw={500}>{safeFormatNumber(performanceStats.sharpeRatio, 2, 'N/A')}</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Max Drawdown:</Text>
                <Text size="sm" fw={500} c="red">-{safeFormatPercentage(performanceStats.maxDrawdown, 2, 'N/A')}</Text>
              </Group>

              <Group justify="space-between" mb={8}>
                <Text size="sm" c="dimmed">Win Rate:</Text>
                <Text size="sm" fw={500}>{safeFormatPercentage(performanceStats.winRate, 1, 'N/A')}</Text>
              </Group>

              {showBenchmark && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">vs Benchmark:</Text>
                  <Badge
                    color={safeNumber(performanceStats.excessReturn, 0) >= 0 ? 'green' : 'red'}
                    variant="light"
                    size="sm"
                  >
                    {safeFormatPercentage(performanceStats.excessReturn, 2, 'N/A')}
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