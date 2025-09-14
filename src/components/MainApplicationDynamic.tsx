'use client';

import dynamic from 'next/dynamic';
import { Container, Text, Title, Loader, Center, Stack } from '@mantine/core';

// Import the original MainApplication with SSR disabled
const MainApplication = dynamic(
  () => import('./MainApplication'),
  {
    ssr: false,
    loading: () => (
      <Container size="xl" style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Stack align="center" gap="md">
          <Title order={2} c="blue">🏦 CMTAT + ICMA Tokenized Bonds</Title>
          <Text c="dimmed">Loading Institutional Fixed Income Platform...</Text>
          <Text size="sm" c="gray">
            Initializing CMTAT v3.0 compliance framework and ICMA Bond Data Taxonomy v1.2
          </Text>
          <Loader size="lg" />
        </Stack>
      </Container>
    ),
  }
);

export default function MainApplicationDynamic() {
  return <MainApplication />;
}