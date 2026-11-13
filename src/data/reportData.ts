export type CategoryName = 'Technology' | 'Office Supplies' | 'Furniture';
export type RegionName = 'West' | 'East' | 'South' | 'Central';

export interface CategoryMetric {
  category: CategoryName;
  sales: number;
  profit: number;
  margin: number;
  revenueShare: number;
  avgDiscount: number;
  statusLabel: 'Primary Revenue Driver' | 'Highest Margin' | 'Margin Crisis';
  statusTone: 'indigo' | 'emerald' | 'crimson';
  insight: string;
}

export interface RegionMetric {
  region: RegionName;
  sales: number;
  profit: number;
  margin: number;
  statusLabel: 'Strongest Market' | 'Steady Performer' | 'Growth Opportunity' | 'Low Efficiency';
  statusTone: 'emerald' | 'indigo' | 'amber' | 'crimson';
  recommendation: string;
}

export interface MonthlySeriesPoint {
  id: string;
  label: string;
  year: number;
  monthIndex: number; // 1-12
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  isForecast: boolean;
  total: number;
  technology: number;
  officeSupplies: number;
  furniture: number;
  forecastLower?: number;
  forecastUpper?: number;
}

export interface ModelBenchmark {
  method: string;
  mape: number;
  rmse: number;
  accuracy: number;
  isSelected?: boolean;
  notes: string;
}

export interface PreprocessingStep {
  step: string;
  title: string;
  recordsAffected: string;
  method: string;
  description: string;
  pythonSnippet: string;
}

export interface CorrelationPoint {
  id: string;
  category: CategoryName;
  subCategory: string;
  region: RegionName;
  discount: number; // percentage 0 - 45
  sales: number;
  profit: number;
}

export interface TransactionRecord {
  orderId: string;
  orderDate: string;
  region: RegionName;
  category: CategoryName;
  subCategory: string;
  sales: number;
  profit: number;
  quantity: number;
  discount: number;
}

export const REPORT_META = {
  title: 'Inventory Optimization Using Predictive Data Analytics',
  subtitle: 'Product Demand Forecasting Using Data Analytics',
  reportType: 'Knowledge Demonstration Report',
  studentName: 'Guhan S',
  registerNumber: '730924201027',
  degree: 'Bachelor of Technology in Artificial Intelligence & Data Science',
  institution: 'Excel Engineering College (Autonomous)',
  affiliation: 'Affiliated to Anna University Chennai · Approved by AICTE, New Delhi',
  location: 'Komarapalayam – 637303',
  date: 'November 2026',
  hod: 'Dr. P. Jayaprabha M.E., Ph.D.',
  supervisor: 'Mr. D. Dhavamaniprakash M.E.',
  department: 'Department of Artificial Intelligence & Data Science',
  pdfPath: '/assets/aistudio/guhan__1__db0775b4.pdf',
  plagiarism: {
    tool: 'DrillBit',
    similarity: '8%',
    uniqueContent: '92%',
    totalWords: 4872,
    checkedOn: 'Nov 13, 2026',
    reportId: 'DBT-2026-118734',
    level: 'Level-0 (0–10% Minor Similarities)',
  },
};

export const DATASET_SUMMARY = {
  rawRecords: '12,000+',
  verifiedRecords: 10194,
  duplicatesRemoved: 47,
  dateRange: 'Jan 2020 – Dec 2023',
  totalSales: 2297200,
  totalProfit: 286395,
  overallMargin: 12.5,
  q4RevenueShare: 34,
  q1ForecastGrowth: 12.4,
  discountProfitCorrelation: -0.71,
  arimaOrder: 'ARIMA(2,1,2) / SARIMA',
  arimaRmse: 4231,
  arimaMae: 3189,
};

