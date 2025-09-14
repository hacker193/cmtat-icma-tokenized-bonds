'use client';

import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, Text, Group, Badge, SegmentedControl, Stack, Progress } from '@mantine/core';
import { Portfolio } from '@/types/financial';
import { getSectorColor, bondRatingColors, chartTheme } from '@/utils/theme';

interface PortfolioAllocationChartProps {
  portfolio: Portfolio;
  height?: number;
  interactive?: boolean;
  title?: string;
  showLegend?: boolean;
  defaultView?: 'sector' | 'rating' | 'duration' | 'issuer';
}

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  count: number;
  avgYield?: number;
  avgDuration?: number;
}

const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({
  portfolio,
  height = 400,
  interactive = true,
  title = 'Portfolio Allocation',
  showLegend = true,
  defaultView = 'sector',
}) => {
  const [viewMode, setViewMode] = useState<'sector' | 'rating' | 'duration' | 'issuer'>(defaultView);

  // Process portfolio data based on view mode
  const allocationData = useMemo(() => {
    const data: { [key: string]: { value: number; bonds: any[]; yields: number[]; durations: number[] } } = {};

    // Safety check for positions
    if (!portfolio?.positions || !Array.isArray(portfolio.positions)) {
      return [];
    }

    portfolio.positions.forEach(position => {
      let key: string;
      let color: string;

      switch (viewMode) {
        case 'sector':
          key = position.bond.sector;
          color = getSectorColor(key);
          break;
        case 'rating':
          key = position.bond.rating;
          color = bondRatingColors[key as keyof typeof bondRatingColors] || '#868E96';
          break;
        case 'duration':
          const duration = position.bond.duration;
          if (duration <= 3) key = 'Short Term (0-3Y)';
          else if (duration <= 7) key = 'Medium Term (3-7Y)';
          else if (duration <= 15) key = 'Long Term (7-15Y)';
          else key = 'Very Long Term (15Y+)';

          color = duration <= 3 ? '#40C057' :
                 duration <= 7 ? '#FCC419' :
                 duration <= 15 ? '#FD7E14' : '#E03131';
          break;
        case 'issuer':
          key = position.bond.issuer;
          // Generate consistent colors for issuers
          const hash = key.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          const colors = ['#228BE6', '#40C057', '#FD7E14', '#BE4BDB', '#20C997', '#F76707'];
          color = colors[Math.abs(hash) % colors.length];
          break;
        default:
          key = position.bond.sector;
          color = getSectorColor(key);
      }

      if (!data[key]) {
        data[key] = { value: 0, bonds: [], yields: [], durations: [] };
      }

      data[key].value += position.currentMarketValue;
      data[key].bonds.push(position.bond);
      data[key].yields.push(position.bond.yieldToMaturity);
      data[key].durations.push(position.bond.duration);
    });

    const result: AllocationData[] = Object.entries(data).map(([name, info]) => ({
      name,
      value: info.value,
      percentage: (info.value / portfolio.totalValue) * 100,
      color: getSectorColor(name) || bondRatingColors[name as keyof typeof bondRatingColors] || '#868E96',
      count: info.bonds.length,
      avgYield: info.yields.reduce((sum, y) => sum + y, 0) / info.yields.length,
      avgDuration: info.durations.reduce((sum, d) => sum + d, 0) / info.durations.length,
    }));

    return result.sort((a, b) => b.value - a.value);
  }, [portfolio, viewMode]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AllocationData;

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
            <Text size="sm">Allocation:</Text>
            <Text size="sm" fw={500}>{data.percentage.toFixed(1)}%</Text>
          </Group>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Market Value:</Text>
            <Text size="sm" fw={500}>${(data.value / 1000000).toFixed(1)}M</Text>
          </Group>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Positions:</Text>
            <Text size="sm" fw={500}>{data.count}</Text>
          </Group>

          {data.avgYield && (
            <Group justify="space-between" gap="xs" mb={4}>
              <Text size="sm">Avg Yield:</Text>
              <Text size="sm" fw={500}>{data.avgYield.toFixed(2)}%</Text>
            </Group>
          )}

          {data.avgDuration && (
            <Group justify="space-between" gap="xs">
              <Text size="sm">Avg Duration:</Text>
              <Text size="sm" fw={500}>{data.avgDuration.toFixed(1)} years</Text>
            </Group>
          )}
        </Card>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return entry.percentage > 5 ? `${entry.percentage.toFixed(1)}%` : '';
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Badge variant="light" color="blue">
          ${((portfolio?.totalValue || 0) / 1000000).toFixed(1)}M Total
        </Badge>
      </Group>

      <SegmentedControl
        value={viewMode}
        onChange={(value) => setViewMode(value as any)}
        data={[
          { label: 'Sector', value: 'sector' },
          { label: 'Rating', value: 'rating' },
          { label: 'Duration', value: 'duration' },
          { label: 'Issuer', value: 'issuer' },
        ]}
        mb="md"
        size="sm"
      />

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Pie Chart */}
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={height * 0.35}
                innerRadius={height * 0.15}
                fill="#8884d8"
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {interactive && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Details */}
        {showLegend && (
          <div style={{ flex: 1, minWidth: '280px' }}>
            <Text fw={600} size="sm" mb="md">Allocation Breakdown</Text>
            <Stack gap="sm">
              {allocationData.map((item, index) => (
                <div key={index}>
                  <Group justify="space-between" mb={4}>
                    <Group gap="xs">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '2px',
                          flexShrink: 0,
                        }}
                      />
                      <Text size="sm" fw={500}>
                        {item.name}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </Group>

                  <Progress
                    value={item.percentage}
                    size="xs"
                    color={item.color}
                    mb="xs"
                  />

                  <Group justify="space-between" mb="sm">
                    <Text size="xs" c="dimmed">
                      ${(item.value / 1000000).toFixed(1)}M • {item.count} bonds
                    </Text>
                    {item.avgYield && (
                      <Text size="xs" c="dimmed">
                        {item.avgYield.toFixed(2)}% yield
                      </Text>
                    )}
                  </Group>
                </div>
              ))}
            </Stack>

            {/* Summary Stats */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <Text fw={600} size="sm" mb="sm">Portfolio Summary</Text>
              <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">Total Positions:</Text>
                <Text size="sm" fw={500}>{portfolio?.positions?.length || 0}</Text>
              </Group>
              <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">Avg Duration:</Text>
                <Text size="sm" fw={500}>{portfolio?.averageDuration?.toFixed(1) || '0.0'} years</Text>
              </Group>
              <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">Avg Yield:</Text>
                <Text size="sm" fw={500}>{portfolio?.averageYield?.toFixed(2) || '0.00'}%</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Avg Rating:</Text>
                <Badge size="sm" variant="light">
                  {portfolio?.averageRating || 'N/A'}
                </Badge>
              </Group>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PortfolioAllocationChart;