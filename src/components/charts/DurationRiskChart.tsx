'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, Text, Group, Badge, RingProgress, Grid } from '@mantine/core';
import { Portfolio } from '@/types/financial';
import { chartTheme, getRiskColor } from '@/utils/theme';
import {
  safeNumber,
  safePercentage,
  safeCalculation,
  safeDuration,
  safeFormatNumber,
  safeFormatPercentage,
  safeFormatCurrency,
  validateChartData
} from '@/utils/chartValidation';

interface DurationRiskChartProps {
  portfolio: Portfolio;
  height?: number;
  interactive?: boolean;
  title?: string;
  targetDuration?: number;
  showRiskMetrics?: boolean;
}

interface DurationData {
  bondName: string;
  duration: number;
  marketValue: number;
  contribution: number;
  riskLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  color: string;
}

const DurationRiskChart: React.FC<DurationRiskChartProps> = ({
  portfolio,
  height = 400,
  interactive = true,
  title = 'Duration Risk Analysis',
  targetDuration = 7.0,
  showRiskMetrics = true,
}) => {
  // Process portfolio data for duration analysis
  const durationData = useMemo(() => {
    const data: DurationData[] = portfolio.positions.map(position => {
      const duration = position.bond.duration;
      const riskLevel =
        duration <= 2 ? 'very-low' :
        duration <= 4 ? 'low' :
        duration <= 7 ? 'medium' :
        duration <= 10 ? 'high' : 'very-high';

      return {
        bondName: position.bond.name.length > 20
          ? position.bond.name.substring(0, 20) + '...'
          : position.bond.name,
        duration: Number(duration.toFixed(2)),
        marketValue: position.currentMarketValue,
        contribution: (position.currentMarketValue / portfolio.totalValue) * 100,
        riskLevel,
        color: getRiskColor((duration / 15) * 100), // Normalize to 0-100 scale
      };
    });

    return data.sort((a, b) => b.duration - a.duration);
  }, [portfolio]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const totalDuration = portfolio.averageDuration;
    const durationRisk = Math.abs(totalDuration - targetDuration);
    const concentrationRisk = Math.max(...durationData.map(d => d.contribution)) - 25; // Risk if >25%

    // Calculate duration buckets
    const buckets = {
      'Short (0-3Y)': durationData.filter(d => d.duration <= 3).reduce((sum, d) => sum + d.contribution, 0),
      'Medium (3-7Y)': durationData.filter(d => d.duration > 3 && d.duration <= 7).reduce((sum, d) => sum + d.contribution, 0),
      'Long (7-15Y)': durationData.filter(d => d.duration > 7 && d.duration <= 15).reduce((sum, d) => sum + d.contribution, 0),
      'Very Long (15Y+)': durationData.filter(d => d.duration > 15).reduce((sum, d) => sum + d.contribution, 0),
    };

    return {
      totalDuration,
      durationRisk,
      concentrationRisk: Math.max(0, concentrationRisk),
      buckets,
      riskScore: Math.min(100, (durationRisk * 10) + (Math.max(0, concentrationRisk) * 2)),
    };
  }, [durationData, portfolio.averageDuration, targetDuration]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as DurationData;
      if (!data) return null;

      return (
        <Card
          shadow="md"
          p="sm"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            minWidth: '220px',
          }}
        >
          <Text fw={600} size="sm" mb={8}>
            {data.bondName}
          </Text>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Duration:</Text>
            <Text size="sm" fw={500}>{data.duration} years</Text>
          </Group>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Market Value:</Text>
            <Text size="sm" fw={500}>${(data.marketValue / 1000000).toFixed(1)}M</Text>
          </Group>

          <Group justify="space-between" gap="xs" mb={4}>
            <Text size="sm">Portfolio %:</Text>
            <Text size="sm" fw={500}>{data.contribution.toFixed(1)}%</Text>
          </Group>

          <Group justify="space-between" gap="xs">
            <Text size="sm">Risk Level:</Text>
            <Badge
              size="sm"
              color={
                data.riskLevel === 'very-low' ? 'green' :
                data.riskLevel === 'low' ? 'lime' :
                data.riskLevel === 'medium' ? 'yellow' :
                data.riskLevel === 'high' ? 'orange' : 'red'
              }
              variant="light"
            >
              {data.riskLevel.replace('-', ' ').toUpperCase()}
            </Badge>
          </Group>
        </Card>
      );
    }
    return null;
  };

  const formatDuration = (value: number) => `${value}Y`;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Badge
          color={riskMetrics.riskScore <= 20 ? 'green' :
                riskMetrics.riskScore <= 40 ? 'yellow' :
                riskMetrics.riskScore <= 60 ? 'orange' : 'red'}
          variant="light"
        >
          Risk Score: {riskMetrics.riskScore.toFixed(0)}
        </Badge>
      </Group>

      <Grid mb="lg">
        <Grid.Col span={8}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={durationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartTheme.colors.grid}
                opacity={0.3}
              />

              <XAxis
                dataKey="bondName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.colors.text, fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />

              <YAxis
                tickFormatter={formatDuration}
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
                label={{ value: 'Duration (Years)', angle: -90, position: 'insideLeft' }}
              />

              {interactive && <Tooltip content={<CustomTooltip />} />}

              {/* Target Duration Reference Line */}
              <ReferenceLine
                y={targetDuration}
                stroke={chartTheme.colors.warning}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `Target: ${targetDuration}Y`, position: "topRight" }}
              />

              <Bar
                dataKey="duration"
                name="Duration"
                radius={[4, 4, 0, 0]}
              >
                {durationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid.Col>

        {showRiskMetrics && (
          <Grid.Col span={4}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              {/* Portfolio Duration Ring */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Text size="sm" c="dimmed" mb={8}>Portfolio Duration</Text>
                <RingProgress
                  size={120}
                  thickness={12}
                  sections={[
                    {
                      value: (riskMetrics.totalDuration / 15) * 100,
                      color: getRiskColor((riskMetrics.totalDuration / 15) * 100),
                    }
                  ]}
                  label={
                    <Text c="blue" fw={700} ta="center" size="lg">
                      {riskMetrics.totalDuration.toFixed(1)}Y
                    </Text>
                  }
                />
              </div>

              {/* Duration Buckets */}
              <div>
                <Text size="sm" fw={600} mb={8}>Duration Distribution</Text>
                {Object.entries(riskMetrics.buckets).map(([bucket, percentage]) => (
                  <Group key={bucket} justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">{bucket}:</Text>
                    <Text size="xs" fw={500}>{percentage.toFixed(1)}%</Text>
                  </Group>
                ))}
              </div>
            </div>
          </Grid.Col>
        )}
      </Grid>

      {/* Risk Summary */}
      <Group mt="md" justify="space-around" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Avg Duration</Text>
          <Text fw={600} size="sm">
            {riskMetrics.totalDuration.toFixed(1)} years
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Duration Risk</Text>
          <Text fw={600} size="sm" c={riskMetrics.durationRisk > 1 ? 'orange' : 'green'}>
            {riskMetrics.durationRisk.toFixed(1)} years
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Max Concentration</Text>
          <Text fw={600} size="sm" c={Math.max(...durationData.map(d => d.contribution)) > 25 ? 'orange' : 'green'}>
            {Math.max(...durationData.map(d => d.contribution)).toFixed(1)}%
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Interest Rate Risk</Text>
          <Text fw={600} size="sm">
            {((riskMetrics.totalDuration * 100) / 10000 * 100).toFixed(2)}%/100bp
          </Text>
        </div>
      </Group>
    </Card>
  );
};

export default DurationRiskChart;