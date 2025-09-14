import { Bond, YieldCurvePoint, PriceHistory, Portfolio, MarketDepth, TradingVolume, MarketSentiment, ComplianceMetric, ScenarioAnalysis } from '@/types/financial';
import { format, subDays, subMonths, addDays } from 'date-fns';

// Generate mock bonds with enhanced CMTAT + ICMA compliance features
export const mockBonds: Bond[] = [
  {
    id: 'US-TREAS-10Y-2034',
    name: 'US Treasury 10-Year Note',
    isin: 'US912828XW15',
    issuer: 'US Treasury',
    currency: 'USD',
    faceValue: 1000,
    couponRate: 4.25,
    maturityDate: '2034-05-15',
    rating: 'AAA',
    currentPrice: 98.75,
    yieldToMaturity: 4.35,
    duration: 8.7,
    convexity: 76.2,
    creditSpread: 0,
    sector: 'Government',
    country: 'United States',
    isTokenized: true,
    tokenAddress: '0x1234567890123456789012345678901234567890',
    tradingVolume24h: 125000000,
    lastTradedPrice: 98.76,
    bidPrice: 98.74,
    askPrice: 98.77,
    marketCap: 2500000000,
  },
  {
    id: 'AAPL-CORP-5Y-2029',
    name: 'Apple Inc. 5-Year Corporate Bond',
    isin: 'US037833CK75',
    issuer: 'Apple Inc.',
    currency: 'USD',
    faceValue: 1000,
    couponRate: 3.85,
    maturityDate: '2029-08-01',
    rating: 'AA+',
    currentPrice: 102.15,
    yieldToMaturity: 3.45,
    duration: 4.6,
    convexity: 21.8,
    creditSpread: 85,
    sector: 'Technology',
    country: 'United States',
    isTokenized: true,
    tokenAddress: '0x2345678901234567890123456789012345678901',
    tradingVolume24h: 45000000,
    lastTradedPrice: 102.12,
    bidPrice: 102.10,
    askPrice: 102.18,
    marketCap: 1200000000,
  },
  {
    id: 'JPM-BANK-7Y-2031',
    name: 'JPMorgan Chase 7-Year Senior Note',
    isin: 'US46647PCK95',
    issuer: 'JPMorgan Chase & Co.',
    currency: 'USD',
    faceValue: 1000,
    couponRate: 4.95,
    maturityDate: '2031-03-15',
    rating: 'A+',
    currentPrice: 99.85,
    yieldToMaturity: 4.98,
    duration: 6.2,
    convexity: 38.5,
    creditSpread: 145,
    sector: 'Financial',
    country: 'United States',
    isTokenized: true,
    tokenAddress: '0x3456789012345678901234567890123456789012',
    tradingVolume24h: 32000000,
    lastTradedPrice: 99.82,
    bidPrice: 99.80,
    askPrice: 99.88,
    marketCap: 800000000,
  },
  {
    id: 'DE-BUND-10Y-2034',
    name: 'German Federal Bond 10-Year',
    isin: 'DE0001102440',
    issuer: 'Federal Republic of Germany',
    currency: 'EUR',
    faceValue: 1000,
    couponRate: 2.60,
    maturityDate: '2034-07-04',
    rating: 'AAA',
    currentPrice: 94.25,
    yieldToMaturity: 2.98,
    duration: 9.1,
    convexity: 85.7,
    creditSpread: 0,
    sector: 'Sovereign',
    country: 'Germany',
    isTokenized: false,
    tradingVolume24h: 85000000,
    lastTradedPrice: 94.22,
    bidPrice: 94.20,
    askPrice: 94.28,
    marketCap: 3500000000,
  },
  {
    id: 'MSFT-CORP-15Y-2039',
    name: 'Microsoft Corporation 15-Year Bond',
    isin: 'US594918BW65',
    issuer: 'Microsoft Corporation',
    currency: 'USD',
    faceValue: 1000,
    couponRate: 4.50,
    maturityDate: '2039-11-03',
    rating: 'AAA',
    currentPrice: 105.30,
    yieldToMaturity: 4.15,
    duration: 11.8,
    convexity: 142.6,
    creditSpread: 65,
    sector: 'Technology',
    country: 'United States',
    isTokenized: true,
    tokenAddress: '0x4567890123456789012345678901234567890123',
    tradingVolume24h: 28000000,
    lastTradedPrice: 105.28,
    bidPrice: 105.25,
    askPrice: 105.35,
    marketCap: 950000000,
  },
  // Additional European and Asian Tokenized Bonds
  {
    id: 'CH-UBS-5Y-2029',
    name: 'UBS Swiss 5-Year Green Bond',
    isin: 'CH0528261513',
    issuer: 'UBS Group AG',
    currency: 'CHF',
    faceValue: 1000,
    couponRate: 1.85,
    maturityDate: '2029-06-15',
    rating: 'A+',
    currentPrice: 97.45,
    yieldToMaturity: 2.15,
    duration: 4.8,
    convexity: 23.2,
    creditSpread: 95,
    sector: 'Financial',
    country: 'Switzerland',
    isTokenized: true,
    tokenAddress: '0x5678901234567890123456789012345678901234',
    tradingVolume24h: 18500000,
    lastTradedPrice: 97.42,
    bidPrice: 97.40,
    askPrice: 97.48,
    marketCap: 465000000,
  },
  {
    id: 'SG-DBS-7Y-2031',
    name: 'DBS Bank Singapore 7-Year Sustainability Bond',
    isin: 'SG73F4000007',
    issuer: 'DBS Bank Ltd.',
    currency: 'SGD',
    faceValue: 1000,
    couponRate: 3.75,
    maturityDate: '2031-09-20',
    rating: 'AA-',
    currentPrice: 101.25,
    yieldToMaturity: 3.58,
    duration: 6.1,
    convexity: 37.8,
    creditSpread: 125,
    sector: 'Financial',
    country: 'Singapore',
    isTokenized: true,
    tokenAddress: '0x6789012345678901234567890123456789012345',
    tradingVolume24h: 12800000,
    lastTradedPrice: 101.22,
    bidPrice: 101.20,
    askPrice: 101.28,
    marketCap: 320000000,
  },
  {
    id: 'UK-GILT-30Y-2054',
    name: 'UK Treasury Gilt 30-Year',
    isin: 'GB00BK5CVX03',
    issuer: 'HM Treasury',
    currency: 'GBP',
    faceValue: 1000,
    couponRate: 3.25,
    maturityDate: '2054-01-22',
    rating: 'AA',
    currentPrice: 89.15,
    yieldToMaturity: 3.85,
    duration: 18.9,
    convexity: 385.4,
    creditSpread: 0,
    sector: 'Sovereign',
    country: 'United Kingdom',
    isTokenized: false,
    tradingVolume24h: 67000000,
    lastTradedPrice: 89.12,
    bidPrice: 89.10,
    askPrice: 89.18,
    marketCap: 4200000000,
  },
  {
    id: 'JP-SOFTBANK-4Y-2028',
    name: 'SoftBank Corp. 4-Year Digital Infrastructure Bond',
    isin: 'JP1306602028',
    issuer: 'SoftBank Corporation',
    currency: 'JPY',
    faceValue: 100000,
    couponRate: 2.45,
    maturityDate: '2028-03-15',
    rating: 'BB+',
    currentPrice: 9850,
    yieldToMaturity: 2.78,
    duration: 3.7,
    convexity: 14.2,
    creditSpread: 245,
    sector: 'Technology',
    country: 'Japan',
    isTokenized: true,
    tokenAddress: '0x7890123456789012345678901234567890123456',
    tradingVolume24h: 8900000000,
    lastTradedPrice: 9848,
    bidPrice: 9845,
    askPrice: 9852,
    marketCap: 148500000000,
  },
  {
    id: 'CA-SHOPIFY-6Y-2030',
    name: 'Shopify Inc. 6-Year Innovation Bond',
    isin: 'CA82509L1094',
    issuer: 'Shopify Inc.',
    currency: 'CAD',
    faceValue: 1000,
    couponRate: 4.15,
    maturityDate: '2030-12-01',
    rating: 'BBB+',
    currentPrice: 103.80,
    yieldToMaturity: 3.68,
    duration: 5.4,
    convexity: 29.8,
    creditSpread: 185,
    sector: 'Technology',
    country: 'Canada',
    isTokenized: true,
    tokenAddress: '0x8901234567890123456789012345678901234567',
    tradingVolume24h: 15600000,
    lastTradedPrice: 103.78,
    bidPrice: 103.75,
    askPrice: 103.85,
    marketCap: 234000000,
  },
  {
    id: 'AU-CBA-8Y-2032',
    name: 'Commonwealth Bank Australia 8-Year Climate Bond',
    isin: 'AU0000CBA5T6',
    issuer: 'Commonwealth Bank of Australia',
    currency: 'AUD',
    faceValue: 1000,
    couponRate: 4.65,
    maturityDate: '2032-04-28',
    rating: 'AA-',
    currentPrice: 98.95,
    yieldToMaturity: 4.78,
    duration: 6.9,
    convexity: 48.3,
    creditSpread: 135,
    sector: 'Financial',
    country: 'Australia',
    isTokenized: true,
    tokenAddress: '0x9012345678901234567890123456789012345678',
    tradingVolume24h: 22300000,
    lastTradedPrice: 98.92,
    bidPrice: 98.90,
    askPrice: 98.98,
    marketCap: 445000000,
  },
  // ESG and Sustainability Bonds
  {
    id: 'EU-GREEN-10Y-2034',
    name: 'European Union NextGenerationEU Green Bond',
    isin: 'EU000A3K0JN0',
    issuer: 'European Union',
    currency: 'EUR',
    faceValue: 1000,
    couponRate: 0.40,
    maturityDate: '2034-07-04',
    rating: 'AAA',
    currentPrice: 78.25,
    yieldToMaturity: 2.95,
    duration: 9.8,
    convexity: 98.5,
    creditSpread: 0,
    sector: 'Supranational',
    country: 'European Union',
    isTokenized: true,
    tokenAddress: '0x0123456789012345678901234567890123456789',
    tradingVolume24h: 185000000,
    lastTradedPrice: 78.22,
    bidPrice: 78.20,
    askPrice: 78.28,
    marketCap: 3900000000,
  },
  {
    id: 'TSLA-ESG-12Y-2036',
    name: 'Tesla Inc. 12-Year Sustainable Transport Bond',
    isin: 'US88160RAG12',
    issuer: 'Tesla, Inc.',
    currency: 'USD',
    faceValue: 1000,
    couponRate: 5.25,
    maturityDate: '2036-08-15',
    rating: 'B+',
    currentPrice: 95.60,
    yieldToMaturity: 5.68,
    duration: 9.2,
    convexity: 85.4,
    creditSpread: 385,
    sector: 'Technology',
    country: 'United States',
    isTokenized: true,
    tokenAddress: '0x1023456789012345678901234567890123456789',
    tradingVolume24h: 34500000,
    lastTradedPrice: 95.58,
    bidPrice: 95.55,
    askPrice: 95.65,
    marketCap: 478000000,
  },
];

