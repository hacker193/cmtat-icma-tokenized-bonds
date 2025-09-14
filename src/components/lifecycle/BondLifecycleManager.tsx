'use client';

import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  Button,
  Progress,
  Timeline,
  Alert,
  Modal,
  NumberInput,
  Table,
  ActionIcon,
  Tooltip,
  Code,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCoin,
  IconCalendar,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconCalculator,
  IconFileText,
  IconShield,
  IconEye,
  IconDownload,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface CouponPayment {
  id: string;
  paymentDate: Date;
  rate: number;
  amount: number;
  status: 'upcoming' | 'processing' | 'completed' | 'failed';
  recipients: number;
  processedAt?: Date;
  transactionHash?: string;
}

interface MaturityEvent {
  maturityDate: Date;
  principalAmount: number;
  finalCouponAmount: number;
  totalRedemption: number;
  status: 'pending' | 'scheduled' | 'processing' | 'completed';
}

interface LifecycleEvent {
  id: string;
  type: 'coupon' | 'maturity' | 'call' | 'put';
  date: Date;
  description: string;
  status: 'completed' | 'upcoming' | 'processing';
  amount?: number;
  framework: 'ICMA' | 'CMTAT' | 'Both';
}

export function BondLifecycleManager() {
  const [bondDetails] = useState({
    isin: 'XS2524143554',
    name: 'Rabobank 3.875% 2032 Subordinated Notes',
    principalAmount: 75000000,
    couponRate: 3.875,
    frequency: 'Annual',
    maturityDate: new Date('2032-11-30'),
    nextCouponDate: new Date('2024-11-30'),
  });

  const [couponPayments, setCouponPayments] = useState<CouponPayment[]>([
    {
      id: 'cp_2024',
      paymentDate: new Date('2024-11-30'),
      rate: 3.875,
      amount: 2906250, // 75M * 3.875%
      status: 'upcoming',
      recipients: 1247,
    },
    {
      id: 'cp_2023',
      paymentDate: new Date('2023-11-30'),
      rate: 3.875,
      amount: 2906250,
      status: 'completed',
      recipients: 1189,
      processedAt: new Date('2023-11-30T10:00:00Z'),
      transactionHash: '0xabc123...def456',
    },
    {
      id: 'cp_2022',
      paymentDate: new Date('2022-11-30'),
      rate: 3.875,
      amount: 2906250,
      status: 'completed',
      recipients: 1156,
      processedAt: new Date('2022-11-30T10:00:00Z'),
      transactionHash: '0x789abc...123def',
    },
  ]);

  const [maturityEvent, setMaturityEvent] = useState<MaturityEvent>({
    maturityDate: new Date('2032-11-30'),
    principalAmount: 75000000,
    finalCouponAmount: 2906250,
    totalRedemption: 77906250,
    status: 'pending',
  });

  const [lifecycleHistory, setLifecycleHistory] = useState<LifecycleEvent[]>([
    {
      id: 'le_001',
      type: 'coupon',
      date: new Date('2023-11-30'),
      description: 'Annual coupon payment - 3.875%',
      status: 'completed',
      amount: 2906250,
      framework: 'Both',
    },
    {
      id: 'le_002',
      type: 'coupon',
      date: new Date('2022-11-30'),
      description: 'First coupon payment - 3.875%',
      status: 'completed',
      amount: 2906250,
      framework: 'Both',
    },
  ]);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showMaturityModal, setShowMaturityModal] = useState(false);
  const [isProcessingCoupon, setIsProcessingCoupon] = useState(false);

  const calculateDaysToEvent = (date: Date): number => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'upcoming': return 'blue';
      case 'processing': return 'orange';
      case 'failed': return 'red';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getFrameworkBadgeColor = (framework: string) => {
    switch (framework) {
      case 'ICMA': return 'green';
      case 'CMTAT': return 'blue';
      case 'Both': return 'purple';
      default: return 'gray';
    }
  };

  const processCouponPayment = async () => {
    setIsProcessingCoupon(true);

    // Simulate coupon processing
    setTimeout(() => {
      const upcomingCoupon = couponPayments.find(cp => cp.status === 'upcoming');
      if (upcomingCoupon) {
        setCouponPayments(prev =>
          Array.isArray(prev) ? prev.map(cp =>
            cp && cp.id === upcomingCoupon.id
              ? {
                  ...cp,
                  status: 'processing',
                }
              : cp
          ) : []
        );

        // Complete after another delay
        setTimeout(() => {
          setCouponPayments(prev =>
            Array.isArray(prev) ? prev.map(cp =>
              cp && cp.id === upcomingCoupon.id
                ? {
                    ...cp,
                    status: 'completed',
                    processedAt: new Date(),
                    transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 6)}`,
                  }
                : cp
            ) : []
          );

          // Add to lifecycle history
          setLifecycleHistory(prev => [
            {
              id: `le_${Date.now()}`,
              type: 'coupon',
              date: new Date(),
              description: `Coupon payment executed - ${upcomingCoupon.rate}%`,
              status: 'completed',
              amount: upcomingCoupon.amount,
              framework: 'Both',
            },
            ...prev,
          ]);

          setIsProcessingCoupon(false);
          setShowCouponModal(false);

          notifications.show({
            title: 'Coupon Payment Executed',
            message: `€${(upcomingCoupon.amount / 1000000).toFixed(2)}M distributed to ${upcomingCoupon.recipients} holders`,
            color: 'green',
            icon: <IconCheck size={16} />,
          });
        }, 3000);
      }
    }, 2000);
  };

  const scheduleMaturityRedemption = () => {
    setMaturityEvent(prev => ({ ...prev, status: 'scheduled' }));
    setShowMaturityModal(false);

    notifications.show({
      title: 'Maturity Redemption Scheduled',
      message: `€${(maturityEvent.totalRedemption / 1000000).toFixed(1)}M redemption scheduled for ${maturityEvent.maturityDate.toLocaleDateString()}`,
      color: 'blue',
      icon: <IconCalendar size={16} />,
    });
  };

  return (
    <Stack gap="lg">
      {/* Bond Overview */}
      <Card withBorder p="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Bond Lifecycle Management</Title>
            <Text size="sm" c="dimmed">
              ICMA-compliant lifecycle events with CMTAT tokenized execution
            </Text>
          </div>
          <Group>
            <Badge color="green" leftSection={<IconFileText size={14} />}>
              ICMA Standards
            </Badge>
            <Badge color="blue" leftSection={<IconShield size={14} />}>
              CMTAT Execution
            </Badge>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500}>ISIN</Text>
            <Code>{bondDetails.isin}</Code>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500}>Principal Amount</Text>
            <Text>€{(bondDetails.principalAmount / 1000000).toFixed(0)}M</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500}>Coupon Rate</Text>
            <Text>{bondDetails.couponRate}% {bondDetails.frequency}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500}>Maturity Date</Text>
            <Text>{bondDetails.maturityDate.toLocaleDateString()}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      <Grid>
        {/* Upcoming Coupon Payment */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg" h="100%">
            <Group justify="space-between" mb="md">
              <div>
                <Title order={4}>Upcoming Coupon Payment</Title>
                <Text size="sm" c="dimmed">Next scheduled payment</Text>
              </div>
              <Badge color="blue" leftSection={<IconCoin size={14} />}>
                {calculateDaysToEvent(bondDetails.nextCouponDate)} days
              </Badge>
            </Group>

            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Payment Date</Text>
                  <Text>{bondDetails.nextCouponDate.toLocaleDateString()}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Coupon Rate</Text>
                  <Text>{bondDetails.couponRate}%</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Payment Amount</Text>
                  <Text>€{(2906250 / 1000000).toFixed(2)}M</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Recipients</Text>
                  <Text>1,247 holders</Text>
                </Grid.Col>
              </Grid>

              <Alert icon={<IconAlertTriangle size={16} />} color="blue">
                Payment will be executed through CMTAT smart contract with automatic distribution to all eligible holders.
              </Alert>

              <Button
                color="green"
                leftSection={<IconCoin size={16} />}
                onClick={() => setShowCouponModal(true)}
                loading={isProcessingCoupon}
                disabled={calculateDaysToEvent(bondDetails.nextCouponDate) > 7}
              >
                Execute Coupon Payment
              </Button>
              {calculateDaysToEvent(bondDetails.nextCouponDate) > 7 && (
                <Text size="xs" c="dimmed">
                  Payment can be executed 7 days before due date
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Maturity Redemption */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg" h="100%">
            <Group justify="space-between" mb="md">
              <div>
                <Title order={4}>Maturity Redemption</Title>
                <Text size="sm" c="dimmed">Principal + final coupon</Text>
              </div>
              <Badge color={getStatusColor(maturityEvent.status)}>
                {maturityEvent.status.toUpperCase()}
              </Badge>
            </Group>

            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Maturity Date</Text>
                  <Text>{maturityEvent.maturityDate.toLocaleDateString()}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Days to Maturity</Text>
                  <Text>{calculateDaysToEvent(maturityEvent.maturityDate)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Principal Amount</Text>
                  <Text>€{(maturityEvent.principalAmount / 1000000).toFixed(0)}M</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Final Coupon</Text>
                  <Text>€{(maturityEvent.finalCouponAmount / 1000000).toFixed(2)}M</Text>
                </Grid.Col>
              </Grid>

              <div>
                <Text size="sm" fw={500} mb="xs">Total Redemption Amount</Text>
                <Text size="lg" fw={700}>€{(maturityEvent.totalRedemption / 1000000).toFixed(2)}M</Text>
              </div>

              <Progress
                value={Math.max(0, 100 - (calculateDaysToEvent(maturityEvent.maturityDate) / (8 * 365)) * 100)}
                color="blue"
                size="sm"
              />

              <Button
                variant="light"
                leftSection={<IconCalendar size={16} />}
                onClick={() => setShowMaturityModal(true)}
                disabled={maturityEvent.status !== 'pending'}
              >
                Schedule Redemption
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Coupon Payment History */}
      <Card withBorder p="lg">
        <Title order={4} mb="md">Coupon Payment History</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Payment Date</Table.Th>
              <Table.Th>Rate</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Recipients</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Transaction</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.isArray(couponPayments) ? couponPayments.map((payment) => (
              <Table.Tr key={payment.id}>
                <Table.Td>{payment.paymentDate.toLocaleDateString()}</Table.Td>
                <Table.Td>{payment.rate}%</Table.Td>
                <Table.Td>€{(payment.amount / 1000000).toFixed(2)}M</Table.Td>
                <Table.Td>{payment.recipients.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(payment.status)} size="sm">
                    {payment.status.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {payment.transactionHash ? (
                    <Tooltip label="View transaction">
                      <Code style={{ cursor: 'pointer' }}>
                        {payment.transactionHash.substring(0, 10)}...
                      </Code>
                    </Tooltip>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <ActionIcon variant="light" size="sm">
                    <IconEye size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            )) : []}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Lifecycle Timeline */}
      <Card withBorder p="lg">
        <Title order={4} mb="md">Lifecycle Events Timeline</Title>
        <Timeline active={lifecycleHistory.length}>
          {Array.isArray(lifecycleHistory) ? lifecycleHistory.map((event, index) => (
            <Timeline.Item
              key={event.id}
              bullet={
                event.type === 'coupon' ? <IconCoin size={12} /> : <IconCalendar size={12} />
              }
              title={
                <Group>
                  <Text fw={500}>{event.description}</Text>
                  <Badge color={getFrameworkBadgeColor(event.framework)} size="xs">
                    {event.framework}
                  </Badge>
                </Group>
              }
            >
              <Group>
                <Text size="sm" c="dimmed">{event.date.toLocaleDateString()}</Text>
                {event.amount && (
                  <Text size="sm">€{(event.amount / 1000000).toFixed(2)}M</Text>
                )}
                <Badge color={getStatusColor(event.status)} size="xs">
                  {event.status}
                </Badge>
              </Group>
            </Timeline.Item>
          )) : []}
        </Timeline>
      </Card>

      {/* Coupon Payment Modal */}
      <Modal
        opened={showCouponModal}
        onClose={() => !isProcessingCoupon && setShowCouponModal(false)}
        title="Execute Coupon Payment"
        closeOnClickOutside={!isProcessingCoupon}
        closeOnEscape={!isProcessingCoupon}
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} color="blue">
            This will execute the coupon payment through the CMTAT smart contract, automatically distributing payments to all eligible token holders.
          </Alert>

          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Payment Date</Text>
              <Text>{bondDetails.nextCouponDate.toLocaleDateString()}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Total Amount</Text>
              <Text>€{(2906250 / 1000000).toFixed(2)}M</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Recipients</Text>
              <Text>1,247 holders</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Rate</Text>
              <Text>{bondDetails.couponRate}%</Text>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setShowCouponModal(false)}
              disabled={isProcessingCoupon}
            >
              Cancel
            </Button>
            <Button
              color="green"
              onClick={processCouponPayment}
              loading={isProcessingCoupon}
              leftSection={<IconCoin size={16} />}
            >
              Execute Payment
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Maturity Redemption Modal */}
      <Modal
        opened={showMaturityModal}
        onClose={() => setShowMaturityModal(false)}
        title="Schedule Maturity Redemption"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} color="orange">
            Scheduling maturity redemption will prepare the smart contract for automatic redemption on the maturity date.
          </Alert>

          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Maturity Date</Text>
              <Text>{maturityEvent.maturityDate.toLocaleDateString()}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Principal</Text>
              <Text>€{(maturityEvent.principalAmount / 1000000).toFixed(0)}M</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Final Coupon</Text>
              <Text>€{(maturityEvent.finalCouponAmount / 1000000).toFixed(2)}M</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>Total Redemption</Text>
              <Text size="lg" fw={700}>€{(maturityEvent.totalRedemption / 1000000).toFixed(2)}M</Text>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowMaturityModal(false)}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={scheduleMaturityRedemption}
              leftSection={<IconCalendar size={16} />}
            >
              Schedule Redemption
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}