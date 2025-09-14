'use client';

import React, { useState, useMemo } from 'react';
import {
  AppShell,
  Container,
  Title,
  Text,
  Group,
  Badge,
  Grid,
  Tabs,
  Stack,
  Select,
  Card,
  Button,
  Divider,
  ThemeIcon,
  Anchor,
} from '@mantine/core';
import {
  IconChartLine,
  IconWallet,
  IconTrendingUp,
  IconActivity,
  IconShield,
  IconFileText,
  IconSettings,
  IconCoin,
  IconLock,
  IconPlaylistAdd,
  IconEye,
  IconGavel
} from '@tabler/icons-react';

// Import our custom chart components
import YieldCurveChart from '@/components/charts/YieldCurveChart';
import BondPriceChart from '@/components/charts/BondPriceChart';
import DurationRiskChart from '@/components/charts/DurationRiskChart';
import CreditSpreadChart from '@/components/charts/CreditSpreadChart';
import PortfolioAllocationChart from '@/components/charts/PortfolioAllocationChart';
import PerformanceMetricsChart from '@/components/charts/PerformanceMetricsChart';
import OrderBookVisualization from '@/components/charts/OrderBookVisualization';
import RiskHeatmapChart from '@/components/charts/RiskHeatmapChart';

// Import CMTA + ICMA components
import { ICMABondIssuanceForm } from '@/components/issuance/ICMABondIssuanceForm';
import { CMTATComplianceDashboard } from '@/components/compliance/CMTATComplianceDashboard';
import { SecondaryTradingInterface } from '@/components/trading/SecondaryTradingInterface';
import { BondLifecycleManager } from '@/components/lifecycle/BondLifecycleManager';
import { ICMATooltip, CMTATTooltip, BothTooltip } from '@/components/education/FrameworkTooltips';

// Import enhanced demo data
import {
  demoDataProvider,
  generateOrderBookData,
  getDemoDataSummary,
  getRandomTokenizedBond,
} from '@/data';

