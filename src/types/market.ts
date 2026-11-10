export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
export type ChartType = 'candlestick' | 'line' | 'area';
export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: 'NASDAQ' | 'NYSE' | 'AMEX';
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in billions
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  week52High: number;
  week52Low: number;
  rating: TechnicalRating;
  ratingScore: number; // 1 to 5 (1=Strong Sell, 5=Strong Buy)
  sparkline: number[];
  analystTarget: {
    low: number;
    average: number;
    high: number;
  };
  description: string;
  logoBg: string;
  logoColor: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  sparkline: number[];
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  marketCap: number; // in billions
  leaderSymbol: string;
  leaderChange: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  relatedSymbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface EarningsRelease {
  symbol: string;
  company: string;
  date: string;
  timing: 'Before Open' | 'After Close';
  epsEstimate: number;
  priorEps?: number;
  revenueEstimate: string;
  marketCap: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdAt: string;
  active: boolean;
}

export interface PaperTradePosition {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}
