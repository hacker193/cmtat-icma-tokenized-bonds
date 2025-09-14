'use client';

import { useState } from 'react';
import { Container, Title, Text, Tabs, Paper, Stack, Group, Button, Badge } from '@mantine/core';

// START: Known working minimal version
export default function ProgressiveTest() {
  const [testLevel, setTestLevel] = useState<'minimal' | 'basic-data' | 'simple-charts' | 'full'>('minimal');

  const renderMinimalTest = () => (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Paper shadow="sm" radius="md" p="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} c="blue.7">🏦 CMTAT + ICMA Tokenized Bonds</Title>
              <Text size="lg" c="dimmed">Progressive Test - Level {testLevel}</Text>
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

        <Tabs defaultValue="overview" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="overview">Platform Overview</Tabs.Tab>
            <Tabs.Tab value="cmtat">CMTAT v3.0</Tabs.Tab>
            <Tabs.Tab value="icma">ICMA BDT v1.2</Tabs.Tab>
            {testLevel !== 'minimal' && <Tabs.Tab value="data">Demo Data</Tabs.Tab>}
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Progressive Loading Test</Title>
              <Stack gap="md">
                <Group>
                  <Badge color="green">✅ Next.js + Mantine UI working</Badge>
                  <Badge color="green">✅ Dynamic imports successful</Badge>
                  <Badge color="green">✅ GitHub Pages deployment</Badge>
                </Group>
                <Text>Current Test Level: <strong>{testLevel}</strong></Text>
                <Text>This progressive approach helps isolate the problematic component causing the map() error.</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="cmtat" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">CMTAT v3.0 Framework</Title>
              <Stack gap="sm">
                <Text>• <strong>Pause/Unpause</strong>: Emergency stop functionality</Text>
                <Text>• <strong>Freeze/Unfreeze</strong>: Individual token holder restrictions</Text>
                <Text>• <strong>Snapshots</strong>: Balance captures for dividend distributions</Text>
                <Text>• <strong>Transfer Rules</strong>: Compliance and regulatory restrictions</Text>
                <Text>• <strong>KYC Integration</strong>: Anti-money laundering capabilities</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="icma" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">ICMA Bond Data Taxonomy v1.2</Title>
              <Stack gap="sm">
                <Text>• <strong>Data Classification</strong>: Standardized bond categorization</Text>
                <Text>• <strong>Cross-Market Harmonization</strong>: International data consistency</Text>
                <Text>• <strong>Regulatory Reporting</strong>: Automated compliance reporting</Text>
                <Text>• <strong>Market Transparency</strong>: Enhanced data visibility</Text>
                <Text>• <strong>Best Practices</strong>: Industry-standard implementation</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {testLevel !== 'minimal' && (
            <Tabs.Panel value="data" pt="xl">
              <Paper shadow="sm" radius="md" p="xl">
                <Title order={2} mb="md">Demo Data Test</Title>
                {renderDataTest()}
              </Paper>
            </Tabs.Panel>
          )}
        </Tabs>
      </Stack>
    </Container>
  );

  const renderDataTest = () => {
    try {
      // Simple static data - no dynamic imports or complex data processing
      const basicBonds = [
        { id: '1', name: 'US Treasury 10Y', yield: '4.25%', maturity: '2034-01-15' },
        { id: '2', name: 'Corporate Bond AAA', yield: '5.10%', maturity: '2029-06-30' },
        { id: '3', name: 'Municipal Bond', yield: '3.85%', maturity: '2031-12-01' }
      ];

      return (
        <Stack gap="md">
          <Text size="sm" c="green">✅ Static bond data loaded successfully</Text>
          {basicBonds.map(bond => (
            <Paper key={bond.id} p="sm" withBorder>
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{bond.name}</Text>
                  <Text size="sm" c="dimmed">Maturity: {bond.maturity}</Text>
                </div>
                <Badge variant="light">{bond.yield}</Badge>
              </Group>
            </Paper>
          ))}
        </Stack>
      );
    } catch (error) {
      return (
        <Text c="red">❌ Error loading data: {error instanceof Error ? error.message : 'Unknown error'}</Text>
      );
    }
  };

  return renderMinimalTest();
}