// Generate yield curve data
export const generateYieldCurveData = (): YieldCurvePoint[] => {
  const maturities = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
  const today = new Date().toISOString().split('T')[0];

  return maturities.map(maturity => ({
    maturity,
    yield: 3.5 + (maturity * 0.15) + (Math.random() - 0.5) * 0.3,
    date: today,
    curveType: 'treasury' as const,
  }));
};

// Generate corporate yield curve
export const generateCorporateYieldCurve = (): YieldCurvePoint[] => {
  const treasuryCurve = generateYieldCurveData();
  return treasuryCurve.map(point => ({
    ...point,
    yield: point.yield + 1.2 + (Math.random() - 0.5) * 0.2, // Credit spread
    curveType: 'corporate' as const,
  }));
};

// Generate historical price data
export const generatePriceHistory = (bondId: string, days: number = 30): PriceHistory[] => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) return [];

  const data: PriceHistory[] = [];
  const basePrice = bond.currentPrice;

  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const volatility = 0.5; // Daily volatility %
    const drift = -0.02; // Small downward drift

    const priceChange = (Math.random() - 0.5) * volatility + drift;
    const price = basePrice * (1 + (priceChange / 100));
    const volume = Math.floor(Math.random() * 10000000 + 1000000);

    data.push({
      timestamp: date,
      price: Number(price.toFixed(2)),
      volume,
      yieldToMaturity: bond.yieldToMaturity + (Math.random() - 0.5) * 0.1,
      creditSpread: bond.creditSpread + (Math.random() - 0.5) * 5,
      bondId,
    });
  }

  return data;
};

