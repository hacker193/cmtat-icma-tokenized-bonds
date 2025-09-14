'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  Button,
  NumberInput,
  Select,
  Table,
  Alert,
  Progress,
  Code,
  ActionIcon,
  Tooltip,
  Modal,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconShield,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { generateOrderBookData, demoDataProvider, getRandomTokenizedBond } from '@/data';
import type { OrderBookSnapshot, OrderBookUpdate } from '@/data/orderBookGenerator';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  side: 'bid' | 'ask';
}

interface TradeTransaction {
  id: string;
  timestamp: Date;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'validating' | 'completed' | 'rejected';
  validationSteps: {
    transferRules: boolean;
    allowlist: boolean;
    pauseCheck: boolean;
    balanceCheck: boolean;
  };
  buyer: string;
  seller: string;
  reason?: string;
}

interface CMTATValidation {
  transferRulesActive: boolean;
  contractPaused: boolean;
  allowlistEnabled: boolean;
  complianceScore: number;
}

export function SecondaryTradingInterface() {
  // Get a random tokenized bond for live order book demo
  const [selectedBond] = useState(() => getRandomTokenizedBond());
  const [orderBookSnapshot, setOrderBookSnapshot] = useState<OrderBookSnapshot | null>(null);

  const [orderBook, setOrderBook] = useState<{bids: OrderBookEntry[], asks: OrderBookEntry[]}>({
    bids: [],
    asks: [],
  });

  const [currentPrice, setCurrentPrice] = useState(selectedBond.currentPrice);
  const [priceChange, setPriceChange] = useState(() => (Math.random() - 0.5) * 0.05);

  // Initialize and update order book data
  useEffect(() => {
    const updateOrderBook = () => {
      try {
        const snapshot = generateOrderBookData.snapshot(selectedBond.id, 15);
        setOrderBookSnapshot(snapshot);

        // Convert order book data to display format
        const bids = Array.isArray(snapshot.bids) ? snapshot.bids.map(level => ({
          price: level?.price || 0,
          quantity: level?.quantity || 0,
          total: (level?.price || 0) * (level?.quantity || 0),
          side: 'bid' as const,
        })) : [];

        const asks = Array.isArray(snapshot.asks) ? snapshot.asks.map(level => ({
          price: level?.price || 0,
          quantity: level?.quantity || 0,
          total: (level?.price || 0) * (level?.quantity || 0),
          side: 'ask' as const,
        })) : [];

        setOrderBook({ bids, asks });
        setCurrentPrice(snapshot.midPrice);
      } catch (error) {
        console.error('Error updating order book:', error);
      }
    };

    // Initial load
    updateOrderBook();

    // Update every 2 seconds for live demo
    const interval = setInterval(updateOrderBook, 2000);

    return () => clearInterval(interval);
  }, [selectedBond.id]);

  const [recentTrades, setRecentTrades] = useState<TradeTransaction[]>([
    {
      id: 'tx_001',
      timestamp: new Date('2024-09-14T11:45:00Z'),
      side: 'buy',
      quantity: 500000,
      price: 99.85,
      status: 'completed',
      validationSteps: {
        transferRules: true,
        allowlist: true,
        pauseCheck: true,
        balanceCheck: true,
      },
      buyer: '0x1234...5678',
      seller: '0x9abc...def0',
    },
    {
      id: 'tx_002',
      timestamp: new Date('2024-09-14T11:42:00Z'),
      side: 'sell',
      quantity: 1000000,
      price: 99.84,
      status: 'rejected',
      validationSteps: {
        transferRules: true,
        allowlist: false,
        pauseCheck: true,
        balanceCheck: true,
      },
      buyer: '0xfed1...2345',
      seller: '0x8765...4321',
      reason: 'Buyer not on allowlist',
    },
  ]);

  const [cmtatValidation, setCmtatValidation] = useState<CMTATValidation>({
    transferRulesActive: true,
    contractPaused: false,
    allowlistEnabled: true,
    complianceScore: 98.5,
  });

  const [orderFormData, setOrderFormData] = useState({
    side: 'buy',
    quantity: 0,
    price: 99.85,
  });

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeTransaction | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'blue';
      case 'validating': return 'orange';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <IconCheck size={14} />;
      case 'pending': return <IconClock size={14} />;
      case 'validating': return <IconRefresh size={14} />;
      case 'rejected': return <IconX size={14} />;
      default: return <IconClock size={14} />;
    }
  };

  const simulateCMTATValidation = async (trade: Omit<TradeTransaction, 'id' | 'timestamp' | 'validationSteps' | 'status'>) => {
    const newTrade: TradeTransaction = {
      ...trade,
      id: `tx_${Date.now()}`,
      timestamp: new Date(),
      status: 'validating',
      validationSteps: {
        transferRules: false,
        allowlist: false,
        pauseCheck: false,
        balanceCheck: false,
      },
    };

    setRecentTrades(prev => [newTrade, ...prev]);

    // Simulate validation steps
    const steps = ['transferRules', 'allowlist', 'pauseCheck', 'balanceCheck'] as const;

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRecentTrades(prev =>
        Array.isArray(prev) ? prev.map(t =>
          t && t.id === newTrade.id
            ? { ...t, validationSteps: { ...t.validationSteps, [step]: true } }
            : t
        ) : []
      );
    }

    // Final validation result
    await new Promise(resolve => setTimeout(resolve, 500));

    const isValid = Math.random() > 0.2; // 80% success rate
    const finalStatus = isValid ? 'completed' : 'rejected';
    const reason = isValid ? undefined : 'CMTAT validation failed: Insufficient allowance';

    setRecentTrades(prev =>
      Array.isArray(prev) ? prev.map(t =>
        t && t.id === newTrade.id
          ? { ...t, status: finalStatus, reason }
          : t
      ) : []
    );

    notifications.show({
      title: isValid ? 'Trade Executed' : 'Trade Rejected',
      message: isValid ? 'CMTAT validation passed, trade completed' : reason,
      color: isValid ? 'green' : 'red',
      icon: isValid ? <IconCheck size={16} /> : <IconX size={16} />,
    });
  };

  const handlePlaceOrder = async () => {
    if (!orderFormData.quantity || !orderFormData.price) {
      notifications.show({
        title: 'Invalid Order',
        message: 'Please enter valid quantity and price',
        color: 'orange',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    setIsPlacingOrder(true);

    const trade = {
      side: orderFormData.side as 'buy' | 'sell',
      quantity: orderFormData.quantity,
      price: orderFormData.price,
      buyer: orderFormData.side === 'buy' ? '0x1234...5678' : '0x9abc...def0',
      seller: orderFormData.side === 'sell' ? '0x1234...5678' : '0x9abc...def0',
    };

    await simulateCMTATValidation(trade);
    setIsPlacingOrder(false);
  };

  const viewTradeDetails = (trade: TradeTransaction) => {
    setSelectedTrade(trade);
    setShowValidationModal(true);
  };

  return (
    <Stack gap="lg">
      {/* CMTAT Status Banner */}
      <Alert icon={<IconShield size={16} />} color="blue">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={500}>CMTAT Validation Active</Text>
            <Text size="xs">
              All trades are validated through CMTAT compliance rules before execution
            </Text>
          </div>
          <Group>
            <Badge color="green">Compliance: {cmtatValidation.complianceScore}%</Badge>
            <Badge color={cmtatValidation.contractPaused ? 'red' : 'green'}>
              {cmtatValidation.contractPaused ? 'Paused' : 'Active'}
            </Badge>
          </Group>
        </Group>
      </Alert>

      <Grid>
        {/* Order Book */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder p="lg">
            <Group justify="space-between" mb="md">
              <div>
                <Title order={4}>Order Book - {selectedBond.name}</Title>
                <Text size="sm" c="dimmed">Real-time market depth with CMTAT validation</Text>
                <Group gap="xs" mt={4}>
                  <Badge size="xs" color="blue">CMTAT</Badge>
                  <Badge size="xs" color="green">{selectedBond.rating}</Badge>
                  <Badge size="xs" color="orange">{selectedBond.currency}</Badge>
                  {orderBookSnapshot && (
                    <Badge size="xs" color="purple">
                      Spread: {orderBookSnapshot.spreadBps.toFixed(1)} bps
                    </Badge>
                  )}
                </Group>
              </div>
              <Group>
                <div style={{ textAlign: 'right' }}>
                  <Text size="lg" fw={700}>{selectedBond.currency === 'USD' ? '$' : '€'}{currentPrice.toFixed(3)}</Text>
                  <Badge color={priceChange >= 0 ? 'green' : 'red'} leftSection={
                    priceChange >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />
                  }>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(3)}
                  </Badge>
                </div>
                {orderBookSnapshot && (
                  <ActionIcon
                    variant="light"
                    size="sm"
                    onClick={() => {
                      const snapshot = generateOrderBookData.snapshot(selectedBond.id, 15);
                      setOrderBookSnapshot(snapshot);
                    }}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} mb="xs" c="green">Bids</Text>
                <Table size="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Total</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Array.isArray(orderBook.bids) ? orderBook.bids.slice(0, 5).map((bid, index) => (
                      <Table.Tr key={index}>
                        <Table.Td c="green">{selectedBond.currency === 'USD' ? '$' : '€'}{bid.price.toFixed(3)}</Table.Td>
                        <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{(bid.quantity / 1000000).toFixed(1)}M</Table.Td>
                        <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{(bid.total / 1000000).toFixed(1)}M</Table.Td>
                      </Table.Tr>
                    )) : []}
                  </Table.Tbody>
                </Table>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} mb="xs" c="red">Asks</Text>
                <Table size="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Total</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Array.isArray(orderBook.asks) ? orderBook.asks.slice(0, 5).map((ask, index) => (
                      <Table.Tr key={index}>
                        <Table.Td c="red">{selectedBond.currency === 'USD' ? '$' : '€'}{ask.price.toFixed(3)}</Table.Td>
                        <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{(ask.quantity / 1000000).toFixed(1)}M</Table.Td>
                        <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{(ask.total / 1000000).toFixed(1)}M</Table.Td>
                      </Table.Tr>
                    )) : []}
                  </Table.Tbody>
                </Table>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Trading Panel */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg">
            <Title order={5} mb="md">Place Order</Title>
            <Stack gap="md">
              <Select
                label="Side"
                value={orderFormData.side}
                onChange={(value) => setOrderFormData(prev => ({ ...prev, side: value || 'buy' }))}
                data={[
                  { value: 'buy', label: 'Buy' },
                  { value: 'sell', label: 'Sell' },
                ]}
              />
              <NumberInput
                label={`Quantity (${selectedBond.currency})`}
                value={orderFormData.quantity}
                onChange={(value) => setOrderFormData(prev => ({ ...prev, quantity: Number(value) || 0 }))}
                thousandSeparator=","
                min={0}
              />
              <NumberInput
                label={`Price (${selectedBond.currency} per token)`}
                value={orderFormData.price}
                onChange={(value) => setOrderFormData(prev => ({ ...prev, price: Number(value) || 0 }))}
                decimalScale={3}
                min={0}
              />
              <Button
                fullWidth
                color={orderFormData.side === 'buy' ? 'green' : 'red'}
                onClick={handlePlaceOrder}
                loading={isPlacingOrder}
                disabled={cmtatValidation.contractPaused}
              >
                {orderFormData.side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
              </Button>
              {cmtatValidation.contractPaused && (
                <Text size="xs" c="red">
                  Trading paused by CMTAT compliance
                </Text>
              )}
            </Stack>
          </Card>

          {/* Market Metrics */}
          {orderBookSnapshot && (
            <Card withBorder p="lg" mt="md">
              <Title order={6} mb="md">Market Metrics</Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Bid Volume</Text>
                  <Text size="sm" fw={500}>
                    {selectedBond.currency === 'USD' ? '$' : '€'}{(orderBookSnapshot.totalBidVolume / 1000000).toFixed(1)}M
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Ask Volume</Text>
                  <Text size="sm" fw={500}>
                    {selectedBond.currency === 'USD' ? '$' : '€'}{(orderBookSnapshot.totalAskVolume / 1000000).toFixed(1)}M
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Market Depth</Text>
                  <Text size="sm" fw={500}>
                    {selectedBond.currency === 'USD' ? '$' : '€'}{(orderBookSnapshot.marketCapacity / 1000000).toFixed(1)}M
                  </Text>
                </Group>
              </Stack>
            </Card>
          )}

          {/* CMTAT Validation Status */}
          <Card withBorder p="lg" mt="md">
            <Title order={6} mb="md">CMTAT Validation</Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Transfer Rules</Text>
                <Badge color={cmtatValidation.transferRulesActive ? 'green' : 'red'} size="sm">
                  {cmtatValidation.transferRulesActive ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Contract Status</Text>
                <Badge color={cmtatValidation.contractPaused ? 'red' : 'green'} size="sm">
                  {cmtatValidation.contractPaused ? 'Paused' : 'Active'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Allowlist</Text>
                <Badge color={cmtatValidation.allowlistEnabled ? 'blue' : 'gray'} size="sm">
                  {cmtatValidation.allowlistEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </Group>
              <Progress value={cmtatValidation.complianceScore} color="blue" size="sm" />
              <Text size="xs" c="dimmed" ta="center">
                Compliance Score: {cmtatValidation.complianceScore}%
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recent Trades */}
      <Card withBorder p="lg">
        <Title order={4} mb="md">Recent Trades & CMTAT Validation</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Time</Table.Th>
              <Table.Th>Side</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Validation</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.isArray(recentTrades) ? recentTrades.map((trade) => (
              <Table.Tr key={trade.id}>
                <Table.Td>
                  <Text size="sm">{trade.timestamp.toLocaleTimeString()}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={trade.side === 'buy' ? 'green' : 'red'} size="sm">
                    {trade.side.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{(trade.quantity / 1000000).toFixed(1)}M</Table.Td>
                <Table.Td>{selectedBond.currency === 'USD' ? '$' : '€'}{trade.price.toFixed(3)}</Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(trade.status)} size="sm" leftSection={getStatusIcon(trade.status)}>
                    {trade.status.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Transfer Rules">
                      <ActionIcon size="xs" color={trade.validationSteps.transferRules ? 'green' : 'gray'}>
                        <IconShield size={10} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Allowlist Check">
                      <ActionIcon size="xs" color={trade.validationSteps.allowlist ? 'green' : 'red'}>
                        <IconCheck size={10} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Balance Check">
                      <ActionIcon size="xs" color={trade.validationSteps.balanceCheck ? 'green' : 'gray'}>
                        <IconCheck size={10} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="light"
                    size="sm"
                    onClick={() => viewTradeDetails(trade)}
                  >
                    <IconEye size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            )) : []}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Trade Validation Details Modal */}
      <Modal
        opened={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="CMTAT Validation Details"
        size="lg"
      >
        {selectedTrade && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Trade ID</Text>
                <Code>{selectedTrade.id}</Code>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Status</Text>
                <Badge color={getStatusColor(selectedTrade.status)}>
                  {selectedTrade.status.toUpperCase()}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Buyer</Text>
                <Code>{selectedTrade.buyer}</Code>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500}>Seller</Text>
                <Code>{selectedTrade.seller}</Code>
              </Grid.Col>
            </Grid>

            <div>
              <Text size="sm" fw={500} mb="md">CMTAT Validation Steps</Text>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Transfer Rules Check</Text>
                  <Badge color={selectedTrade.validationSteps.transferRules ? 'green' : 'gray'}>
                    {selectedTrade.validationSteps.transferRules ? 'Passed' : 'Pending'}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Allowlist Verification</Text>
                  <Badge color={selectedTrade.validationSteps.allowlist ? 'green' : (selectedTrade.status === 'rejected' ? 'red' : 'gray')}>
                    {selectedTrade.validationSteps.allowlist ? 'Passed' : (selectedTrade.status === 'rejected' ? 'Failed' : 'Pending')}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Pause Status Check</Text>
                  <Badge color={selectedTrade.validationSteps.pauseCheck ? 'green' : 'gray'}>
                    {selectedTrade.validationSteps.pauseCheck ? 'Passed' : 'Pending'}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Balance Verification</Text>
                  <Badge color={selectedTrade.validationSteps.balanceCheck ? 'green' : 'gray'}>
                    {selectedTrade.validationSteps.balanceCheck ? 'Passed' : 'Pending'}
                  </Badge>
                </Group>
              </Stack>
            </div>

            {selectedTrade.reason && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                <Text size="sm" fw={500}>Rejection Reason</Text>
                <Text size="sm">{selectedTrade.reason}</Text>
              </Alert>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}