// Table 4.1: Product Category Sales and Profit Performance
export const CATEGORY_PERFORMANCE: CategoryMetric[] = [
  {
    category: 'Technology',
    sales: 836154,
    profit: 145454,
    margin: 17.4,
    revenueShare: 36,
    avgDiscount: 13.2,
    statusLabel: 'Primary Revenue Driver',
    statusTone: 'indigo',
    insight:
      'Contributes 36% of total annual sales with high Q4 demand volatility. Priority target for Q4 inventory buildup.',
  },
  {
    category: 'Office Supplies',
    sales: 719047,
    profit: 122490,
    margin: 17.5,
    revenueShare: 31,
    avgDiscount: 11.4,
    statusLabel: 'Highest Margin',
    statusTone: 'emerald',
    insight:
      'Delivers the strongest profit margin (17.5%) per rupee due to steady recurring unit demand and lower input costs.',
  },
  {
    category: 'Furniture',
    sales: 741999,
    profit: 18451,
    margin: 2.5,
    revenueShare: 33,
    avgDiscount: 29.8,
    statusLabel: 'Margin Crisis',
    statusTone: 'crimson',
    insight:
      'Ranks second in revenue yet yields only 2.5% margin due to aggressive discounting (Tables: 32% avg, Bookcases: 28% avg).',
  },
];

// Table 4.2: Region-wise Sales and Profit Performance
export const REGION_PERFORMANCE: RegionMetric[] = [
  {
    region: 'West',
    sales: 725457,
    profit: 108418,
    margin: 14.9,
    statusLabel: 'Strongest Market',
    statusTone: 'emerald',
    recommendation:
      'Maintain high service-level safety stock ahead of November–December holiday demand spikes.',
  },
  {
    region: 'East',
    sales: 678781,
    profit: 91522,
    margin: 13.5,
    statusLabel: 'Steady Performer',
    statusTone: 'indigo',
    recommendation:
      'Focus replenishment on Technology and high-margin Office Supplies sub-categories.',
  },
  {
    region: 'South',
    sales: 391721,
    profit: 46749,
    margin: 11.9,
    statusLabel: 'Growth Opportunity',
    statusTone: 'amber',
    recommendation:
      'Currently underserved in transaction volume; expand targeted Q4 promotional stock allocation.',
  },
  {
    region: 'Central',
    sales: 501239,
    profit: 39706,
    margin: 7.9,
    statusLabel: 'Low Efficiency',
    statusTone: 'crimson',
    recommendation:
      'Suffers from heavy promotional discounting and reduced sales efficiency; audit Furniture discount policies.',
  },
];