// Generate portfolio data
// Generate dynamic portfolio from enhanced bonds
export const generateEnhancedPortfolio = (): Portfolio => {
  // Import only the bonds here to avoid circular dependency
  if (!mockBonds || !Array.isArray(mockBonds) || mockBonds.length === 0) {
    console.warn('mockBonds not available for portfolio generation, returning empty portfolio');
    return {
      id: 'empty-portfolio',
      positions: [],
      totalValue: 0,
      totalReturn: 0,
      averageDuration: 0,
      averageYield: 0,
      totalUnrealizedPnL: 0,
      performance: {
        dailyReturn: 0,
        weeklyReturn: 0,
        monthlyReturn: 0,
        ytdReturn: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  const bonds = mockBonds.slice(0, 6); // Use first 6 bonds for diversity

  const positions = bonds.map((bond, index) => {
    const quantity = 1000 + index * 750;
    const purchasePrice = bond.currentPrice - (0.5 + Math.random() * 1.5);

    return {
      bondId: bond.id,
      bond,
      quantity,
      averagePurchasePrice: purchasePrice,
      currentMarketValue: bond.currentPrice * quantity,
      unrealizedPnL: (bond.currentPrice - purchasePrice) * quantity,
      weightInPortfolio: 0, // Will be calculated below
      duration: bond.duration,
      yieldContribution: 0, // Will be calculated below
    };
  });

  const totalValue = positions.reduce((sum, pos) => sum + pos.currentMarketValue, 0);

  // Calculate weights and yield contributions
  positions.forEach(position => {
    position.weightInPortfolio = position.currentMarketValue / totalValue;
    position.yieldContribution = position.bond.yieldToMaturity * position.weightInPortfolio;
  });

  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalReturn = (totalUnrealizedPnL / totalValue) * 100;
  const averageDuration = positions.reduce((sum, pos) => sum + pos.duration * pos.weightInPortfolio, 0);
  const averageYield = positions.reduce((sum, pos) => sum + pos.yieldContribution, 0);

  return {
    id: 'institutional-portfolio-1',
    name: 'CMTAT + ICMA Enhanced Fixed Income Portfolio',
    totalValue,
    totalUnrealizedPnL,
    totalReturn,
    positions,
    averageDuration,
    averageYield,
    averageRating: 'AA',
    riskMetrics: {
      var95: Math.floor(totalValue * 0.018),
      var99: Math.floor(totalValue * 0.0285),
      expectedShortfall: Math.floor(totalValue * 0.032),
      beta: 0.85,
      sharpeRatio: 1.35,
      volatility: 11.8,
      maximumDrawdown: 7.4,
    },
    lastUpdated: new Date().toISOString(),
  };
};

// Cache for generated portfolio to avoid recomputation during SSR
let cachedPortfolio: Portfolio | null = null;

export function getMockPortfolio(): Portfolio {
  if (!cachedPortfolio) {
    cachedPortfolio = generateEnhancedPortfolio();
  }
  return cachedPortfolio;
}

// Generate market depth data with realistic liquidity patterns
export const generateMarketDepth = (bondId: string): MarketDepth => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) throw new Error('Bond not found');

  const midPrice = bond.currentPrice;

  // Dynamic spread based on bond characteristics
  let spread = 0.05; // Default
  if (bond.rating === 'AAA') spread = 0.02;
  else if (bond.rating.startsWith('AA')) spread = 0.03;
  else if (bond.rating.startsWith('A')) spread = 0.05;
  else if (bond.rating.startsWith('BBB')) spread = 0.08;
  else spread = 0.15; // High-yield bonds

  // Liquidity varies by market cap and tokenization status
  const liquidityMultiplier = bond.isTokenized ? 1.5 : 1.0;
  const marketCapFactor = Math.min(bond.marketCap / 1000000000, 3); // Max 3x for large bonds

  // Generate realistic order book with decreasing liquidity away from midprice
  const bids = Array.from({ length: 15 }, (_, i) => {
    const priceLevel = midPrice - spread/2 - (i * 0.005 * (1 + i * 0.1));
    const distanceFromMid = Math.abs(midPrice - priceLevel) / midPrice;

    // Liquidity decreases exponentially with distance from mid
    const baseLiquidity = Math.floor(Math.random() * 500000 + 100000);
    const liquidityDecay = Math.exp(-distanceFromMid * 20);
    const quantity = Math.floor(baseLiquidity * liquidityDecay * liquidityMultiplier * marketCapFactor);

    return {
      price: Number(priceLevel.toFixed(3)),
      quantity: Math.max(quantity, 10000), // Minimum order size
      orders: Math.max(Math.floor(Math.random() * 8 + 1), 1),
      side: 'bid' as const,
    };
  });

  const asks = Array.from({ length: 15 }, (_, i) => {
    const priceLevel = midPrice + spread/2 + (i * 0.005 * (1 + i * 0.1));
    const distanceFromMid = Math.abs(priceLevel - midPrice) / midPrice;

    const baseLiquidity = Math.floor(Math.random() * 500000 + 100000);
    const liquidityDecay = Math.exp(-distanceFromMid * 20);
    const quantity = Math.floor(baseLiquidity * liquidityDecay * liquidityMultiplier * marketCapFactor);

    return {
      price: Number(priceLevel.toFixed(3)),
      quantity: Math.max(quantity, 10000),
      orders: Math.max(Math.floor(Math.random() * 8 + 1), 1),
      side: 'ask' as const,
    };
  });

  return {
    bondId,
    timestamp: new Date().toISOString(),
    bids: bids.sort((a, b) => b.price - a.price),
    asks: asks.sort((a, b) => a.price - b.price),
    spread,
    midPrice,
  };
};

// Generate trading volume data with realistic patterns
export const generateTradingVolumeData = (bondId: string, days: number = 30): TradingVolume[] => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) return [];

  const baseVolume = bond.tradingVolume24h;
  const basePrice = bond.currentPrice;

  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i);
    const dayOfWeek = date.getDay();

    // Market patterns: Lower volume on weekends and Fridays
    let volumeMultiplier = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) volumeMultiplier = 0.3; // Weekend
    else if (dayOfWeek === 5) volumeMultiplier = 0.7; // Friday
    else if (dayOfWeek === 1) volumeMultiplier = 1.2; // Monday catch-up

    // Add monthly/quarterly rollover effects
    const dayOfMonth = date.getDate();
    if (dayOfMonth <= 3 || dayOfMonth >= 28) volumeMultiplier *= 1.4; // Month-end rebalancing

    // Volatility clustering - high volume follows high volume
    const volatilityCluster = Math.random() > 0.7 ? 1.8 : 1.0;

    // Tokenized bonds have different patterns
    const tokenizationBoost = bond.isTokenized ? 1.3 : 1.0;

    const dailyVolume = Math.floor(
      baseVolume * volumeMultiplier * volatilityCluster * tokenizationBoost *
      (0.5 + Math.random() * 1.0) // Random factor
    );

    const numberOfTrades = Math.floor(dailyVolume / 100000) + Math.floor(Math.random() * 50 + 10);

    // VWAP with realistic price impact
    const priceImpact = (dailyVolume / baseVolume - 1) * 0.1; // Higher volume = slight price impact
    const vwap = basePrice * (1 + priceImpact + (Math.random() - 0.5) * 0.02);

    return {
      timestamp: format(date, 'yyyy-MM-dd'),
      bondId,
      volume: Math.max(dailyVolume, 100000), // Minimum volume
      notional: Math.floor(dailyVolume * vwap),
      numberOfTrades,
      vwap: Number(vwap.toFixed(3)),
    };
  });
};

