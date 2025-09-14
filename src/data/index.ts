/**
 * Demo Data Index
 * Unified export for all demo seed data
 */

// Core data exports
export * from './mockData';
export * from './cmtatDemoData';
export * from './demoDataProvider';
export * from './orderBookGenerator';

// Default unified data provider
export { default as demoDataProvider } from './demoDataProvider';
export { default as generateOrderBookData } from './orderBookGenerator';

// Re-export key interfaces for convenience
export type {
  Bond,
  YieldCurvePoint,
  PriceHistory,
  Portfolio,
  MarketDepth,
  TradingVolume,
  MarketSentiment,
  ComplianceMetric,
  ScenarioAnalysis
} from '../types/financial';

export type {
  TokenHolder,
  ComplianceRule,
  TransferEvent,
  PauseEvent,
  ICMABondData,
} from './cmtatDemoData';

export type {
  EnhancedBond,
} from './demoDataProvider';

export type {
  OrderBookLevel,
  OrderBookSnapshot,
  OrderBookUpdate,
  OrderBookMetrics,
} from './orderBookGenerator';

// Demo data summary for quick access
export const DEMO_DATA_SUMMARY = {
  totalBonds: 13,
  tokenizedBonds: 9,
  traditionalBonds: 4,
  countries: ['US', 'EU', 'UK', 'DE', 'JP', 'SG', 'CH', 'CA', 'AU'],
  sectors: ['Government', 'Technology', 'Financial', 'Sovereign', 'Supranational'],
  currencies: ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'CHF', 'CAD', 'AUD'],
  ratings: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BB+', 'B+'],
  totalMarketCap: 25000000000, // $25B across all bonds

  features: {
    icmaCompliance: '100% of bonds have ICMA v1.2 compliance data',
    cmtatIntegration: '69% of bonds are CMTAT v3.0 enabled',
    esgBonds: '31% are ESG/Sustainability bonds',
    crossBorder: 'Multi-jurisdiction with 9 countries represented',
    realTimeData: 'Live order books, trading volumes, and compliance metrics',
  },

  compliance: {
    icmaVersion: '1.2.0',
    cmtatVersion: 'v3.0.0',
    regulatoryFrameworks: [
      'MiFID II (EU)',
      'SEC Regulations (US)',
      'MAS Digital Bond Framework (SG)',
      'FCA Rules (UK)',
    ],
  },

  technicalFeatures: {
    orderBookDepth: '15-20 levels per side',
    updateFrequency: '500ms for real-time updates',
    historicalData: '30+ days of price/volume history',
    marketMicrostructure: 'Realistic spread dynamics and liquidity patterns',
    complianceChecks: 'KYC, sanctions, transfer restrictions, holding limits',
  },
};

// Quick access functions
export const getDemoDataSummary = () => DEMO_DATA_SUMMARY;

export const getRandomBond = () => {
  const bonds = demoDataProvider.enhancedBonds;
  return bonds[Math.floor(Math.random() * bonds.length)];
};

export const getRandomTokenizedBond = () => {
  const tokenizedBonds = demoDataProvider.getTokenizedBonds();
  return tokenizedBonds[Math.floor(Math.random() * tokenizedBonds.length)];
};

export const getBondsByCountry = (country: string) => {
  return demoDataProvider.enhancedBonds.filter(bond => bond.country === country);
};

export const getBondsBySector = (sector: string) => {
  return demoDataProvider.enhancedBonds.filter(bond => bond.sector === sector);
};

export const getBondsByRating = (rating: string) => {
  return demoDataProvider.enhancedBonds.filter(bond => bond.rating === rating);
};