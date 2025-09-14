/**
 * Unified Demo Data Provider
 * Integrates CMTAT compliance data with ICMA bond taxonomy and market data
 */

import { mockBonds, mockData } from './mockData';
import { cmtatDemoData } from './cmtatDemoData';
import { Bond } from '@/types/financial';

// Enhanced bond interface with ICMA and CMTAT compliance
export interface EnhancedBond extends Bond {
  // ICMA Compliance
  icmaCompliance: {
    version: string;
    taxonomyCompliant: boolean;
    lastValidation: string;
    complianceScore: number;
    bondDataTaxonomy: {
      issuerLEI: string;
      bondCFI: string;
      settlementMethod: string;
      esgClassification?: string;
      sustainabilityGoals?: string[];
      regulatoryClassification: string;
      jurisdictionOfIncorporation: string;
    };
  };

  // CMTAT Compliance (only for tokenized bonds)
  cmtatCompliance?: {
    contractAddress: string;
    version: string;
    features: string[];
    complianceRules: string[];
    governanceModel: string;
    pauseCapability: boolean;
    snapshotCapability: boolean;
    documentManagement: boolean;
  };

  // Market microstructure
  marketStructure: {
    primaryMarket: {
      leadManager: string;
      bookRunner: string;
      issuanceDate: string;
      settlementDate: string;
      allocationMethod: string;
    };
    secondaryMarket: {
      tradingVenues: string[];
      marketMakers: string[];
      avgDailyVolume: number;
      typicalTradeSize: number;
    };
  };
}

// Generate enhanced bonds with ICMA + CMTAT compliance
export const generateEnhancedBonds = (): EnhancedBond[] => {
  return mockBonds.map((bond, index) => {
    // ICMA compliance data
    const icmaCompliance = {
      version: '1.2.0',
      taxonomyCompliant: true,
      lastValidation: '2025-01-10',
      complianceScore: 95 + Math.random() * 5,
      bondDataTaxonomy: {
        issuerLEI: `${bond.country.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 22).toUpperCase()}`,
        bondCFI: getBondCFI(bond),
        settlementMethod: bond.isTokenized ? 'DVP_blockchain' : 'DVP_traditional',
        esgClassification: getESGClassification(bond),
        sustainabilityGoals: getSustainabilityGoals(bond),
        regulatoryClassification: getRegulatoryClassification(bond),
        jurisdictionOfIncorporation: bond.country,
      },
    };

    // CMTAT compliance data (only for tokenized bonds)
    const cmtatCompliance = bond.isTokenized ? {
      contractAddress: bond.tokenAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
      version: 'v3.0.0',
      features: [
        'ERC20_COMPLIANT',
        'PAUSABLE',
        'DOCUMENT_MANAGEMENT',
        'SNAPSHOT',
        'VALIDATION',
        'ENFORCEMENT',
      ],
      complianceRules: [
        'KYC_VERIFICATION',
        'TRANSFER_RESTRICTIONS',
        'HOLDING_LIMITS',
        'JURISDICTION_COMPLIANCE',
      ],
      governanceModel: 'MULTISIG',
      pauseCapability: true,
      snapshotCapability: true,
      documentManagement: true,
    } : undefined;

    // Market structure data
    const marketStructure = {
      primaryMarket: {
        leadManager: getPrimaryMarketLeadManager(bond),
        bookRunner: getBookRunner(bond),
        issuanceDate: bond.isTokenized ? '2024-' + String(3 + index % 10).padStart(2, '0') + '-15' : '2023-' + String(6 + index % 7).padStart(2, '0') + '-01',
        settlementDate: bond.isTokenized ? '2024-' + String(3 + index % 10).padStart(2, '0') + '-17' : '2023-' + String(6 + index % 7).padStart(2, '0') + '-03',
        allocationMethod: bond.isTokenized ? 'ALGORITHMIC_AUCTION' : 'TRADITIONAL_BOOKBUILDING',
      },
      secondaryMarket: {
        tradingVenues: getSecondaryTradingVenues(bond),
        marketMakers: getMarketMakers(bond),
        avgDailyVolume: bond.tradingVolume24h,
        typicalTradeSize: getTypicalTradeSize(bond),
      },
    };

    return {
      ...bond,
      icmaCompliance,
      cmtatCompliance,
      marketStructure,
    };
  });
};

