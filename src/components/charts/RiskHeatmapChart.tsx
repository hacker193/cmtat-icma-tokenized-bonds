'use client';

import React, { useMemo } from 'react';
import { Card, Text, Group, Badge, Grid, Tooltip as MantineTooltip } from '@mantine/core';
import { Portfolio } from '@/types/financial';
import { getRiskColor } from '@/utils/theme';

interface RiskHeatmapChartProps {
  portfolio: Portfolio;
  height?: number;
  interactive?: boolean;
  title?: string;
}

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label: string;
  bondName: string;
  risk: string;
  color: string;
}

const RiskHeatmapChart: React.FC<RiskHeatmapChartProps> = ({
  portfolio,
  height = 400,
  interactive = true,
  title = 'Portfolio Risk Heatmap',
}) => {
  // Process portfolio data for heatmap
  const heatmapData = useMemo(() => {
    if (!portfolio?.positions || !Array.isArray(portfolio.positions)) {
      return { sectors: [], ratings: [], data: [] };
    }
    const sectors = [...new Set(portfolio.positions.map(p => p.bond.sector))];
    const ratings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'];

    const data: HeatmapCell[][] = [];

    for (let y = 0; y < ratings.length; y++) {
      const row: HeatmapCell[] = [];
      for (let x = 0; x < sectors.length; x++) {
        const sector = sectors[x];
        const rating = ratings[y];

        const bondsInCell = portfolio.positions.filter(p =>
          p.bond.sector === sector && p.bond.rating === rating
        );

        const totalValue = bondsInCell.reduce((sum, p) => sum + p.currentMarketValue, 0);
        const percentage = (totalValue / portfolio.totalValue) * 100;

        // Calculate risk score based on rating and concentration
        const ratingRisk = (ratings.length - y) * 10; // Higher risk for lower ratings
        const concentrationRisk = percentage > 15 ? percentage * 2 : percentage; // Penalty for high concentration
        const riskScore = (ratingRisk + concentrationRisk) / 2;

        row.push({
          x,
          y,
          value: percentage,
          label: `${percentage.toFixed(1)}%`,
          bondName: bondsInCell.map(p => p.bond.name).join(', ') || 'None',
          risk: riskScore < 20 ? 'Low' : riskScore < 50 ? 'Medium' : 'High',
          color: getRiskColor(riskScore),
        });
      }
      data.push(row);
    }

    return { data, sectors, ratings };
  }, [portfolio]);

  const cellSize = Math.min(60, (height - 100) / heatmapData.ratings.length);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Badge variant="light" color="blue">
          Sector vs Rating
        </Badge>
      </Group>

      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{
          display: 'inline-block',
          minWidth: `${heatmapData.sectors.length * cellSize + 100}px`,
          position: 'relative',
        }}>
          {/* Y-axis labels (Ratings) */}
          <div style={{ position: 'absolute', left: 0, top: 40 }}>
            {heatmapData.ratings.map((rating, y) => (
              <div
                key={rating}
                style={{
                  height: `${cellSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {rating}
              </div>
            ))}
          </div>

          {/* X-axis labels (Sectors) */}
          <div style={{
            marginLeft: '80px',
            display: 'flex',
            marginBottom: '8px',
          }}>
            {heatmapData.sectors.map((sector, x) => (
              <div
                key={sector}
                style={{
                  width: `${cellSize}px`,
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                }}
              >
                {sector.length > 8 ? sector.substring(0, 8) + '...' : sector}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div style={{ marginLeft: '80px' }}>
            {heatmapData.data.map((row, y) => (
              <div key={y} style={{ display: 'flex' }}>
                {row.map((cell, x) => (
                  <MantineTooltip
                    key={`${x}-${y}`}
                    label={
                      interactive ? (
                        <div>
                          <Text size="sm" fw={600}>
                            {heatmapData.sectors[x]} • {heatmapData.ratings[y]}
                          </Text>
                          <Text size="xs">Allocation: {cell.label}</Text>
                          <Text size="xs">Risk: {cell.risk}</Text>
                          {cell.bondName !== 'None' && (
                            <Text size="xs" c="dimmed">
                              {cell.bondName.length > 50
                                ? cell.bondName.substring(0, 50) + '...'
                                : cell.bondName
                              }
                            </Text>
                          )}
                        </div>
                      ) : undefined
                    }
                    disabled={!interactive}
                    position="top"
                    withArrow
                  >
                    <div
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: cell.value > 0 ? cell.color : '#f8f9fa',
                        border: '1px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 500,
                        color: cell.value > 5 ? 'white' : '#495057',
                        cursor: interactive ? 'pointer' : 'default',
                        opacity: cell.value > 0 ? 1 : 0.3,
                      }}
                    >
                      {cell.value > 1 ? cell.label : ''}
                    </div>
                  </MantineTooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
        <div>
          <Text size="xs" c="dimmed" mb={4}>Risk Levels</Text>
          <Group gap="xs">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: getRiskColor(10),
                borderRadius: 2,
              }} />
              <Text size="xs">Low</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: getRiskColor(35),
                borderRadius: 2,
              }} />
              <Text size="xs">Medium</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: getRiskColor(70),
                borderRadius: 2,
              }} />
              <Text size="xs">High</Text>
            </div>
          </Group>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Portfolio Statistics</Text>
          <Group gap="md" mt={4}>
            <Text size="xs">
              <strong>{portfolio.positions.length}</strong> positions
            </Text>
            <Text size="xs">
              <strong>{[...new Set(portfolio.positions.map(p => p.bond.sector))].length}</strong> sectors
            </Text>
            <Text size="xs">
              <strong>{[...new Set(portfolio.positions.map(p => p.bond.rating))].length}</strong> ratings
            </Text>
          </Group>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Text size="xs" c="dimmed">Concentration</Text>
          <Text size="xs" fw={500}>
            Max: {Math.max(...portfolio.positions.map(p => p.weightInPortfolio)).toFixed(1)}%
          </Text>
        </div>
      </Group>
    </Card>
  );
};

export default RiskHeatmapChart;