// Generate market sentiment data
export const generateMarketSentimentData = (days: number = 30): MarketSentiment[] => {
  return Array.from({ length: days }, (_, i) => ({
    timestamp: format(subDays(new Date(), days - i), 'yyyy-MM-dd'),
    overall: true,
    sentimentScore: (Math.random() - 0.5) * 1.8, // -0.9 to 0.9
    volatilityIndex: Math.random() * 40 + 10, // 10 to 50
    liquidityScore: Math.random() * 100,
    newsCount: Math.floor(Math.random() * 50 + 10),
    socialMediaMentions: Math.floor(Math.random() * 1000 + 100),
  }));
};

// Generate compliance metrics
export const generateComplianceMetrics = (days: number = 30): ComplianceMetric[] => {
  const metrics: ComplianceMetric['metric'][] = ['concentration', 'duration', 'credit_quality', 'liquidity', 'regulatory'];
  const data: ComplianceMetric[] = [];

  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - i), 'yyyy-MM-dd');

    metrics.forEach(metric => {
      const threshold = metric === 'concentration' ? 25 : metric === 'duration' ? 10 : 75;
      const value = Math.random() * (threshold * 1.3);

      let status: ComplianceMetric['status'] = 'compliant';
      let impact: ComplianceMetric['impact'] = 'low';

      if (value > threshold * 1.1) {
        status = 'breach';
        impact = 'high';
      } else if (value > threshold * 0.9) {
        status = 'warning';
        impact = 'medium';
      }

      data.push({
        timestamp: date,
        metric,
        value: Number(value.toFixed(2)),
        threshold,
        status,
        impact,
      });
    });
  }

  return data;
};

