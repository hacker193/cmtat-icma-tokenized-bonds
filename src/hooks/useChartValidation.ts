'use client';

import { useCallback, useMemo } from 'react';
import {
  validateChartData,
  ValidationResult,
  ChartValidationError,
  ChartDataError
} from '@/utils/chartValidation';
import {
  Bond,
  YieldCurvePoint,
  PriceHistory,
  PortfolioPosition,
  MarketDepth,
  TradingVolume
} from '@/types/financial';

// Chart-specific validation hooks

export const useYieldCurveValidation = (data: YieldCurvePoint[]) => {
  const validationResult = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        isValid: false,
        data: [],
        errors: [new ChartValidationError('Invalid yield curve data', 'data', data, 'invalid')],
        warnings: []
      };
    }

    return validateChartData.yieldCurve(data);
  }, [data]);

  const isDataValid = validationResult.isValid;
  const sanitizedData = validationResult.data;
  const errors = validationResult.errors;
  const warnings = validationResult.warnings;

  // Additional yield curve specific validations
  const additionalValidations = useMemo(() => {
    const results = {
      hasMinimumPoints: sanitizedData.length >= 3,
      hasProperMaturityRange: false,
      isMonotonicIncreasing: true,
      hasReasonableYields: true,
      maturityGaps: [] as { from: number; to: number; gap: number }[]
    };

    if (sanitizedData.length > 0) {
      // Check maturity range (should span from short to long term)
      const maturities = Array.isArray(sanitizedData) ? sanitizedData.map(p => p?.maturity || 0).sort((a, b) => a - b) : [];
      results.hasProperMaturityRange = maturities[0] <= 1 && maturities[maturities.length - 1] >= 10;

      // Check for monotonic increasing (normal yield curve shape)
      for (let i = 1; i < sanitizedData.length; i++) {
        if (sanitizedData[i].yield < sanitizedData[i - 1].yield) {
          results.isMonotonicIncreasing = false;
          break;
        }
      }

      // Check for reasonable yield values (0% to 20%)
      results.hasReasonableYields = sanitizedData.every(p => p.yield >= 0 && p.yield <= 20);

      // Check for large gaps in maturities
      for (let i = 1; i < maturities.length; i++) {
        const gap = maturities[i] - maturities[i - 1];
        if (gap > 2) { // Gap larger than 2 years
          results.maturityGaps.push({
            from: maturities[i - 1],
            to: maturities[i],
            gap
          });
        }
      }
    }

    return results;
  }, [sanitizedData]);

  return {
    isValid: isDataValid,
    data: sanitizedData,
    errors,
    warnings,
    validations: additionalValidations
  };
};

export const useBondPriceValidation = (data: PriceHistory[]) => {
  const validationResult = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        isValid: false,
        data: [],
        errors: [new ChartValidationError('Invalid price history data', 'data', data, 'invalid')],
        warnings: []
      };
    }

    return validateChartData.priceHistory(data);
  }, [data]);

  const isDataValid = validationResult.isValid;
  const sanitizedData = validationResult.data;
  const errors = validationResult.errors;
  const warnings = validationResult.warnings;

  // Additional price history specific validations
  const additionalValidations = useMemo(() => {
    const results = {
      hasMinimumDataPoints: sanitizedData.length >= 2,
      hasReasonablePriceRange: true,
      hasExtremePriceMovements: false,
      dataGaps: [] as { from: string; to: string; gapHours: number }[],
      priceVolatility: 0
    };

    if (sanitizedData.length > 1) {
      // Check for reasonable price range (bond prices typically 70-130)
      const prices = Array.isArray(sanitizedData) ? sanitizedData.map(p => p?.price || 0) : [];
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      results.hasReasonablePriceRange = minPrice >= 50 && maxPrice <= 150;

      // Check for extreme price movements (>10% in single period)
      for (let i = 1; i < sanitizedData.length; i++) {
        const priceChange = Math.abs(sanitizedData[i].price - sanitizedData[i - 1].price);
        const priceChangePercent = (priceChange / sanitizedData[i - 1].price) * 100;
        if (priceChangePercent > 10) {
          results.hasExtremePriceMovements = true;
          break;
        }
      }

      // Check for data gaps (more than 24 hours)
      for (let i = 1; i < sanitizedData.length; i++) {
        const currentTime = new Date(sanitizedData[i].timestamp).getTime();
        const prevTime = new Date(sanitizedData[i - 1].timestamp).getTime();
        const gapHours = (currentTime - prevTime) / (1000 * 60 * 60);

        if (gapHours > 24) {
          results.dataGaps.push({
            from: sanitizedData[i - 1].timestamp,
            to: sanitizedData[i].timestamp,
            gapHours
          });
        }
      }

      // Calculate price volatility (standard deviation of returns)
      if (prices.length > 1) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
        results.priceVolatility = Math.sqrt(variance) * 100; // Convert to percentage
      }
    }

    return results;
  }, [sanitizedData]);

  return {
    isValid: isDataValid,
    data: sanitizedData,
    errors,
    warnings,
    validations: additionalValidations
  };
};

