import React, { useState } from 'react';
import { StockQuote } from '../types/market';
import { Grid, Layers, ExternalLink, Info } from 'lucide-react';

interface StockHeatmapProps {
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
}

export const StockHeatmap: React.FC<StockHeatmapProps> = ({ stocks, onSelectStock }) => {
  const [hoveredStock, setHoveredStock] = useState<StockQuote | null>(null);

  // Group stocks by sector
  const sectors = React.useMemo(() => {
    const groups: { [key: string]: StockQuote[] } = {};
    stocks.forEach((s) => {
      if (!groups[s.sector]) groups[s.sector] = [];
      groups[s.sector].push(s);
    });

    // Sort stocks inside each sector by market cap
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.marketCap - a.marketCap);
    });

    // Return sectors sorted by total market cap
    return Object.entries(groups).sort((a, b) => {
      const capA = a[1].reduce((sum, s) => sum + s.marketCap, 0);
      const capB = b[1].reduce((sum, s) => sum + s.marketCap, 0);
      return capB - capA;
    });
  }, [stocks]);

  // Color mapper based on changePercent
  const getTileColor = (pct: number) => {
    if (pct >= 4.0) return 'bg-[#089981] hover:bg-[#0aa88f] text-white';
    if (pct >= 2.0) return 'bg-[#10705a] hover:bg-[#158169] text-white';
    if (pct > 0.0) return 'bg-[#184e44] hover:bg-[#205e52] text-white';
    if (pct === 0.0) return 'bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc]';
    if (pct > -2.0) return 'bg-[#612830] hover:bg-[#72303a] text-white';
    if (pct > -4.0) return 'bg-[#8d2731] hover:bg-[#a12d38] text-white';
    return 'bg-[#f23645] hover:bg-[#f34a58] text-white';
  };

  return (
    <div className="rounded-xl bg-[#1e222d] border border-[#2a2e39] p-4 space-y-4">
      {/* Heatmap Controls & Legend Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2a2e39] pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#2962ff]" />
            S&P 500 Market Heatmap
          </h2>
          <p className="text-xs text-[#787b86]">
            Tiles sized by Market Capitalization and colored by 1-Day performance
          </p>
        </div>

        {/* Legend Scale */}
        <div className="flex items-center gap-1.5 self-start md:self-auto text-[10px] font-mono text-[#787b86]">
          <span>-3%+</span>
          <div className="flex items-center rounded overflow-hidden h-3 border border-[#2a2e39]">
            <span className="w-5 h-full bg-[#f23645]" title="&le; -3%" />
            <span className="w-5 h-full bg-[#8d2731]" title="-2% to -3%" />
            <span className="w-5 h-full bg-[#612830]" title="0% to -2%" />
            <span className="w-5 h-full bg-[#2a2e39]" title="0%" />
            <span className="w-5 h-full bg-[#184e44]" title="0% to +2%" />
            <span className="w-5 h-full bg-[#10705a]" title="+2% to +4%" />
            <span className="w-5 h-full bg-[#089981]" title="&ge; +4%" />
          </div>
          <span>+3%+</span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative min-h-[500px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
        {sectors.map(([sectorName, sectorStocks]) => {
          const totalSectorCap = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);

          return (
            <div
              key={sectorName}
              className="flex flex-col rounded-md border border-[#2a2e39] bg-[#181c27] overflow-hidden p-2"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2e39]/50 mb-2">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">
                  {sectorName}
                </span>
                <span className="text-[10px] font-mono text-[#787b86]">
                  ${totalSectorCap.toFixed(0)}B
                </span>
              </div>

              {/* Sector Stocks Nested Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 flex-1 auto-rows-fr">
                {sectorStocks.map((stock) => {
                  const isPositive = stock.changePercent >= 0;
                  const isLarge = stock.marketCap > 1000;

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`relative p-2 rounded cursor-pointer transition-transform hover:scale-[1.03] hover:z-10 shadow-sm flex flex-col justify-between ${
                        isLarge ? 'col-span-2 row-span-2' : 'col-span-1'
                      } ${getTileColor(stock.changePercent)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold tracking-tight ${isLarge ? 'text-base' : 'text-xs'}`}>
                          {stock.symbol}
                        </span>
                        {isLarge && (
                          <span className="text-[10px] opacity-80 font-mono">
                            ${stock.marketCap.toFixed(0)}B
                          </span>
                        )}
                      </div>

                      <div className="mt-1 font-mono">
                        <div className={`font-bold ${isLarge ? 'text-sm' : 'text-xs'}`}>
                          {isPositive ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-[10px] opacity-90 truncate">
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Hover Tooltip / Floating Card */}
        {hoveredStock && (
          <div className="absolute bottom-4 right-4 z-30 p-3 rounded-lg bg-[#1e222d] border border-[#2962ff] shadow-xl text-xs w-64 pointer-events-none backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: hoveredStock.logoBg, color: hoveredStock.logoColor }}
                >
                  {hoveredStock.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-white">{hoveredStock.symbol}</div>
                  <div className="text-[10px] text-[#787b86] truncate max-w-[120px]">
                    {hoveredStock.name}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#131722] text-[#787b86] font-mono">
                {hoveredStock.exchange}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#787b86]">Price:</span>
                <span className="text-white font-bold">${hoveredStock.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787b86]">Day Change:</span>
                <span
                  className={
                    hoveredStock.changePercent >= 0 ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'
                  }
                >
                  {hoveredStock.changePercent >= 0 ? '+' : ''}
                  {hoveredStock.changePercent.toFixed(2)}% (${hoveredStock.change.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787b86]">Market Cap:</span>
                <span className="text-white">${hoveredStock.marketCap.toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787b86]">Volume:</span>
                <span className="text-white">{(hoveredStock.volume / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787b86]">Rating:</span>
                <span className="text-[#2962ff] font-semibold">{hoveredStock.rating}</span>
              </div>
            </div>

            <div className="mt-2 pt-1 border-t border-[#2a2e39] text-[10px] text-[#2962ff] flex items-center justify-center gap-1 font-sans">
              <span>Click tile to open interactive chart</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
