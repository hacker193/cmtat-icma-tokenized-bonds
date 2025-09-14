'use client';

import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Grid,
  TextInput,
  NumberInput,
  Select,
  Button,
  Divider,
  Textarea,
  ActionIcon,
  Tooltip,
  Modal,
  Code,
  ScrollArea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconFileText, IconDownload, IconEye, IconShield, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface ICMABondData {
  // Issuer Information
  issuerName: string;
  issuerLEI: string;
  issuerRating: string;

  // Security Details
  isin: string;
  securityName: string;
  aggregateNominalAmount: number;
  specifiedDenomination: number;
  currency: string;

  // Interest & Maturity
  interestType: string;
  interestRate: number;
  maturityDate: Date | null;
  interestPaymentFrequency: string;
  dayCountFraction: string;

  // Issuance Details
  issuanceType: string;
  issueDate: Date | null;
  settlementDate: Date | null;
  issuePrice: number;

  // Market Information
  listingMarket: string;
  governingLaw: string;

  // DLT Specific
  dltBondIndicator: boolean;
  cmtatCompliant: boolean;
}

export function ICMABondIssuanceForm() {
  const [xmlPreview, setXmlPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'generating-xml' | 'deploying-contract' | 'completed'>('idle');

  const form = useForm<ICMABondData>({
    initialValues: {
      issuerName: 'Coöperatieve Rabobank U.A.',
      issuerLEI: 'DG3RU1DBUFHT4ZF9WN62',
      issuerRating: 'A+',
      isin: 'XS2524143554',
      securityName: 'EUR 75,000,000 3.875% Fixed Rate Reset Dated Subordinated Notes due 2032',
      aggregateNominalAmount: 75000000,
      specifiedDenomination: 100000,
      currency: 'EUR',
      interestType: 'FIXED',
      interestRate: 3.875,
      maturityDate: new Date('2032-11-30'),
      interestPaymentFrequency: 'ANNUALLY',
      dayCountFraction: 'ICMA_ACT/ACT',
      issuanceType: 'PROGRAMME',
      issueDate: new Date('2022-08-22'),
      settlementDate: new Date('2022-08-30'),
      issuePrice: 99.841,
      listingMarket: 'LUXEMBOURG_STOCK_EXCHANGE',
      governingLaw: 'DUTCH_LAW',
      dltBondIndicator: true,
      cmtatCompliant: true,
    },
  });

  const generateICMAXML = (data: ICMABondData): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:icma:xsd:ICMABondDataTaxonomy" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:icma:xsd:ICMABondDataTaxonomy icma-bond-data-taxonomy.xsd">
  <ICMABondDataTaxonomy>
    <PartyRole>
      <PartyRoleType>ISSUER</PartyRoleType>
      <PartyID PID="LEI-${data.issuerLEI}"/>
    </PartyRole>
    <Party PID="LEI-${data.issuerLEI}">
      <PartyName>${data.issuerName}</PartyName>
      <LEIIdentifier>${data.issuerLEI}</LEIIdentifier>
      <PartyRating>
        <Rating>
          <RatingAgency>SP</RatingAgency>
          <RatingValue>${data.issuerRating}</RatingValue>
          <RatingOutlook>STABLE</RatingOutlook>
        </Rating>
      </PartyRating>
    </Party>
    <Issuance>
      <IssuanceType>${data.issuanceType}</IssuanceType>
      <SpecifiedDenomination>${data.specifiedDenomination}</SpecifiedDenomination>
      <FinalRedemptionAmountPercentage>100</FinalRedemptionAmountPercentage>
      <SpecifiedCurrency>${data.currency}</SpecifiedCurrency>
      <IssueDate>${data.issueDate?.toISOString().split('T')[0]}</IssueDate>
      <SettlementDate>${data.settlementDate?.toISOString().split('T')[0]}</SettlementDate>
      <IssuePrice>${data.issuePrice}</IssuePrice>
      <Listing>
        <Market>${data.listingMarket}</Market>
        <MarketType>RMKT</MarketType>
      </Listing>
      <GoverningLaw>${data.governingLaw}</GoverningLaw>
    </Issuance>
    <Product>
      <SecurityIdentifierList>
        <SecurityIdentifier>
          <ISIN>${data.isin}</ISIN>
          <IdentifierType>ISIN</IdentifierType>
        </SecurityIdentifier>
      </SecurityIdentifierList>
      <FormOfNote>BEARER</FormOfNote>
      <StatusOfNote>SUBORDINATED</StatusOfNote>
      <AggregateNominalAmount>${data.aggregateNominalAmount}</AggregateNominalAmount>
      <MaturityDate>${data.maturityDate?.toISOString().split('T')[0]}</MaturityDate>
      <InterestPayment>
        <InterestType>${data.interestType}</InterestType>
        <InterestRate>${data.interestRate}</InterestRate>
        <InterestPayments>
          <InterestPaymentFrequency>${data.interestPaymentFrequency}</InterestPaymentFrequency>
        </InterestPayments>
      </InterestPayment>
      <DayCountFraction>${data.dayCountFraction}</DayCountFraction>
      <DLTBondIndicator>${data.dltBondIndicator}</DLTBondIndicator>
      ${data.cmtatCompliant ? '<CMTATCompliant>true</CMTATCompliant>' : ''}
    </Product>
  </ICMABondDataTaxonomy>
</Document>`;
  };

  const handleGenerateXML = () => {
    setDeploymentStatus('generating-xml');
    const xml = generateICMAXML(form.values);
    setXmlPreview(xml);

    setTimeout(() => {
      setDeploymentStatus('idle');
      setShowPreview(true);
      notifications.show({
        title: 'ICMA XML Generated',
        message: 'Bond data taxonomy XML has been generated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }, 1500);
  };

  const handleDeployContract = async () => {
    if (!xmlPreview) {
      notifications.show({
        title: 'Generate XML First',
        message: 'Please generate ICMA XML before deploying CMTAT contract',
        color: 'orange',
        icon: <IconX size={16} />,
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('deploying-contract');

    // Simulate contract deployment
    setTimeout(() => {
      setDeploymentStatus('completed');
      setIsDeploying(false);
      notifications.show({
        title: 'CMTAT Contract Deployed',
        message: 'Tokenized bond contract deployed at 0x1234...5678',
        color: 'blue',
        icon: <IconShield size={16} />,
      });
    }, 3000);
  };

  const downloadXML = () => {
    const blob = new Blob([xmlPreview], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icma-bond-${form.values.isin}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card withBorder p="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={3}>ICMA Bond Data Taxonomy Form</Title>
            <Text size="sm" c="dimmed">
              Create tokenized bond issuance using ICMA v1.2 standards
            </Text>
          </div>
          <Group>
            <Badge color="green" leftSection={<IconFileText size={14} />}>
              ICMA v1.2
            </Badge>
            <Badge color="blue" leftSection={<IconShield size={14} />}>
              CMTAT v3.0
            </Badge>
          </Group>
        </Group>

        <form>
          <Stack gap="lg">
            {/* Issuer Information */}
            <div>
              <Title order={5} mb="md">Issuer Information</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Issuer Name"
                    {...form.getInputProps('issuerName')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput
                    label="Legal Entity Identifier (LEI)"
                    {...form.getInputProps('issuerLEI')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Credit Rating"
                    {...form.getInputProps('issuerRating')}
                    data={['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-']}
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Security Details */}
            <div>
              <Title order={5} mb="md">Security Details</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Security Name"
                    {...form.getInputProps('securityName')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput
                    label="ISIN"
                    {...form.getInputProps('isin')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Currency"
                    {...form.getInputProps('currency')}
                    data={['EUR', 'USD', 'GBP', 'CHF', 'JPY']}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput
                    label="Aggregate Nominal Amount"
                    {...form.getInputProps('aggregateNominalAmount')}
                    thousandSeparator=","
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput
                    label="Specified Denomination"
                    {...form.getInputProps('specifiedDenomination')}
                    thousandSeparator=","
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Issuance Type"
                    {...form.getInputProps('issuanceType')}
                    data={['PROGRAMME', 'STANDALONE', 'SHELF']}
                    required
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Interest & Maturity */}
            <div>
              <Title order={5} mb="md">Interest & Maturity</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Interest Type"
                    {...form.getInputProps('interestType')}
                    data={['FIXED', 'FLOATING', 'ZERO_COUPON']}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <NumberInput
                    label="Interest Rate (%)"
                    {...form.getInputProps('interestRate')}
                    decimalScale={3}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Payment Frequency"
                    {...form.getInputProps('interestPaymentFrequency')}
                    data={['ANNUALLY', 'SEMI_ANNUALLY', 'QUARTERLY', 'MONTHLY']}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <DatePickerInput
                    label="Maturity Date"
                    {...form.getInputProps('maturityDate')}
                    required
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Issuance Details */}
            <div>
              <Title order={5} mb="md">Issuance Details</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DatePickerInput
                    label="Issue Date"
                    {...form.getInputProps('issueDate')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DatePickerInput
                    label="Settlement Date"
                    {...form.getInputProps('settlementDate')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <NumberInput
                    label="Issue Price"
                    {...form.getInputProps('issuePrice')}
                    decimalScale={3}
                    required
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Actions */}
            <Group justify="space-between">
              <Group>
                <Button
                  variant="light"
                  color="green"
                  leftSection={<IconFileText size={16} />}
                  onClick={handleGenerateXML}
                  loading={deploymentStatus === 'generating-xml'}
                >
                  Generate ICMA XML
                </Button>
                <Button
                  color="blue"
                  leftSection={<IconShield size={16} />}
                  onClick={handleDeployContract}
                  loading={isDeploying}
                  disabled={!xmlPreview}
                >
                  Deploy CMTAT Contract
                </Button>
              </Group>
              <Group>
                {xmlPreview && (
                  <>
                    <Tooltip label="Preview XML">
                      <ActionIcon variant="light" onClick={() => setShowPreview(true)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Download XML">
                      <ActionIcon variant="light" color="green" onClick={downloadXML}>
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </Group>
            </Group>

            {/* Deployment Status */}
            {deploymentStatus !== 'idle' && (
              <Card withBorder p="md" bg="gray.0">
                <Group>
                  <div>
                    <Text size="sm" fw={500}>
                      {deploymentStatus === 'generating-xml' && 'Generating ICMA XML...'}
                      {deploymentStatus === 'deploying-contract' && 'Deploying CMTAT Contract...'}
                      {deploymentStatus === 'completed' && 'Deployment Complete!'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {deploymentStatus === 'generating-xml' && 'Creating XML document based on ICMA taxonomy'}
                      {deploymentStatus === 'deploying-contract' && 'Deploying tokenized bond with CMTAT compliance'}
                      {deploymentStatus === 'completed' && 'Ready for primary market trading'}
                    </Text>
                  </div>
                  <Badge color={deploymentStatus === 'completed' ? 'green' : 'blue'}>
                    {deploymentStatus === 'completed' ? 'Ready' : 'Processing'}
                  </Badge>
                </Group>
              </Card>
            )}
          </Stack>
        </form>
      </Card>

      {/* XML Preview Modal */}
      <Modal
        opened={showPreview}
        onClose={() => setShowPreview(false)}
        title="ICMA Bond Data Taxonomy XML"
        size="xl"
      >
        <ScrollArea.Autosize mah={400}>
          <Code block>{xmlPreview}</Code>
        </ScrollArea.Autosize>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={downloadXML} leftSection={<IconDownload size={16} />}>
            Download XML
          </Button>
        </Group>
      </Modal>
    </>
  );
}