/**
 * CMTAT-specific demo data for tokenized bond compliance and features
 * Demonstrates CMTAT v3.0.0 framework integration
 */

import { format, subDays, addDays } from 'date-fns';

// CMTAT Token Holder Data for KYC/Compliance Demo
export interface TokenHolder {
  id: string;
  address: string;
  walletType: 'institutional' | 'retail' | 'custodian' | 'fund';
  kycStatus: 'verified' | 'pending' | 'expired' | 'rejected';
  kycTier: 'basic' | 'enhanced' | 'professional';
  jurisdiction: string;
  accreditedInvestor: boolean;
  balance: number;
  lastTransactionDate: string;
  complianceFlags: string[];
  riskScore: number;
}

// CMTAT Compliance Rules Demo Data
export interface ComplianceRule {
  id: string;
  name: string;
  type: 'transfer_restriction' | 'holding_limit' | 'jurisdiction_check' | 'kyc_requirement';
  description: string;
  isActive: boolean;
  parameters: Record<string, any>;
  violationCount: number;
  lastViolationDate?: string;
}

// CMTAT Token Transfer Events
export interface TransferEvent {
  id: string;
  bondId: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'blocked' | 'pending_compliance' | 'failed';
  blockReason?: string;
  complianceChecks: string[];
  gasUsed: number;
  transactionHash: string;
}

// CMTAT Pause/Freeze Events
export interface PauseEvent {
  id: string;
  bondId: string;
  action: 'pause' | 'unpause' | 'freeze_account' | 'unfreeze_account';
  targetAccount?: string;
  initiator: string;
  reason: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
}

// Demo Token Holders
export const mockTokenHolders: TokenHolder[] = [
  {
    id: 'holder-1',
    address: '0x742d35Cc8Ab6A71F28d2B57F0f15F2F22D8b5E8A',
    walletType: 'institutional',
    kycStatus: 'verified',
    kycTier: 'professional',
    jurisdiction: 'US',
    accreditedInvestor: true,
    balance: 5000000,
    lastTransactionDate: '2025-01-10',
    complianceFlags: [],
    riskScore: 2,
  },
  {
    id: 'holder-2',
    address: '0x8ba1f109551bD432803012645Hac136c34f08',
    walletType: 'fund',
    kycStatus: 'verified',
    kycTier: 'enhanced',
    jurisdiction: 'CH',
    accreditedInvestor: true,
    balance: 12500000,
    lastTransactionDate: '2025-01-12',
    complianceFlags: ['high_value_investor'],
    riskScore: 1,
  },
  {
    id: 'holder-3',
    address: '0x95B348bb29F0d7bE4b5A9A8C3F4B291F2A5C5d12',
    walletType: 'custodian',
    kycStatus: 'verified',
    kycTier: 'professional',
    jurisdiction: 'SG',
    accreditedInvestor: true,
    balance: 8750000,
    lastTransactionDate: '2025-01-09',
    complianceFlags: ['multi_jurisdiction'],
    riskScore: 3,
  },
  {
    id: 'holder-4',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    walletType: 'retail',
    kycStatus: 'pending',
    kycTier: 'basic',
    jurisdiction: 'DE',
    accreditedInvestor: false,
    balance: 250000,
    lastTransactionDate: '2025-01-08',
    complianceFlags: ['kyc_renewal_required'],
    riskScore: 7,
  },
  {
    id: 'holder-5',
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    walletType: 'institutional',
    kycStatus: 'verified',
    kycTier: 'professional',
    jurisdiction: 'CA',
    accreditedInvestor: true,
    balance: 3200000,
    lastTransactionDate: '2025-01-11',
    complianceFlags: [],
    riskScore: 2,
  },
];

// Demo Compliance Rules
export const mockComplianceRules: ComplianceRule[] = [
  {
    id: 'rule-1',
    name: 'US Accredited Investor Requirement',
    type: 'transfer_restriction',
    description: 'US residents must be accredited investors to hold tokens',
    isActive: true,
    parameters: {
      jurisdiction: 'US',
      requireAccreditation: true,
      minNetWorth: 1000000,
    },
    violationCount: 2,
    lastViolationDate: '2024-12-15',
  },
  {
    id: 'rule-2',
    name: 'Maximum Individual Holding Limit',
    type: 'holding_limit',
    description: 'No single investor can hold more than 10% of total supply',
    isActive: true,
    parameters: {
      maxPercentage: 10,
      totalSupply: 100000000,
    },
    violationCount: 0,
  },
  {
    id: 'rule-3',
    name: 'KYC Verification Requirement',
    type: 'kyc_requirement',
    description: 'All token holders must have verified KYC status',
    isActive: true,
    parameters: {
      requiredStatus: 'verified',
      graceperiodDays: 30,
    },
    violationCount: 5,
    lastViolationDate: '2025-01-05',
  },
  {
    id: 'rule-4',
    name: 'Sanctioned Jurisdiction Block',
    type: 'jurisdiction_check',
    description: 'Prevent transfers to/from sanctioned jurisdictions',
    isActive: true,
    parameters: {
      blockedJurisdictions: ['IR', 'KP', 'RU', 'BY'],
    },
    violationCount: 1,
    lastViolationDate: '2024-11-28',
  },
];

