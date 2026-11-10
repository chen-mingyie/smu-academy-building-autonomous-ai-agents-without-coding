import React from 'react';
import { EarningsRelease, StockQuote } from '../types/market';
import { Calendar, Clock, BarChart2, TrendingUp } from 'lucide-react';

interface EarningsCalendarViewProps {
  earnings: EarningsRelease[];
  allStocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
}

export const EarningsCalendarView: React.FC<EarningsCalendarViewProps> = ({
  earnings,
  allStocks,
  onSelectStock,
}) => {
  return (
    <div className="rounded-xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
      <div className="p-4 border-b border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2962ff]" />
            Upcoming Earnings Calendar
          </h2>
          <p className="text-xs text-[#787b86]">
            Key corporate quarterly earnings reports scheduled for this reporting week
          </p>
        </div>
        <span className="text-xs text-[#089981] font-mono bg-[#089981]/15 px-2.5 py-1 rounded-md self-start sm:self-auto font-semibold">
          Q3 / Q4 Reporting Season
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#181c27] text-[#787b86] uppercase font-mono text-[11px] border-b border-[#2a2e39]">
              <th className="py-2.5 px-4">Company / Symbol</th>
              <th className="py-2.5 px-4">Release Date</th>
              <th className="py-2.5 px-4">Timing</th>
              <th className="py-2.5 px-4 text-right">EPS Consensus Est.</th>
              <th className="py-2.5 px-4 text-right">Prior Year EPS</th>
              <th className="py-2.5 px-4 text-right">Est. Revenue</th>
              <th className="py-2.5 px-4 text-right">Market Cap</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50">
            {earnings.map((item) => {
              const matchedStock = allStocks.find((s) => s.symbol === item.symbol);
              return (
                <tr
                  key={item.symbol}
                  className="hover:bg-[#202534] transition-colors cursor-pointer group"
                  onClick={() => matchedStock && onSelectStock(matchedStock)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {matchedStock && (
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: matchedStock.logoBg,
                            color: matchedStock.logoColor,
                          }}
                        >
                          {matchedStock.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                          {item.symbol}
                        </div>
                        <div className="text-[11px] text-[#787b86]">{item.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-white">{item.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        item.timing === 'Before Open'
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                          : 'bg-[#2962ff]/15 text-[#2962ff]'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {item.timing}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ${item.epsEstimate.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#787b86]">
                    {item.priorEps !== undefined ? `$${item.priorEps.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                    {item.revenueEstimate}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white font-medium">
                    ${item.marketCap.toFixed(1)}B
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (matchedStock) onSelectStock(matchedStock);
                      }}
                      className="px-2.5 py-1 rounded bg-[#2962ff]/10 hover:bg-[#2962ff] text-[#2962ff] hover:text-white transition-colors font-semibold flex items-center justify-center gap-1 mx-auto text-xs"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Chart</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