// Helper functions for generating compliance-specific data
function getBondCFI(bond: Bond): string {
  // CFI codes for debt instruments
  const baseCode = 'DT'; // Debt instruments

  // Interest rate type
  const interestType = bond.couponRate === 0 ? 'ZR' : 'SX'; // Zero rate or Step rate/Other

  // Form - bearer vs registered
  const form = 'FR'; // Form = Registered

  return baseCode + interestType + form;
}

function getESGClassification(bond: Bond): string | undefined {
  if (bond.name.toLowerCase().includes('green')) return 'Green Bond';
  if (bond.name.toLowerCase().includes('sustainability')) return 'Sustainability Bond';
  if (bond.name.toLowerCase().includes('climate')) return 'Climate Bond';
  if (bond.name.toLowerCase().includes('social')) return 'Social Bond';
  return undefined;
}

function getSustainabilityGoals(bond: Bond): string[] | undefined {
  const esg = getESGClassification(bond);
  if (!esg) return undefined;

  if (esg === 'Green Bond') {
    return ['Clean Energy', 'Energy Efficiency', 'Sustainable Transport', 'Climate Action'];
  } else if (esg === 'Sustainability Bond') {
    return ['Clean Energy', 'Social Infrastructure', 'Sustainable Agriculture'];
  } else if (esg === 'Climate Bond') {
    return ['Climate Mitigation', 'Climate Adaptation', 'Low Carbon Transport'];
  }
  return ['Social Infrastructure', 'Affordable Housing', 'Healthcare Access'];
}

function getRegulatoryClassification(bond: Bond): string {
  if (bond.sector === 'Government' || bond.sector === 'Sovereign') return 'Government Security';
  if (bond.sector === 'Supranational') return 'Supranational Security';
  if (bond.sector === 'Financial') return 'Financial Institution Security';
  return 'Corporate Security';
}

function getPrimaryMarketLeadManager(bond: Bond): string {
  const managers = {
    'US': ['Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Bank of America', 'Citi'],
    'EU': ['Deutsche Bank', 'BNP Paribas', 'UBS', 'Credit Suisse', 'Barclays'],
    'UK': ['Barclays', 'HSBC', 'Lloyds', 'Royal Bank of Scotland'],
    'JP': ['Nomura', 'Daiwa', 'Mizuho', 'SMBC Nikko'],
    'CH': ['UBS', 'Credit Suisse'],
    'SG': ['DBS', 'OCBC', 'UOB'],
    'CA': ['RBC', 'TD Securities', 'Scotiabank'],
    'AU': ['Macquarie', 'Commonwealth Bank', 'ANZ', 'Westpac'],
  };

  const countryCode = bond.country === 'United States' ? 'US'
    : bond.country === 'Germany' ? 'EU'
    : bond.country === 'United Kingdom' ? 'UK'
    : bond.country === 'Japan' ? 'JP'
    : bond.country === 'Switzerland' ? 'CH'
    : bond.country === 'Singapore' ? 'SG'
    : bond.country === 'Canada' ? 'CA'
    : bond.country === 'Australia' ? 'AU'
    : 'US';

  const managerList = managers[countryCode] || managers['US'];
  return managerList[Math.floor(Math.random() * managerList.length)];
}

function getBookRunner(bond: Bond): string {
  return getPrimaryMarketLeadManager(bond); // Usually same as lead manager
}

function getSecondaryTradingVenues(bond: Bond): string[] {
  if (bond.isTokenized) {
    return [
      'DLT_PRIMARY_PLATFORM',
      'TRADFI_ECN',
      'BLOCKCHAIN_DEX',
      'HYBRID_VENUE',
      'INSTITUTIONAL_CROSSING',
    ];
  } else {
    return [
      'BLOOMBERG_TRADEBOOK',
      'MARKETAXESS',
      'TRADEWEB',
      'VOICE_BROKER',
      'ELECTRONIC_MATCHING',
    ];
  }
}

