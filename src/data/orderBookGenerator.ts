/**
 * Advanced Order Book Generator
 * Generates realistic order book data with market microstructure patterns
 */

import { demoDataProvider } from './demoDataProvider';

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orderCount: number;
  timestamp: string;
}

export interface OrderBookSnapshot {
  bondId: string;
  timestamp: string;
  sequence: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
  spread: number;
  spreadBps: number;
  totalBidVolume: number;
  totalAskVolume: number;
  marketCapacity: number;
}

export interface OrderBookUpdate {
  bondId: string;
  timestamp: string;
  sequence: number;
  side: 'bid' | 'ask';
  action: 'add' | 'update' | 'remove';
  price: number;
  quantity: number;
  orderId: string;
}

export interface OrderBookMetrics {
  bondId: string;
  timestamp: string;
  spread: number;
  spreadBps: number;
  marketDepth: {
    bps50: number;   // Volume within 50bps of mid
    bps100: number;  // Volume within 100bps of mid
    bps200: number;  // Volume within 200bps of mid
  };
  imbalance: number; // (bid_volume - ask_volume) / (bid_volume + ask_volume)
  pressureIndex: number; // Market pressure indicator
  liquidityScore: number; // Overall liquidity scoring (0-100)
}

class OrderBookGenerator {
  private sequenceNumber = 1;
  private activeOrders = new Map<string, Map<string, OrderBookLevel>>();

  /**
   * Generate a complete order book snapshot
   */
  generateSnapshot(bondId: string, levels: number = 20): OrderBookSnapshot {
    const bond = demoDataProvider.getBondById(bondId);
    if (!bond) throw new Error(`Bond ${bondId} not found`);

    const midPrice = bond.currentPrice;
    const timestamp = new Date().toISOString();

    // Calculate dynamic spread based on bond characteristics
    const baseSpread = this.calculateDynamicSpread(bond);

    // Generate bid levels (below mid)
    const bids = this.generateOrderBookSide('bid', midPrice, baseSpread, levels, bond);

    // Generate ask levels (above mid)
    const asks = this.generateOrderBookSide('ask', midPrice, baseSpread, levels, bond);

    const spread = asks[0].price - bids[0].price;
    const spreadBps = (spread / midPrice) * 10000;

    const totalBidVolume = bids.reduce((sum, level) => sum + level.quantity, 0);
    const totalAskVolume = asks.reduce((sum, level) => sum + level.quantity, 0);

    // Market capacity estimation (volume available within 100bps)
    const marketCapacity = this.calculateMarketCapacity(bids, asks, midPrice);

    return {
      bondId,
      timestamp,
      sequence: this.sequenceNumber++,
      bids,
      asks,
      midPrice,
      spread,
      spreadBps,
      totalBidVolume,
      totalAskVolume,
      marketCapacity,
    };
  }

  /**
   * Generate realistic order book side
   */
  private generateOrderBookSide(
    side: 'bid' | 'ask',
    midPrice: number,
    baseSpread: number,
    levels: number,
    bond: any
  ): OrderBookLevel[] {
    const levels_data: OrderBookLevel[] = [];
    const direction = side === 'bid' ? -1 : 1;
    const startPrice = midPrice + (direction * baseSpread / 2);

    // Liquidity decay parameters
    const liquidityDecayRate = bond.isTokenized ? 0.15 : 0.25; // Tokenized bonds have better depth
    const priceStepMultiplier = bond.rating === 'AAA' ? 0.8 : bond.rating.startsWith('AA') ? 1.0 : 1.3;

    for (let i = 0; i < levels; i++) {
      // Price level calculation with increasing gaps away from mid
      const priceStep = baseSpread * 0.1 * (1 + i * 0.1) * priceStepMultiplier;
      const price = startPrice + (direction * priceStep * i);

      // Distance from midprice affects liquidity
      const distanceFromMid = Math.abs(price - midPrice) / midPrice;

      // Base liquidity depends on bond characteristics
      let baseLiquidity = 100000; // Default
      if (bond.marketCap > 2000000000) baseLiquidity = 500000; // Large cap
      else if (bond.marketCap > 500000000) baseLiquidity = 250000; // Mid cap

      // Tokenized bonds have different liquidity patterns
      if (bond.isTokenized) baseLiquidity *= 1.4;

      // Liquidity decreases exponentially with distance
      const liquidityDecay = Math.exp(-distanceFromMid * 100 * liquidityDecayRate);
      const quantity = Math.floor(baseLiquidity * liquidityDecay * (0.3 + Math.random() * 1.4));

      // Order count estimation
      const avgOrderSize = bond.marketStructure.secondaryMarket.typicalTradeSize;
      const orderCount = Math.max(1, Math.floor(quantity / avgOrderSize) + Math.floor(Math.random() * 3));

      levels_data.push({
        price: Number(price.toFixed(3)),
        quantity: Math.max(quantity, 10000), // Minimum order size
        orderCount,
        timestamp: new Date().toISOString(),
      });
    }

    // Sort properly (bids descending, asks ascending)
    return side === 'bid'
      ? levels_data.sort((a, b) => b.price - a.price)
      : levels_data.sort((a, b) => a.price - b.price);
  }

