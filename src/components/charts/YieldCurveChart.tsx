'use client';

import React, { useMemo } from 'react';
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
import {
  validateChartData,
  safeNumber,
  safeYield,
  safeSpread,
  safeFormatPercentage,
  safeFormatNumber,
  safeDomain
} from '@/utils/chartValidation';

interface YieldCurveChartProps {
  data: YieldCurvePoint[];
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  title?: string;
  compareData?: YieldCurvePoint[];
}

const YieldCurveChart: React.FC<YieldCurveChartProps> = ({
  data,
  height = 400,
  showLegend = true,
  interactive = true,
  title = 'Yield Curve',
  compareData,
}) => {
  // Transform and validate data for Recharts
  const chartData = useMemo(() => {
    // Validate input data
    const validatedData = validateChartData(data, ['maturity', 'yield']);
    const validatedCompareData = compareData ? validateChartData(compareData, ['maturity', 'yield']) : null;

    if (validatedData.length === 0) {
      console.warn('YieldCurveChart: No valid data points available');
      return [];
    }

    const processedData = (Array.isArray(validatedData) ? validatedData : []).map(point => {
      const maturity = safeNumber(point.maturity, 0, { min: 0, max: 50 });
      const yieldValue = safeYield(point.yield, 0);

      return {
        maturity,
        maturityLabel: maturity < 1 ? `${safeNumber(maturity * 12, 0)}M` : `${safeFormatNumber(maturity, 0)}Y`,
        yield: safeNumber(yieldValue, 0),
        curveType: point.curveType || 'treasury',
      };
    }).filter(point => point.maturity > 0); // Remove invalid maturity points

    // If comparison data is provided, merge it
    if (validatedCompareData && validatedCompareData.length > 0) {
      const compareProcessed = (Array.isArray(validatedCompareData) ? validatedCompareData : []).map(point => {
        const maturity = safeNumber(point.maturity, 0, { min: 0, max: 50 });
        const yieldValue = safeYield(point.yield, 0);

        return {
          maturity,
          maturityLabel: maturity < 1 ? `${safeNumber(maturity * 12, 0)}M` : `${safeFormatNumber(maturity, 0)}Y`,
          compareYield: safeNumber(yieldValue, 0),
          curveType: point.curveType || 'corporate',
        };
      }).filter(point => point.maturity > 0);

      // Merge by maturity
      return (Array.isArray(processedData) ? processedData : []).map(item => {
        const compareItem = compareProcessed.find(c => Math.abs(c.maturity - item.maturity) < 0.1);
        return {
          ...item,
          compareYield: compareItem?.compareYield || null,
        };
      });
    }

    return processedData;
  }, [data, compareData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          {(Array.isArray(payload) ? payload : []).map((entry: any, index: number) => (
            <Group key={index} justify="space-between" gap="xs">
              <Text size="sm" c={entry.color}>
                {entry.dataKey === 'yield' ? 'Treasury Yield' :
                 entry.dataKey === 'compareYield' ? 'Corporate Yield' :
                 entry.name}:
              </Text>
              <Text size="sm" fw={500}>
                {safeFormatPercentage(entry.value, 2, 'N/A')}
              </Text>
            </Group>
          ))}
          {payload[0] && payload[1] && (
            <Group justify="space-between" gap="xs" mt={4} pt={4} style={{ borderTop: '1px solid #e9ecef' }}>
              <Text size="sm" c="dimmed">
                Spread:
              </Text>
              <Text size="sm" fw={500} c={safeSpread(payload[1].value, payload[0].value) > 0 ? 'red' : 'green'}>
                {safeFormatNumber(Math.abs(safeSpread(payload[1].value, payload[0].value)), 0)}bp
              </Text>
            </Group>
          )}
        </Card>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => `${safeFormatNumber(value, 2)}%`;

  // Calculate safe domain for Y-axis
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 10];

    const allYields = chartData.flatMap(d => [
      d.yield,
      ...(d.compareYield !== null ? [d.compareYield] : [])
    ]).filter(y => y !== null && isFinite(y));

    return safeDomain(allYields, 0.1, [0, 10]);
  }, [chartData]);

  const curveColor = data[0]?.curveType === 'treasury' ? chartTheme.colors.primary :
                    data[0]?.curveType === 'corporate' ? chartTheme.colors.warning :
                    chartTheme.colors.stable;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          {title}
        </Text>
        {data[0]?.curveType && (
          <Badge
            color={data[0].curveType === 'treasury' ? 'blue' :
                   data[0].curveType === 'corporate' ? 'orange' : 'gray'}
            variant="light"
          >
            {data[0].curveType.charAt(0).toUpperCase() + data[0].curveType.slice(1)}
          </Badge>
        )}
      </Group>

      {chartData.length === 0 ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No valid yield curve data available</Text>
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
            domain={yAxisDomain}
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
            />
          )}

          {showLegend && <Legend />}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Summary Statistics */}
      <Group mt="md" justify="space-around">
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">2Y Yield</Text>
          <Text fw={600} size="sm">
            {safeFormatPercentage(chartData.find(d => Math.abs(d.maturity - 2) < 0.1)?.yield, 2, 'N/A')}
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">10Y Yield</Text>
          <Text fw={600} size="sm">
            {safeFormatPercentage(chartData.find(d => Math.abs(d.maturity - 10) < 0.1)?.yield, 2, 'N/A')}
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">2Y-10Y Spread</Text>
          <Text fw={600} size="sm">
            {(() => {
              const y2 = safeYield(chartData.find(d => Math.abs(d.maturity - 2) < 0.1)?.yield);
              const y10 = safeYield(chartData.find(d => Math.abs(d.maturity - 10) < 0.1)?.yield);
              const spread = safeSpread(y10, y2);
              return `${safeFormatNumber(spread, 0)}bp`;
            })()}
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Curve Shape</Text>
          <Text fw={600} size="sm">
            {(() => {
              const y2 = safeYield(chartData.find(d => Math.abs(d.maturity - 2) < 0.1)?.yield);
              const y10 = safeYield(chartData.find(d => Math.abs(d.maturity - 10) < 0.1)?.yield);
              const spread = safeSpread(y10, y2);
              return spread > 50 ? 'Normal' : spread > 0 ? 'Flat' : 'Inverted';
            })()}
          </Text>
        </div>
      </Group>
    </Card>
  );
};

export default YieldCurveChart;