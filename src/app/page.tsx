import { Container, Text, Title, Loader, Center, Stack } from '@mantine/core';
import ClientOnly from '@/components/ClientOnly';
import MainApplication from '@/components/MainApplicationMinimal';

export default function Home() {
  return (
    <ClientOnly
      fallback={
        <Container size="xl" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack align="center" gap="md">
            <Title order={2}>CMTAT + ICMA Tokenized Bonds</Title>
            <Text c="dimmed">Loading Institutional Fixed Income Platform...</Text>
            <Loader size="lg" />
          </Stack>
        </Container>
      }
    >
      <MainApplication />
    </ClientOnly>
  );
}