export const usePortfolioValidation = (data: PortfolioPosition[]) => {
  const validationResult = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        isValid: false,
        data: [],
        errors: [new ChartValidationError('Invalid portfolio data', 'data', data, 'invalid')],
        warnings: []
      };
    }

    return validateChartData.portfolio(data);
  }, [data]);

  const isDataValid = validationResult.isValid;
  const sanitizedData = validationResult.data;
  const errors = validationResult.errors;
  const warnings = validationResult.warnings;

  // Additional portfolio specific validations
  const additionalValidations = useMemo(() => {
    const results = {
      hasMinimumPositions: sanitizedData.length >= 1,
      weightsSum: 0,
      weightsAreBalanced: true,
      hasOverconcentration: false,
      totalValue: 0,
      riskDiversification: {
        sectorConcentration: {} as Record<string, number>,
        ratingConcentration: {} as Record<string, number>,
        countryConcentration: {} as Record<string, number>
      }
    };

    if (sanitizedData.length > 0) {
      // Calculate total weights
      results.weightsSum = sanitizedData.reduce((sum, pos) => sum + pos.weightInPortfolio, 0);
      results.weightsAreBalanced = Math.abs(results.weightsSum - 100) <= 1; // Allow 1% tolerance

      // Calculate total portfolio value
      results.totalValue = sanitizedData.reduce((sum, pos) => sum + pos.currentMarketValue, 0);

      // Check for overconcentration (any single position > 25%)
      results.hasOverconcentration = sanitizedData.some(pos => pos.weightInPortfolio > 25);

      // Analyze diversification
      sanitizedData.forEach(position => {
        const bond = position.bond;
        const weight = position.weightInPortfolio;

        // Sector concentration
        const sector = bond.sector || 'Unknown';
        results.riskDiversification.sectorConcentration[sector] =
          (results.riskDiversification.sectorConcentration[sector] || 0) + weight;

        // Rating concentration
        const rating = bond.rating || 'Unrated';
        results.riskDiversification.ratingConcentration[rating] =
          (results.riskDiversification.ratingConcentration[rating] || 0) + weight;

        // Country concentration
        const country = bond.country || 'Unknown';
        results.riskDiversification.countryConcentration[country] =
          (results.riskDiversification.countryConcentration[country] || 0) + weight;
      });
    }

    return results;
  }, [sanitizedData]);

  return {
    isValid: isDataValid,
    data: sanitizedData,
    errors,
    warnings,
    validations: additionalValidations
  };
};

