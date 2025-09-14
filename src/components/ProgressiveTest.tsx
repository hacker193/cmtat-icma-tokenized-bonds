'use client';

import { useState } from 'react';
import { Container, Title, Text, Tabs, Paper, Stack, Group, Button, Badge, Grid, Card, Progress, Divider, Switch, NumberInput, Table, ActionIcon, Tooltip } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay, IconLock, IconLockOpen, IconCamera, IconTrendingUp, IconTrendingDown, IconShield } from '@tabler/icons-react';

// CMTAT v3.0 + ICMA BDT v1.2 Tokenized Bonds Platform
export default function ProgressiveTest() {
  const [testLevel, setTestLevel] = useState<'minimal' | 'basic-data' | 'simple-charts' | 'full'>('basic-data');
  const [isPaused, setIsPaused] = useState(false);
  const [frozenAccounts, setFrozenAccounts] = useState(new Set<string>());
  const [selectedBond, setSelectedBond] = useState<string | null>(null);

  const renderMinimalTest = () => (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Paper shadow="sm" radius="md" p="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} c="blue.7">🏦 CMTAT v3.0 + ICMA BDT v1.2 Platform</Title>
              <Text size="lg" c="dimmed">Comprehensive Tokenized Fixed Income Trading & Compliance</Text>
            </div>
            <Button.Group>
              <Button
                variant={testLevel === 'minimal' ? 'filled' : 'outline'}
                onClick={() => setTestLevel('minimal')}
                size="xs"
              >
                Minimal
              </Button>
              <Button
                variant={testLevel === 'basic-data' ? 'filled' : 'outline'}
                onClick={() => setTestLevel('basic-data')}
                size="xs"
              >
                Basic Data
              </Button>
              <Button
                variant={testLevel === 'simple-charts' ? 'filled' : 'outline'}
                onClick={() => setTestLevel('simple-charts')}
                size="xs"
                disabled
              >
                Charts (Disabled)
              </Button>
              <Button
                variant={testLevel === 'full' ? 'filled' : 'outline'}
                onClick={() => setTestLevel('full')}
                size="xs"
                disabled
              >
                Full (Disabled)
              </Button>
            </Button.Group>
          </Group>
        </Paper>

        <Tabs defaultValue="portfolio" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="portfolio">Portfolio</Tabs.Tab>
            <Tabs.Tab value="trading">Trading</Tabs.Tab>
            <Tabs.Tab value="risk">Risk Analytics</Tabs.Tab>
            <Tabs.Tab value="cmtat">CMTAT v3.0</Tabs.Tab>
            <Tabs.Tab value="icma">ICMA BDT v1.2</Tabs.Tab>
            <Tabs.Tab value="compliance">Compliance</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="portfolio" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Bond Portfolio Overview</Title>
              {renderDataTest()}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="trading" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Trading Interface</Title>
              {renderTradingInterface()}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="risk" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Risk Analytics Dashboard</Title>
              {renderRiskAnalytics()}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="cmtat" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">CMTAT v3.0 Token Management</Title>
              {renderCMTATControls()}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="icma" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">ICMA Bond Data Taxonomy v1.2</Title>
              {renderICMAFramework()}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="compliance" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Compliance Dashboard</Title>
              {renderComplianceDashboard()}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );

  // Trading Interface Component
  const renderTradingInterface = () => {
    const bonds = getComprehensiveBondData();

    if (!Array.isArray(bonds) || bonds.length === 0) {
      return <Text c="red">❌ No trading data available</Text>;
    }

    return (
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Order Book - {selectedBond ? bonds.find(b => b.id === selectedBond)?.name : 'Select a bond'}</Title>
              {selectedBond ? (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500} c="green">BUY Orders</Text>
                    <Text fw={500} c="red">SELL Orders</Text>
                  </Group>
                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm">$99.85</Text>
                          <Text size="sm" c="dimmed">500K</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">$99.80</Text>
                          <Text size="sm" c="dimmed">750K</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">$99.75</Text>
                          <Text size="sm" c="dimmed">1.2M</Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm">$100.15</Text>
                          <Text size="sm" c="dimmed">300K</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">$100.20</Text>
                          <Text size="sm" c="dimmed">650K</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">$100.25</Text>
                          <Text size="sm" c="dimmed">900K</Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              ) : (
                <Text c="dimmed">Select a bond from the portfolio to view order book</Text>
              )}
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Place Order</Title>
              <Stack gap="md">
                <Group>
                  <Button.Group>
                    <Button variant="filled" color="green" size="sm">BUY</Button>
                    <Button variant="outline" color="red" size="sm">SELL</Button>
                  </Button.Group>
                </Group>
                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  min={0}
                  max={1000000}
                  thousandSeparator=","
                />
                <NumberInput
                  label="Price"
                  placeholder="Enter price"
                  min={0}
                  max={200}
                  decimalScale={2}
                  prefix="$"
                />
                <Group>
                  <Button disabled={!selectedBond || isPaused}>
                    Place Order
                  </Button>
                  <Button variant="light">
                    Market Order
                  </Button>
                </Group>
                {isPaused && (
                  <Text size="sm" c="red">⚠️ Trading paused - CMTAT emergency mode active</Text>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Recent Transactions</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Time</Table.Th>
                <Table.Th>Bond</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>14:32:15</Table.Td>
                <Table.Td>US Treasury 10Y</Table.Td>
                <Table.Td><Badge color="green" size="sm">BUY</Badge></Table.Td>
                <Table.Td>100,000</Table.Td>
                <Table.Td>$98.50</Table.Td>
                <Table.Td>$9,850,000</Table.Td>
                <Table.Td><Badge color="green" size="sm">COMPLETED</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>14:28:42</Table.Td>
                <Table.Td>Apple Inc 2031</Table.Td>
                <Table.Td><Badge color="red" size="sm">SELL</Badge></Table.Td>
                <Table.Td>50,000</Table.Td>
                <Table.Td>$102.30</Table.Td>
                <Table.Td>$5,115,000</Table.Td>
                <Table.Td><Badge color="green" size="sm">COMPLETED</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>14:25:18</Table.Td>
                <Table.Td>German Bund 10Y</Table.Td>
                <Table.Td><Badge color="green" size="sm">BUY</Badge></Table.Td>
                <Table.Td>75,000</Table.Td>
                <Table.Td>$95.80</Table.Td>
                <Table.Td>$7,185,000</Table.Td>
                <Table.Td><Badge color="yellow" size="sm">PENDING</Badge></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    );
  };

  // Risk Analytics Component
  const renderRiskAnalytics = () => {
    const bonds = getComprehensiveBondData();

    if (!Array.isArray(bonds) || bonds.length === 0) {
      return <Text c="red">❌ No risk data available</Text>;
    }

    const creditRiskDistribution = {
      'AAA': bonds.filter(b => b.rating.startsWith('AAA')).length,
      'AA': bonds.filter(b => b.rating.startsWith('AA')).length,
      'A': bonds.filter(b => b.rating.startsWith('A')).length,
      'BBB': bonds.filter(b => b.rating.startsWith('BBB')).length
    };

    const currencyExposure = {
      'USD': bonds.filter(b => b.currency === 'USD').reduce((sum, b) => sum + b.marketCap, 0),
      'EUR': bonds.filter(b => b.currency === 'EUR').reduce((sum, b) => sum + b.marketCap, 0),
      'GBP': bonds.filter(b => b.currency === 'GBP').reduce((sum, b) => sum + b.marketCap, 0),
      'CHF': bonds.filter(b => b.currency === 'CHF').reduce((sum, b) => sum + b.marketCap, 0)
    };

    const totalPortfolio = Object.values(currencyExposure).reduce((sum, val) => sum + val, 0);

    return (
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={3}>
            <Card withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Portfolio VaR (1D)</Text>
              <Text size="xl" fw={700} c="red">$2.4M</Text>
              <Text size="xs" c="dimmed">99% confidence</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Duration Risk</Text>
              <Text size="xl" fw={700} c="orange">7.2 years</Text>
              <Text size="xs" c="dimmed">Modified duration</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Credit Risk</Text>
              <Text size="xl" fw={700} c="green">Low</Text>
              <Text size="xs" c="dimmed">Avg rating: AA+</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Liquidity Risk</Text>
              <Text size="xl" fw={700} c="blue">Medium</Text>
              <Text size="xs" c="dimmed">Avg daily vol: $2M</Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Credit Risk Distribution</Title>
              <Stack gap="sm">
                {Object.entries(creditRiskDistribution).map(([rating, count]) => (
                  <Group key={rating} justify="space-between">
                    <Text fw={500}>{rating}</Text>
                    <Group gap="xs">
                      <Progress
                        value={(count / bonds.length) * 100}
                        size="sm"
                        style={{ width: 100 }}
                        color={rating === 'AAA' ? 'green' : rating === 'AA' ? 'blue' : rating === 'A' ? 'yellow' : 'orange'}
                      />
                      <Text size="sm">{count} bonds</Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Currency Exposure</Title>
              <Stack gap="sm">
                {Object.entries(currencyExposure).map(([currency, amount]) => (
                  <Group key={currency} justify="space-between">
                    <Text fw={500}>{currency}</Text>
                    <Group gap="xs">
                      <Progress
                        value={(amount / totalPortfolio) * 100}
                        size="sm"
                        style={{ width: 100 }}
                        color="blue"
                      />
                      <Text size="sm">${(amount / 1000000).toFixed(0)}M</Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Risk Scenarios</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Scenario</Table.Th>
                <Table.Th>Interest Rate Change</Table.Th>
                <Table.Th>Credit Spread Change</Table.Th>
                <Table.Th>Portfolio Impact</Table.Th>
                <Table.Th>Probability</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td><Text fw={500}>Base Case</Text></Table.Td>
                <Table.Td>0%</Table.Td>
                <Table.Td>0 bps</Table.Td>
                <Table.Td><Text c="green">$0</Text></Table.Td>
                <Table.Td>35%</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Text fw={500}>Rate Rise</Text></Table.Td>
                <Table.Td>+100 bps</Table.Td>
                <Table.Td>+25 bps</Table.Td>
                <Table.Td><Text c="red">-$15.2M</Text></Table.Td>
                <Table.Td>25%</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Text fw={500}>Credit Stress</Text></Table.Td>
                <Table.Td>+50 bps</Table.Td>
                <Table.Td>+150 bps</Table.Td>
                <Table.Td><Text c="red">-$28.5M</Text></Table.Td>
                <Table.Td>15%</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Text fw={500}>Flight to Quality</Text></Table.Td>
                <Table.Td>-75 bps</Table.Td>
                <Table.Td>-50 bps</Table.Td>
                <Table.Td><Text c="green">+$12.8M</Text></Table.Td>
                <Table.Td>25%</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    );
  };

  // CMTAT Controls Component
  const renderCMTATControls = () => {
    const bonds = getComprehensiveBondData();

    return (
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={4}>
            <Paper withBorder p="md" style={{ textAlign: 'center' }}>
              <Stack gap="md">
                <IconShield size={48} color="var(--mantine-color-blue-6)" />
                <Title order={4}>Emergency Controls</Title>
                <Switch
                  label="Global Pause"
                  checked={isPaused}
                  onChange={(event) => setIsPaused(event.currentTarget.checked)}
                  size="lg"
                />
                <Text size="sm" c="dimmed">
                  Emergency stop for all token operations
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper withBorder p="md" style={{ textAlign: 'center' }}>
              <Stack gap="md">
                <IconCamera size={48} color="var(--mantine-color-green-6)" />
                <Title order={4}>Snapshot System</Title>
                <Button leftSection={<IconCamera size={16} />}>
                  Create Snapshot
                </Button>
                <Text size="sm" c="dimmed">
                  Capture balances for dividend distributions
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper withBorder p="md" style={{ textAlign: 'center' }}>
              <Stack gap="md">
                <IconLock size={48} color="var(--mantine-color-red-6)" />
                <Title order={4}>Account Management</Title>
                <Button leftSection={<IconLock size={16} />} color="red">
                  Freeze Account
                </Button>
                <Text size="sm" c="dimmed">
                  Individual account restrictions
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Token Status Overview</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Bond Token</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Total Supply</Table.Th>
                <Table.Th>Circulating</Table.Th>
                <Table.Th>Snapshots</Table.Th>
                <Table.Th>Last Snapshot</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bonds.slice(0, 6).map((bond) => (
                <Table.Tr key={bond.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">{bond.name}</Text>
                    <Text size="xs" c="dimmed">{bond.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={bond.cmtat.paused ? 'red' : 'green'}>
                      {bond.cmtat.paused ? 'PAUSED' : 'ACTIVE'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{(bond.marketCap / bond.faceValue).toLocaleString()}</Table.Td>
                  <Table.Td>{(bond.marketCap / bond.faceValue * 0.85).toLocaleString()}</Table.Td>
                  <Table.Td>{bond.cmtat.snapshots}</Table.Td>
                  <Table.Td>2024-01-15</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon size="sm" variant="light">
                        <IconPlayerPause size={12} />
                      </ActionIcon>
                      <ActionIcon size="sm" variant="light" color="red">
                        <IconLock size={12} />
                      </ActionIcon>
                      <ActionIcon size="sm" variant="light" color="blue">
                        <IconCamera size={12} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="md">
          <Title order={4} mb="md">CMTAT v3.0 Features</Title>
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Pause/Unpause Mechanism</Text>
                    <Text size="sm" c="dimmed">Emergency stop functionality for all transfers</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Freeze/Unfreeze Accounts</Text>
                    <Text size="sm" c="dimmed">Individual wallet restrictions for compliance</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Balance Snapshots</Text>
                    <Text size="sm" c="dimmed">Point-in-time balance capture for distributions</Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Transfer Restrictions</Text>
                    <Text size="sm" c="dimmed">Configurable rules for token movements</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>KYC/AML Integration</Text>
                    <Text size="sm" c="dimmed">Built-in compliance verification</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="green" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Regulatory Reporting</Text>
                    <Text size="sm" c="dimmed">Automated compliance data export</Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    );
  };

  // ICMA Framework Component
  const renderICMAFramework = () => {
    const bonds = getComprehensiveBondData();

    return (
      <Stack gap="lg">
        <Paper withBorder p="md">
          <Title order={4} mb="md">ICMA Bond Data Taxonomy v1.2 Implementation</Title>
          <Text mb="md">
            The International Capital Market Association's Bond Data Taxonomy provides standardized
            data classification and harmonization across global fixed income markets.
          </Text>

          <Grid>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Data Classification</Text>
                    <Text size="sm" c="dimmed">Standardized bond categorization system</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Cross-Market Harmonization</Text>
                    <Text size="sm" c="dimmed">Consistent data formats across markets</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Regulatory Reporting</Text>
                    <Text size="sm" c="dimmed">Automated compliance data generation</Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Market Transparency</Text>
                    <Text size="sm" c="dimmed">Enhanced data visibility and accessibility</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>Best Practice Implementation</Text>
                    <Text size="sm" c="dimmed">Industry-standard data management</Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="blue" size="lg">✓</Badge>
                  <div>
                    <Text fw={500}>International Standards</Text>
                    <Text size="sm" c="dimmed">Global regulatory compliance</Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Bond Classification Matrix</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Bond</Table.Th>
                <Table.Th>ICMA Classification</Table.Th>
                <Table.Th>Market Segment</Table.Th>
                <Table.Th>Regulatory Framework</Table.Th>
                <Table.Th>Reporting Status</Table.Th>
                <Table.Th>Data Quality</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bonds.slice(0, 8).map((bond) => (
                <Table.Tr key={bond.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">{bond.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{bond.icma.classification}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={bond.icma.segment === 'PRIMARY' ? 'green' : 'blue'}>
                      {bond.icma.segment}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {bond.currency === 'USD' ? 'SEC/CFTC' :
                       bond.currency === 'EUR' ? 'ESMA/ECB' :
                       bond.currency === 'GBP' ? 'FCA/BoE' : 'FINMA'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="green">{bond.icma.reporting}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Progress value={95} size="sm" color="green" />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Grid>
          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Data Harmonization Metrics</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Data Completeness</Text>
                  <Group gap="xs">
                    <Progress value={98} size="sm" style={{ width: 100 }} color="green" />
                    <Text size="sm">98%</Text>
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Schema Compliance</Text>
                  <Group gap="xs">
                    <Progress value={100} size="sm" style={{ width: 100 }} color="green" />
                    <Text size="sm">100%</Text>
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Cross-Market Consistency</Text>
                  <Group gap="xs">
                    <Progress value={95} size="sm" style={{ width: 100 }} color="green" />
                    <Text size="sm">95%</Text>
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Regulatory Alignment</Text>
                  <Group gap="xs">
                    <Progress value={100} size="sm" style={{ width: 100 }} color="green" />
                    <Text size="sm">100%</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Market Coverage</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Government Bonds</Text>
                  <Text fw={500}>{bonds.filter(b => b.category === 'Government').length} bonds</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Corporate Bonds</Text>
                  <Text fw={500}>{bonds.filter(b => b.category === 'Corporate').length} bonds</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Financial Institutions</Text>
                  <Text fw={500}>{bonds.filter(b => b.category === 'Financial').length} bonds</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Other Sectors</Text>
                  <Text fw={500}>{bonds.filter(b => !['Government', 'Corporate', 'Financial'].includes(b.category)).length} bonds</Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  // Compliance Dashboard Component
  const renderComplianceDashboard = () => {
    const bonds = getComprehensiveBondData();

    const complianceMetrics = {
      kycCompliant: bonds.filter(b => b.compliance.kyc).length,
      amlCompliant: bonds.filter(b => b.compliance.aml).length,
      mifidCompliant: bonds.filter(b => b.compliance.mifid).length,
      totalBonds: bonds.length
    };

    return (
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={3}>
            <Card withBorder style={{ textAlign: 'center' }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">KYC Compliance</Text>
              <Text size="xl" fw={700} c="green">
                {((complianceMetrics.kycCompliant / complianceMetrics.totalBonds) * 100).toFixed(0)}%
              </Text>
              <Text size="xs" c="dimmed">{complianceMetrics.kycCompliant}/{complianceMetrics.totalBonds} bonds</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder style={{ textAlign: 'center' }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">AML Compliance</Text>
              <Text size="xl" fw={700} c="green">
                {((complianceMetrics.amlCompliant / complianceMetrics.totalBonds) * 100).toFixed(0)}%
              </Text>
              <Text size="xs" c="dimmed">{complianceMetrics.amlCompliant}/{complianceMetrics.totalBonds} bonds</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder style={{ textAlign: 'center' }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">MiFID II</Text>
              <Text size="xl" fw={700} c="green">
                {((complianceMetrics.mifidCompliant / complianceMetrics.totalBonds) * 100).toFixed(0)}%
              </Text>
              <Text size="xs" c="dimmed">{complianceMetrics.mifidCompliant}/{complianceMetrics.totalBonds} bonds</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder style={{ textAlign: 'center' }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Overall Score</Text>
              <Text size="xl" fw={700} c="green">100%</Text>
              <Text size="xs" c="dimmed">Fully compliant</Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Regulatory Framework Status</Title>
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>MiFID II</Text>
                  </Group>
                  <Text size="sm" c="dimmed">EU Investment Services Directive</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>EMIR</Text>
                  </Group>
                  <Text size="sm" c="dimmed">European Market Infrastructure Regulation</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>GDPR</Text>
                  </Group>
                  <Text size="sm" c="dimmed">General Data Protection Regulation</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>Basel III</Text>
                  </Group>
                  <Text size="sm" c="dimmed">International Banking Regulations</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>Dodd-Frank</Text>
                  </Group>
                  <Text size="sm" c="dimmed">US Financial Reform Act</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>SOX</Text>
                  </Group>
                  <Text size="sm" c="dimmed">Sarbanes-Oxley Act</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>FATCA</Text>
                  </Group>
                  <Text size="sm" c="dimmed">Foreign Account Tax Compliance</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green">✓</Badge>
                    <Text fw={500}>CRS</Text>
                  </Group>
                  <Text size="sm" c="dimmed">Common Reporting Standard</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Audit Trail</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Event Type</Table.Th>
                <Table.Th>Bond</Table.Th>
                <Table.Th>Details</Table.Th>
                <Table.Th>Compliance Check</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>2024-01-15 14:32:15</Table.Td>
                <Table.Td>Transfer</Table.Td>
                <Table.Td>US Treasury 10Y</Table.Td>
                <Table.Td>100K tokens transferred</Table.Td>
                <Table.Td>KYC/AML verified</Table.Td>
                <Table.Td><Badge color="green">APPROVED</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>2024-01-15 14:28:42</Table.Td>
                <Table.Td>Snapshot</Table.Td>
                <Table.Td>Apple Inc 2031</Table.Td>
                <Table.Td>Balance snapshot created</Table.Td>
                <Table.Td>Regulatory compliant</Table.Td>
                <Table.Td><Badge color="green">COMPLETED</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>2024-01-15 14:25:18</Table.Td>
                <Table.Td>Account Freeze</Table.Td>
                <Table.Td>German Bund 10Y</Table.Td>
                <Table.Td>Account 0x123...789 frozen</Table.Td>
                <Table.Td>AML risk detected</Table.Td>
                <Table.Td><Badge color="orange">PENDING REVIEW</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>2024-01-15 14:20:05</Table.Td>
                <Table.Td>Compliance Report</Table.Td>
                <Table.Td>All Bonds</Table.Td>
                <Table.Td>Daily compliance export</Table.Td>
                <Table.Td>ICMA BDT format</Table.Td>
                <Table.Td><Badge color="green">SUBMITTED</Badge></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>

        <Grid>
          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Risk Alerts</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group>
                    <Badge color="green" size="sm">LOW</Badge>
                    <Text size="sm">Credit risk exposure within limits</Text>
                  </Group>
                  <Text size="xs" c="dimmed">2h ago</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="yellow" size="sm">MEDIUM</Badge>
                    <Text size="sm">Liquidity threshold approaching</Text>
                  </Group>
                  <Text size="xs" c="dimmed">4h ago</Text>
                </Group>
                <Group justify="space-between">
                  <Group>
                    <Badge color="green" size="sm">RESOLVED</Badge>
                    <Text size="sm">KYC verification completed</Text>
                  </Group>
                  <Text size="xs" c="dimmed">6h ago</Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Pending Actions</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Review flagged account 0x123...789</Text>
                  <Button size="xs" variant="light">Review</Button>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Submit quarterly compliance report</Text>
                  <Button size="xs" variant="light">Submit</Button>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Update AML policy documentation</Text>
                  <Button size="xs" variant="light">Update</Button>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  // Enhanced bond portfolio data with ICMA BDT v1.2 taxonomy
  const getComprehensiveBondData = () => {
    try {
      const bonds = [
        {
          id: 'BOND001',
          name: 'US Treasury 10Y',
          issuer: 'US Treasury',
          yield: 4.25,
          price: 98.50,
          maturity: '2034-01-15',
          rating: 'AAA',
          category: 'Government',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.00,
          marketCap: 50000000,
          tradingVolume: 2500000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 3 },
          icma: { classification: 'GVT-TREASURY', segment: 'PRIMARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND002',
          name: 'Apple Inc 2031',
          issuer: 'Apple Inc',
          yield: 3.85,
          price: 102.30,
          maturity: '2031-02-08',
          rating: 'AAA',
          category: 'Corporate',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 3.75,
          marketCap: 25000000,
          tradingVolume: 1800000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 5 },
          icma: { classification: 'CRP-TECHNOLOGY', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND003',
          name: 'Microsoft Corp 2029',
          issuer: 'Microsoft Corp',
          yield: 3.95,
          price: 101.75,
          maturity: '2029-11-15',
          rating: 'AAA',
          category: 'Corporate',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.10,
          marketCap: 30000000,
          tradingVolume: 2100000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 4 },
          icma: { classification: 'CRP-TECHNOLOGY', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND004',
          name: 'German Bund 10Y',
          issuer: 'Federal Republic of Germany',
          yield: 2.35,
          price: 95.80,
          maturity: '2034-07-04',
          rating: 'AAA',
          category: 'Government',
          currency: 'EUR',
          faceValue: 1000,
          couponRate: 2.20,
          marketCap: 45000000,
          tradingVolume: 3200000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 2 },
          icma: { classification: 'GVT-SOVEREIGN', segment: 'PRIMARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND005',
          name: 'JPMorgan Chase 2030',
          issuer: 'JPMorgan Chase & Co',
          yield: 4.65,
          price: 99.25,
          maturity: '2030-05-12',
          rating: 'AA-',
          category: 'Financial',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.50,
          marketCap: 20000000,
          tradingVolume: 1500000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 6 },
          icma: { classification: 'CRP-FINANCIAL', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND006',
          name: 'Toyota Motor Credit',
          issuer: 'Toyota Motor Credit Corp',
          yield: 4.15,
          price: 100.50,
          maturity: '2028-09-20',
          rating: 'AA+',
          category: 'Corporate',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.25,
          marketCap: 15000000,
          tradingVolume: 1200000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 3 },
          icma: { classification: 'CRP-AUTOMOTIVE', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND007',
          name: 'UK Gilt 2033',
          issuer: 'HM Treasury',
          yield: 3.75,
          price: 97.20,
          maturity: '2033-03-07',
          rating: 'AA',
          category: 'Government',
          currency: 'GBP',
          faceValue: 1000,
          couponRate: 3.50,
          marketCap: 35000000,
          tradingVolume: 2800000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 4 },
          icma: { classification: 'GVT-GILT', segment: 'PRIMARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND008',
          name: 'Johnson & Johnson 2032',
          issuer: 'Johnson & Johnson',
          yield: 3.55,
          price: 103.80,
          maturity: '2032-08-15',
          rating: 'AAA',
          category: 'Healthcare',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 3.70,
          marketCap: 22000000,
          tradingVolume: 1600000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 5 },
          icma: { classification: 'CRP-HEALTHCARE', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND009',
          name: 'Alphabet Inc 2030',
          issuer: 'Alphabet Inc',
          yield: 3.90,
          price: 101.20,
          maturity: '2030-12-01',
          rating: 'AA+',
          category: 'Technology',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.00,
          marketCap: 28000000,
          tradingVolume: 2000000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 4 },
          icma: { classification: 'CRP-TECHNOLOGY', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND010',
          name: 'French OAT 2035',
          issuer: 'Agence France Trésor',
          yield: 2.85,
          price: 94.60,
          maturity: '2035-04-25',
          rating: 'AA',
          category: 'Government',
          currency: 'EUR',
          faceValue: 1000,
          couponRate: 2.75,
          marketCap: 40000000,
          tradingVolume: 3500000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 3 },
          icma: { classification: 'GVT-OAT', segment: 'PRIMARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND011',
          name: 'Berkshire Hathaway 2029',
          issuer: 'Berkshire Hathaway Inc',
          yield: 4.35,
          price: 98.90,
          maturity: '2029-10-15',
          rating: 'AA+',
          category: 'Financial',
          currency: 'USD',
          faceValue: 1000,
          couponRate: 4.20,
          marketCap: 18000000,
          tradingVolume: 1400000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 5 },
          icma: { classification: 'CRP-CONGLOMERATE', segment: 'SECONDARY', reporting: 'COMPLETE' }
        },
        {
          id: 'BOND012',
          name: 'Nestlé SA 2031',
          issuer: 'Nestlé SA',
          yield: 3.25,
          price: 104.50,
          maturity: '2031-06-30',
          rating: 'AA',
          category: 'Consumer Goods',
          currency: 'CHF',
          faceValue: 1000,
          couponRate: 3.40,
          marketCap: 16000000,
          tradingVolume: 1100000,
          compliance: { kyc: true, aml: true, mifid: true },
          cmtat: { paused: false, frozen: false, snapshots: 4 },
          icma: { classification: 'CRP-CONSUMER', segment: 'SECONDARY', reporting: 'COMPLETE' }
        }
      ];

      return bonds;
    } catch (error) {
      console.error('Error loading bond data:', error);
      return [];
    }
  };

  const renderDataTest = () => {
    try {
      const bonds = getComprehensiveBondData();

      if (!Array.isArray(bonds) || bonds.length === 0) {
        return <Text c="red">❌ No bond data available</Text>;
      }

      const totalMarketCap = bonds.reduce((sum, bond) => sum + bond.marketCap, 0);
      const avgYield = bonds.reduce((sum, bond) => sum + bond.yield, 0) / bonds.length;

      return (
        <Stack gap="xl">
          {/* Portfolio Overview */}
          <Grid>
            <Grid.Col span={3}>
              <Card withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Portfolio</Text>
                <Text size="xl" fw={700}>${(totalMarketCap / 1000000).toFixed(0)}M</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Average Yield</Text>
                <Text size="xl" fw={700} c="green">{avgYield.toFixed(2)}%</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Active Bonds</Text>
                <Text size="xl" fw={700} c="blue">{bonds.length}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Compliance</Text>
                <Text size="xl" fw={700} c="green">100%</Text>
              </Card>
            </Grid.Col>
          </Grid>

          {/* CMTAT Controls */}
          <Paper withBorder p="md">
            <Group justify="space-between" align="center" mb="md">
              <Title order={3}>CMTAT v3.0 Controls</Title>
              <Group>
                <Switch
                  label="Emergency Pause"
                  checked={isPaused}
                  onChange={(event) => setIsPaused(event.currentTarget.checked)}
                  thumbIcon={isPaused ? <IconPlayerPause size={12} /> : <IconPlayerPlay size={12} />}
                />
                <Button leftSection={<IconCamera size={16} />} variant="light">
                  Create Snapshot
                </Button>
              </Group>
            </Group>

            <Grid>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Platform Status</Text>
                <Badge color={isPaused ? 'red' : 'green'} size="lg">
                  {isPaused ? 'PAUSED' : 'ACTIVE'}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Frozen Accounts</Text>
                <Text fw={500}>{frozenAccounts.size} accounts</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Total Snapshots</Text>
                <Text fw={500}>{bonds.reduce((sum, bond) => sum + bond.cmtat.snapshots, 0)}</Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Bond Portfolio Table */}
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Bond</Table.Th>
                  <Table.Th>Yield</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>ICMA Class</Table.Th>
                  <Table.Th>Market Cap</Table.Th>
                  <Table.Th>CMTAT</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bonds.map((bond) => (
                  <Table.Tr key={bond.id} style={{ backgroundColor: selectedBond === bond.id ? 'var(--mantine-color-blue-0)' : undefined }}>
                    <Table.Td>
                      <div>
                        <Text fw={500} size="sm">{bond.name}</Text>
                        <Text size="xs" c="dimmed">{bond.issuer}</Text>
                        <Text size="xs" c="dimmed">Mat: {bond.maturity}</Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Text fw={500} c={bond.yield > 4 ? 'green' : bond.yield > 3 ? 'blue' : 'orange'}>
                          {bond.yield.toFixed(2)}%
                        </Text>
                        {bond.yield > 4 ? <IconTrendingUp size={12} color="green" /> : <IconTrendingDown size={12} color="orange" />}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>${bond.price}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={bond.rating.startsWith('AAA') ? 'green' : bond.rating.startsWith('AA') ? 'blue' : 'yellow'}>
                        {bond.rating}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>{bond.icma.classification}</Text>
                      <Text size="xs" c="dimmed">{bond.icma.segment}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>${(bond.marketCap / 1000000).toFixed(1)}M</Text>
                      <Text size="xs" c="dimmed">Vol: ${(bond.tradingVolume / 1000000).toFixed(1)}M</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Tooltip label={bond.cmtat.paused ? 'Paused' : 'Active'}>
                          <ActionIcon size="sm" variant="light" color={bond.cmtat.paused ? 'red' : 'green'}>
                            {bond.cmtat.paused ? <IconPlayerPause size={12} /> : <IconPlayerPlay size={12} />}
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={bond.cmtat.frozen ? 'Frozen' : 'Unfrozen'}>
                          <ActionIcon size="sm" variant="light" color={bond.cmtat.frozen ? 'red' : 'blue'}>
                            {bond.cmtat.frozen ? <IconLock size={12} /> : <IconLockOpen size={12} />}
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={`${bond.cmtat.snapshots} snapshots`}>
                          <ActionIcon size="sm" variant="light">
                            <IconCamera size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant={selectedBond === bond.id ? 'filled' : 'light'}
                        onClick={() => setSelectedBond(selectedBond === bond.id ? null : bond.id)}
                      >
                        {selectedBond === bond.id ? 'Selected' : 'Select'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          {/* Selected Bond Details */}
          {selectedBond && (() => {
            const bond = bonds.find(b => b.id === selectedBond);
            if (!bond) return null;

            return (
              <Paper withBorder p="md">
                <Title order={3} mb="md">Bond Details: {bond.name}</Title>
                <Grid>
                  <Grid.Col span={6}>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500}>Face Value:</Text>
                        <Text>${bond.faceValue}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Coupon Rate:</Text>
                        <Text>{bond.couponRate}%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Currency:</Text>
                        <Text>{bond.currency}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Category:</Text>
                        <Badge>{bond.category}</Badge>
                      </Group>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500}>KYC Compliant:</Text>
                        <Badge color="green">{bond.compliance.kyc ? 'YES' : 'NO'}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>AML Compliant:</Text>
                        <Badge color="green">{bond.compliance.aml ? 'YES' : 'NO'}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>MiFID II:</Text>
                        <Badge color="green">{bond.compliance.mifid ? 'YES' : 'NO'}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>ICMA Reporting:</Text>
                        <Badge color="blue">{bond.icma.reporting}</Badge>
                      </Group>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>
            );
          })()}

          <Text size="sm" c="green">✅ Comprehensive bond portfolio loaded ({bonds.length} bonds)</Text>
        </Stack>
      );
    } catch (error) {
      return (
        <Text c="red">❌ Error loading portfolio: {error instanceof Error ? error.message : 'Unknown error'}</Text>
      );
    }
  };

  return renderMinimalTest();
}