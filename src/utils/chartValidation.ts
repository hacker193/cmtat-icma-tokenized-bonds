/**
 * Comprehensive data validation utilities for chart components
 * Provides type-safe validation, sanitization, and error handling
 */

import {
  Bond,
  YieldCurvePoint,
  PriceHistory,
  PortfolioPosition,
  RiskMetrics,
  OrderBookEntry,
  MarketDepth,
  TradingVolume
} from '@/types/financial';

// Custom error types for better error handling
export class ChartValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public errorType: 'missing' | 'invalid' | 'out_of_range' | 'format_error'
  ) {
    super(message);
    this.name = 'ChartValidationError';
  }
}

export class ChartDataError extends Error {
  constructor(
    message: string,
    public dataType: string,
    public errors: ChartValidationError[]
  ) {
    super(message);
    this.name = 'ChartDataError';
  }
}

// Generic validation utilities
export const ValidationUtils = {
  /**
   * Check if a value is a valid number and not NaN/Infinity
   */
  isValidNumber(value: any): value is number {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
  },

  /**
   * Check if a value is a valid positive number
   */
  isPositiveNumber(value: any): value is number {
    return this.isValidNumber(value) && value > 0;
  },

  /**
   * Check if a value is a valid non-negative number
   */
  isNonNegativeNumber(value: any): value is number {
    return this.isValidNumber(value) && value >= 0;
  },

  /**
   * Check if a value is within a specific range
   */
  isInRange(value: number, min: number, max: number): boolean {
    return this.isValidNumber(value) && value >= min && value <= max;
  },

  /**
   * Check if a string is a valid ISIN code
   */
  isValidISIN(isin: string): boolean {
    return typeof isin === 'string' && /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin);
  },

  /**
   * Check if a string is a valid date
   */
  isValidDate(dateString: string): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString !== '';
  },

  /**
   * Check if an array has minimum required length
   */
  hasMinLength<T>(array: T[], minLength: number): boolean {
    return Array.isArray(array) && array.length >= minLength;
  },

  /**
   * Sanitize numeric values with fallback
   */
  sanitizeNumber(value: any, fallback: number = 0): number {
    if (this.isValidNumber(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (this.isValidNumber(parsed)) return parsed;
    }
    return fallback;
  },

  /**
   * Sanitize percentage values (0-100 range)
   */
  sanitizePercentage(value: any, fallback: number = 0): number {
    const sanitized = this.sanitizeNumber(value, fallback);
    return Math.max(0, Math.min(100, sanitized));
  },

  /**
   * Sanitize yield values (typically -10% to 20%)
   */
  sanitizeYield(value: any, fallback: number = 0): number {
    const sanitized = this.sanitizeNumber(value, fallback);
    return Math.max(-10, Math.min(20, sanitized));
  }
};

// Data validation interfaces
export interface ChartDataValidation {
  validateBondData(data: Bond[]): ValidationResult<Bond[]>;
  validateYieldCurveData(data: YieldCurvePoint[]): ValidationResult<YieldCurvePoint[]>;
  validatePriceHistoryData(data: PriceHistory[]): ValidationResult<PriceHistory[]>;
  validatePortfolioData(data: PortfolioPosition[]): ValidationResult<PortfolioPosition[]>;
  validateOrderBookData(data: MarketDepth): ValidationResult<MarketDepth>;
  validateTradingVolumeData(data: TradingVolume[]): ValidationResult<TradingVolume[]>;
  sanitizeNumericValue(value: any): number;
  validateRequiredFields(data: any, fields: string[]): boolean;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data: T;
  errors: ChartValidationError[];
  warnings: string[];
}

// Main chart data validator class
export class ChartDataValidator implements ChartDataValidation {

