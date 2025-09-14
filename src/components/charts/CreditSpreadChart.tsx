'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from 'recharts';
import { Card, Text, Group, Badge, Select, Stack } from '@mantine/core';
import { Bond, Portfolio } from '@/types/financial';
import { chartTheme, bondRatingColors, getSectorColor } from '@/utils/theme';
import { format, subDays } from 'date-fns';

interface CreditSpreadChartProps {
  portfolio?: Portfolio;
  bonds?: Bond[];
  height?: number;
  interactive?: boolean;
  title?: string;
  timeframe?: '1M' | '3M' | '6M' | '1Y';
  chartType?: 'timeSeries' | 'scatter' | 'distribution';
  onTimeframeChange?: (timeframe: string) => void;
  onChartTypeChange?: (type: string) => void;
}

interface SpreadData {
  date: string;
  formattedDate: string;
  treasuryYield: number;
  averageSpread: number;
  minSpread: number;
  maxSpread: number;
  bondCount: number;
}

interface ScatterData {
  bondName: string;
  duration: number;
  creditSpread: number;
  rating: string;
  sector: string;
  marketValue: number;
  color: string;
}

const CreditSpreadChart: React.FC<CreditSpreadChartProps> = ({
  portfolio,
  bonds = [],
  height = 400,
  interactive = true,
  title = 'Credit Spread Analysis',
  timeframe = '3M',
  chartType = 'timeSeries',
  onTimeframeChange,
  onChartTypeChange,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [randomSeed, setRandomSeed] = useState<number[]>([]);

  const allBonds = useMemo(() => {
    if (portfolio?.positions && Array.isArray(portfolio.positions)) {
      return portfolio.positions.map(p => p.bond);
    }
    return bonds || [];
  }, [portfolio, bonds]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);

    // Generate deterministic random seed based on bonds and timeframe
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;

    // Create a deterministic seed based on bond properties
    const seedBase = allBonds.reduce((sum, bond) => sum + bond.creditSpread + bond.duration, 0) + days;
    const seed: number[] = [];

    for (let i = 0; i <= days * 2; i++) { // Extra for multiple random calls per day
      // Simple pseudo-random number generator with seed
      const x = Math.sin(seedBase + i) * 10000;
      seed.push(x - Math.floor(x));
    }

    setRandomSeed(seed);
  }, [allBonds, timeframe]);

  // Deterministic random function using seed
  const getDeterministicRandom = useCallback((index: number): number => {
    if (!isClient || randomSeed.length === 0) return 0.5; // Default for server-side
    return randomSeed[index % randomSeed.length] || 0.5;
  }, [isClient, randomSeed]);

  // Generate time series data for credit spreads
  const timeSeriesData = useMemo(() => {
    if (!isClient || randomSeed.length === 0) {
      // Return minimal server-side data to prevent hydration mismatch
      const corporateBonds = allBonds.filter(b => b.creditSpread > 0);
      const avgSpread = corporateBonds.length > 0
        ? corporateBonds.reduce((sum, b) => sum + b.creditSpread, 0) / corporateBonds.length
        : 0;

      return [{
        date: '2024-01-01',
        formattedDate: 'Jan 01',
        treasuryYield: 4.2,
        averageSpread: Number(avgSpread.toFixed(1)),
        minSpread: Number((avgSpread * 0.8).toFixed(1)),
        maxSpread: Number((avgSpread * 1.2).toFixed(1)),
        bondCount: corporateBonds.length,
      }];
    }

    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;
    const data: SpreadData[] = [];
    const currentDate = new Date();

    for (let i = days; i >= 0; i--) {
      const date = format(subDays(currentDate, i), 'yyyy-MM-dd');
      const formattedDate = format(subDays(currentDate, i), 'MMM dd');

      // Simulate historical spreads with some volatility using deterministic random
      const corporateBonds = allBonds.filter(b => b.creditSpread > 0);
      const spreads = corporateBonds.map((bond, bondIndex) => {
        const baseSpread = bond.creditSpread;
        const volatility = 0.1; // 10% daily volatility
        const drift = -0.001; // Slight tightening trend
        const dailyChange = (getDeterministicRandom(i + bondIndex * 1000) - 0.5) * volatility + drift;
        return baseSpread * (1 + dailyChange);
      });

      const averageSpread = spreads.length > 0 ? spreads.reduce((sum, s) => sum + s, 0) / spreads.length : 0;
      const minSpread = spreads.length > 0 ? Math.min(...spreads) : 0;
      const maxSpread = spreads.length > 0 ? Math.max(...spreads) : 0;

      data.push({
        date,
        formattedDate,
        treasuryYield: 4.2 + (getDeterministicRandom(i + 5000) - 0.5) * 0.2, // Simulated treasury yield
        averageSpread: Number(averageSpread.toFixed(1)),
        minSpread: Number(minSpread.toFixed(1)),
        maxSpread: Number(maxSpread.toFixed(1)),
        bondCount: corporateBonds.length,
      });
    }

    return data;
  }, [allBonds, timeframe, isClient, randomSeed, getDeterministicRandom]);

  // Prepare scatter plot data
  const scatterData = useMemo(() => {
    return allBonds
      .filter(bond => bond.creditSpread > 0)
      .map(bond => ({
        bondName: bond.name.length > 15 ? bond.name.substring(0, 15) + '...' : bond.name,
        duration: bond.duration,
        creditSpread: bond.creditSpread,
        rating: bond.rating,
        sector: bond.sector,
        marketValue: portfolio
          ? portfolio.positions.find(p => p.bondId === bond.id)?.currentMarketValue || 0
          : bond.marketCap,
        color: getSectorColor(bond.sector),
      }));
  }, [allBonds, portfolio]);

  // Calculate spread distribution by rating
  const spreadByRating = useMemo(() => {
    const ratingGroups: { [rating: string]: number[] } = {};

    allBonds.forEach(bond => {
      if (bond.creditSpread > 0) {
        if (!ratingGroups[bond.rating]) {
          ratingGroups[bond.rating] = [];
        }
        ratingGroups[bond.rating].push(bond.creditSpread);
      }
    });

    return Object.entries(ratingGroups).map(([rating, spreads]) => ({
      rating,
      averageSpread: spreads.reduce((sum, s) => sum + s, 0) / spreads.length,
      minSpread: Math.min(...spreads),
      maxSpread: Math.max(...spreads),
      count: spreads.length,
      color: bondRatingColors[rating as keyof typeof bondRatingColors] || '#868E96',
    }));
  }, [allBonds]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    if (chartType === 'scatter') {
      return (
        <Card shadow="md" p="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <Text fw={600} size="sm" mb={4}>{data.bondName}</Text>
          <Group justify="space-between" gap="xs" mb={2}>
            <Text size="sm">Duration:</Text>
            <Text size="sm" fw={500}>{data.duration.toFixed(1)} years</Text>
          </Group>
          <Group justify="space-between" gap="xs" mb={2}>
            <Text size="sm">Credit Spread:</Text>
            <Text size="sm" fw={500}>{data.creditSpread} bp</Text>
          </Group>
          <Group justify="space-between" gap="xs" mb={2}>
            <Text size="sm">Rating:</Text>
            <Badge size="xs" color={bondRatingColors[data.rating as keyof typeof bondRatingColors] ? 'blue' : 'gray'}>
              {data.rating}
            </Badge>
          </Group>
          <Group justify="space-between" gap="xs">
            <Text size="sm">Sector:</Text>
            <Text size="sm" fw={500}>{data.sector}</Text>
          </Group>
        </Card>
      );
    }

    return (
      <Card shadow="md" p="sm" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
        <Text fw={600} size="sm" mb={4}>{data.formattedDate || data.rating}</Text>
        {payload.map((entry: any, index: number) => (
          <Group key={index} justify="space-between" gap="xs" mb={2}>
            <Text size="sm" c={entry.color}>{entry.name}:</Text>
            <Text size="sm" fw={500}>{entry.value} {entry.name.includes('Yield') ? '%' : 'bp'}</Text>
          </Group>
        ))}
      </Card>
    );
  };

  const formatSpread = (value: number) => `${value}bp`;
  const formatYield = (value: number) => `${value.toFixed(2)}%`;

  const renderChart = () => {
    if (chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={scatterData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} opacity={0.3} />
            <XAxis
              dataKey="duration"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
              label={{ value: 'Duration (Years)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              dataKey="creditSpread"
              tickFormatter={formatSpread}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
              label={{ value: 'Credit Spread (bp)', angle: -90, position: 'insideLeft' }}
            />
            {interactive && <Tooltip content={<CustomTooltip />} />}
            <Scatter dataKey="creditSpread" fill="#8884d8">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'distribution') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={spreadByRating}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} opacity={0.3} />
            <XAxis
              dataKey="rating"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
            />
            <YAxis
              tickFormatter={formatSpread}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
            />
            {interactive && <Tooltip content={<CustomTooltip />} />}
            <Area
              dataKey="averageSpread"
              stroke={chartTheme.colors.primary}
              fill={chartTheme.colors.primary}
              fillOpacity={0.6}
              name="Average Spread"
            />
            <Line
              type="monotone"
              dataKey="maxSpread"
              stroke={chartTheme.colors.loss}
              strokeWidth={2}
              dot={false}
              name="Max Spread"
            />
            <Line
              type="monotone"
              dataKey="minSpread"
              stroke={chartTheme.colors.profit}
              strokeWidth={2}
              dot={false}
              name="Min Spread"
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    // Default: Time series
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={timeSeriesData}
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
            yAxisId="spread"
            orientation="left"
            tickFormatter={formatSpread}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
          />
          <YAxis
            yAxisId="yield"
            orientation="right"
            tickFormatter={formatYield}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.warning, fontSize: 11 }}
          />
          {interactive && <Tooltip content={<CustomTooltip />} />}

          {/* Spread Range Area */}
          <Area
            yAxisId="spread"
            dataKey="maxSpread"
            stackId="1"
            stroke="none"
            fill={chartTheme.colors.primary}
            fillOpacity={0.1}
            name="Spread Range"
          />
          <Area
            yAxisId="spread"
            dataKey="minSpread"
            stackId="1"
            stroke="none"
            fill="white"
            fillOpacity={1}
          />

          {/* Average Spread Line */}
          <Line
            yAxisId="spread"
            type="monotone"
            dataKey="averageSpread"
            stroke={chartTheme.colors.primary}
            strokeWidth={3}
            dot={false}
            name="Average Credit Spread"
          />

          {/* Treasury Yield Line */}
          <Line
            yAxisId="yield"
            type="monotone"
            dataKey="treasuryYield"
            stroke={chartTheme.colors.warning}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Treasury Yield"
          />

          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const corporateBonds = allBonds.filter(b => b.creditSpread > 0);
    if (corporateBonds.length === 0) return null;

    const spreads = corporateBonds.map(b => b.creditSpread);
    const avgSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;
    const minSpread = Math.min(...spreads);
    const maxSpread = Math.max(...spreads);

    return {
      avgSpread: avgSpread.toFixed(0),
      minSpread: minSpread.toFixed(0),
      maxSpread: maxSpread.toFixed(0),
      count: corporateBonds.length,
      tightest: corporateBonds.find(b => b.creditSpread === minSpread)?.name || 'N/A',
      widest: corporateBonds.find(b => b.creditSpread === maxSpread)?.name || 'N/A',
    };
  }, [allBonds]);

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
          <Text c="dimmed">Loading credit spread data...</Text>
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
          {onChartTypeChange && (
            <Select
              value={chartType}
              onChange={(value) => value && onChartTypeChange(value)}
              data={[
                { value: 'timeSeries', label: 'Time Series' },
                { value: 'scatter', label: 'Duration vs Spread' },
                { value: 'distribution', label: 'By Rating' },
              ]}
              size="sm"
              w={140}
            />
          )}
          {onTimeframeChange && chartType === 'timeSeries' && (
            <Select
              value={timeframe}
              onChange={(value) => value && onTimeframeChange(value)}
              data={[
                { value: '1M', label: '1 Month' },
                { value: '3M', label: '3 Months' },
                { value: '6M', label: '6 Months' },
                { value: '1Y', label: '1 Year' },
              ]}
              size="sm"
              w={100}
            />
          )}
        </Group>
      </Group>

      {renderChart()}

      {/* Summary Statistics */}
      {summaryStats && (
        <Group mt="md" justify="space-around" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Average Spread</Text>
            <Text fw={600} size="sm">{summaryStats.avgSpread}bp</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Range</Text>
            <Text fw={600} size="sm">
              {summaryStats.minSpread} - {summaryStats.maxSpread}bp
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Corporate Bonds</Text>
            <Text fw={600} size="sm">{summaryStats.count}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Tightest</Text>
            <Text fw={600} size="sm" title={summaryStats.tightest}>
              {summaryStats.tightest.length > 10
                ? summaryStats.tightest.substring(0, 10) + '...'
                : summaryStats.tightest
              }
            </Text>
          </div>
        </Group>
      )}
    </Card>
  );
};

export default CreditSpreadChart;