// Demo Transfer Events
export const generateMockTransferEvents = (days: number = 30): TransferEvent[] => {
  const events: TransferEvent[] = [];
  const bondIds = ['US-TREAS-10Y-2034', 'AAPL-CORP-5Y-2029', 'JPM-BANK-7Y-2031'];

  for (let i = 0; i < days * 5; i++) {
    const date = format(subDays(new Date(), Math.floor(i / 5)), 'yyyy-MM-dd');
    const bondId = bondIds[Math.floor(Math.random() * bondIds.length)];
    const status = Math.random() > 0.9 ? 'blocked' : 'completed';

    events.push({
      id: `transfer-${i + 1}`,
      bondId,
      from: mockTokenHolders[Math.floor(Math.random() * mockTokenHolders.length)].address,
      to: mockTokenHolders[Math.floor(Math.random() * mockTokenHolders.length)].address,
      amount: Math.floor(Math.random() * 1000000 + 10000),
      timestamp: date,
      status: status as any,
      blockReason: status === 'blocked' ? 'KYC verification expired' : undefined,
      complianceChecks: ['kyc_check', 'sanctions_check', 'holding_limit_check'],
      gasUsed: Math.floor(Math.random() * 100000 + 65000),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Demo Pause/Freeze Events
export const mockPauseEvents: PauseEvent[] = [
  {
    id: 'pause-1',
    bondId: 'US-TREAS-10Y-2034',
    action: 'pause',
    initiator: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    reason: 'Emergency maintenance - smart contract upgrade',
    timestamp: '2024-12-20T14:30:00Z',
    blockNumber: 18954231,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
  {
    id: 'pause-2',
    bondId: 'US-TREAS-10Y-2034',
    action: 'unpause',
    initiator: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    reason: 'Maintenance completed - operations resumed',
    timestamp: '2024-12-20T16:45:00Z',
    blockNumber: 18954445,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  {
    id: 'freeze-1',
    bondId: 'AAPL-CORP-5Y-2029',
    action: 'freeze_account',
    targetAccount: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    initiator: '0x742d35Cc8Ab6A71F28d2B57F0f15F2F22D8b5E8A',
    reason: 'Suspicious activity detected - compliance investigation',
    timestamp: '2025-01-05T09:15:00Z',
    blockNumber: 18965123,
    transactionHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
  },
];

// ICMA Bond Data Taxonomy Compliance Demo
export interface ICMABondData {
  bondId: string;
  icmaVersion: string;
  bondDataTaxonomy: {
    // Legal Entity Identifier
    issuerLEI: string;
    // Bond Identification
    bondISIN: string;
    bondCFI: string;
    // Issue Details
    issueDate: string;
    maturityDate: string;
    denominationCurrency: string;
    // Pricing and Yield
    issuePrice: number;
    redemptionPrice: number;
    couponType: 'fixed' | 'floating' | 'zero' | 'step_up';
    couponFrequency: number;
    // Market Data
    tradingVenues: string[];
    settlementMethod: 'DvP' | 'FoP' | 'DVP_blockchain';
    // ESG Classification
    esgClassification?: string;
    sustainabilityGoals?: string[];
    // Regulatory Information
    regulatoryClassification: string;
    jurisdictionOfIncorporation: string;
  };
  complianceStatus: {
    icmaCompliant: boolean;
    lastValidationDate: string;
    validationVersion: string;
    complianceScore: number;
  };
}

// Demo ICMA Data
export const mockICMABondData: ICMABondData[] = [
  {
    bondId: 'US-TREAS-10Y-2034',
    icmaVersion: '1.2',
    bondDataTaxonomy: {
      issuerLEI: '549300FV9QOHI7N1GX79',
      bondISIN: 'US912828XW15',
      bondCFI: 'DTSXFR',
      issueDate: '2024-05-15',
      maturityDate: '2034-05-15',
      denominationCurrency: 'USD',
      issuePrice: 100.00,
      redemptionPrice: 100.00,
      couponType: 'fixed',
      couponFrequency: 2,
      tradingVenues: ['NYSE', 'NASDAQ', 'DLT_PLATFORM_CMTAT'],
      settlementMethod: 'DVP_blockchain',
      regulatoryClassification: 'Government Security',
      jurisdictionOfIncorporation: 'US',
    },
    complianceStatus: {
      icmaCompliant: true,
      lastValidationDate: '2025-01-10',
      validationVersion: '1.2.0',
      complianceScore: 98.5,
    },
  },
  {
    bondId: 'EU-GREEN-10Y-2034',
    icmaVersion: '1.2',
    bondDataTaxonomy: {
      issuerLEI: '549300ML2IS7MUFPEW53',
      bondISIN: 'EU000A3K0JN0',
      bondCFI: 'DTSXFR',
      issueDate: '2024-07-04',
      maturityDate: '2034-07-04',
      denominationCurrency: 'EUR',
      issuePrice: 100.00,
      redemptionPrice: 100.00,
      couponType: 'fixed',
      couponFrequency: 1,
      tradingVenues: ['EUREX', 'MTS', 'DLT_PLATFORM_CMTAT'],
      settlementMethod: 'DVP_blockchain',
      esgClassification: 'Green Bond',
      sustainabilityGoals: ['Climate Action', 'Clean Energy', 'Sustainable Transport'],
      regulatoryClassification: 'Supranational Security',
      jurisdictionOfIncorporation: 'EU',
    },
    complianceStatus: {
      icmaCompliant: true,
      lastValidationDate: '2025-01-12',
      validationVersion: '1.2.0',
      complianceScore: 99.2,
    },
  },
];

// Export all CMTAT demo data
export const cmtatDemoData = {
  tokenHolders: mockTokenHolders,
  complianceRules: mockComplianceRules,
  transferEvents: generateMockTransferEvents(30),
  pauseEvents: mockPauseEvents,
  icmaData: mockICMABondData,
};