'use client';

import React from 'react';
import {
  Tooltip,
  Text,
  Stack,
  Group,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconShield,
  IconFileText,
} from '@tabler/icons-react';

interface FrameworkTooltipProps {
  framework: 'CMTAT' | 'ICMA' | 'Both';
  feature: string;
  children: React.ReactElement;
}

export function FrameworkTooltip({ framework, feature, children }: FrameworkTooltipProps) {
  const getTooltipContent = () => {
    const tooltips = {
      CMTAT: {
        'Pause Transfers': 'CMTAT allows authorized roles to pause all token transfers in case of emergency or regulatory requirements.',
        'Freeze Account': 'CMTAT enables freezing specific accounts to prevent them from sending or receiving tokens.',
        'Take Snapshot': 'CMTAT provides snapshot functionality to record balances at specific block numbers for dividend distributions or governance.',
        'Transfer Validation': 'CMTAT enforces compliance rules on every transfer, checking allowlists, transfer limits, and other conditions.',
        'Token Contract': 'CMTAT is a compliant tokenization framework that provides regulatory-friendly features for security tokens.',
        'Compliance Rules': 'CMTAT implements comprehensive compliance features including role-based access control and regulatory enforcement.',
      },
      ICMA: {
        'Bond Data Taxonomy': 'ICMA Bond Data Taxonomy provides standardized XML schema for bond issuance data, ensuring consistency across markets.',
        'XML Generation': 'ICMA standards define how bond information should be structured and shared between market participants.',
        'Primary Issuance': 'ICMA forms follow international standards for new bond issuance documentation and data exchange.',
        'Coupon Payments': 'ICMA defines standard calculation methods and frequencies for bond interest payments.',
        'Market Standards': 'ICMA provides globally recognized standards for fixed income markets and bond documentation.',
        'Bond Lifecycle': 'ICMA standards cover the entire bond lifecycle from issuance to maturity, including corporate actions.',
      },
      Both: {
        'Tokenized Bonds': 'Combining ICMA bond standards with CMTAT tokenization creates compliant, tradeable digital securities.',
        'Lifecycle Events': 'ICMA defines the events while CMTAT enables automated execution through smart contracts.',
        'Compliance Integration': 'ICMA standards ensure market compliance while CMTAT provides technical enforcement mechanisms.',
        'Digital Infrastructure': 'ICMA provides the regulatory framework while CMTAT enables blockchain-based execution.',
      },
    };

    return tooltips[framework][feature] || 'Framework-specific functionality';
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'CMTAT': return 'blue';
      case 'ICMA': return 'green';
      case 'Both': return 'purple';
      default: return 'gray';
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'CMTAT': return <IconShield size={14} />;
      case 'ICMA': return <IconFileText size={14} />;
      case 'Both': return <IconInfoCircle size={14} />;
      default: return <IconInfoCircle size={14} />;
    }
  };

  return (
    <Tooltip
      label={
        <Stack gap="xs" w={300}>
          <Group>
            <Badge color={getFrameworkColor(framework)} leftSection={getFrameworkIcon(framework)}>
              {framework}
            </Badge>
            <Text size="sm" fw={500}>{feature}</Text>
          </Group>
          <Text size="xs">{getTooltipContent()}</Text>
        </Stack>
      }
      position="top"
      withArrow
      transitionProps={{ duration: 200 }}
      styles={{
        tooltip: {
          maxWidth: 350,
          padding: 12,
        },
      }}
    >
      {children}
    </Tooltip>
  );
}

export function CMTATTooltip({ feature, children }: { feature: string; children: React.ReactElement }) {
  return <FrameworkTooltip framework="CMTAT" feature={feature} children={children} />;
}

export function ICMATooltip({ feature, children }: { feature: string; children: React.ReactElement }) {
  return <FrameworkTooltip framework="ICMA" feature={feature} children={children} />;
}

export function BothTooltip({ feature, children }: { feature: string; children: React.ReactElement }) {
  return <FrameworkTooltip framework="Both" feature={feature} children={children} />;
}