export default function MainApplication() {
  const [activeTab, setActiveTab] = useState('issuance');
  const [selectedBond, setSelectedBond] = useState(() => {
    const bonds = demoDataProvider.enhancedBonds;
    return (bonds && bonds.length > 0) ? bonds[0] : null;
  });
  const [timeframe, setTimeframe] = useState('3M');

  // Get demo data summary for display
  const demoSummary = getDemoDataSummary();

  // Generate dynamic data based on selections
  const priceHistory = useMemo(() => {
    if (!selectedBond?.id) return [];
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 :
                 timeframe === '6M' ? 180 : timeframe === '1Y' ? 365 : 90;
    return demoDataProvider.marketData.generatePriceHistory(selectedBond.id, days);
  }, [selectedBond?.id, timeframe]);

  const marketDepth = useMemo(() => {
    if (!selectedBond?.id) return null;
    return demoDataProvider.marketData.generateMarketDepth(selectedBond.id);
  }, [selectedBond?.id]);

  // Generate order book data for enhanced trading interface
  const orderBookData = useMemo(() => {
    if (!selectedBond?.id || !selectedBond?.isTokenized) return null;
    return generateOrderBookData.snapshot(selectedBond.id, 20);
  }, [selectedBond?.id, selectedBond?.isTokenized]);

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 0, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between">
            <Group>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThemeIcon size={40} variant="light" color="blue">
                  <IconShield size={24} />
                </ThemeIcon>
                <ThemeIcon size={40} variant="light" color="green">
                  <IconFileText size={24} />
                </ThemeIcon>
              </div>
              <div>
                <Title order={2} c="dark">
                  CMTAT + ICMA Tokenized Bonds
                </Title>
                <Text size="sm" c="dimmed">
                  Institutional Tokenized Fixed Income Platform
                </Text>
                <Group gap={4} mt={4}>
                  <Badge size="xs" variant="light" color="blue">CMTAT v3.0</Badge>
                  <Badge size="xs" variant="light" color="green">ICMA v1.2</Badge>
                </Group>
              </div>
            </Group>
            <Group>
              <Badge variant="light" color="orange" leftSection={<IconLock size={12} />}>
                CMTAT Compliance
              </Badge>
              <Badge variant="light" color="teal" leftSection={<IconFileText size={12} />}>
                ICMA Standards
              </Badge>
              <Badge variant="light" color="blue">
                ${(demoDataProvider.marketData.portfolio.totalValue / 1000000).toFixed(1)}M AUM
              </Badge>
              <Badge variant="light" color="purple">
                {demoSummary.tokenizedBonds}/{demoSummary.totalBonds} Tokenized
              </Badge>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="xl">
              <ICMATooltip feature="Primary Issuance">
                <Tabs.Tab value="issuance" leftSection={<IconPlaylistAdd size={16} />}>
                  Bond Issuance
                  <Badge size="xs" ml={4} color="green">ICMA</Badge>
                </Tabs.Tab>
              </ICMATooltip>
              <CMTATTooltip feature="Transfer Validation">
                <Tabs.Tab value="trading" leftSection={<IconTrendingUp size={16} />}>
                  Secondary Trading
                  <Badge size="xs" ml={4} color="blue">CMTAT</Badge>
                </Tabs.Tab>
              </CMTATTooltip>
              <CMTATTooltip feature="Compliance Rules">
                <Tabs.Tab value="compliance" leftSection={<IconShield size={16} />}>
                  Compliance Dashboard
                  <Badge size="xs" ml={4} color="orange">CMTAT</Badge>
                </Tabs.Tab>
              </CMTATTooltip>
              <BothTooltip feature="Lifecycle Events">
                <Tabs.Tab value="lifecycle" leftSection={<IconActivity size={16} />}>
                  Lifecycle Events
                  <Badge size="xs" ml={4} color="purple">CMTAT+ICMA</Badge>
                </Tabs.Tab>
              </BothTooltip>
              <Tabs.Tab value="analytics" leftSection={<IconChartLine size={16} />}>
                Analytics
              </Tabs.Tab>
            </Tabs.List>

            {/* Controls */}
            <Group justify="space-between" mb="xl">
              <Group>
                <Select
                  label="Select Bond"
                  value={selectedBond?.id || ''}
                  onChange={(value) => {
                    const bond = (demoDataProvider.enhancedBonds || []).find(b => b.id === value);
                    if (bond) setSelectedBond(bond);
                  }}
                  data={(() => {
                    const bonds = demoDataProvider.enhancedBonds;
                    if (!bonds || !Array.isArray(bonds) || bonds.length === 0) {
                      return [{ value: '', label: 'No bonds available', group: 'Loading...' }];
                    }
                    return bonds.map(bond => ({
                      value: bond.id,
                      label: `${bond.name} (${bond.rating}) ${bond.isTokenized ? '🔗' : '📄'}`,
                      group: bond.isTokenized ? 'Tokenized Bonds' : 'Traditional Bonds',
                    }));
                  })()}
                  w={350}
                  searchable
                  nothingFoundMessage="No bonds found"
                />
                <Select
                  label="Timeframe"
                  value={timeframe}
                  onChange={setTimeframe}
                  data={[
                    { value: '1M', label: '1 Month' },
                    { value: '3M', label: '3 Months' },
                    { value: '6M', label: '6 Months' },
                    { value: '1Y', label: '1 Year' },
                  ]}
                  w={120}
                />
              </Group>
              <Group>
                {selectedBond && (
                  <>
                    <Badge variant="light">
                      Current: ${selectedBond.currentPrice}
                    </Badge>
                    <Badge variant="light" color={selectedBond.isTokenized ? 'green' : 'orange'}>
                      {selectedBond.isTokenized ? 'Tokenized' : 'Traditional'}
                    </Badge>
                    {selectedBond.isTokenized && (
                      <Badge variant="light" color="blue">
                        CMTAT v3.0
                      </Badge>
                    )}
                    <Badge variant="light" color="teal">
                      ICMA v{selectedBond.icmaCompliance?.version || '1.2'}
                    </Badge>
                    {selectedBond.icmaCompliance?.bondDataTaxonomy?.esgClassification && (
                      <Badge variant="light" color="green">
                        {selectedBond.icmaCompliance.bondDataTaxonomy.esgClassification}
                      </Badge>
                    )}
                  </>
                )}
              </Group>
            </Group>

            {/* Bond Issuance Tab */}
            <Tabs.Panel value="issuance">
              <ICMABondIssuanceForm />
            </Tabs.Panel>

            {/* Secondary Trading Tab */}
            <Tabs.Panel value="trading">
              <SecondaryTradingInterface />
            </Tabs.Panel>

            {/* Compliance Dashboard Tab */}
            <Tabs.Panel value="compliance">
              <CMTATComplianceDashboard />
            </Tabs.Panel>

            {/* Lifecycle Events Tab */}
            <Tabs.Panel value="lifecycle">
              <BondLifecycleManager />
            </Tabs.Panel>

            {/* Analytics Tab */}
            <Tabs.Panel value="analytics">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <YieldCurveChart
                    data={demoDataProvider.marketData.yieldCurve}
                    compareData={demoDataProvider.marketData.corporateYieldCurve}
                    height={350}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <BondPriceChart
                    data={priceHistory}
                    height={350}
                    period={timeframe as '1W' | '1M' | '3M' | '6M' | '1Y'}
                    onPeriodChange={setTimeframe}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <DurationRiskChart
                    portfolio={demoDataProvider.marketData.portfolio}
                    height={350}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <CreditSpreadChart
                    portfolio={demoDataProvider.marketData.portfolio}
                    height={350}
                    timeframe={timeframe as '1M' | '3M' | '6M' | '1Y'}
                    onTimeframeChange={setTimeframe}
                  />
                </Grid.Col>
              </Grid>

              {/* Enhanced tokenized bond analytics */}
              {selectedBond?.isTokenized && orderBookData && (
                <Grid mt="xl">
                  <Grid.Col span={12}>
                    <Card withBorder p="lg">
                      <Title order={4} mb="md">Tokenized Bond Analytics</Title>
                      <Group mb="md">
                        <Badge color="blue">
                          Order Book Spread: {orderBookData.spreadBps.toFixed(2)} bps
                        </Badge>
                        <Badge color="green">
                          Market Depth: ${(orderBookData.marketCapacity / 1000000).toFixed(1)}M
                        </Badge>
                        <Badge color="purple">
                          Total Liquidity: ${((orderBookData.totalBidVolume + orderBookData.totalAskVolume) / 1000000).toFixed(1)}M
                        </Badge>
                      </Group>
                      <OrderBookVisualization
                        marketDepth={marketDepth}
                        bond={selectedBond}
                        height={400}
                        realTime={true}
                        onRefresh={() => {
                          console.log('Refreshing tokenized bond data...');
                        }}
                      />
                    </Card>
                  </Grid.Col>
                </Grid>
              )}
            </Tabs.Panel>

            {/* Portfolio Tab */}
            <Tabs.Panel value="portfolio">
              <Grid>
                <Grid.Col span={12}>
                  <PortfolioAllocationChart
                    portfolio={demoDataProvider.marketData.portfolio}
                    height={400}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <PerformanceMetricsChart
                    portfolio={demoDataProvider.marketData.portfolio}
                    height={400}
                    timeframe={timeframe as '1M' | '3M' | '6M' | '1Y'}
                    onTimeframeChange={setTimeframe}
                  />
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            {/* Trading Tab */}
            <Tabs.Panel value="trading">
              <Grid>
                <Grid.Col span={12}>
                  <OrderBookVisualization
                    marketDepth={marketDepth}
                    bond={selectedBond}
                    height={500}
                    realTime={true}
                    onRefresh={() => {
                      // This would trigger a refresh in a real app
                      console.log('Refreshing market data...');
                    }}
                  />
                </Grid.Col>
              </Grid>

              <Grid mt="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <CreditSpreadChart
                    bonds={[selectedBond]}
                    height={350}
                    chartType="scatter"
                    title="Credit Spread vs Duration"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <BondPriceChart
                    data={priceHistory.slice(-7)} // Last week for trading view
                    height={350}
                    title="Recent Price Action"
                    showVolume={true}
                  />
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            {/* Performance Tab */}
            <Tabs.Panel value="performance">
              <Stack gap="xl">
                <PerformanceMetricsChart
                  portfolio={demoDataProvider.marketData.portfolio}
                  height={450}
                  timeframe={timeframe as any}
                  onTimeframeChange={setTimeframe}
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <PortfolioAllocationChart
                      portfolio={demoDataProvider.marketData.portfolio}
                      height={350}
                      defaultView="rating"
                      title="Risk Distribution"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <DurationRiskChart
                      portfolio={demoDataProvider.marketData.portfolio}
                      height={350}
                      targetDuration={6.5}
                    />
                  </Grid.Col>
                </Grid>
                <RiskHeatmapChart
                  portfolio={demoDataProvider.marketData.portfolio}
                  height={350}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* Footer Information */}
          <Card withBorder mt="xl" p="lg">
            <Group justify="space-between" align="center">
              <Group>
                <div>
                  <Text size="sm" fw={500}>CMTA + ICMA Tokenized Fixed Income Platform</Text>
                  <Text size="xs" c="dimmed">
                    Demonstrating real CMTA v3.0 compliance features with ICMA v1.2 bond data taxonomy
                  </Text>
                </div>
              </Group>
              <Group>
                <Anchor href="https://cmtat.org" target="_blank" size="xs">
                  CMTA Documentation
                </Anchor>
                <Anchor href="https://icmagroup.org" target="_blank" size="xs">
                  ICMA Standards
                </Anchor>
              </Group>
            </Group>
          </Card>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}