import React, { useState, useMemo } from 'react';
import { StockQuote, TechnicalRating } from '../types/market';
import {
  Search,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  BarChart2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface StockScreenerTableProps {
  stocks: StockQuote[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockQuote) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type ViewPreset = 'overview' | 'performance' | 'valuation';

export const StockScreenerTable: React.FC<StockScreenerTableProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedCap, setSelectedCap] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [viewPreset, setViewPreset] = useState<ViewPreset>('overview');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sectors list
  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector));
    return ['all', ...Array.from(set)];
  }, [stocks]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // Query filter
      if (
        searchQuery &&
        !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Sector filter
      if (selectedSector !== 'all' && stock.sector !== selectedSector) {
        return false;
      }

      // Cap filter
      if (selectedCap === 'mega' && stock.marketCap < 200) return false;
      if (selectedCap === 'large' && (stock.marketCap < 50 || stock.marketCap >= 200)) return false;
      if (selectedCap === 'mid' && (stock.marketCap < 10 || stock.marketCap >= 50)) return false;
      if (selectedCap === 'small' && stock.marketCap >= 10) return false;

      // Rating filter
      if (selectedRating !== 'all' && stock.rating !== selectedRating) {
        return false;
      }

      return true;
    });
  }, [stocks, searchQuery, selectedSector, selectedCap, selectedRating]);

  // Sort stocks
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let aVal = a[sortField] ?? 0;
      let bVal = b[sortField] ?? 0;
      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filteredStocks, sortField, sortAsc]);

  // Paginate
  const totalPages = Math.ceil(sortedStocks.length / pageSize) || 1;
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Symbol,Name,Exchange,Sector,Price,Change,Change%,Volume,MarketCap(B),PE,Rating'];
    const rows = sortedStocks.map(
      (s) =>
        `"${s.symbol}","${s.name}","${s.exchange}","${s.sector}",${s.price},${s.change},${s.changePercent}%,${s.volume},${s.marketCap},${s.peRatio || 'N/A'},"${s.rating}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradingview_stocks_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRatingStyle = (rating: TechnicalRating) => {
    switch (rating) {
      case 'Strong Buy':
        return 'bg-[#089981]/20 text-[#089981] border border-[#089981]/40';
      case 'Buy':
        return 'bg-[#22ab94]/20 text-[#22ab94] border border-[#22ab94]/40';
      case 'Neutral':
        return 'bg-[#787b86]/20 text-[#787b86] border border-[#787b86]/40';
      case 'Sell':
        return 'bg-[#f23645]/20 text-[#f23645] border border-[#f23645]/40';
      case 'Strong Sell':
        return 'bg-[#b22833]/25 text-[#b22833] border border-[#b22833]/50';
    }
  };

  return (
    <div className="rounded-xl bg-[#1e222d] border border-[#2a2e39] overflow-hidden">
      {/* Screener Header & Presets Toolbar */}
      <div className="p-4 border-b border-[#2a2e39] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2962ff]" />
              Stock Screener
            </h2>
            <span className="text-xs text-[#787b86] font-mono">
              ({sortedStocks.length} matching)
            </span>
          </div>

          {/* View presets tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39] self-start md:self-auto">
            <button
              onClick={() => setViewPreset('overview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewPreset === 'overview'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewPreset('performance')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewPreset === 'performance'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setViewPreset('valuation')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewPreset === 'valuation'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              Valuation
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by ticker or company..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#131722] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-[#2a2e39] focus:outline-none focus:border-[#2962ff]"
              />
            </div>

            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#131722] text-xs text-[#d1d4dc] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Sectors</option>
              {sectors
                .filter((s) => s !== 'all')
                .map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
            </select>

            {/* Market Cap Dropdown */}
            <select
              value={selectedCap}
              onChange={(e) => {
                setSelectedCap(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#131722] text-xs text-[#d1d4dc] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Market Caps</option>
              <option value="mega">Mega Cap (&gt; $200B)</option>
              <option value="large">Large Cap ($50B - $200B)</option>
              <option value="mid">Mid Cap ($10B - $50B)</option>
              <option value="small">Small Cap (&lt; $10B)</option>
            </select>

            {/* Technical Rating Dropdown */}
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#131722] text-xs text-[#d1d4dc] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="Strong Buy">Strong Buy</option>
              <option value="Buy">Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Export CSV action */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#d1d4dc] hover:text-white bg-[#131722] hover:bg-[#202534] border border-[#2a2e39] rounded-lg transition-colors cursor-pointer"
              title="Download screener data as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#787b86]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screener Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#181c27] text-[#787b86] uppercase font-mono text-[11px] border-b border-[#2a2e39] select-none">
              <th className="py-2.5 px-3 w-10 text-center">★</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Ticker / Company</span>
                  {sortField === 'symbol' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  {sortField === 'price' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Change %</span>
                  {sortField === 'changePercent' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>

              {viewPreset === 'overview' && (
                <>
                  <th className="py-2.5 px-4 text-center">Technical Rating</th>
                  <th
                    onClick={() => handleSort('volume')}
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Volume</span>
                      {sortField === 'volume' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('marketCap')}
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Market Cap</span>
                      {sortField === 'marketCap' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('peRatio')}
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>P/E (TTM)</span>
                      {sortField === 'peRatio' && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-center w-28">Trend (1D)</th>
                </>
              )}

              {viewPreset === 'performance' && (
                <>
                  <th className="py-2.5 px-4 text-right">52W Range</th>
                  <th className="py-2.5 px-4 text-right">Beta</th>
                  <th className="py-2.5 px-4 text-center">Analyst Target</th>
                  <th className="py-2.5 px-4 text-center">Consensus</th>
                </>
              )}

              {viewPreset === 'valuation' && (
                <>
                  <th
                    onClick={() => handleSort('marketCap')}
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-white"
                  >
                    Market Cap
                  </th>
                  <th className="py-2.5 px-4 text-right">EPS (TTM)</th>
                  <th className="py-2.5 px-4 text-right">P/E Ratio</th>
                  <th className="py-2.5 px-4 text-right">Div Yield</th>
                  <th className="py-2.5 px-4 text-left">Sector</th>
                </>
              )}

              <th className="py-2.5 px-4 text-center w-24">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2a2e39]/50">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#787b86]">
                  No stocks match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                const isStarred = watchlist.includes(stock.symbol);

                // Sparkline SVG calculation
                const min = Math.min(...stock.sparkline);
                const max = Math.max(...stock.sparkline);
                const range = max - min || 1;
                const points = stock.sparkline
                  .map((val, idx) => {
                    const x = (idx / (stock.sparkline.length - 1)) * 50;
                    const y = 14 - ((val - min) / range) * 12;
                    return `${x},${y}`;
                  })
                  .join(' ');

                // 52 week range percent
                const wk52Range = stock.week52High - stock.week52Low || 1;
                const wk52Percent = Math.min(100, Math.max(0, ((stock.price - stock.week52Low) / wk52Range) * 100));

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-[#202534] transition-colors group cursor-pointer"
                    onClick={() => onSelectStock(stock)}
                  >
                    {/* Star / Watchlist toggle */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.symbol);
                      }}
                    >
                      <button
                        className="text-[#787b86] hover:text-amber-400 transition-colors p-1"
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isStarred ? 'fill-amber-400 text-amber-400' : 'text-[#787b86]'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Ticker & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                        >
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-mono">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[150px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ${stock.price.toFixed(2)}
                    </td>

                    {/* Change % */}
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          isPositive
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* View: Overview */}
                    {viewPreset === 'overview' && (
                      <>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getRatingStyle(
                              stock.rating
                            )}`}
                          >
                            {stock.rating}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {(stock.volume / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white font-medium">
                          ${stock.marketCap.toFixed(1)}B
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <svg width="50" height="16" className="mx-auto overflow-visible">
                            <polyline
                              fill="none"
                              stroke={isPositive ? '#089981' : '#f23645'}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          </svg>
                        </td>
                      </>
                    )}

                    {/* View: Performance */}
                    {viewPreset === 'performance' && (
                      <>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex justify-between w-28 text-[10px] text-[#787b86]">
                              <span>${stock.week52Low.toFixed(0)}</span>
                              <span>${stock.week52High.toFixed(0)}</span>
                            </div>
                            <div className="w-28 h-1.5 rounded-full bg-[#131722] overflow-hidden">
                              <div
                                className="bg-[#2962ff] h-full rounded-full"
                                style={{ width: `${wk52Percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {stock.beta ? stock.beta.toFixed(2) : '1.00'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#089981] font-semibold">
                          ${stock.analystTarget.average}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getRatingStyle(
                              stock.rating
                            )}`}
                          >
                            {stock.rating}
                          </span>
                        </td>
                      </>
                    )}

                    {/* View: Valuation */}
                    {viewPreset === 'valuation' && (
                      <>
                        <td className="py-3 px-4 text-right font-mono text-white font-medium">
                          ${stock.marketCap.toFixed(1)}B
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {stock.eps ? `$${stock.eps.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#d1d4dc]">
                          {stock.dividendYield ? `${stock.dividendYield}%` : '0.00%'}
                        </td>
                        <td className="py-3 px-4 text-left text-[#787b86]">
                          {stock.sector}
                        </td>
                      </>
                    )}

                    {/* Action button */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectStock(stock)}
                        className="px-2.5 py-1 rounded bg-[#2962ff]/10 hover:bg-[#2962ff] text-[#2962ff] hover:text-white transition-colors font-semibold flex items-center justify-center gap-1 mx-auto"
                        title="Open Interactive Chart Studio"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Chart</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#2a2e39] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#787b86]">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#131722] text-white border border-[#2a2e39] rounded px-2 py-1 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <span className="font-mono">
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedStocks.length)} of {sortedStocks.length}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-[#202534] disabled:opacity-40 disabled:cursor-not-allowed text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded hover:bg-[#202534] disabled:opacity-40 disabled:cursor-not-allowed text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
