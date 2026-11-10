import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export type StockTab =
  | 'overview'
  | 'most-active'
  | 'gainers'
  | 'losers'
  | 'heatmap'
  | 'earnings'
  | 'large-cap';

interface MarketsSubNavProps {
  currentTab: StockTab;
  onSelectTab: (tab: StockTab) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const MarketsSubNav: React.FC<MarketsSubNavProps> = ({
  currentTab,
  onSelectTab,
  selectedRegion,
  onSelectRegion,
}) => {
  const tabs: { id: StockTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'most-active', label: 'Most Active' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'heatmap', label: 'Stock Heatmap' },
    { id: 'earnings', label: 'Earnings Calendar' },
    { id: 'large-cap', label: 'Large-Cap ($100B+)' },
  ];

  const regions = [
    { id: 'US', label: 'United States', flag: '🇺🇸' },
    { id: 'GLOBAL', label: 'Global All', flag: '🌐' },
    { id: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { id: 'DE', label: 'Germany', flag: '🇩🇪' },
    { id: 'JP', label: 'Japan', flag: '🇯🇵' },
  ];

  return (
    <div className="w-full bg-[#131722] border-b border-[#2a2e39] px-4 lg:px-6">
      {/* Upper Category Selector Bar */}
      <div className="flex items-center justify-between border-b border-[#202534] py-2 text-xs">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-medium">
          <button className="text-[#2962ff] font-bold border-b-2 border-[#2962ff] pb-2 px-1 whitespace-nowrap">
            Stocks
          </button>
          <button className="text-[#787b86] hover:text-[#d1d4dc] transition-colors pb-2 px-1 whitespace-nowrap">
            Crypto
          </button>
          <button className="text-[#787b86] hover:text-[#d1d4dc] transition-colors pb-2 px-1 whitespace-nowrap">
            Forex
          </button>
          <button className="text-[#787b86] hover:text-[#d1d4dc] transition-colors pb-2 px-1 whitespace-nowrap">
            Indices
          </button>
          <button className="text-[#787b86] hover:text-[#d1d4dc] transition-colors pb-2 px-1 whitespace-nowrap">
            Futures
          </button>
          <button className="text-[#787b86] hover:text-[#d1d4dc] transition-colors pb-2 px-1 whitespace-nowrap">
            Bonds
          </button>
        </div>

        {/* Country / Market region picker */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left">
            <select
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-[#1e222d] text-white text-xs border border-[#2a2e39] rounded-md px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:border-[#2962ff] appearance-none"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-[#1e222d] text-white">
                  {reg.flag} {reg.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#787b86] absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs for Stock market views */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'bg-[#1e222d]/60 text-[#787b86] hover:text-white hover:bg-[#1e222d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