// Generate scenario analysis data
export const mockScenarioAnalysis: ScenarioAnalysis[] = [
  {
    scenarioName: 'Interest Rate Shock +200bp',
    description: 'Parallel shift up in yield curve by 200 basis points',
    parameters: {
      interestRateShock: 200,
    },
    results: {
      portfolioValue: 9200000,
      valueChange: -800000,
      valueChangePercent: -8.0,
      riskMetrics: {
        var95: 220000,
        var99: 340000,
        expectedShortfall: 380000,
        beta: 0.92,
        sharpeRatio: 0.8,
        volatility: 18.5,
        maximumDrawdown: 12.5,
      },
    },
  },
  {
    scenarioName: 'Credit Spread Widening +150bp',
    description: 'Corporate credit spreads widen by 150 basis points',
    parameters: {
      creditSpreadWidening: 150,
    },
    results: {
      portfolioValue: 9400000,
      valueChange: -600000,
      valueChangePercent: -6.0,
      riskMetrics: {
        var95: 200000,
        var99: 310000,
        expectedShortfall: 350000,
        beta: 0.88,
        sharpeRatio: 0.9,
        volatility: 15.8,
        maximumDrawdown: 10.2,
      },
    },
  },
  {
    scenarioName: 'Liquidity Stress -30%',
    description: 'Market liquidity decreases by 30% across all positions',
    parameters: {
      liquidityStress: 30,
    },
    results: {
      portfolioValue: 9650000,
      valueChange: -350000,
      valueChangePercent: -3.5,
      riskMetrics: {
        var95: 195000,
        var99: 295000,
        expectedShortfall: 335000,
        beta: 0.87,
        sharpeRatio: 1.0,
        volatility: 14.2,
        maximumDrawdown: 9.8,
      },
    },
  },
];

