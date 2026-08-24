/* ---------------------------------------------------------
   Shared aggregation helpers for the Reports page.

   These all derive values from data already returned by
   existing APIs (GET /dashboard/stats, GET /history,
   GET /inventory, GET /admin/analytics) -- nothing here
   invents numbers. Used to build the grouped/stacked/
   horizontal-bar chart inputs that the raw endpoints don't
   pre-aggregate for, without adding new backend endpoints.
---------------------------------------------------------- */

/* Stronger/darker tones for chart lines, bars, and data points --
   same palette families as PALETTE in constants/palette.js (teal,
   golden, magenta), just pulled to their more saturated "button"-
   level shade so plotted data reads clearly against the light
   card backgrounds, instead of the softer pastel "accent" shade
   used for icons/badges elsewhere in the app. */
const RECYCLABILITY_LEVELS = ['High', 'Medium', 'Low'];
export function normalizeRecyclability(value) {
  const v = String(value || '').toLowerCase().trim();

  if (v === 'mechanical') return 'High';
  if (v === 'limited') return 'Medium';
  if (v === 'high') return 'High';
  if (v === 'medium') return 'Medium';
  if (v === 'low') return 'Low';

  return null;
}

const RECYCLABILITY_COLORS = {
  High: '#3F858B',
  Medium: '#C4A020',
  Low: '#8066B5',
};

// Group prediction history rows by calendar day -> [{ label, value }]
// sorted chronologically. `label` is a short display date (e.g. "Aug 12").
export function countByDay(history) {
  if (!history || history.length === 0) return [];

  const buckets = new Map();

  history.forEach((row) => {
    if (!row.created_at) return;
    const date = new Date(row.created_at);
    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!buckets.has(key)) {
      buckets.set(key, { key, label, value: 0 });
    }
    buckets.get(key).value += 1;
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, value }) => ({ label, value }));
}

// Percentage of rows per day whose recyclability === "High" -> [{ label, value }]
export function highRecyclabilityRateByDay(history) {
  if (!history || history.length === 0) return [];

  const buckets = new Map();

  history.forEach((row) => {
    if (!row.created_at) return;
    const date = new Date(row.created_at);
    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!buckets.has(key)) {
      buckets.set(key, { key, label, total: 0, high: 0 });
    }
    const bucket = buckets.get(key);
    bucket.total += 1;
    if (normalizeRecyclability(row.recyclability) === 'High') {
  bucket.high += 1;
}
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, total, high }) => ({
      label,
      value: total > 0 ? Math.round((high / total) * 100) : 0,
    }));
}

// Build a { key, count } distribution for any field on history rows,
// e.g. distributionOf(history, 'material') -> [{ key: 'Cotton', count: 12 }, ...]
export function distributionOf(history, field) {
  if (!history || history.length === 0) return [];
  const counts = new Map();
  history.forEach((row) => {
    const value = row[field];
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

// Cross-tab of two categorical fields, shaped for GroupedBarChart /
// StackedBarChart: { categories, series }.
//   groupField -> becomes the x-axis categories (top `maxCategories` by volume)
//   seriesField -> becomes the stacked/grouped series
// If `seriesLevels` is provided (e.g. ['High','Medium','Low']), series are
// restricted to and ordered by that fixed set; otherwise every distinct
// (optionally normalized) value of seriesField found in the data is used.
// `normalizeSeriesValue`, when provided, is applied to raw seriesField
// values before matching against levels (e.g. normalizeRecyclability for
// a recyclability seriesField). It defaults to the raw value, so fields
// like `waste_category` are matched as-is instead of being incorrectly
// run through a recyclability-specific normalizer.
export function crosstab(history, groupField, seriesField, options = {}) {
  const { maxCategories = 6, seriesLevels, seriesColors, normalizeSeriesValue } = options;

  if (!history || history.length === 0) {
    return { categories: [], series: [] };
  }

  const normalizeValue = normalizeSeriesValue || ((v) => v);

  const groupTotals = new Map();
  history.forEach((row) => {
    const g = row[groupField];
    if (!g) return;
    groupTotals.set(g, (groupTotals.get(g) || 0) + 1);
  });

  const categories = Array.from(groupTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCategories)
    .map(([g]) => g);

  const levels =
    seriesLevels ||
    Array.from(
      new Set(
        history
          .map((row) => normalizeValue(row[seriesField]))
          .filter(Boolean)
      )
    );

  // Explicit { category -> { level -> count } } lookup so every value is
  // matched to its category and level BY NAME, not by array position --
  // this guarantees `categories` and every `series[i].values` stay aligned
  // regardless of how the two lists were derived or ordered.
  const countsByCategory = new Map();
  categories.forEach((category) => {
    countsByCategory.set(category, new Map(levels.map((level) => [level, 0])));
  });

  history.forEach((row) => {
    const category = row[groupField];
    if (!category || !countsByCategory.has(category)) return;

    const level = normalizeValue(row[seriesField]);
    if (!level) return;

    const levelCounts = countsByCategory.get(category);
    if (!levelCounts.has(level)) return;

    levelCounts.set(level, levelCounts.get(level) + 1);
  });

  const series = levels.map((level, idx) => ({
    key: level,
    label: level,
    color: (seriesColors && seriesColors[level]) || DEFAULT_SERIES_COLORS[idx % DEFAULT_SERIES_COLORS.length],
    values: categories.map((category) => countsByCategory.get(category).get(level) || 0),
  }));

  return { categories, series };
}

const DEFAULT_SERIES_COLORS = ['#3F858B', '#C4A020', '#C65A91', '#8066B5', '#2F6367', '#B79A25'];

export { RECYCLABILITY_LEVELS, RECYCLABILITY_COLORS };

// Two-series comparison per material: how many items were processed in
// total vs how many of those came back "High" recyclability -> shaped
// for GroupedBarChart. Derived entirely from real history rows (material +
// recyclability fields already returned by GET /history).
export function materialRecoveryComparison(history, maxCategories = 6) {
  if (!history || history.length === 0) return { categories: [], series: [] };

  const totals = new Map();
  const highs = new Map();

  history.forEach((row) => {
    const material = row.material;
    if (!material) return;
    totals.set(material, (totals.get(material) || 0) + 1);
    if (normalizeRecyclability(row.recyclability) === 'High') {
  highs.set(material, (highs.get(material) || 0) + 1);
}
  });

  const categories = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCategories)
    .map(([material]) => material);

  const series = [
    {
      key: 'total',
      label: 'Total Processed',
      color: '#3F858B',
      values: categories.map((c) => totals.get(c) || 0),
    },
    {
      key: 'high',
      label: 'High Recyclability',
      color: '#C4A020',
      values: categories.map((c) => highs.get(c) || 0),
    },
  ];

  return { categories, series };
}

// Sum a numeric field on history rows' nested environmental_impact object,
// grouped by `groupField` (e.g. material) -> [{ key, value }] sorted desc.
export function sumEnvFieldByGroup(history, groupField, envField, maxCategories = 6) {
  if (!history || history.length === 0) return [];

  const totals = new Map();
  history.forEach((row) => {
    const g = row[groupField];
    const impact = row.environmental_impact;
    if (!g || !impact || impact[envField] === undefined || impact[envField] === null) return;
    totals.set(g, (totals.get(g) || 0) + Number(impact[envField]));
  });

  return Array.from(totals.entries())
    .map(([key, value]) => ({ key, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxCategories);
}