  /**
   * Calculate dynamic spread based on bond characteristics
   */
  private calculateDynamicSpread(bond: any): number {
    let baseSpread = 0.05; // 5 cents default

    // Rating-based spread
    if (bond.rating === 'AAA') baseSpread = 0.02;
    else if (bond.rating.startsWith('AA')) baseSpread = 0.03;
    else if (bond.rating.startsWith('A')) baseSpread = 0.05;
    else if (bond.rating.startsWith('BBB')) baseSpread = 0.08;
    else if (bond.rating.startsWith('BB')) baseSpread = 0.15;
    else baseSpread = 0.25;

    // Market cap effect
    const marketCapFactor = Math.max(0.5, Math.min(2.0, 1000000000 / bond.marketCap));
    baseSpread *= marketCapFactor;

    // Tokenization benefit
    if (bond.isTokenized) baseSpread *= 0.7;

    // Time of day effect (wider spreads outside normal hours)
    const hour = new Date().getHours();
    if (hour < 9 || hour > 17) baseSpread *= 1.5; // After hours
    else if (hour < 10 || hour > 16) baseSpread *= 1.2; // Market open/close

    // Volatility effect (random component)
    const volatilityMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2x
    baseSpread *= volatilityMultiplier;

    return baseSpread;
  }

  /**
   * Calculate market capacity within price bands
   */
  private calculateMarketCapacity(bids: OrderBookLevel[], asks: OrderBookLevel[], midPrice: number): number {
    const bps100Price = midPrice * 0.01; // 100 basis points

    const bidCapacity = bids
      .filter(level => midPrice - level.price <= bps100Price)
      .reduce((sum, level) => sum + level.quantity, 0);

    const askCapacity = asks
      .filter(level => level.price - midPrice <= bps100Price)
      .reduce((sum, level) => sum + level.quantity, 0);

    return bidCapacity + askCapacity;
  }

  /**
   * Generate streaming order book updates
   */
  generateOrderBookUpdates(bondId: string, count: number = 10): OrderBookUpdate[] {
    const bond = demoDataProvider.getBondById(bondId);
    if (!bond) return [];

    const updates: OrderBookUpdate[] = [];
    const midPrice = bond.currentPrice;
    const spread = this.calculateDynamicSpread(bond);

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() + i * 500).toISOString(); // 500ms apart
      const side = Math.random() > 0.5 ? 'bid' : 'ask';
      const action = Math.random() > 0.7 ? 'remove' : Math.random() > 0.5 ? 'add' : 'update';

      // Price near the spread
      const priceOffset = (Math.random() - 0.5) * spread * 2;
      const price = side === 'bid'
        ? midPrice - spread/2 + priceOffset
        : midPrice + spread/2 + priceOffset;

      const quantity = Math.floor(Math.random() * 500000 + 50000);
      const orderId = `ORD-${Date.now()}-${i.toString().padStart(3, '0')}`;

