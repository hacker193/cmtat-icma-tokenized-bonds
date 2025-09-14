import React from 'react';
import { Container, Title, Text, Card } from '@mantine/core';

export default function MainApplicationUltraMinimal() {
  return (
    <Container size="xl" pt="xl">
      <Title order={1} mb="lg">
        🏦 CMTAT + ICMA Platform
      </Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">Test Page</Title>
        <Text>
          This is an ultra-minimal version to test if basic Next.js + Mantine works.
          No custom imports, no complex state, no external dependencies.
        </Text>

        <Text mt="md" c="blue">
          If you can see this styled blue text, the platform is working!
        </Text>
      </Card>
    </Container>
  );
}