import React from 'react';
import { Search, Moon, Sun, Bookmark, TrendingUp, Bell } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSearch: () => void;
  watchlistCount: number;
  onToggleWatchlist: () => void;
  watchlistOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenSearch,
  watchlistCount,
  onToggleWatchlist,
  watchlistOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39] dark:border-[#2a2e39] bg-[#131722] dark:bg-[#131722] text-[#d1d4dc] transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 gap-4">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            {/* TradingView Iconic Geometric Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-black text-base shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14L9 9L13 13L20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 6H20V11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
              TradingView
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#787b86]">
            <span className="text-[#2962ff] font-semibold flex items-center gap-1.5 cursor-pointer">
              Markets
              <span className="w-1.5 h-1.5 rounded-full bg-[#2962ff]"></span>
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Products
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Screeners
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Heatmaps
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Community
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              News
            </span>
          </nav>
        </div>

        {/* Center: Search Trigger (TradingView Omnibar) */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] border border-[#2a2e39] transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-[#787b86] group-hover:text-white transition-colors" />
              <span>Search markets, stocks, crypto (e.g. NVDA, AAPL)...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#131722] text-[10px] font-mono text-[#787b86] border border-[#2a2e39]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Market Status, Theme, Watchlist & User Profile */}
        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-[#787b86] hover:text-white hover:bg-[#1e222d] rounded-lg"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Market Status Live Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
            <span className="text-[#089981] font-medium">US Markets Open</span>
            <span className="text-[#787b86]">·</span>
            <span className="text-[#787b86] font-mono">16:00 EDT</span>
          </div>

          {/* Watchlist Quick Button */}
          <button
            onClick={onToggleWatchlist}
            className={`relative p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              watchlistOpen
                ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/40'
                : 'text-[#d1d4dc] hover:bg-[#1e222d] border-[#2a2e39]'
            }`}
            title="Toggle Watchlist & Alerts Panel"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#2962ff] text-white">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors border border-[#2a2e39]"
            title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#787b86]" />}
          </button>

          {/* User Profile Simulation */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2962ff] to-[#089981] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10 cursor-pointer">
              TV
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