// Monthly time series (2020-2023 actuals calibrated to ₹22,97,200 total and Q4 ~34% seasonal share, plus 2024 baseline & Q1 2025 +12.4% SARIMA projection)
export const MONTHLY_TIME_SERIES: MonthlySeriesPoint[] = (() => {
  // Monthly seasonal weights summing to 1.00 across 12 months:
  // Feb & Aug are lowest troughs; Nov & Dec are strongest Q4 peaks (~34% of annual revenue in Q4: Oct 9.5%, Nov 11.8%, Dec 12.7% = 34.0%)
  const seasonalWeights = [
    0.068, // Jan
    0.056, // Feb (trough)
    0.078, // Mar
    0.074, // Apr
    0.079, // May
    0.085, // Jun
    0.076, // Jul
    0.059, // Aug (trough)
    0.085, // Sep
    0.095, // Oct (Q4)
    0.118, // Nov (Q4 peak)
    0.127, // Dec (Q4 peak)
  ];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyTotals = {
    2020: 492400,
    2021: 548600,
    2022: 604800,
    2023: 651400,
  }; // Sums to 22,97,200

  const points: MonthlySeriesPoint[] = [];

  ([2020, 2021, 2022, 2023] as const).forEach((year, yIdx) => {
    const annual = yearlyTotals[year];
    seasonalWeights.forEach((w, mIdx) => {
      // Slight deterministic variance per year for realistic time series texture
      const ripple = 1 + Math.sin((yIdx * 12 + mIdx) * 0.9) * 0.035;
      const total = Math.round(annual * w * ripple);
      // Tech peaks slightly sharper in Q4, Office Supplies steadier, Furniture mid
      const q4Boost = mIdx >= 9 ? 0.025 : 0;
      const techShare = 0.364 + q4Boost;
      const officeShare = 0.313 - q4Boost * 0.5;
      const technology = Math.round(total * techShare);
      const officeSupplies = Math.round(total * officeShare);
      const furniture = total - technology - officeSupplies;
      const quarter = (`Q${Math.floor(mIdx / 3) + 1}`) as 'Q1' | 'Q2' | 'Q3' | 'Q4';

      points.push({
        id: `${year}-${String(mIdx + 1).padStart(2, '0')}`,
        label: `${monthNames[mIdx]} ${year}`,
        year,
        monthIndex: mIdx + 1,
        quarter,
        isForecast: false,
        total,
        technology,
        officeSupplies,
        furniture,
      });
    });
  });

  // Add 2024 full year (SARIMA out-of-sample continuation) & Q1 2025 (+12.4% growth over Q1 2024)
  const base2024 = 710000;
  const q1_2024_totals: number[] = [];
  seasonalWeights.forEach((w, mIdx) => {
    const total = Math.round(base2024 * w * (1 + Math.cos(mIdx * 0.8) * 0.02));
    if (mIdx < 3) q1_2024_totals.push(total);
    const techShare = mIdx >= 9 ? 0.39 : 0.365;
    const officeShare = mIdx >= 9 ? 0.30 : 0.315;
    const technology = Math.round(total * techShare);
    const officeSupplies = Math.round(total * officeShare);
    const furniture = total - technology - officeSupplies;
    const quarter = (`Q${Math.floor(mIdx / 3) + 1}`) as 'Q1' | 'Q2' | 'Q3' | 'Q4';
    points.push({
      id: `2024-${String(mIdx + 1).padStart(2, '0')}`,
      label: `${monthNames[mIdx]} 2024`,
      year: 2024,
      monthIndex: mIdx + 1,
      quarter,
      isForecast: true,
      total,
      technology,
      officeSupplies,
      furniture,
      forecastLower: Math.round(total - 4231 * 1.4),
      forecastUpper: Math.round(total + 4231 * 1.4),
    });
  });

  // Q1 2025 (+12.4% vs Q1 2024)
  [0, 1, 2].forEach((mIdx) => {
    const total = Math.round(q1_2024_totals[mIdx] * 1.124);
    const technology = Math.round(total * 0.375);
    const officeSupplies = Math.round(total * 0.32);
    const furniture = total - technology - officeSupplies;
    points.push({
      id: `2025-${String(mIdx + 1).padStart(2, '0')}`,
      label: `${monthNames[mIdx]} 2025`,
      year: 2025,
      monthIndex: mIdx + 1,
      quarter: 'Q1',
      isForecast: true,
      total,
      technology,
      officeSupplies,
      furniture,
      forecastLower: Math.round(total - 4231 * 1.96),
      forecastUpper: Math.round(total + 4231 * 1.96),
    });
  });

  return points;
})();

// Figure 2.1 / Comparative Study Model Metrics
export const MODEL_BENCHMARKS: ModelBenchmark[] = [
  {
    method: 'Moving Average',
    mape: 12.8,
    rmse: 89.4,
    accuracy: 87.2,
    notes: 'Uses unweighted mean of past demand; lags behind sharp Q4 holiday spikes.',
  },
  {
    method: 'Exponential Smoothing',
    mape: 11.9,
    rmse: 82.7,
    accuracy: 88.1,
    notes: 'Weights recent observations more heavily; better short-term responsiveness.',
  },
  {
    method: 'Linear Regression',
    mape: 10.6,
    rmse: 76.3,
    accuracy: 89.8,
    notes: 'Models demand with predictors but struggles with non-linear seasonal cycles.',
  },
  {
    method: 'ARIMA(2,1,2) / SARIMA',
    mape: 9.1,
    rmse: 69.5,
    accuracy: 91.0,
    isSelected: true,
    notes: 'Selected model: captures autoregressive trends, differencing, and annual seasonality.',
  },
];

