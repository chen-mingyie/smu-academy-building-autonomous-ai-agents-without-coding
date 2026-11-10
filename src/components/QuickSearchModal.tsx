import React, { useState, useEffect, useRef } from 'react';
import { StockQuote, MarketIndex } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockQuote[];
  indices: MarketIndex[];
  onSelectStock: (stock: StockQuote) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  stocks,
  indices,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.sector.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#1e222d] rounded-xl border border-[#2a2e39] shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#2a2e39] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#787b86]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbols, companies, or sectors (e.g. NVDA, Tesla, Tech)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#787b86] focus:outline-none font-medium"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#131722] text-[10px] font-mono text-[#787b86] border border-[#2a2e39]">
            ESC
          </kbd>
          <button onClick={onClose} className="text-[#787b86] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39]/50 p-2">
          {filteredStocks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787b86]">
              No instruments found matching "{query}".
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg flex items-center justify-between hover:bg-[#202534] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] font-mono">
                          {stock.exchange}
                        </span>
                        <span className="text-[10px] text-[#787b86] px-1.5 py-0.2 rounded bg-[#131722]">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-xs">
                        {stock.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-right">
                    <div>
                      <div className="text-xs font-bold text-white">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#787b86] group-hover:text-[#2962ff] transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
