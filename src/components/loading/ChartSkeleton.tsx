'use client';

import React from 'react';
import { Card, Skeleton, Stack, Group, Box } from '@mantine/core';

interface ChartSkeletonProps {
  height?: number;
  withTitle?: boolean;
  withLegend?: boolean;
  withSummary?: boolean;
  variant?: 'line' | 'bar' | 'pie' | 'heatmap' | 'orderbook';
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height = 400,
  withTitle = true,
  withLegend = false,
  withSummary = false,
  variant = 'line'
}) => {
  const renderChartContent = () => {
    switch (variant) {
      case 'line':
        return <LineChartSkeleton height={height} />;
      case 'bar':
        return <BarChartSkeleton height={height} />;
      case 'pie':
        return <PieChartSkeleton height={height} />;
      case 'heatmap':
        return <HeatmapSkeleton height={height} />;
      case 'orderbook':
        return <OrderBookSkeleton height={height} />;
      default:
        return <LineChartSkeleton height={height} />;
    }
  };

  const renderSummaryStats = () => {
    if (!withSummary) return null;

    return (
      <Group mt="md" justify="space-around">
        {Array.from({ length: 4 }, (_, index) => (
          <Stack key={index} align="center" gap={4}>
            <Skeleton height={12} width={60} />
            <Skeleton height={16} width={40} />
          </Stack>
        ))}
      </Group>
    );
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {/* Header */}
      {withTitle && (
        <Group justify="space-between" mb="md">
          <Skeleton height={24} width={200} />
          <Group gap="sm">
            <Skeleton height={20} width={60} />
            <Skeleton height={32} width={100} />
          </Group>
        </Group>
      )}

      {/* Legend */}
      {withLegend && (
        <Group mb="sm" gap="md" justify="center">
          {Array.from({ length: 3 }, (_, index) => (
            <Group key={index} gap={8}>
              <Skeleton height={12} width={12} />
              <Skeleton height={12} width={60} />
            </Group>
          ))}
        </Group>
      )}

      {/* Chart Content */}
      {renderChartContent()}

      {/* Summary Statistics */}
      {renderSummaryStats()}
    </Card>
  );
};

const LineChartSkeleton: React.FC<{ height: number }> = ({ height }) => {
  return (
    <Box style={{ position: 'relative', height }}>
      {/* Y-Axis */}
      <Stack
        gap={4}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          justifyContent: 'space-between',
          paddingTop: 10,
          paddingBottom: 30
        }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={10} width={40} />
        ))}
      </Stack>

      {/* X-Axis */}
      <Group
        gap={4}
        justify="space-between"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 50,
          right: 20,
          height: 20
        }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} height={10} width={30} />
        ))}
      </Group>

      {/* Chart Area with Grid Lines */}
      <Box
        style={{
          position: 'absolute',
          left: 50,
          right: 20,
          top: 10,
          bottom: 30,
          background: 'repeating-linear-gradient(90deg, transparent, transparent 10%, #f1f3f4 10%, #f1f3f4 11%)',
          backgroundSize: '50px 1px',
          opacity: 0.3
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 10%, #f1f3f4 10%, #f1f3f4 11%)',
            backgroundSize: '1px 30px'
          }}
        />

        {/* Simulated Line Chart */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <path
            d={`M 0,${height * 0.6} Q ${(height - 40) * 0.3},${height * 0.4} ${(height - 40) * 0.6},${height * 0.3} Q ${(height - 40) * 0.8},${height * 0.2} ${height - 40},${height * 0.4}`}
            fill="none"
            stroke="#e9ecef"
            strokeWidth="3"
            opacity="0.5"
          />
          <path
            d={`M 0,${height * 0.7} Q ${(height - 40) * 0.25},${height * 0.5} ${(height - 40) * 0.5},${height * 0.6} Q ${(height - 40) * 0.75},${height * 0.4} ${height - 40},${height * 0.5}`}
            fill="none"
            stroke="#e9ecef"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.3"
          />
        </svg>
      </Box>
    </Box>
  );
};

