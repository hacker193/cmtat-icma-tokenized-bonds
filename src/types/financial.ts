// Financial Data Types for Tokenized Fixed Income Platform
export interface Bond {
  id: string;
  name: string;
  isin: string;
  issuer: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY';
  faceValue: number;
  couponRate: number;
  maturityDate: string;
  rating: 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'A-' | 'BBB+' | 'BBB' | 'BBB-' | 'BB+' | 'BB' | 'BB-';
  currentPrice: number;
  yieldToMaturity: number;
  duration: number;
  convexity: number;
  creditSpread: number;
  sector: string;
  country: string;
  isTokenized: boolean;
  tokenAddress?: string;
  tradingVolume24h: number;
  lastTradedPrice: number;
  bidPrice: number;
  askPrice: number;
  marketCap: number;
}

export interface YieldCurvePoint {
  maturity: number; // Years
  yield: number; // Percentage
  date: string;
  curveType: 'treasury' | 'corporate' | 'municipal';
  creditRating?: string;
}

export interface PriceHistory {
  timestamp: string;
  price: number;
  volume: number;
  yieldToMaturity: number;
  creditSpread: number;
  bondId: string;
}

export interface PortfolioPosition {
  bondId: string;
  bond: Bond;
  quantity: number;
  averagePurchasePrice: number;
  currentMarketValue: number;
  unrealizedPnL: number;
  weightInPortfolio: number;
  duration: number;
  yieldContribution: number;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalUnrealizedPnL: number;
  totalReturn: number;
  positions: PortfolioPosition[];
  averageDuration: number;
  averageYield: number;
  averageRating: string;
  riskMetrics: RiskMetrics;
  lastUpdated: string;
}

export interface RiskMetrics {
  var95: number; // Value at Risk 95%
  var99: number; // Value at Risk 99%
  expectedShortfall: number;
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maximumDrawdown: number;
  correlationMatrix?: { [key: string]: number };
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
  side: 'bid' | 'ask';
}

export interface MarketDepth {
  bondId: string;
  timestamp: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  midPrice: number;
}

export interface TradingVolume {
  timestamp: string;
  bondId: string;
  volume: number;
  notional: number;
  numberOfTrades: number;
  vwap: number; // Volume Weighted Average Price
}

export interface MarketSentiment {
  timestamp: string;
  bondId?: string;
  sector?: string;
  overall?: boolean;
  sentimentScore: number; // -1 to 1
  volatilityIndex: number;
  liquidityScore: number;
  newsCount: number;
  socialMediaMentions: number;
}

export interface ComplianceMetric {
  timestamp: string;
  metric: 'concentration' | 'duration' | 'credit_quality' | 'liquidity' | 'regulatory';
  value: number;
  threshold: number;
  status: 'compliant' | 'warning' | 'breach';
  impact: 'low' | 'medium' | 'high';
}

export interface ScenarioAnalysis {
  scenarioName: string;
  description: string;
  parameters: {
    interestRateShock?: number; // basis points
    creditSpreadWidening?: number; // basis points
    liquidityStress?: number; // percentage
    marketVolatility?: number; // percentage
  };
  results: {
    portfolioValue: number;
    valueChange: number;
    valueChangePercent: number;
    riskMetrics: RiskMetrics;
  };
}

export interface DemoPersona {
  id: string;
  name: string;
  role: 'portfolio_manager' | 'risk_analyst' | 'trader' | 'compliance_officer' | 'retail_investor';
  description: string;
  preferredCharts: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  focusAreas: string[];
}

// Chart Configuration Types
export interface ChartTheme {
  colors: {
    primary: string;
    profit: string;
    loss: string;
    warning: string;
    stable: string;
    background: string;
    text: string;
    grid: string;
  };
  fonts: {
    primary: string;
    monospace: string;
  };
}

export interface ChartProps {
  data: any[];
  height?: number;
  width?: number;
  theme?: Partial<ChartTheme>;
  interactive?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  responsive?: boolean;
}