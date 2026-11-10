import React, { useState } from 'react';
import { StockQuote, PriceAlert, NewsItem } from '../types/market';
import {
  X,
  Plus,
  Trash2,
  Bell,
  Newspaper,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  allStocks: StockQuote[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockQuote) => void;
  newsItems: NewsItem[];
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  allStocks,
  onToggleWatchlist,
  onSelectStock,
  newsItems,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts' | 'news'>('watchlist');
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alt-1',
      symbol: 'NVDA',
      targetPrice: 155.0,
      condition: 'ABOVE',
      createdAt: 'Today, 10:15 AM',
      active: true,
    },
    {
      id: 'alt-2',
      symbol: 'TSLA',
      targetPrice: 320.0,
      condition: 'BELOW',
      createdAt: 'Yesterday',
      active: true,
    },
  ]);

  // Alert form state
  const [alertSymbol, setAlertSymbol] = useState('NVDA');
  const [alertTargetPrice, setAlertTargetPrice] = useState(150.0);
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Watchlisted stock objects
  const watchedStocks = allStocks.filter((s) => watchlistSymbols.includes(s.symbol));

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase();
    if (!sym) return;
    const exists = allStocks.some((s) => s.symbol === sym);
    if (exists && !watchlistSymbols.includes(sym)) {
      onToggleWatchlist(sym);
    }
    setNewSymbolInput('');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      symbol: alertSymbol,
      targetPrice: Number(alertTargetPrice),
      condition: alertCondition,
      createdAt: 'Just now',
      active: true,
    };
    setAlerts([newAlert, ...alerts]);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 md:w-96 bg-[#1e222d] border-l border-[#2a2e39] shadow-2xl z-40 flex flex-col transition-transform animate-in slide-in-from-right duration-200">
      {/* Sidebar Header & Tabs */}
      <div className="p-3 border-b border-[#2a2e39] bg-[#181c27] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchedStocks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'alerts'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'news'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#202534] transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Add Symbol Input */}
          <form onSubmit={handleAddSymbol} className="p-3 border-b border-[#2a2e39] flex gap-2">
            <input
              type="text"
              placeholder="Add symbol (e.g. MSFT, PLTR)..."
              value={newSymbolInput}
              onChange={(e) => setNewSymbolInput(e.target.value)}
              className="flex-1 bg-[#131722] text-xs text-white px-3 py-1.5 rounded border border-[#2a2e39] focus:outline-none focus:border-[#2962ff] uppercase placeholder:normal-case font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50">
            {watchedStocks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#787b86] space-y-2">
                <Bookmark className="w-8 h-8 text-[#787b86]/40 mx-auto" />
                <p>Your watchlist is empty.</p>
                <p className="text-[11px]">Click the star icon next to any stock to track it here.</p>
              </div>
            ) : (
              watchedStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock)}
                    className="p-3 flex items-center justify-between hover:bg-[#202534] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                      >
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </div>
                        <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(stock.symbol);
                        }}
                        className="p-1 text-[#787b86] hover:text-[#f23645] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Price Alerts */}
      {activeTab === 'alerts' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-4">
          {/* Create Alert Form */}
          <form
            onSubmit={handleCreateAlert}
            className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] space-y-2.5 text-xs"
          >
            <div className="font-bold text-white flex items-center justify-between">
              <span>Set Price Alert</span>
              {alertSuccess && (
                <span className="text-[10px] text-[#089981] flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Alert Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#787b86] block mb-1">Symbol</label>
                <select
                  value={alertSymbol}
                  onChange={(e) => {
                    setAlertSymbol(e.target.value);
                    const s = allStocks.find((st) => st.symbol === e.target.value);
                    if (s) setAlertTargetPrice(s.price);
                  }}
                  className="w-full bg-[#1e222d] text-white border border-[#2a2e39] rounded px-2 py-1 focus:outline-none"
                >
                  {allStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} (${s.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#787b86] block mb-1">Condition</label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
                  className="w-full bg-[#1e222d] text-white border border-[#2a2e39] rounded px-2 py-1 focus:outline-none"
                >
                  <option value="ABOVE">Rises Above (&ge;)</option>
                  <option value="BELOW">Drops Below (&le;)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#787b86] block mb-1">Target Price ($)</label>
              <input
                type="number"
                step="0.1"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                className="w-full bg-[#1e222d] text-white border border-[#2a2e39] rounded px-2.5 py-1 font-mono focus:outline-none focus:border-[#2962ff]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white font-bold rounded text-xs transition-colors cursor-pointer"
            >
              Create Alert
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <h4 className="text-xs font-bold text-white px-1">Active Alerts ({alerts.length})</h4>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-[#181c27] border border-[#2a2e39] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{alert.symbol}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#131722] text-[#2962ff]">
                      {alert.condition}
                    </span>
                    <span className="font-bold font-mono text-white">
                      ${alert.targetPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#787b86] font-mono mt-0.5">
                    Created {alert.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-1 text-[#787b86] hover:text-[#f23645] transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Real-Time Market News */}
      {activeTab === 'news' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#2a2e39]">
            <span className="text-xs font-bold text-white">Market Headlines</span>
            <span className="text-[10px] text-[#089981] font-mono animate-pulse">● Live Wire</span>
          </div>

          {newsItems.map((news) => (
            <div
              key={news.id}
              className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] hover:border-[#2962ff]/50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#787b86]">
                <span>{news.source}</span>
                <span>{news.timeAgo}</span>
              </div>
              <h5 className="text-xs font-semibold text-white leading-snug hover:text-[#2962ff] transition-colors cursor-pointer">
                {news.title}
              </h5>
              <p className="text-[11px] text-[#787b86] leading-relaxed">
                {news.summary}
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {news.relatedSymbols.map((sym) => (
                  <span
                    key={sym}
                    className="text-[10px] font-mono font-bold text-[#2962ff] bg-[#2962ff]/10 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ${sym}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