// Generate intraday trading patterns (15-minute intervals)
export const generateIntradayData = (bondId: string, hours: number = 8): Array<{
  timestamp: string;
  bondId: string;
  price: number;
  volume: number;
  trades: number;
  bidPrice: number;
  askPrice: number;
  spread: number;
}> => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) return [];

  const intervals = hours * 4; // 15-minute intervals
  const basePrice = bond.currentPrice;
  const baseVolume = bond.tradingVolume24h / (24 * 4); // Average per 15min

  const data = [];
  let currentPrice = basePrice;

  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date();
    intervalStart.setHours(9, 0, 0, 0); // Market open
    intervalStart.setMinutes(intervalStart.getMinutes() + (i * 15));

    const hour = intervalStart.getHours();

    // Market microstructure: higher volume at open/close
    let volumeMultiplier = 1.0;
    if (hour === 9) volumeMultiplier = 2.5; // Market open
    else if (hour === 16) volumeMultiplier = 2.0; // Market close
    else if (hour >= 11 && hour <= 13) volumeMultiplier = 1.3; // Lunch activity
    else if (hour >= 14 && hour <= 15) volumeMultiplier = 0.7; // Afternoon lull

    // Price walk with mean reversion
    const priceChange = (Math.random() - 0.5) * 0.1 + (basePrice - currentPrice) * 0.02;
    currentPrice = currentPrice + priceChange;

    // Dynamic spread based on time of day
    const baseSpread = bond.isTokenized ? 0.02 : 0.05;
    const spreadMultiplier = volumeMultiplier > 1.5 ? 0.8 : 1.2; // Tighter spreads during high volume
    const spread = baseSpread * spreadMultiplier;

    const intervalVolume = Math.floor(baseVolume * volumeMultiplier * (0.3 + Math.random() * 1.4));
    const trades = Math.max(Math.floor(intervalVolume / 50000), 1);

    data.push({
      timestamp: intervalStart.toISOString(),
      bondId,
      price: Number(currentPrice.toFixed(3)),
      volume: intervalVolume,
      trades,
      bidPrice: Number((currentPrice - spread/2).toFixed(3)),
      askPrice: Number((currentPrice + spread/2).toFixed(3)),
      spread: Number(spread.toFixed(3)),
    });
  }

  return data;
};

