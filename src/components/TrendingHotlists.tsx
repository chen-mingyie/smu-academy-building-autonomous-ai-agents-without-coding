import React from 'react';
import { StockQuote } from '../types/market';
import { Flame, TrendingUp, TrendingDown, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TrendingHotlistsProps {
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
}

export const TrendingHotlists: React.FC<TrendingHotlistsProps> = ({
  stocks,
  onSelectStock,
}) => {
  // Sort stocks for each category
  const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const largeCap = [...stocks].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5);

  const lists = [
    {
      title: 'Most Active',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      items: mostActive,
      metricKey: 'vol',
    },
    {
      title: 'Top Gainers',
      icon: <TrendingUp className="w-4 h-4 text-[#089981]" />,
      items: topGainers,
      metricKey: 'change',
    },
    {
      title: 'Top Losers',
      icon: <TrendingDown className="w-4 h-4 text-[#f23645]" />,
      items: topLosers,
      metricKey: 'change',
    },
    {
      title: 'Mega-Cap Leaders',
      icon: <Award className="w-4 h-4 text-[#2962ff]" />,
      items: largeCap,
      metricKey: 'cap',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {lists.map((list) => (
        <div
          key={list.title}
          className="rounded-xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden flex flex-col"
        >
          {/* List Header */}
          <div className="px-4 py-3 border-b border-[#2a2e39] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {list.icon}
              <h3 className="font-bold text-sm text-white">{list.title}</h3>
            </div>
            <span className="text-[11px] font-mono text-[#787b86]">US Market</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#2a2e39]/50 flex-1">
            {list.items.map((stock, rank) => {
              const isPositive = stock.changePercent >= 0;
              const min = Math.min(...stock.sparkline);
              const max = Math.max(...stock.sparkline);
              const range = max - min || 1;
              const points = stock.sparkline
                .map((val, idx) => {
                  const x = (idx / (stock.sparkline.length - 1)) * 36;
                  const y = 14 - ((val - min) / range) * 12;
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-[#202534] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono text-[#787b86] w-3">
                      {rank + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] font-mono">
                          {stock.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-[100px]">
                        {stock.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Sparkline */}
                    <div className="w-[36px] h-[16px] hidden sm:block">
                      <svg width="36" height="16" className="overflow-visible">
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#089981' : '#f23645'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      </svg>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold flex items-center justify-end ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