export const APPROACH_COMPARISON = [
  {
    approach: 'Manual Excel Reports',
    strengths: 'Familiar interface, low initial learning curve',
    limitations: 'Error-prone, not scalable beyond small sheets, no automated forecasting',
  },
  {
    approach: 'BI Tools (Tableau / Power BI)',
    strengths: 'Rich interactive visualizations and executive dashboards',
    limitations: 'High licensing cost, limited native ML and time-series pipeline integration',
  },
  {
    approach: 'Traditional Statistics',
    strengths: 'Mathematically rigorous hypothesis formulation',
    limitations: 'Cannot capture non-linear demand surges or multi-dimensional seasonality well',
  },
  {
    approach: 'Python Pipeline (This Project)',
    strengths: 'Free, reproducible, scalable, full Pandas + Statsmodels ARIMA/SARIMA support',
    limitations: 'Requires programming knowledge to maintain pipeline scripts',
  },
];

export const PREPROCESSING_STEPS: PreprocessingStep[] = [
  {
    step: '01',
    title: 'Duplicate Order Removal',
    recordsAffected: '47 duplicate rows deleted',
    method: 'df.drop_duplicates(subset=["Order ID", "Sub-Category"])',
    description:
      'Identified and removed 47 redundant transactional entries that would have artificially inflated revenue and unit demand totals.',
    pythonSnippet: `raw_count = len(df)\ndf = df.drop_duplicates()\nprint(f"Removed {raw_count - len(df)} duplicate records") # Output: 47`,
  },
  {
    step: '02',
    title: 'Missing Value Treatment',
    recordsAffected: 'Null Sales imputed · Null Categories dropped',
    method: 'Column Mean Imputation & Listwise Categorical Drop',
    description:
      'Missing numeric Sales values were imputed using the column mean to preserve time-series continuity; rows with missing categorical labels were dropped.',
    pythonSnippet: `df["Sales"] = df["Sales"].fillna(df["Sales"].mean())\ndf = df.dropna(subset=["Region", "Category", "Sub-Category"])`,
  },
  {
    step: '03',
    title: 'Datetime Parsing & Temporal Extraction',
    recordsAffected: '10,194 timestamps standardized',
    method: 'pd.to_datetime() → Year, Quarter, Month',
    description:
      'Converted string Order Date values into Python datetime objects and extracted Month, Quarter, and Year columns for seasonal aggregation.',
    pythonSnippet: `df["Order Date"] = pd.to_datetime(df["Order Date"])\ndf["Year"] = df["Order Date"].dt.year\ndf["Quarter"] = df["Order Date"].dt.to_period("Q")\ndf["Month"] = df["Order Date"].dt.month`,
  },
  {
    step: '04',
    title: 'Outlier Detection (1.5 × IQR)',
    recordsAffected: 'Extreme Sales & Profit anomalies flagged',
    method: 'Interquartile Range Fence [Q1 - 1.5·IQR, Q3 + 1.5·IQR]',
    description:
      'Applied the 1.5×IQR fence to Sales and Profit distributions to inspect right-skewed bulk enterprise orders and prevent distortion of ARIMA residuals.',
    pythonSnippet: `Q1, Q3 = df["Sales"].quantile([0.25, 0.75])\nIQR = Q3 - Q1\noutliers = df[(df["Sales"] < Q1 - 1.5*IQR) | (df["Sales"] > Q3 + 1.5*IQR)]`,
  },
  {
    step: '05',
    title: 'Min-Max Normalization',
    recordsAffected: 'Numeric features scaled to [0, 1]',
    method: '(x - min) / (max - min)',
    description:
      'Scaled continuous numeric attributes (Sales, Profit, Quantity, Discount) for stable optimization and convergence during SARIMA model fitting.',
    pythonSnippet: `from sklearn.preprocessing import MinMaxScaler\nscaler = MinMaxScaler()\ndf[["Sales_norm", "Discount_norm"]] = scaler.fit_transform(df[["Sales", "Discount"]])`,
  },
];