export const useOrderBookValidation = (data: MarketDepth) => {
  const validationResult = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        data: {
          bondId: '',
          timestamp: new Date().toISOString(),
          bids: [],
          asks: [],
          spread: 0,
          midPrice: 0
        },
        errors: [new ChartValidationError('Invalid market depth data', 'data', data, 'invalid')],
        warnings: []
      };
    }

    return validateChartData.orderBook(data);
  }, [data]);

  const isDataValid = validationResult.isValid;
  const sanitizedData = validationResult.data;
  const errors = validationResult.errors;
  const warnings = validationResult.warnings;

  // Additional order book specific validations
  const additionalValidations = useMemo(() => {
    const results = {
      hasMinimumDepth: false,
      spreadIsReasonable: true,
      pricesAreOrdered: true,
      hasLiquidity: false,
      bidAskBalance: 0,
      totalBidSize: 0,
      totalAskSize: 0
    };

    if (sanitizedData) {
      const { bids, asks, spread } = sanitizedData;

      // Check minimum depth (at least 3 levels each side)
      results.hasMinimumDepth = bids.length >= 3 && asks.length >= 3;

      // Calculate total sizes
      results.totalBidSize = bids.reduce((sum, bid) => sum + bid.quantity, 0);
      results.totalAskSize = asks.reduce((sum, ask) => sum + ask.quantity, 0);

      // Check if there's reasonable liquidity (at least $1M on each side)
      results.hasLiquidity = results.totalBidSize > 1000000 && results.totalAskSize > 1000000;

      // Calculate bid-ask balance
      if (results.totalBidSize + results.totalAskSize > 0) {
        results.bidAskBalance =
          (results.totalBidSize - results.totalAskSize) /
          (results.totalBidSize + results.totalAskSize);
      }

      // Check if spread is reasonable (typically < 1% for liquid bonds)
      if (sanitizedData.midPrice > 0) {
        const spreadPercent = (spread / sanitizedData.midPrice) * 100;
        results.spreadIsReasonable = spreadPercent < 1;
      }

      // Check if prices are properly ordered
      // Bids should be in descending order
      for (let i = 1; i < bids.length; i++) {
        if (bids[i].price > bids[i - 1].price) {
          results.pricesAreOrdered = false;
          break;
        }
      }

      // Asks should be in ascending order
      for (let i = 1; i < asks.length; i++) {
        if (asks[i].price < asks[i - 1].price) {
          results.pricesAreOrdered = false;
          break;
        }
      }
    }

    return results;
  }, [sanitizedData]);

  return {
    isValid: isDataValid,
    data: sanitizedData,
    errors,
    warnings,
    validations: additionalValidations
  };
};

// Generic chart validation hook
export const useChartValidation = <T>(
  data: T,
  validator: (data: T) => ValidationResult<T>,
  additionalValidations?: (sanitizedData: T) => any
) => {
  const validationResult = useMemo(() => {
    try {
      return validator(data);
    } catch (error) {
      return {
        isValid: false,
        data,
        errors: [new ChartValidationError(
          error instanceof Error ? error.message : 'Validation failed',
          'data',
          data,
          'invalid'
        )],
        warnings: []
      };
    }
  }, [data, validator]);

  const additionalResults = useMemo(() => {
    if (additionalValidations && validationResult.isValid) {
      try {
        return additionalValidations(validationResult.data);
      } catch (error) {
        console.warn('Additional validation failed:', error);
        return {};
      }
    }
    return {};
  }, [validationResult.data, validationResult.isValid, additionalValidations]);

  return {
    isValid: validationResult.isValid,
    data: validationResult.data,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
    validations: additionalResults
  };
};

// Validation summary hook for multiple data sources
export const useMultipleValidation = (validationResults: ValidationResult<any>[]) => {
  const summary = useMemo(() => {
    const allErrors = validationResults.flatMap(result => result.errors);
    const allWarnings = validationResults.flatMap(result => result.warnings);
    const isAllValid = validationResults.every(result => result.isValid);

    return {
      isAllValid,
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      errors: allErrors,
      warnings: allWarnings,
      validResults: validationResults.filter(result => result.isValid).length,
      invalidResults: validationResults.filter(result => !result.isValid).length
    };
  }, [validationResults]);

  return summary;
};

export default {
  useYieldCurveValidation,
  useBondPriceValidation,
  usePortfolioValidation,
  useOrderBookValidation,
  useChartValidation,
  useMultipleValidation
};