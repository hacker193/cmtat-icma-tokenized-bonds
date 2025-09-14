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
  ActionIcon,
  Progress,
  Alert,
  Tabs,
  Table,
  Modal,
  TextInput,
  Switch,
  Code,
} from '@mantine/core';
import {
  IconShield,
  IconLock,
  IconPlayerPause,
  IconEye,
  IconUserX,
  IconCameraDollar,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconSettings,
  IconUsers,
  IconActivity,
  IconBan,
  IconPlayerStop,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { cmtatDemoData } from '@/data/cmtatDemoData';

interface ComplianceStatus {
  contractStatus: 'active' | 'paused' | 'stopped';
  totalSupply: number;
  totalHolders: number;
  frozenAccounts: number;
  pausedTransfers: boolean;
  lastSnapshot: {
    blockNumber: number;
    timestamp: Date;
    totalSupply: number;
  };
}

interface AccountInfo {
  address: string;
  balance: number;
  frozen: boolean;
  lastActivity: Date;
  riskScore: 'low' | 'medium' | 'high';
}

interface TransferRule {
  id: string;
  name: string;
  active: boolean;
  description: string;
}

export function CMTATComplianceDashboard() {
  // Use real CMTAT demo data
  const tokenHolders = cmtatDemoData.tokenHolders;
  const complianceRules = cmtatDemoData.complianceRules;
  const transferEvents = cmtatDemoData.transferEvents;
  const pauseEvents = cmtatDemoData.pauseEvents;

  // Calculate compliance metrics from real data
  const totalSupply = tokenHolders.reduce((sum, holder) => sum + holder.balance, 0);
  const frozenAccountsCount = tokenHolders.filter(holder => holder.complianceFlags.includes('frozen')).length;
  const kycPendingCount = tokenHolders.filter(holder => holder.kycStatus === 'pending').length;

  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    contractStatus: 'active',
    totalSupply,
    totalHolders: tokenHolders.length,
    frozenAccounts: frozenAccountsCount,
    pausedTransfers: false,
    lastSnapshot: {
      blockNumber: 18954231,
      timestamp: new Date('2025-01-14T10:30:00Z'),
      totalSupply,
    },
  });

  // Convert CMTAT token holders to AccountInfo format
  const [accounts, setAccounts] = useState<AccountInfo[]>(
    Array.isArray(tokenHolders) ? tokenHolders.map(holder => ({
      address: holder?.address || '',
      balance: holder?.balance || 0,
      frozen: Array.isArray(holder?.complianceFlags) ? holder.complianceFlags.includes('frozen') : false,
      lastActivity: new Date(holder?.lastTransactionDate || Date.now()),
      riskScore: (holder?.riskScore || 0) <= 3 ? 'low' : (holder?.riskScore || 0) <= 6 ? 'medium' : 'high',
    })) : []
  );

  // Convert CMTAT compliance rules to TransferRule format
  const [transferRules, setTransferRules] = useState<TransferRule[]>(
    Array.isArray(complianceRules) ? complianceRules.map(rule => ({
      id: rule?.id || '',
      name: rule?.name || '',
      active: rule?.isActive || false,
      description: rule?.description || '',
    })) : []
  );

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeAddress, setFreezeAddress] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handlePauseContract = async () => {
    setActionInProgress('pause');
    setTimeout(() => {
      setComplianceStatus(prev => ({
        ...prev,
        contractStatus: prev.contractStatus === 'paused' ? 'active' : 'paused',
        pausedTransfers: !prev.pausedTransfers,
      }));
      setActionInProgress(null);
      notifications.show({
        title: complianceStatus.contractStatus === 'paused' ? 'Contract Resumed' : 'Contract Paused',
        message: `All transfers have been ${complianceStatus.contractStatus === 'paused' ? 'resumed' : 'paused'}`,
        color: complianceStatus.contractStatus === 'paused' ? 'green' : 'orange',
        icon: complianceStatus.contractStatus === 'paused' ? <IconCheck size={16} /> : <IconPlayerPause size={16} />,
      });
    }, 2000);
  };

  const handleEmergencyStop = async () => {
    setActionInProgress('stop');
    setTimeout(() => {
      setComplianceStatus(prev => ({
        ...prev,
        contractStatus: 'stopped',
        pausedTransfers: true,
      }));
      setActionInProgress(null);
      notifications.show({
        title: 'Emergency Stop Activated',
        message: 'Contract has been stopped - all functions disabled',
        color: 'red',
        icon: <IconBan size={16} />,
      });
    }, 2000);
  };

  const handleTakeSnapshot = async () => {
    setActionInProgress('snapshot');
    setTimeout(() => {
      const newSnapshot = {
        blockNumber: complianceStatus.lastSnapshot.blockNumber + 1000,
        timestamp: new Date(),
        totalSupply: complianceStatus.totalSupply,
      };
      setComplianceStatus(prev => ({
        ...prev,
        lastSnapshot: newSnapshot,
      }));
      setActionInProgress(null);
      notifications.show({
        title: 'Snapshot Taken',
        message: `Snapshot created at block ${newSnapshot.blockNumber}`,
        color: 'blue',
        icon: <IconCameraDollar size={16} />,
      });
    }, 1500);
  };

  const handleFreezeAccount = async () => {
    if (!freezeAddress) return;

    setActionInProgress('freeze');
    setTimeout(() => {
      setAccounts(prev =>
        Array.isArray(prev) ? prev.map(acc =>
          acc && acc.address === freezeAddress ? { ...acc, frozen: true } : acc
        ) : []
      );
      setComplianceStatus(prev => ({
        ...prev,
        frozenAccounts: prev.frozenAccounts + 1,
      }));
      setShowFreezeModal(false);
      setFreezeAddress('');
      setActionInProgress(null);
      notifications.show({
        title: 'Account Frozen',
        message: `Account ${freezeAddress} has been frozen`,
        color: 'red',
        icon: <IconUserX size={16} />,
      });
    }, 1500);
  };

  const toggleTransferRule = (ruleId: string) => {
    setTransferRules(prev =>
      Array.isArray(prev) ? prev.map(rule =>
        rule && rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      ) : []
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'orange';
      case 'stopped': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      {/* Status Overview */}
      <Card withBorder p="lg">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={3}>CMTAT Compliance Dashboard</Title>
            <Text size="sm" c="dimmed">
              Real-time monitoring and control of tokenized bond compliance
            </Text>
          </div>
          <Group>
            <Badge color="blue" leftSection={<IconShield size={14} />}>
              CMTAT v3.0
            </Badge>
            <Badge color={getStatusColor(complianceStatus.contractStatus)} leftSection={<IconActivity size={14} />}>
              {complianceStatus.contractStatus.toUpperCase()}
            </Badge>
          </Group>
        </Group>

        {complianceStatus.contractStatus === 'stopped' && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" mb="lg">
            Emergency stop is active. All contract functions are disabled.
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder p="md">
              <Text size="sm" fw={500} mb="xs">Total Supply</Text>
              <Text size="lg" fw={700}>€{(complianceStatus.totalSupply / 1000000).toFixed(1)}M</Text>
              <Text size="xs" c="dimmed">{complianceStatus.totalSupply.toLocaleString()} tokens</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder p="md">
              <Text size="sm" fw={500} mb="xs">Token Holders</Text>
              <Text size="lg" fw={700}>{complianceStatus.totalHolders.toLocaleString()}</Text>
              <Text size="xs" c="dimmed">Active accounts</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder p="md">
              <Text size="sm" fw={500} mb="xs">Frozen Accounts</Text>
              <Text size="lg" fw={700} c="red">{complianceStatus.frozenAccounts}</Text>
              <Text size="xs" c="dimmed">Compliance actions</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder p="md">
              <Text size="sm" fw={500} mb="xs">Last Snapshot</Text>
              <Text size="lg" fw={700}>#{complianceStatus.lastSnapshot.blockNumber}</Text>
              <Text size="xs" c="dimmed">
                {complianceStatus.lastSnapshot.timestamp.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Action Controls */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={5}>Contract Controls</Title>
              <Badge color={getStatusColor(complianceStatus.contractStatus)}>
                {complianceStatus.contractStatus}
              </Badge>
            </Group>
            <Stack gap="sm">
              <Button
                variant="light"
                color={complianceStatus.contractStatus === 'paused' ? 'green' : 'orange'}
                leftSection={<IconPlayerStop size={16} />}
                onClick={handlePauseContract}
                loading={actionInProgress === 'pause'}
                disabled={complianceStatus.contractStatus === 'stopped'}
                fullWidth
              >
                {complianceStatus.contractStatus === 'paused' ? 'Resume' : 'Pause'} Transfers
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconBan size={16} />}
                onClick={handleEmergencyStop}
                loading={actionInProgress === 'stop'}
                disabled={complianceStatus.contractStatus === 'stopped'}
                fullWidth
              >
                Emergency Stop
              </Button>
              <Button
                variant="light"
                color="blue"
                leftSection={<IconCameraDollar size={16} />}
                onClick={handleTakeSnapshot}
                loading={actionInProgress === 'snapshot'}
                disabled={complianceStatus.contractStatus === 'stopped'}
                fullWidth
              >
                Take Snapshot
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg" h="100%">
            <Title order={5} mb="md">Transfer Rules</Title>
            <Stack gap="sm">
              {Array.isArray(transferRules) ? transferRules.map((rule) => (
                <Group key={rule.id} justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>{rule.name}</Text>
                    <Text size="xs" c="dimmed">{rule.description}</Text>
                  </div>
                  <Switch
                    checked={rule.active}
                    onChange={() => toggleTransferRule(rule.id)}
                    color="blue"
                    size="sm"
                  />
                </Group>
              )) : []}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg" h="100%">
            <Title order={5} mb="md">Account Management</Title>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Active Accounts</Text>
                <Badge color="green">{complianceStatus.totalHolders}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Frozen Accounts</Text>
                <Badge color="red">{complianceStatus.frozenAccounts}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">KYC Pending</Text>
                <Badge color="orange">{kycPendingCount}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Transfer Events (24h)</Text>
                <Badge color="blue">{transferEvents.length}</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Compliance Score</Text>
                <Badge color="green">
                  {((complianceRules.filter(rule => rule.isActive).length / complianceRules.length) * 100).toFixed(1)}%
                </Badge>
              </Group>
              <Button
                size="sm"
                variant="light"
                color="red"
                leftSection={<IconUserX size={14} />}
                onClick={() => setShowFreezeModal(true)}
                disabled={complianceStatus.contractStatus === 'stopped'}
                fullWidth
              >
                Freeze Account
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Account Details */}
      <Card withBorder p="lg">
        <Title order={4} mb="md">Account Overview</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Address</Table.Th>
              <Table.Th>Balance</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Risk Score</Table.Th>
              <Table.Th>Last Activity</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.isArray(accounts) ? accounts.map((account, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Code>{account.address}</Code>
                </Table.Td>
                <Table.Td>€{(account.balance / 1000000).toFixed(1)}M</Table.Td>
                <Table.Td>
                  <Badge color={account.frozen ? 'red' : 'green'} size="sm">
                    {account.frozen ? 'Frozen' : 'Active'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getRiskColor(account.riskScore)} size="sm">
                    {account.riskScore.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{account.lastActivity.toLocaleDateString()}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="light"
                    color={account.frozen ? 'green' : 'red'}
                    size="sm"
                  >
                    {account.frozen ? <IconCheck size={14} /> : <IconLock size={14} />}
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            )) : []}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Recent Transfer Events */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Title order={5} mb="md">Recent Transfer Events</Title>
            <Stack gap="sm">
              {Array.isArray(transferEvents) ? transferEvents.slice(0, 5).map((event) => (
                <Group key={event.id} justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {event.status === 'completed' ? '✅' : event.status === 'blocked' ? '❌' : '⏳'} {event.amount.toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {event.from.substring(0, 8)}...→{event.to.substring(0, 8)}...
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge size="xs" color={event.status === 'completed' ? 'green' : event.status === 'blocked' ? 'red' : 'yellow'}>
                      {event.status}
                    </Badge>
                    <Text size="xs" c="dimmed">{event.timestamp}</Text>
                  </div>
                </Group>
              )) : []}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Title order={5} mb="md">Recent Compliance Actions</Title>
            <Stack gap="sm">
              {Array.isArray(pauseEvents) ? pauseEvents.map((event) => (
                <Group key={event.id} justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {event.action === 'pause' ? '⏸️' : event.action === 'unpause' ? '▶️' :
                       event.action === 'freeze_account' ? '🔒' : '🔓'} {event.reason}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Block #{event.blockNumber}
                      {event.targetAccount && ` • Target: ${event.targetAccount.substring(0, 8)}...`}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge size="xs" color={event.action.includes('freeze') ? 'red' : 'blue'}>
                      {event.action.replace('_', ' ')}
                    </Badge>
                    <Text size="xs" c="dimmed">{new Date(event.timestamp).toLocaleDateString()}</Text>
                  </div>
                </Group>
              )) : []}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Freeze Account Modal */}
      <Modal
        opened={showFreezeModal}
        onClose={() => setShowFreezeModal(false)}
        title="Freeze Account"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Enter the account address to freeze. This will prevent all transfers from/to this account.
          </Text>
          <TextInput
            label="Account Address"
            placeholder="0x..."
            value={freezeAddress}
            onChange={(e) => setFreezeAddress(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowFreezeModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleFreezeAccount}
              loading={actionInProgress === 'freeze'}
              disabled={!freezeAddress}
            >
              Freeze Account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}