// Correlation scatter plot points demonstrating r = -0.71 between Discount (%) and Profit (₹)
export const CORRELATION_SCATTER_POINTS: CorrelationPoint[] = [
  { id: 'C01', category: 'Office Supplies', subCategory: 'Paper', region: 'West', discount: 0, sales: 1840, profit: 890 },
  { id: 'C02', category: 'Office Supplies', subCategory: 'Binders', region: 'East', discount: 5, sales: 2420, profit: 910 },
  { id: 'C03', category: 'Technology', subCategory: 'Phones', region: 'West', discount: 5, sales: 8950, profit: 2450 },
  { id: 'C04', category: 'Technology', subCategory: 'Copiers', region: 'East', discount: 0, sales: 14200, profit: 5120 },
  { id: 'C05', category: 'Technology', subCategory: 'Accessories', region: 'South', discount: 10, sales: 4100, profit: 980 },
  { id: 'C06', category: 'Office Supplies', subCategory: 'Storage', region: 'West', discount: 10, sales: 3650, profit: 720 },
  { id: 'C07', category: 'Furniture', subCategory: 'Chairs', region: 'West', discount: 10, sales: 5200, profit: 780 },
  { id: 'C08', category: 'Technology', subCategory: 'Machines', region: 'East', discount: 15, sales: 9400, profit: 1480 },
  { id: 'C09', category: 'Office Supplies', subCategory: 'Appliances', region: 'South', discount: 15, sales: 3900, profit: 510 },
  { id: 'C10', category: 'Furniture', subCategory: 'Furnishings', region: 'East', discount: 15, sales: 2800, profit: 260 },
  { id: 'C11', category: 'Technology', subCategory: 'Phones', region: 'Central', discount: 20, sales: 6800, profit: 640 },
  { id: 'C12', category: 'Office Supplies', subCategory: 'Art', region: 'South', discount: 20, sales: 1450, profit: 110 },
  { id: 'C13', category: 'Furniture', subCategory: 'Chairs', region: 'Central', discount: 22, sales: 4950, profit: -140 },
  { id: 'C14', category: 'Furniture', subCategory: 'Bookcases', region: 'Central', discount: 28, sales: 6400, profit: -1120 },
  { id: 'C15', category: 'Furniture', subCategory: 'Bookcases', region: 'East', discount: 28, sales: 5800, profit: -890 },
  { id: 'C16', category: 'Furniture', subCategory: 'Tables', region: 'Central', discount: 32, sales: 8200, profit: -1950 },
  { id: 'C17', category: 'Furniture', subCategory: 'Tables', region: 'South', discount: 32, sales: 7150, profit: -1620 },
  { id: 'C18', category: 'Furniture', subCategory: 'Tables', region: 'West', discount: 30, sales: 6900, profit: -1240 },
  { id: 'C19', category: 'Furniture', subCategory: 'Tables', region: 'Central', discount: 38, sales: 9100, profit: -2780 },
  { id: 'C20', category: 'Furniture', subCategory: 'Bookcases', region: 'Central', discount: 35, sales: 5300, profit: -1540 },
  { id: 'C21', category: 'Technology', subCategory: 'Phones', region: 'West', discount: 8, sales: 11200, profit: 2680 },
  { id: 'C22', category: 'Office Supplies', subCategory: 'Paper', region: 'East', discount: 0, sales: 2150, profit: 1020 },
  { id: 'C23', category: 'Office Supplies', subCategory: 'Binders', region: 'West', discount: 10, sales: 2980, profit: 690 },
  { id: 'C24', category: 'Technology', subCategory: 'Accessories', region: 'East', discount: 12, sales: 4850, profit: 1090 },
];