function getMarketMakers(bond: Bond): string[] {
  if (bond.isTokenized) {
    return [
      'Digital Asset MM',
      'Crypto Trading Firm',
      'Tokenized Securities LP',
      'DLT Market Maker',
    ];
  } else {
    return [
      'Primary Dealers',
      'Bank Market Makers',
      'Electronic Market Makers',
      'Institutional LPs',
    ];
  }
}

function getTypicalTradeSize(bond: Bond): number {
  if (bond.rating === 'AAA' || bond.rating.startsWith('AA')) {
    return bond.isTokenized ? 250000 : 500000; // High grade
  } else if (bond.rating.startsWith('A') || bond.rating.startsWith('BBB')) {
    return bond.isTokenized ? 150000 : 300000; // Investment grade
  } else {
    return bond.isTokenized ? 75000 : 150000; // High yield
  }
}

// Sample bond issuance events with full ICMA compliance
export const sampleBondIssuances = [
  {
    bondId: 'NEW-ISSUE-2025-001',
    issuanceName: 'European Central Bank Digital Euro Bond Series 1',
    issuer: 'European Central Bank',
    announcementDate: '2025-01-15',
    pricingDate: '2025-02-15',
    settlementDate: '2025-02-20',
    maturityDate: '2032-02-20',
    nominalAmount: 2000000000, // €2B
    currency: 'EUR',
    couponRate: 2.85,
    issuePrice: 99.75,
    icmaCompliant: true,
    cmtatEnabled: true,
    features: {
      digitalNative: true,
      crossBorderSettlement: true,
      realTimeCompliance: true,
      automaticReporting: true,
    },
    regulatoryApprovals: [
      'ECB_APPROVAL_2025_001',
      'ESMA_DIGITAL_BOND_FRAMEWORK',
      'MiFID_II_COMPLIANT',
    ],
    sustainabilityFeatures: {
      greenBond: true,
      euTaxonomy: true,
      sustainabilityGoals: ['Digital Infrastructure', 'Green Technology', 'Financial Inclusion'],
    },
  },
  {
    bondId: 'NEW-ISSUE-2025-002',
    issuanceName: 'Singapore Government DLT Infrastructure Bond',
    issuer: 'Monetary Authority of Singapore',
    announcementDate: '2025-01-20',
    pricingDate: '2025-03-01',
    settlementDate: '2025-03-03',
    maturityDate: '2035-03-03',
    nominalAmount: 1000000000, // S$1B
    currency: 'SGD',
    couponRate: 3.25,
    issuePrice: 100.00,
    icmaCompliant: true,
    cmtatEnabled: true,
    features: {
      digitalNative: true,
      crossBorderSettlement: true,
      smartContractGovernance: true,
      blockchainAuditTrail: true,
    },
    regulatoryApprovals: [
      'MAS_DIGITAL_BOND_LICENSE_2025',
      'ASEAN_PLUS_THREE_FRAMEWORK',
    ],
    sustainabilityFeatures: {
      sustainabilityBond: true,
      asiaPacificStandards: true,
      sustainabilityGoals: ['Smart City Development', 'Digital Infrastructure', 'Carbon Neutrality'],
    },
  },
];

// Export unified demo data provider
export const demoDataProvider = {
  enhancedBonds: generateEnhancedBonds(),
  cmtatData: cmtatDemoData,
  marketData: mockData,
  bondIssuances: sampleBondIssuances,
  // Utility functions
  getBondById: (bondId: string) => generateEnhancedBonds().find(b => b.id === bondId),
  getTokenizedBonds: () => generateEnhancedBonds().filter(b => b.isTokenized),
  getICMACompliantBonds: () => generateEnhancedBonds().filter(b => b.icmaCompliance.taxonomyCompliant),
  getCMTATEnabledBonds: () => generateEnhancedBonds().filter(b => b.cmtatCompliance),
  getESGBonds: () => generateEnhancedBonds().filter(b => b.icmaCompliance.bondDataTaxonomy.esgClassification),
};

export default demoDataProvider;