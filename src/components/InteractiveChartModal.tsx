import React, { useState, useMemo } from 'react';
import { StockQuote, Timeframe, ChartType, CandleData } from '../types/market';
import { generateCandles } from '../data/mockMarketData';
import {
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Layers,
  Activity,
  Check,
  Plus,
  Minus,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface InteractiveChartModalProps {
  stock: StockQuote;
  onClose: () => void;
  onOrderExecuted?: (trade: { symbol: string; type: 'BUY' | 'SELL'; shares: number; price: number }) => void;
}

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  stock,
  onClose,
  onOrderExecuted,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showEMA20, setShowEMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('crosshair');
  const [activeTab, setActiveTab] = useState<'details' | 'trade'>('details');

  // Trade form state
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(10);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Generate candle data
  const candles = useMemo(() => {
    return generateCandles(stock.symbol, stock.price, timeframe);
  }, [stock.symbol, stock.price, timeframe]);

  // Active candle to show in OHLC header
  const currentOHLC = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  // Calculate EMA 20 & SMA 50
  const indicatorSeries = useMemo(() => {
    const closes = candles.map((c) => c.close);

    // SMA 50 (or smaller window if candles count < 50)
    const smaWindow = Math.min(15, Math.floor(candles.length / 3));
    const sma50: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < smaWindow - 1) {
        sma50.push(null);
      } else {
        const sum = closes.slice(i - smaWindow + 1, i + 1).reduce((a, b) => a + b, 0);
        sma50.push(sum / smaWindow);
      }
    }

    // EMA 20
    const emaWindow = Math.min(8, Math.floor(candles.length / 4));
    const k = 2 / (emaWindow + 1);
    const ema20: (number | null)[] = [];
    let prevEMA = closes[0];
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        ema20.push(prevEMA);
      } else {
        const val = closes[i] * k + prevEMA * (1 - k);
        ema20.push(val);
        prevEMA = val;
      }
    }

    // RSI 14
    const rsiWindow = 14;
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        rsi.push(50);
        continue;
      }
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);

      if (i >= rsiWindow) {
        const avgGain = gains / rsiWindow;
        const avgLoss = losses / rsiWindow;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsiVal = 100 - 100 / (1 + rs);
        rsi.push(Math.min(95, Math.max(5, rsiVal)));
        gains *= 0.9;
        losses *= 0.9;
      } else {
        rsi.push(50 + (closes[i] - closes[0]) * 0.5);
      }
    }

    return { sma50, ema20, rsi };
  }, [candles]);

  // Chart Geometry & Bounds
  const chartHeight = showRSI ? 340 : 440;
  const chartWidth = 780;
  const priceMin = Math.min(...candles.map((c) => c.low)) * 0.995;
  const priceMax = Math.max(...candles.map((c) => c.high)) * 1.005;
  const priceRange = priceMax - priceMin || 1;
  const maxVolume = Math.max(...candles.map((c) => c.volume)) || 1;

  // Scales
  const getY = (val: number) => chartHeight - 20 - ((val - priceMin) / priceRange) * (chartHeight - 40);
  const getX = (idx: number) => (idx / (candles.length - 1 || 1)) * (chartWidth - 50) + 10;

  // Handle Trade execution
  const executeTrade = () => {
    const total = shares * stock.price;
    const msg = `Successfully executed ${orderType} order for ${shares} shares of ${stock.symbol} @ $${stock.price.toFixed(2)} (Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    setOrderToast(msg);
    if (onOrderExecuted) {
      onOrderExecuted({
        symbol: stock.symbol,
        type: orderType,
        shares,
        price: stock.price,
      });
    }
    setTimeout(() => {
      setOrderToast(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-7xl h-[92vh] max-h-[900px] bg-[#131722] rounded-xl border border-[#2a2e39] shadow-2xl flex flex-col overflow-hidden text-[#d1d4dc]">
        {/* Top Header Bar */}
        <div className="px-4 py-2.5 bg-[#1e222d] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3">
          {/* Symbol & Price Summary */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
            >
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">{stock.symbol}</span>
                <span className="text-xs text-[#787b86] font-medium hidden sm:inline">
                  {stock.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#131722] text-[#787b86] font-mono">
                  {stock.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-base font-bold text-white">${stock.price.toFixed(2)}</span>
                <span
                  className={`font-semibold ${
                    stock.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* OHLC Bar (TradingView dynamic readout) */}
          {currentOHLC && (
            <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-[#787b86] bg-[#131722] px-3 py-1.5 rounded-lg border border-[#2a2e39]">
              <div>
                <span>O: </span>
                <span className="text-white font-semibold">${currentOHLC.open.toFixed(2)}</span>
              </div>
              <div>
                <span>H: </span>
                <span className="text-[#089981] font-semibold">${currentOHLC.high.toFixed(2)}</span>
              </div>
              <div>
                <span>L: </span>
                <span className="text-[#f23645] font-semibold">${currentOHLC.low.toFixed(2)}</span>
              </div>
              <div>
                <span>C: </span>
                <span className="text-white font-semibold">${currentOHLC.close.toFixed(2)}</span>
              </div>
              <div>
                <span>Vol: </span>
                <span className="text-white">{(currentOHLC.volume / 1000).toFixed(0)}K</span>
              </div>
            </div>
          )}

          {/* Window controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
              title="Close Chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart Toolbar (Timeframes, Chart Type & Indicators) */}
        <div className="px-4 py-2 bg-[#181c27] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Timeframes */}
          <div className="flex items-center gap-1">
            {(['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white font-bold'
                    : 'text-[#787b86] hover:text-white hover:bg-[#202534]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type & Indicator Toggles */}
          <div className="flex items-center gap-2">
            {/* Chart type segmented control */}
            <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2a2e39]">
              <button
                onClick={() => setChartType('candlestick')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  chartType === 'candlestick' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  chartType === 'area' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  chartType === 'line' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                }`}
              >
                Line
              </button>
            </div>

            {/* Indicator toggles */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <button
                onClick={() => setShowEMA20(!showEMA20)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showEMA20
                    ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
                    : 'text-[#787b86] border-[#2a2e39] opacity-60'
                }`}
              >
                EMA 20
              </button>
              <button
                onClick={() => setShowSMA50(!showSMA50)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showSMA50
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
                    : 'text-[#787b86] border-[#2a2e39] opacity-60'
                }`}
              >
                SMA 50
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showVolume
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'text-[#787b86] border-[#2a2e39] opacity-60'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showRSI
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'text-[#787b86] border-[#2a2e39] opacity-60'
                }`}
              >
                RSI 14
              </button>
            </div>
          </div>
        </div>

        {/* Main Body: Left Toolbar + Chart Area + Right Info Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Drawing Tools Bar */}
          <div className="w-11 bg-[#181c27] border-r border-[#2a2e39] flex flex-col items-center py-3 gap-2 shrink-0">
            {[
              { id: 'crosshair', icon: '+' },
              { id: 'trendline', icon: '╱' },
              { id: 'horiz', icon: '—' },
              { id: 'fib', icon: '≡' },
              { id: 'text', icon: 'T' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'text-[#787b86] hover:text-white hover:bg-[#202534]'
                }`}
                title={`Tool: ${tool.id}`}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Central Chart Viewport */}
          <div className="flex-1 relative flex flex-col overflow-hidden bg-[#131722] select-none">
            {/* Notification Toast for simulated orders */}
            {orderToast && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#089981] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-in slide-in-from-top-4">
                <Check className="w-4 h-4" />
                <span>{orderToast}</span>
              </div>
            )}

            {/* SVG Chart */}
            <div className="flex-1 w-full h-full p-2 relative flex flex-col justify-between">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="overflow-visible"
                onMouseLeave={() => setHoveredCandle(null)}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2962ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Price Grid Lines & Axis Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const pVal = priceMin + pct * priceRange;
                  const yPos = getY(pVal);
                  return (
                    <g key={i}>
                      <line
                        x1="10"
                        y1={yPos}
                        x2={chartWidth - 50}
                        y2={yPos}
                        stroke="#2a2e39"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={chartWidth - 45}
                        y={yPos + 4}
                        fill="#787b86"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        ${pVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Volume Histogram (Base of chart) */}
                {showVolume &&
                  candles.map((candle, idx) => {
                    const x = getX(idx);
                    const volHeight = (candle.volume / maxVolume) * 55;
                    const isUp = candle.close >= candle.open;
                    return (
                      <rect
                        key={`vol-${idx}`}
                        x={x - 2.5}
                        y={chartHeight - 20 - volHeight}
                        width="5"
                        height={volHeight}
                        fill={isUp ? '#089981' : '#f23645'}
                        opacity="0.3"
                      />
                    );
                  })}

                {/* AREA or LINE chart rendering */}
                {chartType === 'area' && (
                  <>
                    <path
                      d={
                        candles.reduce(
                          (acc, c, i) =>
                            i === 0 ? `M ${getX(i)} ${getY(c.close)}` : `${acc} L ${getX(i)} ${getY(c.close)}`,
                          ''
                        ) + ` L ${getX(candles.length - 1)} ${chartHeight - 20} L ${getX(0)} ${chartHeight - 20} Z`
                      }
                      fill="url(#areaGradient)"
                    />
                    <path
                      d={candles.reduce(
                        (acc, c, i) =>
                          i === 0 ? `M ${getX(i)} ${getY(c.close)}` : `${acc} L ${getX(i)} ${getY(c.close)}`,
                        ''
                      )}
                      fill="none"
                      stroke="#2962ff"
                      strokeWidth="2"
                    />
                  </>
                )}

                {chartType === 'line' && (
                  <path
                    d={candles.reduce(
                      (acc, c, i) =>
                        i === 0 ? `M ${getX(i)} ${getY(c.close)}` : `${acc} L ${getX(i)} ${getY(c.close)}`,
                      ''
                    )}
                    fill="none"
                    stroke="#2962ff"
                    strokeWidth="2"
                  />
                )}

                {/* CANDLESTICK chart rendering */}
                {chartType === 'candlestick' &&
                  candles.map((candle, idx) => {
                    const x = getX(idx);
                    const openY = getY(candle.open);
                    const closeY = getY(candle.close);
                    const highY = getY(candle.high);
                    const lowY = getY(candle.low);
                    const isUp = candle.close >= candle.open;
                    const candleColor = isUp ? '#089981' : '#f23645';
                    const topY = Math.min(openY, closeY);
                    const bodyH = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g
                        key={idx}
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoveredCandle(candle)}
                      >
                        {/* Upper & Lower Wicks */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth="1.5"
                        />
                        {/* Candle Body */}
                        <rect
                          x={x - 3.5}
                          y={topY}
                          width="7"
                          height={bodyH}
                          fill={candleColor}
                          rx="1"
                        />
                      </g>
                    );
                  })}

                {/* EMA 20 Overlay Line */}
                {showEMA20 && (
                  <path
                    d={indicatorSeries.ema20.reduce(
                      (acc, val, i) =>
                        val === null
                          ? acc
                          : acc === ''
                          ? `M ${getX(i)} ${getY(val)}`
                          : `${acc} L ${getX(i)} ${getY(val)}`,
                      ''
                    )}
                    fill="none"
                    stroke="#2962ff"
                    strokeWidth="1.5"
                  />
                )}

                {/* SMA 50 Overlay Line */}
                {showSMA50 && (
                  <path
                    d={indicatorSeries.sma50.reduce(
                      (acc, val, i) =>
                        val === null
                          ? acc
                          : acc === ''
                          ? `M ${getX(i)} ${getY(val)}`
                          : `${acc} L ${getX(i)} ${getY(val)}`,
                      ''
                    )}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Current Price Right-Axis Pill */}
                <g transform={`translate(${chartWidth - 50}, ${getY(stock.price) - 10})`}>
                  <rect
                    x="0"
                    y="0"
                    width="48"
                    height="18"
                    rx="3"
                    fill={stock.changePercent >= 0 ? '#089981' : '#f23645'}
                  />
                  <text
                    x="24"
                    y="13"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    ${stock.price.toFixed(1)}
                  </text>
                </g>
              </svg>

              {/* RSI Sub-Panel */}
              {showRSI && (
                <div className="h-28 border-t border-[#2a2e39] bg-[#10141e] p-2 relative">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#787b86] mb-1">
                    <span className="text-purple-400 font-semibold">RSI (14): 62.8</span>
                    <div className="flex items-center gap-3">
                      <span>Overbought (70)</span>
                      <span>Oversold (30)</span>
                    </div>
                  </div>

                  <svg width="100%" height="70" viewBox={`0 0 ${chartWidth} 70`}>
                    {/* 70 and 30 guide lines */}
                    <line x1="10" y1="21" x2={chartWidth - 50} y2="21" stroke="#f23645" strokeDasharray="2 2" strokeWidth="1" opacity="0.4" />
                    <line x1="10" y1="49" x2={chartWidth - 50} y2="49" stroke="#089981" strokeDasharray="2 2" strokeWidth="1" opacity="0.4" />

                    {/* RSI Curve */}
                    <path
                      d={indicatorSeries.rsi.reduce(
                        (acc, val, i) =>
                          val === null
                            ? acc
                            : acc === ''
                            ? `M ${getX(i)} ${70 - (val / 100) * 70}`
                            : `${acc} L ${getX(i)} ${70 - (val / 100) * 70}`,
                        ''
                      )}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Company Profile & Simulated Trading Desk */}
          <div className="w-80 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex items-center border-b border-[#2a2e39] p-1 bg-[#181c27]">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'details' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Financial Stats
              </button>
              <button
                onClick={() => setActiveTab('trade')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'trade' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Paper Trading
              </button>
            </div>

            {/* Pane Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {activeTab === 'details' && (
                <>
                  {/* About the Company */}
                  <div>
                    <h4 className="font-bold text-white mb-1.5">About {stock.name}</h4>
                    <p className="text-[#787b86] leading-relaxed text-[11px]">
                      {stock.description}
                    </p>
                  </div>

                  {/* Key Stats Grid */}
                  <div className="space-y-2 border-t border-[#2a2e39] pt-3">
                    <h4 className="font-bold text-white mb-2">Key Financials</h4>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">Market Cap</span>
                        <span className="text-white font-bold">${stock.marketCap.toFixed(1)}B</span>
                      </div>
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">P/E (TTM)</span>
                        <span className="text-white font-bold">{stock.peRatio ? stock.peRatio.toFixed(1) : '—'}</span>
                      </div>
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">EPS (TTM)</span>
                        <span className="text-white font-bold">{stock.eps ? `$${stock.eps.toFixed(2)}` : '—'}</span>
                      </div>
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">Beta (1Y)</span>
                        <span className="text-white font-bold">{stock.beta ? stock.beta.toFixed(2) : '1.00'}</span>
                      </div>
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">Div Yield</span>
                        <span className="text-white font-bold">{stock.dividendYield ? `${stock.dividendYield}%` : '0.00%'}</span>
                      </div>
                      <div className="p-2 rounded bg-[#131722] border border-[#2a2e39]">
                        <span className="text-[#787b86] block text-[10px]">Avg Volume</span>
                        <span className="text-white font-bold">{(stock.avgVolume / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>

                  {/* 52-Week Range Bar */}
                  <div className="border-t border-[#2a2e39] pt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-[#787b86]">
                      <span>52W Low: ${stock.week52Low.toFixed(2)}</span>
                      <span>52W High: ${stock.week52High.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#131722] overflow-hidden relative">
                      <div
                        className="h-full bg-[#2962ff] rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((stock.price - stock.week52Low) /
                                (stock.week52High - stock.week52Low || 1)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Wall St Consensus Price Target */}
                  <div className="border-t border-[#2a2e39] pt-3 space-y-1.5">
                    <h4 className="font-bold text-white">Analyst Price Target</h4>
                    <div className="flex justify-between text-xs font-mono">
                      <div className="text-center">
                        <span className="text-[#787b86] block text-[10px]">Low</span>
                        <span className="text-[#f23645] font-bold">${stock.analystTarget.low}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[#787b86] block text-[10px]">Avg Target</span>
                        <span className="text-[#089981] font-bold text-sm">${stock.analystTarget.average}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[#787b86] block text-[10px]">High</span>
                        <span className="text-[#089981] font-bold">${stock.analystTarget.high}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'trade' && (
                <div className="space-y-4">
                  {/* Buy / Sell Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#131722] rounded-lg border border-[#2a2e39]">
                    <button
                      onClick={() => setOrderType('BUY')}
                      className={`py-2 text-xs font-bold rounded-md transition-colors ${
                        orderType === 'BUY'
                          ? 'bg-[#089981] text-white shadow-sm'
                          : 'text-[#787b86] hover:text-white'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderType('SELL')}
                      className={`py-2 text-xs font-bold rounded-md transition-colors ${
                        orderType === 'SELL'
                          ? 'bg-[#f23645] text-white shadow-sm'
                          : 'text-[#787b86] hover:text-white'
                      }`}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#787b86]">Shares to Trade</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShares(Math.max(1, shares - 5))}
                        className="w-8 h-8 rounded bg-[#131722] border border-[#2a2e39] flex items-center justify-center text-white hover:bg-[#202534]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={shares}
                        onChange={(e) => setShares(Math.max(1, Number(e.target.value)))}
                        className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 text-center font-mono font-bold text-white focus:outline-none focus:border-[#2962ff]"
                      />
                      <button
                        onClick={() => setShares(shares + 5)}
                        className="w-8 h-8 rounded bg-[#131722] border border-[#2a2e39] flex items-center justify-center text-white hover:bg-[#202534]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 5, 10, 25, 50, 100].map((qty) => (
                        <button
                          key={qty}
                          onClick={() => setShares(qty)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono border ${
                            shares === qty
                              ? 'bg-[#2962ff] text-white border-[#2962ff]'
                              : 'bg-[#131722] text-[#787b86] border-[#2a2e39] hover:text-white'
                          }`}
                        >
                          {qty}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order Preview Calculation */}
                  <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Order Type:</span>
                      <span className="text-white font-semibold">Market</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Share Price:</span>
                      <span className="text-white font-semibold">${stock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#787b86]">Commission:</span>
                      <span className="text-[#089981] font-semibold">$0.00 (Free)</span>
                    </div>
                    <div className="border-t border-[#2a2e39] pt-2 flex justify-between text-xs">
                      <span className="text-white font-bold">Estimated Cost:</span>
                      <span className="text-white font-bold font-mono">
                        ${(shares * stock.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={executeTrade}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs text-white shadow-md transition-transform active:scale-95 cursor-pointer ${
                      orderType === 'BUY'
                        ? 'bg-[#089981] hover:bg-[#0aa88f]'
                        : 'bg-[#f23645] hover:bg-[#f34a58]'
                    }`}
                  >
                    Place {orderType} Order ({shares} Shares)
                  </button>

                  <div className="text-[10px] text-[#787b86] flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Simulated Paper Trading (No real funds)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