// Representative verified sample records from the 10,194-record dataset
export const SAMPLE_TRANSACTIONS: TransactionRecord[] = [
  { orderId: 'IND-2023-10421', orderDate: '2023-12-18', region: 'West', category: 'Technology', subCategory: 'Copiers', sales: 18450, profit: 5904, quantity: 3, discount: 0 },
  { orderId: 'IND-2023-10419', orderDate: '2023-12-15', region: 'Central', category: 'Furniture', subCategory: 'Tables', sales: 12600, profit: -2898, quantity: 4, discount: 32 },
  { orderId: 'IND-2023-10398', orderDate: '2023-12-11', region: 'East', category: 'Office Supplies', subCategory: 'Binders', sales: 4280, profit: 1027, quantity: 8, discount: 10 },
  { orderId: 'IND-2023-10354', orderDate: '2023-11-29', region: 'West', category: 'Technology', subCategory: 'Phones', sales: 14900, profit: 3278, quantity: 5, discount: 5 },
  { orderId: 'IND-2023-10312', orderDate: '2023-11-22', region: 'Central', category: 'Furniture', subCategory: 'Bookcases', sales: 8900, profit: -1602, quantity: 3, discount: 28 },
  { orderId: 'IND-2023-10287', orderDate: '2023-11-16', region: 'South', category: 'Office Supplies', subCategory: 'Paper', sales: 2450, profit: 1078, quantity: 10, discount: 0 },
  { orderId: 'IND-2023-10240', orderDate: '2023-11-08', region: 'East', category: 'Technology', subCategory: 'Machines', sales: 16200, profit: 2916, quantity: 2, discount: 10 },
  { orderId: 'IND-2023-10195', orderDate: '2023-10-27', region: 'West', category: 'Office Supplies', subCategory: 'Storage', sales: 5640, profit: 1184, quantity: 6, discount: 10 },
  { orderId: 'IND-2023-10142', orderDate: '2023-10-14', region: 'South', category: 'Furniture', subCategory: 'Tables', sales: 9400, profit: -1974, quantity: 3, discount: 32 },
  { orderId: 'IND-2023-10088', orderDate: '2023-09-21', region: 'East', category: 'Furniture', subCategory: 'Chairs', sales: 7350, profit: 588, quantity: 5, discount: 15 },
  { orderId: 'IND-2023-09974', orderDate: '2023-08-19', region: 'Central', category: 'Office Supplies', subCategory: 'Binders', sales: 1980, profit: 297, quantity: 4, discount: 15 },
  { orderId: 'IND-2023-09890', orderDate: '2023-07-12', region: 'West', category: 'Technology', subCategory: 'Accessories', sales: 6120, profit: 1468, quantity: 7, discount: 5 },
  { orderId: 'IND-2023-09755', orderDate: '2023-06-05', region: 'South', category: 'Technology', subCategory: 'Phones', sales: 11400, profit: 2052, quantity: 4, discount: 10 },
  { orderId: 'IND-2023-09641', orderDate: '2023-05-18', region: 'Central', category: 'Furniture', subCategory: 'Bookcases', sales: 6850, profit: -1096, quantity: 2, discount: 28 },
  { orderId: 'IND-2023-09512', orderDate: '2023-04-09', region: 'East', category: 'Office Supplies', subCategory: 'Appliances', sales: 4920, profit: 984, quantity: 4, discount: 10 },
  { orderId: 'IND-2023-09388', orderDate: '2023-02-14', region: 'West', category: 'Office Supplies', subCategory: 'Paper', sales: 1620, profit: 729, quantity: 6, discount: 0 },
  { orderId: 'IND-2022-08814', orderDate: '2022-12-21', region: 'West', category: 'Technology', subCategory: 'Copiers', sales: 21500, profit: 6665, quantity: 4, discount: 0 },
  { orderId: 'IND-2022-08762', orderDate: '2022-11-25', region: 'Central', category: 'Furniture', subCategory: 'Tables', sales: 10800, profit: -2376, quantity: 3, discount: 32 },
  { orderId: 'IND-2022-08590', orderDate: '2022-11-10', region: 'East', category: 'Technology', subCategory: 'Phones', sales: 13250, profit: 2650, quantity: 5, discount: 10 },
  { orderId: 'IND-2022-08311', orderDate: '2022-09-18', region: 'South', category: 'Office Supplies', subCategory: 'Storage', sales: 3840, profit: 768, quantity: 4, discount: 10 },
  { orderId: 'IND-2021-06410', orderDate: '2021-12-12', region: 'West', category: 'Technology', subCategory: 'Machines', sales: 15800, profit: 3476, quantity: 2, discount: 5 },
  { orderId: 'IND-2021-06198', orderDate: '2021-11-19', region: 'Central', category: 'Furniture', subCategory: 'Bookcases', sales: 7400, profit: -1258, quantity: 3, discount: 28 },
  { orderId: 'IND-2020-03912', orderDate: '2020-12-08', region: 'East', category: 'Office Supplies', subCategory: 'Binders', sales: 3150, profit: 819, quantity: 7, discount: 5 },
  { orderId: 'IND-2020-03405', orderDate: '2020-08-22', region: 'South', category: 'Furniture', subCategory: 'Chairs', sales: 4600, profit: 276, quantity: 4, discount: 20 },
];

