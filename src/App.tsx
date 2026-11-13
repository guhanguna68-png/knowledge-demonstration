import React, { useState } from 'react';
import {
  BarChart3,
  Database,
  Download,
  Menu,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  CATEGORY_PERFORMANCE,
  DATASET_SUMMARY,
  REGION_PERFORMANCE,
  REPORT_META,
} from './data/reportData';
import { OverviewView } from './components/OverviewView';
import { EdaExplorerView } from './components/EdaExplorerView';
import { ForecastingLabView } from './components/ForecastingLabView';

type TabKey = 'overview' | 'eda' | 'forecasting';

const NAV_ITEMS: { key: TabKey; label: string; breadcrumb: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Executive Overview', breadcrumb: 'Executive Overview', icon: BarChart3 },
  { key: 'eda', label: 'Preprocessing & EDA', breadcrumb: 'Preprocessing & EDA', icon: Database },
  { key: 'forecasting', label: 'Forecasting Lab', breadcrumb: 'ARIMA(2,1,2) Lab', icon: SlidersHorizontal },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((n) => n.key === activeTab)!;

  const handleNavClick = (key: TabKey) => {
    setActiveTab(key);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportSummaryCsv = () => {
    const lines = [
      'Section,Name,Sales (INR),Profit (INR),Margin (%)',
      ...CATEGORY_PERFORMANCE.map(
        (c) => `Category,${c.category},${c.sales},${c.profit},${c.margin}`
      ),
      ...REGION_PERFORMANCE.map(
        (r) => `Region,${r.region},${r.sales},${r.profit},${r.margin}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory_optimization_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white z-20">
        <div className="h-14 px-5 flex items-center border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="text-left font-bold tracking-tight text-slate-900 text-base whitespace-nowrap cursor-pointer"
          >
            DemandAnalytics
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Workspace sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-200 text-xs text-slate-500 space-y-1.5">
          <div className="font-semibold text-slate-900">Dataset Scope</div>
          <div className="font-mono tabular-nums text-slate-600">
            {DATASET_SUMMARY.verifiedRecords.toLocaleString('en-IN')} Verified Orders
          </div>
          <div className="leading-snug text-slate-500">
            {DATASET_SUMMARY.dateRange} · {DATASET_SUMMARY.arimaOrder}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full border-r border-slate-200 flex flex-col z-50">
            <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200">
              <span className="font-bold tracking-tight text-slate-900 text-base">
                DemandAnalytics
              </span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-5 border-t border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="font-semibold text-slate-900">Dataset Scope</div>
              <div className="font-mono text-slate-600">
                {DATASET_SUMMARY.verifiedRecords.toLocaleString('en-IN')} Verified Orders
              </div>
              <div>{DATASET_SUMMARY.dateRange}</div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 truncate">
              <span className="hidden sm:inline">Inventory Optimization</span>
              <span className="hidden sm:inline" aria-hidden="true">/</span>
              <span className="font-medium text-slate-900 truncate">{currentNav.breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportSummaryCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary CSV</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewView onNavigate={handleNavClick} />}
          {activeTab === 'eda' && <EdaExplorerView />}
          {activeTab === 'forecasting' && <ForecastingLabView />}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>{REPORT_META.title}</div>
          <div>{REPORT_META.subtitle} · {DATASET_SUMMARY.arimaOrder}</div>
        </footer>
      </div>
    </div>
  );
}
