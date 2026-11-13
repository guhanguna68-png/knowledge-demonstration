import React, { useMemo, useState } from 'react';
import {
  CategoryName,
  CorrelationPoint,
  ModelBenchmark,
  MonthlySeriesPoint,
  formatINR,
} from '../data/reportData';

interface TimeSeriesChartProps {
  data: MonthlySeriesPoint[];
  selectedCategory: 'All' | CategoryName;
  showQ4Bands: boolean;
  showConfidenceInterval: boolean;
}

export const TimeSeriesForecastChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedCategory,
  showQ4Bands,
  showConfidenceInterval,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 920;
  const height = 340;
  const pad = { top: 24, right: 24, bottom: 44, left: 68 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const getValue = (pt: MonthlySeriesPoint): number => {
    if (selectedCategory === 'Technology') return pt.technology;
    if (selectedCategory === 'Office Supplies') return pt.officeSupplies;
    if (selectedCategory === 'Furniture') return pt.furniture;
    return pt.total;
  };

  const values = useMemo(() => data.map(getValue), [data, selectedCategory]);

  const { minVal, maxVal } = useMemo(() => {
    const rawMax = Math.max(
      ...values,
      ...data.map((d) =>
        d.isForecast && selectedCategory === 'All' && d.forecastUpper ? d.forecastUpper : 0
      )
    );
    const rawMin = Math.min(...values);
    const niceMax = Math.ceil((rawMax * 1.1) / 10000) * 10000;
    const niceMin = Math.max(0, Math.floor((rawMin * 0.8) / 5000) * 5000);
    return { minVal: niceMin, maxVal: niceMax || 100000 };
  }, [values, data, selectedCategory]);

  const xScale = (idx: number) =>
    data.length <= 1 ? pad.left : pad.left + (idx / (data.length - 1)) * plotW;

  const yScale = (val: number) =>
    pad.top + plotH - ((val - minVal) / (maxVal - minVal || 1)) * plotH;

  const actualPoints = data
    .map((pt, i) => ({ pt, i, val: getValue(pt) }))
    .filter((d) => !d.pt.isForecast);

  const forecastPoints = data
    .map((pt, i) => ({ pt, i, val: getValue(pt) }))
    .filter((d) => d.pt.isForecast);

  const lastActual = actualPoints[actualPoints.length - 1];
  const connectedForecast = lastActual ? [lastActual, ...forecastPoints] : forecastPoints;

  const actualPath = actualPoints
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xScale(d.i).toFixed(1)} ${yScale(d.val).toFixed(1)}`)
    .join(' ');

  const forecastPath = connectedForecast
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${xScale(d.i).toFixed(1)} ${yScale(d.val).toFixed(1)}`)
    .join(' ');

  const confidenceAreaPath = useMemo(() => {
    if (!showConfidenceInterval || connectedForecast.length < 2) return '';
    const ratio = selectedCategory === 'All' ? 1 : 0.38;
    const upper = connectedForecast.map((d) => {
      const spread = d.pt.isForecast ? 4231 * 1.65 * ratio : 0;
      return `${xScale(d.i).toFixed(1)} ${yScale(d.val + spread).toFixed(1)}`;
    });
    const lower = [...connectedForecast].reverse().map((d) => {
      const spread = d.pt.isForecast ? 4231 * 1.65 * ratio : 0;
      return `${xScale(d.i).toFixed(1)} ${yScale(Math.max(minVal, d.val - spread)).toFixed(1)}`;
    });
    return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
  }, [connectedForecast, showConfidenceInterval, selectedCategory, minVal]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(minVal + (maxVal - minVal) * t));

  const q4Spans = useMemo(() => {
    const spans: { startIdx: number; endIdx: number; year: number }[] = [];
    data.forEach((pt, idx) => {
      if (pt.monthIndex === 10) {
        const decIdx = data.findIndex((d, j) => j >= idx && d.year === pt.year && d.monthIndex === 12);
        spans.push({
          startIdx: idx,
          endIdx: decIdx !== -1 ? decIdx : idx,
          year: pt.year,
        });
      }
    });
    return spans;
  }, [data]);

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredValue = hoveredIndex !== null ? values[hoveredIndex] : 0;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Monthly sales time series and ARIMA forecast chart"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Q4 Seasonal Peak Shading */}
        {showQ4Bands &&
          q4Spans.map((span) => {
            const x1 = xScale(span.startIdx) - 4;
            const x2 = xScale(span.endIdx) + 4;
            return (
              <g key={`q4-${span.year}`}>
                <rect
                  x={x1}
                  y={pad.top}
                  width={Math.max(8, x2 - x1)}
                  height={plotH}
                  fill="#FEF3C7"
                  fillOpacity={0.55}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={pad.top + 14}
                  textAnchor="middle"
                  className="fill-amber-800 text-[10px] font-medium font-mono"
                >
                  Q4
                </text>
              </g>
            );
          })}

        {/* Horizontal Gridlines & Y-Axis Labels */}
        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <text
                x={pad.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] font-mono tabular-nums"
              >
                ₹{tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
              </text>
            </g>
          );
        })}

        {/* Forecast Boundary Line */}
        {lastActual && (
          <g>
            <line
              x1={xScale(lastActual.i)}
              y1={pad.top}
              x2={xScale(lastActual.i)}
              y2={pad.top + plotH}
              stroke="#94A3B8"
              strokeDasharray="4 4"
            />
            <text
              x={xScale(lastActual.i) + 6}
              y={pad.top + 14}
              className="fill-emerald-700 text-[10px] font-semibold"
            >
              SARIMA Projection →
            </text>
          </g>
        )}

        {/* Confidence Interval Shading */}
        {confidenceAreaPath && (
          <path d={confidenceAreaPath} fill="#10B981" fillOpacity={0.14} />
        )}

        {/* Historical Actual Line */}
        <path
          d={actualPath}
          fill="none"
          stroke="#1D4ED8"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Forecast Line */}
        <path
          d={forecastPath}
          fill="none"
          stroke="#059669"
          strokeWidth={2.25}
          strokeDasharray="6 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X-Axis Labels (Jan of each year + end) */}
        {data.map((pt, i) => {
          const showLabel =
            pt.monthIndex === 1 || (data.length <= 28 && pt.monthIndex % 3 === 1) || i === data.length - 1;
          if (!showLabel) return null;
          return (
            <text
              key={pt.id}
              x={xScale(i)}
              y={height - 14}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] font-mono tabular-nums"
            >
              {pt.label}
            </text>
          );
        })}

        {/* Data Point Markers on Hover or Forecast */}
        {data.map((pt, i) => {
          const cx = xScale(i);
          const cy = yScale(values[i]);
          const isHovered = hoveredIndex === i;
          return (
            <g key={pt.id}>
              {(pt.isForecast || isHovered || pt.monthIndex === 12) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 2.8}
                  fill={pt.isForecast ? '#059669' : '#1D4ED8'}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              )}
              <rect
                x={cx - plotW / data.length / 2}
                y={pad.top}
                width={Math.max(10, plotW / data.length)}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            </g>
          );
        })}

        {/* Crosshair Line */}
        {hoveredIndex !== null && (
          <line
            x1={xScale(hoveredIndex)}
            y1={pad.top}
            x2={xScale(hoveredIndex)}
            y2={pad.top + plotH}
            stroke="#334155"
            strokeWidth={1}
          />
        )}
      </svg>

      {/* Interactive Tooltip */}
      {hoveredItem && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm text-xs"
          style={{
            left: hoveredIndex > data.length * 0.65 ? 'auto' : `${Math.min(72, (hoveredIndex / data.length) * 100 + 6)}%`,
            right: hoveredIndex > data.length * 0.65 ? '16px' : 'auto',
          }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 mb-1.5">
            <span className="font-semibold text-slate-900">
              {hoveredItem.label} ({hoveredItem.quarter})
            </span>
            <span className={hoveredItem.isForecast ? 'text-emerald-700 font-medium' : 'text-blue-700 font-medium'}>
              {hoveredItem.isForecast ? 'ARIMA Forecast' : 'Historical Actual'}
            </span>
          </div>
          <div className="space-y-1 tabular-nums font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-sans">
                {selectedCategory === 'All' ? 'Total Revenue' : selectedCategory}
              </span>
              <span className="font-semibold text-slate-900">{formatINR(hoveredValue)}</span>
            </div>
            {selectedCategory === 'All' && (
              <>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-500 font-sans">Technology</span>
                  <span className="text-slate-700">{formatINR(hoveredItem.technology)}</span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-500 font-sans">Office Supplies</span>
                  <span className="text-slate-700">{formatINR(hoveredItem.officeSupplies)}</span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-500 font-sans">Furniture</span>
                  <span className="text-slate-700">{formatINR(hoveredItem.furniture)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CorrelationPlotProps {
  points: CorrelationPoint[];
  categoryFilter: 'All' | CategoryName;
}

export const CorrelationScatterPlot: React.FC<CorrelationPlotProps> = ({
  points,
  categoryFilter,
}) => {
  const [hovered, setHovered] = useState<CorrelationPoint | null>(null);

  const filtered = useMemo(
    () =>
      categoryFilter === 'All'
        ? points
        : points.filter((p) => p.category === categoryFilter),
    [points, categoryFilter]
  );

  const width = 620;
  const height = 310;
  const pad = { top: 20, right: 24, bottom: 44, left: 66 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const minX = 0;
  const maxX = 40;
  const minY = -3200;
  const maxY = 5600;

  const xScale = (d: number) => pad.left + ((d - minX) / (maxX - minX)) * plotW;
  const yScale = (p: number) => pad.top + plotH - ((p - minY) / (maxY - minY)) * plotH;

  const zeroY = yScale(0);

  const colorForCategory = (cat: CategoryName) => {
    if (cat === 'Technology') return '#1D4ED8';
    if (cat === 'Office Supplies') return '#059669';
    return '#DC2626';
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Discount versus Profit correlation scatter plot"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Loss Region Shading below ₹0 */}
        <rect
          x={pad.left}
          y={zeroY}
          width={plotW}
          height={pad.top + plotH - zeroY}
          fill="#FEE2E2"
          fillOpacity={0.35}
        />

        {/* Y Gridlines */}
        {[-3000, -1500, 0, 1500, 3000, 4500].map((val) => {
          const y = yScale(val);
          const isZero = val === 0;
          return (
            <g key={val}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke={isZero ? '#64748B' : '#E2E8F0'}
                strokeDasharray={isZero ? '5 3' : '3 3'}
                strokeWidth={isZero ? 1.25 : 1}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                {val < 0 ? `-₹${Math.abs(val)}` : `₹${val}`}
              </text>
            </g>
          );
        })}

        {/* X Gridlines */}
        {[0, 10, 20, 30, 40].map((disc) => {
          const x = xScale(disc);
          return (
            <g key={disc}>
              <line
                x1={x}
                y1={pad.top}
                x2={x}
                y2={pad.top + plotH}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <text
                x={x}
                y={height - 18}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                {disc}%
              </text>
            </g>
          );
        })}

        {/* Axis Titles */}
        <text
          x={pad.left + plotW / 2}
          y={height - 2}
          textAnchor="middle"
          className="fill-slate-600 text-[11px] font-medium"
        >
          Discount Applied (%)
        </text>

        {/* Regression Line (r = -0.71) */}
        <line
          x1={xScale(0)}
          y1={yScale(2400)}
          x2={xScale(38)}
          y2={yScale(-2350)}
          stroke="#0F172A"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
        <text
          x={xScale(29)}
          y={yScale(-1150) - 10}
          className="fill-slate-800 text-[11px] font-mono font-semibold"
        >
          r = -0.71
        </text>

        {/* Points */}
        {filtered.map((pt) => {
          const cx = xScale(pt.discount);
          const cy = yScale(pt.profit);
          const isActive = hovered?.id === pt.id;
          return (
            <circle
              key={pt.id}
              cx={cx}
              cy={cy}
              r={isActive ? 7 : 5}
              fill={colorForCategory(pt.category)}
              fillOpacity={0.85}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHovered(pt)}
            />
          );
        })}
      </svg>

      {hovered && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs">
          <div className="font-medium text-slate-900">
            {hovered.category} · {hovered.subCategory} ({hovered.region})
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span className="text-slate-600">Discount: {hovered.discount}%</span>
            <span className="text-slate-600">Sales: {formatINR(hovered.sales)}</span>
            <span className={hovered.profit < 0 ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>
              Profit: {formatINR(hovered.profit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const ModelComparisonChart: React.FC<{ benchmarks: ModelBenchmark[] }> = ({
  benchmarks,
}) => {
  return (
    <div className="space-y-3">
      {benchmarks.map((item) => {
        const barWidth = `${item.accuracy}%`;
        return (
          <div
            key={item.method}
            className={`rounded-lg border p-3.5 transition-colors ${
              item.isSelected
                ? 'border-blue-200 bg-blue-50/40'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{item.method}</span>
                {item.isSelected && (
                  <span className="text-xs font-medium text-blue-700">Selected Model</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
                <span>MAPE: {item.mape.toFixed(1)}%</span>
                <span>RMSE: {item.rmse.toFixed(1)}</span>
                <span className="font-semibold text-slate-900">
                  Accuracy: {item.accuracy.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-sm bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  item.isSelected ? 'bg-blue-700' : 'bg-slate-400'
                }`}
                style={{ width: barWidth }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.notes}</p>
          </div>
        );
      })}
    </div>
  );
};