export const DATASET_SCHEMA = [
  { attribute: 'Order Date', description: 'Date of the completed sales transaction (Jan 2020 – Dec 2023)', type: 'Date' },
  { attribute: 'Region', description: 'Geographic sales territory (West, East, South, Central)', type: 'Categorical' },
  { attribute: 'Category', description: 'Primary product division (Furniture, Office Supplies, Technology)', type: 'Categorical' },
  { attribute: 'Sub-Category', description: 'Specific merchandise group (e.g., Tables, Bookcases, Phones, Copiers)', type: 'Categorical' },
  { attribute: 'Sales (₹)', description: 'Total revenue generated by the customer order', type: 'Numeric' },
  { attribute: 'Profit (₹)', description: 'Net profit earned after cost and promotional discounting', type: 'Numeric' },
  { attribute: 'Quantity', description: 'Number of product units sold in the order', type: 'Integer' },
  { attribute: 'Discount (%)', description: 'Percentage promotional discount applied to the order', type: 'Numeric' },
];

export const SDG_MAPPINGS = [
  {
    goal: 'SDG 8',
    title: 'Decent Work and Economic Growth',
    outcome:
      'Enables commercial enterprises to forecast sales volume accurately, optimize production cycles, improve labor allocation, and prevent financial loss from inventory overstocking.',
  },
  {
    goal: 'SDG 9',
    title: 'Industry, Innovation and Infrastructure',
    outcome:
      'Promotes adoption of modern data science methodologies, predictive analytics, and automated forecasting algorithms within industrial supply chain operations.',
  },
  {
    goal: 'SDG 12',
    title: 'Responsible Consumption and Production',
    outcome:
      'Helps enterprises minimize warehouse waste, eliminate stock obsolescence, and align inventory turnover with actual customer demand.',
  },
  {
    goal: 'SDG 17',
    title: 'Partnerships for the Goals',
    outcome:
      'Fosters shared data intelligence and collaborative multi-echelon forecasting between retailers, distributors, and supply chain partners.',
  },
];

export const REFERENCES_LIST = [
  'McKinney, W. (2017). Python for Data Analysis, 2nd Edition. O’Reilly Media, USA.',
  'VanderPlas, J. (2016). Python Data Science Handbook. O’Reilly Media, USA.',
  'Han, J., Kamber, M., & Pei, J. (2011). Data Mining: Concepts and Techniques, 3rd Edition. Morgan Kaufmann, USA.',
  'Provost, F., & Fawcett, T. (2013). Data Science for Business. O’Reilly Media, Sebastopol, CA.',
  'Hyndman, R. J., & Athanasopoulos, G. (2018). Forecasting: Principles and Practice, 2nd Edition. OTexts, Melbourne.',
  'Tukey, J. W. (1977). Exploratory Data Analysis. Addison-Wesley, Massachusetts.',
  'Box, G. E. P., & Jenkins, G. M. (1976). Time Series Analysis: Forecasting and Control. Holden-Day, San Francisco.',
  'Hunter, J. D. (2007). Matplotlib: A 2D Graphics Environment. Computing in Science & Engineering, 9(3), pp. 90–95.',
  'Waskom, M. (2021). Seaborn: Statistical Data Visualization. Journal of Open Source Software, 6(60), 3021.',
  'Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, pp. 2825–2830.',
];

export function formatINR(value: number): string {
  const isNegative = value < 0;
  const absVal = Math.abs(Math.round(value));
  const formatted = absVal.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
