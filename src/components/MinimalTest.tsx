'use client';

import { Container, Title, Text, Tabs, Paper, Stack, Group } from '@mantine/core';

export default function MinimalTest() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Paper shadow="sm" radius="md" p="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} c="blue.7">🏦 CMTAT + ICMA Tokenized Bonds</Title>
              <Text size="lg" c="dimmed">Minimal Test - No Charts, No Data Arrays</Text>
            </div>
          </Group>
        </Paper>

        <Tabs defaultValue="overview" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="overview">Platform Overview</Tabs.Tab>
            <Tabs.Tab value="cmtat">CMTAT v3.0 Features</Tabs.Tab>
            <Tabs.Tab value="icma">ICMA BDT v1.2</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">Tokenized Fixed Income Platform</Title>
              <Stack gap="md">
                <Text>✅ CMTAT v3.0 compliance framework integrated</Text>
                <Text>✅ ICMA Bond Data Taxonomy v1.2 support</Text>
                <Text>✅ Next.js + Mantine UI components working</Text>
                <Text>✅ GitHub Pages deployment successful</Text>
                <Text>⚠️ Testing without data arrays or charts</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="cmtat" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">CMTAT v3.0 Features</Title>
              <Stack gap="sm">
                <Text>• Pause/Unpause functionality for emergency stops</Text>
                <Text>• Freeze/Unfreeze specific token holders</Text>
                <Text>• Balance snapshots for dividend distributions</Text>
                <Text>• Transfer restrictions and compliance rules</Text>
                <Text>• KYC/AML integration capabilities</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="icma" pt="xl">
            <Paper shadow="sm" radius="md" p="xl">
              <Title order={2} mb="md">ICMA Bond Data Taxonomy v1.2</Title>
              <Stack gap="sm">
                <Text>• Standardized bond data classification</Text>
                <Text>• Cross-market data harmonization</Text>
                <Text>• Regulatory reporting compliance</Text>
                <Text>• Market transparency improvements</Text>
                <Text>• International best practices</Text>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}