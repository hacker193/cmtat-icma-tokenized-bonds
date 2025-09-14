'use client';

import React from 'react';
import {
  AppShell,
  Container,
  Title,
  Text,
  Stack,
  Card,
} from '@mantine/core';

export default function MainApplicationMinimal() {
  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 0, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%" style={{ display: 'flex', alignItems: 'center' }}>
          <Title order={2} c="blue">
            🏦 CMTAT + ICMA Tokenized Bonds Platform
          </Title>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Stack gap="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">Welcome to the Platform</Title>
              <Text size="lg">
                This is a minimal test version to verify the Mantine UI is loading correctly.
              </Text>
              <Text mt="md">
                If you can see this, the basic application structure is working!
              </Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Platform Features</Title>
              <Text>• CMTAT v3.0 Compliance Framework</Text>
              <Text>• ICMA Bond Data Taxonomy v1.2</Text>
              <Text>• Tokenized Fixed Income Trading</Text>
              <Text>• Real-time Analytics Dashboard</Text>
            </Card>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}