const BarChartSkeleton: React.FC<{ height: number }> = ({ height }) => {
  return (
    <Box style={{ position: 'relative', height }}>
      {/* Y-Axis */}
      <Stack
        gap={4}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          justifyContent: 'space-between',
          paddingTop: 10,
          paddingBottom: 30
        }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={10} width={40} />
        ))}
      </Stack>

      {/* X-Axis */}
      <Group
        gap={4}
        justify="space-between"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 50,
          right: 20,
          height: 20
        }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} height={10} width={30} />
        ))}
      </Group>

      {/* Bars */}
      <Group
        gap={8}
        justify="space-between"
        align="end"
        style={{
          position: 'absolute',
          left: 60,
          right: 30,
          bottom: 30,
          height: height - 50
        }}
      >
        {Array.from({ length: 8 }, (_, index) => {
          const barHeight = Math.random() * 0.8 + 0.2;
          return (
            <Skeleton
              key={index}
              width={20}
              height={`${barHeight * 100}%`}
              style={{ alignSelf: 'flex-end' }}
            />
          );
        })}
      </Group>
    </Box>
  );
};

const PieChartSkeleton: React.FC<{ height: number }> = ({ height }) => {
  return (
    <Stack align="center" justify="center" style={{ height }}>
      <Box style={{ position: 'relative' }}>
        <Skeleton height={200} width={200} radius="50%" />
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Skeleton height={80} width={80} radius="50%" />
        </Box>
      </Box>

      {/* Legend */}
      <Stack gap="xs" mt="md">
        {Array.from({ length: 4 }, (_, index) => (
          <Group key={index} gap="xs">
            <Skeleton height={12} width={12} />
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={40} />
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};

const HeatmapSkeleton: React.FC<{ height: number }> = ({ height }) => {
  const rows = 8;
  const cols = 12;
  const cellSize = Math.min((height - 60) / rows, 30);

  return (
    <Box style={{ position: 'relative', height }}>
      {/* Y-Axis Labels */}
      <Stack
        gap={`${cellSize - 8}px`}
        style={{
          position: 'absolute',
          left: 0,
          top: 20,
          justifyContent: 'flex-start'
        }}
      >
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} height={10} width={50} />
        ))}
      </Stack>

      {/* X-Axis Labels */}
      <Group
        gap={`${cellSize - 8}px`}
        style={{
          position: 'absolute',
          top: 0,
          left: 60,
          justifyContent: 'flex-start'
        }}
      >
        {Array.from({ length: cols }, (_, index) => (
          <Skeleton key={index} height={10} width={30} />
        ))}
      </Group>

      {/* Heatmap Grid */}
      <Box
        style={{
          position: 'absolute',
          left: 60,
          top: 20,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: 2
        }}
      >
        {Array.from({ length: rows * cols }, (_, index) => (
          <Skeleton
            key={index}
            height={cellSize}
            width={cellSize}
            style={{
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const OrderBookSkeleton: React.FC<{ height: number }> = ({ height }) => {
  const halfHeight = (height - 40) / 2;

  return (
    <Box style={{ position: 'relative', height }}>
      {/* Headers */}
      <Group justify="space-between" mb="sm">
        <Group gap="md">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </Group>
        <Group gap="md">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </Group>
      </Group>

      <Group align="start" justify="space-between" gap="md">
        {/* Bids */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Skeleton height={16} width={80} />
          {Array.from({ length: 8 }, (_, index) => (
            <Group key={index} justify="space-between">
              <Skeleton height={12} width={60} />
              <Skeleton height={12} width={80} />
              <Skeleton height={12} width={40} />
            </Group>
          ))}
        </Stack>

        {/* Spread */}
        <Stack align="center" gap="xs" style={{ minWidth: 100 }}>
          <Skeleton height={16} width={60} />
          <Skeleton height={20} width={80} />
        </Stack>

        {/* Asks */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Skeleton height={16} width={80} />
          {Array.from({ length: 8 }, (_, index) => (
            <Group key={index} justify="space-between">
              <Skeleton height={12} width={60} />
              <Skeleton height={12} width={80} />
              <Skeleton height={12} width={40} />
            </Group>
          ))}
        </Stack>
      </Group>
    </Box>
  );
};

export default ChartSkeleton;