  /**
   * Validate bond data array
   */
  validateBondData(data: Bond[]): ValidationResult<Bond[]> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];
    const sanitizedData: Bond[] = [];

    if (!Array.isArray(data)) {
      errors.push(new ChartValidationError(
        'Bond data must be an array',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: [], errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Bond data array is empty');
      return { isValid: true, data: [], errors, warnings };
    }

    data.forEach((bond, index) => {
      try {
        const sanitizedBond = this.sanitizeBondData(bond, index, errors);
        if (sanitizedBond) {
          sanitizedData.push(sanitizedBond);
        }
      } catch (error) {
        errors.push(new ChartValidationError(
          `Failed to process bond at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          `bond[${index}]`,
          bond,
          'invalid'
        ));
      }
    });

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Validate yield curve data
   */
  validateYieldCurveData(data: YieldCurvePoint[]): ValidationResult<YieldCurvePoint[]> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];
    const sanitizedData: YieldCurvePoint[] = [];

    if (!Array.isArray(data)) {
      errors.push(new ChartValidationError(
        'Yield curve data must be an array',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: [], errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Yield curve data is empty');
      return { isValid: true, data: [], errors, warnings };
    }

    data.forEach((point, index) => {
      const sanitizedPoint: YieldCurvePoint = {
        maturity: ValidationUtils.sanitizeNumber(point.maturity, 1),
        yield: ValidationUtils.sanitizeYield(point.yield, 0),
        date: typeof point.date === 'string' ? point.date : new Date().toISOString(),
        curveType: ['treasury', 'corporate', 'municipal'].includes(point.curveType)
          ? point.curveType
          : 'treasury',
        creditRating: point.creditRating
      };

      // Validation checks
      if (!ValidationUtils.isPositiveNumber(point.maturity)) {
        errors.push(new ChartValidationError(
          `Invalid maturity at index ${index}: ${point.maturity}`,
          `maturity[${index}]`,
          point.maturity,
          'invalid'
        ));
      }

      if (!ValidationUtils.isValidNumber(point.yield)) {
        errors.push(new ChartValidationError(
          `Invalid yield at index ${index}: ${point.yield}`,
          `yield[${index}]`,
          point.yield,
          'invalid'
        ));
      }

      if (!ValidationUtils.isValidDate(point.date)) {
        errors.push(new ChartValidationError(
          `Invalid date at index ${index}: ${point.date}`,
          `date[${index}]`,
          point.date,
          'format_error'
        ));
      }

      sanitizedData.push(sanitizedPoint);
    });

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Validate price history data
   */
  validatePriceHistoryData(data: PriceHistory[]): ValidationResult<PriceHistory[]> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];
    const sanitizedData: PriceHistory[] = [];

    if (!Array.isArray(data)) {
      errors.push(new ChartValidationError(
        'Price history data must be an array',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: [], errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Price history data is empty');
      return { isValid: true, data: [], errors, warnings };
    }

    data.forEach((entry, index) => {
      const sanitizedEntry: PriceHistory = {
        timestamp: typeof entry.timestamp === 'string' ? entry.timestamp : new Date().toISOString(),
        price: ValidationUtils.sanitizeNumber(entry.price, 100),
        volume: ValidationUtils.sanitizeNumber(entry.volume, 0),
        yieldToMaturity: ValidationUtils.sanitizeYield(entry.yieldToMaturity, 0),
        creditSpread: ValidationUtils.sanitizeNumber(entry.creditSpread, 0),
        bondId: typeof entry.bondId === 'string' ? entry.bondId : ''
      };

      // Validation checks
      if (!ValidationUtils.isPositiveNumber(entry.price)) {
        errors.push(new ChartValidationError(
          `Invalid price at index ${index}: ${entry.price}`,
          `price[${index}]`,
          entry.price,
          'invalid'
        ));
      }

      if (!ValidationUtils.isNonNegativeNumber(entry.volume)) {
        errors.push(new ChartValidationError(
          `Invalid volume at index ${index}: ${entry.volume}`,
          `volume[${index}]`,
          entry.volume,
          'invalid'
        ));
      }

      if (!ValidationUtils.isValidDate(entry.timestamp)) {
        errors.push(new ChartValidationError(
          `Invalid timestamp at index ${index}: ${entry.timestamp}`,
          `timestamp[${index}]`,
          entry.timestamp,
          'format_error'
        ));
      }

      sanitizedData.push(sanitizedEntry);
    });

    // Sort by timestamp
    sanitizedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Validate portfolio position data
   */
  validatePortfolioData(data: PortfolioPosition[]): ValidationResult<PortfolioPosition[]> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];
    const sanitizedData: PortfolioPosition[] = [];

    if (!Array.isArray(data)) {
      errors.push(new ChartValidationError(
        'Portfolio data must be an array',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: [], errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Portfolio data is empty');
      return { isValid: true, data: [], errors, warnings };
    }

    let totalWeight = 0;

    data.forEach((position, index) => {
      if (!position.bond) {
        errors.push(new ChartValidationError(
          `Missing bond data at position ${index}`,
          `bond[${index}]`,
          position.bond,
          'missing'
        ));
        return;
      }

      const sanitizedPosition: PortfolioPosition = {
        bondId: typeof position.bondId === 'string' ? position.bondId : '',
        bond: position.bond,
        quantity: ValidationUtils.sanitizeNumber(position.quantity, 0),
        averagePurchasePrice: ValidationUtils.sanitizeNumber(position.averagePurchasePrice, 0),
        currentMarketValue: ValidationUtils.sanitizeNumber(position.currentMarketValue, 0),
        unrealizedPnL: ValidationUtils.sanitizeNumber(position.unrealizedPnL, 0),
        weightInPortfolio: ValidationUtils.sanitizePercentage(position.weightInPortfolio, 0),
        duration: ValidationUtils.sanitizeNumber(position.duration, 0),
        yieldContribution: ValidationUtils.sanitizeYield(position.yieldContribution, 0)
      };

      totalWeight += sanitizedPosition.weightInPortfolio;
      sanitizedData.push(sanitizedPosition);
    });

    // Check if portfolio weights add up to approximately 100%
    if (Math.abs(totalWeight - 100) > 1) {
      warnings.push(`Portfolio weights sum to ${totalWeight.toFixed(2)}%, not 100%`);
    }

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Validate order book data
   */
  validateOrderBookData(data: MarketDepth): ValidationResult<MarketDepth> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push(new ChartValidationError(
        'Market depth data must be an object',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: this.getEmptyMarketDepth(), errors, warnings };
    }

    const sanitizedBids = this.validateOrderBookEntries(data.bids || [], 'bid', errors);
    const sanitizedAsks = this.validateOrderBookEntries(data.asks || [], 'ask', errors);

    const sanitizedData: MarketDepth = {
      bondId: typeof data.bondId === 'string' ? data.bondId : '',
      timestamp: ValidationUtils.isValidDate(data.timestamp) ? data.timestamp : new Date().toISOString(),
      bids: sanitizedBids,
      asks: sanitizedAsks,
      spread: ValidationUtils.sanitizeNumber(data.spread, 0),
      midPrice: ValidationUtils.sanitizeNumber(data.midPrice, 0)
    };

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Validate trading volume data
   */
  validateTradingVolumeData(data: TradingVolume[]): ValidationResult<TradingVolume[]> {
    const errors: ChartValidationError[] = [];
    const warnings: string[] = [];
    const sanitizedData: TradingVolume[] = [];

    if (!Array.isArray(data)) {
      errors.push(new ChartValidationError(
        'Trading volume data must be an array',
        'data',
        data,
        'invalid'
      ));
      return { isValid: false, data: [], errors, warnings };
    }

    data.forEach((volume, index) => {
      const sanitizedVolume: TradingVolume = {
        timestamp: ValidationUtils.isValidDate(volume.timestamp) ? volume.timestamp : new Date().toISOString(),
        bondId: typeof volume.bondId === 'string' ? volume.bondId : '',
        volume: ValidationUtils.sanitizeNumber(volume.volume, 0),
        notional: ValidationUtils.sanitizeNumber(volume.notional, 0),
        numberOfTrades: ValidationUtils.sanitizeNumber(volume.numberOfTrades, 0),
        vwap: ValidationUtils.sanitizeNumber(volume.vwap, 0)
      };

      if (!ValidationUtils.isNonNegativeNumber(volume.volume)) {
        errors.push(new ChartValidationError(
          `Invalid volume at index ${index}: ${volume.volume}`,
          `volume[${index}]`,
          volume.volume,
          'invalid'
        ));
      }

      sanitizedData.push(sanitizedVolume);
    });

    return {
      isValid: errors.length === 0,
      data: sanitizedData,
      errors,
      warnings
    };
  }

  /**
   * Sanitize numeric value with default fallback
   */
  sanitizeNumericValue(value: any): number {
    return ValidationUtils.sanitizeNumber(value, 0);
  }

  /**
   * Validate required fields in data object
   */
  validateRequiredFields(data: any, fields: string[]): boolean {
    if (!data || typeof data !== 'object') return false;

    return fields.every(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  // Private helper methods
  private sanitizeBondData(bond: Bond, index: number, errors: ChartValidationError[]): Bond | null {
    if (!bond || typeof bond !== 'object') {
      errors.push(new ChartValidationError(
        `Invalid bond object at index ${index}`,
        `bond[${index}]`,
        bond,
        'invalid'
      ));
      return null;
    }

    // Required fields validation
    const requiredFields = ['id', 'isin', 'currentPrice', 'yieldToMaturity'];
    const missingFields = requiredFields.filter(field => !this.validateRequiredFields(bond, [field]));

    if (missingFields.length > 0) {
      errors.push(new ChartValidationError(
        `Missing required fields in bond ${index}: ${missingFields.join(', ')}`,
        `bond[${index}]`,
        bond,
        'missing'
      ));
      return null;
    }

    return {
      ...bond,
      currentPrice: ValidationUtils.sanitizeNumber(bond.currentPrice, 100),
      yieldToMaturity: ValidationUtils.sanitizeYield(bond.yieldToMaturity, 0),
      duration: ValidationUtils.sanitizeNumber(bond.duration, 0),
      creditSpread: ValidationUtils.sanitizeNumber(bond.creditSpread, 0),
      tradingVolume24h: ValidationUtils.sanitizeNumber(bond.tradingVolume24h, 0),
      bidPrice: ValidationUtils.sanitizeNumber(bond.bidPrice, bond.currentPrice * 0.99),
      askPrice: ValidationUtils.sanitizeNumber(bond.askPrice, bond.currentPrice * 1.01)
    };
  }

  private validateOrderBookEntries(
    entries: OrderBookEntry[],
    side: 'bid' | 'ask',
    errors: ChartValidationError[]
  ): OrderBookEntry[] {
    if (!Array.isArray(entries)) return [];

    return entries.map((entry, index) => ({
      price: ValidationUtils.sanitizeNumber(entry.price, 100),
      quantity: ValidationUtils.sanitizeNumber(entry.quantity, 0),
      orders: ValidationUtils.sanitizeNumber(entry.orders, 1),
      side
    })).filter(entry => entry.price > 0 && entry.quantity > 0);
  }

  private getEmptyMarketDepth(): MarketDepth {
    return {
      bondId: '',
      timestamp: new Date().toISOString(),
      bids: [],
      asks: [],
      spread: 0,
      midPrice: 0
    };
  }
}

// Singleton instance
export const chartDataValidator = new ChartDataValidator();

// Generic validation function for any chart data with required fields
export const validateChartData = (data: any[], requiredFields: string[]): any[] => {
  if (!Array.isArray(data)) return [];

  return data.filter(item => {
    if (!item || typeof item !== 'object') return false;

    // Check that all required fields exist and are valid
    return requiredFields.every(field => {
      const value = item[field];
      return value != null && !isNaN(Number(value)) && isFinite(Number(value));
    });
  }).map(item => {
    // Sanitize numeric fields
    const sanitized = { ...item };
    requiredFields.forEach(field => {
      if (typeof sanitized[field] === 'number') {
        sanitized[field] = ValidationUtils.sanitizeNumber(sanitized[field]);
      } else {
        sanitized[field] = ValidationUtils.sanitizeNumber(Number(sanitized[field]));
      }
    });
    return sanitized;
  });
};

// Validation helper functions for specific types
export const validateChartDataByType = {
  bonds: (data: Bond[]) => chartDataValidator.validateBondData(data),
  yieldCurve: (data: YieldCurvePoint[]) => chartDataValidator.validateYieldCurveData(data),
  priceHistory: (data: PriceHistory[]) => chartDataValidator.validatePriceHistoryData(data),
  portfolio: (data: PortfolioPosition[]) => chartDataValidator.validatePortfolioData(data),
  orderBook: (data: MarketDepth) => chartDataValidator.validateOrderBookData(data),
  tradingVolume: (data: TradingVolume[]) => chartDataValidator.validateTradingVolumeData(data)
};

// Direct export functions for chart components
// These functions provide safe number handling with fallbacks and constraints

/**
 * Safe number validation and sanitization with optional constraints
 */
export const safeNumber = (
  value: any,
  fallback: number = 0,
  constraints?: { min?: number; max?: number }
): number => {
  let result = ValidationUtils.sanitizeNumber(value, fallback);

  if (constraints) {
    if (constraints.min !== undefined && result < constraints.min) {
      result = constraints.min;
    }
    if (constraints.max !== undefined && result > constraints.max) {
      result = constraints.max;
    }
  }

  return result;
};

/**
 * Safe yield validation with typical bond yield constraints (-10% to 20%)
 */
export const safeYield = (value: any, fallback: number = 0): number => {
  return ValidationUtils.sanitizeYield(value, fallback);
};

/**
 * Safe price validation - ensures positive prices with fallback
 */
export const safePrice = (value: any, fallback: number | null = 100): number | null => {
  if (fallback === null && !ValidationUtils.isValidNumber(value)) {
    return null;
  }

  const result = ValidationUtils.sanitizeNumber(value, fallback || 100);
  return Math.max(0, result); // Prices cannot be negative
};

/**
 * Safe spread calculation between two values (typically in basis points)
 */
export const safeSpread = (value1: any, value2: any, fallback: number = 0): number => {
  const num1 = ValidationUtils.sanitizeNumber(value1, 0);
  const num2 = ValidationUtils.sanitizeNumber(value2, 0);

  if (!ValidationUtils.isValidNumber(num1) || !ValidationUtils.isValidNumber(num2)) {
    return fallback;
  }

  return (num1 - num2) * 100; // Convert to basis points
};

/**
 * Safe percentage formatting with fallback
 */
export const safeFormatPercentage = (
  value: any,
  decimals: number = 2,
  fallback: string = 'N/A'
): string => {
  const num = ValidationUtils.sanitizeNumber(value, null);

  if (num === null || !ValidationUtils.isValidNumber(num)) {
    return fallback;
  }

  return `${num.toFixed(decimals)}%`;
};

/**
 * Safe number formatting with fallback
 */
export const safeFormatNumber = (
  value: any,
  decimals: number = 2,
  fallback: string = 'N/A'
): string => {
  const num = ValidationUtils.sanitizeNumber(value, null);

  if (num === null || !ValidationUtils.isValidNumber(num)) {
    return fallback;
  }

  return num.toFixed(decimals);
};

/**
 * Safe currency formatting with fallback
 */
export const safeFormatCurrency = (
  value: any,
  currency: string = '$',
  decimals: number = 2,
  fallback: string = 'N/A'
): string => {
  const num = ValidationUtils.sanitizeNumber(value, null);

  if (num === null || !ValidationUtils.isValidNumber(num)) {
    return fallback;
  }

  const formattedNumber = Math.abs(num).toFixed(decimals);

  // Handle negative values with proper formatting
  if (currency.startsWith('+') || currency.startsWith('-')) {
    return `${currency}${formattedNumber}`;
  }

  return `${currency}${formattedNumber}`;
};

/**
 * Safe domain calculation for chart axes with padding
 */
export const safeDomain = (
  values: number[],
  padding: number = 0.1,
  fallback: [number, number] = [0, 100]
): [number, number] => {
  if (!Array.isArray(values) || values.length === 0) {
    return fallback;
  }

  const validValues = values.filter(v => ValidationUtils.isValidNumber(v));

  if (validValues.length === 0) {
    return fallback;
  }

  const min = Math.min(...validValues);
  const max = Math.max(...validValues);

  if (min === max) {
    return [min - 1, max + 1];
  }

  const range = max - min;
  const paddingAmount = range * padding;

  return [
    min - paddingAmount,
    max + paddingAmount
  ];
};

/**
 * Safe calculation wrapper that handles mathematical operations with error handling
 */
export const safeCalculation = (
  calculation: () => number,
  fallback: number = 0,
  constraints?: { min?: number; max?: number }
): number => {
  try {
    const result = calculation();

    if (!ValidationUtils.isValidNumber(result)) {
      return fallback;
    }

    let finalResult = result;

    if (constraints) {
      if (constraints.min !== undefined && finalResult < constraints.min) {
        finalResult = constraints.min;
      }
      if (constraints.max !== undefined && finalResult > constraints.max) {
        finalResult = constraints.max;
      }
    }

    return finalResult;
  } catch (error) {
    console.warn('Safe calculation failed:', error);
    return fallback;
  }
};

/**
 * Safe percentage validation (alias for safeFormatPercentage but returns number)
 */
export const safePercentage = (value: any, fallback: number = 0): number => {
  return ValidationUtils.sanitizePercentage(value, fallback);
};

/**
 * Safe volatility validation (typically 0-100% range)
 */
export const safeVolatility = (value: any, fallback: number = 0): number => {
  const sanitized = ValidationUtils.sanitizeNumber(value, fallback);
  return Math.max(0, Math.min(100, sanitized)); // Volatility typically 0-100%
};

/**
 * Safe percentage change validation (can be negative)
 */
export const safePercentageChange = (value: any, fallback: number = 0): number => {
  return ValidationUtils.sanitizeNumber(value, fallback);
};

/**
 * Safe Sharpe ratio validation (typically -3 to 5 range)
 */
export const safeSharpeRatio = (value: any, fallback: number = 0): number => {
  const sanitized = ValidationUtils.sanitizeNumber(value, fallback);
  return Math.max(-5, Math.min(10, sanitized)); // Sharpe ratio reasonable bounds
};

/**
 * Safe volume validation - ensures non-negative volume
 */
export const safeVolume = (value: any, fallback: number = 0): number => {
  const sanitized = ValidationUtils.sanitizeNumber(value, fallback);
  return Math.max(0, sanitized); // Volume cannot be negative
};