// Generate live order flow simulation
export const generateLiveOrderFlow = (bondId: string, count: number = 50): Array<{
  timestamp: string;
  bondId: string;
  orderId: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  price: number;
  quantity: number;
  status: 'filled' | 'partial' | 'cancelled' | 'pending';
  trader: string;
  executionVenue: string;
}> => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) return [];

  const orders = [];
  const venues = bond.isTokenized
    ? ['DLT_PRIMARY', 'DEX_UNISWAP', 'TRADFI_ECN', 'DARK_POOL']
    : ['BLOOMBERG_AQS', 'MARKETAXESS', 'TRADEWEB', 'VOICE_BROKER'];

  const traderTypes = ['INSTITUTIONAL', 'HEDGE_FUND', 'ASSET_MANAGER', 'MARKET_MAKER', 'PROPRIETARY'];

  for (let i = 0; i < count; i++) {
    const orderTime = new Date(Date.now() - Math.random() * 3600000); // Last hour
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const orderType = Math.random() > 0.7 ? 'market' : Math.random() > 0.5 ? 'limit' : 'stop';

    // Price varies based on order type
    let price = bond.currentPrice;
    if (orderType === 'limit') {
      price = side === 'buy'
        ? price * (0.995 + Math.random() * 0.01) // Buy below market
        : price * (1.0 + Math.random() * 0.01);   // Sell above market
    }

    const quantity = Math.floor(Math.random() * 1000000 + 10000);

    let status: 'filled' | 'partial' | 'cancelled' | 'pending' = 'filled';
    if (orderType === 'limit' && Math.random() > 0.6) status = 'pending';
    else if (Math.random() > 0.9) status = 'partial';
    else if (Math.random() > 0.95) status = 'cancelled';

    orders.push({
      timestamp: orderTime.toISOString(),
      bondId,
      orderId: `ORD-${Date.now()}-${i.toString().padStart(3, '0')}`,
      side,
      orderType,
      price: Number(price.toFixed(3)),
      quantity,
      status,
      trader: traderTypes[Math.floor(Math.random() * traderTypes.length)],
      executionVenue: venues[Math.floor(Math.random() * venues.length)],
    });
  }

  return orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate market impact analysis
