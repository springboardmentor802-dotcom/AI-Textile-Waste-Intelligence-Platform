import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Recycle,
  BrainCircuit,
} from 'lucide-react';

import {
  getInventoryList,
  getPredictionHistory,
  getPredictionDashboardStats,
} from '../services/api';

import Topbar from '../components/Topbar';
import BackToDashboard from '../components/BackToDashboard';
import TrendChart from '../components/TrendChart';

import './Dashboard.css';
import './ProcessingInsights.css';

/* ---------------------------------------------------------
   Same accent system used across the app's dashboards.
---------------------------------------------------------- */

const PALETTE = {
  teal: {
    soft: '#E8F2F0',
    border: '#B9D6D0',
    icon: '#4A8C93',
    accent: '#63B0A5',
    text: '#1F4B4E',
    button: '#3E7A80',
  },

  magenta: {
    soft: '#F4E8EF',
    border: '#DDB8CA',
    icon: '#C874A2',
    accent: '#E287B8',
    text: '#7A2E52',
    button: '#B85F8F',
  },

  golden: {
    soft: '#FAF4D9',
    border: '#E7D67C',
    icon: '#B79A25',
    accent: '#EED45D',
    text: '#6B551A',
    button: '#B79A25',
  },

  lavender: {
    soft: '#EEEAF5',
    border: '#CFC4E3',
    icon: '#8D7EB4',
    accent: '#A696CD',
    text: '#4A3B6B',
    button: '#75649D',
  },
};

const paletteVars = (colorKey) => {
  const p = PALETTE[colorKey] || PALETTE.golden;

  return {
    '--p-soft': p.soft,
    '--p-border': p.border,
    '--p-icon': p.icon,
    '--p-accent': p.accent,
    '--p-text': p.text,
    '--p-button': p.button,
  };
};

/* ---------------------------------------------------------
   Waste Category Breakdown shades
---------------------------------------------------------- */

const WASTE_CATEGORY_SHADES = [
  '#B79A25',
  '#C7A94A',
  '#D6B96E',
  '#E4C892',
  '#F0D9B6',
];

/* ---------------------------------------------------------
   Small formatting / aggregation helpers
---------------------------------------------------------- */

function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/* ---------------------------------------------------------
   DAY-WISE TREND HELPERS

   Converts a date into:
   YYYY-MM-DD

   Example:
   2026-08-17
---------------------------------------------------------- */

