import React, { useMemo, useState } from 'react';
import { Download, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import {
  CORRELATION_SCATTER_POINTS,
  CategoryName,
  PREPROCESSING_STEPS,
  RegionName,
  SAMPLE_TRANSACTIONS,
  formatINR,
} from '../data/reportData';
import { CorrelationScatterPlot } from './Charts';

type SortField = 'orderDate' | 'sales' | 'profit' | 'discount';

export const EdaExplorerView: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [scatterCategory, setScatterCategory] = useState<'All' | CategoryName>('All');

  // Transaction table state
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'All' | RegionName>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CategoryName>('All');
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeStep = PREPROCESSING_STEPS[activeStepIndex];

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = SAMPLE_TRANSACTIONS.filter((row) => {
      if (regionFilter !== 'All' && row.region !== regionFilter) return false;
      if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
      if (
        q &&
        !row.orderId.toLowerCase().includes(q) &&
        !row.subCategory.toLowerCase().includes(q) &&
        !row.region.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'orderDate') {
        diff = a.orderDate.localeCompare(b.orderDate);
      } else {
        diff = a[sortField] - b[sortField];
      }
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [searchQuery, regionFilter, categoryFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRegionFilter('All');
    setCategoryFilter('All');
  };

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  const handleDownloadCsv = () => {
    const headers = ['Order ID', 'Order Date', 'Region', 'Category', 'Sub-Category', 'Sales (INR)', 'Profit (INR)', 'Quantity', 'Discount (%)'];
    const rows = filteredTransactions.map((r) => [
      r.orderId,
      r.orderDate,
      r.region,
      r.category,
      r.subCategory,
      r.sales,
      r.profit,
      r.quantity,
      r.discount,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'verified_retail_transactions_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Preprocessing &amp; Exploratory Data Analysis
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
          Inspect the five-stage Python data cleaning pipeline (Section 3.2), the bivariate Discount vs. Profit correlation matrix (r = -0.71), and the verified transaction ledger.
        </p>
      </header>

      {/* Section 1: 5-Stage Preprocessing Pipeline */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            01. Python Data Preprocessing Pipeline (Section 3.2)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a stage to inspect data transformation rules and Pandas implementation logic.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 divide-y divide-slate-100">
            {PREPROCESSING_STEPS.map((st, idx) => {
              const isSelected = idx === activeStepIndex;
              return (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-left px-5 py-3.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-800' : 'text-slate-900'}`}>
                      {st.step}. {st.title}
                    </span>
                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {st.recordsAffected}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 truncate">{st.method}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-slate-50/40">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Stage {activeStep.step}: {activeStep.title}
                </h3>
                <span className="text-xs font-mono font-medium text-blue-700">
                  {activeStep.recordsAffected}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {activeStep.description}
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 overflow-x-auto">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  pipeline_preprocess.py
                </div>
                <pre className="text-xs font-mono text-slate-100 leading-relaxed">
                  <code>{activeStep.pythonSnippet}</code>
                </pre>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Method: <span className="font-mono text-slate-700">{activeStep.method}</span></span>
              <span>Output: 10,194 clean records</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Bivariate Correlation Explorer */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              02. Bivariate EDA: Discount (%) vs. Net Profit (₹) · Pearson r = -0.71
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover any point to inspect how promotional discounts above 20% push Furniture orders into net loss.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start" role="group" aria-label="Filter correlation scatter plot by category">
            {(['All', 'Technology', 'Office Supplies', 'Furniture'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setScatterCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  scatterCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <CorrelationScatterPlot
              points={CORRELATION_SCATTER_POINTS}
              categoryFilter={scatterCategory}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">Pearson Correlation Coefficient</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                r = -0.71
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Discount rate is the strongest negative predictor of net order profit across all 10,194 records.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="font-semibold text-slate-900">Category Color Key</div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700" aria-hidden="true" />
                  Technology
                </span>
                <span className="font-mono text-slate-600">17.4% Margin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  Office Supplies
                </span>
                <span className="font-mono text-slate-600">17.5% Margin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden="true" />
                  Furniture
                </span>
                <span className="font-mono text-red-700 font-medium">2.5% Margin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Transaction Ledger */}
      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              03. Verified Transaction Ledger (Representative Dataset Sample)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by region or category, sort numeric columns, or export the filtered subset as CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID or sub-category..."
                aria-label="Search transactions"
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | CategoryName)}
              aria-label="Filter by category"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Furniture">Furniture</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as 'All' | RegionName)}
              aria-label="Filter by region"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Regions</option>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="South">South</option>
              <option value="Central">Central</option>
            </select>

            <button
              type="button"
              onClick={handleSimulateRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={filteredTransactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <th className="py-2.5 px-4">Order ID</th>
                <th className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('orderDate')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Order Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Sub-Category</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('discount')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Discount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('sales')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Sales (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('profit')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Profit (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isRefreshing ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-10">
                    <td colSpan={9} className="px-4 py-2">
                      <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No matching transactions found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try adjusting your search query, region filter, or category selection.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-4 inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((row) => (
                  <tr key={row.orderId} className="h-10 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {row.orderId}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap">
                      {row.orderDate}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{row.region}</td>
                    <td className="py-2.5 px-3 text-slate-700">{row.category}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{row.subCategory}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.quantity}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums ${row.discount >= 25 ? 'font-semibold text-red-700' : 'text-slate-700'}`}>
                      {row.discount}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {formatINR(row.sales)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono tabular-nums font-semibold ${
                        row.profit < 0 ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {formatINR(row.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <span className="font-mono font-medium text-slate-800">{filteredTransactions.length}</span> of{' '}
            <span className="font-mono font-medium text-slate-800">{SAMPLE_TRANSACTIONS.length}</span> curated sample rows (10,194 total dataset records)
          </span>
          <span>Sorted by {sortField}</span>
        </div>
      </section>
    </div>
  );
};
