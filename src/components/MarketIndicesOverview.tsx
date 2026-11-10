import React from 'react';
import { MarketIndex } from '../types/market';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketIndicesOverviewProps {
  indices: MarketIndex[];
  onSelectIndex: (symbol: string) => void;
}

export const MarketIndicesOverview: React.FC<MarketIndicesOverviewProps> = ({
  indices,
  onSelectIndex,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Index Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {indices.slice(0, 4).map((idx) => {
          const isPositive = idx.changePercent >= 0;
          const min = Math.min(...idx.sparkline);
          const max = Math.max(...idx.sparkline);
          const range = max - min || 1;

          // Generate SVG Path
          const svgWidth = 140;
          const svgHeight = 44;
          const points = idx.sparkline.map((val, i) => {
            const x = (i / (idx.sparkline.length - 1)) * svgWidth;
            const y = svgHeight - 4 - ((val - min) / range) * (svgHeight - 10);
            return { x, y };
          });

          const pathD = points.reduce(
            (acc, curr, i) => (i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
            ''
          );
          const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

          // Day range calculation percentage
          const dayRange = idx.high - idx.low || 1;
          const currentPosPercent = Math.min(100, Math.max(0, ((idx.price - idx.low) / dayRange) * 100));

          return (
            <div
              key={idx.symbol}
              onClick={() => onSelectIndex(idx.symbol)}
              className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] hover:border-[#2962ff]/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors">
                      {idx.shortName}
                    </span>
                    <span className="text-[11px] font-mono text-[#787b86]">
                      {idx.symbol}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {idx.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-mono font-semibold ${
                    isPositive
                      ? 'bg-[#089981]/15 text-[#089981]'
                      : 'bg-[#f23645]/15 text-[#f23645]'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPositive ? '+' : ''}{idx.changePercent.toFixed(2)}%</span>
                </div>
              </div>

              {/* Sparkline & Range */}
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[#787b86] font-mono">
                    <span>L: {idx.low.toFixed(1)}</span>
                    <span>H: {idx.high.toFixed(1)}</span>
                  </div>
                  {/* Day range bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#131722] overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                      style={{ width: `${currentPosPercent}%` }}
                    />
                  </div>
                </div>

                {/* SVG Sparkline */}
                <div className="w-[110px] h-[36px] overflow-hidden shrink-0">
                  <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad-${idx.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? '#089981' : '#f23645'} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={isPositive ? '#089981' : '#f23645'} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill={`url(#grad-${idx.symbol})`} />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isPositive ? '#089981' : '#f23645'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Breadth & Sentiment Bar */}
      <div className="p-3.5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="font-semibold text-white whitespace-nowrap">Market Breadth:</span>
          {/* Breadth distribution bar */}
          <div className="flex-1 md:w-56 h-2 rounded-full overflow-hidden flex bg-[#131722]">
            <div className="bg-[#089981] h-full" style={{ width: '62%' }} title="Advances: 62%" />
            <div className="bg-[#787b86] h-full" style={{ width: '5%' }} title="Unchanged: 5%" />
            <div className="bg-[#f23645] h-full" style={{ width: '33%' }} title="Declines: 33%" />
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#787b86]">
            <span className="text-[#089981] font-semibold">2,842 (62%)</span>
            <span>·</span>
            <span className="text-[#f23645] font-semibold">1,514 (33%)</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[#787b86] font-mono text-[11px] w-full md:w-auto justify-between md:justify-end">
          <div>
            <span>Total Volume: </span>
            <span className="text-white font-semibold">$124.6B</span>
          </div>
          <div>
            <span>52W Highs/Lows: </span>
            <span className="text-[#089981] font-semibold">342</span>
            <span> / </span>
            <span className="text-[#f23645] font-semibold">48</span>
          </div>
          <div className="hidden sm:block">
            <span>VIX: </span>
            <span className="text-white font-semibold">14.82 (-2.95%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
