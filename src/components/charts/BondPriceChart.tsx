'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Text, Group, Badge, Select } from '@mantine/core';
import { PriceHistory } from '@/types/financial';
import { chartTheme } from '@/utils/theme';
import { format } from 'date-fns';
import {
  validateChartData,
  safeNumber,
  safePrice,
  safeYield,
  safeVolume,
  safePercentageChange,
  safeFormatCurrency,
  safeFormatPercentage,
  safeFormatNumber
} from '@/utils/chartValidation';

interface BondPriceChartProps {
  data: PriceHistory[];
  height?: number;
  showVolume?: boolean;
  showYield?: boolean;
  interactive?: boolean;
  title?: string;
  period?: '1W' | '1M' | '3M' | '6M' | '1Y';
  onPeriodChange?: (period: string) => void;
}

const BondPriceChart: React.FC<BondPriceChartProps> = ({
  data,
  height = 400,
  showVolume = true,
  showYield = true,
  interactive = true,
  title = 'Bond Price Movement',
  period = '1M',
  onPeriodChange,
}) => {
  // Process and validate data for chart
  const chartData = useMemo(() => {
    const validatedData = validateChartData(data, ['timestamp', 'price', 'volume', 'yieldToMaturity']);

    if (validatedData.length === 0) {
      console.warn('BondPriceChart: No valid data points available');
      return [];
    }

    try {
      const safeValidatedData = Array.isArray(validatedData) ? validatedData : [];
      return safeValidatedData
        .sort((a, b) => {
          try {
            return new Date(a?.timestamp || 0).getTime() - new Date(b?.timestamp || 0).getTime();
          } catch {
            return 0;
          }
        })
        .map((point, index) => {
        const currentPrice = safePrice(point.price, 100);
        const previousPrice = index > 0 ? safePrice(validatedData[index - 1].price, 100) : currentPrice;
        const volume = safeVolume(point.volume, 0);
        const yieldValue = safeYield(point.yieldToMaturity, 0);

        // Safe date formatting with fallback
        let formattedDate = 'Invalid Date';
        let shortDate = 'Invalid';
        try {
          const date = new Date(point.timestamp);
          if (!isNaN(date.getTime())) {
            formattedDate = format(date, 'MMM dd');
            shortDate = format(date, 'MM/dd');
          }
        } catch (error) {
          console.warn('Date formatting error:', error);
        }

        return {
          ...point,
          price: currentPrice,
          volume,
          yieldToMaturity: yieldValue,
          formattedDate,
          shortDate,
          volumeMillions: safeNumber(volume / 1000000, 0),
          priceChange: index > 0 ? safeNumber(currentPrice - previousPrice, 0) : 0,
          priceChangePercent: index > 0 ? safePercentageChange(currentPrice, previousPrice, 0) : 0,
        };
      });
    } catch (error) {
      console.warn('BondPriceChart: Error processing data:', error);
      return [];
    }
  }, [data]);

  // Calculate performance metrics with validation
  const performanceMetrics = useMemo(() => {
    if (chartData.length < 2) return null;

    const firstPrice = safePrice(chartData[0]?.price, 100);
    const lastPrice = safePrice(chartData[chartData.length - 1]?.price, 100);
    const priceChange = safeNumber(lastPrice - firstPrice, 0);
    const priceChangePercent = safePercentageChange(lastPrice, firstPrice, 0);

    const validPrices = (Array.isArray(chartData) ? chartData : [])
      .map(d => safePrice(d?.price, null))
      .filter(p => p !== null && isFinite(p)) as number[];
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : firstPrice;
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : firstPrice;

    const totalVolume = (Array.isArray(chartData) ? chartData : [])
      .reduce((sum, d) => sum + safeVolume(d?.volume, 0), 0);
    const avgVolume = chartData.length > 0 ? safeNumber(totalVolume / chartData.length, 0) : 0;

    return {
      priceChange: safeNumber(priceChange, 0),
      priceChangePercent: safeNumber(priceChangePercent, 0),
      maxPrice: safePrice(maxPrice, firstPrice),
      minPrice: safePrice(minPrice, firstPrice),
      volatility: safeNumber(maxPrice - minPrice, 0),
      totalVolume: safeVolume(totalVolume, 0),
      avgVolume: safeVolume(avgVolume, 0),
      currentYield: safeYield(chartData[chartData.length - 1]?.yieldToMaturity, 0),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

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
            {data.formattedDate}
          </Text>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Price:</Text>
            <Text size="sm" fw={500}>{safeFormatCurrency(data.price, '$', 2, 'N/A')}</Text>
          </Group>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Change:</Text>
            <Text
              size="sm"
              fw={500}
              c={safeNumber(data.priceChange, 0) >= 0 ? 'green' : 'red'}
            >
              {safeFormatCurrency(data.priceChange, safeNumber(data.priceChange, 0) >= 0 ? '+$' : '-$', 2, 'N/A')}
              ({safeFormatPercentage(data.priceChangePercent, 2, 'N/A')})
            </Text>
          </Group>

          {showYield && (
            <Group justify="space-between" gap="xs" mb={4}>
              <Text size="sm">Yield:</Text>
              <Text size="sm" fw={500}>{safeFormatPercentage(data.yieldToMaturity, 2, 'N/A')}</Text>
            </Group>
          )}

          {showVolume && (
            <Group justify="space-between" gap="xs">
              <Text size="sm">Volume:</Text>
              <Text size="sm" fw={500}>{safeFormatCurrency(data.volumeMillions, '$', 1, 'N/A')}M</Text>
            </Group>
          )}
        </Card>
      );
    }
    return null;
  };

  const formatPrice = (value: number) => safeFormatCurrency(value, '$', 2, 'N/A');
  const formatVolume = (value: number) => safeFormatCurrency(value, '$', 0, 'N/A') + 'M';
  const formatYield = (value: number) => safeFormatPercentage(value, 2, 'N/A');

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600} size="lg">
            {title}
          </Text>
          {performanceMetrics && (
            <Badge
              color={performanceMetrics.priceChangePercent >= 0 ? 'green' : 'red'}
              variant="light"
            >
              {performanceMetrics.priceChangePercent >= 0 ? '+' : ''}
              {performanceMetrics.priceChangePercent.toFixed(2)}%
            </Badge>
          )}
        </Group>

        {onPeriodChange && (
          <Select
            value={period}
            onChange={(value) => value && onPeriodChange(value)}
            data={[
              { value: '1W', label: '1 Week' },
              { value: '1M', label: '1 Month' },
              { value: '3M', label: '3 Months' },
              { value: '6M', label: '6 Months' },
              { value: '1Y', label: '1 Year' },
            ]}
            size="sm"
            w={120}
          />
        )}
      </Group>

      {chartData.length === 0 ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No valid bond price data available</Text>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.colors.grid}
            opacity={0.3}
          />

          <XAxis
            dataKey="shortDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
            interval="preserveStartEnd"
          />

          <YAxis
            yAxisId="price"
            orientation="left"
            tickFormatter={formatPrice}
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
          />

          {showYield && (
            <YAxis
              yAxisId="yield"
              orientation="right"
              tickFormatter={formatYield}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.warning, fontSize: 11 }}
            />
          )}

          {interactive && <Tooltip content={<CustomTooltip />} />}

          {/* Price Line */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke={chartTheme.colors.primary}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              stroke: chartTheme.colors.primary,
              strokeWidth: 2,
              fill: 'white',
            }}
            name="Price"
          />

          {/* Yield Line */}
          {showYield && (
            <Line
              yAxisId="yield"
              type="monotone"
              dataKey="yieldToMaturity"
              stroke={chartTheme.colors.warning}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Yield"
            />
          )}

          {/* Volume Bars */}
          {showVolume && (
            <Bar
              yAxisId="price"
              dataKey="volumeMillions"
              fill={chartTheme.colors.stable}
              opacity={0.3}
              name="Volume (M)"
            />
          )}

          <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Performance Summary */}
      {performanceMetrics && (
        <Group mt="md" justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Current Price</Text>
            <Text fw={600} size="sm">
              {safeFormatCurrency(chartData[chartData.length - 1]?.price, '$', 2, 'N/A')}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Change</Text>
            <Text
              fw={600}
              size="sm"
              c={safeNumber(performanceMetrics.priceChangePercent, 0) >= 0 ? 'green' : 'red'}
            >
              {safeFormatPercentage(performanceMetrics.priceChangePercent, 2, 'N/A')}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">High/Low</Text>
            <Text fw={600} size="sm">
              {safeFormatCurrency(performanceMetrics.maxPrice, '$', 2, 'N/A')} / {safeFormatCurrency(performanceMetrics.minPrice, '$', 2, 'N/A')}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Avg Volume</Text>
            <Text fw={600} size="sm">
              {safeFormatCurrency(performanceMetrics.avgVolume / 1000000, '$', 1, 'N/A')}M
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Current Yield</Text>
            <Text fw={600} size="sm">
              {safeFormatPercentage(performanceMetrics.currentYield, 2, 'N/A')}
            </Text>
          </div>
        </Group>
      )}
    </Card>
  );
};

export default BondPriceChart;