import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  CATEGORY_PERFORMANCE,
  CategoryName,
  DATASET_SUMMARY,
  MONTHLY_TIME_SERIES,
  REGION_PERFORMANCE,
  REPORT_META,
  formatINR,
} from '../data/reportData';
import { TimeSeriesForecastChart } from './Charts';

interface OverviewViewProps {
  onNavigate: (tab: 'overview' | 'eda' | 'forecasting') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryName>('All');
  const [timeframe, setTimeframe] = useState<'full' | 'recent'>('full');
  const [showQ4Bands, setShowQ4Bands] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);

  const visibleSeries = useMemo(() => {
    if (timeframe === 'recent') {
      return MONTHLY_TIME_SERIES.filter((pt) => pt.year >= 2023);
    }
    return MONTHLY_TIME_SERIES;
  }, [timeframe]);

  const toneClass = (tone: string) => {
    if (tone === 'emerald') return 'text-emerald-700';
    if (tone === 'amber') return 'text-amber-700';
    if (tone === 'crimson') return 'text-red-700';
    return 'text-blue-700';
  };

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-2">
          <span>{REPORT_META.subtitle}</span>
          <span aria-hidden="true">·</span>
          <span>{DATASET_SUMMARY.dateRange}</span>
          <span aria-hidden="true">·</span>
          <span>{DATASET_SUMMARY.arimaOrder}</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              {REPORT_META.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              End-to-end Python predictive analytics prototype analyzing{' '}
              <span className="font-mono tabular-nums font-medium text-slate-800">
                {DATASET_SUMMARY.verifiedRecords.toLocaleString('en-IN')}
              </span>{' '}
              verified retail transactions ({DATASET_SUMMARY.dateRange}) to diagnose category margin leakage and project Q1 2025 demand via{' '}
              <span className="font-medium text-slate-800">{DATASET_SUMMARY.arimaOrder}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('forecasting')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Demand Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Key analytical metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total Sales</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatINR(DATASET_SUMMARY.totalSales)}
          </div>
          <div className="mt-1.5 text-xs text-slate-600">
            Across {DATASET_SUMMARY.verifiedRecords.toLocaleString('en-IN')} verified orders · ~{DATASET_SUMMARY.q4RevenueShare}% in Q4
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total Profit</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatINR(DATASET_SUMMARY.totalProfit)}
          </div>
          <div className="mt-1.5 text-xs text-slate-600">
            Technology leads at {formatINR(145454)} net profit
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Average Margin</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {DATASET_SUMMARY.overallMargin.toFixed(1)}%
          </div>
          <div className="mt-1.5 text-xs text-slate-600">
            Office Supplies 17.5% · Furniture 2.5%
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Forecasted Growth</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700">
            +{DATASET_SUMMARY.q1ForecastGrowth}%
          </div>
          <div className="mt-1.5 text-xs text-slate-600">
            Q1 2025 SARIMA · 91.0% accuracy (RMSE ₹{DATASET_SUMMARY.arimaRmse.toLocaleString('en-IN')})
          </div>
        </div>
      </section>

      {/* Main Interactive Time-Series & Seasonality Panel */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Monthly Demand Trajectory &amp; ARIMA(2,1,2) Forecast
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Hover over any month to inspect historical actuals (2020–2023), Q4 holiday surges, and projected Q1 2025 demand.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Segmented Filter */}
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Filter chart by category">
              {(['All', 'Technology', 'Office Supplies', 'Furniture'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Timeframe Toggle */}
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Select chart timeframe">
              <button
                type="button"
                onClick={() => setTimeframe('full')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  timeframe === 'full'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2020–2025
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('recent')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  timeframe === 'recent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2023–2025 Zoom
              </button>
            </div>
          </div>
        </div>

        <TimeSeriesForecastChart
          data={visibleSeries}
          selectedCategory={selectedCategory}
          showQ4Bands={showQ4Bands}
          showConfidenceInterval={showConfidence}
        />

        {/* Legend & Overlay Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 bg-blue-700" aria-hidden="true" />
              <span>Actual Sales (2020–2023)</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-emerald-600" aria-hidden="true" />
              <span>SARIMA Forecast (2024–Q1 2025)</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-amber-100 border border-amber-300 rounded-xs" aria-hidden="true" />
              <span>Q4 Holiday Peak (~34% Annual Revenue)</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showQ4Bands}
                onChange={(e) => setShowQ4Bands(e.target.checked)}
                className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span>Highlight Q4 Peaks</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span>95% Confidence Band</span>
            </label>
          </div>
        </div>
      </section>

      {/* Tables 4.1 & 4.2: Category & Regional Performance */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table 4.1: Product Category Performance */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Table 4.1 · Product Category Performance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sales revenue, net profit, and margin health by merchandise division
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('eda')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Inspect EDA →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-2.5 px-5">Category</th>
                  <th className="py-2.5 px-3 text-right">Sales (₹)</th>
                  <th className="py-2.5 px-3 text-right">Profit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-5">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORY_PERFORMANCE.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{row.category}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(row.sales)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(row.profit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {row.margin.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-5 text-xs font-medium whitespace-nowrap ${toneClass(row.statusTone)}`}>
                      {row.statusLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-red-50/40 px-5 py-3.5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-red-800">Pricing Reform Alert:</span> Furniture earns only a{' '}
              <span className="font-mono font-semibold">2.5%</span> margin despite ranking second in revenue due to excessive discounting on Tables (<span className="font-mono">32%</span> avg) and Bookcases (<span className="font-mono">28%</span> avg).
            </p>
          </div>
        </div>

        {/* Table 4.2: Region-wise Sales Performance */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Table 4.2 · Region-wise Sales Performance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic revenue concentration and margin efficiency across 4 territories
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('forecasting')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Safety Stock Plan →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-2.5 px-5">Region</th>
                  <th className="py-2.5 px-3 text-right">Sales (₹)</th>
                  <th className="py-2.5 px-3 text-right">Profit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-5">Market Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REGION_PERFORMANCE.map((row) => (
                  <tr key={row.region} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{row.region}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(row.sales)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(row.profit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {row.margin.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-5 text-xs font-medium whitespace-nowrap ${toneClass(row.statusTone)}`}>
                      {row.statusLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Regional Strategy:</span> West leads at{' '}
              <span className="font-mono font-semibold">14.9%</span> margin. South (<span className="font-mono">₹3,91,721</span>) is underserved and offers expansion upside, while Central (<span className="font-mono">7.9%</span>) requires immediate discount governance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
