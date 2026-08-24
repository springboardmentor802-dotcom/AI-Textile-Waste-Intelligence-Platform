import { useEffect, useState } from 'react';
import { Users as UsersIcon, BrainCircuit, Gauge } from 'lucide-react';
import Topbar from '../components/Topbar';
import BackToDashboard from '../components/BackToDashboard';
import TrendChart from '../components/TrendChart';
import { getPlatformAnalytics } from '../services/api';
import '../pages/Dashboard.css';
import './PlatformAnalytics.css';

/* ---------------------------------------------------------
   Single coherent visual identity for this page: pink/magenta.
   Same hue family as PALETTE.magenta in constants/palette.js,
   just shifted to stronger/bolder shades so the page reads as
   "professional + bold", not the pale pastel every other page
   uses. Kept local to this file (not added to the shared
   palette.js) since it's a page-specific intensity variant, not
   a new semantic color used elsewhere.
---------------------------------------------------------- */
const STRONG_PINK = {
  soft: '#F4E8EF',
  border: '#DDB8CA',
  icon: '#C874A2',
  accent: '#E287B8',
  text: '#7A2E52',
  button: '#B85F8F',
};

const pinkVars = () => ({
  '--p-soft': STRONG_PINK.soft,
  '--p-border': STRONG_PINK.border,
  '--p-icon': STRONG_PINK.icon,
  '--p-accent': STRONG_PINK.accent,
  '--p-text': STRONG_PINK.text,
  '--p-button': STRONG_PINK.button,
});

/* ---------------------------------------------------------
   Small breakdown card: label + proportional bar + count per
   row. Mirrors the DistributionCard already used inside
   Dashboard.jsx's "Today at a Glance" -> "Platform Analytics"
   preview section -- kept as a local copy here (not imported
   from Dashboard.jsx) so this new page carries zero risk of
   touching the already-tested Dashboard.jsx internals. Reuses
   the exact same .mfr-graph-card / .admin-breakdown-* classes
   from Dashboard.css, so no new visual language is introduced --
   only the pink CSS variables above are new.

   Expand/collapse: when `maxItems` is passed and the real item
   count exceeds it, only the first `maxItems` entries render
   until the user clicks "+ N more" -- N is always
   `items.length - maxItems` (computed from the live API
   response, never hardcoded). Clicking again ("Show less")
   collapses back to the truncated view. Cards that don't pass
   `maxItems` (Users by Role, Fabric Distribution,
   Recyclability Distribution) already render every item and
   are left alone -- only Waste Category Distribution currently
   uses `maxItems`, so it's the only one this affects today.
---------------------------------------------------------- */
function DistributionCard({ title, items, labelKey, formatLabel, emptyText, maxItems }) {
  const [expanded, setExpanded] = useState(false);

  const maxCount = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 0;
  const isTruncatable = Boolean(maxItems) && items.length > maxItems;
  const visibleItems = isTruncatable && !expanded ? items.slice(0, maxItems) : items;
  const remainingCount = isTruncatable ? items.length - maxItems : 0;

  return (
    <div className="mfr-graph-card pa-graph-card" style={pinkVars()}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="admin-analytics-empty">{emptyText}</p>
      ) : (
        <>
          <div className="admin-breakdown-list">
            {visibleItems.map((item) => {
              const rawLabel = item[labelKey];
              const label = formatLabel ? formatLabel(rawLabel) : rawLabel;
              const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <div className="admin-breakdown-row" key={rawLabel}>
                  <span className="admin-breakdown-label" title={label}>{label}</span>
                  <div className="admin-breakdown-track">
                    <div className="admin-breakdown-fill" style={{ width: `${widthPercent}%` }} />
                  </div>
                  <span className="admin-breakdown-count">{item.count}</span>
                </div>
              );
            })}
          </div>
          {isTruncatable && (
            <button
              type="button"
              className="admin-breakdown-toggle"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Show less' : `+ ${remainingCount} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function formatRoleLabel(role) {
  return String(role || '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function PlatformAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await getPlatformAnalytics();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash-shell">
      <Topbar title="Platform Analytics" />

      <main className="dash-page">
        <BackToDashboard />

        <section className="dashboard-section platform-analytics-page">
          <div className="section-heading">
            <div>
              <p>
                Detailed platform-wide breakdown of users, inventory, and AI prediction
                activity, calculated directly from the current database.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-analytics-state">Loading platform analytics…</div>
          ) : error ? (
            <div className="dash-errors">
              <span>{error}</span>
              <button type="button" className="users-retry-btn" onClick={load} style={{ marginTop: 8 }}>
                Try Again
              </button>
            </div>
          ) : data ? (
            <>
              {/* Headline KPIs -- only the three key metrics; Total
                  Inventory is intentionally not repeated here (it's
                  already represented in detail by Fabric Distribution
                  below), keeping this a summary row rather than a repeat
                  of "Today at a Glance" on the Dashboard. */}
              <div className="kpi-grid pa-kpi-grid">
                <article className="kpi-card" style={pinkVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><UsersIcon size={22} /></span>
                    <span className="kpi-label">Total Users</span>
                  </div>
                  <strong>{data.total_users}</strong>
                  <small>Registered accounts across all roles</small>
                </article>

                <article className="kpi-card" style={pinkVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><BrainCircuit size={22} /></span>
                    <span className="kpi-label">AI Predictions</span>
                  </div>
                  <strong>{data.total_predictions}</strong>
                  <small>Classifications across all users</small>
                </article>

                <article className="kpi-card" style={pinkVars()}>
                  <div className="kpi-top">
                    <span className="kpi-icon"><Gauge size={22} /></span>
                    <span className="kpi-label">Avg. Circularity Score</span>
                  </div>
                  <strong>
                    {data.average_circularity_score !== null ? data.average_circularity_score : '—'}
                    {data.average_circularity_score !== null && <em>/100</em>}
                  </strong>
                  <small>Platform-wide average</small>
                </article>
              </div>

              {/* Breakdowns: Users by Role | Fabric Distribution
                             Waste Categories | Recyclability
                             Prediction Activity (full width) */}
              <div className="mfr-graph-grid" style={{ marginTop: 14 }}>
                <DistributionCard
                  title="Users by Role"
                  items={data.users_by_role}
                  labelKey="role"
                  formatLabel={formatRoleLabel}
                  emptyText="No users yet."
                />
                <DistributionCard
                  title="Fabric Distribution"
                  items={data.fabric_distribution}
                  labelKey="fabric_type"
                  emptyText="No inventory items yet."
                />
                <DistributionCard
                  title="Waste Category Distribution"
                  items={data.waste_category_distribution}
                  labelKey="waste_category"
                  emptyText="No AI predictions yet."
                  maxItems={5}
                />
                <DistributionCard
                  title="Recyclability Distribution"
                  items={data.recyclability_distribution}
                  labelKey="recyclability"
                  emptyText="No AI predictions yet."
                />

                <div className="mfr-graph-card pa-graph-card mfr-graph-card-wide" style={pinkVars()}>
                  <h3>Prediction Activity — Platform-wide</h3>
                  {data.prediction_trend.length > 0 ? (
                    <TrendChart
                      data={data.prediction_trend.map((point) => ({
                        label: point.day,
                        value: point.count,
                      }))}
                      color={STRONG_PINK.accent}
                      lineColor="#7A2E52"
                      unit=" predictions"
                      xAxisTitle="Date"
                    />
                  ) : (
                    <p className="admin-analytics-empty">No predictions yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default PlatformAnalytics;