export const generateMarketImpactAnalysis = (bondId: string): {
  bondId: string;
  liquidityMetrics: {
    averageDailyVolume: number;
    bidAskSpread: number;
    marketDepth: number;
    priceImpactCoefficient: number;
  };
  impactProjections: Array<{
    orderSize: number;
    temporaryImpact: number;
    permanentImpact: number;
    totalCost: number;
  }>;
} => {
  const bond = mockBonds.find(b => b.id === bondId);
  if (!bond) throw new Error('Bond not found');

  const averageDailyVolume = bond.tradingVolume24h;
  const bidAskSpread = bond.askPrice - bond.bidPrice;

  // Market depth calculation based on bond characteristics
  const marketDepth = bond.isTokenized
    ? averageDailyVolume * 0.15  // Tokenized bonds have better depth
    : averageDailyVolume * 0.08; // Traditional bonds

  // Price impact coefficient (higher for less liquid bonds)
  let impactCoeff = 0.5;
  if (bond.rating.startsWith('AAA')) impactCoeff = 0.2;
  else if (bond.rating.startsWith('AA')) impactCoeff = 0.3;
  else if (bond.rating.startsWith('A')) impactCoeff = 0.5;
  else if (bond.rating.startsWith('BBB')) impactCoeff = 0.8;
  else impactCoeff = 1.5;

  const orderSizes = [100000, 500000, 1000000, 5000000, 10000000, 25000000];

  const impactProjections = orderSizes.map(size => {
    const participationRate = size / averageDailyVolume;

    // Temporary impact (mean-reverting)
    const temporaryImpact = impactCoeff * Math.pow(participationRate, 0.6) * bidAskSpread;

    // Permanent impact (information content)
    const permanentImpact = impactCoeff * 0.3 * Math.pow(participationRate, 0.8) * bidAskSpread;

    const totalCost = temporaryImpact + permanentImpact + (bidAskSpread / 2);

    return {
      orderSize: size,
      temporaryImpact: Number(temporaryImpact.toFixed(4)),
      permanentImpact: Number(permanentImpact.toFixed(4)),
      totalCost: Number(totalCost.toFixed(4)),
    };
  });

  return {
    bondId,
    liquidityMetrics: {
      averageDailyVolume,
      bidAskSpread: Number(bidAskSpread.toFixed(3)),
      marketDepth: Math.floor(marketDepth),
      priceImpactCoefficient: Number(impactCoeff.toFixed(2)),
    },
    impactProjections,
  };
};

// Export all mock data
export const mockData = {
  bonds: mockBonds,
  yieldCurve: generateYieldCurveData(),
  corporateYieldCurve: generateCorporateYieldCurve(),
  get portfolio() { return getMockPortfolio(); },
  scenarios: mockScenarioAnalysis,
  generatePriceHistory,
  generateMarketDepth,
  generateTradingVolumeData,
  generateMarketSentimentData,
  generateComplianceMetrics,
  generateIntradayData,
  generateLiveOrderFlow,
  generateMarketImpactAnalysis,
};