      updates.push({
        bondId,
        timestamp,
        sequence: this.sequenceNumber++,
        side,
        action,
        price: Number(price.toFixed(3)),
        quantity,
        orderId,
      });
    }

    return updates;
  }

  /**
   * Calculate order book metrics
   */
  calculateOrderBookMetrics(snapshot: OrderBookSnapshot): OrderBookMetrics {
    const { bids, asks, midPrice, spread, spreadBps } = snapshot;

    // Market depth at different price levels
    const marketDepth = {
      bps50: this.calculateDepthAtBps(bids, asks, midPrice, 50),
      bps100: this.calculateDepthAtBps(bids, asks, midPrice, 100),
      bps200: this.calculateDepthAtBps(bids, asks, midPrice, 200),
    };

    // Order book imbalance
    const totalBidVolume = snapshot.totalBidVolume;
    const totalAskVolume = snapshot.totalAskVolume;
    const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);

    // Pressure index (based on volume and price proximity)
    const topBidPressure = bids[0].quantity / (midPrice - bids[0].price);
    const topAskPressure = asks[0].quantity / (asks[0].price - midPrice);
    const pressureIndex = (topBidPressure - topAskPressure) / (topBidPressure + topAskPressure);

    // Liquidity score (0-100)
    const baseScore = 100;
    const spreadPenalty = Math.min(30, spreadBps * 0.1); // Penalize wide spreads
    const depthBonus = Math.min(20, marketDepth.bps100 / 1000000); // Reward deep markets
    const liquidityScore = Math.max(0, baseScore - spreadPenalty + depthBonus);

    return {
      bondId: snapshot.bondId,
      timestamp: snapshot.timestamp,
      spread,
      spreadBps,
      marketDepth,
      imbalance: Number(imbalance.toFixed(4)),
      pressureIndex: Number(pressureIndex.toFixed(4)),
      liquidityScore: Number(liquidityScore.toFixed(1)),
    };
  }

  /**
   * Calculate market depth at specific basis points
   */
  private calculateDepthAtBps(bids: OrderBookLevel[], asks: OrderBookLevel[], midPrice: number, bps: number): number {
    const threshold = midPrice * (bps / 10000);

    const bidDepth = bids
      .filter(level => midPrice - level.price <= threshold)
      .reduce((sum, level) => sum + level.quantity, 0);

    const askDepth = asks
      .filter(level => level.price - midPrice <= threshold)
      .reduce((sum, level) => sum + level.quantity, 0);

    return bidDepth + askDepth;
  }

  /**
   * Generate historical order book snapshots
   */
  generateHistoricalSnapshots(bondId: string, intervalMinutes: number = 15, hours: number = 8): OrderBookSnapshot[] {
    const snapshots: OrderBookSnapshot[] = [];
    const totalIntervals = Math.floor(hours * 60 / intervalMinutes);

    for (let i = 0; i < totalIntervals; i++) {
      const snapshot = this.generateSnapshot(bondId, 15);

      // Adjust timestamp for historical data
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - (totalIntervals - i) * intervalMinutes);
      snapshot.timestamp = timestamp.toISOString();

      snapshots.push(snapshot);
    }

    return snapshots;
  }
}

// Export the order book generator instance
export const orderBookGenerator = new OrderBookGenerator();

// Convenience functions for common use cases
export const generateOrderBookData = {
  snapshot: (bondId: string, levels?: number) => orderBookGenerator.generateSnapshot(bondId, levels),
  updates: (bondId: string, count?: number) => orderBookGenerator.generateOrderBookUpdates(bondId, count),
  metrics: (snapshot: OrderBookSnapshot) => orderBookGenerator.calculateOrderBookMetrics(snapshot),
  historical: (bondId: string, intervalMinutes?: number, hours?: number) =>
    orderBookGenerator.generateHistoricalSnapshots(bondId, intervalMinutes, hours),

  // Generate full order book demo data for all tokenized bonds
  generateDemoData: () => {
    const tokenizedBonds = demoDataProvider.getTokenizedBonds();
    const demoData: Record<string, {
      snapshot: OrderBookSnapshot;
      metrics: OrderBookMetrics;
      updates: OrderBookUpdate[];
      historical: OrderBookSnapshot[];
    }> = {};

    tokenizedBonds.forEach(bond => {
      const snapshot = orderBookGenerator.generateSnapshot(bond.id, 20);
      const metrics = orderBookGenerator.calculateOrderBookMetrics(snapshot);
      const updates = orderBookGenerator.generateOrderBookUpdates(bond.id, 15);
      const historical = orderBookGenerator.generateHistoricalSnapshots(bond.id, 15, 6);

      demoData[bond.id] = {
        snapshot,
        metrics,
        updates,
        historical,
      };
    });

    return demoData;
  },
};

export default generateOrderBookData;