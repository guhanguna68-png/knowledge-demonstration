import React, { useMemo, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  CATEGORY_PERFORMANCE,
  CategoryName,
  DATASET_SUMMARY,
  MODEL_BENCHMARKS,
  REGION_PERFORMANCE,
  RegionName,
  formatINR,
} from '../data/reportData';
import { ModelComparisonChart } from './Charts';

export const ForecastingLabView: React.FC = () => {
  // Simulator 1: Furniture Discount Reform
  const [discountCap, setDiscountCap] = useState<number>(30); // baseline ~30% (Tables 32%, Bookcases 28%)

  const discountSimulation = useMemo(() => {
    const baselineSales = 741999;
    const baselineProfit = 18451; // 2.5%
    const baselineDiscount = 30;
    // Elasticity derived from report's r = -0.71 relationship:
    // Every 1% reduction in average discount recovers ~0.68% margin on Furniture after accounting for modest volume moderation (-0.25% volume per 1% discount cut)
    const deltaPct = baselineDiscount - discountCap;
    const volumeFactor = 1 - Math.max(0, deltaPct) * 0.0035 + Math.min(0, deltaPct) * 0.002;
    const adjustedSales = Math.round(baselineSales * volumeFactor);
    const projectedMargin = Math.max(-4.5, Math.min(22.0, 2.5 + deltaPct * 0.68));
    const projectedProfit = Math.round(adjustedSales * (projectedMargin / 100));
    const profitDelta = projectedProfit - baselineProfit;

    const totalOtherProfit = 145454 + 122490; // Tech + Office Supplies
    const totalEnterpriseProfit = totalOtherProfit + projectedProfit;
    const totalEnterpriseSales = 836154 + 719047 + adjustedSales;
    const enterpriseMargin = (totalEnterpriseProfit / totalEnterpriseSales) * 100;

    return {
      adjustedSales,
      projectedMargin,
      projectedProfit,
      profitDelta,
      enterpriseMargin,
      status:
        projectedMargin >= 12
          ? 'Healthy Margin Target'
          : projectedMargin >= 6
          ? 'Recovering Margin'
          : 'Margin Crisis',
    };
  }, [discountCap]);

  // Simulator 2: Dynamic Safety Stock & Reorder Point (ROP)
  const [simCategory, setSimCategory] = useState<CategoryName>('Technology');
  const [simRegion, setSimRegion] = useState<RegionName>('West');
  const [isQ4Surge, setIsQ4Surge] = useState<boolean>(true);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [serviceLevel, setServiceLevel] = useState<'90' | '95' | '99'>('95');

  const inventoryPlan = useMemo(() => {
    const catObj = CATEGORY_PERFORMANCE.find((c) => c.category === simCategory)!;
    const regObj = REGION_PERFORMANCE.find((r) => r.region === simRegion)!;

    // Derive realistic daily unit demand from category share * region share across 10,194 records
    const catWeight = catObj.sales / DATASET_SUMMARY.totalSales;
    const regWeight = regObj.sales / DATASET_SUMMARY.totalSales;
    // Avg ~24 units/day across full enterprise over 4 years
    const baseDailyUnits = 24 * (catWeight * 3.1) * (regWeight * 4.0);
    // Q4 contributes 34% of annual revenue -> ~1.36x daily run rate vs average month, and Q1 2025 ARIMA projects +12.4%
    const seasonalMultiplier = isQ4Surge ? 1.36 : 1.124;
    const projectedDailyDemand = baseDailyUnits * seasonalMultiplier;

    const demandStdDev = projectedDailyDemand * (simCategory === 'Technology' ? 0.34 : simCategory === 'Furniture' ? 0.28 : 0.18);
    const zScore = serviceLevel === '99' ? 2.33 : serviceLevel === '95' ? 1.65 : 1.28;

    const safetyStock = Math.ceil(zScore * demandStdDev * Math.sqrt(leadTimeDays));
    const leadTimeDemand = Math.ceil(projectedDailyDemand * leadTimeDays);
    const reorderPoint = leadTimeDemand + safetyStock;
    const monthlyUnits = Math.round(projectedDailyDemand * 30);

    return {
      projectedDailyDemand: projectedDailyDemand.toFixed(1),
      monthlyUnits,
      safetyStock,
      leadTimeDemand,
      reorderPoint,
      catMargin: catObj.margin,
      regMargin: regObj.margin,
    };
  }, [simCategory, simRegion, isQ4Surge, leadTimeDays, serviceLevel]);

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ARIMA(2,1,2) Forecasting &amp; Inventory Optimization Lab
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
          Compare time-series model benchmarks (Table 2.1 &amp; Table 4.3) and run interactive pricing and dynamic safety stock simulations grounded in the report findings.
        </p>
      </header>

      {/* Top Grid: Table 4.3 Accuracy Metrics + Model Benchmark Chart */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Table 4.3 · ARIMA(2,1,2) Accuracy (Q4 2023 Test Set)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Out-of-sample error metrics validating random, unbiased residuals
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="px-5 py-4 flex items-baseline justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">RMSE (Root Mean Square Error)</div>
                <div className="text-xs text-slate-500 mt-0.5">Average monthly prediction error</div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                ₹4,231
              </div>
            </div>

            <div className="px-5 py-4 flex items-baseline justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">MAE (Mean Absolute Error)</div>
                <div className="text-xs text-slate-500 mt-0.5">Typical monthly prediction error</div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                ₹3,189
              </div>
            </div>

            <div className="px-5 py-4 flex items-baseline justify-between gap-4 bg-emerald-50/40">
              <div>
                <div className="text-sm font-semibold text-slate-900">Q1 2025 SARIMA Forecast</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Projected growth vs. Q1 2024 (Technology &amp; Office Supplies led)
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                +12.4%
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed">
            Residual diagnostics confirmed errors are randomly distributed with zero systematic autocorrelation, confirming model suitability for procurement budgeting.
          </div>
        </div>

        <div className="xl:col-span-7 rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Comparative Study · Forecasting Model Benchmark (Figure 2.1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ARIMA achieves the lowest MAPE (9.1%) and highest predictive accuracy (91.0%) across baselines.
            </p>
          </div>
          <ModelComparisonChart benchmarks={MODEL_BENCHMARKS} />
        </div>
      </section>

      {/* Interactive Simulators */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Simulator 1: Furniture Pricing & Discount Reform */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 mb-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Pricing Reform Simulator</span>
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Furniture Discount Cap Optimization
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate capping average Furniture discounts (currently 32% Tables / 28% Bookcases) using the observed r = -0.71 elasticity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiscountCap(30)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="discount-slider" className="font-medium text-slate-700">
                  Max Average Furniture Discount
                </label>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {discountCap}%
                </span>
              </div>
              <input
                id="discount-slider"
                type="range"
                min={5}
                max={35}
                step={1}
                value={discountCap}
                onChange={(e) => setDiscountCap(Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>5% (Strict)</span>
                <span>15% (Recommended)</span>
                <span>30% (Baseline)</span>
                <span>35%</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: 'Baseline (30%)', val: 30 },
                  { label: 'Recommended Cap (15%)', val: 15 },
                  { label: 'Strict Cap (10%)', val: 10 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setDiscountCap(preset.val)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      discountCap === preset.val
                        ? 'border-blue-700 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 pt-5 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-500">Projected Furniture Margin</div>
                <div
                  className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                    discountSimulation.projectedMargin >= 12
                      ? 'text-emerald-700'
                      : discountSimulation.projectedMargin >= 6
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {discountSimulation.projectedMargin.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{discountSimulation.status}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Projected Furniture Profit</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {formatINR(discountSimulation.projectedProfit)}
                </div>
                <div
                  className={`text-xs font-mono tabular-nums mt-0.5 ${
                    discountSimulation.profitDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {discountSimulation.profitDelta >= 0 ? '+' : ''}
                  {formatINR(discountSimulation.profitDelta)} vs. baseline
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 flex items-center justify-between gap-4">
            <span>Projected Total Enterprise Margin:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              {discountSimulation.enterpriseMargin.toFixed(1)}% (Baseline: 12.5%)
            </span>
          </div>
        </div>

        {/* Simulator 2: Dynamic Safety Stock & ROP Calculator */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Multi-Echelon Replenishment Planner</span>
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Dynamic Safety Stock &amp; Reorder Point Calculator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Replace uniform warehouse targets with category, region, and Q4-adjusted safety stock buffers.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sim-category" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Product Category
                </label>
                <select
                  id="sim-category"
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value as CategoryName)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Technology">Technology (High Volatility)</option>
                  <option value="Office Supplies">Office Supplies (Steady)</option>
                  <option value="Furniture">Furniture (Moderate)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sim-region" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Target Region
                </label>
                <select
                  id="sim-region"
                  value={simRegion}
                  onChange={(e) => setSimRegion(e.target.value as RegionName)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="West">West (Strongest · 14.9%)</option>
                  <option value="East">East (13.5%)</option>
                  <option value="South">South (Growth · 11.9%)</option>
                  <option value="Central">Central (Review · 7.9%)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sim-leadtime" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Supplier Lead Time: <span className="font-mono font-bold">{leadTimeDays} days</span>
                </label>
                <input
                  id="sim-leadtime"
                  type="range"
                  min={2}
                  max={21}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer mt-1"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 mb-1.5">
                  Service Level &amp; Season Mode
                </span>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Target service level"
                    value={serviceLevel}
                    onChange={(e) => setServiceLevel(e.target.value as '90' | '95' | '99')}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="90">90% SL</option>
                    <option value="95">95% SL</option>
                    <option value="99">99% SL</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsQ4Surge(!isQ4Surge)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      isQ4Surge
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isQ4Surge ? 'Q4 Peak Active' : 'Q1 (+12.4%) Mode'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-slate-100">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-[11px] text-slate-500">Projected Demand</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-900">
                  {inventoryPlan.monthlyUnits} units
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {inventoryPlan.projectedDailyDemand}/day
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-[11px] text-slate-500">Safety Stock</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-blue-700">
                  {inventoryPlan.safetyStock} units
                </div>
                <div className="text-[11px] text-slate-500">
                  {serviceLevel}% fill buffer
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] text-slate-600 font-medium">Reorder Point</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-900">
                  {inventoryPlan.reorderPoint} units
                </div>
                <div className="text-[11px] text-slate-500">
                  Trigger PO level
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Guidance:</span> For{' '}
            <span className="font-medium text-slate-900">{simCategory}</span> in{' '}
            <span className="font-medium text-slate-900">{simRegion}</span>, initiate replenishment when on-hand stock drops to{' '}
            <span className="font-mono font-semibold text-slate-900">{inventoryPlan.reorderPoint} units</span> to absorb {leadTimeDays}-day lead times without stockouts.
          </div>
        </div>
      </section>
    </div>
  );
};
