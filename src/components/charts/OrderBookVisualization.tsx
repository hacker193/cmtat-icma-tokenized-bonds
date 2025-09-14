'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, Text, Group, Badge, Stack, Progress, Button } from '@mantine/core';
import { MarketDepth, Bond } from '@/types/financial';
import { chartTheme } from '@/utils/theme';
import { IconRefresh } from '@tabler/icons-react';

interface OrderBookVisualizationProps {
  marketDepth: MarketDepth;
  bond?: Bond;
  height?: number;
  interactive?: boolean;
  title?: string;
  showSpreadInfo?: boolean;
  realTime?: boolean;
  onRefresh?: () => void;
}

interface OrderBookData {
  price: number;
  quantity: number;
  cumulativeQuantity: number;
  orders: number;
  side: 'bid' | 'ask';
  distanceFromMid: number;
  color: string;
}

const OrderBookVisualization: React.FC<OrderBookVisualizationProps> = ({
  marketDepth,
  bond,
  height = 400,
  interactive = true,
  title = 'Order Book',
  showSpreadInfo = true,
  realTime = false,
  onRefresh,
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (realTime && isClient) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        if (onRefresh) onRefresh();
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [realTime, onRefresh, isClient]);

  // Process order book data
  const orderBookData = useMemo(() => {
    const { bids, asks, midPrice } = marketDepth;
    const data: OrderBookData[] = [];

    // Process bids (buying interest)
    let cumulativeBidQuantity = 0;
    bids.forEach(bid => {
      cumulativeBidQuantity += bid.quantity;
      data.push({
        price: bid.price,
        quantity: bid.quantity,
        cumulativeQuantity: cumulativeBidQuantity,
        orders: bid.orders,
        side: 'bid',
        distanceFromMid: ((bid.price - midPrice) / midPrice) * 10000, // in basis points
        color: chartTheme.colors.profit,
      });
    });

    // Process asks (selling interest)
    let cumulativeAskQuantity = 0;
    asks.forEach(ask => {
      cumulativeAskQuantity += ask.quantity;
      data.push({
        price: ask.price,
        quantity: ask.quantity,
        cumulativeQuantity: cumulativeAskQuantity,
        orders: ask.orders,
        side: 'ask',
        distanceFromMid: ((ask.price - midPrice) / midPrice) * 10000, // in basis points
        color: chartTheme.colors.loss,
      });
    });

    return data.sort((a, b) => a.price - b.price);
  }, [marketDepth]);

  // Calculate market statistics
  const marketStats = useMemo(() => {
    const { bids, asks, spread, midPrice } = marketDepth;

    const totalBidVolume = bids.reduce((sum, bid) => sum + bid.quantity, 0);
    const totalAskVolume = asks.reduce((sum, ask) => sum + ask.quantity, 0);
    const totalOrders = bids.reduce((sum, bid) => sum + bid.orders, 0) +
                       asks.reduce((sum, ask) => sum + ask.orders, 0);

    const weightedBidPrice = bids.reduce((sum, bid) => sum + (bid.price * bid.quantity), 0) / totalBidVolume;
    const weightedAskPrice = asks.reduce((sum, ask) => sum + (ask.price * ask.quantity), 0) / totalAskVolume;

    const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);
    const spreadBps = (spread / midPrice) * 10000;

    return {
      totalBidVolume,
      totalAskVolume,
      totalOrders,
      weightedBidPrice,
      weightedAskPrice,
      imbalance,
      spreadBps,
      bestBid: bids[0]?.price || 0,
      bestAsk: asks[0]?.price || 0,
    };
  }, [marketDepth]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as OrderBookData;

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
          <Group justify="space-between" mb={4}>
            <Text size="sm">Price:</Text>
            <Text size="sm" fw={500}>${data.price.toFixed(2)}</Text>
          </Group>

          <Group justify="space-between" mb={4}>
            <Text size="sm">Quantity:</Text>
            <Text size="sm" fw={500}>${(data.quantity / 1000000).toFixed(1)}M</Text>
          </Group>

          <Group justify="space-between" mb={4}>
            <Text size="sm">Orders:</Text>
            <Text size="sm" fw={500}>{data.orders}</Text>
          </Group>

          <Group justify="space-between" mb={4}>
            <Text size="sm">Side:</Text>
            <Badge size="xs" color={data.side === 'bid' ? 'green' : 'red'} variant="light">
              {data.side.toUpperCase()}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm">From Mid:</Text>
            <Text size="sm" fw={500}>
              {data.distanceFromMid >= 0 ? '+' : ''}{data.distanceFromMid.toFixed(1)}bp
            </Text>
          </Group>
        </Card>
      );
    }
    return null;
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Text fw={600} size="lg">
              {title}
            </Text>
            {bond && (
              <Badge variant="light">
                {bond.name}
              </Badge>
            )}
          </Group>
        </Group>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">Loading order book data...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600} size="lg">
            {title}
          </Text>
          {bond && (
            <Badge variant="light">
              {bond.name}
            </Badge>
          )}
        </Group>
        <Group>
          {realTime && (
            <Badge color="green" variant="light" size="sm">
              Real-time
            </Badge>
          )}
          {onRefresh && (
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconRefresh size={14} />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </Group>
      </Group>

      {/* Market Depth Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={orderBookData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} opacity={0.3} />

            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />

            <YAxis
              type="category"
              dataKey="price"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.colors.text, fontSize: 10 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              width={60}
            />

            {interactive && <Tooltip content={<CustomTooltip />} />}

            <Bar
              dataKey="quantity"
              name="Quantity"
              radius={[0, 2, 2, 0]}
            >
              {Array.isArray(orderBookData) ? orderBookData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
              )) : []}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order Book Details */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Bids Table */}
        <div style={{ flex: 1 }}>
          <Text fw={600} size="sm" mb="sm" c="green">
            Bids (Buy Orders)
          </Text>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <Stack gap="xs">
              {Array.isArray(marketDepth?.bids) ? marketDepth.bids.slice(0, 5).map((bid, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    backgroundColor: index === 0 ? '#e8f5e8' : 'transparent',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <Text size="xs" fw={index === 0 ? 600 : 400}>
                    ${bid.price.toFixed(2)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(bid.quantity / 1000000).toFixed(1)}M
                  </Text>
                  <Text size="xs" c="dimmed">
                    {bid.orders}
                  </Text>
                </div>
              )) : []}
            </Stack>
          </div>
        </div>

        {/* Spread Info */}
        {showSpreadInfo && (
          <div style={{ flex: 1, textAlign: 'center', padding: '1rem 0' }}>
            <Text size="lg" fw={700} mb="xs">
              ${marketDepth.midPrice.toFixed(2)}
            </Text>
            <Text size="xs" c="dimmed" mb="md">Mid Price</Text>

            <Badge
              size="lg"
              color={marketStats.spreadBps < 5 ? 'green' : marketStats.spreadBps < 15 ? 'yellow' : 'red'}
              variant="light"
              mb="md"
            >
              {marketStats.spreadBps.toFixed(1)} bp
            </Badge>

            <div>
              <Text size="xs" c="dimmed" mb={4}>Market Imbalance</Text>
              <Progress
                value={50 + (marketStats.imbalance * 50)}
                color={marketStats.imbalance > 0 ? 'green' : 'red'}
                size="sm"
                radius="xl"
              />
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="red">Sell Pressure</Text>
                <Text size="xs" c="green">Buy Pressure</Text>
              </Group>
            </div>
          </div>
        )}

        {/* Asks Table */}
        <div style={{ flex: 1 }}>
          <Text fw={600} size="sm" mb="sm" c="red">
            Asks (Sell Orders)
          </Text>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <Stack gap="xs">
              {Array.isArray(marketDepth?.asks) ? marketDepth.asks.slice(0, 5).map((ask, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    backgroundColor: index === 0 ? '#ffebee' : 'transparent',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <Text size="xs" fw={index === 0 ? 600 : 400}>
                    ${ask.price.toFixed(2)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(ask.quantity / 1000000).toFixed(1)}M
                  </Text>
                  <Text size="xs" c="dimmed">
                    {ask.orders}
                  </Text>
                </div>
              )) : []}
            </Stack>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <Group mt="lg" justify="space-around" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Total Volume</Text>
          <Text fw={600} size="sm">
            ${((marketStats.totalBidVolume + marketStats.totalAskVolume) / 1000000).toFixed(1)}M
          </Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Total Orders</Text>
          <Text fw={600} size="sm">{marketStats.totalOrders}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Best Bid</Text>
          <Text fw={600} size="sm" c="green">${marketStats.bestBid.toFixed(2)}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Best Ask</Text>
          <Text fw={600} size="sm" c="red">${marketStats.bestAsk.toFixed(2)}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">Last Update</Text>
          <Text fw={600} size="sm">
            {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </Text>
        </div>
      </Group>
    </Card>
  );
};

export default OrderBookVisualization;
