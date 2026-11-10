import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketsSubNav, StockTab } from './components/MarketsSubNav';
import { MarketIndicesOverview } from './components/MarketIndicesOverview';
import { TrendingHotlists } from './components/TrendingHotlists';
import { StockScreenerTable } from './components/StockScreenerTable';
import { StockHeatmap } from './components/StockHeatmap';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { EarningsCalendarView } from './components/EarningsCalendarView';
import { QuickSearchModal } from './components/QuickSearchModal';
import {
  MAJOR_INDICES,
  ALL_STOCKS,
  MARKET_NEWS,
  UPCOMING_EARNINGS,
} from './data/mockMarketData';
import { StockQuote, MarketIndex } from './types/market';
import { Activity, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<StockTab>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('US');
  const [watchlist, setWatchlist] = useState<string[]>(['NVDA', 'AAPL', 'TSLA', 'PLTR', 'MSFT']);
  const [watchlistOpen, setWatchlistOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [selectedStockForChart, setSelectedStockForChart] = useState<StockQuote | null>(null);
  const [stocks, setStocks] = useState<StockQuote[]>(ALL_STOCKS);
  const [indices, setIndices] = useState<MarketIndex[]>(MAJOR_INDICES);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Sync dark class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate realistic live market price ticks every 3.5 seconds
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        // Pick 1-2 random stocks to fluctuate slightly
        const targetIdx = Math.floor(Math.random() * prevStocks.length);
        const updated = [...prevStocks];
        const stock = updated[targetIdx];
        const deltaPct = (Math.random() - 0.49) * 0.4; // slight ±0.2% fluctuation
        const newPrice = Number((stock.price * (1 + deltaPct / 100)).toFixed(2));
        const newChange = Number((stock.change + (newPrice - stock.price)).toFixed(2));
        const newChangePercent = Number(
          (((newPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
        );

        const newSparkline = [...stock.sparkline.slice(1), newPrice];

        updated[targetIdx] = {
          ...stock,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          sparkline: newSparkline,
        };

        return updated;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Toggle watchlist symbol
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Select stock from symbol
  const handleSelectSymbol = (symbol: string) => {
    const match = stocks.find((s) => s.symbol === symbol);
    if (match) {
      setSelectedStockForChart(match);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#131722] text-[#d1d4dc]' : 'bg-[#f0f3fa] text-[#131722]'} flex flex-col transition-colors`}>
      {/* 1. Top Navigation Bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSearch={() => setSearchModalOpen(true)}
        watchlistCount={watchlist.length}
        onToggleWatchlist={() => setWatchlistOpen(!watchlistOpen)}
        watchlistOpen={watchlistOpen}
      />

      {/* 2. Top Ticker Tape Ribbon */}
      <TickerTape
        indices={indices}
        featuredStocks={stocks}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* 3. Markets Sub-Navigation & Sub-Views Tabs */}
      <MarketsSubNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
      />

      {/* 4. Main Viewport Content */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* VIEW: OVERVIEW */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Market Indices & Breadth */}
            <MarketIndicesOverview
              indices={indices}
              onSelectIndex={handleSelectSymbol}
            />

            {/* Trending Hotlists (Most Active, Gainers, Losers, Mega-Cap) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Market Movers & Leaders
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
                  <span className="text-xs text-[#787b86] font-mono">Live Quotes</span>
                </div>
              </div>
              <TrendingHotlists
                stocks={stocks}
                onSelectStock={(stock) => setSelectedStockForChart(stock)}
              />
            </div>

            {/* Primary Stock Screener Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  US Stock Screener & Quotes
                </h2>
                <button
                  onClick={() => setCurrentTab('heatmap')}
                  className="text-xs text-[#2962ff] hover:underline font-semibold flex items-center gap-1"
                >
                  View as S&P 500 Heatmap →
                </button>
              </div>
              <StockScreenerTable
                stocks={stocks}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectStock={(stock) => setSelectedStockForChart(stock)}
              />
            </div>
          </div>
        )}

        {/* VIEW: MOST ACTIVE */}
        {currentTab === 'most-active' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
              <h2 className="text-lg font-bold text-white">Most Active Stocks by Trading Volume</h2>
              <p className="text-xs text-[#787b86]">
                Companies with the highest aggregate share volume and institutional liquidity in today's regular session.
              </p>
            </div>
            <StockScreenerTable
              stocks={[...stocks].sort((a, b) => b.volume - a.volume)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectStock={(stock) => setSelectedStockForChart(stock)}
            />
          </div>
        )}

        {/* VIEW: TOP GAINERS */}
        {currentTab === 'gainers' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
              <h2 className="text-lg font-bold text-white">Top Gaining Stocks</h2>
              <p className="text-xs text-[#787b86]">
                Stocks experiencing the greatest positive percentage price momentum across US exchanges today.
              </p>
            </div>
            <StockScreenerTable
              stocks={[...stocks].sort((a, b) => b.changePercent - a.changePercent)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectStock={(stock) => setSelectedStockForChart(stock)}
            />
          </div>
        )}

        {/* VIEW: TOP LOSERS */}
        {currentTab === 'losers' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
              <h2 className="text-lg font-bold text-white">Top Losing Stocks</h2>
              <p className="text-xs text-[#787b86]">
                Stocks under distribution or profit taking with the largest negative percentage price movement today.
              </p>
            </div>
            <StockScreenerTable
              stocks={[...stocks].sort((a, b) => a.changePercent - b.changePercent)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectStock={(stock) => setSelectedStockForChart(stock)}
            />
          </div>
        )}

        {/* VIEW: STOCK HEATMAP */}
        {currentTab === 'heatmap' && (
          <StockHeatmap
            stocks={stocks}
            onSelectStock={(stock) => setSelectedStockForChart(stock)}
          />
        )}

        {/* VIEW: EARNINGS CALENDAR */}
        {currentTab === 'earnings' && (
          <EarningsCalendarView
            earnings={UPCOMING_EARNINGS}
            allStocks={stocks}
            onSelectStock={(stock) => setSelectedStockForChart(stock)}
          />
        )}

        {/* VIEW: LARGE CAP */}
        {currentTab === 'large-cap' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
              <h2 className="text-lg font-bold text-white">Mega-Cap & Large-Cap Market Leaders ($100B+)</h2>
              <p className="text-xs text-[#787b86]">
                The enterprise bedrock of the US financial markets sorted by market capitalization.
              </p>
            </div>
            <StockScreenerTable
              stocks={stocks.filter((s) => s.marketCap >= 100)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectStock={(stock) => setSelectedStockForChart(stock)}
            />
          </div>
        )}
      </main>

      {/* 5. Watchlist & Alerts Right Sidebar Drawer */}
      <WatchlistSidebar
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlistSymbols={watchlist}
        allStocks={stocks}
        onToggleWatchlist={handleToggleWatchlist}
        onSelectStock={(stock) => {
          setSelectedStockForChart(stock);
          setWatchlistOpen(false);
        }}
        newsItems={MARKET_NEWS}
      />

      {/* 6. Interactive TradingView Chart Modal */}
      {selectedStockForChart && (
        <InteractiveChartModal
          stock={selectedStockForChart}
          onClose={() => setSelectedStockForChart(null)}
        />
      )}

      {/* 7. Quick ⌘K Spotlight Search Modal */}
      <QuickSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        stocks={stocks}
        indices={indices}
        onSelectStock={(stock) => setSelectedStockForChart(stock)}
      />

      {/* 8. TradingView Global Footer */}
      <footer className="w-full border-t border-[#2a2e39] bg-[#10141e] text-[#787b86] py-8 px-4 lg:px-6 text-xs mt-12">
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#2962ff] flex items-center justify-center text-white font-black text-xs">
              TV
            </div>
            <span className="font-bold text-white">TradingView Markets</span>
            <span>·</span>
            <span>Where the world charts, chats and trades markets</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">Screener</span>
            <span className="hover:text-white transition-colors cursor-pointer">Heatmaps</span>
            <span className="hover:text-white transition-colors cursor-pointer">Economic Calendar</span>
            <span className="hover:text-white transition-colors cursor-pointer">Brokers</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms & Privacy</span>
          </div>
        </div>

        <div className="max-w-[1520px] mx-auto mt-4 pt-4 border-t border-[#2a2e39]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#787b86]/80 font-mono">
          <div>
            Data is provided for informational and financial simulation purposes only. Real-time updates active.
          </div>
          <div>
            © 2026 TradingView Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
