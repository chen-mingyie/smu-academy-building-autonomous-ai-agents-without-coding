import React from 'react';
import { MarketIndex, StockQuote } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  indices: MarketIndex[];
  featuredStocks: StockQuote[];
  onSelectSymbol: (symbol: string) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  indices,
  featuredStocks,
  onSelectSymbol,
}) => {
  // Combine indices and top marquee stocks
  const tickerItems = [
    ...indices.slice(0, 4).map((idx) => ({
      symbol: idx.symbol,
      name: idx.shortName,
      price: idx.price,
      changePercent: idx.changePercent,
      sparkline: idx.sparkline,
      isIndex: true,
    })),
    ...featuredStocks.slice(0, 5).map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      sparkline: stock.sparkline,
      isIndex: false,
    })),
  ];

  return (
    <div className="w-full bg-[#181c27] border-b border-[#2a2e39] py-2 overflow-x-auto select-none no-scrollbar">
      <div className="flex items-center gap-6 px-4 min-w-max">
        {tickerItems.map((item) => {
          const isPositive = item.changePercent >= 0;
          const min = Math.min(...item.sparkline);
          const max = Math.max(...item.sparkline);
          const range = max - min || 1;
          const points = item.sparkline
            .map((val, idx) => {
              const x = (idx / (item.sparkline.length - 1)) * 36;
              const y = 14 - ((val - min) / range) * 12;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className="flex items-center gap-3 px-2 py-0.5 rounded hover:bg-[#202534] transition-colors group text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#d1d4dc] group-hover:text-white transition-colors">
                  {item.symbol}
                </span>
                <span className="text-[11px] text-[#787b86] max-w-[80px] truncate hidden sm:inline">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-semibold text-white">
                  {item.price > 1000
                    ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : item.price.toFixed(2)}
                </span>
                <span
                  className={`flex items-center text-[11px] font-medium ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Mini Sparkline SVG */}
              <svg width="36" height="16" className="overflow-visible opacity-80 group-hover:opacity-100">
                <polyline
                  fill="none"
                  stroke={isPositive ? '#089981' : '#f23645'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};