function dayKey(dateInput) {
  if (!dateInput) return null;

  const d = new Date(dateInput);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------------------------------------------------------
   Display date

   Example:
   2026-08-17 → 17 Aug
---------------------------------------------------------- */

function dayLabel(key) {
  const [year, month, day] = key.split('-').map(Number);

  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

/* ---------------------------------------------------------
   Build daily trend

   Records with the same date are combined.

   Example:
   17 Aug → 10 kg
   17 Aug → 20 kg

   becomes:

   17 Aug → 30 kg
---------------------------------------------------------- */

function buildDailyTrend(records, dateField, valueFn) {
  const buckets = new Map();

  records.forEach((record) => {
    const key = dayKey(record[dateField]);

    if (!key) return;

    buckets.set(
      key,
      (buckets.get(key) || 0) + valueFn(record)
    );
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([key, value]) => ({
      label: dayLabel(key),
      value: Math.round(value * 10) / 10,
    }));
}

/* ---------------------------------------------------------
   Groups real records by a field into:
   { name, count, percent }
---------------------------------------------------------- */

function buildBreakdown(records, field, fallbackLabel) {
  const counts = new Map();

  records.forEach((record) => {
    const key = record[field] || fallbackLabel;

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  });

  const total = records.length;

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percent: total
        ? Math.round((count / total) * 100)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function ProcessingInsights() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const [inventoryError, setInventoryError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [statsError, setStatsError] = useState('');

  /* ---------------------------------------------------------
     LOAD DATA
  ---------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      try {
        const items = await getInventoryList();

        if (!cancelled) {
          setInventory(items);
        }
      } catch (err) {
        if (!cancelled) {
          setInventoryError(err.message);
        }
      }
    }

    async function loadHistory() {
      try {
        const records = await getPredictionHistory();

        if (!cancelled) {
          setHistory(records);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err.message);
        }
      }
    }

    async function loadStats() {
      try {
        const data = await getPredictionDashboardStats();

        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError(err.message);
        }
      }
    }

    loadInventory();
    loadHistory();
    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------
     TOTAL INVENTORY
  ---------------------------------------------------------- */

  const totalInventory = inventory.length;

  /* ---------------------------------------------------------
     TOTAL WASTE PROCESSED
  ---------------------------------------------------------- */

  const wasteProcessed = useMemo(
    () =>
      inventory.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0),
        0
      ),
    [inventory]
  );

  /* ---------------------------------------------------------
     TOTAL CLASSIFICATIONS
  ---------------------------------------------------------- */

  const totalClassifications =
    stats?.total_predictions ?? history.length;

  /* ---------------------------------------------------------
     RECOVERY SCORE
  ---------------------------------------------------------- */

  const recoveryScore = useMemo(() => {
    const value = stats?.average_circularity_score;

    return value !== undefined && value !== null
      ? Number(value)
      : null;
  }, [stats]);

  /* ---------------------------------------------------------
     MATERIAL BREAKDOWN
  ---------------------------------------------------------- */

  const materialBreakdown = useMemo(
    () =>
      buildBreakdown(
        inventory,
        'fabric_type',
        'Unspecified'
      ),
    [inventory]
  );

  /* ---------------------------------------------------------
     RECYCLABILITY BREAKDOWN
  ---------------------------------------------------------- */

  const recyclabilityBreakdown = useMemo(
    () =>
      buildBreakdown(
        history,
        'recyclability',
        'Unclassified'
      ),
    [history]
  );

  /* ---------------------------------------------------------
     WASTE CATEGORY BREAKDOWN
  ---------------------------------------------------------- */

  const wasteCategoryBreakdown = useMemo(
    () =>
      buildBreakdown(
        history,
        'waste_category',
        'Uncategorized'
      ),
    [history]
  );

  /* ---------------------------------------------------------
     HIGH RECYCLABILITY COUNT
  ---------------------------------------------------------- */

  const highRecyclabilityCount = useMemo(() => {
    const entry = recyclabilityBreakdown.find(
      (e) =>
        String(e.name).toLowerCase() === 'high'
    );

    return entry ? entry.count : 0;
  }, [recyclabilityBreakdown]);

  /* ---------------------------------------------------------
     AVERAGE CONFIDENCE
  ---------------------------------------------------------- */

  const averageConfidence = useMemo(() => {
    const valid = history
      .map((item) => Number(item.confidence))
      .filter((value) => Number.isFinite(value));

    if (!valid.length) {
      return null;
    }

    return (
      valid.reduce(
        (sum, value) => sum + value,
        0
      ) / valid.length
    );
  }, [history]);

  /* ---------------------------------------------------------
     DAY-WISE WASTE TREND

     collection_date is used here.

     Example:
     17 Aug 2026 → 30 kg
  ---------------------------------------------------------- */

  const wasteTrend = useMemo(
    () =>
      buildDailyTrend(
        inventory,
        'collection_date',
        (item) =>
          Number(item.quantity) || 0
      ),
    [inventory]
  );

  /* ---------------------------------------------------------
     DAY-WISE AI CLASSIFICATION TREND

     created_at is used here.
  ---------------------------------------------------------- */

  const classificationTrend = useMemo(
    () =>
      buildDailyTrend(
        history,
        'created_at',
        () => 1
      ),
    [history]
  );

  /* ---------------------------------------------------------
     PROCESSING FLOW
  ---------------------------------------------------------- */

  const flowSteps = [
    {
      key: 'logged',
      label: 'Waste Logged',
      icon: Package,
      caption: pluralize(
        totalInventory,
        'batch'
      ),
    },

    {
      key: 'classified',
      label: 'AI Classified',
      icon: BrainCircuit,
      caption: pluralize(
        totalClassifications,
        'prediction'
      ),
    },

    {
      key: 'recoverable',
      label: 'High Recyclability',
      icon: Recycle,
      caption: pluralize(
        highRecyclabilityCount,
        'item'
      ),
    },
  ];

  return (
    <div className="dash-shell">
      <Topbar title="Processing Insights" />

      <main className="dash-page">
        <BackToDashboard />

        {/* ---------------------------------------------------
            ERRORS
        ---------------------------------------------------- */}

        {(inventoryError ||
          historyError ||
          statsError) && (
          <div className="dash-errors">
            {inventoryError && (
              <span>{inventoryError}</span>
            )}

            {historyError && (
              <span>{historyError}</span>
            )}

            {statsError && (
              <span>{statsError}</span>
            )}
          </div>
        )}

        {/* ===================================================
            PROCESSING ACTIVITY
        ==================================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Processing Activity</h2>

              <p>
                Waste volume and AI classification
                activity by day
              </p>
            </div>

            <span className="pi-section-stat">
              Waste processed:{' '}
              {wasteProcessed.toFixed(1)} kg
            </span>
          </div>

          <div className="pi-card-grid">

            {/* ------------------------------------------------
                WASTE VOLUME TREND
            ------------------------------------------------- */}

            <div
              className="pi-card"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  Waste Volume Trend
                </h3>
              </div>

              {wasteTrend.length > 0 ? (
                <TrendChart
                  data={wasteTrend}
                  color={
                    PALETTE.golden.button
                  }
                  unit=" kg"
                  xAxisTitle="Quantity logged by day"
                />
              ) : (
                <p className="pi-empty-note">
                  Not enough dated batches yet
                  to chart a trend.
                </p>
              )}
            </div>

            {/* ------------------------------------------------
                AI CLASSIFICATION TREND
            ------------------------------------------------- */}

            <div
              className="pi-card"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  AI Classification Trend
                </h3>
              </div>

              {classificationTrend.length > 0 ? (
                <TrendChart
                  data={classificationTrend}
                  color={
                    PALETTE.teal.button
                  }
                  unit=""
                  xAxisTitle="Classifications run by day"
                />
              ) : (
                <p className="pi-empty-note">
                  Not enough classification
                  history yet to chart a trend.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            MATERIAL & RECOVERY COMPOSITION
        ==================================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Material &amp; Recovery Composition
              </h2>

              <p>
                What&apos;s coming in, and how
                recoverable the AI classifies it as
              </p>
            </div>
          </div>

          <div className="pi-card-grid">

            {/* ------------------------------------------------
                MATERIAL BREAKDOWN
            ------------------------------------------------- */}

            <div
              className="pi-card"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  Material Breakdown
                </h3>
              </div>

              {materialBreakdown.length > 0 ? (
                <>
                  <div className="pi-breakdown-list">
                    {materialBreakdown.map(
                      (entry, index) => (
                        <div
                          className="pi-breakdown-row"
                          key={entry.name}
                        >
                          <div className="pi-breakdown-top">
                            <span className="pi-breakdown-name">
                              {entry.name}
                            </span>

                            <span className="pi-breakdown-figure">
                              {entry.count} ·{' '}
                              {entry.percent}%
                            </span>
                          </div>

                          <div className="pi-breakdown-track">
                            <div
                              className="pi-breakdown-fill"
                              style={{
                                width: `${entry.percent}%`,
                                background:
                                  WASTE_CATEGORY_SHADES[
                                    index %
                                      WASTE_CATEGORY_SHADES.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <p className="pi-data-note">
                    Based on all inventory batches
                    on record.
                  </p>
                </>
              ) : (
                <p className="pi-empty-note">
                  No inventory batches logged yet.
                </p>
              )}
            </div>

            {/* ------------------------------------------------
                RECYCLABILITY BREAKDOWN
            ------------------------------------------------- */}

            <div
              className="pi-card"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  Recyclability Breakdown
                </h3>

                {averageConfidence !== null && (
                  <span className="pi-card-stat">
                    Avg. confidence{' '}
                    {averageConfidence.toFixed(1)}%
                  </span>
                )}
              </div>

              {recyclabilityBreakdown.length > 0 ? (
                <>
                  <div className="pi-breakdown-list">
                    {recyclabilityBreakdown.map(
                      (entry, index) => (
                        <div
                          className="pi-breakdown-row"
                          key={entry.name}
                        >
                          <div className="pi-breakdown-top">
                            <span className="pi-breakdown-name">
                              {entry.name}
                            </span>

                            <span className="pi-breakdown-figure">
                              {entry.count} ·{' '}
                              {entry.percent}%
                            </span>
                          </div>

                          <div className="pi-breakdown-track">
                            <div
                              className="pi-breakdown-fill"
                              style={{
                                width: `${entry.percent}%`,
                                background:
                                  WASTE_CATEGORY_SHADES[
                                    index %
                                      WASTE_CATEGORY_SHADES.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <p className="pi-data-note">
                    Based on AI classification history.
                  </p>
                </>
              ) : (
                <p className="pi-empty-note">
                  No AI classifications yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            WASTE CATEGORIES & FLOW
        ==================================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Waste Categories &amp; Flow
              </h2>

              <p>
                How material categories break down,
                and where they stand in the recovery
                process
              </p>
            </div>

            <span className="pi-section-stat">
              Recovery score:{' '}
              {recoveryScore !== null
                ? `${recoveryScore}/100`
                : '—'}
            </span>
          </div>

          <div className="pi-card-grid">

            {/* ------------------------------------------------
                WASTE CATEGORY BREAKDOWN
            ------------------------------------------------- */}

            <div
              className="pi-card"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  Waste Category Breakdown
                </h3>
              </div>

              {wasteCategoryBreakdown.length > 0 ? (
                <>
                  <div className="pi-breakdown-list">
                    {wasteCategoryBreakdown.map(
                      (entry, index) => (
                        <div
                          className="pi-breakdown-row"
                          key={entry.name}
                        >
                          <div className="pi-breakdown-top">
                            <span className="pi-breakdown-name">
                              {entry.name}
                            </span>

                            <span className="pi-breakdown-figure">
                              {entry.count} ·{' '}
                              {entry.percent}%
                            </span>
                          </div>

                          <div className="pi-breakdown-track">
                            <div
                              className="pi-breakdown-fill"
                              style={{
                                width: `${entry.percent}%`,
                                background:
                                  WASTE_CATEGORY_SHADES[
                                    index %
                                      WASTE_CATEGORY_SHADES.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <p className="pi-data-note">
                    Based on AI classification history.
                  </p>
                </>
              ) : (
                <p className="pi-empty-note">
                  No AI classifications yet.
                </p>
              )}
            </div>

            {/* ------------------------------------------------
                PROCESSING FLOW
            ------------------------------------------------- */}

            <div
              className="pi-flow"
              style={paletteVars('golden')}
            >
              <div className="pi-card-head">
                <h3>
                  Processing Flow
                </h3>
              </div>

              <div className="pi-flow-steps">
                {flowSteps.map(
                  (step, index) => (
                    <div
                      className="pi-flow-step-wrapper"
                      key={step.key}
                    >
                      <div className="pi-flow-step">
                        <span className="pi-flow-icon">
                          <step.icon size={16} />
                        </span>

                        <span className="pi-flow-step-copy">
                          {step.label}

                          <small>
                            {step.caption}
                          </small>
                        </span>
                      </div>

                      {index <
                        flowSteps.length - 1 && (
                        <span
                          className="pi-flow-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProcessingInsights;